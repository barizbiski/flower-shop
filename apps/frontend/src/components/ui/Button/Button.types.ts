import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Disables the button and shows `loadingText` (when given) instead of the children. */
  loading?: boolean;
  loadingText?: string;
}
