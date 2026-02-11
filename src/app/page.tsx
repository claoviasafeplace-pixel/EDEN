'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Reel } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import ReelCard from '@/components/ReelCard';
import ReelModal from '@/components/ReelModal';
import CreateReelModal from '@/components/CreateReelModal';
import { ToastProvider } from '@/components/Toast';
import { Search, Bell, Film, Loader2, Plus, Video } from 'lucide-react';

function DashboardContent() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedReelIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedReelIdRef.current = selectedReel?.id ?? null;
  }, [selectedReel]);

  const fetchReels = useCallback(async () => {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReels(data as Reel[]);
      if (selectedReelIdRef.current) {
        const updated = data.find((r: Reel) => r.id === selectedReelIdRef.current);
        if (updated) setSelectedReel(updated as Reel);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  useEffect(() => {
    const hasPending = reels.some(r => r.status === 'pending' || r.status === 'processing');
    if (hasPending && !intervalRef.current) {
      intervalRef.current = setInterval(fetchReels, 15000);
    } else if (!hasPending && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reels, fetchReels]);

  const totalReels = reels.length;
  const processingCount = reels.filter(r => r.status === 'processing' || r.status === 'pending').length;
  const completedCount = reels.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-vm-bg">
      <Sidebar onCreateClick={() => setShowCreate(true)} />

      {/* Main content area */}
      <div className="ml-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-vm-border-light">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Search */}
            <div className="relative w-[340px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-vm-muted" />
              <input
                type="text"
                placeholder="Rechercher un reel..."
                className="w-full bg-vm-input pl-11 pr-4 py-2.5 rounded-xl text-sm text-vm-text placeholder-vm-muted
                           outline-none border border-transparent focus:border-vm-primary/30 focus:ring-2 focus:ring-vm-primary/10
                           transition-all"
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-vm-muted hover:text-vm-text hover:bg-vm-input transition-all relative">
                <Bell className="w-[18px] h-[18px]" />
                {processingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-vm-primary rounded-full border-2 border-white" />
                )}
              </button>
              <div className="w-px h-6 bg-vm-border mx-1" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-vm-primary to-vm-primary-hover rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  E
                </div>
                <div className="hidden lg:block">
                  <p className="text-vm-text text-sm font-semibold leading-none">Eden</p>
                  <p className="text-vm-muted text-[11px] mt-0.5">ERA Immobilier</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-8 py-8">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-vm-text">
              Bonjour, Eden
            </h1>
            <p className="text-vm-text-secondary mt-1">
              Gerez vos reels immobiliers et suivez leur progression.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                label: 'Total Reels',
                value: totalReels,
                icon: <Film className="w-5 h-5" />,
                color: 'text-vm-primary',
                bg: 'bg-vm-primary-light',
              },
              {
                label: 'En cours',
                value: processingCount,
                icon: <Loader2 className={`w-5 h-5 ${processingCount > 0 ? 'animate-spin-slow' : ''}`} />,
                color: 'text-vm-info',
                bg: 'bg-blue-50',
              },
              {
                label: 'Termines',
                value: completedCount,
                icon: <Video className="w-5 h-5" />,
                color: 'text-vm-success',
                bg: 'bg-emerald-50',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-vm-border rounded-[1.25rem] py-5 px-6 flex items-center gap-5
                           shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]
                           transition-all duration-300"
              >
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <span className="text-[28px] font-bold text-vm-text leading-none">{stat.value}</span>
                  <p className={`${stat.color} text-sm font-medium mt-0.5`}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg text-vm-text">
              Mes Reels
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-vm-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm
                         hover:bg-vm-primary-hover shadow-sm hover:shadow-md
                         transition-all duration-200 flex items-center gap-2
                         active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nouveau Reel
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 border-[3px] border-vm-dim border-t-vm-primary rounded-full animate-spin-slow" />
            </div>
          ) : reels.length === 0 ? (
            <div
              className="flex flex-col items-center py-20 border-2 border-dashed border-vm-dim/30 rounded-[2rem]
                          bg-gradient-to-b from-white to-vm-bg/50"
            >
              <div className="w-20 h-20 bg-vm-primary-light rounded-3xl flex items-center justify-center mb-6">
                <Video className="w-10 h-10 text-vm-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-vm-text">
                Aucun reel pour l&apos;instant
              </h3>
              <p className="text-vm-text-secondary mt-2 text-center max-w-md text-sm leading-relaxed">
                Creez votre premier reel immobilier professionnel en quelques clics.
                Uploadez vos photos, renseignez les informations et laissez la magie operer.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-8 bg-vm-primary text-white font-semibold py-3.5 px-8 rounded-2xl text-sm
                           hover:bg-vm-primary-hover shadow-[0_4px_16px_rgba(193,134,107,0.3)]
                           hover:shadow-[0_6px_24px_rgba(193,134,107,0.4)]
                           transition-all duration-300 flex items-center gap-2
                           active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Creer mon premier Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {reels.map(reel => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  onClick={() => setSelectedReel(reel)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedReel && (
        <ReelModal
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onDeleted={() => { setSelectedReel(null); fetchReels(); }}
          onUpdated={fetchReels}
        />
      )}

      {showCreate && (
        <CreateReelModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchReels}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
