"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function VerifyEmailPage() {
  const { user, isEmailVerified, resendVerification, refreshUser, loading } = useAuth();
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // If already verified, redirect to home/dashboard
  useEffect(() => {
    if (!loading && isEmailVerified) {
      router.replace("/");
    }
  }, [isEmailVerified, loading, router]);

  const handleResend = async () => {
    setError("");
    try {
      await resendVerification();
      setResent(true);
    } catch (err) {
      setError("Failed to resend verification email. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setError("");
    try {
      await refreshUser();
    } catch (err) {
      setError("Failed to refresh status. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0">
        <img
          src="/assets/backdrop.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-60" />
      </div>
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center px-2 pt-2 md:pb-20">
        <div className="w-full max-w-md bg-black bg-opacity-80 rounded-xl shadow-lg p-8 border border-gray-600 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
          <p className="text-white text-center mb-4">
            We’ve sent a verification link to <b>{user?.email}</b>.<br />
            Please check your inbox and click the link to verify your email.
          </p>
          <p className="text-yellow-300 text-center mb-4">
            <b>Tip:</b> If you don&apos;t see the email, check your <b>Spam</b> or <b>Junk</b> folder.
          </p>
          <button
            onClick={handleResend}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition mb-2"
          >
            Resend Verification Email
          </button>
          {resent && (
            <p className="text-green-400 text-center mb-2">
              Verification email resent!
            </p>
          )}
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition mb-2"
          >
            I have verified my email
          </button>
          <p className="text-gray-400 text-center text-sm mt-2">
            After verifying, click the button above or log in again.
          </p>
          {error && (
            <p className="text-red-400 text-center mt-2">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}