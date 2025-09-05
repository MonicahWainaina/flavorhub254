import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';
import userEvent from '@testing-library/user-event';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    username: null,
    logOut: jest.fn(),
    loading: false,
  }),
})); 

// Mock next/navigation if your component uses router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/login', // Mock usePathname to return the login path
}));


// Mock Firebase Auth methods if used in your component
jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

describe('LoginPage', () => {
  it('renders login form by default', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('can switch to signup form', () => {
    render(<LoginPage />);
    const switchBtn = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(switchBtn);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });



it('shows error on empty login submit', async () => {
  render(<LoginPage />);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(
      screen.getByText("Please fill in all required fields.")
    ).toBeInTheDocument();
  });
});

  // Add more tests for successful login, signup, loading state, etc.
});