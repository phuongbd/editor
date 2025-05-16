import { Editor as TinyMCEEditor } from 'tinymce';
import { setupLiquidPlugin } from './LiquidPlugin';
import { setupMentionPlugin } from './MentionPlugin';

export interface TinyEditorSetupOptions {
  height?: number;
  liquidSupport?: boolean;
  mentionSupport?: boolean;
}

export const createEditorSetup = (options: TinyEditorSetupOptions = {}) => {
  const { height = 500, liquidSupport = false, mentionSupport = false } = options;

  return (editor: TinyMCEEditor) => {
    // Setup Liquid plugin if enabled
    if (liquidSupport) {
      setupLiquidPlugin(editor);
    }
    
    // Setup Mention plugin if enabled
    if (mentionSupport) {
      setupMentionPlugin(editor);
    }

    // Add more custom setup here if needed
    editor.on('init', () => {
      console.log('TinyMCE initialized with options:', options);
    });
  };
};

export const getEditorInitConfig = (options: TinyEditorSetupOptions = {}) => {
  const { height = 500 } = options;

  return {
    menubar: false,
    height,
    plugins: [
      'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 
      'searchreplace', 'visualblocks', 'code', 'fullscreen', 
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | removeformat | help',
  };
};

export default { createEditorSetup, getEditorInitConfig }; 