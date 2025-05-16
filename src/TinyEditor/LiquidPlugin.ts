import { Editor as TinyMCEEditor } from 'tinymce';

// Regex patterns for Liquid syntax
const liquidVariableRegex = /(\{\{\s*[^{}]+?\s*\}\})/g;
const liquidTagRegex = /(\{%\s*[^{}]+?\s*%\})/g;

export const setupLiquidPlugin = (editor: TinyMCEEditor) => {
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
  });

  // Normalize document by removing nested liquid spans before applying new highlights
  const normalizeDocument = () => {
    const body = editor.getBody();
    
    // Find all liquid spans
    const liquidSpans = body.querySelectorAll('span[data-liquid="true"]');
    
    // For each liquid span, check if it's inside another liquid span
    liquidSpans.forEach(span => {
      // If this is inside another liquid span, unwrap it (move its content to parent)
      if (span.parentElement?.hasAttribute('data-liquid')) {
        // Get the parent
        const parent = span.parentElement;
        
        // Move this span's content directly to the parent
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        
        // Remove the empty span
        parent.removeChild(span);
      }
      
      // If span contains other spans, unwrap all inner spans
      const innerSpans = span.querySelectorAll('span[data-liquid="true"]');
      innerSpans.forEach(innerSpan => {
        // Get the parent
        const parent = innerSpan.parentElement;
        
        // Move this span's content to before it
        while (innerSpan.firstChild) {
          parent?.insertBefore(innerSpan.firstChild, innerSpan);
        }
        
        // Remove the empty span
        parent?.removeChild(innerSpan);
      });
    });
  };

  // Function to apply decorations to Liquid syntax
  const decorateLiquidSyntax = () => {
    // First, normalize document to remove any nested spans
    normalizeDocument();
    
    const body = editor.getBody();
    
    // Find all text nodes in the editor (that are not already inside a liquid span)
    const walker = document.createTreeWalker(
      body, 
      NodeFilter.SHOW_TEXT, 
      {
        acceptNode: (node) => {
          // Skip text nodes that are inside liquid spans
          if (node.parentElement?.hasAttribute('data-liquid')) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      } as NodeFilter
    );
    
    const nodesToProcess: {node: Node, matches: {index: number, text: string, type: 'variable' | 'tag'}[]}[] = [];
    
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      
      // Find all Liquid variables in this text node
      const variableMatches: {index: number, text: string, type: 'variable' | 'tag'}[] = [];
      let match;
      
      liquidVariableRegex.lastIndex = 0;
      while ((match = liquidVariableRegex.exec(text)) !== null) {
        variableMatches.push({
          index: match.index,
          text: match[0],
          type: 'variable'
        });
      }
      
      // Find all Liquid tags in this text node
      liquidTagRegex.lastIndex = 0;
      while ((match = liquidTagRegex.exec(text)) !== null) {
        variableMatches.push({
          index: match.index,
          text: match[0],
          type: 'tag'
        });
      }
      
      if (variableMatches.length > 0) {
        nodesToProcess.push({
          node,
          matches: variableMatches.sort((a, b) => a.index - b.index)
        });
      }
    }
    
    // Process nodes in reverse to avoid messing up indices
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { node, matches } = nodesToProcess[i];
      const text = node.textContent || '';
      
      let lastIndex = text.length;
      const fragments = [];
      
      // Process matches in reverse order
      for (let j = matches.length - 1; j >= 0; j--) {
        const match = matches[j];
        const { index, text: matchText, type } = match;
        
        // Text after the match
        if (index + matchText.length < lastIndex) {
          const afterText = text.substring(index + matchText.length, lastIndex);
          if (afterText.trim() !== '') {
            // Insert the text after the match as a separate text node to maintain styling separation
            fragments.unshift(document.createTextNode(afterText));
          } else {
            // If it's just whitespace, keep it as string to merge with other whitespace
            fragments.unshift(afterText);
          }
        }
        
        // Create span for Liquid syntax
        const span = editor.getDoc().createElement('span');
        span.className = type === 'variable' ? 'liquid-variable' : 'liquid-tag';
        span.setAttribute('data-liquid', 'true');
        span.setAttribute('data-liquid-type', type);
        span.textContent = matchText;
        fragments.unshift(span);
        
        // Text before the match
        if (index > 0) {
          const beforeText = text.substring(0, index);
          if (beforeText.trim() !== '') {
            // Insert the text before the match as a separate text node
            fragments.unshift(document.createTextNode(beforeText));
          } else {
            // If it's just whitespace, keep it as string to merge with other whitespace
            fragments.unshift(beforeText);
          }
        }
        
        lastIndex = index;
      }
      
      // Replace the node with our fragments
      const parent = node.parentNode;
      if (parent) {
        const fragment = editor.getDoc().createDocumentFragment();
        fragments.forEach(item => {
          if (typeof item === 'string') {
            fragment.appendChild(document.createTextNode(item));
          } else if (item instanceof Text) {
            fragment.appendChild(item);
          } else {
            fragment.appendChild(item);
          }
        });
        
        parent.replaceChild(fragment, node);
      }
    }
  };

  // Add debounce mechanism to avoid too frequent updates
  let decorationTimeout: number | null = null;
  const debouncedDecorate = () => {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
    }
    decorationTimeout = window.setTimeout(() => {
      decorateLiquidSyntax();
      decorationTimeout = null;
    }, 200);
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
      return;
    }
    
    // Check if selection contains Liquid elements
    if (!range.collapsed) {
      const selectedNodes = editor.selection.getSelectedBlocks();
      let containsLiquid = false;
      
      selectedNodes.forEach(block => {
        const liquidElements = block.querySelectorAll('[data-liquid="true"]');
        if (liquidElements.length > 0) {
          containsLiquid = true;
        }
      });
      
      if (containsLiquid) {
        // Let TinyMCE handle the deletion, but refresh our decorations afterward
        setTimeout(decorateLiquidSyntax, 0);
      }
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
  
  // Apply decorations when content changes, but with debounce
  editor.on('SetContent', decorateLiquidSyntax);
  editor.on('input', debouncedDecorate);
  editor.on('change', debouncedDecorate);
  
  return {
    decorateLiquidSyntax
  };
};

export default setupLiquidPlugin; 