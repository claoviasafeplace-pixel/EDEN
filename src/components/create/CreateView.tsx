'use client';

import { useCreateReel } from '@/hooks/useCreateReel';
import { useToast } from '@/components/Toast';
import MediaDropZone from './MediaDropZone';
import MediaGrid from './MediaGrid';
import FormatSelector from './FormatSelector';
import OptionsPanel from './OptionsPanel';
import MusicSelector from './MusicSelector';
import GenerateButton from './GenerateButton';
import Input from '@/components/ui/Input';
import { ImagePlus } from 'lucide-react';

function formatPrix(value: string): string {
  return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

interface CreateViewProps {
  onCreated: () => void;
  onNavigate: (tab: string) => void;
}

export default function CreateView({ onCreated, onNavigate }: CreateViewProps) {
  const { showToast } = useToast();
  const {
    media, form, submitting, error,
    allUploaded, canSubmit, estimatedCost,
    addFiles, removeMedia, reorderMedia, updateForm, submit,
  } = useCreateReel();

  const handleSubmit = async () => {
    const id = await submit();
    if (id) {
      showToast('Generation lancee !', 'success');
      onCreated();
      onNavigate('dashboard');
    } else if (error) {
      showToast(error, 'error');
    }
  };

  return (
    <div className="animate-tab-enter">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-vm-text tracking-tight">Nouveau contenu</h1>
        <p className="text-vm-muted mt-2 text-[15px]">
          Deposez vos photos et videos, l&apos;IA s&apos;occupe du reste.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left panel — Media */}
        <div className="lg:col-span-3 space-y-6">
          {/* Format selector */}
          <div>
            <label className="text-xs font-medium text-vm-muted mb-2 block">Format</label>
            <FormatSelector
              value={form.contentType}
              onChange={(v) => updateForm({ contentType: v })}
            />
          </div>

          {/* Drop zone */}
          <div>
            <label className="text-xs font-medium text-vm-muted mb-2 block">
              Medias ({media.length})
            </label>
            <MediaDropZone onFiles={addFiles} disabled={submitting} />
          </div>

          {/* Media grid */}
          {media.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-vm-muted">
                  Ordre des medias — glissez pour reordonner
                </label>
                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
                  className="text-xs text-vm-primary font-semibold hover:text-vm-primary-dark transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
              <MediaGrid items={media} onRemove={removeMedia} onReorder={reorderMedia} />
            </div>
          )}
        </div>

        {/* Right panel — Form + Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property info */}
          <div className="vm-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-vm-text">Informations du bien</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                required
                value={form.ville}
                onChange={(e) => updateForm({ ville: e.target.value })}
                placeholder="Tours, Saint-Cyr..."
              />
              <Input
                label="Quartier"
                required
                value={form.quartier}
                onChange={(e) => updateForm({ quartier: e.target.value })}
                placeholder="Beaujardin, Centre..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prix"
                required
                value={form.prix}
                onChange={(e) => updateForm({ prix: formatPrix(e.target.value) })}
                placeholder="250 000"
              />
              <Input
                label="Telephone"
                value={form.telephone}
                onChange={(e) => updateForm({ telephone: e.target.value })}
                placeholder="06 XX XX XX XX"
              />
            </div>
            <Input
              label="Contact"
              value={form.contact}
              onChange={(e) => updateForm({ contact: e.target.value })}
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-medium text-vm-muted mb-2 block">Options IA</label>
            <OptionsPanel
              enableVeo3={form.enableVeo3}
              onVeo3Change={(v) => updateForm({ enableVeo3: v })}
              enableStaging={form.enableStaging}
              onStagingChange={(v) => updateForm({ enableStaging: v })}
              durationSeconds={form.durationSeconds}
              onDurationChange={(v) => updateForm({ durationSeconds: v })}
              estimatedCost={estimatedCost}
              contentType={form.contentType}
            />
          </div>

          {/* Music */}
          {form.contentType === 'reel' && (
            <MusicSelector
              selectedId={form.musicTrackId}
              onChange={(id) => updateForm({ musicTrackId: id })}
            />
          )}

          {/* Submit */}
          <GenerateButton
            canSubmit={canSubmit}
            submitting={submitting}
            estimatedCost={estimatedCost}
            mediaCount={media.length}
            contentType={form.contentType}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
