'use client';
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminAuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || user.uid !== ADMIN_UID) {
    return <div>403 Forbidden: Admins only</div>;
  }

  return children;
}