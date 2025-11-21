import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoritesPage from '../page';
import * as firestore from 'firebase/firestore';


beforeAll(() => {
  // Mock scrollTo on all elements
  Object.defineProperty(window.HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: function () {},
  });
});
// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'testuser' },
    loading: false,
    username: 'TestUser',
  }),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/', // <-- Add this line!
}));

const mockRecipes = [
  { id: '1', title: 'Chapati', slug: 'chapati', rating: 4.5, time: 30, image: {} },
  { id: '2', title: 'Pilau', slug: 'pilau', rating: 4.8, time: 45, image: {} },
];

describe('FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestore.getDocs.mockResolvedValue({
      docs: mockRecipes.map((r) => ({
        id: r.id,
        data: () => ({ recipe: r }),
      })),
    });
    firestore.deleteDoc.mockResolvedValue();
  });

it('renders favorite recipes', async () => {
  render(<FavoritesPage />);
  const chapatiEls = await screen.findAllByText('Chapati');
  expect(chapatiEls.length).toBeGreaterThan(0);
  expect(screen.getAllByText('Pilau').length).toBeGreaterThan(0);
});

  it('removes a recipe from favorites when FavoriteButton is clicked', async () => {
    render(<FavoritesPage />);
    const favBtns = await screen.findAllByRole('button', { name: /favorite/i });
    fireEvent.click(favBtns[0]);
    await waitFor(() => {
      expect(screen.queryByText('Chapati')).not.toBeInTheDocument();
    });
  });
});

describe('FavoritesPage empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestore.getDocs.mockResolvedValue({ docs: [] });
    firestore.deleteDoc.mockResolvedValue();
  });

  it('shows empty state if no favorites', async () => {
    render(<FavoritesPage />);
    await waitFor(() =>
      expect(
        screen.getByText(/you have not saved any recipes to your favorites/i)
      ).toBeInTheDocument()
    );
  });
});