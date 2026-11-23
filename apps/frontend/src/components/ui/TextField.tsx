import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown in place of the hint, and marks the input invalid. */
  error?: string;
  hint?: string;
}

/** Labelled text input with an accessible hint or error message underneath. */
export function TextField({ id, label, value, onChange, error, hint, ...rest }: TextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-[46px] w-full rounded-[14px] border-[1.5px] bg-white px-3.5 font-sans text-[15px] text-ink outline-offset-1 focus:border-wine focus:outline-2 focus:outline-wine ${
          error ? 'border-error' : 'border-line'
        }`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="m-0 text-[13px] font-semibold text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="m-0 text-[13px] text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
