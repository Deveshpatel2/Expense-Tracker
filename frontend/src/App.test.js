import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// The app calls the API on mount; keep it offline and deterministic.
beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: [] })
  });
  window.history.pushState({}, '', '/');
});

describe('App routing', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('renders the sign-in form for an unauthenticated visitor', async () => {
    render(<App />);

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('offers guest access without an account', async () => {
    render(<App />);

    expect(await screen.findByRole('button', { name: /guest/i })).toBeInTheDocument();
  });

  it('does not request expenses while signed out', async () => {
    render(<App />);

    await screen.findByRole('button', { name: /sign in/i });
    const expenseCalls = global.fetch.mock.calls.filter(([url]) => String(url).includes('/expenses'));
    expect(expenseCalls).toHaveLength(0);
  });
});
