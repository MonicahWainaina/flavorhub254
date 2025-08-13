export default function RecipePage({ params }) {
  return (
    <main>
      <h1>Single Recipe Page</h1>
      <p>Slug from URL: {params.slug}</p>
    </main>
  );
}
