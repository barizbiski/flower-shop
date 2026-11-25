import { BUTTON_VARIANTS } from './Button.constants';
import type { ButtonProps } from './Button.types';

/** Pill button: wine primary, or outlined secondary. */
export function Button({
  loading = false,
  loadingText,
  variant = 'primary',
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`cursor-pointer rounded-full font-sans text-[15px] font-semibold disabled:cursor-wait disabled:opacity-70 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
