import { HEADING_SIZES } from './Heading.constants';
import type { HeadingProps } from './Heading.types';

/** Page title (h1) in the display serif. */
export function Heading({ children, size = 'lg' }: HeadingProps) {
  return <h1 className={`m-0 font-display font-normal ${HEADING_SIZES[size]}`}>{children}</h1>;
}
