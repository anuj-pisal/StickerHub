'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect } from 'react-konva';
import { Layer as StickerLayer, TextLayer } from '@/types/sticker';

// Custom hook to load an image for Konva
const useImage = (url: string) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  
  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.src = url;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
  }, [url]);

  return [image];
};

interface EditorCanvasProps {
  baseImageUrl: string;
  layers: StickerLayer[];
  setLayers: (layers: StickerLayer[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export interface EditorCanvasRef {
  exportImage: () => string | null;
}

const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(({ baseImageUrl, layers, setLayers, selectedId, setSelectedId }, ref) => {
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (stageRef.current) {
        // Deselect before export to hide transformer
        setSelectedId(null);
        // Force sync update if needed, but since it's state, it might not hide immediately.
        // Konva's toDataURL is synchronous, so we can temporarily hide the transformer layer or node.
        if (trRef.current) {
          trRef.current.nodes([]);
          trRef.current.getLayer().draw();
        }
        return stageRef.current.toDataURL({ pixelRatio: 1 });
      }
      return null;
    }
  }));
  
  const [baseImage] = useImage(baseImageUrl);

  // Constants for WhatsApp sticker size
  const CANVAS_SIZE = 512;
  const STAGE_SCALE = 1; // You could scale this if the container is smaller

  useEffect(() => {
    if (selectedId && trRef.current) {
      // Find the node by id
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, layers]);

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area or base image
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnBase = e.target.name() === 'base-image';
    if (clickedOnEmpty || clickedOnBase) {
      setSelectedId(null);
    }
  };

  const handleDragEnd = (e: any, layerId: string) => {
    const node = e.target;
    setLayers(layers.map(l => {
      if (l.id === layerId) {
        return { ...l, x: node.x(), y: node.y() };
      }
      return l;
    }));
  };

  const handleTransformEnd = (e: any, layerId: string) => {
    const node = stageRef.current.findOne(`#${layerId}`);
    if (node) {
      setLayers(layers.map(l => {
        if (l.id === layerId) {
          return {
            ...l,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          };
        }
        return l;
      }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-4">
      <div 
        className="bg-black/20 rounded-xl overflow-hidden border border-white/5 relative"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <Stage
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
        >
          {/* Base Layer */}
          <Layer>
            {/* Checkerboard pattern for transparency visualization (Optional, via CSS on container usually) */}
            {baseImage && (
              <KonvaImage
                image={baseImage}
                name="base-image"
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                // Maintain aspect ratio while covering/containing based on preference
                // Simple implementation: stretch to fit, or center. Let's assume the user crops or it's squared.
              />
            )}
          </Layer>

          {/* Dynamic Layers (Text & Shapes) */}
          <Layer>
            {layers.map((layer) => {
              if (layer.type === 'text') {
                const tLayer = layer as TextLayer;
                return (
                  <Text
                    key={tLayer.id}
                    id={tLayer.id}
                    text={tLayer.text}
                    x={tLayer.x}
                    y={tLayer.y}
                    fontFamily={tLayer.fontFamily}
                    fontSize={tLayer.fontSize}
                    fill={tLayer.fill}
                    stroke={tLayer.stroke}
                    strokeWidth={tLayer.strokeWidth}
                    rotation={tLayer.rotation}
                    scaleX={tLayer.scaleX}
                    scaleY={tLayer.scaleY}
                    draggable
                    onClick={() => setSelectedId(tLayer.id)}
                    onTap={() => setSelectedId(tLayer.id)}
                    onDragEnd={(e) => handleDragEnd(e, tLayer.id)}
                    onTransformEnd={(e) => handleTransformEnd(e, tLayer.id)}
                  />
                );
              }
              // Implement ImageLayer if needed
              return null;
            })}

            {/* Transformer for Selection */}
            {selectedId && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // limit resize
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>

          {/* Guide Overlay (Optional) */}
          <Layer listening={false}>
            <Rect
              x={0}
              y={0}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={1}
              dash={[5, 5]}
            />
          </Layer>
        </Stage>
      </div>
      <p className="mt-4 text-xs text-gray-500">Canvas size: 512 x 512px (WhatsApp Standard)</p>
    </div>
  );
});

export default EditorCanvas;
