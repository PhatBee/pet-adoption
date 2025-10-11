import React from 'react';

export default function AddressModal({ isOpen, onClose, title, children }) {
  // If the modal isn't open, don't render anything to the screen.
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Backdrop: The dark, semi-transparent background.
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose} // Close modal if user clicks outside
    >
      
      {/* Modal Content */}
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times; {/* This is an 'X' symbol for closing */}
          </button>
        </div>
        
        {/* The AddressForm will be placed here as 'children' */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}