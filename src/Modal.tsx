import React from 'react';
import PromiseModal, { openModal } from './PromiseModal';

const Modal: React.FC = () => {
  const handleShowModal = async (): Promise<void> => {
    try {
      // This will now properly trigger the modal to appear
      const result = await openModal({
        title: "Delete Confirmation",
        message: "Are you sure you want to delete this item?",
        confirmText: "Delete",
        cancelText: "Keep"
      });
      
      console.log("User confirmed:", result);
      // Perform your action here after confirmation
      
    } catch (error) {
      console.log("User cancelled:", error);
    }
  };

  return (
    <div className="p-8">
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleShowModal}
      >
        Delete Item
      </button>
      
      {/* Make sure this is included at the root level of your app */}
      <PromiseModal />
    </div>
  );
};

export default Modal;