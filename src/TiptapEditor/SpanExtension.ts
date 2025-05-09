import { Mark, mergeAttributes } from '@tiptap/core';

export const SpanMark = Mark.create({
  name: 'span',
  
  priority: 1000,
  
  inclusive: false,
  
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node: string | HTMLElement) => {
          if (typeof node === 'string') return {};
          const element = node as HTMLElement;
          
          if (element.style.backgroundColor) {
            return { 
              priority: true,
              'data-has-bg-color': 'true'
            };
          }
          
          return {};
        }
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
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
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.class) {
            return {};
          }
          return {
            class: attributes.class,
          };
        },
      },
      'data-has-bg-color': {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor ? 'true' : null,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes['data-has-bg-color']) {
            return {};
          }
          return { 'data-has-bg-color': attributes['data-has-bg-color'] };
        },
      },
    };
  },
});

export default SpanMark; 