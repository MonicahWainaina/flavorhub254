import { NextResponse } from "next/server";
import OpenAI from "openai";
import sanitizeHtml from "sanitize-html";
import { validateRecipeJSON } from "@/lib/validateRecipe";

// --- Rate limiting setup ---
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const GUEST_LIMIT = 10; // max 10 requests per hour per IP
const rateLimitStore = {};

function getClientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
// --- End rate limiting setup ---

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  // --- Rate limiting logic ---
  const ip = getClientIp(req);
  const now = Date.now();
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }
  // Remove old timestamps
  rateLimitStore[ip] = rateLimitStore[ip].filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW
  );
  if (rateLimitStore[ip].length >= GUEST_LIMIT) {
    return NextResponse.json(
      {
        error:
          "You have reached the maximum number of free requests. Please try again later or log in for more access.",
      },
      { status: 429 }
    );
  }
  // Record this request
  rateLimitStore[ip].push(now);
  // --- End rate limiting logic ---

  const { prompt } = await req.json();

  // Handle greetings/intros
  const greetings = [
    "hi",
    "hello",
    "hey",
    "who are you",
    "what can you do",
    "help",
    "about you",
  ];
  if (greetings.some((greet) => prompt.trim().toLowerCase() === greet)) {
    return NextResponse.json({
      role: "assistant",
      content:
        "Hi! I’m FlavorBot — your smart kitchen companion. I can help you find recipes, answer cooking questions, and share tips on ingredients and nutrition. What’s cooking in your mind today?",
    });
  }

  // Step 1: Use OpenAI to classify if the prompt is food-related
  const classification = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Only answer 'yes' or 'no'. Answer 'yes' if the question is about food, cooking, recipes, nutrition, ingredients, or anything related to eating or preparing food. Otherwise, answer 'no'.",
      },
      {
        role: "user",
        content: `Is this about food, cooking, recipes, nutrition, or ingredients? "${prompt}"`,
      },
    ],
    max_tokens: 1,
  });
  const isFoodRelated =
    classification.choices[0].message.content.trim().toLowerCase() === "yes";

  if (!isFoodRelated) {
    return NextResponse.json({
      role: "assistant",
      content:
        "I'm only equipped to help you with recipes, food, nutrition, and cooking questions. Try asking me something in those areas!",
    });
  }

  // Step 2: classify message for recipe mode
  const isRecipe = /recipe|cook|make|prepare|bake|ingredients/i.test(prompt);

  // Step 3: Recipe Mode
  if (isRecipe) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
If the user asks for a recipe, respond ONLY with valid JSON that matches the FlavorHUB254 recipe schema:
{"title":string,"ingredients":string[],"steps":string[]}
Do not add extra text.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    let recipeText = response.choices[0].message.content;

    // Try to extract JSON from the response
    const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        role: "assistant",
        content: "Oops, I couldn’t generate a proper recipe this time. Please try again.",
      });
    }
    const recipeJSON = jsonMatch[0];

    // Validate JSON before returning
    if (!validateRecipeJSON(recipeJSON)) {
      return NextResponse.json({
        role: "assistant",
        content: "Oops, I couldn’t generate a proper recipe this time. Please try again.",
      });
    }

    return NextResponse.json(JSON.parse(recipeJSON));
  }

  // Step 4: Food Q&A Mode
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
You ONLY answer food-related questions: cooking methods, substitutions, nutrition, cultural food context, ingredients.
Answer clearly and concisely (2–4 sentences).
Expand with more detail only if the user asks for it.
If the prompt is not food-related, politely refuse.`,
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 300,
  });

  // Sanitize the AI's response to remove any HTML/JS
  const clean = sanitizeHtml(response.choices[0].message.content, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return NextResponse.json({
    role: "assistant",
    content: clean,
  });
}