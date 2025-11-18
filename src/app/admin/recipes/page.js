import AdminAuthGuard from "../../../components/AdminAuthGuard";

export default function AdminRecipesPage() {
  return (
    <AdminAuthGuard>
      <div>
        <h1>Recipe Management</h1>
        {/* 
          TODO:
          - Add new recipes
          - Edit or delete existing recipes
          - Update tags, categories, prep time
          - Add audio or smart cooking metadata
        */}
        <p>This is where you can manage recipes.</p>
      </div>
    </AdminAuthGuard>
  );
}