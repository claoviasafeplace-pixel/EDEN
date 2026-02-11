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
      showToast('Lien copie !', 'info');
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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-eden-surface rounded-2xl max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end -mt-2 -mr-2 mb-4">
          <button onClick={onClose} className="text-eden-muted hover:text-white transition p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status-dependent content */}
        {reel.status === 'completed' && reel.video_916_url && (
          <div className="mb-6">
            <video
              controls
              src={reel.video_916_url}
              className="w-full rounded-xl bg-black"
              style={{ maxHeight: '400px' }}
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={reel.video_916_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-eden-gold text-eden-bg font-semibold py-3 px-4 rounded-xl text-center text-sm
                           hover:bg-eden-gold-hover transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Reel 9:16
              </a>
              {reel.video_1x1_url && (
                <a
                  href={reel.video_1x1_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-eden-gold text-eden-bg font-semibold py-3 px-4 rounded-xl text-center text-sm
                             hover:bg-eden-gold-hover transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Carre 1:1
                </a>
              )}
              <button
                onClick={handleCopyLink}
                className="flex-1 border border-eden-gold text-eden-gold font-semibold py-3 px-4 rounded-xl text-sm
                           hover:bg-eden-gold/10 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copier le lien
              </button>
            </div>
          </div>
        )}

        {reel.status === 'processing' && (
          <div className="flex flex-col items-center py-10 mb-6">
            <div className="w-12 h-12 border-3 border-eden-gold/30 border-t-eden-gold rounded-full animate-spin-slow" />
            <p className="text-eden-muted mt-4">Generation en cours... Cela prend environ 3 minutes</p>
            <p className="text-eden-dim text-sm mt-1">Cette page se met a jour automatiquement</p>
          </div>
        )}

        {reel.status === 'pending' && (
          <div className="flex flex-col items-center py-10 mb-6">
            <svg className="w-12 h-12 text-eden-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-eden-gold mt-4">En attente de traitement...</p>
          </div>
        )}

        {reel.status === 'error' && (
          <div className="flex flex-col items-center py-10 mb-6">
            <svg className="w-12 h-12 text-eden-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-eden-error mt-4">Une erreur est survenue lors de la generation</p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-eden-gold text-eden-bg font-semibold py-2.5 px-6 rounded-xl text-sm
                         hover:bg-eden-gold-hover transition-all"
            >
              Relancer la generation
            </button>
          </div>
        )}

        {/* Property info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div>
            <span className="text-eden-muted text-[13px]">Ville</span>
            <p className="text-white text-[15px] mt-0.5">{reel.ville}</p>
          </div>
          <div>
            <span className="text-eden-muted text-[13px]">Quartier</span>
            <p className="text-white text-[15px] mt-0.5">{reel.quartier}</p>
          </div>
          <div>
            <span className="text-eden-muted text-[13px]">Prix</span>
            <p className="text-eden-gold font-bold text-[15px] mt-0.5">{reel.prix} €</p>
          </div>
          <div>
            <span className="text-eden-muted text-[13px]">Contact</span>
            <p className="text-white text-[15px] mt-0.5">{reel.contact}</p>
          </div>
          <div>
            <span className="text-eden-muted text-[13px]">Telephone</span>
            <p className="text-white text-[15px] mt-0.5">{reel.telephone || '—'}</p>
          </div>
          <div>
            <span className="text-eden-muted text-[13px]">Date de creation</span>
            <p className="text-eden-muted text-[15px] mt-0.5">
              {new Date(reel.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Delete */}
        <div className="flex justify-end border-t border-eden-border pt-4">
          <button
            onClick={handleDelete}
            className="text-eden-muted text-[13px] hover:text-eden-error transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
