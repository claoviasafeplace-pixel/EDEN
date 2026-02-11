'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Reel } from '@/lib/types';
import Header from '@/components/Header';
import ReelCard from '@/components/ReelCard';
import ReelModal from '@/components/ReelModal';
import { ToastProvider } from '@/components/Toast';
import Link from 'next/link';

function DashboardContent() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedReelIdRef = useRef<number | null>(null);

  // Keep ref in sync for use in fetchReels
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
      // Update selected reel if modal is open
      if (selectedReelIdRef.current) {
        const updated = data.find((r: Reel) => r.id === selectedReelIdRef.current);
        if (updated) setSelectedReel(updated as Reel);
      }
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Auto-polling: every 15s when any reel is pending/processing
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
    <div className="min-h-screen bg-eden-bg">
      <Header />

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-eden-surface border border-eden-border rounded-2xl py-5 px-7 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-eden-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-[32px] font-bold text-white">{totalReels}</span>
            </div>
            <p className="text-eden-muted text-sm mt-1">Total Reels</p>
          </div>
          <div className="bg-eden-surface border border-eden-border rounded-2xl py-5 px-7 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-eden-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[32px] font-bold text-white">{processingCount}</span>
            </div>
            <p className="text-eden-info text-sm mt-1">En cours</p>
          </div>
          <div className="bg-eden-surface border border-eden-border rounded-2xl py-5 px-7 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-eden-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[32px] font-bold text-white">{completedCount}</span>
            </div>
            <p className="text-eden-success text-sm mt-1">Termines</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-eden-gold/30 border-t-eden-gold rounded-full animate-spin-slow" />
          </div>
        ) : reels.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-24">
            <svg className="w-20 h-20 text-eden-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="font-heading text-[22px] font-bold text-white mt-6">
              Aucun reel pour l&apos;instant
            </h2>
            <p className="text-eden-muted mt-2 text-center">
              Creez votre premier reel immobilier en quelques clics
            </p>
            <Link
              href="/nouveau"
              className="mt-8 bg-eden-gold text-eden-bg font-semibold py-3 px-8 rounded-xl
                         hover:bg-eden-gold-hover hover:shadow-[0_4px_15px_rgba(200,169,81,0.3)]
                         transition-all duration-200"
            >
              Creer mon premier Reel
            </Link>
          </div>
        ) : (
          /* Reels grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Modal */}
      {selectedReel && (
        <ReelModal
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onDeleted={() => {
            setSelectedReel(null);
            fetchReels();
          }}
          onUpdated={fetchReels}
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
