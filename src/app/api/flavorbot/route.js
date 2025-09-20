import { NextResponse } from "next/server";
import OpenAI from "openai";
import sanitizeHtml from "sanitize-html";
import { validateRecipeJSON } from "@/lib/validateRecipe";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// --- CORS setup ---
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://flavorhub254.vercel.app",
  "https://flavorhub254-git-feature-homepage-monicahwainainas-projects.vercel.app",
];

function withCORS(response, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return withCORS(new NextResponse(null, { status: 204 }), origin);
}
// --- End CORS setup ---

// --- Analytics/logging helper ---
async function logFlavorbotEvent({
  userType,
  uid,
  promptType,
  prompt,
  blocked,
  ip,
}) {
  try {
    await addDoc(collection(db, "flavorbot_logs"), {
      timestamp: serverTimestamp(),
      userType,
      uid: uid || null,
      promptType,
      prompt,
      blocked,
      ip: ip || null,
    });
  } catch (e) {
    // Logging should never break the API
    console.error("Failed to log flavorbot event:", e);
  }
}

// --- Rate limiting setup ---
const LIMITS = {
  guest: 5,
  free: 20,
  premium: 100,
};
const RATE_LIMIT_WINDOW = 24 * 60 * 60; // 24 hours

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
  const origin = req.headers.get("origin") || "";
  let setCookieHeader = null;

  try {
    // Accept both { prompt, ... } and { messages, ... }
    const { prompt, messages, uid, isPremium } = await req.json();

    // Determine user type and rate limit key
    let userType = "guest";
    let key, ip, guestToken;

    if (uid) {
      userType = isPremium ? "premium" : "free";
      key = `flavorbot:rate:${userType}:${uid}`;
    } else {
      // --- Guest session token logic (async cookies) ---
      const cookieStore = await cookies();
      guestToken = cookieStore.get("flavorhub_guest")?.value;
      if (!guestToken) {
        guestToken = randomUUID();
        setCookieHeader = `flavorhub_guest=${guestToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
      }
      ip = getClientIp(req);
      key = `flavorbot:rate:guest:${guestToken}:${ip}`; // Combine cookie + IP
      // --- End guest session token logic ---
    }
    const limit = LIMITS[userType];

    // Rate limiting logic
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }
    if (current > limit) {
      await logFlavorbotEvent({
        userType,
        uid,
        promptType: "rate-limit",
        prompt: prompt || (messages && messages[messages.length - 1]?.content) || "",
        blocked: true,
        ip: ip || null,
      });
      let errorMsg;
      if (userType === "guest") {
        errorMsg =
          "You’ve reached the daily limit for guests. Please log in or sign up for more access!";
      } else if (userType === "free") {
        errorMsg =
          "You’ve reached your daily free limit. Upgrade to Premium for unlimited access!";
      } else {
        errorMsg =
          "You’ve reached your daily premium limit. Please try again tomorrow!";
      }
      const res = withCORS(NextResponse.json({ error: errorMsg }, { status: 429 }), origin);
      if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
      return res;
    }

    // Get the latest user prompt (for logging/classification)
    const latestPrompt = prompt || (messages && messages[messages.length - 1]?.content) || "";

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
    if (greetings.some((greet) => latestPrompt.trim().toLowerCase() === greet)) {
      await logFlavorbotEvent({
        userType,
        uid,
        promptType: "greeting",
        prompt: latestPrompt,
        blocked: false,
        ip: ip || null,
      });
      const res = withCORS(
        NextResponse.json({
          role: "assistant",
          content:
            "Hi! I’m FlavorBot — your smart kitchen companion. I can help you find recipes, answer cooking questions, and share tips on ingredients and nutrition. What’s cooking in your mind today?",
        }),
        origin
      );
      if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
      return res;
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
          content: `Is this about food, cooking, recipes, nutrition, or ingredients? "${latestPrompt}"`,
        },
      ],
      max_tokens: 1,
    });
    const isFoodRelated =
      classification.choices[0].message.content.trim().toLowerCase() === "yes";

    if (!isFoodRelated) {
      await logFlavorbotEvent({
        userType,
        uid,
        promptType: "off-topic",
        prompt: latestPrompt,
        blocked: true,
        ip: ip || null,
      });
      const res = withCORS(
        NextResponse.json({
          role: "assistant",
          content:
            "I'm only equipped to help you with recipes, food, nutrition, and cooking questions. Try asking me something in those areas!",
        }),
        origin
      );
      if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
      return res;
    }

    // Step 2: classify message for recipe mode
    const isRecipe = /recipe|cook|make|prepare|bake|ingredients/i.test(latestPrompt);

    // Step 3: Recipe Mode
    if (isRecipe) {
      // Build the message history for context, or just use the latest prompt if not provided
      const recipeMessages = messages && messages.length
        ? [
            {
              role: "system",
              content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
If the user asks for a recipe, respond ONLY with valid JSON that matches the FlavorHUB254 recipe schema:
{"title":string,"ingredients":string[],"steps":string[]}
Do not add extra text.`,
            },
            ...messages,
          ]
        : [
            {
              role: "system",
              content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
If the user asks for a recipe, respond ONLY with valid JSON that matches the FlavorHUB254 recipe schema:
{"title":string,"ingredients":string[],"steps":string[]}
Do not add extra text.`,
            },
            { role: "user", content: latestPrompt },
          ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: recipeMessages,
        max_tokens: 500,
      });

      let recipeText = response.choices[0].message.content;

      // Try to extract JSON from the response
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        await logFlavorbotEvent({
          userType,
          uid,
          promptType: "recipe",
          prompt: latestPrompt,
          blocked: true,
          ip: ip || null,
        });
        const res = withCORS(
          NextResponse.json({
            role: "assistant",
            content: "Oops, I couldn’t generate a proper recipe this time. Please try again.",
          }),
          origin
        );
        if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
        return res;
      }
      const recipeJSON = jsonMatch[0];

      // Validate JSON before returning
      if (!validateRecipeJSON(recipeJSON)) {
        await logFlavorbotEvent({
          userType,
          uid,
          promptType: "recipe",
          prompt: latestPrompt,
          blocked: true,
          ip: ip || null,
        });
        const res = withCORS(
          NextResponse.json({
            role: "assistant",
            content: "Oops, I couldn’t generate a proper recipe this time. Please try again.",
          }),
          origin
        );
        if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
        return res;
      }

      await logFlavorbotEvent({
        userType,
        uid,
        promptType: "recipe",
        prompt: latestPrompt,
        blocked: false,
        ip: ip || null,
      });
      const res = withCORS(NextResponse.json(JSON.parse(recipeJSON)), origin);
      if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
      return res;
    }

    // Step 4: Food Q&A Mode
    // Build the message history for context, or just use the latest prompt if not provided
    const qaMessages = messages && messages.length
      ? [
          {
            role: "system",
            content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
You ONLY answer food-related questions: cooking methods, substitutions, nutrition, cultural food context, ingredients.
Answer clearly and concisely (2–4 sentences).
Expand with more detail only if the user asks for it.
If the prompt is not food-related, politely refuse.`,
          },
          ...messages,
        ]
      : [
          {
            role: "system",
            content: `You are FlavorBot — FlavorHUB254’s Smart Cooking Assistant.
You ONLY answer food-related questions: cooking methods, substitutions, nutrition, cultural food context, ingredients.
Answer clearly and concisely (2–4 sentences).
Expand with more detail only if the user asks for it.
If the prompt is not food-related, politely refuse.`,
          },
          { role: "user", content: latestPrompt },
        ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: qaMessages,
      max_tokens: 300,
    });

    // Sanitize the AI's response to remove any HTML/JS
    const clean = sanitizeHtml(response.choices[0].message.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    await logFlavorbotEvent({
      userType,
      uid,
      promptType: "general",
      prompt: latestPrompt,
      blocked: false,
      ip: ip || null,
    });

    const res = withCORS(
      NextResponse.json({
        role: "assistant",
        content: clean,
      }),
      origin
    );
    if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
    return res;
  } catch (error) {
    console.error("Flavorbot API error:", error);
    const res = withCORS(
      NextResponse.json({ error: "Internal server error." }, { status: 500 }),
      origin
    );
    if (setCookieHeader) res.headers.set("Set-Cookie", setCookieHeader);
    return res;
  }
}