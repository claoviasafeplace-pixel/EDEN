'use client';

import type { ContentType } from '@/lib/types';
import { Film, LayoutGrid } from 'lucide-react';

interface FormatSelectorProps {
  value: ContentType;
  onChange: (v: ContentType) => void;
}

const formats: { value: ContentType; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'reel', label: 'Video Reel', desc: '9:16 vertical, 30-60s', icon: Film },
  { value: 'carousel', label: 'Carrousel', desc: 'Photos swipe, max 10', icon: LayoutGrid },
];

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {formats.map((f) => {
        const active = value === f.value;
        const Icon = f.icon;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={`
              p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer
              ${active
                ? 'border-vm-primary bg-vm-primary-light'
                : 'border-vm-border-light bg-white hover:border-vm-border'
              }
            `}
          >
            <Icon className={`w-5 h-5 mb-2 ${active ? 'text-vm-primary' : 'text-vm-muted'}`} />
            <p className={`text-sm font-semibold ${active ? 'text-vm-primary' : 'text-vm-text'}`}>
              {f.label}
            </p>
            <p className="text-[11px] text-vm-muted mt-0.5">{f.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
