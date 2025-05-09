import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const ExtendedHTMLExtension = Extension.create({
  name: 'extendedHTML',

  addProseMirrorPlugins() {
    const preserveStyles = new Plugin({
      key: new PluginKey('preserveStyles'),

      appendTransaction: (transactions, oldState, newState) => {
        if (!transactions.some((tr) => tr.docChanged)) return null;

        const tr = newState.tr;
        let modified = false;

        newState.doc.descendants((node, pos) => {
          if (node.type.name !== 'text' && node.attrs && node.attrs.style) {
            const newAttrs = { ...node.attrs };
            modified = true;
            tr.setNodeMarkup(pos, undefined, newAttrs);
          }
        });

        return modified ? tr : null;
      },
    });

    const pasteHandler = new Plugin({
      key: new PluginKey('pasteHandler'),
      props: {
        handlePaste: (view, event) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return false;

          const html = clipboardData.getData('text/html');
          if (!html) return false;

          return false;
        },
      },
    });

    return [preserveStyles, pasteHandler];
  },
});

export default ExtendedHTMLExtension;
