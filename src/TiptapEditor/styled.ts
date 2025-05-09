import styled from 'styled-components';

export const EditorContainer = styled.div`
  overflow: hidden;

  .primary-toolbar-row,
  .secondary-toolbar-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .secondary-toolbar-row {
    margin-top: 4px;
  }

  .menuBar {
    border-bottom: 1px solid #ddd;
    background-color: #fff;
    position: relative;

    .toolbar-wrapper {
      display: flex;
      flex-wrap: wrap;
      padding: 5px;
      width: calc(100% - 50px);
    }

    button {
      &.toolbar-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 5px 10px;
        margin-right: 2px;
        border-radius: 3px;

        &.heading {
          font-weight: bold;
          font-size: 16px;
        }

        &:hover {
          background-color: #e9ecef;
        }

        &.is-active {
          background-color: #e9ecef;
          color: #1a73e8;
        }
      }

      &.unlink-button {
        position: relative;
        &:before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background-color: var(--p-color-icon);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .dropdown-container {
      position: relative;

      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 10;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        min-width: 200px;

        &.color-picker-menu {
          display: flex;
          flex-wrap: wrap;
          padding: 8px;
          min-width: 120px;

          .color-item {
            padding: 5px;
            margin: 2px;
            border-radius: 3px;

            &.is-active {
              background-color: #e9ecef;

              .color-swatch {
                box-shadow: 0 0 0 2px #1a73e8;
              }
            }

            &:hover {
              background-color: #f0f0f0;
            }

            .color-swatch {
              transition: all 0.2s ease;

              &.no-color {
                position: relative;
                border: 1px solid #ccc;
                width: 20px;
                height: 20px;
                display: block;
                border-radius: 3px;

                .slash-line {
                  position: absolute;
                  width: 24px;
                  height: 2px;
                  background-color: #f44336;
                  top: 9px;
                  left: -2px;
                  transform: rotate(45deg);
                }
              }
            }
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: 8px 12px;

          span {
            margin-left: 8px;
          }

          &:hover {
            background-color: #f0f0f0;
          }
        }
      }
    }

    .color-picker-container {
      display: flex;
      align-items: center;
      position: relative;

      .color-input {
        position: absolute;
        width: 0;
        height: 0;
        padding: 0;
        border: 0;
        opacity: 0;
        pointer-events: none;

        &:focus {
          outline: none;
        }
      }
    }

    .emoji-picker-container {
      position: relative;

      .emoji-picker-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 10;
        max-height: 400px;
        overflow-y: auto;

        @media (max-width: 768px) {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-height: 80vh;
          max-width: 90vw;
        }
      }
    }
  }

  .editor-content {
    padding: 15px;
    min-height: 200px;
    margin-bottom: 20px;
    height: 300px;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

    h1 a:hover {
      font-size: 30px;
      color: #333;
    }
    h1 a:active {
      font-size: 30px;
      color: #333;
    }
    h1 a:visited {
      font-size: 30px;
      color: #333;
    }
    a:hover {
      text-decoration: none;
    }
    a:active {
      text-decoration: none;
    }
    a:visited {
      text-decoration: none;
    }
    .button__text:hover {
      color: #fff;
      text-decoration: none;
    }
    .button__text:active {
      color: #fff;
      text-decoration: none;
    }
    .button__text:visited {
      color: #fff;
      text-decoration: none;
    }
    a:hover {
      color: #1990c6;
    }
    a:active {
      color: #1990c6;
    }
    a:visited {
      color: #1990c6;
    }
    @media (max-width: 600px) {
      .container {
        width: 94% !important;
      }
      .main-action-cell {
        float: none !important;
        margin-right: 0 !important;
      }
      .secondary-action-cell {
        text-align: center;
        width: 100%;
      }
      .header {
        margin-top: 20px !important;
        margin-bottom: 2px !important;
      }
      .shop-name__cell {
        display: block;
      }
      .order-number__cell {
        display: block;
        text-align: left !important;
        margin-top: 20px;
      }
      .po-number__cell {
        display: block;
        text-align: left !important;
        margin-top: 5px;
      }
      .button {
        width: 100%;
      }
      .or {
        margin-right: 0 !important;
      }
      .apple-wallet-button {
        text-align: center;
      }
      .customer-info__item {
        display: block;
        width: 100% !important;
      }
      .spacer {
        display: none;
      }
      .subtotal-spacer {
        display: none;
      }
      .return__mobile-padding {
        margin-top: 19px;
        padding-top: 19px;
      }
    }

    .ProseMirror {
      outline: none;
      height: 100%;

      p {
        margin: 0.5em 0;
      }

      /* Text alignment */
      .text-left {
        text-align: left;
      }

      .text-center {
        text-align: center;
      }

      .text-right {
        text-align: right;
      }

      .text-justify {
        text-align: justify;
      }

      /* Heading styles */
      h1 {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
        margin: 4px;
        color: #333;
      }

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.25;
        margin: 4px;
        color: #333;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 4px;
        color: #333;
      }

      h4 {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.35;
        margin: 4px;
        color: #333;
      }

      h5 {
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.4;
        margin: 4px;
        color: #333;
      }

      h6 {
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.4;
        margin: 4px;
        color: #333;
      }

      .liquid-variable {
        padding: 1px 3px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 12px;
        background: var(--Backgrounds-bg-fill-tertiary, #e3e3e3);
        color: var(--Text-text-secondary, #616161);
        margin: 2px 2px;
        pointer-events: none;
        user-select: none;
        -webkit-user-modify: read-only;
        -moz-user-modify: read-only;
        -ms-user-modify: read-only;
        cursor: default;
        text-transform: lowercase;
        display: inline-block;
      }

      p:has(> span.liquid-tag:only-child) {
        display: none;
      }

      .liquid-tag {
        display: none;
        width: 0;
        height: 0;
        overflow: hidden;
        position: absolute;
        opacity: 0;
      }

      table {
        border-collapse: collapse;
        margin: 0;
        table-layout: fixed;
        width: 100%;
        min-width: 668px;

        td,
        th {
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;

          &.selectedCell:after {
            background: rgba(200, 200, 255, 0.4);
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
          }
        }

        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
      }

      pre {
        background: #f8f9fa;
        border-radius: 3px;
        padding: 10px;
        font-family: monospace;
        overflow-x: auto;
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        display: block;
        margin: 1em 0;

        &.ProseMirror-selectednode {
          outline: 2px solid #1a73e8;
        }

        &[src='/images/default_thumbnail.png'] {
          max-width: 40px;
          object-fit: contain;
          margin: 4px 0;
        }
      }

      .mention {
        padding: 1px 3px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 12px;
        background: var(--Backgrounds-bg-fill-tertiary, #e3e3e3);
        color: var(--Text-text-secondary, #616161);
        margin: 0 2px;
        pointer-events: none;
        user-select: none;
        -webkit-user-modify: read-only;
        -moz-user-modify: read-only;
        -ms-user-modify: read-only;
        cursor: default;
        text-transform: lowercase;

        /* We don't need these pseudo-elements anymore since we're using renderLabel */
        &::before,
        &::after {
          content: none;
        }
      }

      /* Link styling */
      .custom-link {
        color: #1a73e8;
        text-decoration: underline;
        cursor: pointer;

        &:hover {
          color: #1558b7;
          text-decoration: underline;
        }
      }
    }
  }

  .emoji-picker-wrapper {
    padding: 8px;
    max-height: 350px;
    overflow-y: auto;

    @media (max-width: 768px) {
      max-height: 300px;
      width: calc(100vw - 32px);
      max-width: 320px;
    }
  }
`;

