import type { PublicUser } from '@flower-shop/shared';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../features/auth/shared/AuthProvider';
import { jsonResponse, TEST_USER as dana } from '../../test/helpers';
import { Header } from './Header';

function renderHeader(initialUser: PublicUser | null) {
  return render(
    <AuthProvider initialUser={initialUser}>
      <MemoryRouter>
        <Header />
        <p>outside</p>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Header', () => {
  // AC1
  it('shows the initials button for a logged-in shopper', () => {
    renderHeader(dana);
    const button = screen.getByRole('button', { name: 'Account menu for Dana Levi' });
    expect(button).toHaveTextContent('DL');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  // AC1, AC2
  it('opens the login panel when nobody is logged in, with a link to sign up', async () => {
    const user = userEvent.setup();
    renderHeader(null);
    const button = screen.getByRole('button', { name: 'Log in or open account menu' });
    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('dialog');
    expect(within(panel).getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(within(panel).getByLabelText('Email')).toBeInTheDocument();
    expect(within(panel).getByLabelText('Password')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup');
  });

  // AC1
  it('closes the panel on Escape and on a click outside', async () => {
    const user = userEvent.setup();
    renderHeader(null);
    const button = screen.getByRole('button', { name: 'Log in or open account menu' });

    await user.click(button);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();

    await user.click(button);
    await user.click(screen.getByText('outside'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // AC2, AC3, AC4: Enter submits, wrong credentials show the generic message, success switches view
  it('logs in from the panel and switches to the logged-in view', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: 'INVALID_CREDENTIALS', message: 'x' } }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'at-1', user: dana }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderHeader(null);

    await user.click(screen.getByRole('button', { name: 'Log in or open account menu' }));
    await user.type(screen.getByLabelText('Email'), 'dana@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong password{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password');

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'correct horse{Enter}');

    const panel = await screen.findByRole('dialog', { name: 'Your account' });
    expect(within(panel).getByText('Dana Levi')).toBeInTheDocument();
    expect(within(panel).getByText('dana@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account menu for Dana Levi' })).toBeInTheDocument();
  });

  // AC7
  it('logs out and shows the logged-out state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderHeader(dana);

    await user.click(screen.getByRole('button', { name: 'Account menu for Dana Levi' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Log in or open account menu' })).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});
