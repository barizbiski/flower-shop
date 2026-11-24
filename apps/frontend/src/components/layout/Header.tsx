import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { getFirstName } from '../../utils/string';
import { TextLink } from '../ui/TextLink/TextLink';

export function Header() {
  const { user } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-line-soft px-4 py-4 sm:px-8">
      <Link to="/" className="font-display text-2xl text-ink no-underline">
        Flower by Event
      </Link>
      <nav className="text-sm font-semibold">
        {user ? <span>Hi, {getFirstName(user.name)}</span> : <TextLink to="/signup">Create an account</TextLink>}
      </nav>
    </header>
  );
}
