'use client';

import type { PipelineStage } from '@/lib/types';
import { PIPELINE_LABELS } from '@/lib/types';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ProgressViewProps {
  stage: PipelineStage | null;
  progress: number;
  errorMessage?: string | null;
}

const STAGE_ORDER: PipelineStage[] = [
  'uploading',
  'analyzing',
  'generating_videos',
  'staging',
  'rendering',
  'writing_captions',
  'completed',
];

function getStageIndex(stage: PipelineStage | null): number {
  if (!stage) return -1;
  return STAGE_ORDER.indexOf(stage);
}

export default function ProgressView({ stage, progress, errorMessage }: ProgressViewProps) {
  const currentIndex = getStageIndex(stage);
  const isError = stage === 'error';
  const isComplete = stage === 'completed';

  return (
    <div className="vm-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-vm-text">Pipeline de generation</h3>
        {!isError && !isComplete && (
          <span className="text-[11px] text-vm-muted font-medium">
            {progress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isError && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-emerald-500' : 'bg-vm-primary'
            }`}
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      )}

      {/* Stages list */}
      <div className="space-y-3">
        {STAGE_ORDER.filter(s => s !== 'completed').map((s, i) => {
          const isDone = currentIndex > i || isComplete;
          const isCurrent = currentIndex === i && !isComplete;

          return (
            <div key={s} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-vm-primary animate-spin-slow shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-200 shrink-0" />
              )}
              <span className={`text-sm ${
                isDone ? 'text-emerald-700 font-medium' :
                isCurrent ? 'text-vm-text font-semibold' :
                'text-vm-muted'
              }`}>
                {PIPELINE_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isError && errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Completed */}
      {isComplete && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <p className="text-sm font-semibold text-emerald-700">Generation terminee !</p>
        </div>
      )}
    </div>
  );
}
