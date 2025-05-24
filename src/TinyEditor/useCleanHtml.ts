import { useCallback } from 'react';

export const useCleanHtml = () => {
  const decodeMceProtected = (content: string) => {
    // Decode mce:protected entities
    return content
      .replace(/&lt;!--mce:protected\s*(.*?)--&gt;/g, (_, encoded) => {
        return decodeURIComponent(encoded.replace(/\s+/g, '').replace(/%7B/g, '{').replace(/%7D/g, '}'));
      });
  };

  const cleanHtmlUseTinyEditor = useCallback((content: string) => {
    if (!content) return '';

    // First decode any mce:protected content
    let cleanedContent = decodeMceProtected(content);

    // Store original Liquid blocks and their content
    const liquidBlocks: Array<{tag: string, content: string}> = [];
    const liquidPlaceholders: string[] = [];
    
    // Extract complete Liquid blocks (if/else/endif)
    cleanedContent = cleanedContent.replace(/{%-?\s*if[\s\S]*?{%-?\s*endif\s*-?%}/m, (match) => {
      const placeholder = `__LIQUID_BLOCK_${liquidBlocks.length}__`;
      liquidBlocks.push({tag: 'if', content: match});
      liquidPlaceholders.push(placeholder);
      return placeholder;
    });

    // Extract standalone Liquid tags
    cleanedContent = cleanedContent.replace(/({%-?[\s\S]*?-?%}|{{-?[\s\S]*?-?}})/g, (match) => {
      const placeholder = `__LIQUID_TAG_${liquidBlocks.length}__`;
      liquidBlocks.push({tag: 'standalone', content: match});
      liquidPlaceholders.push(placeholder);
      return placeholder;
    });

    // Clean up HTML whitespace while preserving structure
    cleanedContent = cleanedContent
      .replace(/>\s+</g, '>\n<') // Add newline between tags
      .replace(/(<[^>]+>)([^<]+)(<\/[^>]+>)/g, '$1\n$2\n$3') // Add newlines around text content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    // Restore Liquid blocks and tags
    liquidBlocks.forEach(({content}, index) => {
      const placeholder = liquidPlaceholders[index];
      cleanedContent = cleanedContent.replace(placeholder, content);
    });

    return cleanedContent;
  }, []);

  return {
    cleanHtmlUseTinyEditor,
  };
};

export default useCleanHtml;
