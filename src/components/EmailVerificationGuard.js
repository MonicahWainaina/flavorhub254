"use client";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Guards all routes except /login and /verify-email.
 * If user is logged in but not email-verified, redirects to /verify-email.
 * Allows public access to /login and /verify-email.
 */
export default function EmailVerificationGuard({ children }) {
  const { user, loading, isEmailVerified } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run if not loading, user is logged in, and not verified
    if (
      !loading &&
      user &&
      !isEmailVerified &&
      !["/login", "/verify-email"].includes(pathname)
    ) {
      router.replace("/verify-email");
    }
  }, [user, isEmailVerified, loading, pathname, router]);

  // Optionally, you can block rendering children while loading
  if (loading) return null;

  return children;
}