export const SuggestionList = styled.div`
  background: white;
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);
  padding: 0.2rem;
  margin-top: 0.5rem;
  max-height: 20rem;
  overflow-y: auto;
  z-index: 1000;
`;

export const SuggestionItem = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${(props) => (props.active ? '#edf2fc' : 'transparent')};
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #edf2fc;
  }
`;

export const Avatar = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  background-image: ${(props) => (props.src ? `url(${props.src})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
  font-size: 14px;
`;

export const UserName = styled.span`
  font-size: 14px;
  color: #333;
`;

export const SuggestionListVariant = styled.div`
  background: white;
  max-height: 240px;
  width: 240px;
  overflow-y: auto;
  z-index: 1000;
  padding: 6px;
  font-size: 12px !important;
  line-height: 1.5 !important;
  border-radius: 6px;
  box-shadow:
    1px 0px 0px 0px rgba(0, 0, 0, 0.13) inset,
    -1px 0px 0px 0px rgba(0, 0, 0, 0.13) inset,
    0px -1px 0px 0px rgba(0, 0, 0, 0.17) inset,
    0px 1px 0px 0px rgba(204, 204, 204, 0.5) inset,
    0px 1px 0px 0px rgba(26, 26, 26, 0.07);
  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
`;

export const SuggestionItemVariant = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border: none;
  border-radius: 4px;
  padding: 6px;
  margin: 0;
  text-align: left;
  cursor: pointer;
  background: transparent;

  &:hover {
    background: #f9fafb;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;

  &:hover {
    color: #333;
  }
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 16px;
`;

export const Tab = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? '#1a73e8' : 'transparent')};
  color: ${(props) => (props.active ? '#1a73e8' : '#666')};
  padding: 8px 16px;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? '600' : 'normal')};

  &:hover {
    color: #1a73e8;
  }
`;

export const FormField = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

export const FileInput = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1a73e8;
  }

  input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

export const FileInputText = styled.div`
  text-align: center;
  color: #666;

  i {
    font-size: 32px;
    color: #999;
    margin-bottom: 8px;
  }
`;

export const Preview = styled.div`
  margin-top: 16px;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
