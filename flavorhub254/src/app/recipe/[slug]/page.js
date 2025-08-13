export default function RecipePage({ params }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Single Recipe Page</h1>
        <p className="mt-2 text-gray-600">
          Slug from URL: <span className="font-mono text-blue-600">{params.slug}</span>
        </p>
      </div>
    </main>
  );
}
