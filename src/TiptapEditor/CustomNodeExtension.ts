import { Node as NodeExtension, Mark, mergeAttributes } from '@tiptap/core';

interface CustomNodeOptions {
  HTMLAttributes: Record<string, any>;
}

export const CustomNodeExtensions = [
  NodeExtension.create<CustomNodeOptions>({
    name: 'customBox',
    group: 'block',
    content: 'block+',
    draggable: true,

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    parseHTML() {
      return [
        {
          tag: 'div[data-type="custom-box"]',
        },
      ];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
      return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'custom-box' }), 0];
    },

    addAttributes() {
      return {
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
      };
    },
  }),

  NodeExtension.create<CustomNodeOptions>({
    name: 'customContainer',
    group: 'block',
    content: 'block+',
    draggable: true,

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    parseHTML() {
      return [
        {
          tag: 'div[data-type="custom-container"]',
        },
      ];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
      return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'custom-container' }), 0];
    },

    addAttributes() {
      return {
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
      };
    },
  }),
];
