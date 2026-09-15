'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

interface CropModalProps {
  imageUrl: string;
  onClose: () => void;
  onApply: (croppedImageUrl: string) => void;
}

export function CropModal({ imageUrl, onClose, onApply }: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/png'));
    });
  };

  const handleApply = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const croppedUrl = await getCroppedImg(imgRef.current, completedCrop);
      onApply(croppedUrl);
    } else {
      // If they didn't crop anything, just close or pass original
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold text-lg">Crop Image</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-black/50">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full max-w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop me"
              className="max-h-[60vh] object-contain rounded"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-lg font-medium text-sm bg-blue-500 hover:bg-blue-400 text-white flex items-center gap-2 transition-colors"
          >
            <Check size={16} /> Apply Crop
          </button>
        </div>
        
      </div>
    </div>
  );
}
