import React from 'react';
import { render, screen } from '@testing-library/react';
import CheckoutPage from '../page';

// Mock next/navigation
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => '/checkout', // or whatever path you want to simulate
}));

// Mock AuthContext
let mockUser = null;
let mockLoading = false;
const mockRefreshUser = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    refreshUser: mockRefreshUser,
  }),
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockLoading = false;
  });


  it('redirects to /login if not authenticated', () => {
    mockUser = null;
    mockLoading = false;
    render(<CheckoutPage />);
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('redirects to /premium if user is already premium', () => {
    mockUser = { isPremium: true };
    mockLoading = false;
    render(<CheckoutPage />);
    expect(pushMock).toHaveBeenCalledWith('/premium');
  });

  it('shows payment buttons for normal user', () => {
    mockUser = { isPremium: false, email: 'test@example.com', uid: 'abc123' };
    mockLoading = false;
    render(<CheckoutPage />);
    expect(screen.getByRole('button', { name: /Pay with M-Pesa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay with Card/i })).toBeInTheDocument();
  });
});