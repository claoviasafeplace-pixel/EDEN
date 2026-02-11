'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Wand2, ImagePlus, ArrowRight, RotateCcw, Download, GripVertical, Layers, Sparkles, Eye } from 'lucide-react';

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
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-vm-text">Photos IA</h1>
        <p className="text-slate-500 mt-2 font-medium">Ameliorez vos photos et creez des carrousels pour vos publications.</p>
      </div>

      {/* Mode Switcher */}
      <div className="bg-white rounded-[2rem] p-2 inline-flex gap-2 border border-slate-100 shadow-sm">
        {[
          { id: 'enhance' as Mode, icon: Wand2, label: 'Amelioration IA' },
          { id: 'carousel' as Mode, icon: Layers, label: 'Carrousel' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] text-sm font-bold transition-all ${
              mode === m.id
                ? 'bg-vm-text text-white shadow-lg'
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
        <div className="space-y-8 animate-fade-in">
          {photos.length === 0 ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-vm-primary/10 to-orange-200/10 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-700" />
              <div
                onClick={() => inputRef.current?.click()}
                className="relative bg-white border border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center cursor-pointer
                           hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-500 min-h-[400px]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-vm-primary blur-3xl opacity-10 animate-glow-bg" />
                  <div className="bg-vm-primary-light w-28 h-28 rounded-[2rem] flex items-center justify-center relative border border-vm-primary/10">
                    <Upload className="w-12 h-12 text-vm-primary" />
                    <div className="absolute -top-2 -right-2 bg-vm-primary p-2 rounded-full text-white shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-vm-text tracking-tight mt-8">Deposez votre photo</h3>
                <p className="text-slate-400 mt-3 text-lg font-medium max-w-md">
                  L&apos;IA ameliore automatiquement l&apos;eclairage, les couleurs et peut meubler virtuellement vos pieces vides.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Original</span>
                </div>
                <div className="aspect-[4/3]">
                  <img src={photos[0]} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* After */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm relative">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vm-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-vm-primary">Ameliore par IA</span>
                </div>
                <div className="aspect-[4/3] relative">
                  {processing ? (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Wand2 className="w-8 h-8 text-vm-primary animate-spin-slow" />
                      </div>
                      <p className="text-vm-text font-bold">Amelioration en cours...</p>
                      <p className="text-slate-400 text-sm">Staging virtuel + correction couleurs</p>
                    </div>
                  ) : enhancedUrl ? (
                    <img src={enhancedUrl} alt="Ameliore" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
                      <Wand2 className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-bold">Cliquez sur &quot;Ameliorer&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="flex gap-4">
              <button onClick={() => { setPhotos([]); setEnhancedUrl(null); }}
                className="px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Nouvelle photo
              </button>
              <button onClick={simulateEnhance} disabled={processing}
                className="flex-1 bg-vm-primary text-white px-8 py-4 rounded-[2rem] font-black text-lg
                           shadow-[0_8px_32px_rgba(193,134,107,0.3)] hover:bg-vm-primary-dark transition-all
                           flex items-center justify-center gap-3 active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed">
                <Wand2 className="w-5 h-5" /> Ameliorer par IA
              </button>
              {enhancedUrl && (
                <button className="px-6 py-4 rounded-[1.5rem] bg-vm-text text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
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
        <div className="space-y-8 animate-fade-in">
          {photos.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center
                         hover:bg-vm-primary-light hover:border-vm-primary/20 transition-all cursor-pointer min-h-[350px]"
            >
              <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-6">
                <ImagePlus className="w-8 h-8 text-vm-primary" />
              </div>
              <p className="text-2xl font-black text-vm-text">Deposez vos photos</p>
              <p className="text-slate-400 mt-2 font-medium">Selectionnez plusieurs images pour creer un carrousel Instagram</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group rounded-[1.5rem] overflow-hidden aspect-square bg-slate-100 shadow-sm hover:shadow-lg transition-all">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-vm-text shadow-sm">
                      {i + 1}
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-xl flex items-center justify-center cursor-grab shadow-sm">
                        <GripVertical className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => inputRef.current?.click()}
                  className="rounded-[1.5rem] aspect-square border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2
                             cursor-pointer hover:border-vm-primary/20 hover:bg-vm-primary-light/50 transition-all"
                >
                  <ImagePlus className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400">Ajouter</span>
                </div>
              </div>

              <div className="bg-vm-text p-6 rounded-[2rem] flex gap-5 items-center">
                <div className="bg-vm-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(193,134,107,0.3)] shrink-0">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-black uppercase tracking-tight">Carrousel pret</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1 font-medium">
                    {photos.length} photos selectionnees — Glissez pour reorganiser l&apos;ordre
                  </p>
                </div>
                <button className="bg-vm-primary hover:bg-vm-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0">
                  <Download className="w-4 h-4" /> Exporter
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setPhotos([])}
                  className="px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Recommencer
                </button>
                <button className="flex-1 bg-vm-text text-white px-8 py-4 rounded-[2rem] font-black text-lg
                                   hover:bg-vm-primary transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]">
                  Publier le carrousel <ArrowRight className="w-5 h-5" />
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
