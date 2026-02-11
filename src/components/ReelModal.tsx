'use client';

import { Reel } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { X, Download, Copy, RefreshCw, Trash2, MapPin, Phone, User, Calendar, Zap, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

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
      showToast('Generation relancee !', 'success');
      onUpdated();
    } catch { showToast('Erreur lors de la relance', 'error'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-vm-text/40 backdrop-blur-md animate-overlay-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg px-6 lg:px-8 pt-6 pb-4 border-b border-slate-100 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-vm-text">
                {reel.ville} — {reel.quartier}
              </h2>
              <p className="text-vm-primary font-bold text-lg mt-0.5">{reel.prix} €</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors group">
              <X className="w-5 h-5 text-slate-300 group-hover:text-vm-text transition-colors" />
            </button>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-6 space-y-6">
          {/* Completed */}
          {reel.status === 'completed' && reel.video_916_url && (
            <div className="space-y-4">
              <video controls src={reel.video_916_url} className="w-full rounded-xl bg-slate-900" style={{ maxHeight: '360px' }} />
              <div className="grid grid-cols-3 gap-3">
                <a href={reel.video_916_url} download target="_blank" rel="noopener noreferrer"
                  className="bg-vm-primary text-white font-bold py-3 px-4 rounded-xl text-center text-sm
                             hover:bg-vm-primary-dark transition-all flex items-center justify-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> 9:16
                </a>
                {reel.video_1x1_url && (
                  <a href={reel.video_1x1_url} download target="_blank" rel="noopener noreferrer"
                    className="bg-vm-text text-white font-bold py-3 px-4 rounded-xl text-center text-sm
                               hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> 1:1
                  </a>
                )}
                <button onClick={handleCopyLink}
                  className="border border-slate-200 text-vm-text font-bold py-3 px-4 rounded-xl text-sm
                             hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copier
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {reel.status === 'processing' && (
            <div className="flex flex-col items-center py-10 bg-blue-50/40 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <Zap className="w-6 h-6 text-blue-500 animate-spin-slow" />
              </div>
              <p className="text-vm-text font-bold">Generation en cours...</p>
              <p className="text-slate-400 text-sm mt-1">Environ 3 minutes</p>
            </div>
          )}

          {/* Pending */}
          {reel.status === 'pending' && (
            <div className="flex flex-col items-center py-10 bg-amber-50/40 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-amber-700 font-bold">En attente de traitement</p>
            </div>
          )}

          {/* Error */}
          {reel.status === 'error' && (
            <div className="flex flex-col items-center py-10 bg-red-50/40 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 font-bold">Une erreur est survenue</p>
              <button onClick={handleRetry}
                className="mt-4 bg-vm-primary text-white font-bold py-2.5 px-5 rounded-xl text-sm
                           hover:bg-vm-primary-dark transition-all shadow-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Relancer
              </button>
            </div>
          )}

          {/* Property info */}
          <div className="bg-slate-50/60 rounded-xl p-5 grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: 'Ville', value: reel.ville },
              { icon: MapPin, label: 'Quartier', value: reel.quartier },
              { icon: User, label: 'Contact', value: reel.contact },
              { icon: Phone, label: 'Telephone', value: reel.telephone || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  <p className="text-vm-text text-sm mt-0.5 font-medium">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="col-span-2 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Date de creation</span>
                <p className="text-slate-500 text-sm mt-0.5">
                  {new Date(reel.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <button onClick={handleDelete}
              className="text-slate-400 text-xs hover:text-red-500 transition-all flex items-center gap-1.5
                         py-2 px-3 rounded-lg hover:bg-red-50 font-medium">
              <Trash2 className="w-4 h-4" /> Supprimer ce reel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
