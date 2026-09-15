'use client';

import React from 'react';
import { Layer as StickerLayer, TextLayer } from '@/types/sticker';
import { Trash2, Type, MoveVertical, Palette, Loader2, Wand2, Crop } from 'lucide-react';
import { removeBackground } from '@/lib/bgRemoval';
import { CropModal } from '@/components/CropModal';

interface LayerPanelProps {
  layers: StickerLayer[];
  setLayers: (layers: StickerLayer[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  baseImageUrl: string;
  setBaseImageUrl: (url: string) => void;
}

export function LayerPanel({ layers, setLayers, selectedId, setSelectedId, baseImageUrl, setBaseImageUrl }: LayerPanelProps) {
  const [isRemovingBg, setIsRemovingBg] = React.useState(false);
  const [showCropModal, setShowCropModal] = React.useState(false);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'HELLO!',
      x: 256, // center of 512 canvas
      y: 256,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fontFamily: 'Impact, sans-serif',
      fontSize: 60,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 4,
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setLayers(layers.filter(l => l.id !== selectedId));
    setSelectedId(null);
  };

  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    if (!selectedId) return;
    setLayers(layers.map(l => {
      if (l.id === selectedId && l.type === 'text') {
        return { ...l, ...updates } as TextLayer;
      }
      return l;
    }));
  };

  const handleBgRemoval = async () => {
    if (!baseImageUrl) return;
    try {
      setIsRemovingBg(true);
      const url = await removeBackground(baseImageUrl);
      setBaseImageUrl(url);
    } catch (error) {
      alert("Failed to remove background.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedId) as TextLayer | undefined;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 flex flex-col gap-6 w-full max-w-sm">
      
      {/* Global Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Canvas Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addTextLayer}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5 col-span-2"
          >
            <Type size={16} /> Add Text
          </button>
          
          <button
            onClick={() => setShowCropModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5"
          >
            <Crop size={16} /> Crop
          </button>
          
          <button
            onClick={handleBgRemoval}
            disabled={isRemovingBg}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600/50 to-blue-600/50 hover:from-purple-500/60 hover:to-blue-500/60 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isRemovingBg ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            Remove BG
          </button>
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Selected Layer Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Edit Selection</h3>
          <button
            onClick={removeSelected}
            disabled={!selectedId}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete Selected Layer"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {selectedLayer ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Text Content</label>
              <input
                type="text"
                value={selectedLayer.text}
                onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Fill Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedLayer.fill}
                    onChange={(e) => updateSelectedLayer({ fill: e.target.value })}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={selectedLayer.fill}
                    onChange={(e) => updateSelectedLayer({ fill: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Outline Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedLayer.stroke}
                    onChange={(e) => updateSelectedLayer({ stroke: e.target.value })}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={selectedLayer.stroke}
                    onChange={(e) => updateSelectedLayer({ stroke: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 flex justify-between">
                <span>Outline Width</span>
                <span>{selectedLayer.strokeWidth}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedLayer.strokeWidth}
                onChange={(e) => updateSelectedLayer({ strokeWidth: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-black/20 rounded-xl border border-dashed border-white/10">
            <MoveVertical size={24} className="mb-2 opacity-50" />
            <p className="text-sm">Select a text layer to edit</p>
          </div>
        )}
      </div>

      {showCropModal && (
        <CropModal 
          imageUrl={baseImageUrl}
          onClose={() => setShowCropModal(false)}
          onApply={(croppedUrl) => {
            setBaseImageUrl(croppedUrl);
            setShowCropModal(false);
          }}
        />
      )}
    </div>
  );
}
