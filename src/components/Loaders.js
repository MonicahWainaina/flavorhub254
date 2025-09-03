import React from "react";

export function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ff914d]" />
      <span role="status" className="sr-only">Loading...</span>
    </div>
  );
}

export function HeroRecipeSkeleton() {
  return (
    <div className="relative flex flex-col items-center w-full sm:w-[260px] bg-[#232323] rounded-xl border-b-4 border-[#d97d7d] shadow-md px-2 sm:px-4 mx-auto h-full pt-8 animate-pulse">
      <div className="w-full flex justify-center absolute left-0 right-0 -top-10 sm:-top-14 z-10">
        <div className="absolute left-0 right-0 -top-[20px] sm:-top-[30px] w-full h-[100px] sm:h-[170px] bg-gray-700 rounded-xl" />
      </div>
      <div className="flex flex-col flex-1 w-full justify-between mt-16">
        <div className="h-6 bg-gray-600 rounded w-3/4 mx-auto mb-2" />
        <div className="flex items-center justify-center mb-2">
          <div className="h-4 bg-gray-600 rounded w-1/2" />
        </div>
        <hr className="w-11/12 border-t border-gray-700 my-2" />
        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-1 mt-1 gap-2">
          <div className="h-4 bg-gray-600 rounded w-1/3" />
          <div className="h-8 bg-gray-700 rounded w-1/2 sm:w-1/3 mt-2 sm:mt-0" />
        </div>
      </div>
    </div>
  );
}

export function CarouselRecipeSkeleton() {
  return (
    <div className="bg-[#232323] rounded-xl w-[260px] flex-shrink-0 shadow-lg overflow-hidden relative flex flex-col animate-pulse">
      <div className="relative w-full h-[200px] bg-gray-700" />
      <div className="flex items-center justify-between px-4 py-4 bg-[#a8323e]">
        <div className="h-5 bg-gray-600 rounded w-3/4" />
        <div className="h-6 w-6 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="bg-[#232323] rounded-xl overflow-hidden shadow flex-shrink-0 w-[180px] animate-pulse">
      <div className="w-full h-[200px] bg-gray-700" />
      <div className="p-4">
        <div className="h-5 bg-gray-600 rounded w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export function RecipeSkeleton() {
  return (
    <section  data-testid="recipe-skeleton" className="w-full max-w-6xl flex flex-col md:flex-row gap-12 bg-[#a94f4f]/90 rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-10 backdrop-blur-sm animate-pulse">
      {/* Left: Info */}
      <div className="flex-1 min-w-0">
        <div className="h-6 w-32 bg-green-700 rounded-full mb-3" />
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-48 bg-gray-600 rounded" />
          <div className="h-8 w-8 bg-gray-700 rounded-full" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 bg-yellow-400 rounded-full" />
          <div className="h-6 w-16 bg-gray-600 rounded" />
        </div>
        <div className="h-4 w-full bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
        <div className="h-10 w-32 bg-green-700 rounded-lg mb-4" />
        <div className="space-y-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-full bg-[#d97d7d] rounded-lg" />
          ))}
        </div>
        <div className="h-8 w-40 bg-gray-600 rounded mb-2" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-full bg-gray-700 rounded" />
          ))}
        </div>
      </div>
      {/* Right: Image & Actions */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="rounded-xl w-full max-w-lg mb-4 h-[300px] bg-gray-700" />
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-24 bg-[#232323] rounded-lg" />
          <div className="h-8 w-36 bg-[#232323] rounded-lg" />
        </div>
        <div className="flex flex-row gap-3 w-full mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-green-700 rounded-lg" />
          ))}
        </div>
        <div className="h-6 w-3/4 bg-gray-600 rounded mt-2" />
      </div>
    </section>
  );
}

// Add more skeletons as needed...