"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function RecipePage({ params }) {
  const [servings, setServings] = useState(5);

  const handleDecrease = () => {
    setServings((prev) => (prev > 1 ? prev - 1 : 1));
  };
  const handleIncrease = () => {
    setServings((prev) => prev + 1);
  };

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
        <Header />

        <main className="flex-1 flex flex-col items-center pt-28 pb-12 px-2 sm:px-4">
          <section className="w-full max-w-6xl flex flex-col md:flex-row gap-12 bg-[#a94f4f]/90 rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-10 backdrop-blur-sm">
            {/* Left: Recipe Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-green-700 text-white px-4 py-1 rounded-full mb-3 text-sm font-semibold">
                Sweet Bakes
              </span>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">Vanilla Cake</h1>
                {/* Favorite Icon */}
                <button
                  className="ml-2 text-red-400 hover:text-red-600"
                  aria-label="Add to favorites"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-white font-semibold">(5.0)</span>
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
                <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                  300 g all-purpose flour
                </li>
                <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                  150 g sugar
                </li>
                <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                  150 g unsalted butter
                </li>
                <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                  2 large eggs
                </li>
              </ul>
              <h2 className="text-xl font-bold text-white mt-6 mb-2">
                INSTRUCTIONS
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-white">
                <li>Preheat the oven to 150°C.</li>
                <li>
                  Cream together the butter and sugar until light and fluffy.
                </li>
                <li>Beat in the eggs one at a time, then stir in the vanilla.</li>
                <li>
                  Combine the flour, baking powder, and salt; gradually add to the
                  creamed mixture alternating with the milk.
                </li>
              </ol>
            </div>
            {/* Right: Image & Actions */}
            <div className="flex-1 flex flex-col items-center min-w-0">
              <img
                src="/assets/sweet-bakes.jpg"
                alt="Vanilla Cake"
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
                  45 mins
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
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 21h8M12 17v4M12 3v14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Start Cooking
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 19V5m0 0l-7 7m7-7l7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 19V6h6v13M5 19h14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download Audio
                </button>
              </div>
              <p className="mt-2 text-white text-center text-base">
                This 2kg vanilla cake is pure comfort — soft, moist, and topped
                with velvety vanilla buttercream. It’s the perfect centerpiece for
                birthdays, baby showers, or weekend family tea.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
