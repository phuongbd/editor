import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { GetReferenceClientRect, Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { LiquidVariablesList } from './LiquidVariablesList';
import { filterLiquidVariables } from './liquidVariablesData';
import { Editor } from '@tiptap/core';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';

interface LiquidVariablesListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const createLiquidMentionExtension = (editorValue: string, editorValueDefault: string, disabled?: boolean) => {
  return Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      char: '{{',
      items: ({ query }: { query: string }) => {
        return filterLiquidVariables(query, editorValue, editorValueDefault);
      },
      render: () => {
        let reactRenderer: ReactRenderer;
        let popup: Instance[] = [];

        const createClientRect = (rect: DOMRect | null): DOMRect => {
          if (rect) return rect;
          return new DOMRect(0, 0, 0, 0);
        };

        return {
          onStart: (props: SuggestionProps) => {
            if (disabled) {
              return;
            }

            const clientRectFn = props.clientRect;
            if (!clientRectFn) {
              return;
            }

            reactRenderer = new ReactRenderer(LiquidVariablesList, {
              props,
              editor: props.editor,
            });

            const getClientRectFn: GetReferenceClientRect = () => {
              return createClientRect(clientRectFn());
            };

            popup = tippy('body', {
              getReferenceClientRect: getClientRectFn,
              appendTo: () => document.body,
              content: reactRenderer.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },
          onUpdate: (props: SuggestionProps) => {
            if (disabled) {
              if (popup[0]) {
                popup[0].hide();
              }
              return;
            }

            reactRenderer.updateProps(props);

            const clientRectFn = props.clientRect;
            if (!clientRectFn) {
              return;
            }

            const getClientRectFn: GetReferenceClientRect = () => {
              return createClientRect(clientRectFn());
            };

            if (popup[0]) {
              popup[0].setProps({
                getReferenceClientRect: getClientRectFn,
              });
            }
          },
          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (disabled) {
              return false;
            }

            if (!popup[0]) {
              return false;
            }

            if (props.event.key === 'Escape') {
              popup[0].hide();
              return true;
            }

            const ref = reactRenderer?.ref as LiquidVariablesListRef | undefined;
            if (ref?.onKeyDown) {
              return ref.onKeyDown(props.event);
            }

            return false;
          },
          onExit: () => {
            if (popup[0]) {
              popup[0].destroy();
            }
            if (reactRenderer) {
              reactRenderer.destroy();
            }
          },
        };
      },
    },
  });
};
