import { Editor as TinyMCEEditor } from 'tinymce';
import { setupLiquidPlugin } from './LiquidPlugin';
import { setupMentionPlugin } from './MentionPlugin';

export interface TinyEditorSetupOptions {
  liquidSupport?: boolean;
  mentionSupport?: boolean;
  value?: string;
  valueDefault?: string;
  setup?: (editor: TinyMCEEditor) => void;
}

export const createEditorSetup = (options: TinyEditorSetupOptions = {}) => {
  const { liquidSupport = false, mentionSupport = false, value = '', valueDefault = '', setup } = options;

  return (editor: TinyMCEEditor) => {
    console.log('Editor initialization - value:', value);
    console.log('Editor initialization - valueDefault:', valueDefault);
    console.log('Editor initialization - getContent:', editor.getContent());

    if (liquidSupport) {
      setupLiquidPlugin(editor);
    }

    if (mentionSupport) {
      setupMentionPlugin(editor, value, valueDefault);
    }

    setup?.(editor);
  };
};

export default { createEditorSetup };
