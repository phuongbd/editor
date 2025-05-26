import { Editor as TinyMCEEditor, EditorEvent } from 'tinymce';
import { DEFAULT_IMAGE_URL } from './constants';

const liquidVariableRegex = /(\{\{\s*[^{}]+?\s*\}\})/g;
const highlightedVariableRegex = /<span[^>]*?class="liquid-variable"[^>]*?>(.*?)<\/span>/gi;

const attributeRegex = /<[^>]+?(\w+\s*=\s*['"])[^'"]*?\{\{.*?(['"])/g;
const styleAttributeRegex = /style\s*=\s*['"](.*?)['"]/g;
const scriptTagRegex = /<script[^>]*?>[\s\S]*?<\/script>/gi;
const styleTagRegex = /<style[^>]*?>[\s\S]*?<\/style>/gi;
const imgTagRegex = /<img\s+[^>]*?>/gi;

interface LiquidPlugin {
  decorateLiquidSyntax: (forceSetCursor?: boolean) => void;
  applyImageErrorHandling: () => void;
}

interface ExecCommandEvent {
  command: string;
  value?: string;
  ui?: boolean;
}

export const setupLiquidPlugin = (editor: TinyMCEEditor) => {
  let isDecorating = false;

  let decorationTimeout: number | null = null;

  let lastInsertedVariable: {
    content: string;
    timestamp: number;
  } | null = null;

  // Add CSS for Liquid syntax highlighting, img default
  editor.on('init', () => {
    const css = `
      .liquid-variable {
        padding: 1px 3px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 12px;
        background: var(--Backgrounds-bg-fill-tertiary, #e3e3e3);
        color: var(--Text-text-secondary, #616161);
        margin: 2px 2px;
        pointer-events: none;
        user-select: none;
        -webkit-user-modify: read-only;
        -moz-user-modify: read-only;
        -ms-user-modify: read-only;
        cursor: default;
        text-transform: lowercase;
        display: inline-block;
      }
      img[src='/images/default_thumbnail.png'] {
        max-width: 40px;
        object-fit: contain;
        margin: 4px 0;
      }
    `;

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

      applyImageErrorHandling();
    }, 500);
  });

  // Function to handle delete keypress
  const handleDelete = (e: EditorEvent<KeyboardEvent>) => {
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
      const variables: { start: number; end: number; content: string }[] = [];
      let match;

      while ((match = liquidVariableRegex.exec(text)) !== null) {
        variables.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
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
  const handleClick = (e: EditorEvent<MouseEvent>) => {
    const clickTarget = e.target as Element;

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
  const handleBeforeExecCommand = (e: EditorEvent<ExecCommandEvent>) => {
    if (e.command === 'mceInsertContent') {
      // If content contains liquid syntax, store for cursor positioning
      const content = e.value as string;

      if (typeof content === 'string' && liquidVariableRegex.test(content)) {
        lastInsertedVariable = {
          content,
          timestamp: Date.now(),
        };

        // Schedule decoration
        debouncedDecorate(true);
      }
    }
  };

  // Helper function to check if a liquid syntax is inside an attribute
  const isInsideAttribute = (content: string, match: RegExpExecArray): boolean => {
    // Reset the attribute regex before use
    attributeRegex.lastIndex = 0;

    // Check if the match is inside an attribute
    let attrMatch;
    while ((attrMatch = attributeRegex.exec(content)) !== null) {
      const attrStart = attrMatch.index + attrMatch[1].length;
      const attrEnd = attrMatch.index + attrMatch[0].length - attrMatch[3].length;

      if (match.index >= attrStart && match.index + match[0].length <= attrEnd) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a match is inside an img tag
  const isInsideImgTag = (content: string, match: RegExpExecArray): boolean => {
    // Reset img tag regex before use
    imgTagRegex.lastIndex = 0;

    // Check if inside an img tag
    let imgMatch;
    while ((imgMatch = imgTagRegex.exec(content)) !== null) {
      const imgStart = imgMatch.index;
      const imgEnd = imgStart + imgMatch[0].length;

      if (match.index >= imgStart && match.index + match[0].length <= imgEnd) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a match is inside a style attribute or tag
  const isInsideStyle = (content: string, match: RegExpExecArray): boolean => {
    // Reset style regex before use
    styleAttributeRegex.lastIndex = 0;
    styleTagRegex.lastIndex = 0;

    // Check if inside style attribute
    let styleAttrMatch;
    while ((styleAttrMatch = styleAttributeRegex.exec(content)) !== null) {
      const styleStart = styleAttrMatch.index;
      const styleEnd = styleStart + styleAttrMatch[0].length;

      if (match.index >= styleStart && match.index + match[0].length <= styleEnd) {
        return true;
      }
    }

    // Check if inside style tag
    let styleTagMatch;
    while ((styleTagMatch = styleTagRegex.exec(content)) !== null) {
      const tagStart = styleTagMatch.index;
      const tagEnd = tagStart + styleTagMatch[0].length;

      if (match.index >= tagStart && match.index + match[0].length <= tagEnd) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a match is inside a script tag
  const isInsideScript = (content: string, match: RegExpExecArray): boolean => {
    // Reset script regex before use
    scriptTagRegex.lastIndex = 0;

    // Check if inside script tag
    let scriptMatch;
    while ((scriptMatch = scriptTagRegex.exec(content)) !== null) {
      const scriptStart = scriptMatch.index;
      const scriptEnd = scriptStart + scriptMatch[0].length;

      if (match.index >= scriptStart && match.index + match[0].length <= scriptEnd) {
        return true;
      }
    }

    return false;
  };

  // Helper function to determine if a liquid syntax should be highlighted
  const shouldHighlight = (content: string, match: RegExpExecArray): boolean => {
    // Only highlight if not inside attributes, style, script tags, or img tags
    return !(isInsideAttribute(content, match) || isInsideStyle(content, match) || isInsideScript(content, match) || isInsideImgTag(content, match));
  };

  // Function to decorate content with spans, ngăn chặn span lồng nhau
  const decorateContent = (content: string): string => {
    // Quick check if no liquid syntax to avoid processing
    if (!content.includes('{{') && !content.includes('{%')) {
      return content;
    }

    // Bước 1: Trích xuất và thay thế các span đã được highlight
    const extractedVariables: string[] = [];

    // Thay thế các span đã được highlight với placeholder
    let processedContent = content.replace(highlightedVariableRegex, (match, innerContent) => {
      // Trích xuất nội dung bên trong span
      extractedVariables.push(innerContent);
      return `__EXISTING_LIQUID_VAR_${extractedVariables.length - 1}__`;
    });

    // Bước 2: Tìm và thay thế các biến liquid chưa được highlight
    const liquidVariablePlaceholders: string[] = [];

          // Reset regex before use
      liquidVariableRegex.lastIndex = 0;

      // Find all variable matches
      let match;
      while ((match = liquidVariableRegex.exec(processedContent)) !== null) {
        // Only add to placeholders if should be highlighted
        if (shouldHighlight(processedContent, match)) {
          liquidVariablePlaceholders.push(match[0]);
          const placeholder = `__NEW_LIQUID_VAR_${liquidVariablePlaceholders.length - 1}__`;

          // Replace this specific occurrence
          const beforeMatch = processedContent.substring(0, match.index);
          const afterMatch = processedContent.substring(match.index + match[0].length);
          processedContent = beforeMatch + placeholder + afterMatch;

          // Reset regex since we modified the string
          liquidVariableRegex.lastIndex = beforeMatch.length + placeholder.length;
        }
      }

    // Bước 3: Khôi phục tất cả các placeholder

    // Khôi phục các span đã tồn tại
    extractedVariables.forEach((content, index) => {
      const placeholder = `__EXISTING_LIQUID_VAR_${index}__`;
      processedContent = processedContent.replace(
        placeholder,
        `<span class="liquid-variable" data-liquid="true" data-liquid-type="variable" contenteditable="false">${content}</span>`
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
          // editor.focus(); // Removing this as it can cause unexpected cursor jumps after restoring a bookmark
        }
      }

      // Apply image error handling after content is set
      applyImageErrorHandling();
    } finally {
      // Reset flag to allow next decoration
      isDecorating = false;
    }
  };

  // Function to apply default image error handling to all images in the editor
  const applyImageErrorHandling = () => {
    const imgElements = editor.dom.select('img');

    imgElements.forEach((img) => {
      // Check if onerror is already set
      if (!img.hasAttribute('onerror')) {
        // Set onerror attribute to use default image on error
        editor.dom.setAttrib(img, 'onerror', `this.onerror=null;this.src='${DEFAULT_IMAGE_URL}';`);
      }
    });
  };

  // Debounce decoration to avoid performance issues
  const debouncedDecorate = (withCursor = false) => {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
    }

    decorationTimeout = window.setTimeout(
      () => {
        decorateLiquidSyntax(withCursor);
        decorationTimeout = null;
      },
      withCursor ? 200 : 800
    ); // Use quicker response when preserving cursor
  };

  // Setup event handlers
  editor.on('KeyDown', handleDelete);
  editor.on('click', handleClick);
  editor.on('BeforeExecCommand', handleBeforeExecCommand);

  // Watch for inserted content
  editor.on('ExecCommand', (e: EditorEvent<ExecCommandEvent>) => {
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

  // Interface for NodeChange event
  interface NodeChangeEvent {
    element: Element;
  }

  // Apply image error handling when image is inserted
  editor.on('NodeChange', (e: EditorEvent<NodeChangeEvent>) => {
    if (e.element && e.element.nodeName === 'IMG') {
      applyImageErrorHandling();
    }
  });

  // Use blur event for normal decoration
  editor.on('blur', () => debouncedDecorate(false));

  // Expose the decorateLiquidSyntax function to allow other plugins to trigger it
  (editor.plugins as Record<string, unknown>).liquid = {
    decorateLiquidSyntax,
    applyImageErrorHandling,
  } as LiquidPlugin;
};

export default setupLiquidPlugin;
