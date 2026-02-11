'use client';

import { Reel } from '@/lib/types';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200/60',
    pulse: false,
  },
  processing: {
    label: 'Generation...',
    icon: Loader2,
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    border: 'border-blue-200/60',
    pulse: true,
  },
  completed: {
    label: 'Pret',
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    text: 'text-emerald-500',
    border: 'border-emerald-200/60',
    pulse: false,
  },
  error: {
    label: 'Erreur',
    icon: AlertCircle,
    bg: 'bg-red-50',
    text: 'text-red-500',
    border: 'border-red-200/60',
    pulse: false,
  },
};

interface ReelCardProps {
  reel: Reel;
  onClick: () => void;
}

export default function ReelCard({ reel, onClick }: ReelCardProps) {
  const status = statusConfig[reel.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-vm-border rounded-[1.5rem] overflow-hidden cursor-pointer
                 shadow-[0_1px_4px_rgba(0,0,0,0.03)]
                 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]
                 transition-all duration-300 group"
    >
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={reel.image_facade_url}
            alt={`${reel.ville} - ${reel.quartier}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-vm-input to-vm-bg flex items-center justify-center">
          <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-vm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading font-bold text-[15px] text-vm-text leading-tight">
            {reel.ville} — {reel.quartier}
          </h3>
          <span className={`${status.bg} ${status.text} border ${status.border} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ml-3 ${status.pulse ? 'animate-pulse-badge' : ''}`}>
            <StatusIcon className={`w-3 h-3 ${status.pulse ? 'animate-spin-slow' : ''}`} />
            {status.label}
          </span>
        </div>

        <p className="text-vm-primary font-bold text-lg">
          {reel.prix} €
        </p>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-vm-border-light">
          <span className="text-vm-muted text-xs font-medium">
            {timeAgo(reel.created_at)}
          </span>
          <span className="text-vm-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Voir le detail →
          </span>
        </div>
      </div>
    </div>
  );
}
