const { filterRecipes } = require('../filterRecipes');

const recipes = [
  {
    title: 'Chapati',
    category: 'Breakfast',
    tags: ['vegan'],
    ingredients: ['Flour', 'Water', 'Salt'],
  },
  {
    title: 'Pilau',
    category: 'Kenyan Classics',
    tags: ['spicy'],
    ingredients: ['Rice', 'Beef', 'Spices'],
  },
  {
    title: 'Mandazi',
    category: 'Breakfast',
    tags: ['sweet'],
    ingredients: [{ name: 'Flour' }, { name: 'Sugar' }, { name: 'Yeast' }],
  },
];

describe('filterRecipes', () => {
  it('filters by search term', () => {
    const result = filterRecipes(recipes, { searchTerm: 'cha' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Chapati');
  });

  it('filters by category', () => {
    const result = filterRecipes(recipes, { selectedCategory: 'Breakfast' });
    expect(result).toHaveLength(2);
  });

  it('filters by ingredient', () => {
    const result = filterRecipes(recipes, { selectedIngredients: ['Beef'] });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Pilau');
  });

  it('filters by multiple ingredients', () => {
    const result = filterRecipes(recipes, { selectedIngredients: ['Flour', 'Sugar'] });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Mandazi');
  });

  it('filters by search, category, and ingredient together', () => {
    const result = filterRecipes(recipes, {
      searchTerm: 'man',
      selectedCategory: 'Breakfast',
      selectedIngredients: ['Flour'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Mandazi');
  });

  it('filters by category and ingredient', () => {
  const result = filterRecipes(recipes, {
    selectedCategory: 'Breakfast',
    selectedIngredients: ['Flour'],
  });
  expect(result).toHaveLength(2); // Chapati and Mandazi both match
});
});