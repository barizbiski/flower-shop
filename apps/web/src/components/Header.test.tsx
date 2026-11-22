import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../features/auth/AuthContext';
import { Header } from './Header';

describe('Header', () => {
  // AC2: shown as logged in by first name
  it('greets a logged-in shopper by first name', () => {
    render(
      <AuthProvider initialUser={{ id: 'u1', name: 'Dana Levi', email: 'd@example.com', phone: '0501234567' }}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText('Hi, Dana')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create an account' })).not.toBeInTheDocument();
  });

  it('offers sign-up when nobody is logged in', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup');
  });
});
