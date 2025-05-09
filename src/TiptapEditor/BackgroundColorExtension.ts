import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    backgroundColor: {
      /**
       * Set background color
       */
      setBackgroundColor: (color: string) => ReturnType;
      /**
       * Unset background color
       */
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

interface BackgroundColorOptions {
  types: string[];
}

const BackgroundColor = Extension.create<BackgroundColorOptions>({
  name: 'backgroundColor',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.backgroundColor) {
                return {};
              }

              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBackgroundColor:
        (color: string) =>
        ({ chain }: { chain: () => any }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: color })
            .run();
        },
      unsetBackgroundColor:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

export default BackgroundColor;
