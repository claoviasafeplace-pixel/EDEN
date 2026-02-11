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
import { Search, Video, Zap, Eye, Sparkles, ArrowRight, Plus, TrendingUp } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => setShowCreate(true)}
        processingCount={processingCount}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-black/5 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="relative w-full max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-black/[0.03] rounded-lg text-sm outline-none transition-all placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-vm-primary/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="text-sm font-semibold block text-vm-text leading-tight">Eden ERA</span>
              <span className="text-[10px] text-slate-400">Directrice Marketing</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vm-primary to-vm-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-vm-text">Dashboard</h1>
                <p className="text-slate-400 mt-0.5 text-sm">Vos mandats transformes en contenus viraux par l&apos;IA.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-black/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Projets</p>
                      <p className="text-3xl font-bold text-vm-text mt-1">{totalReels}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Video className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-black/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">En cours</p>
                      <p className="text-3xl font-bold text-vm-text mt-1">{processingCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-black/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Termines</p>
                      <p className="text-3xl font-bold text-vm-text mt-1">{completedCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reels Section */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-vm-primary rounded-full animate-spin-slow" />
                </div>
              ) : reels.length === 0 ? (
                <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                  {/* Gradient top accent */}
                  <div className="h-1 bg-gradient-to-r from-vm-primary via-orange-300 to-vm-primary-dark" />
                  <div className="p-12 lg:p-16 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vm-primary-light to-orange-50 flex items-center justify-center mb-6 relative">
                      <Video className="w-9 h-9 text-vm-primary" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-vm-primary rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-vm-text">Prete a buzzer ?</h3>
                    <p className="text-slate-400 mt-2 max-w-sm leading-relaxed text-sm">
                      Deposez les photos de votre nouveau mandat. Notre IA s&apos;occupe du meuble virtuel et du montage rythme.
                    </p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-8 bg-[#141418] text-white px-7 py-3.5 rounded-xl font-semibold text-sm
                                 flex items-center gap-2.5 hover:bg-vm-primary transition-colors
                                 active:scale-[0.98]"
                    >
                      Demarrer la creation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-vm-text">Mes Reels</h2>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="bg-vm-primary hover:bg-vm-primary-dark text-white px-4 py-2 rounded-lg font-semibold text-sm
                                 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Nouveau
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

          {/* Photos Tab */}
          {activeTab === 'photos' && <PhotosTab />}

          {/* Bio Tab */}
          {activeTab === 'bio' && <BioTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl font-bold text-vm-text">Parametres</h1>
                <p className="text-slate-400 mt-0.5 text-sm">Configurez votre compte et vos preferences.</p>
              </div>
              <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50">
                  <h3 className="font-semibold text-vm-text text-sm">Compte</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm text-vm-text">Nom</p>
                      <p className="text-slate-400 text-sm mt-0.5">Eden - ERA Immobilier</p>
                    </div>
                    <button className="text-vm-primary text-sm font-medium hover:text-vm-primary-dark transition-colors">Modifier</button>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm text-vm-text">Webhook URL</p>
                      <p className="text-slate-400 text-xs font-mono mt-0.5">{process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Non configure'}</p>
                    </div>
                    <button className="text-vm-primary text-sm font-medium hover:text-vm-primary-dark transition-colors">Modifier</button>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm text-vm-text">Plan</p>
                      <p className="text-slate-400 text-sm mt-0.5">Gratuit — 5 reels / mois</p>
                    </div>
                    <button className="bg-vm-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-vm-primary-dark transition-all">
                      Upgrade Pro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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
