import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { mockFetch, TEST_USER } from './test/helpers';

describe('App', () => {
  it('renders the home page', async () => {
    mockFetch(401, { error: { code: 'UNAUTHENTICATED', message: 'Not logged in' } });
    render(<App />);
    expect(screen.getByRole('heading', { name: /choose the occasion/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Log in or open account menu' })).toBeInTheDocument();
  });

  // AC6: the session is restored from the access-token cookie on load, with no logged-out flash
  it('restores the session on load and shows the initials', async () => {
    const fetchMock = mockFetch(200, {
      user: TEST_USER,
    });
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Log in or open account menu' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Account menu for Dana Levi' })).toHaveTextContent('DL');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/refresh', expect.objectContaining({ method: 'POST' }));
  });
});
