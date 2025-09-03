// Utility: convert decimals to kitchen fractions for tsp/tbsp
 function toFraction(decimal) {
  // Round to nearest 0.25
  const rounded = Math.round(decimal * 4) / 4;
  const map = { 0.25: '1/4', 0.5: '1/2', 0.75: '3/4' };
  if (rounded === 0) return '';
  if (map[rounded]) return map[rounded];
  return rounded.toString();
}

// Utility: smart rounding for ingredient amounts
 function smartRound(amount, unit) {
  if (
    [
      'large',
      'medium',
      'small',
      'cloves',
      'egg',
      'eggs',
      'onion',
      'onions',
    ].some((u) => (unit || '').toLowerCase().includes(u))
  ) {
    return Math.round(amount);
  }
  if (['tsp', 'tbsp'].some((u) => (unit || '').toLowerCase().includes(u))) {
    const whole = Math.floor(amount);
    const decimal = amount - whole;
    const frac = toFraction(decimal);
    return frac ? `${whole > 0 ? whole + ' ' : ''}${frac}` : `${whole}`;
  }
  if (['g', 'ml'].some((u) => (unit || '').toLowerCase().includes(u))) {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
}

// Utility: clamp values between min and max
function clamp(value, min, max) {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

// Utility: scale ingredients and optionally servings
 function scaleIngredients(recipe, { flour, servings }) {
  if (recipe.editable_ingredients) {
    const flourObj = recipe.ingredients.find((i) => i.editable);
    const baseFlour = flourObj.amount;
    // Clamp flour to min/max
    const flourVal = clamp(flour, flourObj.min, flourObj.max);
    const scale = flourVal / baseFlour;
    const scaledServings = Math.round((recipe.base_servings || 1) * scale);
    return {
      ingredients: recipe.ingredients.map((i) => {
        let amt = i.editable ? flourVal : i.amount * scale;
        // Clamp ingredient amount if min/max present
        amt = clamp(amt, i.min, i.max);
        return { ...i, amount: smartRound(amt, i.unit) };
      }),
      servings: scaledServings,
    };
  } else if (recipe.adjustable_servings) {
    // Clamp servings to min/max
    let targetServings = clamp(
      servings,
      recipe.min_servings,
      recipe.max_servings
    );
    const scale = targetServings / recipe.base_servings;
    return {
      ingredients: recipe.ingredients.map((i) => {
        let amt = i.amount * scale;
        amt = clamp(amt, i.min, i.max);
        return { ...i, amount: smartRound(amt, i.unit) };
      }),
      servings: targetServings,
    };
  }
  return {
    ingredients: recipe.ingredients,
    servings: recipe.base_servings || 1,
  };
}

// Metric conversion utility (basic, for demo)
 function convertUnit(amount, unit, toMetric) {
  if (!toMetric) {
    if (unit === 'g')
      return { amount: Math.round((amount / 28.35) * 100) / 100, unit: 'oz' };
    if (unit === 'ml')
      return { amount: Math.round((amount / 240) * 100) / 100, unit: 'cups' };
  } else {
    if (unit === 'oz') return { amount: Math.round(amount * 28.35), unit: 'g' };
    if (unit === 'cups')
      return { amount: Math.round(amount * 240), unit: 'ml' };
  }
  return { amount, unit };
}

module.exports = {
  toFraction,
  smartRound,
  scaleIngredients,
  convertUnit,
};