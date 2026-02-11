'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Reel } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import ReelCard from '@/components/ReelCard';
import ReelModal from '@/components/ReelModal';
import CreateReelModal from '@/components/CreateReelModal';
import PhotosTab from '@/components/PhotosTab';
import BioTab from '@/components/BioTab';
import { ToastProvider } from '@/components/Toast';
import { Search, Video, Zap, CheckCircle, Sparkles, ArrowRight, Plus } from 'lucide-react';

type TabId = 'dashboard' | 'photos' | 'bio' | 'settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedReelIdRef = useRef<number | null>(null);

  useEffect(() => { selectedReelIdRef.current = selectedReel?.id ?? null; }, [selectedReel]);

  const fetchReels = useCallback(async () => {
    const { data, error } = await supabase.from('reels').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setReels(data as Reel[]);
      if (selectedReelIdRef.current) {
        const updated = data.find((r: Reel) => r.id === selectedReelIdRef.current);
        if (updated) setSelectedReel(updated as Reel);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  useEffect(() => {
    const hasPending = reels.some(r => r.status === 'pending' || r.status === 'processing');
    if (hasPending && !intervalRef.current) { intervalRef.current = setInterval(fetchReels, 15000); }
    else if (!hasPending && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [reels, fetchReels]);

  const totalReels = reels.length;
  const processingCount = reels.filter(r => r.status === 'processing' || r.status === 'pending').length;
  const completedCount = reels.filter(r => r.status === 'completed').length;

  const stats = [
    { label: 'Total Reels', value: totalReels, icon: Video, iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
    { label: 'En cours', value: processingCount, icon: Zap, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
    { label: 'Termines', value: completedCount, icon: CheckCircle, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => setShowCreate(true)}
        processingCount={processingCount}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un mandat..."
              className="w-full pl-10 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none placeholder:text-slate-400 focus:border-vm-primary focus:ring-1 focus:ring-vm-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-vm-text leading-tight">Eden ERA</p>
              <p className="text-xs text-slate-400">Directrice Marketing</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-vm-primary text-white flex items-center justify-center text-sm font-semibold">
              E
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1200px]">

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-vm-text">Dashboard</h1>
                  <p className="text-slate-500 mt-1 text-sm">Vos mandats transformes en contenus viraux par l&apos;IA.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                        <p className="text-2xl font-bold text-vm-text mt-1">{s.value}</p>
                      </div>
                      <div className={`w-10 h-10 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                        <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reels list */}
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-vm-primary rounded-full animate-spin-slow" />
                  </div>
                ) : reels.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-vm-primary-light flex items-center justify-center mb-5 relative">
                      <Video className="w-7 h-7 text-vm-primary" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-vm-primary rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-vm-text">Prete a buzzer ?</h3>
                    <p className="text-slate-400 mt-2 max-w-md text-sm leading-relaxed">
                      Deposez les photos de votre nouveau mandat. Notre IA s&apos;occupe du meuble virtuel et du montage rythme.
                    </p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-6 bg-vm-primary hover:bg-vm-primary-dark text-white h-11 px-6 rounded-lg font-medium text-sm
                                 flex items-center gap-2 transition-colors"
                    >
                      Demarrer la creation <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-vm-text">Mes Reels</h2>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="bg-vm-primary hover:bg-vm-primary-dark text-white h-9 px-4 rounded-lg font-medium text-sm
                                   flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Nouveau Reel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {reels.map(reel => (
                        <ReelCard key={reel.id} reel={reel} onClick={() => setSelectedReel(reel)} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'photos' && <PhotosTab />}
            {activeTab === 'bio' && <BioTab />}

            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl font-bold text-vm-text">Parametres</h1>
                  <p className="text-slate-500 mt-1 text-sm">Configurez votre compte et vos preferences.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-sm text-vm-text">Compte</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-vm-text">Nom</p>
                        <p className="text-sm text-slate-400 mt-0.5">Eden - ERA Immobilier</p>
                      </div>
                      <button className="text-sm text-vm-primary font-medium hover:text-vm-primary-dark">Modifier</button>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-vm-text">Webhook URL</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Non configure'}</p>
                      </div>
                      <button className="text-sm text-vm-primary font-medium hover:text-vm-primary-dark">Modifier</button>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-vm-text">Plan</p>
                        <p className="text-sm text-slate-400 mt-0.5">Gratuit — 5 reels / mois</p>
                      </div>
                      <button className="bg-vm-primary hover:bg-vm-primary-dark text-white text-sm font-medium h-9 px-4 rounded-lg transition-colors">
                        Upgrade Pro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedReel && (
        <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)}
          onDeleted={() => { setSelectedReel(null); fetchReels(); }} onUpdated={fetchReels} />
      )}
      {showCreate && (
        <CreateReelModal onClose={() => setShowCreate(false)} onCreated={fetchReels} />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
