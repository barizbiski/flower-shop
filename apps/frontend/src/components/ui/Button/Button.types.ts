import type { ButtonHTMLAttributes } from 'react';
import type { BUTTON_VARIANTS } from './Button.constants';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Disables the button and shows `loadingText` (when given) instead of the children. */
  loading?: boolean;
  loadingText?: string;
  /** `primary` (default): 48px wine pill. `secondary`: 46px outlined pill. */
  variant?: keyof typeof BUTTON_VARIANTS;
}
