import AdminAuthGuard from "../../../components/AdminAuthGuard";

export default function AdminUsersPage() {
  return (
    <AdminAuthGuard>
      <div>
        <h1>User Management</h1>
        {/* 
          TODO: 
          - List all users
          - Show signup date, last login, email verified status
          - Search/filter users
          - Reset/remove premium status
        */}
        <p>This is where you will manage users.</p>
      </div>
    </AdminAuthGuard>
  );
}