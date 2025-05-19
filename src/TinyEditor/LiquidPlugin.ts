import { Editor as TinyMCEEditor } from 'tinymce';

// Regex patterns for Liquid syntax
const liquidVariableRegex = /(\{\{\s*[^{}]+?\s*\}\})/g;
const liquidTagRegex = /(\{%\s*[^{}]+?\s*%\})/g;

export const setupLiquidPlugin = (editor: TinyMCEEditor) => {
  // Track if we're currently in a decoration cycle to prevent recursion
  let isDecorating = false;
  
  // Add CSS for Liquid syntax highlighting
  editor.on('init', () => {
    const css = `
      .liquid-variable {
        background-color: #e6f7ff;
        border-radius: 3px;
        padding: 2px 0;
        cursor: pointer;
      }
      .liquid-tag {
        display: none;
      }
    `;
    
    // Insert CSS into editor
    const styleElement = editor.dom.create('style', { type: 'text/css' }, css);
    editor.getDoc().head.appendChild(styleElement);
    
    // Initial decoration after editor is fully loaded
    setTimeout(() => {
      const content = editor.getContent();
      const decoratedContent = decorateContent(content);
      
      // Only set if there's a difference to avoid cursor jumps
      if (content !== decoratedContent) {
        // Use silent mode to prevent firing change events
        editor.setContent(decoratedContent, { no_events: true });
      }
    }, 500);
  });
  
  // Helper function to decorate liquid syntax in raw content
  const decorateContent = (content: string): string => {
    // First, temporarily replace any already-decorated liquid elements
    // to prevent double-decoration
    let processedContent = content;
    
    // Create a placeholder pattern that won't be matched by our regex
    const liquidTagPlaceholders: string[] = [];
    const liquidVariablePlaceholders: string[] = [];
    
    // Replace already decorated variables with placeholders
    processedContent = processedContent.replace(
      /<span[^>]*?data-liquid-type="variable"[^>]*?>(.*?)<\/span>/gi,
      (match, innerContent) => {
        const id = `__LIQUID_VARIABLE_${liquidVariablePlaceholders.length}__`;
        liquidVariablePlaceholders.push(innerContent);
        return id;
      }
    );
    
    // Replace already decorated tags with placeholders
    processedContent = processedContent.replace(
      /<span[^>]*?data-liquid-type="tag"[^>]*?>(.*?)<\/span>/gi,
      (match, innerContent) => {
        const id = `__LIQUID_TAG_${liquidTagPlaceholders.length}__`;
        liquidTagPlaceholders.push(innerContent);
        return id;
      }
    );
    
    // Now decorate any remaining non-decorated liquid variables
    processedContent = processedContent.replace(liquidVariableRegex, (match) => {
      return `<span class="liquid-variable" data-liquid="true" data-liquid-type="variable" contenteditable="false">${match}</span>`;
    });
    
    // Decorate any remaining non-decorated liquid tags
    processedContent = processedContent.replace(liquidTagRegex, (match) => {
      return `<span class="liquid-tag" data-liquid="true" data-liquid-type="tag" contenteditable="false">${match}</span>`;
    });
    
    // Restore original decorated variables
    liquidVariablePlaceholders.forEach((content, index) => {
      const placeholder = `__LIQUID_VARIABLE_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-variable" data-liquid="true" data-liquid-type="variable" contenteditable="false">${content}</span>`
      );
    });
    
    // Restore original decorated tags
    liquidTagPlaceholders.forEach((content, index) => {
      const placeholder = `__LIQUID_TAG_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-tag" data-liquid="true" data-liquid-type="tag" contenteditable="false">${content}</span>`
      );
    });
    
    return processedContent;
  };

  // Function to apply decorations to Liquid syntax
  const decorateLiquidSyntax = () => {
    if (isDecorating) return;
    
    try {
      isDecorating = true;
      
      // Create a bookmark to restore cursor position
      const bookmark = editor.selection.getBookmark(2, true);
      
      // Get current content and decorate it
      const content = editor.getContent();
      const decoratedContent = decorateContent(content);
      
      // Only update if there's a difference
      if (content !== decoratedContent) {
        // Use silent mode to prevent firing events that would trigger this same method
        editor.setContent(decoratedContent, { no_events: true });
        
        // Restore the cursor position
        editor.selection.moveToBookmark(bookmark);
      }
    } finally {
      isDecorating = false;
    }
  };

  // Handle atomic deletion of Liquid syntax
  const handleDelete = (e: KeyboardEvent) => {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;
    
    const selection = editor.selection;
    const range = selection.getRng();
    
    // Check if we're at the edge of a Liquid element
    const node = range.startContainer.parentNode as HTMLElement;
    
    if (node && node.getAttribute('data-liquid') === 'true') {
      e.preventDefault();
      node.remove();
      
      // Trigger a manual content update without triggering events
      editor.undoManager.transact(() => {
        editor.setDirty(true);
      });
      
      return;
    }
  };

  // Prevent cursor inside Liquid syntax
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.getAttribute('data-liquid') === 'true') {
      e.preventDefault();
      
      // Select the entire Liquid element
      const selection = editor.selection;
      selection.select(target);
      
      return false;
    }
  };

  // Setup event handlers
  editor.on('KeyDown', handleDelete);
  editor.on('click', handleClick);
  
  // Debounce decoration to avoid performance issues
  let decorationTimeout: number | null = null;
  const debouncedDecorate = () => {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
    }
    
    decorationTimeout = window.setTimeout(() => {
      decorateLiquidSyntax();
      decorationTimeout = null;
    }, 800); // Long delay to avoid interfering with typing
  };
  
  // Apply decorations when content changes
  editor.on('SetContent', () => {
    if (!isDecorating) {
      setTimeout(decorateLiquidSyntax, 0);
    }
  });
  
  // Use blur event instead of input/change for better user experience
  // This way decoration only happens when user finishes editing
  editor.on('blur', debouncedDecorate);
  
  // Also decorate on node change when we might have affected liquid tags
  editor.on('NodeChange', () => {
    // Short delay to let TinyMCE finish its own processing
    setTimeout(() => {
      const selectedNode = editor.selection.getNode();
      // Only decorate if we're near a liquid tag
      if (selectedNode.querySelector('[data-liquid]') || 
          selectedNode.closest('[data-liquid]') || 
          selectedNode.innerHTML.includes('{{') || 
          selectedNode.innerHTML.includes('{%')) {
        debouncedDecorate();
      }
    }, 100);
  });
  
  return {
    decorateLiquidSyntax
  };
};

export default setupLiquidPlugin; 