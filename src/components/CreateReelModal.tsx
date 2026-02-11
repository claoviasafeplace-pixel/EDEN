'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toast';
import { X, Upload, Camera, ChevronRight, ChevronLeft, Check, Play, Image } from 'lucide-react';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

function formatPrix(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function PhotoUpload({
  label,
  sublabel,
  imageUrl,
  onUploaded,
  folder,
  icon,
}: {
  label: string;
  sublabel: string;
  imageUrl: string | null;
  onUploaded: (url: string) => void;
  folder: string;
  icon: React.ReactNode;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) onUploaded(data.secure_url);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  if (imageUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden h-[180px] group">
        <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <span className="text-white text-xs font-semibold">{label}</span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-vm-text text-xs px-3 py-1.5 rounded-lg
                     hover:bg-white transition shadow-sm font-medium opacity-0 group-hover:opacity-100"
        >
          Changer
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        h-[180px] rounded-2xl border-2 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-2
        transition-all duration-200
        ${dragOver
          ? 'border-vm-primary bg-vm-primary-light scale-[1.01]'
          : 'border-vm-dim/40 hover:border-vm-primary/40 hover:bg-vm-primary-light/50 bg-vm-input/50'
        }
      `}
    >
      {uploading ? (
        <div className="w-8 h-8 border-[3px] border-vm-dim border-t-vm-primary rounded-full animate-spin-slow" />
      ) : (
        <>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-vm-muted">
            {icon}
          </div>
          <span className="text-vm-text-secondary text-sm font-medium">{label}</span>
          <span className="text-vm-muted text-[11px]">{sublabel}</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}

interface CreateReelModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateReelModal({ onClose, onCreated }: CreateReelModalProps) {
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
      const { data, error } = await supabase
        .from('reels')
        .insert({
          ville, quartier, prix,
          image_facade_url: facadeUrl,
          image_interieur_url: interiorUrl,
          contact, telephone, status: 'pending',
        })
        .select('id')
        .single();

      if (error || !data) {
        showToast('Erreur lors de la creation du reel', 'error');
        setSubmitting(false);
        return;
      }

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: data.id, ville, quartier, prix,
          image_facade_url: facadeUrl,
          image_interieur_url: interiorUrl,
          contact, telephone,
        }),
      });

      await supabase.from('reels').update({ status: 'processing' }).eq('id', data.id);
      showToast('Reel lance avec succes !', 'success');
      onCreated();
      onClose();
    } catch {
      showToast('Erreur lors du lancement', 'error');
      setSubmitting(false);
    }
  };

  const steps = ['Photos', 'Informations', 'Confirmation'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] max-w-[600px] w-full max-h-[90vh] overflow-y-auto animate-modal-in
                    shadow-[0_32px_80px_rgba(0,0,0,0.12)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-vm-border-light">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-xl text-vm-text">Nouveau Reel</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-vm-muted hover:text-vm-text hover:bg-vm-input transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-0">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0
                      ${i < step
                        ? 'bg-vm-success text-white'
                        : i === step
                          ? 'bg-vm-primary text-white shadow-[0_2px_8px_rgba(193,134,107,0.3)]'
                          : 'bg-vm-input text-vm-dim'
                      }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-vm-text' : 'text-vm-dim'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-[2px] mx-2 rounded-full shrink-0 ${i < step ? 'bg-vm-success' : 'bg-vm-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Step 1 — Photos */}
          {step === 0 && (
            <div className="animate-fade-in">
              <p className="text-vm-text-secondary text-sm mb-5">
                Uploadez une photo de la facade et une de l&apos;interieur du bien.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <PhotoUpload
                  label="Facade"
                  sublabel="Glissez ou cliquez"
                  imageUrl={facadeUrl}
                  onUploaded={setFacadeUrl}
                  folder="eden-reels/facades"
                  icon={<Camera className="w-6 h-6" />}
                />
                <PhotoUpload
                  label="Interieur"
                  sublabel="Glissez ou cliquez"
                  imageUrl={interiorUrl}
                  onUploaded={setInteriorUrl}
                  folder="eden-reels/interiors"
                  icon={<Image className="w-6 h-6" />}
                />
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!step1Valid}
                className="w-full bg-vm-primary text-white font-semibold py-3.5 rounded-2xl text-sm
                           hover:bg-vm-primary-hover transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 — Info */}
          {step === 1 && (
            <div className="animate-fade-in">
              <p className="text-vm-text-secondary text-sm mb-5">
                Renseignez les informations du bien immobilier.
              </p>
              <div className="space-y-4 mb-6">
                {[
                  { key: 'ville', label: 'Ville', value: ville, set: setVille, placeholder: 'ex: Tours', required: true },
                  { key: 'quartier', label: 'Quartier', value: quartier, set: setQuartier, placeholder: 'ex: Beaujardin', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-vm-text text-sm font-medium mb-1.5 block">
                      {f.label} {f.required && <span className="text-vm-primary">*</span>}
                    </label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-vm-input text-vm-text placeholder-vm-dim py-3 px-4 rounded-xl text-sm
                                 outline-none transition-all border border-transparent
                                 focus:border-vm-primary focus:ring-2 focus:ring-vm-primary/10"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-vm-text text-sm font-medium mb-1.5 block">
                    Prix <span className="text-vm-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={prix}
                      onChange={e => setPrix(formatPrix(e.target.value))}
                      placeholder="ex: 250 000"
                      className="w-full bg-vm-input text-vm-text placeholder-vm-dim py-3 px-4 pr-10 rounded-xl text-sm
                                 outline-none transition-all border border-transparent
                                 focus:border-vm-primary focus:ring-2 focus:ring-vm-primary/10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-vm-muted text-sm font-medium">€</span>
                  </div>
                </div>
                <div>
                  <label className="text-vm-text text-sm font-medium mb-1.5 block">Contact</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="w-full bg-vm-input text-vm-text py-3 px-4 rounded-xl text-sm outline-none transition-all
                               border border-transparent focus:border-vm-primary focus:ring-2 focus:ring-vm-primary/10"
                  />
                </div>
                <div>
                  <label className="text-vm-text text-sm font-medium mb-1.5 block">Telephone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="06 XX XX XX XX"
                    className="w-full bg-vm-input text-vm-text placeholder-vm-dim py-3 px-4 rounded-xl text-sm
                               outline-none transition-all border border-transparent
                               focus:border-vm-primary focus:ring-2 focus:ring-vm-primary/10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 border border-vm-border text-vm-text font-semibold py-3 rounded-2xl text-sm
                             hover:bg-vm-input transition-all flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Precedent
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!step2Valid}
                  className="flex-[2] bg-vm-primary text-white font-semibold py-3 rounded-2xl text-sm
                             hover:bg-vm-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirmation */}
          {step === 2 && (
            <div className="animate-fade-in">
              <p className="text-vm-text-secondary text-sm mb-5">
                Verifiez les informations avant de lancer la generation.
              </p>

              {/* Photo previews */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="relative rounded-2xl overflow-hidden h-[140px]">
                  {facadeUrl && <img src={facadeUrl} alt="Facade" className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs py-2 text-center font-semibold">
                    Facade
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden h-[140px]">
                  {interiorUrl && <img src={interiorUrl} alt="Interieur" className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs py-2 text-center font-semibold">
                    Interieur
                  </div>
                </div>
              </div>

              {/* Info recap */}
              <div className="bg-vm-input/50 rounded-2xl p-5 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Ville', value: ville },
                    { label: 'Quartier', value: quartier },
                    { label: 'Prix', value: `${prix} €`, highlight: true },
                    { label: 'Contact', value: contact },
                    ...(telephone ? [{ label: 'Telephone', value: telephone }] : []),
                  ].map(item => (
                    <div key={item.label}>
                      <span className="text-vm-muted text-[11px] uppercase tracking-wider font-semibold">{item.label}</span>
                      <p className={`text-sm mt-0.5 font-medium ${'highlight' in item ? 'text-vm-primary font-bold' : 'text-vm-text'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-vm-border text-vm-text font-semibold py-3 rounded-2xl text-sm
                             hover:bg-vm-input transition-all flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] bg-vm-primary text-white font-bold py-3.5 rounded-2xl text-sm
                             hover:bg-vm-primary-hover transition-all duration-200
                             shadow-[0_4px_16px_rgba(193,134,107,0.3)]
                             hover:shadow-[0_6px_24px_rgba(193,134,107,0.4)]
                             animate-pulse-glow
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none
                             flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                      Lancement...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Lancer la generation
                    </>
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
