'use client';

import { Reel } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { X, Download, Copy, RefreshCw, Trash2, MapPin, Phone, User, Calendar, Zap, AlertTriangle, Clock } from 'lucide-react';

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
      showToast('Lien copie', 'info');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce reel ?')) return;
    const { error } = await supabase.from('reels').delete().eq('id', reel.id);
    if (error) { showToast('Erreur lors de la suppression', 'error'); return; }
    showToast('Reel supprime', 'success');
    onDeleted();
  };

  const handleRetry = async () => {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL!;
    try {
      await supabase.from('reels').update({ status: 'processing' }).eq('id', reel.id);
      await fetch(webhookUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: reel.id, ville: reel.ville, quartier: reel.quartier, prix: reel.prix,
          image_facade_url: reel.image_facade_url, image_interieur_url: reel.image_interieur_url,
          contact: reel.contact, telephone: reel.telephone,
        }),
      });
      showToast('Generation relancee', 'success');
      onUpdated();
    } catch { showToast('Erreur lors de la relance', 'error'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-5 pb-4 border-b border-slate-100 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-vm-text">{reel.ville} — {reel.quartier}</h2>
            <p className="text-vm-primary font-semibold mt-0.5">{reel.prix} €</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Completed */}
          {reel.status === 'completed' && reel.video_916_url && (
            <div className="space-y-3">
              <video controls src={reel.video_916_url} className="w-full rounded-lg bg-black" style={{ maxHeight: '320px' }} />
              <div className="grid grid-cols-3 gap-2">
                <a href={reel.video_916_url} download target="_blank" rel="noopener noreferrer"
                  className="bg-vm-primary text-white font-medium h-10 rounded-lg text-sm flex items-center justify-center gap-1.5 hover:bg-vm-primary-dark transition-colors">
                  <Download className="w-4 h-4" /> 9:16
                </a>
                {reel.video_1x1_url && (
                  <a href={reel.video_1x1_url} download target="_blank" rel="noopener noreferrer"
                    className="bg-slate-800 text-white font-medium h-10 rounded-lg text-sm flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4" /> 1:1
                  </a>
                )}
                <button onClick={handleCopyLink}
                  className="border border-slate-200 text-slate-600 font-medium h-10 rounded-lg text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                  <Copy className="w-4 h-4" /> Copier
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {reel.status === 'processing' && (
            <div className="flex flex-col items-center py-8 bg-blue-50 rounded-xl">
              <Zap className="w-8 h-8 text-blue-500 animate-spin-slow mb-3" />
              <p className="font-medium text-vm-text">Generation en cours...</p>
              <p className="text-slate-400 text-sm mt-1">Environ 3 minutes</p>
            </div>
          )}

          {/* Pending */}
          {reel.status === 'pending' && (
            <div className="flex flex-col items-center py-8 bg-amber-50 rounded-xl">
              <Clock className="w-8 h-8 text-amber-500 mb-3" />
              <p className="font-medium text-amber-700">En attente de traitement</p>
            </div>
          )}

          {/* Error */}
          {reel.status === 'error' && (
            <div className="flex flex-col items-center py-8 bg-red-50 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
              <p className="font-medium text-red-600">Une erreur est survenue</p>
              <button onClick={handleRetry}
                className="mt-4 bg-vm-primary text-white h-9 px-5 rounded-lg text-sm font-medium
                           hover:bg-vm-primary-dark transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Relancer
              </button>
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-slate-100">
            {[
              { icon: MapPin, label: 'Ville', value: reel.ville },
              { icon: MapPin, label: 'Quartier', value: reel.quartier },
              { icon: User, label: 'Contact', value: reel.contact },
              { icon: Phone, label: 'Telephone', value: reel.telephone || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">{item.label}</span>
                  <p className="text-sm text-vm-text mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="col-span-2 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wide">Date</span>
                <p className="text-sm text-slate-500 mt-0.5">
                  {new Date(reel.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button onClick={handleDelete}
              className="text-slate-400 text-xs hover:text-red-500 transition-colors flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
