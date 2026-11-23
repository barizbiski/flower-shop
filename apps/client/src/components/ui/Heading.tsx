import type { ReactNode } from 'react';

const SIZES = {
  lg: 'text-4xl leading-tight',
  xl: 'text-5xl',
} as const;

interface HeadingProps {
  children: ReactNode;
  size?: keyof typeof SIZES;
}

/** Page title (h1) in the display serif. */
export function Heading({ children, size = 'lg' }: HeadingProps) {
  return <h1 className={`m-0 font-display font-normal ${SIZES[size]}`}>{children}</h1>;
}
