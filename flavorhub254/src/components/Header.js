"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function Header({
  navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse recipes" },
    { href: "/flavorbot", label: "AI Recipe generator" },
  ],
  showSearch = false,
  searchBar = null,
  children,
}) {
  const { user, username, logOut, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Add "Favourite Recipes" if logged in
  const links = [...navLinks];
  if (user) {
    links.push({ href: "/favourites", label: "Favourite Recipes" });
  }

  // Filter out the current page
  const pathname = usePathname();
  const filteredLinks = links.filter((link) => link.href !== pathname);

  // --- Mini Search Logic ---
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [allRecipes, setAllRecipes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch all recipes for suggestions (title, slug, image)
    async function fetchRecipes() {
      const snapshot = await getDocs(collection(db, "recipes"));
      setAllRecipes(
        snapshot.docs.map((doc) => ({
          slug: doc.data().slug,
          title: doc.data().title,
          image: doc.data().image?.url || "/assets/placeholder.jpg",
        }))
      );
    }
    if (showSearch) fetchRecipes();
  }, [showSearch]);

  // Filtered suggestions
  const suggestions = searchTerm.trim()
    ? allRecipes.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="w-full shadow-md bg-transparent absolute top-0 left-0 z-50">
      <div className="max-w-8xl mx-auto flex items-center px-4 py-4 sm:py-6 justify-between">
        {/* Logo and Title */}
        <Link
          href="/"
          className="flex items-center space-x-1 cursor-pointer"
          style={{ userSelect: "none" }}
        >
          <img
            src="/assets/flavorhubicon.png"
            alt="FlavorHUB254 Logo"
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
          />
          <span className="text-2xl sm:text-3xl font-bold leading-none">
            flavor
            <span style={{ color: "#D32F2F" }}>HUB</span>
            <span style={{ color: "#2E7D32" }}>254</span>
          </span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-end gap-x-8 ml-8">
          {/* Navigation */}
          <nav className="flex gap-x-6 items-center">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="capitalize hover:text-green-500 transition text-base"
              >
                {link.label}
              </Link>
            ))}
            {/* Mini Search Bar */}
            {showSearch && (
              <form
                onSubmit={handleSearch}
                className="relative ml-4"
                autoComplete="off"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="search recipes"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  className="pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-white text-black"
                  style={{ minWidth: 160 }}
                />
                <button
                  type="submit"
                  className="ml-2 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-sm"
                >
                  Search
                </button>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full bg-gray-100 border border-gray-300 rounded-b-lg shadow-lg z-20 mt-1">
                    {suggestions.map((r) => (
                      <div
                        key={r.slug}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-green-100"
                        onMouseDown={() => {
                          setShowSuggestions(false);
                          setSearchTerm("");
                          router.push(`/recipe/${r.slug}`);
                        }}
                      >
                        <Image
                          src={r.image}
                          alt={r.title}
                          width={32}
                          height={32}
                          className="rounded object-cover"
                        />
                        <span className="text-black text-sm">{r.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            )}
          </nav>
          {/* Login/Signup/Logout */}
          <div className="flex items-center gap-x-3">
            {loading ? null : user ? (
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {username ? `Hi, ${username}` : user.email}
                </span>
                <button
                  onClick={logOut}
                  className="px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 transition text-base font-semibold lowercase"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition text-base font-semibold lowercase">
                  Login/Signup
                </button>
              </Link>
            )}
          </div>
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="px-3 py-2 bg-green-600 text-white rounded-lg"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>
      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed top-0 left-0 w-full bg-[#181818] bg-opacity-95 z-[999] flex flex-col items-center py-8 px-6 rounded-b-2xl shadow-lg md:hidden transition-all"
          style={{ maxHeight: "80vh" }}
        >
          <button
            className="absolute top-4 right-6 text-white text-3xl"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <nav className="flex flex-col gap-6 text-center mt-4 w-full">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl text-white font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {showSearch && (
              <form
                onSubmit={handleSearch}
                className="relative mt-4 w-full flex justify-center"
                autoComplete="off"
              >
                <span className="absolute inset-y-0 left-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="search recipes"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  className="pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-white text-black w-full"
                  style={{ minWidth: 160, maxWidth: 320 }}
                />
                <button
                  type="submit"
                  className="ml-2 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-sm"
                >
                  Search
                </button>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full bg-gray-100 border border-gray-300 rounded-b-lg shadow-lg z-20 mt-1 max-h-72 overflow-y-auto">
                    {suggestions.map(r => (
                      <div
                        key={r.slug}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-green-100"
                        onMouseDown={() => {
                          setShowSuggestions(false);
                          setSearchTerm("");
                          setMobileNavOpen(false);
                          router.push(`/recipe/${r.slug}`);
                        }}
                      >
                        <Image
                          src={r.image}
                          alt={r.title}
                          width={32}
                          height={32}
                          className="rounded object-cover"
                        />
                        <span className="text-black text-sm">{r.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            )}
            {loading ? null : user ? (
              <button
                onClick={() => {
                  logOut();
                  setMobileNavOpen(false);
                }}
                className="text-xl text-white font-semibold bg-red-700 hover:bg-red-800 rounded-lg px-4 py-2 mt-2"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xl text-white font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                Login/Signup
              </Link>
            )}
          </nav>
        </div>
      )}
      {/* Page-specific content */}
      {children}
    </header>
  );
}