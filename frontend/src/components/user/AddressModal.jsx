import React from 'react';

export default function AddressModal({ isOpen, onClose, title, children }) {
  // If the modal isn't open, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    // The Modal Backdrop (the dark, semi-transparent background)
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      
      {/* The Modal Content */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            &times; {/* This is an 'X' symbol for closing */}
          </button>
        </div>
        
        {/* The form or other content will be placed here */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}