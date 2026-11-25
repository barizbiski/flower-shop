import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth/login/LoginForm';
import { AuthSwitchPrompt } from '../../features/auth/shared/AuthSwitchPrompt';
import { useAuth } from '../../features/auth/shared/useAuth';
import { getInitials } from '../../utils/string';
import { Button } from '../ui/Button/Button';

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Header account button and its panel: the login form when logged out, or the shopper's name,
 * email and Log out when logged in. Escape, a click outside, or navigating closes it.
 * Renders nothing while the initial session check is loading, so there is no logged-out flash.
 */
export function AccountMenu() {
  const { user, status, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('input, button')?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  if (status === 'loading') return null;

  async function onLogout() {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setOpen(false);
    buttonRef.current?.focus();
  }

  const initials = user ? getInitials(user.name) : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={user ? `Account menu for ${user.name}` : 'Log in or open account menu'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full font-sans text-sm font-semibold ${
          user ? 'border-0 bg-wine text-white' : 'border-[1.5px] border-line bg-white text-ink hover:bg-blush'
        }`}
      >
        {user ? initials : <PersonIcon />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={user ? 'Your account' : 'Log in'}
          className="absolute top-full right-0 z-20 mt-2 w-[330px] max-w-[calc(100vw-2rem)] rounded-[22px] border border-[#E6DED9] bg-white p-[22px] font-normal shadow-[0_12px_32px_rgba(42,24,32,0.12)]"
        >
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-wine text-lg font-semibold text-white"
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="m-0 text-[13px] text-muted">Hello,</p>
                  <p className="m-0 truncate font-display text-[22px] leading-tight">{user.name}</p>
                  <p className="m-0 truncate text-sm text-muted">{user.email}</p>
                </div>
              </div>
              <hr className="m-0 border-0 border-t border-line-soft" />
              <Button
                type="button"
                variant="secondary"
                loading={loggingOut}
                loadingText="Logging out…"
                onClick={onLogout}
                className="flex items-center justify-center gap-2"
              >
                <ExitIcon />
                Log out
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mt-0 mb-4 font-display text-[26px] font-normal">Welcome back</h2>
              <LoginForm idPrefix="account" />
              <AuthSwitchPrompt target="signup" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
