import { Editor as TinyMCEEditor } from 'tinymce';

// Regex patterns for Liquid syntax
const liquidVariableRegex = /(\{\{\s*[^{}]+?\s*\}\})/g;
const liquidTagRegex = /(\{%\s*[^{}]+?\s*%\})/g;

// Regex để tìm span đã được highlight
const highlightedVariableRegex = /<span[^>]*?class="liquid-variable"[^>]*?>(.*?)<\/span>/gi;
const highlightedTagRegex = /<span[^>]*?class="liquid-tag"[^>]*?>(.*?)<\/span>/gi;

export const setupLiquidPlugin = (editor: TinyMCEEditor) => {
  // Track if we're currently in a decoration cycle to prevent recursion
  let isDecorating = false;
  
  // Track decoration timeouts
  let decorationTimeout: number | null = null;
  
  // Track last inserted variable to restore cursor position
  let lastInsertedVariable: {
    content: string,
    timestamp: number
  } | null = null;
  
  // Add CSS for Liquid syntax highlighting
  editor.on('init', () => {
    const css = `
      .liquid-variable {
        background-color: #e6f7ff;
        border-radius: 3px;
        padding: 2px 0;
        cursor: pointer;
        display: inline-block; /* Ensure proper cursor behavior */
      }
      .liquid-tag {
        display: none;
      }
    `;
    
    // Insert CSS into editor
    const styleElement = editor.dom.create('style', { type: 'text/css' }, css);
    editor.getDoc().head.appendChild(styleElement);
    
    // Initial decoration after editor is fully loaded - only once
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

  // Function to handle delete keypress
  const handleDelete = (e: any) => {
    // Only handle backspace and delete keys
    if (e.keyCode !== 8 && e.keyCode !== 46) return;
    
    // Get the selection
    const selection = editor.selection;
    const range = selection.getRng();
    const startNode = range.startContainer;
    
    // Check if we're positioned at the beginning or end of a liquid variable
    if (startNode.nodeType === Node.TEXT_NODE) {
      const textNode = startNode as Text;
      const text = textNode.textContent || '';
      const cursorPos = range.startOffset;
      
      // Find liquid variables in the text
      const variables: { start: number, end: number, content: string }[] = [];
      let match;
      
      while ((match = liquidVariableRegex.exec(text)) !== null) {
        variables.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[0]
        });
      }
      
      // Check if the cursor is at the beginning or end of a liquid variable
      for (const variable of variables) {
        if (cursorPos === variable.start || cursorPos === variable.end) {
          // Cancel event
          e.preventDefault();
          return;
        }
      }
    }
  };

  // Function to handle clicks on liquid variables
  const handleClick = (e: any) => {
    const clickTarget = e.target;
    
    // Check if we clicked on a liquid variable
    if (clickTarget && clickTarget.classList && clickTarget.classList.contains('liquid-variable')) {
      // Prevent default click behavior
      e.preventDefault();
      
      // Create a range after the variable
      const range = editor.dom.createRng();
      range.setStartAfter(clickTarget);
      range.setEndAfter(clickTarget);
      
      // Select this range
      editor.selection.setRng(range);
      editor.focus();
    }
  };

  // Function to handle commands like paste
  const handleBeforeExecCommand = (e: any) => {
    if (e.command === 'mceInsertContent') {
      // If content contains liquid syntax, store for cursor positioning
      const content = e.value;
      
      if (typeof content === 'string' && (liquidVariableRegex.test(content) || liquidTagRegex.test(content))) {
        lastInsertedVariable = {
          content,
          timestamp: Date.now()
        };
        
        // Schedule decoration
        debouncedDecorate(true);
      }
    }
  };

  // Function to decorate content with spans, ngăn chặn span lồng nhau
  const decorateContent = (content: string): string => {
    // Quick check if no liquid syntax to avoid processing
    if (!content.includes('{{') && !content.includes('{%')) {
      return content;
    }
    
    // Bước 1: Trích xuất và thay thế các span đã được highlight
    const extractedVariables: string[] = [];
    const extractedTags: string[] = [];
    
    // Thay thế các span đã được highlight với placeholder
    let processedContent = content.replace(highlightedVariableRegex, (match, innerContent) => {
      // Trích xuất nội dung bên trong span
      extractedVariables.push(innerContent);
      return `__EXISTING_LIQUID_VAR_${extractedVariables.length - 1}__`;
    });
    
    processedContent = processedContent.replace(highlightedTagRegex, (match, innerContent) => {
      extractedTags.push(innerContent);
      return `__EXISTING_LIQUID_TAG_${extractedTags.length - 1}__`;
    });
    
    // Bước 2: Tìm và thay thế các biến liquid chưa được highlight
    const liquidVariablePlaceholders: string[] = [];
    const liquidTagPlaceholders: string[] = [];
    
    // Thay thế biến liquid chưa được highlight với placeholder
    processedContent = processedContent.replace(liquidVariableRegex, (match) => {
      liquidVariablePlaceholders.push(match);
      return `__NEW_LIQUID_VAR_${liquidVariablePlaceholders.length - 1}__`;
    });
    
    processedContent = processedContent.replace(liquidTagRegex, (match) => {
      liquidTagPlaceholders.push(match);
      return `__NEW_LIQUID_TAG_${liquidTagPlaceholders.length - 1}__`;
    });
    
    // Bước 3: Khôi phục tất cả các placeholder
    
    // Khôi phục các span đã tồn tại
    extractedVariables.forEach((content, index) => {
      const placeholder = `__EXISTING_LIQUID_VAR_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-variable" data-liquid="true" data-liquid-type="variable" contenteditable="false">${content}</span>`
      );
    });
    
    extractedTags.forEach((content, index) => {
      const placeholder = `__EXISTING_LIQUID_TAG_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-tag" data-liquid="true" data-liquid-type="tag" contenteditable="false">${content}</span>`
      );
    });
    
    // Highlight các biến liquid mới
    liquidVariablePlaceholders.forEach((content, index) => {
      const placeholder = `__NEW_LIQUID_VAR_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-variable" data-liquid="true" data-liquid-type="variable" contenteditable="false">${content}</span>`
      );
    });
    
    liquidTagPlaceholders.forEach((content, index) => {
      const placeholder = `__NEW_LIQUID_TAG_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-tag" data-liquid="true" data-liquid-type="tag" contenteditable="false">${content}</span>`
      );
    });
    
    return processedContent;
  };

  // Function to apply decorations to Liquid syntax with improved cursor handling
  const decorateLiquidSyntax = (forceSetCursor = false) => {
    // Prevent recursion
    if (isDecorating) return;
    
    isDecorating = true;
    
    try {
      // Store cursor position using TinyMCE bookmarks
      const bookmark = forceSetCursor ? editor.selection.getBookmark(2, true) : null;
      
      // Get current content
      const content = editor.getContent();
      
      // Apply decorations
      const decoratedContent = decorateContent(content);
      
      // Only set if there's a difference to avoid cursor jumps
      if (content !== decoratedContent) {
        // Use "silent" mode to prevent triggering change events
        editor.setContent(decoratedContent, { no_events: true });
        
        // Restore cursor position if needed
        if (bookmark) {
          editor.selection.moveToBookmark(bookmark);
          editor.focus();
        }
      }
    } finally {
      // Reset flag to allow next decoration
      isDecorating = false;
    }
  };

  // Optimized function to schedule cursor positioning
  const scheduleMultipleCursorPositioning = () => {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
    }
    
    decorationTimeout = window.setTimeout(() => {
      decorateLiquidSyntax(true);
      decorationTimeout = null;
    }, 200);
  };

  // Debounce decoration to avoid performance issues
  const debouncedDecorate = (withCursor = false) => {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
    }
    
    decorationTimeout = window.setTimeout(() => {
      decorateLiquidSyntax(withCursor);
      decorationTimeout = null;
    }, withCursor ? 200 : 800); // Use quicker response when preserving cursor
  };

  // Setup event handlers
  editor.on('KeyDown', handleDelete);
  editor.on('click', handleClick);
  editor.on('BeforeExecCommand', handleBeforeExecCommand);
  
  // Watch for inserted content
  editor.on('ExecCommand', (e) => {
    if (e.command === 'mceInsertContent' && lastInsertedVariable) {
      // Add a small delay to let TinyMCE finish its DOM manipulations
      debouncedDecorate(true);
    }
  });
  
  // Apply decorations when content changes
  editor.on('SetContent', () => {
    if (!isDecorating) {
      debouncedDecorate(false);
    }
  });
  
  // Use blur event for normal decoration
  editor.on('blur', () => debouncedDecorate(false));

  // Expose the decorateLiquidSyntax function to allow other plugins to trigger it
  (editor.plugins as any).liquid = {
    decorateLiquidSyntax
  };
};

export default setupLiquidPlugin; 