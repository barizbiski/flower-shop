import { Link } from 'react-router-dom';
import type { TextLinkProps } from './TextLink.types';

/** Inline in-app link in the brand wine colour. */
export function TextLink({ to, children, emphasis = false }: TextLinkProps) {
  return (
    <Link to={to} className={`text-wine underline${emphasis ? ' font-bold' : ''}`}>
      {children}
    </Link>
  );
}
