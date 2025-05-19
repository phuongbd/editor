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

export const setupMentionPlugin = (editor: TinyMCEEditor) => {
  // Flag to track if we're currently showing a popover
  let isShowingPopover = false;
  let popoverContainer: HTMLDivElement | null = null;
  let isMouseOverPopover = false; // Track if mouse is over popover
  let activatorEl: HTMLDivElement | null = null; // Element to position the Polaris Popover
  
  // Create a debounced function to check for {{ trigger
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
      
      // Also remove the activator element
      if (activatorEl && activatorEl.parentNode) {
        activatorEl.parentNode.removeChild(activatorEl);
        activatorEl = null;
      }
      
      // Remove the mouseover event when popover is closed
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
    
    // Don't close if click is inside popover
    if (popoverContainer.contains(e.target as Node)) {
      return;
    }
    
    // Close the popover if click outside
    removePopover();
  };

  const insertLiquidVariable = (variable: string) => {
    removePopover();
    
    // Get current position
    const selection = editor.selection;
    const range = selection.getRng();
    
    // First, remove the "{{" trigger that caused the popover to appear
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = range.startContainer as Text;
      const cursorPos = range.startOffset;
      const text = textNode.textContent || '';
      
      // Find the position of the "{{" trigger
      let triggerPos = -1;
      
      // Check if the cursor is right after "{{"
      if (cursorPos >= 2 && text.substring(cursorPos - 2, cursorPos) === '{{') {
        triggerPos = cursorPos - 2;
      } else {
        // Look for the last "{{" before cursor (if user has already typed part of a variable name)
        const beforeCursor = text.substring(0, cursorPos);
        const lastOpen = beforeCursor.lastIndexOf('{{');
        if (lastOpen !== -1) {
          triggerPos = lastOpen;
        }
      }
      
      // If we found a trigger, remove it
      if (triggerPos !== -1) {
        // Select the "{{" characters
        range.setStart(textNode, triggerPos);
        range.setEnd(textNode, triggerPos + 2);
        selection.setRng(range);
        
        // Delete the selected "{{" characters
        editor.execCommand('Delete');
      }
    }
    
    // Use a bookmarking approach - this is the most reliable way 
    // to maintain cursor position in TinyMCE
    
    // Create a bookmark before insertion
    const bookmark = editor.selection.getBookmark(2, true);
    
    // Insert the variable directly
    editor.execCommand('mceInsertContent', false, variable);
    
    // Move the cursor to the end of the inserted content
    editor.selection.moveToBookmark(bookmark);
    
    // Make sure we're at the end of the variable
    const currentRange = editor.selection.getRng();
    const containerNode = currentRange.startContainer;
    
    // Insert a bookmark at the end of the variable
    // This ensures we can find this position even after decoration
    const endBookmarkId = 'end-' + Date.now();
    const bookmarkSpan = editor.getDoc().createElement('span');
    bookmarkSpan.id = endBookmarkId;
    bookmarkSpan.setAttribute('data-mce-type', 'bookmark');
    bookmarkSpan.style.display = 'none';
    
    // Insert the bookmark span
    currentRange.insertNode(bookmarkSpan);
    
    // Insert a zero-width space character after the variable
    // This will force proper node separation when typing
    const zwsNode = editor.getDoc().createTextNode('\u200B');
    bookmarkSpan.parentNode?.insertBefore(zwsNode, bookmarkSpan.nextSibling);
    
    // Move the cursor after our inserted content
    const newRange = editor.dom.createRng();
    newRange.setStartAfter(bookmarkSpan);
    newRange.setEndAfter(bookmarkSpan);
    editor.selection.setRng(newRange);
    
    // Remove the bookmark after a short delay
    // This ensures the cursor positioning has taken effect
    setTimeout(() => {
      const bookmarkEl = editor.dom.get(endBookmarkId);
      if (bookmarkEl) {
        editor.dom.remove(bookmarkEl);
      }
      editor.focus();
    }, 10);
    
    // After insertion, run the decoration process with a delay
    // This ensures our bookmark-based positioning has time to take effect
    if (typeof (editor.plugins as any).liquid?.decorateLiquidSyntax === 'function') {
      setTimeout(() => {
        // Run the decoration
        (editor.plugins as any).liquid.decorateLiquidSyntax();
        
        // Find our bookmark again (in case it was moved during decoration)
        setTimeout(() => {
          const bookmarkEl = editor.dom.get(endBookmarkId);
          if (bookmarkEl) {
            // Position cursor right after our bookmark
            const bookmarkRange = editor.dom.createRng();
            bookmarkRange.setStartAfter(bookmarkEl);
            bookmarkRange.setEndAfter(bookmarkEl);
            editor.selection.setRng(bookmarkRange);
            
            // Remove the bookmark
            editor.dom.remove(bookmarkEl);
          }
          
          editor.focus();
          editor.nodeChanged();
        }, 50);
      }, 100);
    }
  };

  const checkForMentionTrigger = () => {
    // Don't check if popover is already showing
    if (isShowingPopover) return;

    const selection = editor.selection;
    const range = selection.getRng();
    const position = selection.getNode();
    
    // Get text before cursor for current text node
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent || '';
    const cursorPosition = range.startOffset;
    
    // Check if we have "{{" at current position or somewhere in the last few characters
    if (cursorPosition >= 2) {
      // First check if we have exactly "{{" at cursor position
      const lastTwoChars = text.substring(cursorPosition - 2, cursorPosition);
      if (lastTwoChars === '{{') {
        showMentionPopover(textNode as Text, cursorPosition);
        return;
      }
      
      // If not at exactly cursor, check if there's a "{{" within a few chars before cursor
      // and no closing "}}" after it - this handles if user already typed some variable name
      const checkLastFewChars = text.substring(Math.max(0, cursorPosition - 10), cursorPosition);
      const openBraceMatch = checkLastFewChars.lastIndexOf('{{');
      
      if (openBraceMatch !== -1 && !checkLastFewChars.includes('}}', openBraceMatch)) {
        // Found {{ without closing }} - show popover
        const triggerPosition = cursorPosition - checkLastFewChars.length + openBraceMatch + 2;
        showMentionPopover(textNode as Text, triggerPosition);
      }
    }
  };

  const showMentionPopover = (textNode: Text, cursorPosition: number) => {
    if (isShowingPopover) return;
    
    const editorRect = editor.getContentAreaContainer().getBoundingClientRect();
    const editorContainer = editor.getContainer();
    const editorFrame = editor.iframeElement;
    
    if (!editorFrame) return;
    
    // Get the range and position info
    const range = document.createRange();
    range.setStart(textNode, cursorPosition);
    range.setEnd(textNode, cursorPosition);
    
    const rects = range.getClientRects();
    if (rects.length === 0) return;

    const rangeRect = rects[0];
    
    // Adjust for iframe offset
    const iframeRect = editorFrame.getBoundingClientRect();
    
    // Create activator element for Polaris Popover positioning
    activatorEl = document.createElement('div');
    activatorEl.style.position = 'absolute';
    activatorEl.style.left = `${iframeRect.left + rangeRect.left}px`;
    activatorEl.style.top = `${iframeRect.top + rangeRect.bottom}px`;
    activatorEl.style.width = '1px';
    activatorEl.style.height = '1px';
    activatorEl.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
    
    document.body.appendChild(activatorEl);
    
    // Create container for popover (Polaris Popover will be rendered inside this)
    popoverContainer = document.createElement('div');
    popoverContainer.style.position = 'absolute';
    popoverContainer.style.zIndex = '9999'; // Higher z-index than editor
    popoverContainer.style.left = '0';
    popoverContainer.style.top = '0';
    popoverContainer.style.width = '100%';
    popoverContainer.style.height = '0';
    popoverContainer.style.overflow = 'visible';
    // Prevent the click event from reaching document
    popoverContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    document.body.appendChild(popoverContainer);
    
    // Create React root and render the popover component
    renderMentionPopover(
      popoverContainer,
      activatorEl,
      LIQUID_VARIABLES,
      insertLiquidVariable,
      removePopover
    );
    
    isShowingPopover = true;
    
    // Store the current active element to prevent blur issues
    const activeEl = document.activeElement;
    
    // Add event listener to handle clicks outside the popover
    const handleClickOutside = (e: MouseEvent) => {
      // Skip if the click is inside the editor iframe or the popover
      const editorContentEl = editor.getDoc().body;
      const isEditorFrameClick = editorFrame.contains(e.target as Node);
      const isPopoverClick = popoverContainer && popoverContainer.contains(e.target as Node);
      
      // Don't close if clicking inside popover or editor
      if (isPopoverClick || isEditorFrameClick) {
        return;
      }
      
      removePopover();
      document.removeEventListener('click', handleClickOutside);
    };
    
    // Use a much longer timeout to add the click handler
    // This prevents the same event that triggered the popover from closing it
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 500);
  };

  // Setup event handlers
  editor.on('keyup', debouncedMentionCheck);
  
  // Remove popover when editor loses focus, but not when clicking on popover
  editor.on('blur', (e) => {
    // Don't close if the active element is the popover 
    // or one of its children (the user is interacting with it)
    if (popoverContainer) {
      // Need a delay to see where focus went
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement && popoverContainer && 
            (popoverContainer === activeElement || 
             popoverContainer.contains(activeElement))) {
          return; // Don't close if focus is in popover
        }
        
        // Also check if we're clicking inside the popover (for browsers where activeElement isn't set yet)
        const selection = window.getSelection();
        if (selection && selection.anchorNode && 
            popoverContainer && popoverContainer.contains(selection.anchorNode)) {
          return;
        }
        
        removePopover();
      }, 50);
    } else {
      removePopover();
    }
  });
  
  // Handle editor iframe scroll
  editor.on('scroll', () => {
    if (isShowingPopover) {
      removePopover();
    }
  });

  return {
    removePopover
  };
};

export default setupMentionPlugin; 