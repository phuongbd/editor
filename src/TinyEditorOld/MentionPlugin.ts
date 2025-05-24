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
        
        // Debug log for cursor position before insertion
        console.log('Before insertion - Range:', {
          startContainer: rng.startContainer,
          startOffset: rng.startOffset,
          endContainer: rng.endContainer,
          endOffset: rng.endOffset
        });
        
        try {
          // Insert the variable with a space and a marker for better cursor positioning
          editor.insertContent(value + ' <span id="temp-cursor-fix"></span>');
          autocompleteApi.hide();
          
          // Immediately create a bookmark to track our position 
          const bookmark = editor.selection.getBookmark();
          
          // Find our marker
          const marker = editor.dom.get('temp-cursor-fix');
          if (marker) {
            // Place cursor right after the marker
            const markerRange = editor.dom.createRng();
            markerRange.setStartBefore(marker);
            markerRange.setEndBefore(marker);
            editor.selection.setRng(markerRange);
            
            // Remove the marker
            editor.dom.remove(marker);
          }
          
          // Force visibility of the cursor
          editor.focus();
          
          // Debug log for final cursor position
          const finalRange = editor.selection.getRng();
          console.log('Final cursor position with direct DOM approach:', {
            startContainer: finalRange.startContainer,
            startOffset: finalRange.startOffset,
            endContainer: finalRange.endContainer,
            endOffset: finalRange.endOffset
          });
        } catch (error) {
          console.error('Error setting cursor position:', error);
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
  
  // Add debug listener for mouse clicks to track cursor position
  const handleMouseUp = () => {
    try {
      setTimeout(() => {
        // Use setTimeout to ensure selection is updated after click
        const selection = editor.selection;
        const range = selection.getRng();
        
        if (range && range.startContainer) {
          const node = range.startContainer;
          const textContent = node.nodeType === Node.TEXT_NODE ? node.textContent : null;
          
          console.log('DEBUG - Cursor position after click:', {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
            nodeType: node.nodeType,
            nodeName: node.nodeName,
            parentNodeName: node.parentNode ? node.parentNode.nodeName : null,
            textContent: textContent,
            isElement: node.nodeType === Node.ELEMENT_NODE,
            isText: node.nodeType === Node.TEXT_NODE,
            elementInfo: node.nodeType === Node.ELEMENT_NODE ? {
              tagName: (node as Element).tagName,
              className: (node as Element).className,
              id: (node as Element).id
            } : null,
            previousSibling: node.previousSibling ? {
              nodeName: node.previousSibling.nodeName,
              nodeType: node.previousSibling.nodeType,
              textContent: node.previousSibling.nodeType === Node.TEXT_NODE ? node.previousSibling.textContent : null
            } : null,
            nextSibling: node.nextSibling ? {
              nodeName: node.nextSibling.nodeName,
              nodeType: node.nextSibling.nodeType,
              textContent: node.nextSibling.nodeType === Node.TEXT_NODE ? node.nextSibling.textContent : null
            } : null,
            surroundingText: node.nodeType === Node.TEXT_NODE && textContent ? {
              before: range.startOffset > 10 ? textContent.substring(range.startOffset - 10, range.startOffset) : textContent.substring(0, range.startOffset),
              after: textContent.substring(range.startOffset, range.startOffset + 10)
            } : null
          });
          
          // Additional check: Look for Liquid variables around the cursor
          if (node.nodeType === Node.TEXT_NODE && textContent) {
            const nearbyVariableStart = textContent.substring(0, range.startOffset).lastIndexOf('{{');
            const nearbyVariableEnd = textContent.indexOf('}}', range.startOffset);
            
            if (nearbyVariableStart !== -1 && nearbyVariableEnd !== -1) {
              console.log('DEBUG - Nearby Liquid variable:', {
                variable: textContent.substring(nearbyVariableStart, nearbyVariableEnd + 2),
                distanceToStart: range.startOffset - nearbyVariableStart,
                distanceToEnd: nearbyVariableEnd + 2 - range.startOffset,
                isCursorInside: nearbyVariableStart < range.startOffset && range.startOffset < nearbyVariableEnd + 2
              });
            }
          }
        }
      }, 0);
    } catch (error) {
      console.error('Error in click debug logging:', error);
    }
  };
  
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
      
      // Debug log for cursor position before insertion
      console.log('Before insertion - Original Range:', {
        startContainer: originalRange.startContainer,
        startOffset: originalRange.startOffset,
        endContainer: originalRange.endContainer,
        endOffset: originalRange.endOffset,
        textContent: originalRange.startContainer.nodeType === Node.TEXT_NODE 
          ? originalRange.startContainer.textContent 
          : null
      });
      
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
        
        // Debug log for replacement range
        console.log('Replacement Range:', {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
          textContent: range.startContainer.nodeType === Node.TEXT_NODE 
            ? range.startContainer.textContent 
            : null,
          replacing: range.startContainer.nodeType === Node.TEXT_NODE 
            ? (range.startContainer.textContent || '').substring(range.startOffset, range.endOffset) 
            : null
        });
        
        // Insert the variable, replacing the selected '{{' characters AND adding a space and marker after it
        editor.execCommand('mceInsertContent', false, variable + ' <span id="temp-cursor-fix"></span>');
        
        // Log detailed DOM state right after insertion
        console.log('DEBUG - DOM state after variable insertion:', {
          markerExists: !!editor.dom.get('temp-cursor-fix'),
          editorHtml: editor.getContent(),
          activeElement: document.activeElement,
          editorFocused: editor.hasFocus(),
          currentSelection: {
            range: editor.selection.getRng(),
            startContainer: editor.selection.getRng().startContainer,
            startOffset: editor.selection.getRng().startOffset,
            collapsed: editor.selection.isCollapsed()
          }
        });
        
        // Find our marker
        const marker = editor.dom.get('temp-cursor-fix');
        if (marker) {
          // Log marker details
          console.log('DEBUG - Marker details:', {
            markerNode: marker,
            parentNode: marker.parentNode,
            previousSibling: marker.previousSibling ? {
              nodeName: marker.previousSibling.nodeName,
              nodeType: marker.previousSibling.nodeType,
              textContent: marker.previousSibling.nodeType === Node.TEXT_NODE ? marker.previousSibling.textContent : null
            } : null,
            nextSibling: marker.nextSibling ? {
              nodeName: marker.nextSibling.nodeName,
              nodeType: marker.nextSibling.nodeType,
              textContent: marker.nextSibling.nodeType === Node.TEXT_NODE ? marker.nextSibling.textContent : null
            } : null
          });
          
          // Place cursor right BEFORE the marker (which will be after the space)
          const markerRange = editor.dom.createRng();
          markerRange.setStartBefore(marker);
          markerRange.setEndBefore(marker);
          editor.selection.setRng(markerRange);
          
          // Remove the marker
          editor.dom.remove(marker);
          
          // Log cursor position after marker positioning
          console.log('DEBUG - Cursor position after marker positioning:', {
            startContainer: editor.selection.getRng().startContainer,
            startOffset: editor.selection.getRng().startOffset,
            endContainer: editor.selection.getRng().endContainer,
            endOffset: editor.selection.getRng().endOffset,
            collapsed: editor.selection.isCollapsed()
          });
        } else {
          console.warn('DEBUG - Marker not found after insertion');
        }
        
        // Force focus to ensure cursor is visible
        editor.focus();
        
        // Log cursor position after forcing focus
        console.log('DEBUG - Cursor position after force focus:', {
          startContainer: editor.selection.getRng().startContainer,
          startOffset: editor.selection.getRng().startOffset,
          editorHtml: editor.getContent(),
          activeElement: document.activeElement,
          editorFocused: editor.hasFocus()
        });
        
        // Debug log for final position
        const finalPosition = editor.selection.getRng();
        console.log('Final position after direct DOM positioning:', {
          startContainer: finalPosition.startContainer,
          startOffset: finalPosition.startOffset,
          endContainer: finalPosition.endContainer,
          endOffset: finalPosition.endOffset
        });
      } else {
        // Fallback: Restore the original selection and insert at current position
        editor.selection.setRng(originalRange);
        
        console.log('Using fallback insertion at current cursor position');
        
        // Insert the variable at the current cursor position with a space and marker right after it
        editor.execCommand('mceInsertContent', false, variable + ' <span id="temp-cursor-fix"></span>');
        
        // Find our marker
        const marker = editor.dom.get('temp-cursor-fix');
        if (marker) {
          // Place cursor right before the marker (after the space)
          const markerRange = editor.dom.createRng();
          markerRange.setStartBefore(marker);
          markerRange.setEndBefore(marker);
          editor.selection.setRng(markerRange);
          
          // Remove the marker
          editor.dom.remove(marker);
        }
        
        // Force focus to ensure cursor is visible
        editor.focus();
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
      if (!editorFrame) return;
      
      const editorDocument = editor.getDoc();
      const editorWin = editor.getWin();
      
      if (!editorDocument || !editorWin) return;
      
      // Create a range to position our popover
      const range = editorDocument.createRange();
      range.setStart(textNode, cursorPosition);
      range.collapse(true);
      
      // Get the position relative to the viewport
      const rangeRect = range.getBoundingClientRect();
      
      // Get the iframe's position relative to the window
      const iframeRect = editorFrame.getBoundingClientRect();
      
      // Calculate absolute position (iframe position + position within iframe)
      const absoluteLeft = iframeRect.left + rangeRect.left + editorWin.scrollX;
      const absoluteTop = iframeRect.top + rangeRect.top + editorWin.scrollY;
      
      // Create a container for our popover
      popoverContainer = document.createElement('div');
      popoverContainer.style.position = 'absolute';
      popoverContainer.style.zIndex = '1000';
      // We'll position this through Polaris portal popover
      
      // Create an activator element for Polaris Popover
      activatorEl = document.createElement('div');
      activatorEl.style.position = 'absolute';
      activatorEl.style.top = `${absoluteTop}px`;
      activatorEl.style.left = `${absoluteLeft}px`;
      activatorEl.style.width = '1px';
      activatorEl.style.height = '1px';
      document.body.appendChild(activatorEl);
      
      // Append the popover container to the body
      document.body.appendChild(popoverContainer);
      
      // Set up event listeners
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      // Render the Popover component
      renderMentionPopover(
        popoverContainer,
        activatorEl,
        LIQUID_VARIABLES,
        insertLiquidVariable,
        removePopover
      );
      
      isShowingPopover = true;
    } catch (error) {
      console.error('Error showing popover:', error);
      // Clean up if there was an error
      if (popoverContainer && popoverContainer.parentNode) {
        popoverContainer.parentNode.removeChild(popoverContainer);
        popoverContainer = null;
      }
      
      if (activatorEl && activatorEl.parentNode) {
        activatorEl.parentNode.removeChild(activatorEl);
        activatorEl = null;
      }
    }
  };

  // Set up event handlers for editor events
  const handleKeyUp = (e: any) => {
    try {
      // Log detailed cursor position after key events
      const selection = editor.selection;
      const range = selection.getRng();
      
      if (range && range.startContainer) {
        const node = range.startContainer;
        const textContent = node.nodeType === Node.TEXT_NODE ? node.textContent : null;
        
        console.log('DEBUG - Cursor position after key event:', {
          key: e.key,
          keyCode: e.keyCode,
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
          nodeType: node.nodeType,
          nodeName: node.nodeName,
          parentNodeName: node.parentNode ? node.parentNode.nodeName : null,
          textContent: textContent,
          isElement: node.nodeType === Node.ELEMENT_NODE,
          isText: node.nodeType === Node.TEXT_NODE,
          surroundingText: node.nodeType === Node.TEXT_NODE && textContent ? {
            before: range.startOffset > 10 ? textContent.substring(range.startOffset - 10, range.startOffset) : textContent.substring(0, range.startOffset),
            after: textContent.substring(range.startOffset, range.startOffset + 10)
          } : null
        });
      }
    } catch (error) {
      console.error('Error in keyup debug logging:', error);
    }
    
    // Run the original debounced check
    debouncedMentionCheck();
  };
  
  // Handle blur events (don't close popover immediately, let click handler do it)
  const handleBlur = (e: any) => {
    // Delay to allow click events to process first
    setTimeout(() => {
      if (isShowingPopover && popoverContainer) {
        // Only remove if the click wasn't inside the popover
        // This is handled by the click handler
      }
    }, 100);
  };
  
  // Handle scroll events to reposition popover
  const handleScroll = () => {
    if (isShowingPopover) {
      // For simplicity, just remove the popover on scroll
      removePopover();
    }
  };
  
  // Clean up event handlers when plugin is removed
  const cleanup = () => {
    removePopover();
    editor.off('keyup', handleKeyUp);
    editor.off('blur', handleBlur);
    editor.off('scroll', handleScroll);
    editor.off('mouseup', handleMouseUp);
  };
  
  // Add event handlers to editor instance
  editor.on('keyup', handleKeyUp);
  editor.on('blur', handleBlur);
  editor.on('scroll', handleScroll);
  editor.on('mouseup', handleMouseUp); // Add the debug listener
  
  // Store the instance handlers in the WeakMap
  const instance = {
    removePopover,
    cleanup
  };
  
  editorInstances.set(editor, instance);
  
  return instance;
};

// Export a standalone function to insert a liquid variable directly
// This can be useful for external triggers like toolbar buttons
export const insertLiquidVariableInEditor = (editor: TinyMCEEditor, variable: string): void => {
  // Focus the editor
  editor.focus();
  
  // Insert the variable at the current cursor position with a space and marker after it
  editor.execCommand('mceInsertContent', false, variable + ' <span id="temp-cursor-fix"></span>');
  
  // Find our marker
  const marker = editor.dom.get('temp-cursor-fix');
  if (marker) {
    // Place cursor right before the marker (after the space)
    const markerRange = editor.dom.createRng();
    markerRange.setStartBefore(marker);
    markerRange.setEndBefore(marker);
    editor.selection.setRng(markerRange);
    
    // Remove the marker
    editor.dom.remove(marker);
  }
  
  // Force focus to ensure cursor is visible
  editor.focus();
  
  // Ensure editor knows content has changed
  editor.nodeChanged();
  
  // Update liquid syntax highlighting if available
  setTimeout(() => {
    if (typeof (editor.plugins as any).liquid?.decorateLiquidSyntax === 'function') {
      (editor.plugins as any).liquid.decorateLiquidSyntax(true);
    }
  }, 150);
};

export default setupMentionPlugin; 