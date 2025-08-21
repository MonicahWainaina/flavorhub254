"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { use } from "react";

export default function RecipePage({ params }) {
  const { slug } = use(params);
  const [servings, setServings] = useState(5);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDecrease = () => setServings((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setServings((prev) => prev + 1);

  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true);
      const q = query(collection(db, "recipes"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setRecipe(querySnapshot.docs[0].data());
        setServings(querySnapshot.docs[0].data().base_servings || 1);
      } else {
        setRecipe(null);
      }
      setLoading(false);
    }
    if (slug) fetchRecipe();
  }, [slug]);

  if (loading)
    return (
      <div className="text-white text-center py-20">Loading...</div>
    );
  if (!recipe)
    return (
      <div className="text-white text-center py-20">Recipe not found.</div>
    );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background image and overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/backdrop.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black opacity-80" />
      </div>

      {/* Content (Header, Main, Footer) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header showSearch />

        <main className="flex-1 flex flex-col items-center pt-28 pb-12 px-2 sm:px-4">
          <section className="w-full max-w-6xl flex flex-col md:flex-row gap-12 bg-[#a94f4f]/90 rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-10 backdrop-blur-sm">
            {/* Left: Recipe Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-green-700 text-white px-4 py-1 rounded-full mb-3 text-sm font-semibold">
                {recipe.category}
              </span>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{recipe.title}</h1>
                <FavoriteButton />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-white font-semibold">
                  ({recipe.rating?.toFixed(1) || "N/A"})
                </span>
              </div>
              {/* HR above */}
              <hr className="border-white/60 mb-2" />
              {/* Ingredients Title + Adjust Amount */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">INGREDIENTS</h2>
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold ml-2">
                  Adjust Amount
                </button>
              </div>
              {/* HR below */}
              <hr className="border-white/60 mb-4" />
              {/* Metrics Dropdown */}
              <div className="mb-4 bg-white rounded-lg px-3 py-2 inline-block">
                <label className="text-black mr-2 font-semibold">Metrics:</label>
                <select className="rounded-lg px-2 py-1 text-black bg-white border border-gray-300">
                  <option value="metric">Metric</option>
                  <option value="us">US/Imperial</option>
                </select>
              </div>
              <ul className="mb-6 space-y-2">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((item, idx) => (
                    <li
                      key={idx}
                      className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white"
                    >
                      {item.name
                        ? `${item.amount ?? ""} ${item.unit ?? ""} ${item.name}`
                        : String(item)}
                    </li>
                  ))
                ) : (
                  <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                    No ingredients listed.
                  </li>
                )}
              </ul>
              <h2 className="text-xl font-bold text-white mt-6 mb-2">
                INSTRUCTIONS
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-white">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((step, idx) => <li key={idx}>{step}</li>)
                ) : (
                  <li>No instructions listed.</li>
                )}
              </ol>
            </div>
            {/* Right: Image & Actions */}
            <div className="flex-1 flex flex-col items-center min-w-0">
              <Image
                src={recipe.image?.url || "/assets/placeholder.jpg"}
                alt={recipe.image?.alt || recipe.title}
                width={400}
                height={300}
                className="rounded-xl w-full max-w-lg mb-4 shadow-lg object-cover"
              />
              {/* Adjustable Servings */}
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-[#232323] text-white px-3 py-1 rounded-lg flex items-center gap-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {recipe.time || "N/A"} mins
                </span>
                <span className="bg-[#232323] text-white px-3 py-1 rounded-lg flex items-center gap-2">
                  <button
                    className="text-lg px-2 font-bold hover:bg-[#444] rounded"
                    aria-label="Decrease servings"
                    onClick={handleDecrease}
                  >
                    -
                  </button>
                  <span className="font-semibold">{servings} Servings</span>
                  <button
                    className="text-lg px-2 font-bold hover:bg-[#444] rounded"
                    aria-label="Increase servings"
                    onClick={handleIncrease}
                  >
                    +
                  </button>
                </span>
              </div>
              {/* Action Buttons Side by Side */}
              <div className="flex flex-row gap-3 w-full mb-4">
                {/* Start Cooking (Flame) */}
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#C75C5C" />
                    <path
                      opacity="0.2"
                      d="M28.1,58.1c0,0-16.1-2.4-16.1-16.1s21-15,16.4-32c0,0,15.7,4.9,11.9,20.2c0,0,2.1-1.3,3.7-3.9c0,0,8,6.2,8,15.5
                      s-11,16.2-16.3,16.2c0,0,5.6-7.6,0.5-12.5c-7.3-7-4.2-11.4-4.2-11.4S14.2,42.8,28.1,58.1z"
                      fill="#231F20"
                    />
                    <path d="M28.1,56.1c0,0-16.1-2.4-16.1-16.1s21-15,16.4-32c0,0,15.7,4.9,11.9,20.2c0,0,2.1-1.3,3.7-3.9c0,0,8,6.2,8,15.5
                    s-11,16.2-16.3,16.2c0,0,5.6-7.6,0.5-12.5c-7.3-7-4.2-11.4-4.2-11.4S14.2,40.8,28.1,56.1z"
                      fill="#F5CF87"
                    />
                  </svg>
                  Start Cooking
                </button>
                {/* Download PDF */}
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="none">
                    <polygon
                      fill="#B12A27"
                      points="475.435,117.825 475.435,512 47.791,512 47.791,0.002 357.613,0.002 412.491,54.881"
                    />
                    <rect
                      x="36.565"
                      y="34.295"
                      width="205.097"
                      height="91.768"
                      fill="#F2F2F2"
                    />
                    <polygon
                      opacity="0.08"
                      fill="#040000"
                      points="475.435,117.825 475.435,512 47.791,512 47.791,419.581 247.705,219.667 259.54,207.832 266.098,201.273 277.029,190.343 289.995,177.377 412.491,54.881"
                    />
                    <polygon
                      fill="#771B1B"
                      points="475.435,117.836 357.599,117.836 357.599,0"
                    />
                  </svg>
                  Download PDF
                </button>
                {/* Download Audio */}
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M18.6,5.2C18.3,5,18,5,17.7,5L5.8,9H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l11.8,4c0.1,0,0.2,0,0.3,0
                      c0.2,0,0.4-0.1,0.6-0.2c0.3-0.2,0.4-0.5,0.4-0.8V16V6C19,5.7,18.8,5.4,18.6,5.2z"
                      fill="#FFC10A"
                    />
                    <path
                      d="M25.8,16c0.1-2.9-0.8-5.6-2.8-7.8c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c1.6,1.8,2.4,4.1,2.2,6.5
                      c0,0,0,0.1,0,0.1c-0.2,2.4-1.3,4.7-3.1,6.3c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3
                      c2.2-2,3.6-4.7,3.8-7.6C25.8,16.2,25.8,16.1,25.8,16z"
                      fill="#673AB7"
                    />
                    <path
                      d="M27.3,5.5c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c2.3,2.6,3.4,6,3.2,9.2c-0.2,3.4-1.7,6.7-4.4,9.1
                      c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3C29.1,23.8,30.8,20,31,16C31.1,12.3,29.9,8.5,27.3,5.5z"
                      fill="#673AB7"
                    />
                    <path
                      d="M5,10c0-0.4,0.3-0.8,0.7-1l0.2,0H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l-0.2,0C5.3,22.8,5,22.4,5,22
                      v-6V10z"
                      fill="#673AB7"
                    />
                  </svg>
                  Download Audio
                </button>
              </div>
              <p className="mt-2 text-white text-center text-base">
                {recipe.description}
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
