import React from 'react';

const CustomAlert = ({ message, type, onClose }) => {
  const alertTypeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`fixed top-[90px] right-4 p-4 rounded shadow-lg text-white ${alertTypeStyles[type]}`}
         role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
    </div>
  );
};

export default CustomAlert;
