import type { ReactNode } from 'react';

export interface AlertProps {
  children: ReactNode;
  /** Layout classes from the caller (margins). */
  className?: string;
}
