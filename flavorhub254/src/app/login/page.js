"use client";
import { useState } from "react";
import { FaUser, FaLock, FaBars, FaTimes } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function LoginPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

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
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 h-16 md:h-28">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/flavorhubicon.png"
            alt="logo"
            className="h-12 w-12 md:h-24 md:w-24 object-contain"
          />
          <span className="text-white text-2xl md:text-4xl font-bold leading-none">
            flavor<span className="text-red-500">HUB</span>
            <span className="text-green-500">254</span>
          </span>
        </div>
        {/* Desktop nav */}
        <nav className="space-x-10 hidden md:flex">
          <a href="#" className="text-white text-lg font-medium hover:text-green-400">Home</a>
          <a href="#" className="text-white text-lg font-medium hover:text-green-400">Browse recipes</a>
          <a href="#" className="text-white text-lg font-medium hover:text-green-400">AI Recipe generator</a>
        </nav>
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden text-white text-3xl focus:outline-none"
          onClick={() => setNavOpen((open) => !open)}
          aria-label="Open menu"
        >
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>
        {/* Mobile nav dropdown */}
        {navOpen && (
          <nav className="absolute right-4 top-full mt-2 bg-black bg-opacity-90 rounded-lg shadow-lg flex flex-col gap-4 py-4 px-8 md:hidden z-30">
            <a
              href="#"
              className="text-white text-lg font-semibold hover:text-green-400"
              onClick={() => setNavOpen(false)}
            >
              Home
            </a>
            <a
              href="#"
              className="text-white text-lg font-semibold hover:text-green-400"
              onClick={() => setNavOpen(false)}
            >
              Browse recipes
            </a>
            <a
              href="#"
              className="text-white text-lg font-semibold hover:text-green-400"
              onClick={() => setNavOpen(false)}
            >
              AI Recipe generator
            </a>
          </nav>
        )}
      </header>

      {/* Login/Signup Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-2 pt-2 md:pb-20">
        <div className="w-full max-w-3xl bg-black bg-opacity-70 rounded-xl shadow-lg p-0 border border-gray-600 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-8">
              {isSignup ? "Sign Up" : "Login"}
            </h1>
            <form className="space-y-5">
              <div className="flex items-center bg-white rounded-md px-3 py-3">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Username"
                  className="bg-transparent outline-none flex-1 text-gray-700"
                />
              </div>
              {isSignup && (
                <div className="flex items-center bg-white rounded-md px-3 py-3">
                  <MdEmail className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-transparent outline-none flex-1 text-gray-700"
                  />
                </div>
              )}
              <div className="flex items-center bg-white rounded-md px-3 py-3">
                <FaLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent outline-none flex-1 text-gray-700"
                />
              </div>
              {!isSignup && (
                <div className="flex items-center justify-between text-sm text-white">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                  <a href="#" className="hover:underline">Forgot Password?</a>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
              >
                {isSignup ? "Sign Up" : "Sign In"}
              </button>
            </form>
            <p className="mt-8 text-center text-white text-sm">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-bold hover:underline"
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
                    className="font-bold hover:underline"
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
