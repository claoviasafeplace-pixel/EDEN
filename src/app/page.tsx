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
import { Search, Clock, Video, Zap, Eye, Sparkles, ArrowRight, Plus } from 'lucide-react';

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
    { label: 'Projets Reels', value: String(totalReels), icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'En rendu IA', value: String(processingCount), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Termines', value: String(completedCount), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-vm-text font-sans selection:bg-vm-primary/20">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => setShowCreate(true)}
        processingCount={processingCount}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un mandat..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-vm-primary/30 rounded-xl text-sm outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-sm font-semibold block text-vm-text">Eden ERA</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Marketing</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-vm-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Title bar */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-vm-text">Dashboard</h1>
                  <p className="text-slate-400 mt-1 text-sm">Vos mandats transformes en contenus viraux.</p>
                </div>
                <div className="hidden md:flex gap-2">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {reels.length > 0 ? 'Activite recente' : 'Aucune activite'}
                  </div>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm
                                          hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bg} ${stat.color} w-11 h-11 rounded-xl flex items-center justify-center
                                       group-hover:scale-105 transition-transform duration-300`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em]">{stat.label}</p>
                    <p className="text-3xl font-black text-vm-text mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Reels Section */}
              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="w-12 h-12 border-[3px] border-slate-200 border-t-vm-primary rounded-full animate-spin-slow" />
                </div>
              ) : reels.length === 0 ? (
                <div className="bg-white border border-slate-200/60 rounded-3xl p-12 lg:p-16 flex flex-col items-center justify-center text-center space-y-8 min-h-[420px]">
                  <div className="relative">
                    <div className="bg-vm-primary-light w-24 h-24 rounded-2xl flex items-center justify-center relative">
                      <Video className="w-10 h-10 text-vm-primary" />
                      <div className="absolute -top-1.5 -right-1.5 bg-vm-primary p-1.5 rounded-full text-white shadow-md">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <div className="max-w-sm space-y-3">
                    <h3 className="text-2xl font-black text-vm-text tracking-tight">Prete a buzzer ?</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      Deposez les photos de votre nouveau mandat. Notre IA s&apos;occupe du meuble virtuel et du montage rythme.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="bg-vm-text text-white px-8 py-4 rounded-xl font-bold text-base
                               flex items-center gap-3 hover:bg-vm-primary transition-all
                               shadow-lg active:scale-[0.98]"
                  >
                    Demarrer la creation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-vm-text">Mes Reels</h2>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="bg-vm-primary hover:bg-vm-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm
                                 shadow-sm transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Nouveau Reel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {reels.map(reel => (
                      <ReelCard key={reel.id} reel={reel} onClick={() => setSelectedReel(reel)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && <PhotosTab />}

          {/* Bio Tab */}
          {activeTab === 'bio' && <BioTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-vm-text">Parametres</h1>
                <p className="text-slate-400 mt-1 text-sm">Configurez votre compte et vos preferences.</p>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-vm-text mb-5">Compte</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-slate-50">
                    <div>
                      <p className="font-bold text-sm text-vm-text">Nom</p>
                      <p className="text-slate-400 text-sm">Eden - ERA Immobilier</p>
                    </div>
                    <button className="text-vm-primary text-sm font-bold hover:text-vm-primary-dark transition-colors">Modifier</button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-50">
                    <div>
                      <p className="font-bold text-sm text-vm-text">Webhook URL</p>
                      <p className="text-slate-400 text-xs font-mono">{process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Non configure'}</p>
                    </div>
                    <button className="text-vm-primary text-sm font-bold hover:text-vm-primary-dark transition-colors">Modifier</button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-bold text-sm text-vm-text">Plan</p>
                      <p className="text-slate-400 text-sm">Gratuit — 5 reels / mois</p>
                    </div>
                    <button className="bg-vm-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-vm-primary-dark transition-all">
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
