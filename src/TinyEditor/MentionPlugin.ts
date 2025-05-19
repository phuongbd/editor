import { Editor as TinyMCEEditor } from 'tinymce';
import { renderMentionPopover } from './MentionPopoverRenderer';

// Sample liquid variables (Replace with your actual list of variables)
const LIQUID_VARIABLES = [
  '{{ customer.name }}',
  '{{ customer.first_name }}',
  '{{ customer.last_name }}',
  '{{ customer.email }}',
  '{{ customer.address }}',
  '{{ customer.phone }}',
  '{{ customer.orders.size }}',
  '{{ customer.account_balance }}',
  '{{ shop.name }}',
  '{{ shop.email }}',
  '{{ shop.domain }}',
  '{{ product.title }}',
  '{{ product.price }}',
  '{{ product.description }}',
  '{{ page.title }}',
  '{{ cart.total_price }}',
];

// Use WeakMap to track editor instances
const editorInstances = new WeakMap<TinyMCEEditor, { removePopover: () => void }>();

/**
 * Alternative approach using TinyMCE's built-in autocompleter API
 * This is a more reliable way to handle variable insertion with TinyMCE
 */
export const setupMentionAutocompleter = (editor: TinyMCEEditor) => {
  // Only register the autocompleter once per editor instance
  if ((editor as any).getParam && (editor as any).getParam('liquid_autocompleter_registered')) {
    return;
  }
  
  // Mark the autocompleter as registered
  if ((editor as any).settings) {
    (editor as any).settings.liquid_autocompleter_registered = true;
  }
  
  // Register a custom autocompleter for Liquid variables
  if (editor.ui && editor.ui.registry && typeof editor.ui.registry.addAutocompleter === 'function') {
    editor.ui.registry.addAutocompleter('liquidvariables', {
      trigger: '{{',
      minChars: 0,
      columns: 1,
      fetch: (pattern: string, maxResults: number) => {
        // Filter variables based on search pattern
        const filteredItems = LIQUID_VARIABLES
          .filter(variable => variable.toLowerCase().includes(pattern.toLowerCase()))
          .slice(0, maxResults)
          .map(variable => ({
            type: 'cardmenuitem' as const,
            value: variable,
            label: variable,
            items: [{
              type: 'cardtext' as const,
              text: variable,
              name: 'variable'
            }]
          }));
        
        return Promise.resolve(filteredItems);
      },
      onAction: (autocompleteApi, rng, value) => {
        // Insert the selected variable
        editor.selection.setRng(rng);
        editor.insertContent(value);
        autocompleteApi.hide();
        
        // Position cursor after the inserted variant
        const newRange = editor.selection.getRng();
        const startContainer = newRange.startContainer;
        
        if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
          const textContent = startContainer.textContent || '';
          const cursorPos = newRange.startOffset;
          const variantEndPos = textContent.indexOf('}}', cursorPos);
          
          if (variantEndPos !== -1) {
            // Create a new range and position it after the closing braces
            const cursorRange = editor.dom.createRng();
            cursorRange.setStart(startContainer, variantEndPos + 2);
            cursorRange.setEnd(startContainer, variantEndPos + 2);
            editor.selection.setRng(cursorRange);
          }
        }
        
        // Update liquid syntax highlighting if available
        setTimeout(() => {
          if (typeof (editor.plugins as any).liquid?.decorateLiquidSyntax === 'function') {
            (editor.plugins as any).liquid.decorateLiquidSyntax(true);
          }
        }, 150);
      }
    });
  }
  
  return {
    // Return empty methods to maintain API compatibility
    removePopover: () => {},
    cleanup: () => {}
  };
};

