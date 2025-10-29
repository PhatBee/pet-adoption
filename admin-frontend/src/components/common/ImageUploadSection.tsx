import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import FormInput from './FormInput';

interface ImageUploadProps {
  name: 'thumbnail' | 'images';
  label: string;
}

const ImageUploadSection: React.FC<ImageUploadProps> = ({ name, label }) => {
  const { control, watch, setValue, register, formState: { errors } } = useFormContext();
  const currentThumbnail = watch('thumbnail') as string | null;
  const watchedImages = watch("images") || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddImageUrl = () => {
    if (newImageUrl && newImageUrl.trim() !== '') {
      if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
        toast.error('URL hình ảnh không hợp lệ.');
        return;
      }
      append({ value: newImageUrl });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    remove(index);
  };

  if (name === 'thumbnail') {
    return (
      <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
        <FormInput
          label={label}
          name="thumbnail"
          type="url"
          placeholder="https://example.com/image.jpg"
        />
        {currentThumbnail && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Xem trước Thumbnail:</p>
            <div className="relative w-24 h-24 border rounded-lg overflow-hidden group shadow-md">
              <img
                src={currentThumbnail}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!e.currentTarget.src.includes('placeholder-image.png')) {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setValue('thumbnail', '')}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove thumbnail"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (name === 'images') {
    return (
      <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Dán URL hình ảnh vào đây..."
            className="flex-grow block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition duration-150 shadow-sm"
          >
            Thêm ảnh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className="relative w-24 h-24 border rounded-lg overflow-hidden group shadow-md">
              <input
                {...register(`images.${index}.value`)}
                type="hidden"
              />
              <img
                src={watchedImages[index]?.value || '/placeholder-image.png'}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        {errors.images?.message && (
          <p className="mt-2 text-xs text-red-500">{errors.images.message as string}</p>
        )}
      </div>
    );
  }

  return null;
};

export default ImageUploadSection;