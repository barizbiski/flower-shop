import type { InputHTMLAttributes } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown in place of the hint, and marks the input invalid. */
  error?: string;
  hint?: string;
}
