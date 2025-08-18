"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#111] text-white py-12 px-4 mt-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
        {/* Left: Logo, tagline, burger image */}
        <div className="flex flex-col justify-between relative ml-4">
          <div className="flex items-center space-x- mb-4">
            <img src="/assets/flavorhubicon.png" alt="FlavorHUB254 Logo" className="h-15 w-15 object-contain" />
            <span className="text-3xl font-bold text-white">
              flavor<span style={{ color: "#D32F2F" }}>HUB</span><span style={{ color: "#2E7D32" }}>254</span>
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold mb-2">Kenya’s Smart Recipe Library</div>
            <img 
              src="/assets/burgerfooter.png" 
              alt="Burger Stack" 
              className="w-40 mt-1 ml-5"
              style={{ transform: "rotate(-22deg)" }}
            />
          </div>
        </div>
        {/* Center: Quick Links */}
        <div className="flex flex-col ml-15">
          <div className="text-xl font-bold mb-4">Quick Links</div>
          <ul className="space-y-3 text-base">
            <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
            <li><Link href="/browse" className="hover:text-green-400 transition">Browse Recipes</Link></li>
            <li><Link href="/ai-recipe" className="hover:text-green-400 transition">Ask FlavorBot</Link></li>
            <li><Link href="/contact" className="hover:text-green-400 transition">Login/ Sign Up</Link></li>
          </ul>
        </div> 
        {/* Right: Contact, social, herbs image */}
        <div className="flex flex-col items-start justify-between relative w-full">
          <div className="w-full">
            <div className="text-xl font-bold mb-4">Contact</div>
            <div className="flex items-center mb-3">
              <span>Email: <a href="mailto:hello@flavorhub254.co.ke" className="underline hover:text-green-400">hello@flavorhub254.co.ke</a></span>
            </div>
            <div className="flex space-x-4 mb-4">
              <a href="#" aria-label="Twitter" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.7 8.7 0 0024 4.59a8.51 8.51 0 01-2.54.7z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.13.88a1.13 1.13 0 11-2.25 0 1.13 1.13 0 012.25 0z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17 22 12z"/>
                </svg>
              </a>
            </div>
            <div className="text-sm mt-2 mb-2">@2025 flavorHub254. All rights reserved</div>
          </div>
        </div>
        <img 
          src="/assets/herbsfooter.png" 
          alt="Spices and Herbs" 
          className="w-55 h-55 object-contain  -mt-2"
          style={{ minWidth: "100px" }}
        />
      </div>
    </footer>
  );
}