export const setupMentionPlugin = (editor: TinyMCEEditor) => {
  // Try using the TinyMCE 5.x autocompleter API if available
  // This is more reliable than the custom implementation
  if (editor.ui && editor.ui.registry && typeof editor.ui.registry.addAutocompleter === 'function') {
    return setupMentionAutocompleter(editor);
  }
  
  // Check if this editor already has the plugin setup
  if (editorInstances.has(editor)) {
    return editorInstances.get(editor);
  }

  // Flag to track if we're currently showing a popover
  let isShowingPopover = false;
  let popoverContainer: HTMLDivElement | null = null;
  let activatorEl: HTMLDivElement | null = null; // Element to position the Polaris Popover
  let cursorInfo: {
    node: Node;
    offset: number;
    bracePos: number;
  } | null = null;
  
  // Let's use a debounce function to check for triggers
  let mentionCheckTimeout: number | null = null;
  const debouncedMentionCheck = () => {
    if (mentionCheckTimeout) {
      clearTimeout(mentionCheckTimeout);
    }
    mentionCheckTimeout = window.setTimeout(() => {
      checkForMentionTrigger();
      mentionCheckTimeout = null;
    }, 100);
  };

  const removePopover = () => {
    if (popoverContainer) {
      if (popoverContainer.parentNode) {
        popoverContainer.parentNode.removeChild(popoverContainer);
      }
      popoverContainer = null;
      isShowingPopover = false;
      
      if (activatorEl && activatorEl.parentNode) {
        activatorEl.parentNode.removeChild(activatorEl);
        activatorEl = null;
      }
      
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    }
  };

  // Handle Escape key to close popover
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isShowingPopover) {
      removePopover();
    }
  };

  // Handle clicks outside the popover
  const handleClickOutside = (e: MouseEvent) => {
    if (!popoverContainer) return;
    
    if (popoverContainer.contains(e.target as Node)) {
      return;
    }
    
    removePopover();
  };

  const insertLiquidVariable = (variable: string) => {
    try {
      // Save the original selection/range position
      const originalSelection = editor.selection;
      const originalRange = originalSelection.getRng();
      
      // Remember cursor info before closing popover
      const currentCursorInfo = cursorInfo;
      
      // Close popover 
      removePopover();
      
      // If we have valid cursor info and the open braces position
      if (currentCursorInfo && currentCursorInfo.bracePos >= 0) {
        // Focus the editor before making changes
        editor.focus();
        
        // Create a range that includes the '{{' characters (to be replaced)
        const range = editor.dom.createRng();
        range.setStart(currentCursorInfo.node, currentCursorInfo.bracePos);
        range.setEnd(currentCursorInfo.node, currentCursorInfo.offset);
        
        // Set the selection to this range
        editor.selection.setRng(range);
        
        // Insert the variable, replacing the selected '{{' characters
        editor.execCommand('mceInsertContent', false, variable);
        
        // Position cursor immediately after the inserted variant
        const newRange = editor.selection.getRng();
        const variantInsertionNode = newRange.startContainer;
        let newPosition = newRange.startOffset;
        
        // If the variant was split across multiple nodes or inserted as a new node,
        // we need to find where it ends
        if (variantInsertionNode.nodeType === Node.TEXT_NODE) {
          const textContent = variantInsertionNode.textContent || '';
          const variantEndPos = textContent.indexOf('}}', newRange.startOffset);
          
          if (variantEndPos !== -1) {
            // Position cursor after the closing braces
            newPosition = variantEndPos + 2;
          }
        }
        
        // Set cursor position after the variant
        const cursorRange = editor.dom.createRng();
        cursorRange.setStart(variantInsertionNode, newPosition);
        cursorRange.setEnd(variantInsertionNode, newPosition);
        editor.selection.setRng(cursorRange);
      } else {
        // Fallback: Restore the original selection and insert at current position
        editor.selection.setRng(originalRange);
        editor.execCommand('mceInsertContent', false, variable);
        
        // Position cursor after inserted content
        const newPos = editor.selection.getRng().startOffset;
        const node = editor.selection.getRng().startContainer;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent || '';
          const variantEndPos = textContent.indexOf('}}', newPos);
          
          if (variantEndPos !== -1) {
            const cursorRange = editor.dom.createRng();
            cursorRange.setStart(node, variantEndPos + 2);
            cursorRange.setEnd(node, variantEndPos + 2);
            editor.selection.setRng(cursorRange);
          }
        }
      }
      
      // Notify TinyMCE that content has changed
      editor.nodeChanged();
      
      // Update liquid syntax highlighting if available
      setTimeout(() => {
        if (typeof (editor.plugins as any).liquid?.decorateLiquidSyntax === 'function') {
          (editor.plugins as any).liquid.decorateLiquidSyntax(true);
        }
      }, 150);
    } catch (error) {
      console.error('Error inserting variable:', error);
    } finally {
      cursorInfo = null;
    }
  };

  const checkForMentionTrigger = () => {
    if (isShowingPopover) return;

    const selection = editor.selection;
    const range = selection.getRng();
    
    if (!range || !range.startContainer) return;
    
    // Store a bookmark to help us track selection position through DOM changes
    const bookmark = editor.selection.getBookmark(2, true);
    
    try {
      const container = range.startContainer;
      // Handle both text nodes and element nodes for more reliable triggering
      const isTextNode = container.nodeType === Node.TEXT_NODE;
      const text = isTextNode ? container.textContent || '' : '';
      const cursorPos = range.startOffset;
      
      // Store current cursor info
      cursorInfo = {
        node: container,
        offset: cursorPos,
        bracePos: -1
      };
      
      // Check if the cursor is directly after '{{' 
      if (isTextNode && cursorPos >= 2) {
        const lastChar = text.charAt(cursorPos - 1);
        const prevChar = text.charAt(cursorPos - 2);
        
        if (lastChar === '{' && prevChar === '{') {
          cursorInfo.bracePos = cursorPos - 2;
          showCustomPopover(container as Text, cursorPos);
          return;
        }
      }
      
      // More extensive search in the current paragraph/element
      // First try in the immediate text node
      if (isTextNode && cursorPos > 0) {
        const searchText = text.substring(Math.max(0, cursorPos - 15), cursorPos);
        const openBracePos = searchText.lastIndexOf('{{');
        
        if (openBracePos !== -1 && !searchText.includes('}}', openBracePos)) {
          const absoluteBracePos = cursorPos - searchText.length + openBracePos;
          cursorInfo.bracePos = absoluteBracePos;
          showCustomPopover(container as Text, absoluteBracePos + 2);
          return;
        }
      }
      
      // If not found in the immediate text node, try searching in parent elements
      // This helps when cursor is positioned between elements or in an empty element
      if (!isTextNode || cursorPos === 0) {
        // Get the current paragraph or nearest block-level element
        const currentBlock = editor.dom.getParent(container, 'p,div,li,td,h1,h2,h3,h4,h5,h6', editor.getBody()) as HTMLElement;
        
        if (currentBlock) {
          // Get all text nodes in the current block
          const textWalker = document.createTreeWalker(currentBlock, NodeFilter.SHOW_TEXT);
          let textNode: Node | null = null;
          let foundBraces = false;
          
          // Walk through text nodes looking for '{{' without matching '}}'
          while ((textNode = textWalker.nextNode()) && !foundBraces) {
            const nodeText = textNode.textContent || '';
            const openBracePos = nodeText.lastIndexOf('{{');
            
            if (openBracePos !== -1 && !nodeText.includes('}}', openBracePos)) {
              cursorInfo = {
                node: textNode,
                offset: openBracePos + 2, // Position after '{{'
                bracePos: openBracePos
              };
              
              showCustomPopover(textNode as Text, openBracePos + 2);
              foundBraces = true;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in checkForMentionTrigger:', error);
    } finally {
      // Restore the selection position
      editor.selection.moveToBookmark(bookmark);
    }
  };

  const showCustomPopover = (textNode: Text, cursorPosition: number) => {
    if (isShowingPopover) return;
    
    try {
      const editorFrame = editor.iframeElement;
      
      if (!editorFrame) {
        console.error('Editor iframe not found');
        return;
      }
      
      // Get iframe's document context
      const editorDoc = editor.getDoc();
      const editorWin = editor.getWin();
      
      // Create a range at the position where the popover should appear
      const range = editorDoc.createRange();
      range.setStart(textNode, cursorPosition);
      range.setEnd(textNode, cursorPosition);
      
      // Store the selection position for later restoration
      const bookmark = editor.selection.getBookmark();
      
      // Update selection range in the editor
      const editorSelection = editorWin.getSelection();
      if (editorSelection) {
        editorSelection.removeAllRanges();
        editorSelection.addRange(range);
      }
      
      // Get relative position inside iframe
      const rangeRects = range.getClientRects();
      if (!rangeRects || rangeRects.length === 0) {
        console.error('Range has no client rects');
        // Try to restore selection
        editor.selection.moveToBookmark(bookmark);
        return;
      }
      
      // Calculate absolute position relative to the viewport
      const rangeRect = rangeRects[0];
      const iframeRect = editorFrame.getBoundingClientRect();
      
      // Account for iframe scroll position
      const scrollX = editorWin.scrollX || editorWin.pageXOffset;
      const scrollY = editorWin.scrollY || editorWin.pageYOffset;
      
      const popoverTop = iframeRect.top + rangeRect.bottom + scrollY;
      const popoverLeft = iframeRect.left + rangeRect.left + scrollX;
      
      // Create activator element for popover positioning
      activatorEl = document.createElement('div');
      activatorEl.className = 'mention-activator';
      activatorEl.style.position = 'absolute';
      activatorEl.style.top = `${popoverTop}px`;
      activatorEl.style.left = `${popoverLeft}px`;
      activatorEl.style.width = '4px';
      activatorEl.style.height = '4px';
      activatorEl.style.pointerEvents = 'none';
      activatorEl.style.zIndex = '9900';
      
      document.body.appendChild(activatorEl);
      
      // Create container for the React popover
      popoverContainer = document.createElement('div');
      popoverContainer.className = 'mention-popover-container';
      popoverContainer.style.position = 'absolute';
      popoverContainer.style.zIndex = '9999';
      popoverContainer.style.left = '0';
      popoverContainer.style.top = '0';
      popoverContainer.style.width = '100%';
      popoverContainer.style.height = '0';
      popoverContainer.style.overflow = 'visible';
      
      // Prevent click events from bubbling up to document
      popoverContainer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      
      document.body.appendChild(popoverContainer);
      
      // Render React popover component
      renderMentionPopover(
        popoverContainer,
        activatorEl,
        LIQUID_VARIABLES,
        insertLiquidVariable,
        removePopover
      );
      
      // Set flag to indicate popover is showing
      isShowingPopover = true;
      
      // Add event listeners for closing popover
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      // Restore original selection to maintain proper cursor position
      editor.selection.moveToBookmark(bookmark);
      // Focus the editor again after showing the popover
      editor.focus();
    } catch (error) {
      console.error('Error showing popover:', error);
      removePopover();
    }
  };

  // Setup event handlers
  const handleKeyUp = (e: any) => debouncedMentionCheck();
  editor.on('keyup', handleKeyUp);
  
  const handleBlur = (e: any) => {
    if (!isShowingPopover) return;
    
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement && popoverContainer && 
          (popoverContainer === activeElement || 
           popoverContainer.contains(activeElement))) {
        return;
      }
      
      removePopover();
    }, 50);
  };
  editor.on('blur', handleBlur);
  
  const handleScroll = () => {
    if (isShowingPopover) {
      removePopover();
    }
  };
  editor.on('scroll', handleScroll);

  // Create cleanup function
  const cleanup = () => {
    editor.off('keyup', handleKeyUp);
    editor.off('blur', handleBlur);
    editor.off('scroll', handleScroll);
    removePopover();
  };

  // Store editor instance
  const instance = { removePopover, cleanup };
  editorInstances.set(editor, instance);

  return instance;
};

export default setupMentionPlugin; 