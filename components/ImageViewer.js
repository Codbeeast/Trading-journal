import React from 'react';
import { X } from 'lucide-react';

/**
 * @typedef {Object} ImageViewerProps
 * @property {string} imageUrl - The image URL or base64 data to display
 * @property {string} [title] - Optional title for the image
 * @property {boolean} isOpen - Whether the viewer is open
 * @property {() => void} onClose - Callback to close the viewer
 */

/**
 * @param {ImageViewerProps} props
 */
export const ImageViewer = ({ imageUrl, title, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-600 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Image container */}
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-blue-500/30">
          {title && (
            <div className="px-3 sm:px-4 py-2 bg-slate-700 border-b border-blue-500/30">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-200">{title}</h3>
            </div>
          )}
          <div className="p-2 sm:p-4">
            <img
              src={imageUrl}
              alt={title || 'Uploaded image'}
              className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div 
              className="hidden max-w-full max-h-[70vh] sm:max-h-[80vh] flex items-center justify-center bg-slate-700 text-gray-300 rounded"
              style={{ minHeight: '200px' }}
            >
              <div className="text-center p-4">
                <p className="text-base sm:text-lg font-medium">Failed to load image</p>
                <p className="text-sm text-gray-400 mt-1">The image may be corrupted or in an unsupported format</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 