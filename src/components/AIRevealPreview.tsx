'use client';

import { useState, useCallback, useRef } from 'react';

interface AIRevealPreviewProps {
  beforeUrl: string;
  afterUrl: string;
}

export default function AIRevealPreview({ beforeUrl, afterUrl }: AIRevealPreviewProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden bg-black"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Before (full background) */}
      <img
        src={beforeUrl}
        alt="Avant"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* After (revealed by clipPath) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={afterUrl}
          alt="Apres"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Separator line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white z-10"
        style={{
          left: `${sliderPos}%`,
          transform: 'translateX(-50%)',
          boxShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.3)',
        }}
      />

      {/* Slider handle */}
      <div
        className="absolute top-1/2 z-20 w-10 h-10 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ left: `${sliderPos}%` }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 3L2 8L5 13" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 3L14 8L11 13" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* AVANT badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
          Avant
        </span>
      </div>

      {/* APRES badge */}
      <div className="absolute bottom-4 right-4 z-10">
        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
          Apres
        </span>
      </div>
    </div>
  );
}
