import { useSearchParams } from 'react-router-dom';
import { safeNext } from '../../../utils/safeNext';

/** Where to go after logging in or signing up: the `?next=` path if it is safe, else home. */
export function useSafeNext(): string {
  const [params] = useSearchParams();
  return safeNext(params.get('next'));
}
