"use client";
import { useAuth } from "@/context/AuthContext";

export default function TestAuthPage() {
  const { user, loading, logOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Auth Page</h1>
      {user ? (
        <div>
          <p>Logged in as: <strong>{user.email}</strong></p>
          <button
            onClick={logOut}
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Not logged in.</p>
          <a href="/login" style={{ color: "#2e7d32" }}>Go to Login</a>
        </div>
      )}
    </div>
  );
}