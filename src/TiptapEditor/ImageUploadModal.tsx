import React, { useState, useRef, useCallback } from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Title,
  CloseButton,
  TabContainer,
  Tab,
  FormField,
  Label,
  FileInput,
  FileInputText,
  Preview,
  ButtonRow,
} from './styled';
import { Button, ButtonGroup, TextField } from '@shopify/polaris';
import apiCommon from '@/api';
interface ImageUploadModalProps {
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ onClose, onImageSelected }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return false;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size should not exceed 10MB');
      return false;
    }

    return true;
  };

  const handleUpload = useCallback(async (file: File) => {
    const resGet = await apiCommon.getPreSignedUploadFile({
      file_name: file.name,
    });

    await apiCommon.uploadFileForEditor(resGet.data.pre_signed, file);
    return resGet.data.file_path;
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (!validateFile(file)) return;
      try {
        const blobInfo = await handleUpload(file);
        if (blobInfo) {
          setPreviewUrl(blobInfo);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
      return;
    }
  };

  const handleUrlChange = (value: string) => {
    setImageUrl(value);
    if (value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl('');
    }
  };

  const handleInsert = () => {
    if (activeTab === 'url' && imageUrl) {
      onImageSelected(imageUrl);
      onClose();
    } else if (activeTab === 'upload' && previewUrl) {
      onImageSelected(previewUrl);
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Insert Image</Title>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
            Upload Image
          </Tab>
          <Tab active={activeTab === 'url'} onClick={() => setActiveTab('url')}>
            Image URL
          </Tab>
        </TabContainer>

        {activeTab === 'upload' && (
          <FormField>
            <Label>Upload an image</Label>
            <FileInput>
              <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
              <FileInputText>
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Click to browse</p>
              </FileInputText>
            </FileInput>
          </FormField>
        )}

        {activeTab === 'url' && (
          <div className="mb-6">
            <TextField label="Image URL" value={imageUrl} onChange={handleUrlChange} placeholder="https://example.com/image.jpg" autoComplete="off" />
          </div>
        )}

        {activeTab === 'upload' && (
          <>
            {isLoading && (
              <Preview>
                <div style={{ padding: '30px', textAlign: 'center' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1a73e8' }}></i>
                  <p>Loading image...</p>
                </div>
              </Preview>
            )}

            {previewUrl && !isLoading && (
              <Preview>
                <img src={previewUrl} alt="Preview" />
              </Preview>
            )}
          </>
        )}

        <ButtonRow>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleInsert}
              disabled={isLoading || (activeTab === 'url' && !imageUrl) || (activeTab === 'upload' && !previewUrl)}
            >
              {isLoading ? 'Loading...' : 'Insert Image'}
            </Button>
          </ButtonGroup>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageUploadModal;
