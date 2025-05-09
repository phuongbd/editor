import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    generalInlineStyle: {
      /**
       * Set general inline style
       */
      setGeneralInlineStyle: (style: string) => ReturnType;
      /**
       * Unset general inline style
       */
      unsetGeneralInlineStyle: () => ReturnType;
    };
  }
}

interface GeneralInlineStyleOptions {
  types: string[];
}

const GeneralInlineStyleExtension = Extension.create<GeneralInlineStyleOptions>({
  name: 'generalInlineStyle',

  addOptions() {
    return {
      types: [
        'textStyle',
        'paragraph',
        'heading',
        'bulletList',
        'orderedList',
        'listItem',
        'bold',
        'italic',
        'underline',
        'strike',
        'link',
        'code',
        'codeBlock',
        'blockquote',
        'image',
        'span',
      ],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          style: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('style'),
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.style) {
                return {};
              }

              return {
                style: attributes.style,
              };
            },
          },
        },
      },
    ];
  },
});

export default GeneralInlineStyleExtension;
