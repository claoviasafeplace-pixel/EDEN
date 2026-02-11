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
      <div className="relative bg-white w-full max-w-[720px] rounded-[3rem] shadow-2xl overflow-hidden animate-slide-in-bottom max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-lg rounded-t-[3rem] px-8 lg:px-10 pt-8 pb-5 border-b border-slate-50 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-vm-text tracking-tight">
                {reel.ville} — {reel.quartier}
              </h2>
              <p className="text-vm-primary font-black text-xl mt-1">{reel.prix} €</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
              <X className="w-6 h-6 text-slate-300 group-hover:text-vm-text transition-colors" />
            </button>
          </div>
        </div>

        <div className="px-8 lg:px-10 py-8 space-y-8">
          {/* Completed */}
          {reel.status === 'completed' && reel.video_916_url && (
            <div className="space-y-4">
              <video controls src={reel.video_916_url} className="w-full rounded-[2rem] bg-slate-900" style={{ maxHeight: '400px' }} />
              <div className="grid grid-cols-3 gap-3">
                <a href={reel.video_916_url} download target="_blank" rel="noopener noreferrer"
                  className="bg-vm-primary text-white font-bold py-3.5 px-4 rounded-2xl text-center text-sm
                             hover:bg-vm-primary-dark transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(193,134,107,0.25)]">
                  <Download className="w-4 h-4" /> 9:16
                </a>
                {reel.video_1x1_url && (
                  <a href={reel.video_1x1_url} download target="_blank" rel="noopener noreferrer"
                    className="bg-vm-text text-white font-bold py-3.5 px-4 rounded-2xl text-center text-sm
                               hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Download className="w-4 h-4" /> 1:1
                  </a>
                )}
                <button onClick={handleCopyLink}
                  className="border-2 border-slate-100 text-vm-text font-bold py-3.5 px-4 rounded-2xl text-sm
                             hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copier
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {reel.status === 'processing' && (
            <div className="flex flex-col items-center py-16 bg-blue-50/30 rounded-[2rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-5">
                <Zap className="w-8 h-8 text-blue-500 animate-spin-slow" />
              </div>
              <p className="text-vm-text font-black text-lg">Generation en cours...</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Environ 3 minutes — mise a jour automatique</p>
            </div>
          )}

          {/* Pending */}
          {reel.status === 'pending' && (
            <div className="flex flex-col items-center py-16 bg-amber-50/30 rounded-[2rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-5">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-amber-700 font-black text-lg">En attente de traitement</p>
            </div>
          )}

          {/* Error */}
          {reel.status === 'error' && (
            <div className="flex flex-col items-center py-16 bg-red-50/30 rounded-[2rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-500 font-black text-lg">Une erreur est survenue</p>
              <button onClick={handleRetry}
                className="mt-5 bg-vm-primary text-white font-bold py-3 px-6 rounded-2xl text-sm
                           hover:bg-vm-primary-dark transition-all shadow-[0_4px_16px_rgba(193,134,107,0.25)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Relancer la generation
              </button>
            </div>
          )}

          {/* Property info */}
          <div className="bg-slate-50/60 rounded-[2rem] p-6 grid grid-cols-2 gap-5">
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
              className="text-slate-400 text-[13px] hover:text-red-500 transition-all flex items-center gap-1.5
                         py-2 px-3 rounded-xl hover:bg-red-50 font-bold">
              <Trash2 className="w-4 h-4" /> Supprimer ce reel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
