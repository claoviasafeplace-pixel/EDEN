'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MusicTrack } from '@/lib/types';
import { Music, Check } from 'lucide-react';

interface MusicSelectorProps {
  selectedId: number | null;
  onChange: (id: number | null) => void;
}

export default function MusicSelector({ selectedId, onChange }: MusicSelectorProps) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('music_tracks')
      .select('*')
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        if (data) setTracks(data as MusicTrack[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="vm-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Music className="w-4 h-4 text-vm-muted" />
          <p className="text-sm font-semibold text-vm-text">Musique</p>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <div className="vm-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center shrink-0">
          <Music className="w-4 h-4 text-pink-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-vm-text">Musique de fond</p>
          <p className="text-[11px] text-vm-muted mt-0.5">Selectionnez un morceau</p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {/* No music option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer
            ${selectedId === null
              ? 'bg-vm-primary-light border-2 border-vm-primary'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }
          `}
        >
          <span className="text-sm font-medium text-vm-text">Sans musique</span>
          {selectedId === null && <Check className="w-4 h-4 text-vm-primary" />}
        </button>

        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => onChange(track.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer
              ${selectedId === track.id
                ? 'bg-vm-primary-light border-2 border-vm-primary'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <div>
              <p className="text-sm font-medium text-vm-text">{track.name}</p>
              <p className="text-[11px] text-vm-muted">
                {track.duration_seconds}s — {track.mood || track.genre}
              </p>
            </div>
            {selectedId === track.id && <Check className="w-4 h-4 text-vm-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
