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
  pending: { label: 'En attente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', pulse: false },
  processing: { label: 'Rendu IA', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', pulse: true },
  completed: { label: 'Pret', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', pulse: false },
  error: { label: 'Erreur', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', pulse: false },
};

export default function ReelCard({ reel, onClick }: { reel: Reel; onClick: () => void }) {
  const status = statusConfig[reel.status];
  const StatusIcon = status.icon;

  return (
    <div onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {reel.image_facade_url ? (
        <div className="aspect-[16/10] overflow-hidden relative">
          <img src={reel.image_facade_url} alt={`${reel.ville}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`${status.bg} ${status.color} px-2 py-0.5 rounded text-[10px] font-medium
                             flex items-center gap-1 ${status.pulse ? 'animate-pulse-badge' : ''}`}>
              <StatusIcon className={`w-3 h-3 ${status.pulse ? 'animate-spin-slow' : ''}`} />
              {status.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] bg-slate-50 flex items-center justify-center relative">
          <Video className="w-8 h-8 text-slate-200" />
          <div className="absolute bottom-3 left-3">
            <span className={`${status.bg} ${status.color} px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <p className="text-sm font-medium text-vm-text">{reel.ville} — {reel.quartier}</p>
        <p className="text-vm-primary font-semibold text-base mt-0.5">{reel.prix} €</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-slate-400 text-xs">{timeAgo(reel.created_at)}</span>
          <span className="text-vm-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Voir →</span>
        </div>
      </div>
    </div>
  );
}

function Video(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}
