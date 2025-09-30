import OpenAI from "openai";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { text, recipeSlug, userId } = await req.json();
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts", // or "tts-1" for higher quality
      voice: "alloy", // try "aria", "echo", "fable", "onyx", "nova", "shimmer"
      input: text,
    });

    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    // --- LOGGING USAGE TO FIRESTORE ---
    try {
      await addDoc(collection(db, "tts_usage_logs"), {
        userId: userId || null, // If you pass userId from client, otherwise null
        recipeSlug: recipeSlug || null, // If you pass recipeSlug from client, otherwise null
        text,
        timestamp: serverTimestamp(),
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
      });
    } catch (logErr) {
      // Logging should not block TTS response
      console.error("TTS usage logging failed:", logErr);
    }
    // --- END LOGGING ---

    return new Response(JSON.stringify({ audioBase64 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TTS API error:", err);
    return new Response(JSON.stringify({ error: "TTS failed" }), { status: 500 });
  }
}