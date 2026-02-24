'use client';

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import Header from "@/components/Header";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function LoginPageClient() {
  const [navOpen, setNavOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (isSignup && !username)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Save username to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username,
          email,
          createdAt: new Date(),
        });
        // Send verification email
        await sendEmailVerification(userCredential.user);
        setVerificationNotice(true);
        // Redirect to verify-email page
        router.push("/verify-email");
        return;
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          // If not verified, redirect to verify-email page
          router.push("/verify-email");
          return;
        }
        router.push("/");
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("auth/", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/assets/backdrop.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-60" />
      </div>

      {/* Header/Nav */}
      <Header />

      {/* Login/Signup Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-2 pt-2 md:pb-20">
        <div className="w-full max-w-3xl bg-black bg-opacity-70 rounded-xl shadow-lg p-0 border border-gray-600 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-8">
              {isSignup ? "Sign Up" : "Login"}
            </h1>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <div className="flex items-center bg-white rounded-md px-3 py-3">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Username"
                    aria-label="Username"
                    className="bg-transparent outline-none flex-1 text-gray-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="flex items-center bg-white rounded-md px-3 py-3">
                <MdEmail className="text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  className="bg-transparent outline-none flex-1 text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center bg-white rounded-md px-3 py-3">
                <FaLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  className="bg-transparent outline-none flex-1 text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isSignup && (
                <div className="flex items-center justify-between text-sm text-white">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember Me
                  </label>
                  <a href="#" className="hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
              </button>
            </form>
            <p className="mt-8 text-center text-white text-sm">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-bold hover:underline text-green-400"
                    onClick={() => setIsSignup(false)}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="font-bold hover:underline text-green-400"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </div>
          {/* Right: Tomato Image */}
          <div className="hidden md:flex flex-1 items-center justify-center bg-transparent relative">
            <img
              src="/assets/tomatoes.png"
              alt="tomato"
              className="w-64 h-74 object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  );
}