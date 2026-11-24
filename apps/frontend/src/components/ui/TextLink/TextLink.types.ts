import type { ReactNode } from 'react';

export interface TextLinkProps {
  to: string;
  children: ReactNode;
  /** Bold weight, for a standalone call to action. */
  emphasis?: boolean;
}
