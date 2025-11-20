'use client';
import { useEffect, useState } from "react";
import AdminAuthGuard from "../../../components/AdminAuthGuard";
import AdminHeader from "../../../components/AdminHeader";
import AdminFooter from "../../../components/AdminFooter";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); // For detail modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Filter users by email or username
  const filteredUsers = users.filter(
    u =>
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase()))
  );

  // Reset Premium
  async function handleResetPremium(userId) {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    await updateDoc(doc(db, "users", userId), { isPremium: false });
    setUsers(users =>
      users.map(u =>
        u.id === userId ? { ...u, isPremium: false } : u
      )
    );
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  }

  // Toggle Block/Unblock
  async function handleToggleBlockUser(userId, isBlocked) {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    await updateDoc(doc(db, "users", userId), { blocked: !isBlocked });
    setUsers(users =>
      users.map(u =>
        u.id === userId ? { ...u, blocked: !isBlocked } : u
      )
    );
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  }

  // Hard Delete
  async function handleDeleteUser(userId) {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    await deleteDoc(doc(db, "users", userId));
    setUsers(users => users.filter(u => u.id !== userId));
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  }

  // Export Users as CSV
  function exportUsersCSV() {
    const headers = [
      "Email",
      "Username",
      "Signup Date",
      "Last Login",
      "Email Verified",
      "Premium",
      "Blocked"
    ];
    const rows = filteredUsers.map(u => [
      u.email || "",
      u.username || "",
      u.createdAt?.toDate ? u.createdAt.toDate().toLocaleString() : "",
      u.lastLogin?.toDate ? u.lastLogin.toDate().toLocaleString() : "",
      u.emailVerified ? "Yes" : "No",
      u.isPremium ? "Yes" : "No",
      u.blocked ? "Yes" : "No"
    ]);
    const csvContent =
      [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Open user detail modal
  function handleViewUser(user) {
    setSelectedUser(user);
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    setShowModal(false);
    setSelectedUser(null);
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-5xl mx-auto py-6 px-2 sm:py-12 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">User Management</h1>
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Search by email or username"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-96 px-4 py-2 rounded bg-[#232323] text-white border border-gray-700"
            />
          </div>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-[#232323] text-white text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left">Email</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Username</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Signup Date</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Last Login</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Email Verified</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Premium</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Blocked</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <span className="animate-pulse">Loading users...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="px-2 sm:px-4 py-2">{user.email || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">{user.username || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {user.createdAt?.toDate
                          ? user.createdAt.toDate().toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {user.lastLogin?.toDate
                          ? user.lastLogin.toDate().toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {user.emailVerified ? "Yes" : "No"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {user.isPremium ? (
                          <span className="text-green-400 font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {user.blocked ? (
                          <span className="text-red-400 font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            disabled={actionLoading[user.id]}
                            onClick={() => handleViewUser(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                          >
                            View
                          </button>
                          <button
                            disabled={actionLoading[user.id]}
                            onClick={() => handleResetPremium(user.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
                          >
                            {actionLoading[user.id] ? "..." : "Reset Premium"}
                          </button>
                          <button
                            disabled={actionLoading[user.id]}
                            onClick={() => handleToggleBlockUser(user.id, user.blocked)}
                            className={`${
                              user.blocked
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            } text-white px-2 py-1 rounded text-xs`}
                          >
                            {actionLoading[user.id]
                              ? "..."
                              : user.blocked
                              ? "Restore Access"
                              : "Remove Access"}
                          </button>
                          <button
                            disabled={actionLoading[user.id]}
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-gray-700 hover:bg-black text-white px-2 py-1 rounded text-xs"
                          >
                            {actionLoading[user.id] ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Export Users Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={exportUsersCSV}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
            >
              Export Users (CSV)
            </button>
          </div>

          {/* User Detail Modal */}
          {showModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#232323] rounded-lg p-8 max-w-md w-full text-white relative">
                <button
                  className="absolute top-2 right-4 text-2xl"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">User Details</h2>
                <div className="space-y-2">
                  <div><span className="font-semibold">Email:</span> {selectedUser.email || "-"}</div>
                  <div><span className="font-semibold">Username:</span> {selectedUser.username || "-"}</div>
                  <div><span className="font-semibold">Premium:</span> {selectedUser.isPremium ? "Yes" : "No"}</div>
                  <div><span className="font-semibold">Blocked:</span> {selectedUser.blocked ? "Yes" : "No"}</div>
                  <div><span className="font-semibold">Email Verified:</span> {selectedUser.emailVerified ? "Yes" : "No"}</div>
                  <div><span className="font-semibold">Signup Date:</span> {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : "-"}</div>
                  <div><span className="font-semibold">Last Login:</span> {selectedUser.lastLogin?.toDate ? selectedUser.lastLogin.toDate().toLocaleString() : "-"}</div>
                </div>
              </div>
            </div>
          )}
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}