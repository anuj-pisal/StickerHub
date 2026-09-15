'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface UploaderProps {
  onImagesSelected: (images: string[]) => void;
  multiSelect?: boolean;
}

export function Uploader({ onImagesSelected, multiSelect = false }: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files).slice(0, multiSelect ? 5 : 1);
    const readers = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setPreviews(images);
      onImagesSelected(images);
    });
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [multiSelect]);

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesSelected(newPreviews);
  };

  return (
    <div className="w-full">
      {previews.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {multiSelect && (
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors">
              <ImageIcon className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Add more</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="mb-2 text-sm text-gray-300">
            <span className="font-semibold text-white">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG or WEBP (Max 5MB)
          </p>
          <input
            type="file"
            multiple={multiSelect}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
