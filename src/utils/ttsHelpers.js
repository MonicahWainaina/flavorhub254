export function normalizeUnitsForSpeech(text) {
  return text
    .replace(/\b(\d+)\s*g\b/gi, '$1 grams')
    .replace(/\b(\d+)\s*ml\b/gi, '$1 milliliters')
    .replace(/\b(\d+)\s*kg\b/gi, '$1 kilograms')
    .replace(/\btsp\b/gi, 'teaspoon')
    .replace(/\btbsp\b/gi, 'tablespoon')
    .replace(/\bmg\b/gi, 'milligrams')
    .replace(/\bl\b/gi, 'liters');
}