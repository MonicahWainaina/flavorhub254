const { scaleIngredients, smartRound } = require('../utils');

describe('scaleIngredients', () => {
  it('scales editable ingredients by flour amount', () => {
    const recipe = {
      editable_ingredients: true,
      base_servings: 4,
      ingredients: [
        { name: 'Flour', amount: 200, unit: 'g', editable: true },
        { name: 'Sugar', amount: 100, unit: 'g' },
      ],
    };
    const result = scaleIngredients(recipe, { flour: 400 });
    expect(result.ingredients[0].amount).toBe(400);
    expect(result.ingredients[1].amount).toBe(200);
    expect(result.servings).toBe(8);
  });

  it('scales ingredients by servings when adjustable_servings is true', () => {
    const recipe = {
      adjustable_servings: true,
      base_servings: 2,
      ingredients: [
        { name: 'Eggs', amount: 2, unit: 'eggs' },
        { name: 'Milk', amount: 100, unit: 'ml' },
      ],
    };
    const result = scaleIngredients(recipe, { servings: 4 });
    expect(result.ingredients[0].amount).toBe(4);    // 2 eggs * 2
    expect(result.ingredients[1].amount).toBe(200);  // 100 ml * 2
    expect(result.servings).toBe(4);
  });

  it('clamps servings and ingredient amounts to min/max', () => {
    const recipe = {
      adjustable_servings: true,
      base_servings: 4,
      min_servings: 2,
      max_servings: 6,
      ingredients: [
        { name: 'Eggs', amount: 4, unit: 'eggs', min: 2, max: 6 },
        { name: 'Milk', amount: 200, unit: 'ml', min: 100, max: 300 },
      ],
    };

    // Below min
    let result = scaleIngredients(recipe, { servings: 1 });
    expect(result.servings).toBe(2);
    expect(result.ingredients[0].amount).toBeGreaterThanOrEqual(2);
    expect(result.ingredients[1].amount).toBeGreaterThanOrEqual(100);

    // Above max
    result = scaleIngredients(recipe, { servings: 10 });
    expect(result.servings).toBe(6);
    expect(result.ingredients[0].amount).toBeLessThanOrEqual(6);
    expect(result.ingredients[1].amount).toBeLessThanOrEqual(300);
  });

  it('clamps servings to min and max even if ingredients do not have min/max', () => {
  const recipe = {
    adjustable_servings: true,
    base_servings: 4,
    min_servings: 2,
    max_servings: 6,
    ingredients: [
      { name: 'Eggs', amount: 4, unit: 'eggs' },
      { name: 'Milk', amount: 200, unit: 'ml' },
    ],
  };

  // Below min_servings
  let result = scaleIngredients(recipe, { servings: 1 });
  expect(result.servings).toBe(2);
  expect(result.ingredients[0].amount).toBe(2);    // 4 * 0.5
  expect(result.ingredients[1].amount).toBe(100);  // 200 * 0.5

  // Above max_servings
  result = scaleIngredients(recipe, { servings: 10 });
  expect(result.servings).toBe(6);
  expect(result.ingredients[0].amount).toBe(6);    // 4 * 1.5
  expect(result.ingredients[1].amount).toBe(300);  // 200 * 1.5
});

  it('returns base values for non-adjustable recipes', () => {
    const recipe = {
      base_servings: 4,
      adjustable_servings: false,
      editable_ingredients: false,
      ingredients: [
        { name: 'Eggs', amount: 4, unit: 'eggs' },
        { name: 'Milk', amount: 200, unit: 'ml' },
      ],
    };
    const result = scaleIngredients(recipe, { servings: 10 });
    expect(result.servings).toBe(4);
    expect(result.ingredients[0].amount).toBe(4);
    expect(result.ingredients[1].amount).toBe(200);
  });

  it('clamps flour scaling to min and max values', () => {
    const recipe = {
      editable_ingredients: true,
      base_servings: 4,
      ingredients: [
        { name: 'Flour', amount: 200, unit: 'g', editable: true, min: 100, max: 400 },
        { name: 'Sugar', amount: 100, unit: 'g' },
      ],
    };

    // Below min
    let result = scaleIngredients(recipe, { flour: 50 });
    expect(result.ingredients[0].amount).toBe(100); // min flour
    expect(result.servings).toBe(2); // scaled from min flour

    // Above max
    result = scaleIngredients(recipe, { flour: 1000 });
    expect(result.ingredients[0].amount).toBe(400); // max flour
    expect(result.servings).toBe(8); // scaled from max flour
  });
});

describe('smartRound', () => {
  it('rounds eggs to nearest integer', () => {
    expect(smartRound(2.7, 'eggs')).toBe(3);
  });
});