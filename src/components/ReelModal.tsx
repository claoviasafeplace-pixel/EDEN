'use client';

import { Reel } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { X, Download, Copy, RefreshCw, Trash2, MapPin, Phone, User, Calendar, Loader2, AlertTriangle, Clock } from 'lucide-react';

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
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] max-w-[720px] w-full max-h-[90vh] overflow-y-auto animate-modal-in
                    shadow-[0_32px_80px_rgba(0,0,0,0.12)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-lg rounded-t-[2rem] px-8 pt-7 pb-5 border-b border-vm-border-light z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl text-vm-text">
                {reel.ville} — {reel.quartier}
              </h2>
              <p className="text-vm-primary font-bold text-lg mt-0.5">{reel.prix} €</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-vm-muted hover:text-vm-text hover:bg-vm-input transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Completed — Video + downloads */}
          {reel.status === 'completed' && reel.video_916_url && (
            <div className="mb-6">
              <video
                controls
                src={reel.video_916_url}
                className="w-full rounded-2xl bg-slate-900"
                style={{ maxHeight: '400px' }}
              />
              <div className="grid grid-cols-3 gap-3 mt-4">
                <a
                  href={reel.video_916_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vm-primary text-white font-semibold py-3 px-4 rounded-xl text-center text-sm
                             hover:bg-vm-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  9:16
                </a>
                {reel.video_1x1_url && (
                  <a
                    href={reel.video_1x1_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm
                               hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    1:1
                  </a>
                )}
                <button
                  onClick={handleCopyLink}
                  className="border border-vm-border text-vm-text font-semibold py-3 px-4 rounded-xl text-sm
                             hover:bg-vm-input transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {reel.status === 'processing' && (
            <div className="flex flex-col items-center py-14 mb-6 bg-blue-50/40 rounded-2xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-5">
                <Loader2 className="w-7 h-7 text-vm-info animate-spin-slow" />
              </div>
              <p className="text-vm-text font-semibold">Generation en cours...</p>
              <p className="text-vm-muted text-sm mt-1.5">Environ 3 minutes — mise a jour automatique</p>
            </div>
          )}

          {/* Pending */}
          {reel.status === 'pending' && (
            <div className="flex flex-col items-center py-14 mb-6 bg-amber-50/40 rounded-2xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-5">
                <Clock className="w-7 h-7 text-vm-warning" />
              </div>
              <p className="text-amber-700 font-semibold">En attente de traitement</p>
            </div>
          )}

          {/* Error */}
          {reel.status === 'error' && (
            <div className="flex flex-col items-center py-14 mb-6 bg-red-50/40 rounded-2xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-5">
                <AlertTriangle className="w-7 h-7 text-vm-error" />
              </div>
              <p className="text-vm-error font-semibold">Une erreur est survenue</p>
              <button
                onClick={handleRetry}
                className="mt-4 bg-vm-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm
                           hover:bg-vm-primary-hover transition-all shadow-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Relancer la generation
              </button>
            </div>
          )}

          {/* Property info */}
          <div className="bg-vm-input/50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-vm-muted mt-0.5 shrink-0" />
                <div>
                  <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">Ville</span>
                  <p className="text-vm-text text-sm mt-0.5 font-medium">{reel.ville}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-vm-muted mt-0.5 shrink-0" />
                <div>
                  <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">Quartier</span>
                  <p className="text-vm-text text-sm mt-0.5 font-medium">{reel.quartier}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-vm-muted mt-0.5 shrink-0" />
                <div>
                  <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">Contact</span>
                  <p className="text-vm-text text-sm mt-0.5">{reel.contact}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-vm-muted mt-0.5 shrink-0" />
                <div>
                  <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">Telephone</span>
                  <p className="text-vm-text text-sm mt-0.5">{reel.telephone || '—'}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-vm-muted mt-0.5 shrink-0" />
                <div>
                  <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">Date de creation</span>
                  <p className="text-vm-muted text-sm mt-0.5">
                    {new Date(reel.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-2 pb-2">
            <button
              onClick={handleDelete}
              className="text-vm-muted text-[13px] hover:text-vm-error transition-all flex items-center gap-1.5
                         py-2 px-3 rounded-xl hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ce reel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
