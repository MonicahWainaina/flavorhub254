export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center">
        Welcome to flavorHUB254
      </h1>
      <p className="mt-4 text-base sm:text-lg md:text-xl text-center max-w-md">
        Tailwind CSS + Theme Variables are working! 🎉
      </p>
      <button className="mt-6 px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-sm sm:text-base md:text-lg">
        Test Button
      </button>
    </main>
  );
}
