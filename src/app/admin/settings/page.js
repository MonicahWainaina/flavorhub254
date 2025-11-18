import AdminAuthGuard from "../../../components/AdminAuthGuard";

export default function AdminSettingsPage() {
  return (
    <AdminAuthGuard>
      <div>
        <h1>Admin Settings</h1>
        {/* 
          TODO:
          - Enable/disable premium features site-wide
          - Toggle recipe audio generation, PDF downloads, etc.
          - Configure allowed domains or email domains (if needed)
        */}
        <p>This is where you can manage admin settings and feature toggles.</p>
      </div>
    </AdminAuthGuard>
  );
}