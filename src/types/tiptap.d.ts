declare module '@tiptap/extension-image' {
  import { Node } from '@tiptap/core';
  
  export interface ImageOptions {
    inline: boolean;
    allowBase64: boolean;
    HTMLAttributes: Record<string, any>;
  }
  
  export const Image: Node<ImageOptions>;
}

declare module '@tiptap/core' {
  export interface Node<Options = any> {
    name: string;
    options: Options;
    parent?: () => Record<string, any>;
    extend(options: Partial<Options> & Record<string, any>): Node;
  }

  export interface Extension<Options = any> {
    name: string;
    options: Options;
    extend(options: Partial<Options> & Record<string, any>): Extension;
  }

  export interface Mark<Options = any> {
    name: string;
    options: Options;
    extend(options: Partial<Options> & Record<string, any>): Mark;
  }

  export const Extension: {
    create<T>(config: {
      name: string;
      addOptions?(): Partial<T>;
      addGlobalAttributes?(): any[];
      addCommands?(): Record<string, any>;
      [key: string]: any;
    }): Extension<T> & {
      name: string;
      options: T;
      addOptions(): Partial<T>;
      addGlobalAttributes?(): any[];
      addCommands?(): Record<string, any>;
      [key: string]: any;
    };
  };

  export const Node: {
    create<T>(config: {
      name: string;
      group?: string;
      content?: string;
      draggable?: boolean;
      addOptions?(): Partial<T>;
      parseHTML?(): Array<any>;
      renderHTML?(props: { HTMLAttributes: Record<string, any> }): any;
      addAttributes?(): Record<string, any>;
      [key: string]: any;
    }): Node<T> & {
      name: string;
      options: T;
      group?: string;
      content?: string;
      draggable?: boolean;
      addOptions(): Partial<T>;
      parseHTML?(): Array<any>;
      renderHTML?(props: { HTMLAttributes: Record<string, any> }): any;
      addAttributes?(): Record<string, any>;
      [key: string]: any;
    };
  };

  export const Mark: {
    create<T extends Record<string, any>>(config: T): Mark<T>;
  };

  export function mergeAttributes(...objects: Record<string, any>[]): Record<string, any>;

  export interface EditorState {
    selection: {
      from: number;
      to: number;
    };
    doc: {
      textBetween(from: number, to: number, separator: string): string;
    };
  }

  export interface Editor {
    commands: Record<string, any>;
    chain(): ChainedCommands;
    getHTML(): string;
    state: EditorState;
    isActive(name: string | Record<string, any>, attrs?: Record<string, any>): boolean;
    getAttributes(name: string): Record<string, any>;
    can(): {
      addColumnBefore(): boolean;
      addColumnAfter(): boolean;
      deleteColumn(): boolean;
      addRowBefore(): boolean;
      addRowAfter(): boolean;
      deleteRow(): boolean;
      deleteTable(): boolean;
      [key: string]: () => boolean;
    };
  }

  export interface ChainedCommands {
    focus(): ChainedCommands;
    setImage(options: { src: string }): ChainedCommands;
    run(): boolean;
    [key: string]: any;
  }

  export interface Commands<ReturnType> {
    [key: string]: Record<string, any>;
  }
}

declare module '@tiptap/react' {
  import { Editor as CoreEditor } from '@tiptap/core';
  import React from 'react';
  
  export interface Editor extends CoreEditor {
    // Additional React-specific properties
  }

  export class ReactRenderer<T = any> {
    constructor(component: React.ComponentType<T>, props: Record<string, any>);
    updateProps(props: Record<string, any>): void;
    destroy(): void;
    element: HTMLElement;
    ref: any;
  }

  export interface EditorContentProps {
    editor: Editor | null;
    className?: string;
    onFocus?: () => void;
    onBlur?: () => void;
  }

  export const EditorContent: React.FC<EditorContentProps>;

  export interface UseEditorOptions {
    extensions: any[];
    content: string;
    editable: boolean;
    onUpdate?: (props: { editor: Editor }) => void;
    parseOptions?: {
      preserveWhitespace: 'full' | 'none';
    };
  }

  export function useEditor(options: UseEditorOptions): Editor | null;
}

declare module '@tiptap/suggestion' {
  import { Editor } from '@tiptap/core';

  export interface SuggestionKeyDownProps {
    event: KeyboardEvent;
  }

  export interface SuggestionProps {
    command: (props: any) => void;
    clientRect: () => DOMRect;
    items: any[];
    editor: Editor;
  }
} 