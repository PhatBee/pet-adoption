"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  inputClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  inputClassName = "",
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <input
        type={type}
        id={name}
        {...register(name, {
          valueAsNumber: type === "number" ? true : undefined,
        })}
        {...rest}
        className={`mt-1 block w-full rounded-md border ${
          errorMessage ? "border-red-500" : "border-gray-300"
        } shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ${inputClassName}`}
      />

      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormInput;
