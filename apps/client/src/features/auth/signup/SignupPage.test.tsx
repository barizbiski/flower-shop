import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../AuthProvider';
import { useAuth } from '../useAuth';
import { SignupPage } from './SignupPage';

function Landing() {
  const { user } = useAuth();
  const location = useLocation();
  return (
    <p>
      landed at {location.pathname} as {user?.name ?? 'nobody'}
    </p>
  );
}

function renderSignup(url = '/signup') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillValid(user = userEvent.setup()) {
  await user.type(screen.getByLabelText('Full name'), 'Dana Levi');
  await user.type(screen.getByLabelText('Email'), 'dana@example.com');
  await user.type(screen.getByLabelText('Phone'), '050-123-4567');
  await user.type(screen.getByLabelText('Password'), 'correct horse');
  return user;
}

const createdUser = { id: 'u1', name: 'Dana Levi', email: 'dana@example.com', phone: '0501234567' };

describe('SignupPage', () => {
  // AC1
  it('shows labelled name, email, phone and password fields and a Create account button', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  // AC4 (client side)
  it('shows field errors and does not submit when the input is invalid', async () => {
    const fetchMock = mockFetch(201, { user: createdUser });
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText('Email'), 'nope');
    await user.type(screen.getByLabelText('Phone'), '123');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid phone number (9–15 digits)')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Please enter a valid email address');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // AC2
  it('posts the details, stores the user, and goes home logged in', async () => {
    const fetchMock = mockFetch(201, { user: createdUser });
    renderSignup();
    const user = await fillValid();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(screen.getByText('landed at / as Dana Levi')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
    const sent = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(sent).toEqual({ name: 'Dana Levi', email: 'dana@example.com', phone: '050-123-4567', password: 'correct horse' });
  });

  // AC2
  it('honours a safe same-site ?next= path', async () => {
    mockFetch(201, { user: createdUser });
    renderSignup('/signup?next=%2Fcheckout');
    const user = await fillValid();
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(screen.getByText('landed at /checkout as Dana Levi')).toBeInTheDocument());
  });

  // AC2
  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)'])(
    'ignores an unsafe ?next= (%s) and goes home',
    async (next) => {
      mockFetch(201, { user: createdUser });
      renderSignup(`/signup?next=${encodeURIComponent(next)}`);
      const user = await fillValid();
      await user.click(screen.getByRole('button', { name: 'Create account' }));
      await waitFor(() => expect(screen.getByText('landed at / as Dana Levi')).toBeInTheDocument());
    },
  );

  // AC3
  it('shows the duplicate-email message with a link to log in on 409', async () => {
    mockFetch(409, { error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } });
    renderSignup();
    const user = await fillValid();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('An account with this email already exists')).toBeInTheDocument();
    expect(within(alert).getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
    expect(screen.queryByText(/landed at/)).not.toBeInTheDocument();
  });

  // AC4 (server side)
  it('shows server field errors next to the right field on 400', async () => {
    mockFetch(400, {
      error: { code: 'VALIDATION_ERROR', message: 'Please fix the highlighted fields', fields: { phone: 'Server says phone is bad' } },
    });
    renderSignup();
    const user = await fillValid();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Server says phone is bad')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a generic error when the request fails unexpectedly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));
    renderSignup();
    const user = await fillValid();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
  });
});
