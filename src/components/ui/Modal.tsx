'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] animate-overlay-in" onClick={onClose} />
      <div className={`relative bg-white w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden animate-modal-in max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-7 pt-6 pb-5 border-b border-vm-border-light z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="modal-title" className="text-lg font-bold text-vm-text truncate">{title}</h2>
                {subtitle && <p className="text-vm-primary font-bold text-xl mt-1 whitespace-nowrap">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer -mt-0.5">
                <X className="w-5 h-5 text-vm-muted" />
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
