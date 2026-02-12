'use client';

import { useState } from 'react';
import { useReels } from '@/hooks/useReels';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import ReelModal from '@/components/ReelModal';
import CreateView from '@/components/create/CreateView';
import SocialConnections from '@/components/SocialConnections';
import PhotosTab from '@/components/PhotosTab';
import BioTab from '@/components/BioTab';
import { ToastProvider } from '@/components/Toast';

type TabId = 'dashboard' | 'create' | 'photos' | 'bio' | 'settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { reels, loading, selectedReel, setSelectedReel, fetchReels, stats } = useReels();

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => setActiveTab('create')}
        processingCount={stats.processing}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            reels={reels}
            loading={loading}
            stats={stats}
            onCreateClick={() => setActiveTab('create')}
            onSelectReel={setSelectedReel}
          />
        )}

        {activeTab === 'create' && (
          <CreateView
            onCreated={fetchReels}
            onNavigate={(tab) => setActiveTab(tab as TabId)}
          />
        )}

        {activeTab === 'photos' && <div className="animate-tab-enter"><PhotosTab /></div>}
        {activeTab === 'bio' && <div className="animate-tab-enter"><BioTab /></div>}

        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-2xl animate-tab-enter">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Parametres</h1>
              <p className="text-slate-500 text-sm mt-1">Configurez votre compte et vos preferences.</p>
            </div>

            <SocialConnections />

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-sm">Compte</h3>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-sm font-medium">Nom</p>
                    <p className="text-sm text-slate-500 mt-1">Eden - ERA Immobilier</p>
                  </div>
                  <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Modifier</button>
                </div>
                <div className="flex items-center justify-between px-6 py-5">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-medium">Webhook URL</p>
                    <p className="text-xs text-slate-400 font-mono mt-1 truncate">{process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Non configure'}</p>
                  </div>
                  <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors shrink-0 cursor-pointer">Modifier</button>
                </div>
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-sm text-slate-500 mt-1">Eden - ERA Immobilier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedReel && (
        <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)}
          onDeleted={() => { setSelectedReel(null); fetchReels(); }} onUpdated={fetchReels} />
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
