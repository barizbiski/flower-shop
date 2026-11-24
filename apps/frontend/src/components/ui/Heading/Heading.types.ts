import type { ReactNode } from 'react';
import type { HEADING_SIZES } from './Heading.constants';

export interface HeadingProps {
  children: ReactNode;
  size?: keyof typeof HEADING_SIZES;
}
