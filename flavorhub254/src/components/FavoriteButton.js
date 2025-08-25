"use client";

export default function FavoriteButton({ isFav = false, onClick }) {
  return (
    <button
      className="ml-2"
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      onClick={onClick}
      type="button"
    >
      <svg className="w-7 h-7" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="31" fill="white" stroke="black" strokeWidth="2" />
        <path
          d="M32 44C32 44 18 35.36 18 27.5C18 22.81 21.81 19 26.5 19C29.04 19 31.36 20.36 32 22.09C32.64 20.36 34.96 19 37.5 19C42.19 19 46 22.81 46 27.5C46 35.36 32 44 32 44Z"
          fill={isFav ? "black" : "white"}
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}