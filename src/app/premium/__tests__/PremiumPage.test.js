import React from 'react';
import { render, screen } from '@testing-library/react';
import PremiumPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/premium',
}));

// Mock AuthContext
const mockRefreshUser = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    refreshUser: mockRefreshUser,
  }),
}));

let mockUser = null;

describe('PremiumPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows free plan and upgrade button for non-premium user', () => {
    mockUser = { isPremium: false };
    render(<PremiumPage />);
    expect(screen.getByText(/Free Plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upgrade to Premium/i })).toBeInTheDocument();
  });

  it('shows premium card for active premium user', () => {
    mockUser = {
      isPremium: true,
      premiumExpires: { seconds: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    };
    render(<PremiumPage />);
    expect(screen.getByText(/You’re a Premium Member/i)).toBeInTheDocument();
    expect(screen.getByText(/Expires on:/i)).toBeInTheDocument();
  });

  it('shows upgrade button if premium expired', () => {
    mockUser = {
      isPremium: true,
      premiumExpires: { seconds: Math.floor(Date.now() / 1000) - 60 * 60 * 24 },
    };
    render(<PremiumPage />);
    expect(screen.getByRole('button', { name: /Upgrade to Premium/i })).toBeInTheDocument();
  });
});