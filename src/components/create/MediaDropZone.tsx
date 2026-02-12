'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Image, Film } from 'lucide-react';

interface MediaDropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function MediaDropZone({ onFiles, disabled }: MediaDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length > 0) onFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) onFiles(files);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        rounded-2xl border-2 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-4 py-12 px-6
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${dragOver
          ? 'border-vm-primary/40 bg-vm-primary-light scale-[1.01]'
          : 'border-vm-border hover:border-vm-primary/20 hover:bg-vm-primary-light/50 bg-vm-bg/50'
        }
      `}
    >
      <div className="w-16 h-16 bg-white shadow-lg rounded-2xl flex items-center justify-center">
        <Upload className="w-7 h-7 text-vm-muted" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-vm-text">
          Glissez vos photos et videos ici
        </p>
        <p className="text-xs text-vm-muted mt-1.5">
          ou cliquez pour parcourir
        </p>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-vm-muted">
        <span className="flex items-center gap-1">
          <Image className="w-3.5 h-3.5" /> JPG, PNG, WEBP
        </span>
        <span className="flex items-center gap-1">
          <Film className="w-3.5 h-3.5" /> MP4, MOV
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
