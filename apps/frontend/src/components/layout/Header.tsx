import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { AccountMenu } from './AccountMenu';

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line-soft px-4 py-4 sm:px-8">
      <Link to={APP_ROUTES.home} className="font-display text-2xl text-ink no-underline">
        Flower by Event
      </Link>
      <nav className="text-sm font-semibold">
        <AccountMenu />
      </nav>
    </header>
  );
}
