const decodeMceProtected = (content: string) => {
  // Decode both HTML-escaped and raw mce:protected entities
  return content
    .replace(/&lt;!--mce:protected\s*(.*?)--&gt;/g, (_, encoded) => {
      return decodeURIComponent(encoded.replace(/\s+/g, '').replace(/%7B/g, '{').replace(/%7D/g, '}'));
    })
    .replace(/<!--mce:protected\s*(.*?)-->/g, (_, encoded) => {
      return decodeURIComponent(encoded.replace(/\s+/g, '').replace(/%7B/g, '{').replace(/%7D/g, '}'));
    });
};

export const cleanHtmlUseTinyEditor = (content: string) => {
  if (!content) return '';

  // First decode any mce:protected content
  let html = decodeMceProtected(content);

  // Handle transcy editor divs
  const editorDivRegex = /<template\s+[^>]*?data-editor-transcy="true"[^>]*?>([\s\S]*?)<\/div>/gi;
  html = html.replace(editorDivRegex, '$1');

  // Clean up image error handlers
  const cleanImgOnErrorRegex = /<img([^>]*)onerror\s*=\s*(['"])[^>]*?\2([^>]*)>/gi;
  html = html.replace(cleanImgOnErrorRegex, '<img$1$3>');

  const cleanImgOnErrorRegexEnd = /<img([^>]*)onerror\s*=\s*[^>]*?>/gi;
  html = html.replace(cleanImgOnErrorRegexEnd, '<img$1>');

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

  return html;
};
