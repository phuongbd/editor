import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

const liquidVariableRegex = /(\{\{\s*[^{}]+?\s*\}\})/g;
const liquidTagRegex = /(\{%\s*[^{}]+?\s*%\})/g;

interface LiquidRange {
  start: number;
  end: number;
  text: string;
}

export const LiquidExtension = Extension.create({
  name: 'liquid',

  addProseMirrorPlugins() {
    const decorationPlugin = new Plugin({
      key: new PluginKey('liquid-decorations'),
      props: {
        decorations(state) {
          const { doc } = state;
          const decorations: Decoration[] = [];

          doc.descendants((node, pos) => {
            if (!node.isText) return;

            const text = node.text || '';

            liquidVariableRegex.lastIndex = 0;
            liquidTagRegex.lastIndex = 0;

            let match: RegExpExecArray | null;
            while ((match = liquidVariableRegex.exec(text)) !== null) {
              const from = pos + match.index;
              const to = from + match[0].length;

              decorations.push(
                Decoration.inline(from, to, {
                  class: 'liquid-variable',
                })
              );
            }

            liquidTagRegex.lastIndex = 0;
            while ((match = liquidTagRegex.exec(text)) !== null) {
              const from = pos + match.index;
              const to = from + match[0].length;

              decorations.push(
                Decoration.inline(from, to, {
                  class: 'liquid-tag',
                })
              );
            }
          });

          return DecorationSet.create(doc, decorations);
        },
      },
    });

    const findLiquidVariables = (doc: Node, from: number, to: number): LiquidRange[] => {
      const ranges: LiquidRange[] = [];

      doc.nodesBetween(from, to, (node: Node, pos: number) => {
        if (!node.isText) return;

        const text = node.text || '';

        liquidVariableRegex.lastIndex = 0;
        let match;
        while ((match = liquidVariableRegex.exec(text)) !== null) {
          ranges.push({
            start: pos + match.index,
            end: pos + match.index + match[0].length,
            text: match[0],
          });
        }

        liquidTagRegex.lastIndex = 0;
        while ((match = liquidTagRegex.exec(text)) !== null) {
          ranges.push({
            start: pos + match.index,
            end: pos + match.index + match[0].length,
            text: match[0],
          });
        }
      });

      return ranges;
    };

    const positionInLiquid = (doc: Node, pos: number): LiquidRange | null => {
      const from = Math.max(0, pos - 20);
      const to = Math.min(doc.content.size, pos + 20);

      const ranges = findLiquidVariables(doc, from, to);

      for (const range of ranges) {
        if (pos >= range.start && pos <= range.end) {
          return range;
        }
      }

      return null;
    };

    const keyboardPlugin = new Plugin({
      props: {
        handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
          if (event.key !== 'Backspace' && event.key !== 'Delete') {
            return false;
          }

          const { state } = view;
          const { selection, doc } = state;
          const { from, to, empty } = selection;

          if (!empty) {
            const selectionRanges = findLiquidVariables(doc, from, to);
            if (selectionRanges.length > 0) {
              let newFrom = from;
              let newTo = to;

              for (const range of selectionRanges) {
                if (range.start < newFrom && range.end > from) {
                  newFrom = range.start;
                }
                if (range.end > newTo && range.start < to) {
                  newTo = range.end;
                }
              }

              if (newFrom !== from || newTo !== to) {
                view.dispatch(state.tr.delete(newFrom, newTo));
                return true;
              }
            }
            return false;
          }

          if (event.key === 'Backspace' && from > 0) {
            const pos = from - 1;
            const liquid = positionInLiquid(doc, pos);

            if (liquid) {
              view.dispatch(state.tr.delete(liquid.start, liquid.end));
              return true;
            }
          }

          if (event.key === 'Delete') {
            const liquid = positionInLiquid(doc, from);

            if (liquid) {
              view.dispatch(state.tr.delete(liquid.start, liquid.end));
              return true;
            }
          }

          return false;
        },
      },
    });

    const preventClickPlugin = new Plugin({
      props: {
        handleClick: (view, pos, event) => {
          const { doc } = view.state;
          const liquid = positionInLiquid(doc, pos);

          if (liquid) {
            const tr = view.state.tr;
            tr.setSelection(TextSelection.create(doc, pos));
            view.dispatch(tr);
            return true;
          }

          return false;
        },
        handleDOMEvents: {
          mousedown: (view, event) => {
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (pos) {
              const { doc } = view.state;
              const liquid = positionInLiquid(doc, pos.pos);

              if (liquid) {
                const tr = view.state.tr;
                tr.setSelection(TextSelection.create(doc, pos.pos));
                view.dispatch(tr);
                return true;
              }
            }
            return false;
          },
        },
      },
    });

    return [decorationPlugin, keyboardPlugin, preventClickPlugin];
  },
});

export default LiquidExtension;
