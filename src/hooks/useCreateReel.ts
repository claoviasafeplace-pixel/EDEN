'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UploadedMedia, CreateReelFormData, MediaType } from '@/lib/types';

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getMediaType(file: File): MediaType {
  return file.type.startsWith('video/') ? 'video' : 'photo';
}

function createPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadeddata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else {
      resolve(URL.createObjectURL(file));
    }
  });
}

function getMediaDimensions(file: File): Promise<{ width: number; height: number; durationMs?: number }> {
  return new Promise((resolve) => {
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          durationMs: Math.round(video.duration * 1000),
        });
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    }
  });
}

async function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ url: string; thumbnailUrl: string | null }> {
  const isVideo = file.type.startsWith('video/');
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isVideo ? 'video' : 'image'}/upload`;

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', `eden-reels/media`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        const thumbnailUrl = isVideo
          ? data.secure_url.replace(/\.[^.]+$/, '.jpg')
          : null;
        resolve({ url: data.secure_url, thumbnailUrl });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(fd);
  });
}

const DEFAULT_FORM: CreateReelFormData = {
  contentType: 'reel',
  ville: '',
  quartier: '',
  prix: '',
  contact: 'Eden - ERA Immobilier',
  telephone: '',
  enableVeo3: false,
  enableStaging: true,
  durationSeconds: 30,
  musicTrackId: null,
};

export function useCreateReel() {
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [form, setForm] = useState<CreateReelFormData>({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = useCallback((patch: Partial<CreateReelFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    for (const file of validFiles) {
      const id = generateId();
      const mediaType = getMediaType(file);
      const previewUrl = await createPreview(file);
      const dims = await getMediaDimensions(file);

      const item: UploadedMedia = {
        id,
        file,
        previewUrl,
        cloudinaryUrl: null,
        thumbnailUrl: null,
        mediaType,
        uploadProgress: 0,
        width: dims.width,
        height: dims.height,
        durationMs: dims.durationMs ?? null,
      };

      setMedia((prev) => [...prev, item]);

      // Upload in background
      uploadToCloudinary(file, (pct) => {
        setMedia((prev) =>
          prev.map((m) => (m.id === id ? { ...m, uploadProgress: pct } : m))
        );
      })
        .then(({ url, thumbnailUrl }) => {
          setMedia((prev) =>
            prev.map((m) =>
              m.id === id
                ? { ...m, cloudinaryUrl: url, thumbnailUrl, uploadProgress: 100 }
                : m
            )
          );
        })
        .catch((err) => {
          console.error(`Upload failed for ${file.name}:`, err);
          setMedia((prev) => prev.filter((m) => m.id !== id));
        });
    }
  }, []);

  const removeMedia = useCallback((id: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const allUploaded = media.length > 0 && media.every((m) => m.cloudinaryUrl !== null);
  const formValid = form.ville.trim() !== '' && form.quartier.trim() !== '' && form.prix.trim() !== '';
  const canSubmit = allUploaded && formValid && !submitting;

  const estimatedCost = (() => {
    if (!form.enableVeo3) return 0;
    const photoCount = media.filter((m) => m.mediaType === 'photo').length;
    const veo3Clips = Math.min(photoCount, 4);
    return veo3Clips * 1.2;
  })();

  const submit = useCallback(async (): Promise<number | null> => {
    if (!canSubmit) return null;
    setSubmitting(true);
    setError(null);

    try {
      // Use first photo as facade fallback for backward compat
      const firstPhoto = media.find((m) => m.mediaType === 'photo');
      const facadeUrl = firstPhoto?.cloudinaryUrl || media[0].cloudinaryUrl!;

      // Insert reel
      const { data: reel, error: insertError } = await supabase
        .from('reels')
        .insert({
          ville: form.ville,
          quartier: form.quartier,
          prix: form.prix,
          contact: form.contact,
          telephone: form.telephone,
          image_facade_url: facadeUrl,
          image_interieur_url: media[1]?.cloudinaryUrl || facadeUrl,
          status: 'pending',
          content_type: form.contentType,
          enable_veo3: form.enableVeo3,
          enable_staging: form.enableStaging,
          duration_seconds: form.durationSeconds,
          pipeline_stage: 'uploading',
          pipeline_progress: 0,
        })
        .select('id')
        .single();

      if (insertError || !reel) throw new Error(insertError?.message || 'Insert failed');

      // Insert media_items
      const mediaInserts = media.map((m, i) => ({
        reel_id: reel.id,
        url: m.cloudinaryUrl!,
        thumbnail_url: m.thumbnailUrl,
        media_type: m.mediaType,
        sort_order: i,
        width: m.width,
        height: m.height,
        duration_ms: m.durationMs,
      }));

      const { error: mediaError } = await supabase
        .from('media_items')
        .insert(mediaInserts);

      if (mediaError) console.error('media_items insert error:', mediaError);

      // Trigger pipeline
      try {
        await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record_id: reel.id,
            ville: form.ville,
            quartier: form.quartier,
            prix: form.prix,
            contact: form.contact,
            telephone: form.telephone,
            content_type: form.contentType,
            enable_veo3: form.enableVeo3,
            enable_staging: form.enableStaging,
            duration_seconds: form.durationSeconds,
          }),
        });
      } catch (pipelineErr) {
        console.error('Pipeline trigger error:', pipelineErr);
      }

      // Reset state
      setMedia([]);
      setForm({ ...DEFAULT_FORM });
      setSubmitting(false);
      return reel.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      setSubmitting(false);
      return null;
    }
  }, [canSubmit, media, form]);

  return {
    media,
    form,
    submitting,
    error,
    allUploaded,
    formValid,
    canSubmit,
    estimatedCost,
    addFiles,
    removeMedia,
    reorderMedia,
    updateForm,
    submit,
  };
}
