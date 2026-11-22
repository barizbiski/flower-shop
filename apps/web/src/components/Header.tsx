import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function Header() {
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0];
  return (
    <header className="flex items-center justify-between border-b border-line-soft px-4 py-4 sm:px-8">
      <Link to="/" className="font-display text-2xl text-ink no-underline">
        Flower by Event
      </Link>
      <nav className="text-sm font-semibold">
        {user ? (
          <span>Hi, {firstName}</span>
        ) : (
          <Link to="/signup" className="text-wine underline">
            Create an account
          </Link>
        )}
      </nav>
    </header>
  );
}
