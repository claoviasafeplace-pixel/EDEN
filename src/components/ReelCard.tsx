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
  pending: { label: 'En attente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', pulse: false },
  processing: { label: 'Rendu IA', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', pulse: true },
  completed: { label: 'Pret', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', pulse: false },
  error: { label: 'Erreur', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', pulse: false },
};

interface ReelCardProps { reel: Reel; onClick: () => void; }

export default function ReelCard({ reel, onClick }: ReelCardProps) {
  const status = statusConfig[reel.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-black/5 rounded-xl overflow-hidden cursor-pointer
                 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
    >
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={reel.image_facade_url}
            alt={`${reel.ville} - ${reel.quartier}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`${status.bg} ${status.color} border ${status.border} px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide
                             flex items-center gap-1 ${status.pulse ? 'animate-pulse-badge' : ''}`}>
              <StatusIcon className={`w-3 h-3 ${status.pulse ? 'animate-spin-slow' : ''}`} />
              {status.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className={`${status.bg} ${status.color} border ${status.border} px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-sm text-vm-text">
          {reel.ville} — {reel.quartier}
        </h3>
        <p className="text-vm-primary font-bold text-lg mt-0.5">
          {reel.prix} €
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <span className="text-slate-400 text-xs">
            {timeAgo(reel.created_at)}
          </span>
          <span className="text-vm-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Voir →
          </span>
        </div>
      </div>
    </div>
  );
}
