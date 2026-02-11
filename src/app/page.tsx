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
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-10">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un mandat ou un reel..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-transparent border-2 focus:bg-white focus:border-vm-primary/30 rounded-2xl text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <span className="text-sm font-bold block">Eden ERA</span>
              <span className="text-[11px] text-vm-primary font-medium uppercase tracking-wider">Directrice Marketing</span>
            </div>
            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden ring-4 ring-slate-50 cursor-pointer hover:scale-105 transition-transform bg-vm-primary-light flex items-center justify-center">
              <span className="text-vm-primary font-black text-lg">E</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-12">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Title bar */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-vm-text">Dashboard</h1>
                  <p className="text-slate-500 mt-2 font-medium">Vos mandats transformes en contenus viraux par l&apos;IA.</p>
                </div>
                <div className="hidden md:flex gap-2">
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Derniere activite : {reels.length > 0 ? 'Recemment' : 'Aucune'}
                  </div>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-7 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm
                                          hover:shadow-[0_16px_48px_rgba(193,134,107,0.06)] transition-all duration-500 group">
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                                     group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em]">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-4xl font-black text-vm-text">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reels Section */}
              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="w-12 h-12 border-[3px] border-slate-200 border-t-vm-primary rounded-full animate-spin-slow" />
                </div>
              ) : reels.length === 0 ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-vm-primary/20 to-orange-200/20 rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative bg-white border border-slate-100 rounded-[3.5rem] p-16 lg:p-20 flex flex-col items-center justify-center text-center space-y-10 min-h-[500px]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-vm-primary blur-3xl opacity-10 animate-glow-bg" />
                      <div className="bg-vm-primary-light w-32 h-32 rounded-[2.5rem] flex items-center justify-center relative border border-vm-primary/10">
                        <Video className="w-14 h-14 text-vm-primary" />
                        <div className="absolute -top-2 -right-2 bg-vm-primary p-2 rounded-full text-white shadow-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="max-w-md space-y-4">
                      <h3 className="text-3xl font-black text-vm-text tracking-tight">Prete a buzzer ?</h3>
                      <p className="text-slate-400 leading-relaxed text-lg font-medium">
                        Deposez les photos de votre nouveau mandat. Notre IA s&apos;occupe du meuble virtuel et du montage rythme.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="group/btn bg-vm-text text-white px-12 py-6 rounded-[2rem] font-bold text-xl
                                 flex items-center gap-4 hover:bg-vm-primary transition-all hover:scale-105
                                 shadow-[0_16px_48px_rgba(26,26,26,0.2)] active:scale-100"
                    >
                      Demarrer la creation
                      <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-vm-text tracking-tight">Mes Reels</h2>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="bg-vm-primary hover:bg-vm-primary-dark text-white px-6 py-3 rounded-2xl font-bold text-sm
                                 shadow-[0_4px_16px_rgba(193,134,107,0.25)] transition-all hover:-translate-y-0.5
                                 active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Nouveau Reel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-vm-text">Parametres</h1>
                <p className="text-slate-500 mt-2 font-medium">Configurez votre compte et vos preferences.</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="font-black text-lg text-vm-text mb-6">Compte</h3>
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
