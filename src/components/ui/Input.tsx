import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, required, className = '', id, ...rest }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-vm-muted">
          {label}{required && ' *'}
        </label>
      )}
      <input
        id={inputId}
        className={`vm-input ${error ? 'border-vm-error focus:border-vm-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        {...rest}
      />
      {error && <p className="text-xs text-vm-error">{error}</p>}
    </div>
  );
}
