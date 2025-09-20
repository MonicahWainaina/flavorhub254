import { z } from "zod";

export const RecipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

export function validateRecipeJSON(jsonString) {
  try {
    const obj = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    RecipeSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}