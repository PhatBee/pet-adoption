import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import productApi from '../../store/api/productApi';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  name: 'thumbnail' | 'images';
  label: string;
  isMultiple?: boolean;
}

const ImageUploadSection: React.FC<ImageUploadProps> = ({ name, label, isMultiple = false }) => {
  const { setValue, watch } = useFormContext();
  const currentFiles = watch(name) as string | string[];
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedPaths: string[] = [];

    try {
      if (isMultiple && name === 'images') {

      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const result = await productApi.uploadMultipleImages(formData);
      const newPaths = result.map(r => r.filePath);

      const existing = Array.isArray(currentFiles) ? currentFiles : [];
      setValue(name, [...existing, ...newPaths]);
      toast.success(`Đã tải lên ${newPaths.length} hình ảnh.`);

      } else {
        const result = await productApi.uploadSingleImage(files[0]);
        setValue(name, result.filePath);
        toast.success('Tải lên ảnh thumbnail thành công.');
      }
    } catch (error) {
      toast.error('Lỗi khi tải lên hình ảnh.');
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };
  
  const handleRemoveImage = (pathToRemove: string) => {
    if (isMultiple) {
        setValue(name, (currentFiles as string[]).filter(p => p !== pathToRemove));
    } else {
        setValue(name, '');
    }
  }

  return (
    <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Input File */}
      <input
        type="file"
        multiple={isMultiple}
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-50 file:text-indigo-700
                   hover:file:bg-indigo-100"
      />
      {isUploading && <p className="mt-2 text-sm text-indigo-600">Đang tải lên...</p>}

      {/* Preview Section */}
      <div className="mt-4 flex flex-wrap gap-3">
        {(Array.isArray(currentFiles) ? currentFiles : (currentFiles ? [currentFiles] : [])).map((path, index) => (
          <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group shadow-md">
            <img 
              src={`${path}`}
              alt={`Ảnh ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(path)}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadSection;