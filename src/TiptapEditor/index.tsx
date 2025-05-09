import React, { useEffect } from 'react';
import { EditorContainer } from './styled';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import FallbackImageExtension from './FallbackImageExtension';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-light.css';
import LiquidExtension from './LiquidExtension';
import { createLiquidMentionExtension } from './LiquidMention';
import MenuBar from './MenuBar';
import { updateLatestEditorContent } from './liquidVariablesData';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import BackgroundColor from './BackgroundColorExtension';
import GeneralInlineStyleExtension from './GeneralInlineStyleExtension';
import { CustomNodeExtensions } from './CustomNodeExtension';
import ExtendedHTMLExtension from './ExtendedHtmlExtension';
import SpanMark from './SpanExtension';
import BackgroundSpanNode from './BackgroundSpanExtension';

const lowlight = createLowlight(common);
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('css', css);
lowlight.register('html', html);

interface RichTextEditorProps {
  value: string;
  valueDefault?: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TiptapEditor: React.FC<RichTextEditorProps> = ({ value, valueDefault = '', disabled, onChange, onFocus, onBlur }) => {
  useEffect(() => {
    updateLatestEditorContent(value);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'custom-link',
        },
        validate: (href: string) => /^https?:\/\//.test(href),
      }),
      FallbackImageExtension,
      Underline,
      LiquidExtension,
      createLiquidMentionExtension(value, valueDefault, disabled),
      TextStyle.configure({
        HTMLAttributes: {
          class: 'text-style',
        },
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      BackgroundColor,
      GeneralInlineStyleExtension,
      BackgroundSpanNode,
      SpanMark,
      ...CustomNodeExtensions,
      ExtendedHTMLExtension,
    ],
    content: value,
    editable: !disabled,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      if (disabled) return;
      const html = editor.getHTML();
      updateLatestEditorContent(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
      updateLatestEditorContent(value);
    }
  }, [value, editor]);

  return (
    <EditorContainer>
      {!disabled ? (
        <MenuBar editor={editor} />
      ) : (
        <div className="bg-white h-[41px] border-t-0 border-b border-l-0 border-r-0 border-solid border-[#E3E3E3] fake-toolbar"></div>
      )}
      <EditorContent editor={editor} className="editor-content" onFocus={!disabled ? onFocus : undefined} onBlur={!disabled ? onBlur : undefined} />
    </EditorContainer>
  );
};

export default TiptapEditor;
