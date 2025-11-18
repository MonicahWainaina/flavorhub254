'use client';
import { useEffect, useState } from "react";
import AdminAuthGuard from "../../components/AdminAuthGuard";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/AdminFooter";
import { db } from "../../lib/firebase"; // adjust if your firebase export is elsewhere
import { collection, getCountFromServer, query, where, getDocs, Timestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Users", value: "..." },
    { label: "Active Premium", value: "..." },
    { label: "Payments (30d)", value: "..." },
    { label: "Recipes", value: "..." },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      // 1. Total Users
      const usersSnap = await getCountFromServer(collection(db, "users"));
      // 2. Active Premium Users
      const premiumSnap = await getCountFromServer(
        query(collection(db, "users"), where("isPremium", "==", true))
      );
      // 3. Recipes
      const recipesSnap = await getCountFromServer(collection(db, "recipes"));
      // 4. Payments (last 30 days)
      const now = Timestamp.now();
      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const paymentsQuery = query(
        collection(db, "payments"),
        where("createdAt", ">=", thirtyDaysAgo)
      );
      const paymentsSnap = await getDocs(paymentsQuery);
      let totalPayments = 0;
      paymentsSnap.forEach(doc => {
        totalPayments += doc.data().amount || 0;
      });

      setStats([
        { label: "Total Users", value: usersSnap.data().count },
        { label: "Active Premium", value: premiumSnap.data().count },
        { label: "Payments (30d)", value: `KES ${totalPayments.toLocaleString()}` },
        { label: "Recipes", value: recipesSnap.data().count },
      ]);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome, Admin!</h1>
          <p className="text-gray-300 mb-8">
            Use the dashboard below to manage users, payments, recipes, and more.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#232323] rounded-lg p-4 text-center shadow text-white"
              >
                <div className="text-2xl font-bold">
                  {loading ? <span className="animate-pulse">...</span> : stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

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
          {/* Optional: Add recent activity or charts here */}
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}