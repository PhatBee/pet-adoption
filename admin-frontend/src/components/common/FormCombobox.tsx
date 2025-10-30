"use client";

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { GroupBase, Props as SelectProps } from 'react-select';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface FormComboboxProps extends Omit<SelectProps<ComboboxOption, true, GroupBase<ComboboxOption>>, 'options'> {
  name: string;
  label: string;
  options: ComboboxOption[]
  isLoading?: boolean;
}

const FormCombobox: React.FC<FormComboboxProps> = ({
  name,
  label,
  options,
  isLoading,
  ...rest
}) => {
  const { control, formState: { errors } } = useFormContext();
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {

          const valueAsObjects = options.filter(opt =>
            field.value?.includes(opt.value)
          );

          return (
            <Select
              {...field}
              id={name}
              isMulti // Cho phép chọn nhiều
              isClearable
              options={options}
              isLoading={isLoading}
              value={valueAsObjects} // Giá trị (dạng object)
              onChange={(selectedOptions) => {

                const selectedValues = selectedOptions.map(opt => opt.value);
                field.onChange(selectedValues);
              }}
              classNamePrefix="react-select" // Cho phép styling
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: errorMessage ? '#EF4444' : (state.isFocused ? '#6366F1' : '#D1D5DB'),
                  boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : 'none',
                  '&:hover': {
                    borderColor: state.isFocused ? '#6366F1' : '#D1D5DB',
                  }
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#EEF2FF', //
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#4338CA',
                }),
              }}
              {...rest}
            />
          );
        }}
      />

      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormCombobox;