'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Wand2, ImagePlus, RotateCcw, Download, GripVertical, Layers, Sparkles, Eye } from 'lucide-react';

type Mode = 'enhance' | 'carousel';

export default function PhotosTab() {
  const [mode, setMode] = useState<Mode>('enhance');
  const [photos, setPhotos] = useState<string[]>([]);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPhotos(prev => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const simulateEnhance = () => {
    if (photos.length === 0) return;
    setProcessing(true);
    setTimeout(() => {
      setEnhancedUrl(photos[0]);
      setProcessing(false);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-vm-text">Photos IA</h1>
        <p className="text-slate-500 mt-1 text-sm">Ameliorez vos photos et creez des carrousels pour vos publications.</p>
      </div>

      {/* Mode Switcher */}
      <div className="bg-white rounded-xl p-1.5 inline-flex gap-1 border border-slate-200">
        {[
          { id: 'enhance' as Mode, icon: Wand2, label: 'Amelioration IA' },
          { id: 'carousel' as Mode, icon: Layers, label: 'Carrousel' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-vm-text text-white shadow-sm'
                : 'text-slate-400 hover:text-vm-text hover:bg-slate-50'
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Enhancement Mode */}
      {mode === 'enhance' && (
        <div className="space-y-6 animate-fade-in">
          {photos.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer
                         hover:shadow-md transition-all min-h-[380px]"
            >
              <div className="w-16 h-16 bg-vm-primary-light rounded-2xl flex items-center justify-center relative">
                <Upload className="w-7 h-7 text-vm-primary" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-vm-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-vm-text mt-5">Deposez votre photo</h3>
              <p className="text-slate-400 mt-2 text-sm max-w-md">
                L&apos;IA ameliore automatiquement l&apos;eclairage, les couleurs et peut meubler virtuellement vos pieces vides.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Original</span>
                </div>
                <div className="aspect-[4/3]">
                  <img src={photos[0]} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* After */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vm-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-vm-primary">Ameliore par IA</span>
                </div>
                <div className="aspect-[4/3] relative">
                  {processing ? (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Wand2 className="w-6 h-6 text-vm-primary animate-spin-slow" />
                      </div>
                      <p className="text-vm-text font-medium text-sm">Amelioration en cours...</p>
                      <p className="text-slate-400 text-xs">Staging virtuel + correction couleurs</p>
                    </div>
                  ) : enhancedUrl ? (
                    <img src={enhancedUrl} alt="Ameliore" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-2">
                      <Wand2 className="w-8 h-8 text-slate-300" />
                      <p className="text-slate-400 text-sm font-medium">Cliquez sur &quot;Ameliorer&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="flex gap-3">
              <button onClick={() => { setPhotos([]); setEnhancedUrl(null); }}
                className="h-10 px-5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Nouvelle photo
              </button>
              <button onClick={simulateEnhance} disabled={processing}
                className="flex-1 bg-vm-primary text-white h-10 rounded-lg font-medium text-sm
                           hover:bg-vm-primary-dark transition-colors
                           flex items-center justify-center gap-2
                           disabled:opacity-40 disabled:cursor-not-allowed">
                <Wand2 className="w-4 h-4" /> Ameliorer par IA
              </button>
              {enhancedUrl && (
                <button className="h-10 px-5 rounded-lg bg-vm-text text-white font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Telecharger
                </button>
              )}
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" onChange={handleFiles} className="hidden" />
        </div>
      )}

      {/* Carousel Mode */}
      {mode === 'carousel' && (
        <div className="space-y-6 animate-fade-in">
          {photos.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center
                         hover:bg-vm-primary-light hover:border-vm-primary/20 transition-all cursor-pointer min-h-[320px]"
            >
              <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center mb-4">
                <ImagePlus className="w-6 h-6 text-vm-primary" />
              </div>
              <p className="text-lg font-semibold text-vm-text">Deposez vos photos</p>
              <p className="text-slate-400 mt-1.5 text-sm">Selectionnez plusieurs images pour creer un carrousel Instagram</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 hover:shadow-md transition-all">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    <div className="absolute top-2 left-2 bg-white/90 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-vm-text shadow-sm">
                      {i + 1}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 w-7 h-7 rounded-lg flex items-center justify-center cursor-grab shadow-sm">
                        <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl aspect-square border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5
                             cursor-pointer hover:border-vm-primary/20 hover:bg-vm-primary-light/50 transition-all"
                >
                  <ImagePlus className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Ajouter</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl flex gap-4 items-center">
                <div className="w-10 h-10 bg-vm-primary rounded-lg flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-vm-text">Carrousel pret</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {photos.length} photos selectionnees — Glissez pour reorganiser l&apos;ordre
                  </p>
                </div>
                <button className="bg-vm-primary hover:bg-vm-primary-dark text-white h-9 px-4 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shrink-0">
                  <Download className="w-4 h-4" /> Exporter
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPhotos([])}
                  className="h-10 px-5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Recommencer
                </button>
                <button className="flex-1 bg-vm-text text-white h-10 rounded-lg font-medium text-sm
                                   hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  Publier le carrousel
                </button>
              </div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>
      )}
    </div>
  );
}
