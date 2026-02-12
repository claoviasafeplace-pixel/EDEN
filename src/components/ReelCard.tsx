'use client';

import type { Reel } from '@/lib/types';
import { PIPELINE_LABELS } from '@/lib/types';
import { formatPrix, formatLocation } from '@/lib/formatters';
import { Play, ExternalLink } from 'lucide-react';

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

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/80 text-white border-amber-400',
  processing: 'bg-blue-500/80 text-white border-blue-400',
  completed: 'bg-emerald-500/80 text-white border-emerald-400',
  error: 'bg-red-500/80 text-white border-red-400',
};

const statusLabels: Record<string, string> = {
  pending: 'en attente',
  processing: 'en cours',
  completed: 'termine',
  error: 'erreur',
};

export default function ReelCard({ reel, onClick }: { reel: Reel; onClick: () => void }) {
  const coverUrl = reel.media_items?.[0]?.url || reel.image_facade_url;
  const location = formatLocation(reel.ville, reel.quartier);
  const prix = formatPrix(reel.prix);
  const dateStr = timeAgo(reel.created_at);

  const pipelineLabel = reel.status === 'processing' && reel.pipeline_stage
    ? PIPELINE_LABELS[reel.pipeline_stage]
    : null;
  const badgeLabel = pipelineLabel || statusLabels[reel.status] || reel.status;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-[9/16] relative bg-slate-100 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={reel.ville || 'Bien'}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Play size={32} className="text-slate-300" />
          </div>
        )}

        {/* Status badge — top left */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border ${statusStyles[reel.status]}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Play button — top right */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-colors">
            <Play size={14} fill="currentColor" />
          </div>
        </div>

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white text-xs font-medium mb-1">{dateStr}</p>
          <div className="w-full py-2 bg-white rounded-lg text-slate-900 font-bold text-xs flex items-center justify-center gap-2">
            <ExternalLink size={12} /> Voir le rendu
          </div>
        </div>

        {/* Progress bar during processing */}
        {reel.status === 'processing' && reel.pipeline_progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${reel.pipeline_progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-0.5 truncate">{location}</h3>
        <p className="text-amber-600 font-black text-lg">{prix}</p>
      </div>
    </div>
  );
}
