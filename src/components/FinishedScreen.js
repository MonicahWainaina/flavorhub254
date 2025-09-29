'use client';
import { useRouter } from "next/navigation";

export default function FinishedScreen({ recipe }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <h1 className="text-4xl font-bold text-green-400 mb-6">🎉 Finished Cooking!</h1>
      <p className="text-white text-lg mb-8">
        Congratulations! You’ve completed <span className="font-semibold">{recipe.title}</span>.
      </p>
      <div className="flex gap-4">
        <button
          className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-bold text-lg"
          onClick={() => router.refresh()}
        >
          Restart
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold text-lg"
          onClick={() => router.push(`/recipe/${recipe.slug}`)}
        >
          Exit Cooking
        </button>
      </div>
    </div>
  );
}