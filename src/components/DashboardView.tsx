'use client';

import { Reel } from '@/lib/types';
import ReelCard from './ReelCard';
import EmptyState from './ui/EmptyState';
import { Video, Zap, CheckCircle2, Plus, Search } from 'lucide-react';

interface DashboardViewProps {
  reels: Reel[];
  loading: boolean;
  stats: { total: number; processing: number; completed: number };
  onCreateClick: () => void;
  onSelectReel: (reel: Reel) => void;
}

const statsMeta = [
  { key: 'total' as const, label: 'Total Reels', icon: Video, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'processing' as const, label: 'En cours', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'completed' as const, label: 'Termines', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function DashboardView({ reels, loading, stats, onCreateClick, onSelectReel }: DashboardViewProps) {
  return (
    <div className="animate-tab-enter">
      {/* Header inline */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-500 text-sm">Gerez vos mandats transformes en contenus viraux par l&apos;IA.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un mandat..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-64 transition-all"
            />
          </div>
          <button
            onClick={onCreateClick}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-slate-200 hover:scale-105 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Nouveau Reel
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {statsMeta.map((s, i) => (
          <div key={s.key} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between animate-card-in stagger-${i + 1}`}>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black">{stats[s.key]}</p>
            </div>
            <div className={`${s.bg} ${s.color} p-4 rounded-xl`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Reels List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Mes Reels Recents</h2>
          <button className="text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors cursor-pointer">Tout voir</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="aspect-[9/16] animate-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 animate-shimmer" />
                  <div className="h-4 w-1/3 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : reels.length === 0 ? (
          <EmptyState
            icon={<Video className="w-9 h-9 text-slate-400" />}
            title="Prete a buzzer ?"
            description="Deposez les photos de votre nouveau mandat. Notre IA s'occupe du meuble virtuel et du montage rythme."
            actionLabel="Demarrer la creation"
            onAction={onCreateClick}
          />
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {reels.map((reel, i) => (
              <div key={reel.id} className={`animate-card-in stagger-${Math.min(i + 1, 9)}`}>
                <ReelCard reel={reel} onClick={() => onSelectReel(reel)} />
              </div>
            ))}

            {/* Empty State Card */}
            <button
              onClick={onCreateClick}
              className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all cursor-pointer"
            >
              <Plus size={32} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-center">Creer une<br/>nouvelle video</p>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
