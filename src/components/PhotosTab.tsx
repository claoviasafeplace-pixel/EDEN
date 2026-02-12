'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Wand2, ImagePlus, RotateCcw, Download, GripVertical, Layers, Eye } from 'lucide-react';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

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
        <h1 className="text-[28px] font-bold text-vm-text tracking-tight">Photos IA</h1>
        <p className="text-vm-muted mt-2 text-[15px]">Ameliorez vos photos et creez des carrousels pour vos publications.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-6 border-b border-vm-border-light">
        {[
          { id: 'enhance' as Mode, icon: Wand2, label: 'Amelioration IA' },
          { id: 'carousel' as Mode, icon: Layers, label: 'Carrousel' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
              mode === m.id ? 'text-vm-primary' : 'text-vm-muted hover:text-vm-text'
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
            {mode === m.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vm-primary rounded-full" />}
          </button>
        ))}
      </div>

      {/* Enhancement Mode */}
      {mode === 'enhance' && (
        <div className="space-y-6 animate-tab-enter">
          {photos.length === 0 ? (
            <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
              <EmptyState
                icon={<Upload className="w-7 h-7 text-vm-primary" />}
                title="Deposez votre photo"
                description="L'IA ameliore automatiquement l'eclairage, les couleurs et peut meubler virtuellement vos pieces vides."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before */}
              <div className="vm-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-vm-border-light flex items-center gap-2">
                  <Eye className="w-4 h-4 text-vm-muted" />
                  <span className="text-xs font-medium text-vm-muted">Original</span>
                </div>
                <div className="aspect-[4/3]">
                  <img src={photos[0]} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* After */}
              <div className="vm-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-vm-border-light flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-vm-primary" />
                  <span className="text-xs font-medium text-vm-primary">Ameliore par IA</span>
                </div>
                <div className="aspect-[4/3] relative">
                  {processing ? (
                    <div className="absolute inset-0 bg-vm-bg flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Wand2 className="w-6 h-6 text-vm-primary animate-spin-slow" />
                      </div>
                      <p className="text-vm-text font-medium text-sm">Amelioration en cours...</p>
                      <p className="text-vm-muted text-xs">Staging virtuel + correction couleurs</p>
                    </div>
                  ) : enhancedUrl ? (
                    <img src={enhancedUrl} alt="Ameliore" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-vm-bg flex flex-col items-center justify-center gap-2">
                      <Wand2 className="w-8 h-8 text-vm-border" />
                      <p className="text-vm-muted text-sm font-medium">Cliquez sur &quot;Ameliorer&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="flex gap-3">
              <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => { setPhotos([]); setEnhancedUrl(null); }}>
                Nouvelle photo
              </Button>
              <Button fullWidth loading={processing} icon={<Wand2 className="w-4 h-4" />} onClick={simulateEnhance}>
                Ameliorer par IA
              </Button>
              {enhancedUrl && (
                <button className="h-11 px-5 rounded-xl bg-vm-text text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer">
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
        <div className="space-y-6 animate-tab-enter">
          {photos.length === 0 ? (
            <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
              <EmptyState
                icon={<ImagePlus className="w-7 h-7 text-vm-primary" />}
                title="Deposez vos photos"
                description="Selectionnez plusieurs images pour creer un carrousel Instagram."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-vm-bg vm-card vm-card-hover">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                    <div className="absolute top-2 left-2 bg-white/90 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-vm-text shadow-sm">
                      {i + 1}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 w-7 h-7 rounded-lg flex items-center justify-center cursor-grab shadow-sm">
                        <GripVertical className="w-3.5 h-3.5 text-vm-muted" />
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl aspect-square border-2 border-dashed border-vm-border flex flex-col items-center justify-center gap-1.5
                             cursor-pointer hover:border-vm-primary/20 hover:bg-vm-primary-light/50 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-vm-muted" />
                  <span className="text-xs font-medium text-vm-muted">Ajouter</span>
                </div>
              </div>

              <div className="vm-card p-5 flex gap-4 items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-vm-primary/20 to-vm-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-vm-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vm-text">Carrousel pret</p>
                  <p className="text-xs text-vm-muted mt-0.5">
                    {photos.length} photos selectionnees — Glissez pour reorganiser l&apos;ordre
                  </p>
                </div>
                <Button size="sm" icon={<Download className="w-4 h-4" />} className="shrink-0">
                  Exporter
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setPhotos([])}>
                  Recommencer
                </Button>
                <button className="flex-1 bg-vm-text text-white h-11 rounded-xl font-semibold text-sm
                                   hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer">
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
