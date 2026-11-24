import type { CardProps } from './Card.types';

/** White rounded surface with a soft border. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-3xl border border-line-soft bg-white p-6 shadow-sm sm:p-8 ${className}`}>{children}</div>
  );
}
