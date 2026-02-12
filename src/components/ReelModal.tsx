'use client';

import { useState, useEffect } from 'react';
import type { Reel } from '@/lib/types';
import { PIPELINE_LABELS, ROOM_LABELS } from '@/lib/types';
import { formatPrix, formatLocation } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import ProgressView from './create/ProgressView';
import ConfirmDialog from './ui/ConfirmDialog';
import AIRevealPreview from './AIRevealPreview';
import { Download, Copy, RefreshCw, Trash2, Plus, CheckCircle2, AlertTriangle, Clock, Instagram, Film, Send, Loader2, Zap, Play } from 'lucide-react';

interface ReelModalProps {
  reel: Reel;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export default function ReelModal({ reel, onClose, onDeleted, onUpdated }: ReelModalProps) {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishIG, setPublishIG] = useState(true);
  const [publishTT, setPublishTT] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; error?: string }> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopyCaption = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    showToast(`Caption ${platform} copiee`, 'info');
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('reels').delete().eq('id', reel.id);
    if (error) { showToast('Erreur lors de la suppression', 'error'); return; }
    showToast('Reel supprime', 'success');
    onDeleted();
  };

  const handlePublish = async () => {
    const platforms: string[] = [];
    if (publishIG) platforms.push('instagram');
    if (publishTT) platforms.push('tiktok');
    if (platforms.length === 0) return;

    setPublishing(true);
    setPublishResults(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reel_id: reel.id, platforms }),
      });
      const data = await res.json();
      setPublishResults(data.results);
      const allOk = Object.values(data.results as Record<string, { success: boolean }>).every(r => r.success);
      if (allOk) {
        showToast('Publie avec succes !', 'success');
        onUpdated();
      } else {
        showToast('Publication partielle — voir details', 'error');
      }
    } catch {
      showToast('Erreur lors de la publication', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleRetry = async () => {
    try {
      await supabase.from('reels').update({ status: 'processing', pipeline_stage: 'analyzing', pipeline_progress: 0 }).eq('id', reel.id);
      await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: reel.id, ville: reel.ville, quartier: reel.quartier, prix: reel.prix,
          contact: reel.contact, telephone: reel.telephone,
          content_type: reel.content_type, enable_veo3: reel.enable_veo3,
          enable_staging: reel.enable_staging, duration_seconds: reel.duration_seconds,
        }),
      });
      showToast('Generation relancee', 'success');
      onUpdated();
    } catch { showToast('Erreur lors de la relance', 'error'); }
  };

  const location = formatLocation(reel.ville, reel.quartier);
  const prix = formatPrix(reel.prix);
  const coverUrl = reel.media_items?.[0]?.url || reel.image_facade_url;
  const secondUrl = reel.media_items?.[1]?.url || reel.image_interieur_url;
  const hasStaging = coverUrl && secondUrl;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-8" role="dialog" aria-modal="true">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal */}
        <div className="bg-white w-full max-w-5xl rounded-[32px] overflow-hidden flex shadow-2xl animate-modal-in relative">

          {/* LEFT: Preview Verticale (400px black) */}
          <div className="w-[400px] bg-black relative flex items-center justify-center p-6 shrink-0 hidden md:flex">
            {reel.status === 'completed' && reel.video_916_url ? (
              <div className="w-full h-full rounded-xl overflow-hidden">
                <video controls src={reel.video_916_url} className="w-full h-full object-contain" />
              </div>
            ) : hasStaging ? (
              <AIRevealPreview beforeUrl={coverUrl!} afterUrl={secondUrl!} />
            ) : coverUrl ? (
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center text-center p-10">
                  <h4 className="text-white font-black text-3xl uppercase tracking-tighter mb-2 leading-none">
                    {reel.ville || 'VIMMO'}<br/>{reel.quartier || ''}
                  </h4>
                  <p className="text-white font-light tracking-[0.3em] uppercase text-xs mb-8">Propriete d&apos;exception</p>
                  <div className="bg-white text-black px-6 py-2 rounded-full font-black text-xl">
                    {prix}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play size={48} className="text-white/20" />
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div className="flex-1 p-10 flex flex-col max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{reel.ville || 'Sans ville'}</h2>
                <div className="flex items-center gap-2 text-slate-500">
                  {reel.status === 'completed' ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium">Reel genere avec succes par l&apos;IA VIMMO</span>
                    </>
                  ) : reel.status === 'processing' ? (
                    <>
                      <Zap size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">{reel.pipeline_stage ? PIPELINE_LABELS[reel.pipeline_stage] : 'Generation en cours...'}</span>
                    </>
                  ) : reel.status === 'error' ? (
                    <>
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-sm font-medium">Erreur lors de la generation</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-amber-500" />
                      <span className="text-sm font-medium">En attente de traitement</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Processing progress */}
            {reel.status === 'processing' && (
              <div className="mb-6">
                <ProgressView stage={reel.pipeline_stage} progress={reel.pipeline_progress} />
              </div>
            )}

            {/* Error state */}
            {reel.status === 'error' && (
              <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-100 text-center">
                {reel.error_message && <p className="text-sm text-red-600 mb-3">{reel.error_message}</p>}
                <button onClick={handleRetry}
                  className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors">
                  <RefreshCw size={14} /> Relancer
                </button>
              </div>
            )}

            {/* Content */}
            <div className="space-y-6 flex-1">
              {/* AI metadata cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                  <p className="font-bold">{location}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prix</p>
                  <p className="font-bold text-amber-600">{prix}</p>
                </div>
              </div>

              {/* Media strip */}
              {reel.media_items && reel.media_items.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Medias ({reel.media_items.length})
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {reel.media_items.map((item) => (
                      <div key={item.id} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden relative border border-slate-100">
                        <img
                          src={item.thumbnail_url || item.url}
                          alt={item.room_type ? ROOM_LABELS[item.room_type] : ''}
                          className="w-full h-full object-cover"
                        />
                        {item.media_type === 'video' && (
                          <div className="absolute top-1 right-1">
                            <Film className="w-3 h-3 text-white drop-shadow-md" />
                          </div>
                        )}
                        {item.room_type && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                            <span className="text-white text-[8px] font-medium truncate block">{ROOM_LABELS[item.room_type]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Captions — AI copywriting */}
              {reel.caption_instagram && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Copywriting Instagram (Genere par IA)</p>
                    <button
                      onClick={() => handleCopyCaption(reel.caption_instagram!, 'Instagram')}
                      className="text-[11px] text-slate-500 font-bold hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Copy size={10} /> Copier
                    </button>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-sm leading-relaxed border border-slate-100">
                    {reel.caption_instagram}
                  </div>
                </div>
              )}

              {reel.caption_tiktok && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Copywriting TikTok (Genere par IA)</p>
                    <button
                      onClick={() => handleCopyCaption(reel.caption_tiktok!, 'TikTok')}
                      className="text-[11px] text-slate-500 font-bold hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Copy size={10} /> Copier
                    </button>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-sm leading-relaxed border border-slate-100">
                    {reel.caption_tiktok}
                  </div>
                </div>
              )}

              {/* Publish to social */}
              {reel.status === 'completed' && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publication directe</p>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={publishIG} onChange={(e) => setPublishIG(e.target.checked)}
                        disabled={publishing || !!reel.instagram_post_id} className="w-4 h-4 rounded accent-slate-900" />
                      <Instagram size={16} className="text-pink-600" />
                      <span className="text-sm font-medium">Instagram</span>
                      {reel.instagram_post_id && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={publishTT} onChange={(e) => setPublishTT(e.target.checked)}
                        disabled={publishing || !!reel.tiktok_post_id} className="w-4 h-4 rounded accent-slate-900" />
                      <Film size={16} />
                      <span className="text-sm font-medium">TikTok</span>
                      {reel.tiktok_post_id && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </label>
                  </div>
                  {publishResults && (
                    <div className="space-y-1.5">
                      {Object.entries(publishResults).map(([platform, result]) => (
                        <div key={platform} className={`text-xs px-3 py-2 rounded-lg ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {platform === 'instagram' ? 'Instagram' : 'TikTok'}: {result.success ? 'Publie' : result.error}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handlePublish}
                    disabled={publishing || (!publishIG && !publishTT) || (!!reel.instagram_post_id && !!reel.tiktok_post_id)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {publishing ? 'Publication...' : reel.instagram_post_id && reel.tiktok_post_id ? 'Deja publie' : 'Publier'}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom action buttons */}
            <div className="mt-10 flex gap-4">
              {reel.status === 'completed' && reel.video_916_url ? (
                <>
                  <a href={reel.video_916_url} download target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:scale-[1.02] transition-transform">
                    <Download size={18} /> Telecharger le Reel
                  </a>
                  <button
                    onClick={() => { if (reel.video_916_url) { navigator.clipboard.writeText(reel.video_916_url); showToast('Lien copie', 'info'); } }}
                    className="px-6 border-2 border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Partager
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-6 border-2 border-red-200 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              )}
            </div>

            {/* Delete link for completed too */}
            {reel.status === 'completed' && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowConfirm(true)}
                  className="text-slate-400 text-xs hover:text-red-600 transition-colors flex items-center gap-1.5 py-1 cursor-pointer">
                  <Trash2 size={12} /> Supprimer ce reel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Supprimer ce reel ?"
        description="Cette action est irreversible. Le reel et ses videos seront definitivement supprimes."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => { setShowConfirm(false); handleDelete(); }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
