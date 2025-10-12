import React, { useState, useEffect } from "react";

export default function QuantitySelector({ value, onChange, min = 1, max = 999 }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const dec = () => handleChange(localValue - 1);
  const inc = () => handleChange(localValue + 1);

  return (
    <div className="inline-flex items-center">
      <button 
        onClick={dec}
        disabled={localValue <= min}
        className={`w-10 h-10 rounded-l border flex items-center justify-center transition-all duration-200
          ${localValue <= min 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600'
          }`}
      >
        <span className="text-xl font-medium">−</span>
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        value={localValue}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            handleChange(val);
          }
        }}
        className="w-16 h-10 border-t border-b text-center text-gray-700 text-lg font-medium focus:outline-none"
      />
      
      <button 
        onClick={inc}
        disabled={localValue >= max}
        className={`w-10 h-10 rounded-r border flex items-center justify-center transition-all duration-200
          ${localValue >= max 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600'
          }`}
      >
        <span className="text-xl font-medium">+</span>
      </button>
    </div>
  );
}