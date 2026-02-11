'use client';

import { Reel } from '@/lib/types';
import { Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

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
  pending: { label: 'En attente', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', pulse: false },
  processing: { label: 'Rendu IA', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50', pulse: true },
  completed: { label: 'Pret', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', pulse: false },
  error: { label: 'Erreur', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', pulse: false },
};

interface ReelCardProps { reel: Reel; onClick: () => void; }

export default function ReelCard({ reel, onClick }: ReelCardProps) {
  const status = statusConfig[reel.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden cursor-pointer
                 shadow-sm hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]
                 hover:-translate-y-1 transition-all duration-500 group"
    >
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={reel.image_facade_url}
            alt={`${reel.ville} - ${reel.quartier}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5">
            <span className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                             flex items-center gap-1.5 backdrop-blur-sm ${status.pulse ? 'animate-pulse-badge' : ''}`}>
              <StatusIcon className={`w-3 h-3 ${status.pulse ? 'animate-spin-slow' : ''}`} />
              {status.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-5">
            <span className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="font-heading font-bold text-base text-vm-text leading-tight">
          {reel.ville} — {reel.quartier}
        </h3>
        <p className="text-vm-primary font-black text-xl mt-1">
          {reel.prix} €
        </p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
          <span className="text-slate-400 text-xs font-medium">
            {timeAgo(reel.created_at)}
          </span>
          <span className="text-vm-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Voir le detail →
          </span>
        </div>
      </div>
    </div>
  );
}
