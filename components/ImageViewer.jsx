import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @typedef {Object} ImageViewerProps
 * @property {string|string[]} imageUrl - The image URL(s) or base64 data to display
 * @property {string} [title] - Optional title for the image
 * @property {boolean} isOpen - Whether the viewer is open
 * @property {() => void} onClose - Callback to close the viewer
 * @property {number} [initialIndex] - Initial image index for multiple images
 */

/**
 * @param {ImageViewerProps} props
 */
export const ImageViewer = ({ imageUrl, title, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Handle both single image and array of images, with proper URL parsing
  const images = React.useMemo(() => {
    let allImages = [];
    
    if (Array.isArray(imageUrl)) {
      imageUrl.forEach(img => {
        if (img && typeof img === 'string') {
          if (img.includes(',')) {
            // Split comma-separated URLs
            const splitUrls = img.split(',').map(url => url.trim()).filter(url => url !== '');
            allImages.push(...splitUrls);
          } else {
            // Single URL
            allImages.push(img.trim());
          }
        }
      });
    } else if (imageUrl && typeof imageUrl === 'string') {
      if (imageUrl.includes(',')) {
        const splitUrls = imageUrl.split(',').map(url => url.trim()).filter(url => url !== '');
        allImages.push(...splitUrls);
      } else {
        allImages.push(imageUrl.trim());
      }
    }
    
    // Remove duplicates and empty strings
    return [...new Set(allImages.filter(url => url && url.trim() !== ''))];
  }, [imageUrl]);
  const hasMultipleImages = images.length > 1;
  
  // Reset index when imageUrl changes
  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [imageUrl, initialIndex, images.length]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !hasMultipleImages) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, hasMultipleImages, images.length]);
  
  if (!isOpen || images.length === 0) return null;
  
  const currentImage = images[currentIndex];
  const currentTitle = hasMultipleImages ? `${title} (${currentIndex + 1}/${images.length})` : title;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-2 sm:p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        // Close when clicking outside the image container
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-600 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation buttons for multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
              title="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
              title="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image container */}
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-blue-500/30 max-w-full max-h-full">
          {currentTitle && (
            <div className="px-3 sm:px-4 py-2 bg-slate-700 border-b border-blue-500/30">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-200">{currentTitle}</h3>
            </div>
          )}
          <div className="p-2 sm:p-4 relative flex items-center justify-center">
            <img
              src={currentImage}
              alt={currentTitle || 'Uploaded image'}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded"
              onError={(e) => {
                console.error('ImageViewer: Failed to load image:', e.target.src);
                console.error('All images in viewer:', images);
                console.error('Current index:', currentIndex);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div 
              className="hidden max-w-[90vw] max-h-[85vh] flex items-center justify-center bg-slate-700 text-gray-300 rounded"
              style={{ minHeight: '200px' }}
            >
              <div className="text-center p-4">
                <p className="text-base sm:text-lg font-medium">Failed to load image</p>
                <p className="text-sm text-gray-400 mt-1">The image may be corrupted or in an unsupported format</p>
              </div>
            </div>
            
            {/* Image indicators for multiple images */}
            {hasMultipleImages && (
              <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-400' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 