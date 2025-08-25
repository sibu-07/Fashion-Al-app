
import React, { useState, useCallback } from 'react';
import { CameraIcon } from './icons/Icons';

interface ImageUploaderProps {
  onImageChange: (file: File, base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPreview(reader.result as string);
        onImageChange(file, base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <label
        htmlFor="file-upload"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex justify-center w-full h-48 px-4 transition bg-white border-2 ${isDragging ? 'border-indigo-600' : 'border-gray-300'} border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-auto object-contain rounded-md" />
        ) : (
          <span className="flex flex-col items-center justify-center space-y-2 text-center">
            <CameraIcon className="w-10 h-10 text-gray-400" />
            <span className="font-medium text-gray-600">
              Drag & drop a file or{' '}
              <span className="text-indigo-600 underline">browse</span>
            </span>
             <span className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</span>
          </span>
        )}
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="sr-only"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
