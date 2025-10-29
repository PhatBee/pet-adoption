import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Option {
    label: string;
    value: string | number;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, name, options, placeholder = 'Chọn...' }) => {
  const { register, formState: { errors } } = useFormContext();
  const errorMessage = errors[name]?.message as string;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`mt-1 block w-full rounded-md border ${
          errorMessage ? 'border-red-500' : 'border-gray-300'
        } shadow-sm p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormSelect;