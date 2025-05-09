import { LiquidVariable } from './LiquidVariablesList';

let latestEditorContent = '';

export const updateLatestEditorContent = (content: string): void => {
  latestEditorContent = content;
};

export const getLatestEditorContent = (): string => {
  return latestEditorContent;
};

const isVariableInHTMLAttribute = (text: string, variablePosition: number): boolean => {
  const tagStart = text.lastIndexOf('<', variablePosition);
  if (tagStart === -1) return false;

  const tagEnd = text.indexOf('>', variablePosition);
  if (tagEnd === -1) return false;

  if (!(tagStart < variablePosition && variablePosition < tagEnd)) return false;

  const tagContent = text.substring(tagStart, tagEnd + 1);

  if (tagContent.startsWith('</')) return false;

  const quotePositions: number[] = [];
  for (let i = 0; i < tagContent.length; i++) {
    if (tagContent[i] === '"' || tagContent[i] === "'") {
      quotePositions.push(i);
    }
  }

  const relativePosition = variablePosition - tagStart;

  for (let i = 0; i < quotePositions.length; i += 2) {
    if (i + 1 >= quotePositions.length) break;

    const quoteStart = quotePositions[i];
    const quoteEnd = quotePositions[i + 1];

    if (relativePosition > quoteStart && relativePosition < quoteEnd) {
      return true;
    }
  }

  return false;
};

const isVariableInStyleTag = (text: string, variablePosition: number): boolean => {
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;

  while ((styleMatch = styleTagRegex.exec(text)) !== null) {
    const styleTagStart = styleMatch.index;
    const styleTagEnd = styleTagStart + styleMatch[0].length;

    if (variablePosition > styleTagStart && variablePosition < styleTagEnd) {
      return true;
    }
  }

  return false;
};

const isVariableInTitleTag = (text: string, variablePosition: number): boolean => {
  const titleTagRegex = /<title[^>]*>([\s\S]*?)<\/title>/gi;
  let titleMatch;

  while ((titleMatch = titleTagRegex.exec(text)) !== null) {
    const titleTagStart = titleMatch.index;
    const titleTagEnd = titleTagStart + titleMatch[0].length;

    if (variablePosition > titleTagStart && variablePosition < titleTagEnd) {
      return true;
    }
  }

  return false;
};

export const extractLiquidVariables = (content: string, contentDefault: string): LiquidVariable[] => {
  const latestContent = getLatestEditorContent();

  const liquidVariableRegex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const contentVariables: Record<string, LiquidVariable> = {};
  const defaultVariables: Record<string, LiquidVariable> = {};

  let match;
  while ((match = liquidVariableRegex.exec(latestContent)) !== null) {
    const variableName = match[1].trim();
    const variablePosition = match.index;

    if (
      isVariableInHTMLAttribute(latestContent, variablePosition) ||
      isVariableInStyleTag(latestContent, variablePosition) ||
      isVariableInTitleTag(latestContent, variablePosition)
    )
      continue;

    if (contentVariables[variableName]) continue;

    contentVariables[variableName] = {
      id: `${variableName}}}`,
      name: `{{ ${variableName} }}`,
    };
  }

  liquidVariableRegex.lastIndex = 0;
  while ((match = liquidVariableRegex.exec(contentDefault)) !== null) {
    const variableName = match[1].trim();
    const variablePosition = match.index;

    if (
      isVariableInHTMLAttribute(contentDefault, variablePosition) ||
      isVariableInStyleTag(contentDefault, variablePosition) ||
      isVariableInTitleTag(contentDefault, variablePosition)
    )
      continue;

    if (defaultVariables[variableName]) continue;

    defaultVariables[variableName] = {
      id: `${variableName}}}`,
      name: `{{ ${variableName} }}`,
    };
  }

  const missingVariables: LiquidVariable[] = Object.keys(defaultVariables)
    .filter((key) => !contentVariables[key])
    .map((key) => defaultVariables[key]);

  if (Object.keys(contentVariables).length === 0 && Object.keys(defaultVariables).length > 0) {
    return Object.values(defaultVariables);
  }

  return missingVariables;
};

export const filterLiquidVariables = (query: string, content: string, contentDefault: string): LiquidVariable[] => {
  if (!query) return extractLiquidVariables(content, contentDefault);

  const lowerCaseQuery = query.toLowerCase();
  const variables = extractLiquidVariables(content, contentDefault);

  return variables.filter((variable) => variable.name.toLowerCase().includes(lowerCaseQuery));
};
