'use client';

import { Reel } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString('fr-FR');
}

const statusConfig = {
  pending: {
    label: 'En attente',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    pulse: false,
  },
  processing: {
    label: 'Generation...',
    bg: 'bg-blue-50',
    text: 'text-vm-info',
    border: 'border-blue-200',
    pulse: true,
  },
  completed: {
    label: 'Pret',
    bg: 'bg-emerald-50',
    text: 'text-vm-success',
    border: 'border-emerald-200',
    pulse: false,
  },
  error: {
    label: 'Erreur',
    bg: 'bg-red-50',
    text: 'text-vm-error',
    border: 'border-red-200',
    pulse: false,
  },
};

interface ReelCardProps {
  reel: Reel;
  onClick: () => void;
}

export default function ReelCard({ reel, onClick }: ReelCardProps) {
  const status = statusConfig[reel.status];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-vm-border rounded-2xl overflow-hidden cursor-pointer
                 shadow-[0_2px_12px_rgba(139,109,79,0.06)]
                 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(139,109,79,0.12)]
                 transition-all duration-300 group"
    >
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={reel.image_facade_url}
            alt={`${reel.ville} - ${reel.quartier}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-vm-input flex items-center justify-center">
          <svg className="w-12 h-12 text-vm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
        </div>
      )}

      <div className="p-5">
        <h3 className="font-heading font-semibold text-[15px] text-vm-text">
          {reel.ville} — {reel.quartier}
        </h3>
        <p className="text-vm-accent font-bold text-lg mt-1">
          {reel.prix} €
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-vm-border">
          <span className="text-vm-muted text-xs">
            {timeAgo(reel.created_at)}
          </span>
          <span className={`${status.bg} ${status.text} border ${status.border} px-3 py-1 rounded-full text-[11px] font-semibold ${status.pulse ? 'animate-pulse-badge' : ''}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}
