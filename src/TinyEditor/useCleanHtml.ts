const useCleanHtml = () => {
  const cleanHtmlUseTinyEditor = (html: string): string => {
    if (!html) return '';

    // Clean up liquid variable spans - match all possible attributes
    const liquidVariableRegex = /<span[^>]*?class="liquid-variable"[^>]*?>(.*?)<\/span>/gi;
    html = html.replace(liquidVariableRegex, (match, content) => {
      // Make sure content maintains its original formatting
      return content.trim();
    });

    // Clean up liquid tag spans - match all possible attributes
    const liquidTagRegex = /<span[^>]*?class="liquid-tag"[^>]*?>(.*?)<\/span>/gi;
    html = html.replace(liquidTagRegex, (match, content) => {
      // Make sure content maintains its original formatting
      return content.trim();
    });

    // Handle transcy editor divs
    const editorDivRegex = /<div\s+[^>]*?data-editor-transcy="true"[^>]*?>([\s\S]*?)<\/div>/gi;
    html = html.replace(editorDivRegex, '$1');

    // Clean up image error handlers
    const cleanImgOnErrorRegex = /<img([^>]*)onerror\s*=\s*(['"])[^>]*?\2([^>]*)>/gi;
    html = html.replace(cleanImgOnErrorRegex, '<img$1$3>');

    const cleanImgOnErrorRegexEnd = /<img([^>]*)onerror\s*=\s*[^>]*?>/gi;
    html = html.replace(cleanImgOnErrorRegexEnd, '<img$1>');
    
    return html;
  };
  return { cleanHtmlUseTinyEditor };
};

export default useCleanHtml;
