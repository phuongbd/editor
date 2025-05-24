import { Editor } from '@tinymce/tinymce-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { createEditorSetup, TinyEditorSetupOptions } from './TinyEditorSetup';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

export interface TinyEditorProps extends TinyEditorSetupOptions {
  value: string;
  valueDefault: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  id?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  init: {
    setup?: (editor: TinyMCEEditor) => void;
    [key: string]: any;
  };
}

const editorInstances = new Set<string>();

const TinyEditor = ({
  init,
  onFocus,
  onBlur,
  value = '',
  valueDefault = '',
  onChange,
  disabled = false,
  id = 'tiny-editor',
  liquidSupport = false,
  mentionSupport = false,
}: TinyEditorProps) => {
  const { setup: initSetup, ...restInit } = init;
  const editorId = useMemo(() => id || `tiny-editor-${Math.random().toString(36).substring(2, 9)}`, [id]);

  const setup = useMemo(
    () => createEditorSetup({ liquidSupport, mentionSupport, value, valueDefault, setup: initSetup }),
    [liquidSupport, mentionSupport, value, valueDefault, initSetup]
  );

  const initData = useMemo(
    () => ({
      ...restInit,
      setup,
    }),
    [restInit, setup]
  );

  const handleEditorChange = useCallback(
    (newContent: string) => {
      if (disabled) return;
      onChange?.(newContent);
    },
    [onChange, disabled]
  );

  const handleEditorInit = useCallback(() => {
    if (!editorInstances.has(editorId)) {
      editorInstances.add(editorId);
    }
  }, [editorId]);

  useEffect(() => {
    return () => {
      if (editorInstances.has(editorId)) {
        editorInstances.delete(editorId);
      }
    };
  }, [editorId]);

  return (
    <Editor
      scriptLoading={{ async: true }}
      id={editorId}
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={value}
      init={initData}
      onEditorChange={handleEditorChange}
      onInit={handleEditorInit}
      onFocus={disabled ? undefined : onFocus}
      onBlur={disabled ? undefined : onBlur}
      disabled={disabled}
    />
  );
};

TinyEditor.displayName = 'TinyEditor';

export default React.memo(TinyEditor);
