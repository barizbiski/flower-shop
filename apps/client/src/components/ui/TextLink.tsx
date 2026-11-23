import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface TextLinkProps {
  to: string;
  children: ReactNode;
  /** Bold weight, for a standalone call to action. */
  emphasis?: boolean;
}

/** Inline in-app link in the brand wine colour. */
export function TextLink({ to, children, emphasis = false }: TextLinkProps) {
  return (
    <Link to={to} className={`text-wine underline${emphasis ? ' font-bold' : ''}`}>
      {children}
    </Link>
  );
}
