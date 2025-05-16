import { Editor } from '@tinymce/tinymce-react';
import React from 'react';
import { createEditorSetup, getEditorInitConfig, TinyEditorSetupOptions } from './TinyEditorSetup';

export interface TinyEditorProps extends TinyEditorSetupOptions {
  initialValue: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  id?: string;
}

const TinyEditor: React.FC<TinyEditorProps> = ({
  initialValue = '',
  onChange,
  height = 500,
  disabled = false,
  id = 'tiny-editor',
  liquidSupport = false,
  mentionSupport = false,
  ...restProps
}) => {
  
  // Create setup function
  const setup = createEditorSetup({ height, liquidSupport, mentionSupport });
  
  // Get base configuration
  const init = {
    ...getEditorInitConfig({ height, liquidSupport }),
    setup,
    ...restProps
  };

  const handleEditorChange = (newContent: string) => {
    onChange?.(newContent);
  };

  return (
    <Editor
      scriptLoading={{ async: true }}
      id={id}
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={initialValue}
      init={init}
      onEditorChange={handleEditorChange}
      disabled={disabled}
    />
  );
};

export default TinyEditor;