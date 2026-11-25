import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockFetch, renderAuthPage, TEST_USER as dana } from '../../../test/helpers';
import { LoginPage } from './LoginPage';

function renderLogin(url = '/login') {
  return renderAuthPage('/login', <LoginPage />, url);
}

async function submit(email = 'dana@example.com', password = 'correct horse') {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginPage', () => {
  // AC2
  it('shows labelled email and password fields, a Log in button and a sign-up link', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup');
  });

  // AC4 (client side)
  it('checks the input before submitting', async () => {
    const fetchMock = mockFetch(200, { accessToken: 'at', user: dana });
    renderLogin();
    await submit('nope', '');
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Please enter your password')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // AC3
  it('logs in and goes to a safe ?next= path', async () => {
    const fetchMock = mockFetch(200, { accessToken: 'at', user: dana });
    renderLogin('/login?next=%2Fcheckout');
    await submit();
    await waitFor(() => expect(screen.getByText('landed at /checkout as Dana Levi')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ email: 'dana@example.com', password: 'correct horse' });
  });

  // AC3
  it('ignores an unsafe ?next= and goes home', async () => {
    mockFetch(200, { accessToken: 'at', user: dana });
    renderLogin(`/login?next=${encodeURIComponent('//evil.example')}`);
    await submit();
    await waitFor(() => expect(screen.getByText('landed at / as Dana Levi')).toBeInTheDocument());
  });

  // AC4
  it('shows the generic message on 401', async () => {
    mockFetch(401, { error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' } });
    renderLogin();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password');
  });

  // AC5
  it('shows the rate-limit message on 429', async () => {
    mockFetch(429, { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } });
    renderLogin();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts. Please try again later.');
  });
});
