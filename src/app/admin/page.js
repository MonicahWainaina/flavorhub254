import AdminAuthGuard from "../../components/AdminAuthGuard";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/AdminFooter";

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome, Admin!</h1>
          <p className="text-gray-300 mb-8">
            Use the dashboard below to manage users, payments, recipes, and more.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <a href="/admin/users" className="bg-[#232323] hover:bg-[#2e7d32] text-white rounded-xl p-6 shadow-lg transition">
              <span className="text-xl font-semibold">User Management</span>
              <p className="text-sm text-gray-300 mt-2">View, search, and manage users</p>
            </a>
            <a href="/admin/payments" className="bg-[#232323] hover:bg-[#a8323e] text-white rounded-xl p-6 shadow-lg transition">
              <span className="text-xl font-semibold">Payments</span>
              <p className="text-sm text-gray-300 mt-2">Monitor and export payment logs</p>
            </a>
            <a href="/admin/recipes" className="bg-[#232323] hover:bg-[#d97d7d] text-white rounded-xl p-6 shadow-lg transition">
              <span className="text-xl font-semibold">Recipes</span>
              <p className="text-sm text-gray-300 mt-2">Add, edit, or remove recipes</p>
            </a>
            <a href="/admin/logs" className="bg-[#232323] hover:bg-[#ff914d] text-white rounded-xl p-6 shadow-lg transition">
              <span className="text-xl font-semibold">Logs</span>
              <p className="text-sm text-gray-300 mt-2">View system and payment logs</p>
            </a>
            <a href="/admin/settings" className="bg-[#232323] hover:bg-[#2e7d32] text-white rounded-xl p-6 shadow-lg transition">
              <span className="text-xl font-semibold">Settings</span>
              <p className="text-sm text-gray-300 mt-2">Feature toggles and admin settings</p>
            </a>
          </div>
          {/* Optional: Add quick stats or recent activity here */}
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}