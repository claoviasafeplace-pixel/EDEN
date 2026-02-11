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
    bg: 'bg-[rgba(200,169,81,0.15)]',
    text: 'text-eden-gold',
    pulse: false,
  },
  processing: {
    label: 'Generation...',
    bg: 'bg-[rgba(33,150,243,0.15)]',
    text: 'text-eden-info',
    pulse: true,
  },
  completed: {
    label: 'Pret',
    bg: 'bg-[rgba(76,175,80,0.15)]',
    text: 'text-eden-success',
    pulse: false,
  },
  error: {
    label: 'Erreur',
    bg: 'bg-[rgba(229,57,53,0.15)]',
    text: 'text-eden-error',
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
      className="bg-eden-surface border border-eden-border rounded-2xl overflow-hidden cursor-pointer
                 shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
                 transition-all duration-200"
    >
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={reel.image_facade_url}
            alt={`${reel.ville} - ${reel.quartier}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-eden-border flex items-center justify-center">
          <svg className="w-12 h-12 text-eden-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-heading font-bold text-base text-white">
          {reel.ville} — {reel.quartier}
        </h3>
        <p className="text-eden-gold font-bold text-lg mt-1">
          {reel.prix} €
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-eden-muted text-xs">
            {timeAgo(reel.created_at)}
          </span>
          <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-semibold ${status.pulse ? 'animate-pulse-badge' : ''}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}
