'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ToastProvider, useToast } from '@/components/Toast';
import Link from 'next/link';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

function formatPrix(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function PhotoUpload({
  label,
  imageUrl,
  onUploaded,
  folder,
}: {
  label: string;
  imageUrl: string | null;
  onUploaded: (url: string) => void;
  folder: string;
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

  return (
    <div className="mb-6">
      <label className="text-vm-text text-sm font-semibold mb-2 block">{label}</label>
      {imageUrl ? (
        <div className="relative rounded-2xl overflow-hidden h-[200px] shadow-sm">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-white/90 text-vm-text text-xs px-3 py-1.5 rounded-lg
                       hover:bg-white transition shadow-sm font-medium"
          >
            Changer
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            h-[200px] rounded-2xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3
            bg-vm-input transition-all duration-200
            ${dragOver ? 'border-vm-accent bg-orange-50/50 scale-[1.01]' : 'border-vm-input-border hover:border-vm-muted'}
          `}
        >
          {uploading ? (
            <div className="w-8 h-8 border-[3px] border-vm-border border-t-vm-accent rounded-full animate-spin-slow" />
          ) : (
            <>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-vm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-vm-muted text-sm font-medium">Glissez une image ou cliquez pour parcourir</span>
              <span className="text-vm-dim text-xs">1024x1024px recommande — JPG, PNG</span>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ['Photos', 'Informations', 'Confirmation'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm
                ${i < step
                  ? 'bg-vm-success text-white'
                  : i === step
                    ? 'bg-vm-accent text-white'
                    : 'bg-vm-input text-vm-dim border border-vm-border'
                }`}
            >
              {i < step ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${i <= step ? 'text-vm-text' : 'text-vm-dim'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-3 mb-5 rounded-full transition-colors ${
                i < step ? 'bg-vm-success' : 'bg-vm-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function WizardContent() {
  const router = useRouter();
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
      showToast('Reel lance avec succes ! Generation en cours...', 'success');
      setTimeout(() => router.push('/'), 500);
    } catch {
      showToast('Erreur lors du lancement', 'error');
      setSubmitting(false);
    }
  };

  const inputClass = (field: string, required: boolean) =>
    `w-full bg-vm-input text-vm-text placeholder-vm-dim py-3.5 px-4 rounded-xl text-sm
     outline-none transition-all duration-200 border
     ${required && touched[field] && !(field === 'ville' ? ville : field === 'quartier' ? quartier : prix).trim()
       ? 'border-vm-error' : 'border-vm-input-border'}
     focus:border-vm-accent focus:ring-2 focus:ring-vm-accent/10`;

  return (
    <div className="min-h-screen bg-vm-bg">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-vm-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vm-primary rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-heading text-xl font-bold text-vm-primary tracking-wide">VIMMO</span>
          </Link>
          <Link href="/" className="text-vm-muted text-sm hover:text-vm-text transition font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-[650px] mx-auto px-6 py-10">
        <Stepper step={step} />

        {step === 0 && (
          <div className="bg-white border border-vm-border rounded-3xl p-8 shadow-[0_2px_12px_rgba(139,109,79,0.06)]">
            <h2 className="font-heading text-xl font-bold text-vm-text mb-1">Photos du bien</h2>
            <p className="text-vm-muted text-sm mb-8">
              Uploadez une photo de la facade et une de l&apos;interieur
            </p>
            <PhotoUpload label="Photo de la facade" imageUrl={facadeUrl} onUploaded={setFacadeUrl} folder="eden-reels/facades" />
            <PhotoUpload label="Photo de l'interieur" imageUrl={interiorUrl} onUploaded={setInteriorUrl} folder="eden-reels/interiors" />
            <button
              onClick={() => setStep(1)}
              disabled={!step1Valid}
              className="w-full mt-4 bg-vm-accent text-white font-semibold py-3.5 rounded-xl text-sm
                         hover:bg-vm-accent-hover shadow-sm hover:shadow-md transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-vm-border rounded-3xl p-8 shadow-[0_2px_12px_rgba(139,109,79,0.06)]">
            <h2 className="font-heading text-xl font-bold text-vm-text mb-6">Informations du bien</h2>
            {[
              { key: 'ville', label: 'Ville', value: ville, set: setVille, placeholder: 'ex: Tours', required: true },
              { key: 'quartier', label: 'Quartier', value: quartier, set: setQuartier, placeholder: 'ex: Beaujardin', required: true },
            ].map(f => (
              <div key={f.key} className="mb-5">
                <label className="text-vm-text text-sm font-medium mb-1.5 block">
                  {f.label} {f.required && <span className="text-vm-accent">*</span>}
                </label>
                <input
                  type="text" value={f.value}
                  onChange={e => f.set(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, [f.key]: true }))}
                  placeholder={f.placeholder}
                  className={inputClass(f.key, f.required)}
                />
                {f.required && touched[f.key] && !f.value.trim() && (
                  <p className="text-vm-error text-xs mt-1">Ce champ est requis</p>
                )}
              </div>
            ))}
            <div className="mb-5">
              <label className="text-vm-text text-sm font-medium mb-1.5 block">
                Prix <span className="text-vm-accent">*</span>
              </label>
              <div className="relative">
                <input
                  type="text" value={prix}
                  onChange={e => setPrix(formatPrix(e.target.value))}
                  onBlur={() => setTouched(t => ({ ...t, prix: true }))}
                  placeholder="ex: 250 000"
                  className={inputClass('prix', true) + ' pr-10'}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-vm-muted text-sm font-medium">€</span>
              </div>
              {touched.prix && !prix.trim() && (
                <p className="text-vm-error text-xs mt-1">Ce champ est requis</p>
              )}
            </div>
            <div className="mb-5">
              <label className="text-vm-text text-sm font-medium mb-1.5 block">Contact</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)}
                className="w-full bg-vm-input text-vm-text py-3.5 px-4 rounded-xl text-sm outline-none transition-all border border-vm-input-border focus:border-vm-accent focus:ring-2 focus:ring-vm-accent/10" />
            </div>
            <div className="mb-8">
              <label className="text-vm-text text-sm font-medium mb-1.5 block">Telephone</label>
              <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="w-full bg-vm-input text-vm-text placeholder-vm-dim py-3.5 px-4 rounded-xl text-sm outline-none transition-all border border-vm-input-border focus:border-vm-accent focus:ring-2 focus:ring-vm-accent/10" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(0)}
                className="flex-1 border border-vm-border text-vm-text font-semibold py-3.5 rounded-xl text-sm hover:bg-vm-input transition-all">
                Precedent
              </button>
              <button onClick={() => setStep(2)} disabled={!step2Valid}
                className="flex-1 bg-vm-accent text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-vm-accent-hover shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-vm-border rounded-3xl p-8 shadow-[0_2px_12px_rgba(139,109,79,0.06)]">
            <h2 className="font-heading text-xl font-bold text-vm-text mb-1">Recapitulatif</h2>
            <p className="text-vm-muted text-sm mb-8">Verifiez les informations avant de lancer</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative rounded-2xl overflow-hidden h-[200px] shadow-sm">
                {facadeUrl && <img src={facadeUrl} alt="Facade" className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs py-2 text-center font-medium">
                  Facade
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[200px] shadow-sm">
                {interiorUrl && <img src={interiorUrl} alt="Interieur" className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs py-2 text-center font-medium">
                  Interieur
                </div>
              </div>
            </div>
            <div className="bg-vm-input rounded-2xl p-5 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Ville</span>
                  <p className="text-vm-text text-sm mt-0.5 font-medium">{ville}</p>
                </div>
                <div>
                  <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Quartier</span>
                  <p className="text-vm-text text-sm mt-0.5 font-medium">{quartier}</p>
                </div>
                <div>
                  <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Prix</span>
                  <p className="text-vm-accent font-bold text-sm mt-0.5">{prix} €</p>
                </div>
                <div>
                  <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Contact</span>
                  <p className="text-vm-text text-sm mt-0.5">{contact}</p>
                </div>
                {telephone && (
                  <div>
                    <span className="text-vm-muted text-xs uppercase tracking-wider font-medium">Telephone</span>
                    <p className="text-vm-text text-sm mt-0.5">{telephone}</p>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setStep(1)}
              className="w-full mb-3 border border-vm-border text-vm-text font-semibold py-3 rounded-xl text-sm hover:bg-vm-input transition-all">
              Precedent
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-vm-accent text-white font-bold py-4 rounded-xl text-base
                         hover:bg-vm-accent-hover transition-all duration-200 shadow-md hover:shadow-lg
                         animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none
                         flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  Lancement...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lancer la generation
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NouveauReel() {
  return (
    <ToastProvider>
      <WizardContent />
    </ToastProvider>
  );
}
