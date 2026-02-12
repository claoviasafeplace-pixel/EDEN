'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Reel } from '@/lib/types';

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedReelIdRef = useRef<number | null>(null);

  useEffect(() => { selectedReelIdRef.current = selectedReel?.id ?? null; }, [selectedReel]);

  const fetchReels = useCallback(async () => {
    const { data, error } = await supabase
      .from('reels')
      .select('*, media_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Sort media_items by sort_order within each reel
      const sorted = (data as Reel[]).map((r) => ({
        ...r,
        media_items: r.media_items
          ? [...r.media_items].sort((a, b) => a.sort_order - b.sort_order)
          : [],
      }));
      setReels(sorted);
      if (selectedReelIdRef.current) {
        const updated = sorted.find((r) => r.id === selectedReelIdRef.current);
        if (updated) setSelectedReel(updated);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  // Poll faster (5s) when processing, normal (15s) when idle
  useEffect(() => {
    const hasPending = reels.some(r => r.status === 'pending' || r.status === 'processing');
    const interval = hasPending ? 5000 : 15000;

    if (hasPending && !intervalRef.current) {
      intervalRef.current = setInterval(fetchReels, interval);
    } else if (hasPending && intervalRef.current) {
      // Switch interval speed if needed
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchReels, interval);
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

  const stats = {
    total: reels.length,
    processing: reels.filter(r => r.status === 'processing' || r.status === 'pending').length,
    completed: reels.filter(r => r.status === 'completed').length,
  };

  return { reels, loading, selectedReel, setSelectedReel, fetchReels, stats };
}
