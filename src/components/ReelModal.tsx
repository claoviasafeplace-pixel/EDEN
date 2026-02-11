'use client';

import { Reel } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';

interface ReelModalProps {
  reel: Reel;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export default function ReelModal({ reel, onClose, onDeleted, onUpdated }: ReelModalProps) {
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    if (reel.video_916_url) {
      await navigator.clipboard.writeText(reel.video_916_url);
      showToast('Lien copie dans le presse-papier', 'info');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce reel ?')) return;
    const { error } = await supabase.from('reels').delete().eq('id', reel.id);
    if (error) {
      showToast('Erreur lors de la suppression', 'error');
      return;
    }
    showToast('Reel supprime', 'success');
    onDeleted();
  };

  const handleRetry = async () => {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL!;
    try {
      await supabase.from('reels').update({ status: 'processing' }).eq('id', reel.id);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: reel.id,
          ville: reel.ville,
          quartier: reel.quartier,
          prix: reel.prix,
          image_facade_url: reel.image_facade_url,
          image_interieur_url: reel.image_interieur_url,
          contact: reel.contact,
          telephone: reel.telephone,
        }),
      });
      showToast('Generation relancee !', 'success');
      onUpdated();
    } catch {
      showToast('Erreur lors de la relance', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in
                    shadow-[0_24px_64px_rgba(28,43,58,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl text-vm-text">
              {reel.ville} — {reel.quartier}
            </h2>
            <p className="text-vm-accent font-bold text-lg">{reel.prix} €</p>
          </div>
          <button onClick={onClose} className="text-vm-dim hover:text-vm-text transition p-2 rounded-xl hover:bg-vm-input">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status-dependent content */}
        {reel.status === 'completed' && reel.video_916_url && (
          <div className="mb-6">
            <video
              controls
              src={reel.video_916_url}
              className="w-full rounded-2xl bg-vm-text"
              style={{ maxHeight: '400px' }}
            />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <a
                href={reel.video_916_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-vm-accent text-white font-semibold py-3 px-4 rounded-xl text-center text-sm
                           hover:bg-vm-accent-hover transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                9:16
              </a>
              {reel.video_1x1_url && (
                <a
                  href={reel.video_1x1_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vm-primary text-white font-semibold py-3 px-4 rounded-xl text-center text-sm
                             hover:bg-vm-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  1:1
                </a>
              )}
              <button
                onClick={handleCopyLink}
                className="border border-vm-border text-vm-text font-semibold py-3 px-4 rounded-xl text-sm
                           hover:bg-vm-input transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copier
              </button>
            </div>
          </div>
        )}

        {reel.status === 'processing' && (
          <div className="flex flex-col items-center py-12 mb-6 bg-blue-50/50 rounded-2xl">
            <div className="w-12 h-12 border-[3px] border-blue-100 border-t-vm-info rounded-full animate-spin-slow" />
            <p className="text-vm-text font-medium mt-5">Generation en cours...</p>
            <p className="text-vm-muted text-sm mt-1">Environ 3 minutes — mise a jour automatique</p>
          </div>
        )}

        {reel.status === 'pending' && (
          <div className="flex flex-col items-center py-12 mb-6 bg-amber-50/50 rounded-2xl">
            <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-700 font-medium mt-4">En attente de traitement</p>
          </div>
        )}

        {reel.status === 'error' && (
          <div className="flex flex-col items-center py-12 mb-6 bg-red-50/50 rounded-2xl">
            <svg className="w-12 h-12 text-vm-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-vm-error font-medium mt-4">Une erreur est survenue</p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-vm-accent text-white font-semibold py-2.5 px-6 rounded-xl text-sm
                         hover:bg-vm-accent-hover transition-all shadow-sm"
            >
              Relancer la generation
            </button>
          </div>
        )}

        {/* Property info */}
        <div className="bg-vm-input rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Ville</span>
              <p className="text-vm-text text-[15px] mt-0.5 font-medium">{reel.ville}</p>
            </div>
            <div>
              <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Quartier</span>
              <p className="text-vm-text text-[15px] mt-0.5 font-medium">{reel.quartier}</p>
            </div>
            <div>
              <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Contact</span>
              <p className="text-vm-text text-[15px] mt-0.5">{reel.contact}</p>
            </div>
            <div>
              <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Telephone</span>
              <p className="text-vm-text text-[15px] mt-0.5">{reel.telephone || '—'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Date de creation</span>
              <p className="text-vm-muted text-sm mt-0.5">
                {new Date(reel.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Delete */}
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            className="text-vm-dim text-[13px] hover:text-vm-error transition flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer ce reel
          </button>
        </div>
      </div>
    </div>
  );
}
