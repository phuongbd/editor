import { Image } from '@tiptap/extension-image';

const FallbackImageExtension = Image.extend({
  name: 'fallbackImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src'),
        renderHTML: (attributes: { src: string | null }) => {
          if (!attributes.src) {
            return {};
          }

          return {
            src: attributes.src,
            'data-transcy-src': attributes.src,
            onerror: `this.onerror=null; this.src='/images/default_thumbnail.png';`,
          };
        },
      },
    };
  },
});

export default FallbackImageExtension;
