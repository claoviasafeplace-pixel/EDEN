'use client';

import { Sparkles, Sofa, Clock } from 'lucide-react';

interface OptionsPanelProps {
  enableVeo3: boolean;
  onVeo3Change: (v: boolean) => void;
  enableStaging: boolean;
  onStagingChange: (v: boolean) => void;
  durationSeconds: number;
  onDurationChange: (v: number) => void;
  estimatedCost: number;
  contentType: string;
}

const durations = [
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
  { value: 60, label: '60s' },
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${checked ? 'bg-vm-primary' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
          transition-transform duration-200
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

export default function OptionsPanel({
  enableVeo3, onVeo3Change,
  enableStaging, onStagingChange,
  durationSeconds, onDurationChange,
  estimatedCost, contentType,
}: OptionsPanelProps) {
  const isReel = contentType === 'reel';

  return (
    <div className="space-y-4">
      {/* Veo 3 toggle */}
      <div className="vm-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-vm-text">Veo 3 — Photo to Video</p>
            <p className="text-[11px] text-vm-muted mt-0.5">
              Transforme vos photos en clips 8s {enableVeo3 && estimatedCost > 0 && (
                <span className="text-vm-primary font-semibold">(~{estimatedCost.toFixed(2)}€)</span>
              )}
            </p>
          </div>
        </div>
        <Toggle checked={enableVeo3} onChange={onVeo3Change} disabled={!isReel} />
      </div>

      {/* Staging toggle */}
      <div className="vm-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Sofa className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-vm-text">Staging virtuel</p>
            <p className="text-[11px] text-vm-muted mt-0.5">Meuble les pieces vides avec l&apos;IA</p>
          </div>
        </div>
        <Toggle checked={enableStaging} onChange={onStagingChange} />
      </div>

      {/* Duration selector (reel only) */}
      {isReel && (
        <div className="vm-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-vm-text">Duree cible</p>
              <p className="text-[11px] text-vm-muted mt-0.5">La video sera ajustee a cette duree</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onDurationChange(d.value)}
                className={`
                  h-10 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer
                  ${durationSeconds === d.value
                    ? 'bg-vm-primary text-white shadow-sm'
                    : 'bg-gray-50 text-vm-text hover:bg-gray-100 border border-vm-border-light'
                  }
                `}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
