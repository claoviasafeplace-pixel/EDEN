'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  canSubmit: boolean;
  submitting: boolean;
  estimatedCost: number;
  mediaCount: number;
  contentType: string;
  onClick: () => void;
}

export default function GenerateButton({
  canSubmit, submitting, estimatedCost, mediaCount, contentType, onClick,
}: GenerateButtonProps) {
  const label = contentType === 'reel' ? 'Generer la video' : 'Creer le carrousel';

  return (
    <div className="space-y-3">
      <button
        disabled={!canSubmit}
        onClick={onClick}
        className={`
          vm-btn-primary w-full h-12 rounded-xl font-semibold text-sm
          flex items-center justify-center gap-2 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin-slow" />
            Creation en cours...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {label}
          </>
        )}
      </button>

      {/* Summary line */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-vm-muted">
        <span>{mediaCount} media{mediaCount > 1 ? 's' : ''}</span>
        {estimatedCost > 0 && (
          <>
            <span className="w-1 h-1 bg-vm-border rounded-full" />
            <span>Cout estime: ~{estimatedCost.toFixed(2)}€</span>
          </>
        )}
      </div>
    </div>
  );
}
