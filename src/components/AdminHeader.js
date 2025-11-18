'use client';
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function AdminHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/recipes", label: "Recipes" },
    { href: "/admin/logs", label: "Logs" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <header className="w-full shadow-md bg-white/90 dark:bg-[#232323]/95 backdrop-blur-md fixed top-0 left-0 z-50 transition-colors">
      <div className="max-w-8xl mx-auto flex items-center px-2 py-2 sm:px-4 sm:py-3 justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <Link href="/admin" className="flex items-center space-x-1 cursor-pointer" style={{ userSelect: 'none' }}>
            <Image
              src="/assets/flavorhubicon.png"
              alt="FlavorHUB254 Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
              flavor
              <span style={{ color: '#D32F2F' }}>HUB</span>
              <span style={{ color: '#2E7D32' }}>254</span>
              <span className="ml-2 text-sm font-semibold text-green-600">Admin</span>
            </span>
          </Link>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Mobile Nav Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="p-2 bg-white rounded-lg"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            {/* Hamburger Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <line x1="4" y1="6" x2="20" y2="6" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4" y1="18" x2="20" y2="18" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed top-0 left-0 w-full bg-[#232323] bg-opacity-95 z-[999] flex flex-col items-center py-8 px-6 rounded-b-2xl shadow-lg lg:hidden transition-all"
          style={{ maxHeight: '80vh' }}
        >
          <button
            className="absolute top-4 right-6 text-white text-3xl"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <nav className="flex flex-col gap-6 text-center mt-4 w-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl text-white font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}