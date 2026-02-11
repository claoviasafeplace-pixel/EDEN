'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { X, Upload, ArrowRight, Sparkles, ChevronLeft, Check, Camera, Image } from 'lucide-react';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

function formatPrix(value: string): string {
  return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function PhotoUpload({ label, sublabel, imageUrl, onUploaded, folder, icon }: {
  label: string; sublabel: string; imageUrl: string | null;
  onUploaded: (url: string) => void; folder: string; icon: React.ReactNode;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET); fd.append('folder', folder);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) onUploaded(data.secure_url);
    } catch (err) { console.error('Upload error:', err); }
    setUploading(false);
  };

  const handleDrop = (e: DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) uploadFile(f); };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) uploadFile(f); };

  if (imageUrl) {
    return (
      <div className="relative rounded-[1.5rem] overflow-hidden h-[200px] group">
        <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <span className="text-white text-xs font-bold">{label}</span>
        </div>
        <button onClick={() => inputRef.current?.click()}
          className="absolute top-3 right-3 bg-white/90 text-vm-text text-xs px-3 py-1.5 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm">
          Changer
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop} onClick={() => inputRef.current?.click()}
      className={`h-[200px] rounded-[1.5rem] border-4 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300
        ${dragOver ? 'border-vm-primary/40 bg-vm-primary-light scale-[1.01]' : 'border-slate-100 hover:border-vm-primary/20 hover:bg-vm-primary-light/50 bg-slate-50/50'}`}
    >
      {uploading ? (
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-vm-primary rounded-full animate-spin-slow" />
      ) : (
        <>
          <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">{icon}</div>
          <p className="text-sm font-bold text-vm-text">{label}</p>
          <p className="text-[11px] text-slate-400 font-medium">{sublabel}</p>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}

interface Props { onClose: () => void; onCreated: () => void; }

export default function CreateReelModal({ onClose, onCreated }: Props) {
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [facadeUrl, setFacadeUrl] = useState<string | null>(null);
  const [interiorUrl, setInteriorUrl] = useState<string | null>(null);
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [prix, setPrix] = useState('');
  const [contact, setContact] = useState('Eden - ERA Immobilier');
  const [telephone, setTelephone] = useState('');

  const step1Valid = !!facadeUrl && !!interiorUrl;
  const step2Valid = ville.trim() !== '' && quartier.trim() !== '' && prix.trim() !== '';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('reels').insert({
        ville, quartier, prix, image_facade_url: facadeUrl, image_interieur_url: interiorUrl,
        contact, telephone, status: 'pending',
      }).select('id').single();
      if (error || !data) { showToast('Erreur lors de la creation', 'error'); setSubmitting(false); return; }
      await fetch(WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id: data.id, ville, quartier, prix, image_facade_url: facadeUrl, image_interieur_url: interiorUrl, contact, telephone }),
      });
      await supabase.from('reels').update({ status: 'processing' }).eq('id', data.id);
      showToast('Reel lance avec succes !', 'success');
      onCreated(); onClose();
    } catch { showToast('Erreur lors du lancement', 'error'); setSubmitting(false); }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-vm-primary/30 rounded-[1.5rem] outline-none text-slate-700 font-bold placeholder:text-slate-300 transition-all text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-vm-text/40 backdrop-blur-md animate-overlay-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-in-bottom max-h-[92vh] overflow-y-auto">
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="bg-vm-primary-light text-vm-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
                Etape {step + 1} / 3
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-vm-text tracking-tight">
                {step === 0 ? 'Photos du bien' : step === 1 ? 'Informations' : 'Recapitulatif'}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
              <X className="w-6 h-6 text-slate-300 group-hover:text-vm-text transition-colors" />
            </button>
          </div>

          {/* Step 1 — Photos */}
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Medias du mandat</label>
                <div className="grid grid-cols-2 gap-4">
                  <PhotoUpload label="Facade" sublabel="Glissez ou cliquez" imageUrl={facadeUrl} onUploaded={setFacadeUrl}
                    folder="eden-reels/facades" icon={<Camera className="w-6 h-6" />} />
                  <PhotoUpload label="Interieur" sublabel="Glissez ou cliquez" imageUrl={interiorUrl} onUploaded={setInteriorUrl}
                    folder="eden-reels/interiors" icon={<Image className="w-6 h-6" />} />
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!step1Valid}
                className="w-full bg-vm-primary text-white px-8 py-5 rounded-[2rem] font-black text-lg
                           shadow-[0_8px_32px_rgba(193,134,107,0.3)] hover:bg-vm-primary-dark transition-all
                           flex items-center justify-center gap-3 active:scale-[0.98]
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                Suivant <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2 — Info */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Ville *</label>
                  <input type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Tours, Saint-Cyr..." className={inputClass} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Quartier *</label>
                  <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)} placeholder="Beaujardin, Centre..." className={inputClass} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Prix *</label>
                  <input type="text" value={prix} onChange={e => setPrix(formatPrix(e.target.value))} placeholder="250 000" className={inputClass} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Telephone</label>
                  <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 XX XX XX XX" className={inputClass} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-vm-primary ml-1">Contact</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} className={inputClass} />
              </div>

              {/* AI Info card */}
              <div className="bg-vm-text p-6 rounded-[2rem] flex gap-5 items-center">
                <div className="bg-vm-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(193,134,107,0.3)] shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-tight">Generation Automatique</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1 font-medium">
                    L&apos;IA va meubler vos pieces et caler le montage sur les beats de la musique.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(0)}
                  className="px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={() => setStep(2)} disabled={!step2Valid}
                  className="flex-1 bg-vm-primary text-white px-8 py-4 rounded-[2rem] font-black text-lg
                             shadow-[0_8px_32px_rgba(193,134,107,0.3)] hover:bg-vm-primary-dark transition-all
                             flex items-center justify-center gap-3 active:scale-[0.98]
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {facadeUrl && <div className="rounded-[1.5rem] overflow-hidden h-[160px] relative">
                  <img src={facadeUrl} alt="Facade" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <span className="text-white text-xs font-bold">Facade</span>
                  </div>
                </div>}
                {interiorUrl && <div className="rounded-[1.5rem] overflow-hidden h-[160px] relative">
                  <img src={interiorUrl} alt="Interieur" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <span className="text-white text-xs font-bold">Interieur</span>
                  </div>
                </div>}
              </div>
              <div className="bg-slate-50/80 rounded-[2rem] p-6 grid grid-cols-2 gap-5">
                {[
                  { l: 'Ville', v: ville }, { l: 'Quartier', v: quartier },
                  { l: 'Prix', v: `${prix} €`, h: true }, { l: 'Contact', v: contact },
                  ...(telephone ? [{ l: 'Telephone', v: telephone }] : []),
                ].map(i => (
                  <div key={i.l}>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{i.l}</span>
                    <p className={`text-sm mt-0.5 font-bold ${'h' in i ? 'text-vm-primary' : 'text-vm-text'}`}>{i.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Modifier
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 bg-vm-primary text-white px-8 py-5 rounded-[2rem] font-black text-lg
                             shadow-[0_8px_32px_rgba(193,134,107,0.3)] hover:bg-vm-primary-dark transition-all
                             flex items-center justify-center gap-3 active:scale-[0.98]
                             animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none">
                  {submitting ? (
                    <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin-slow" /> Creation magique...</>
                  ) : (
                    <>Generer la video <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
