'use client';

import { useState } from 'react';
import type { UploadedMedia } from '@/lib/types';
import { X, GripVertical, Film, Loader2 } from 'lucide-react';

interface MediaGridProps {
  items: UploadedMedia[];
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return min > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`;
}

export default function MediaGrid({ items, onRemove, onReorder }: MediaGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {items.map((item, index) => {
        const uploading = item.uploadProgress < 100;
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;

        return (
          <div
            key={item.id}
            draggable={!uploading}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative aspect-square rounded-xl overflow-hidden group cursor-grab
              transition-all duration-150
              ${isDragging ? 'opacity-40 scale-95' : ''}
              ${isOver ? 'ring-2 ring-vm-primary ring-offset-2' : ''}
            `}
          >
            <img
              src={item.previewUrl}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin-slow mx-auto" />
                  <span className="text-white text-[10px] font-semibold mt-1 block">
                    {item.uploadProgress}%
                  </span>
                </div>
              </div>
            )}

            {/* Hover overlay */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-150" />
            )}

            {/* Order number */}
            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{index + 1}</span>
            </div>

            {/* Video badge */}
            {item.mediaType === 'video' && (
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Film className="w-3 h-3" />
                {item.durationMs ? formatDuration(item.durationMs) : 'Video'}
              </div>
            )}

            {/* Remove button */}
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-md
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-red-600 cursor-pointer"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}

            {/* Drag handle */}
            {!uploading && (
              <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
