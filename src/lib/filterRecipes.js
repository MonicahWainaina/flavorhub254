function filterRecipes(recipes, { searchTerm = '', selectedCategory = null, selectedIngredients = [] }) {
  const term = searchTerm.trim().toLowerCase();
  return recipes.filter((r) => {
    const matchesCategory = selectedCategory
      ? r.category === selectedCategory
      : true;
    const matchesSearch =
      !term ||
      r.title?.toLowerCase().includes(term) ||
      r.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
      (Array.isArray(r.ingredients) &&
        r.ingredients.some((ing) =>
          typeof ing === 'string'
            ? ing.toLowerCase().includes(term)
            : ing.name?.toLowerCase().includes(term)
        ));

    const matchesIngredients =
      selectedIngredients.length === 0 ||
      selectedIngredients.every((selected) =>
        r.ingredients?.some((ing) =>
          typeof ing === 'string'
            ? ing.toLowerCase().includes(selected.toLowerCase())
            : ing.name?.toLowerCase().includes(selected.toLowerCase())
        )
      );

    return matchesCategory && matchesSearch && matchesIngredients;
  });
}

module.exports = { filterRecipes };