import React, { useState, useEffect, useCallback } from 'react';

// Define types for modal props
interface ModalProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

// Define the content state type
interface ModalContent {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

// Create an event system to trigger modal updates
type ModalEventListener = () => void;

// Singleton modal manager to handle modal promises
class ModalManager {
  private resolveCallback: ((value: unknown) => void) | null = null;
  private rejectCallback: ((reason?: any) => void) | null = null;
  private modalProps: ModalProps = {};
  private listeners: ModalEventListener[] = [];

  // Method to subscribe to modal state changes
  subscribe(listener: ModalEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners when modal state changes
  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  open(props: ModalProps = {}): Promise<unknown> {
    this.modalProps = props;
    
    const promise = new Promise((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
    });
    
    // Notify listeners that a new modal should be shown
    this.notify();
    
    return promise;
  }

  confirm(value: unknown): void {
    if (this.resolveCallback) {
      this.resolveCallback(value);
      this.reset();
    }
  }

  cancel(reason?: any): void {
    if (this.rejectCallback) {
      this.rejectCallback(reason);
      this.reset();
    }
  }

  reset(): void {
    this.resolveCallback = null;
    this.rejectCallback = null;
    this.modalProps = {};
    this.notify();
  }

  getProps(): ModalProps {
    return this.modalProps;
  }

  hasActiveModal(): boolean {
    return this.resolveCallback !== null;
  }
}

// Create a single instance
const modalManager = new ModalManager();

// Export the open modal function
export const openModal = (props?: ModalProps): Promise<unknown> => {
  return modalManager.open(props);
};

// Modal component that uses the manager
const PromiseModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const updateModalState = useCallback(() => {
    if (modalManager.hasActiveModal()) {
      const props = modalManager.getProps();
      
      setModalContent({
        title: props.title || 'Confirmation',
        message: props.message || 'Are you sure you want to proceed?',
        confirmText: props.confirmText || 'Confirm',
        cancelText: props.cancelText || 'Cancel'
      });
      
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  // Subscribe to modal manager changes
  useEffect(() => {
    // Initial check
    updateModalState();
    
    // Subscribe to changes
    const unsubscribe = modalManager.subscribe(updateModalState);
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, [updateModalState]);

  const handleConfirm = (): void => {
    modalManager.confirm(true);
  };

  const handleCancel = (): void => {
    modalManager.cancel('Modal was cancelled');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{modalContent.title}</h2>
        <p className="mb-6">{modalContent.message}</p>
        <div className="flex justify-end space-x-2">
          <button 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleCancel}
          >
            {modalContent.cancelText}
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleConfirm}
          >
            {modalContent.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromiseModal;