import React from "react";

export default function QuantitySelector({ value, onChange, min = 1, max = 999 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-center border rounded overflow-hidden">
      <button onClick={dec} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value) || min;
          if (v < min) onChange(min);
          else if (v > max) onChange(max);
          else onChange(v);
        }}
        className="w-16 text-center outline-none p-1"
      />
      <button onClick={inc} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
    </div>
  );
}
