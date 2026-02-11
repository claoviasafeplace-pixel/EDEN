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

// --- Photo Upload Component ---
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
      if (data.secure_url) {
        onUploaded(data.secure_url);
      }
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
      <label className="text-white text-sm font-semibold mb-2 block">{label}</label>
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden h-[200px]">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg
                       hover:bg-black/80 transition"
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
            h-[200px] rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3
            bg-eden-input transition-colors
            ${dragOver ? 'border-eden-gold bg-eden-gold/5' : 'border-eden-input-border'}
          `}
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-eden-gold/30 border-t-eden-gold rounded-full animate-spin-slow" />
          ) : (
            <>
              <svg className="w-10 h-10 text-eden-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-eden-muted text-sm">Glissez une image ou cliquez pour parcourir</span>
              <span className="text-eden-dim text-xs">Format recommande : 1024x1024px, JPG/PNG</span>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </div>
      )}
    </div>
  );
}

// --- Stepper ---
function Stepper({ step }: { step: number }) {
  const steps = ['Photos', 'Informations', 'Confirmation'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i < step
                  ? 'bg-eden-gold text-eden-bg'
                  : i === step
                    ? 'bg-eden-gold text-eden-bg'
                    : 'bg-eden-border text-eden-muted'
                }`}
            >
              {i < step ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs mt-2 ${i <= step ? 'text-white' : 'text-eden-muted'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors ${
                i < step ? 'bg-eden-gold' : 'bg-eden-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Main Wizard ---
function WizardContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 - Photos
  const [facadeUrl, setFacadeUrl] = useState<string | null>(null);
  const [interiorUrl, setInteriorUrl] = useState<string | null>(null);

  // Step 2 - Info
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
      // 1. Create record
      const { data, error } = await supabase
        .from('reels')
        .insert({
          ville,
          quartier,
          prix,
          image_facade_url: facadeUrl,
          image_interieur_url: interiorUrl,
          contact,
          telephone,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error || !data) {
        showToast('Erreur lors de la creation du reel', 'error');
        setSubmitting(false);
        return;
      }

      const recordId = data.id;

      // 2. POST webhook
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: recordId,
          ville,
          quartier,
          prix,
          image_facade_url: facadeUrl,
          image_interieur_url: interiorUrl,
          contact,
          telephone,
        }),
      });

      // 3. Update status to processing
      await supabase.from('reels').update({ status: 'processing' }).eq('id', recordId);

      // 4. Toast + redirect
      showToast('Reel lance avec succes ! Generation en cours...', 'success');
      setTimeout(() => router.push('/'), 500);
    } catch {
      showToast('Erreur lors du lancement', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-eden-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-eden-bg border-b border-eden-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-heading text-[28px] font-bold text-eden-gold tracking-[4px]">EDEN</span>
            <span className="text-eden-muted text-[11px] -mt-1">Reels Immobiliers</span>
          </Link>
          <Link href="/" className="text-eden-muted text-sm hover:text-white transition">
            Retour au dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-[650px] mx-auto px-6 py-10">
        <Stepper step={step} />

        {/* Step 1 - Photos */}
        {step === 0 && (
          <div className="bg-eden-surface border border-eden-border rounded-2xl p-8">
            <h2 className="font-heading text-[22px] font-bold text-white mb-1">Photos du bien</h2>
            <p className="text-eden-muted text-sm mb-8">
              Uploadez une photo de la facade et une de l&apos;interieur
            </p>

            <PhotoUpload
              label="Photo de la facade"
              imageUrl={facadeUrl}
              onUploaded={setFacadeUrl}
              folder="eden-reels/facades"
            />
            <PhotoUpload
              label="Photo de l'interieur"
              imageUrl={interiorUrl}
              onUploaded={setInteriorUrl}
              folder="eden-reels/interiors"
            />

            <button
              onClick={() => setStep(1)}
              disabled={!step1Valid}
              className="w-full mt-4 bg-eden-gold text-eden-bg font-semibold py-3.5 rounded-xl text-sm
                         hover:bg-eden-gold-hover hover:shadow-[0_4px_15px_rgba(200,169,81,0.3)]
                         transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-eden-gold disabled:hover:shadow-none"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Step 2 - Info */}
        {step === 1 && (
          <div className="bg-eden-surface border border-eden-border rounded-2xl p-8">
            <h2 className="font-heading text-[22px] font-bold text-white mb-6">Informations du bien</h2>

            <div className="mb-5">
              <label className="text-white text-sm font-medium mb-1.5 block">Ville *</label>
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, ville: true }))}
                placeholder="ex: Tours"
                className={`w-full bg-eden-input text-white placeholder-eden-dim py-3.5 px-4 rounded-[10px] text-sm
                           outline-none transition-colors border
                           ${touched.ville && !ville.trim() ? 'border-eden-error' : 'border-eden-input-border'}
                           focus:border-eden-gold`}
              />
              {touched.ville && !ville.trim() && (
                <p className="text-eden-error text-xs mt-1">Ce champ est requis</p>
              )}
            </div>

            <div className="mb-5">
              <label className="text-white text-sm font-medium mb-1.5 block">Quartier *</label>
              <input
                type="text"
                value={quartier}
                onChange={e => setQuartier(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, quartier: true }))}
                placeholder="ex: Beaujardin"
                className={`w-full bg-eden-input text-white placeholder-eden-dim py-3.5 px-4 rounded-[10px] text-sm
                           outline-none transition-colors border
                           ${touched.quartier && !quartier.trim() ? 'border-eden-error' : 'border-eden-input-border'}
                           focus:border-eden-gold`}
              />
              {touched.quartier && !quartier.trim() && (
                <p className="text-eden-error text-xs mt-1">Ce champ est requis</p>
              )}
            </div>

            <div className="mb-5">
              <label className="text-white text-sm font-medium mb-1.5 block">Prix *</label>
              <div className="relative">
                <input
                  type="text"
                  value={prix}
                  onChange={e => setPrix(formatPrix(e.target.value))}
                  onBlur={() => setTouched(t => ({ ...t, prix: true }))}
                  placeholder="ex: 250 000"
                  className={`w-full bg-eden-input text-white placeholder-eden-dim py-3.5 px-4 pr-10 rounded-[10px] text-sm
                             outline-none transition-colors border
                             ${touched.prix && !prix.trim() ? 'border-eden-error' : 'border-eden-input-border'}
                             focus:border-eden-gold`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-eden-muted text-sm">€</span>
              </div>
              {touched.prix && !prix.trim() && (
                <p className="text-eden-error text-xs mt-1">Ce champ est requis</p>
              )}
            </div>

            <div className="mb-5">
              <label className="text-white text-sm font-medium mb-1.5 block">Contact</label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full bg-eden-input text-white placeholder-eden-dim py-3.5 px-4 rounded-[10px] text-sm
                           outline-none transition-colors border border-eden-input-border focus:border-eden-gold"
              />
            </div>

            <div className="mb-8">
              <label className="text-white text-sm font-medium mb-1.5 block">Telephone</label>
              <input
                type="text"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="w-full bg-eden-input text-white placeholder-eden-dim py-3.5 px-4 rounded-[10px] text-sm
                           outline-none transition-colors border border-eden-input-border focus:border-eden-gold"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-eden-gold text-eden-gold font-semibold py-3.5 rounded-xl text-sm
                           hover:bg-eden-gold/10 transition-all"
              >
                Precedent
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!step2Valid}
                className="flex-1 bg-eden-gold text-eden-bg font-semibold py-3.5 rounded-xl text-sm
                           hover:bg-eden-gold-hover hover:shadow-[0_4px_15px_rgba(200,169,81,0.3)]
                           transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Confirmation */}
        {step === 2 && (
          <div className="bg-eden-surface border border-eden-border rounded-2xl p-8">
            <h2 className="font-heading text-[22px] font-bold text-white mb-1">Recapitulatif</h2>
            <p className="text-eden-muted text-sm mb-8">
              Verifiez les informations avant de lancer la generation
            </p>

            {/* Photo preview */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative rounded-xl overflow-hidden h-[200px]">
                {facadeUrl && <img src={facadeUrl} alt="Facade" className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1.5 text-center">
                  Facade
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden h-[200px]">
                {interiorUrl && <img src={interiorUrl} alt="Interieur" className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1.5 text-center">
                  Interieur
                </div>
              </div>
            </div>

            {/* Info recap */}
            <div className="bg-eden-input rounded-xl p-5 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-eden-muted text-xs">Ville</span>
                  <p className="text-white text-sm mt-0.5">{ville}</p>
                </div>
                <div>
                  <span className="text-eden-muted text-xs">Quartier</span>
                  <p className="text-white text-sm mt-0.5">{quartier}</p>
                </div>
                <div>
                  <span className="text-eden-muted text-xs">Prix</span>
                  <p className="text-eden-gold font-bold text-sm mt-0.5">{prix} €</p>
                </div>
                <div>
                  <span className="text-eden-muted text-xs">Contact</span>
                  <p className="text-white text-sm mt-0.5">{contact}</p>
                </div>
                {telephone && (
                  <div>
                    <span className="text-eden-muted text-xs">Telephone</span>
                    <p className="text-white text-sm mt-0.5">{telephone}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full mb-3 border border-eden-gold text-eden-gold font-semibold py-3 rounded-xl text-sm
                         hover:bg-eden-gold/10 transition-all"
            >
              Precedent
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-eden-gold text-eden-bg font-bold py-4 rounded-xl text-base
                         hover:bg-eden-gold-hover transition-all duration-200
                         animate-pulse-gold
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-eden-bg/30 border-t-eden-bg rounded-full animate-spin-slow" />
                  Lancement...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
