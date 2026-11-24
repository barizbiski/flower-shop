import type { ButtonProps } from './Button.types';

/** Primary pill button in the brand wine colour. */
export function Button({ loading = false, loadingText, disabled, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`h-12 cursor-pointer rounded-full border-0 bg-wine font-sans text-[15px] font-semibold text-white hover:bg-wine-dark disabled:cursor-wait disabled:opacity-70 ${className}`}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
