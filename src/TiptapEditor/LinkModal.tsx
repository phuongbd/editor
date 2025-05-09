import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { CloseButton, ModalOverlay, ModalContent, ModalHeader, Title, ButtonRow } from './styled';
import { BlockStack, Button, ButtonGroup, Checkbox, TextField } from '@shopify/polaris';

interface LinkModalProps {
  onClose: () => void;
  onLinkSubmit: (url: string, text: string, openInNewTab: boolean) => void;
  editor: Editor | null;
}

const LinkModal: React.FC<LinkModalProps> = ({ onClose, onLinkSubmit, editor }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      if (editor.isActive('link')) {
        setIsEditing(true);
        const attrs = editor.getAttributes('link');
        setUrl(attrs.href || '');
        setText(selectedText || '');
        setOpenInNewTab(attrs.target === '_blank');
      } else if (selectedText) {
        setText(selectedText);
      }
    }
  }, [editor]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };

  const handleTextChange = (value: string) => {
    setText(value);
  };

  const handleOpenInNewTabChange = (newChecked: boolean) => {
    setOpenInNewTab(newChecked);
  };

  const handleSubmit = () => {
    if (url) {
      onLinkSubmit(url, text, openInNewTab);
    }
  };

  const handleRemoveLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
      onClose();
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <Title>{isEditing ? 'Edit Link' : 'Insert Link'}</Title>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <BlockStack gap="300">
          <TextField label="URL" value={url} onChange={handleUrlChange} placeholder="https://example.com" autoComplete="off" />

          <TextField label="Link text" value={text} onChange={handleTextChange} placeholder="Link text" autoComplete="off" />

          <Checkbox label="Open in new tab" checked={openInNewTab} onChange={handleOpenInNewTabChange} />

          <ButtonRow>
            <ButtonGroup>
              {isEditing && (
                <Button variant="plain" tone="critical" onClick={handleRemoveLink}>
                  Remove Link
                </Button>
              )}
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={!url}>
                {isEditing ? 'Update' : 'Insert'}
              </Button>
            </ButtonGroup>
          </ButtonRow>
        </BlockStack>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LinkModal;
