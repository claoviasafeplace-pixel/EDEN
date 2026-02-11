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
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: 'Total Reels',
              value: totalReels,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              ),
              color: 'text-vm-primary',
              bg: 'bg-[rgba(43,95,120,0.08)]',
            },
            {
              label: 'En cours',
              value: processingCount,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: 'text-vm-info',
              bg: 'bg-blue-50',
            },
            {
              label: 'Termines',
              value: completedCount,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ),
              color: 'text-vm-success',
              bg: 'bg-emerald-50',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-vm-border rounded-2xl py-5 px-7 flex items-center gap-5
                         shadow-[0_1px_4px_rgba(139,109,79,0.04)]"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <span className="text-[28px] font-bold text-vm-text leading-none">{stat.value}</span>
                <p className={`${stat.color} text-sm font-medium mt-0.5`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-vm-border border-t-vm-accent rounded-full animate-spin-slow" />
          </div>
        ) : reels.length === 0 ? (
          <div className="flex flex-col items-center py-24">
            <div className="w-24 h-24 bg-vm-input rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-vm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-vm-text">
              Aucun reel pour l&apos;instant
            </h2>
            <p className="text-vm-muted mt-2 text-center max-w-md">
              Creez votre premier reel immobilier professionnel en quelques clics.
              Uploadez vos photos, renseignez les informations et laissez la magie operer.
            </p>
            <Link
              href="/nouveau"
              className="mt-8 bg-vm-accent text-white font-semibold py-3.5 px-8 rounded-xl
                         hover:bg-vm-accent-hover shadow-sm hover:shadow-md
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Creer mon premier Reel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {selectedReel && (
        <ReelModal
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onDeleted={() => { setSelectedReel(null); fetchReels(); }}
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
