import RecipePageClient from './RecipePageClient';

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  // Fetch recipe data by slug
  const { db } = await import('@/lib/firebase');
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'recipes'), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  let recipe = null;
  if (!querySnapshot.empty) {
    recipe = querySnapshot.docs[0].data();
  }

  return {
    title: recipe
      ? `${recipe.title} | flavorHUB254`
      : 'Recipe | flavorHUB254',
    description: recipe?.description
      ? recipe.description
      : `Learn how to make this recipe on flavorHUB254.`,
  };
}

export default async function Page(props) {
  const params = await props.params; // <-- Await here!
  return <RecipePageClient params={params} />;
}
