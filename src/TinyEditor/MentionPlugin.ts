import { Editor as TinyMCEEditor } from 'tinymce';

// Define plugin interface for Liquid plugin
interface LiquidPlugin {
  decorateLiquidSyntax: (forceSetCursor?: boolean) => void;
  applyImageErrorHandling?: () => void;
}

/**
 * Extract liquid variables from content
 * Logic adapted from the extractLiquidVariables function
 */
const extractLiquidVariables = (content: string, contentDefault: string): string[] => {
  const liquidVariableRegex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const contentVariables: Record<string, string> = {};
  const defaultVariables: Record<string, string> = {};

  // Helper function to check if variable is in HTML attribute
  const isVariableInHTMLAttribute = (text: string, position: number): boolean => {
    const attributeRegex = /<[^>]+\s+[^>]*?\{\{[^}]*?\}\}[^>]*>/g;
    let match;
    while ((match = attributeRegex.exec(text)) !== null) {
      if (position >= match.index && position < match.index + match[0].length) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check if variable is in style tag
  const isVariableInStyleTag = (text: string, position: number): boolean => {
    const styleRegex = /<style[^>]*>[\s\S]*?\{\{[^}]*?\}\}[\s\S]*?<\/style>/g;
    let match;
    while ((match = styleRegex.exec(text)) !== null) {
      if (position >= match.index && position < match.index + match[0].length) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check if variable is in title tag
  const isVariableInTitleTag = (text: string, position: number): boolean => {
    const titleRegex = /<title[^>]*>[\s\S]*?\{\{[^}]*?\}\}[\s\S]*?<\/title>/g;
    let match;
    while ((match = titleRegex.exec(text)) !== null) {
      if (position >= match.index && position < match.index + match[0].length) {
        return true;
      }
    }
    return false;
  };

  // Process current content
  let match;
  while ((match = liquidVariableRegex.exec(content)) !== null) {
    const variableName = match[1].trim();
    const variablePosition = match.index;

    if (
      isVariableInHTMLAttribute(content, variablePosition) ||
      isVariableInStyleTag(content, variablePosition) ||
      isVariableInTitleTag(content, variablePosition)
    )
      continue;

    if (contentVariables[variableName]) continue;

    contentVariables[variableName] = `{{ ${variableName} }}`;
  }

  // Process default content
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

    defaultVariables[variableName] = `{{ ${variableName} }}`;
  }

  // Find missing variables
  const missingVariables = Object.keys(defaultVariables)
    .filter((key) => !contentVariables[key])
    .map((key) => defaultVariables[key]);

  // If no variables in current content but some in default, return all default variables
  if (Object.keys(contentVariables).length === 0 && Object.keys(defaultVariables).length > 0) {
    return Object.values(defaultVariables);
  }

  // Return missing variables
  return missingVariables;
};

/**
 * Get dynamic liquid variables based on content
 */
const getLiquidVariables = (value: string, valueDefault: string): string[] => {
  return extractLiquidVariables(value, valueDefault);
};

/**
 * Setup the mention autocompleter for TinyMCE
 */
export const setupMentionAutocompleter = (editor: TinyMCEEditor, value: string, valueDefault: string) => {
  // Define a property key for storing state on the editor instance
  const AUTOCOMPLETER_REGISTERED_KEY = 'liquid_autocompleter_registered';

  // Only register the autocompleter once per editor instance
  if (editor.getParam && editor.getParam(AUTOCOMPLETER_REGISTERED_KEY, false)) {
    return;
  }

  // Mark the autocompleter as registered using a safer approach
  try {
    // Store state on editor instance using a data attribute
    const editorElm = editor.getContainer();
    if (editorElm) {
      editorElm.setAttribute(`data-${AUTOCOMPLETER_REGISTERED_KEY}`, 'true');
    }
  } catch (e) {
    // Silently handle error
  }

  // Get dynamic liquid variables - store in mutable state
  let liquidVariables = getLiquidVariables(value, valueDefault);

  // Function to update variables when content changes
  const updateLiquidVariables = (newValue: string) => {
    liquidVariables = getLiquidVariables(newValue, valueDefault);
  };

  // Listen for content changes
  const contentChangeHandler = () => {
    updateLiquidVariables(editor.getContent());
  };

  // Add event listeners for content changes
  editor.on('change', contentChangeHandler);
  editor.on('input', contentChangeHandler);

  // Register a custom autocompleter for Liquid variables
  if (editor.ui && editor.ui.registry && typeof editor.ui.registry.addAutocompleter === 'function') {
    editor.ui.registry.addAutocompleter('liquidvariables', {
      trigger: '{{',
      minChars: 0,
      columns: 1,
      fetch: (pattern: string, maxResults: number) => {
        // Filter variables based on search pattern - use the current value of liquidVariables
        const filteredItems = liquidVariables
          .filter((variable) => variable.toLowerCase().includes(pattern.toLowerCase()))
          .slice(0, maxResults)
          .map((variable) => ({
            type: 'cardmenuitem' as const,
            value: variable,
            label: variable,
            items: [
              {
                type: 'cardtext' as const,
                text: variable,
                name: 'variable',
              },
            ],
          }));

        return Promise.resolve(filteredItems);
      },
      onAction: (autocompleteApi, rng, value) => {
        // Insert the selected variable
        editor.selection.setRng(rng);
        const uniqueMarkerId = 'mention-cursor-target-' + Date.now();

        try {
          editor.insertContent(value + '<span id="' + uniqueMarkerId + '">\uFEFF</span>');
          autocompleteApi.hide();

          // Delay decoration and final cursor positioning
          setTimeout(() => {
            const plugins = editor.plugins as Record<string, unknown>;
            const liquidPlugin = plugins.liquid as LiquidPlugin | undefined;

            if (typeof liquidPlugin?.decorateLiquidSyntax === 'function') {
              // Decorate, but don't let it manage cursor with bookmarks
              liquidPlugin.decorateLiquidSyntax(false);
            }

            // After decoration (which includes a setContent that moves the cursor),
            // find our unique marker and set the cursor correctly.
            const finalMarker = editor.dom.get(uniqueMarkerId);
            if (finalMarker) {
              editor.selection.select(finalMarker); // Select the marker node
              editor.selection.collapse(false); // Collapse selection to the end of the marker
              editor.dom.remove(finalMarker); // Remove the marker
            }
            editor.focus(); // Ensure editor is focused and cursor is visible
          }, 250); // Timeout to run after potential decoration timeouts
        } catch (error) {
          // Silently handle error
          console.error('Error during mention onAction:', error);
          editor.focus(); // Ensure editor is focused even if an error occurs
        }
      },
    });
  }

  // Function to clean up resources
  const cleanup = () => {
    // Remove content change listeners
    editor.off('change', contentChangeHandler);
    editor.off('input', contentChangeHandler);
  };

  return {
    cleanup,
  };
};

/**
 * Setup the mention plugin for TinyMCE
 */
export const setupMentionPlugin = (editor: TinyMCEEditor, value: string, valueDefault: string) => {
  return setupMentionAutocompleter(editor, value, valueDefault);
};

export default setupMentionPlugin;
