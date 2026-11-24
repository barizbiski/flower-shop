import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  /** Layout classes from the caller (width, margins). */
  className?: string;
}
