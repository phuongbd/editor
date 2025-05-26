const LCF_PERMANENT_COMMENT_START_REGEX_ESCAPED = '<!--LCF_TAG_START%';
const LCF_PERMANENT_COMMENT_END_REGEX_ESCAPED = '%LCF_TAG_END-->';

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const lcfCommentRegex = new RegExp(
  escapeRegExp(LCF_PERMANENT_COMMENT_START_REGEX_ESCAPED) +
  '(\\{%-?\\s*.*?\\s*-?%\\})' + // Capture group 1: the actual Liquid tag
  escapeRegExp(LCF_PERMANENT_COMMENT_END_REGEX_ESCAPED),
  'gs' // g for global, s for dotall (to match across newlines if any)
);


const liquidVariableRegex = /<span[^>]*?class="liquid-variable"[^>]*?>(.*?)<\/span>/gi;

export const cleanHtmlUseTinyEditor = (htmlFromEditor: string): string => {
  if (typeof htmlFromEditor !== 'string' || !htmlFromEditor) {
    return '';
  }

  let cleanedHtml = htmlFromEditor;

  // Step 1: Convert LCF comments back to Liquid control flow tags
  cleanedHtml = cleanedHtml.replace(lcfCommentRegex, '$1');

  // Step 2: Unwrap Liquid variables from their <span> tags
  cleanedHtml = cleanedHtml.replace(liquidVariableRegex, '$1');

  // Add any other cleaning steps you might need here
  // For example, trimming whitespace, removing other editor-specific markup, etc.
  // Handle transcy editor divs
  const editorDivRegex = /<template\s+[^>]*?data-editor-transcy="true"[^>]*?>([\s\S]*?)<\/div>/gi;
  cleanedHtml = cleanedHtml.replace(editorDivRegex, '$1');

  // Clean up image error handlers
  const cleanImgOnErrorRegex = /<img([^>]*)onerror\s*=\s*(['"])[^>]*?\2([^>]*)>/gi;
  cleanedHtml = cleanedHtml.replace(cleanImgOnErrorRegex, '<img$1$3>');

  const cleanImgOnErrorRegexEnd = /<img([^>]*)onerror\s*=\s*[^>]*?>/gi;
  cleanedHtml = cleanedHtml.replace(cleanImgOnErrorRegexEnd, '<img$1>');

  return cleanedHtml;
};

