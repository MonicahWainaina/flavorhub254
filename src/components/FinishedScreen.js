'use client';
import { useRouter } from "next/navigation";

export default function FinishedScreen({ recipe, onRestart }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-2 pb-28">
      <div className="w-full mt-20 sm:mt-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-400 mb-2 text-center w-full">🎉 Finished Cooking!</h1>
        <h2 className="text-xl font-bold text-white mb-2 text-center w-full">{recipe.title}</h2>
        {recipe.image?.url && (
          <img
            src={recipe.image.url}
            alt={recipe.image.alt || recipe.title}
            className="shadow mb-4 w-full max-w-md object-cover mx-auto"
          />
        )}
        <p className="text-white text-base mb-6 text-center w-full">
          Congratulations! You’ve completed <span className="font-semibold">{recipe.title}</span>.
        </p>
        <div className="flex flex-row gap-2 w-full max-w-lg mb-4">
          <button
            className="bg-green-700 hover:bg-green-800 text-white flex-1 py-3 rounded-lg font-bold text-base"
            onClick={onRestart}
          >
            Restart
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-800 text-white flex-1 py-3 rounded-lg font-bold text-base"
            onClick={() => router.push(`/recipe/${recipe.slug}`)}
          >
            Exit Cooking
          </button>
        </div>
      </div>
    </div>
  );
}