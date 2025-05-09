import { Node, mergeAttributes } from '@tiptap/core';

export const BackgroundSpanNode = Node.create({
  name: 'backgroundSpan',
  
  // Để có thể sử dụng trong inline content
  inline: true,
  
  // Priority cao để xử lý trước các nodes khác
  priority: 1000,
  
  // Có thể chứa các nội dung inline khác
  content: 'inline*',
  
  // Đánh dấu rằng là một node đặc biệt khi phân tích HTML
  group: 'inline',
  
  parseHTML() {
    return [
      {
        tag: 'span[style*="background-color"]',
        priority: 100,
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
    };
  },
});

export default BackgroundSpanNode; 