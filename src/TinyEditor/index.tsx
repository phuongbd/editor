import { Editor } from '@tinymce/tinymce-react';
import React, { useCallback, useMemo } from 'react';
import { createEditorSetup, getEditorInitConfig, TinyEditorSetupOptions } from './TinyEditorSetup';

export interface TinyEditorProps extends TinyEditorSetupOptions {
  initialValue: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  id?: string;
}

// Track editor instances to prevent duplicate setup
const editorInstances = new Set<string>();

const TinyEditor: React.FC<TinyEditorProps> = React.memo(({
  initialValue = '',
  onChange,
  height = 500,
  disabled = false,
  id = 'tiny-editor',
  liquidSupport = false,
  mentionSupport = false,
  ...restProps
}) => {
  // Create unique instance ID if not provided
  const editorId = useMemo(() => id || `tiny-editor-${Math.random().toString(36).substring(2, 9)}`, [id]);
  
  // Create setup function with memoization to prevent recreation on every render
  const setup = useMemo(() => 
    createEditorSetup({ height, liquidSupport, mentionSupport })
  , [height, liquidSupport, mentionSupport]);
  
  // Get base configuration with memoization
  const init = useMemo(() => ({
    ...getEditorInitConfig({ height, liquidSupport }),
    setup,
    ...restProps
  }), [height, liquidSupport, setup, restProps]);

  // Memoize the change handler to prevent unnecessary re-renders
  const handleEditorChange = useCallback((newContent: string) => {
    onChange?.(newContent);
  }, [onChange]);

  // Track editor instance lifecycle
  const handleEditorInit = useCallback(() => {
    if (!editorInstances.has(editorId)) {
      editorInstances.add(editorId);
      console.log(`TinyEditor instance ${editorId} initialized`);
    }
  }, [editorId]);

  // Clean up editor instance when component unmounts
  React.useEffect(() => {
    return () => {
      if (editorInstances.has(editorId)) {
        editorInstances.delete(editorId);
        console.log(`TinyEditor instance ${editorId} cleaned up`);
      }
    };
  }, [editorId]);

  return (
    <Editor
      scriptLoading={{ async: true }}
      id={editorId}
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={initialValue}
      init={init}
      onEditorChange={handleEditorChange}
      onInit={handleEditorInit}
      disabled={disabled}
    />
  );
});

// Add displayName for better debugging
TinyEditor.displayName = 'TinyEditor';

export default TinyEditor;