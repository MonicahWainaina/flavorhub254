export const metadata = {
  title: "Browse Recipes | flavorHUB254",
  description: "Explore and discover delicious Kenyan and global recipes by category, ingredient, or search on flavorHUB254.",
};

import { Suspense } from 'react';
import BrowseContent from './BrowseContent';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}