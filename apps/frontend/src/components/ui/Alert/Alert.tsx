import type { AlertProps } from './Alert.types';

/** Error banner announced to assistive technology (role="alert"). */
export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div role="alert" className={`rounded-2xl bg-blush px-4 py-3 text-sm font-semibold text-error ${className}`}>
      {children}
    </div>
  );
}
