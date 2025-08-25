import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const CloudinaryImageUpload = ({ onImageUpload, currentImage, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Server-side upload using your API route
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

    console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'trade_journal');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        let errorData = {};
        let errorMessage = `Upload failed with status ${response.status}`;
        
        try {
          errorData = await response.json();
          console.error('Upload error response:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          console.error('Response text:', await response.text().catch(() => 'Unable to read response'));
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (!result.url) {
        throw new Error('Upload completed but no URL returned');
      }

      return result.url;

    } catch (fetchError) {
      console.error('Fetch error during upload:', fetchError);
      
      if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }
      
      throw fetchError;
    }
  }, []);

  // Alternative: Client-side signed upload (more efficient for large files)
  const uploadToCloudinaryDirect = useCallback(async (file) => {
    if (!file) return null;

    try {
      // Get signed upload parameters
      const paramsResponse = await fetch('/api/upload?folder=trade_journal');
      const paramsData = await paramsResponse.json();
      
      if (!paramsData.success) {
        throw new Error(paramsData.error || 'Failed to get upload parameters');
      }

      const { params } = paramsData;
      
      // Prepare form data for direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', params.timestamp);
      formData.append('folder', params.folder);
      formData.append('transformation', params.transformation);
      formData.append('api_key', params.api_key);
      formData.append('signature', params.signature);

      // Upload directly to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${params.cloud_name}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Direct upload failed');
      }

      const result = await response.json();
      return result.secure_url;

    } catch (error) {
      console.error('Direct upload error:', error);
      throw error;
    }
  }, []);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Use server-side upload by default (more reliable)
      const imageUrl = await uploadToCloudinary(file);
      console.log('Image uploaded successfully:', imageUrl);
      onImageUpload(imageUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      // Reset input value to allow re-selecting the same file
      event.target.value = '';
    }
  }, [uploadToCloudinary, onImageUpload, disabled]);

  const handleRemoveImage = useCallback(async () => {
    if (disabled) return;
    
    // Optional: Delete from Cloudinary
    if (currentImage) {
      try {
        // Extract public_id from URL if needed for deletion
        const publicId = extractPublicIdFromUrl(currentImage);
        if (publicId) {
          await fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
          });
        }
      } catch (error) {
        console.warn('Failed to delete image from Cloudinary:', error);
        // Continue with removal from UI even if Cloudinary deletion fails
      }
    }
    
    onImageUpload(null);
    setUploadError(null);
    setUploadProgress(0);
  }, [currentImage, onImageUpload, disabled]);

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromUrl = useCallback((url) => {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const pathParts = parts.slice(uploadIndex + 2);
        const filename = pathParts.join('/');
        // Remove file extension
        return filename.replace(/\.[^/.]+$/, '');
      }
    } catch (error) {
      console.error('Error extracting public_id:', error);
    }
    return null;
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadToCloudinary(file);
      console.log('Image uploaded via drag & drop:', imageUrl);
      onImageUpload(imageUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setUploadProgress(0);
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
                console.error('Image load error:', e.target.src);
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', currentImage);
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
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors relative ${
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
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mb-1" />
              {uploadProgress > 0 && (
                <div className="text-xs text-blue-400">{uploadProgress}%</div>
              )}
            </div>
          ) : (
            <Upload className={`w-6 h-6 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
          )}
        </div>
      )}
      
      {uploadError && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded whitespace-nowrap z-10 max-w-xs">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;