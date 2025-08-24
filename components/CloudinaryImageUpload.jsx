import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const CloudinaryImageUpload = ({ onImageUpload, currentImage, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadToCloudinary = useCallback(async (file) => {
    if (!file) return null;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP)');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'trade_images');
    
    // Optional: Add folder organization
    formData.append('folder', 'trade_journal');
    
    // Optional: Add transformation for optimization
    formData.append('transformation', 'c_limit,w_1200,h_1200,q_auto,f_auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  }, []);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    setUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadToCloudinary(file);
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
      // Reset input value to allow re-selecting the same file
      event.target.value = '';
    }
  }, [uploadToCloudinary, onImageUpload, disabled]);

  const handleRemoveImage = useCallback(() => {
    if (disabled) return;
    onImageUpload(null);
    setUploadError(null);
  }, [onImageUpload, disabled]);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadToCloudinary(file);
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  }, [uploadToCloudinary, onImageUpload, disabled]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="relative">
      {currentImage ? (
        <div className="relative group">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-600">
            <img 
              src={currentImage} 
              alt="Trade screenshot"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-full h-full hidden items-center justify-center bg-gray-800 text-gray-400"
              style={{ display: 'none' }}
            >
              <ImageIcon className="w-6 h-6" />
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            disabled 
              ? 'border-gray-600 bg-gray-800 cursor-not-allowed' 
              : 'border-gray-500 hover:border-gray-400 bg-gray-800/50 hover:bg-gray-800 cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400" />
          ) : (
            <Upload className={`w-6 h-6 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
          )}
        </div>
      )}
      
      {uploadError && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded whitespace-nowrap z-10">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;