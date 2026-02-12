import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="vm-card p-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vm-primary/15 to-vm-primary/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-vm-text">{title}</h3>
      <p className="text-vm-muted mt-3 max-w-md text-[15px] leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-8">
          <Button size="lg" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
