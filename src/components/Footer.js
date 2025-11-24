"use client";
import Link from "next/link";
import { FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full text-white py-10 px-4 mt-8 relative pb-20 sm:pb-8">
      <div className="flex justify-center lg:justify-normal">
        <div className="max-w-3xl w-full lg:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {/* Left: Logo, tagline, burger image */}
          <div className="flex flex-col justify-between items-center lg:items-start relative ml-0 lg:ml-4">
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
                style={{ transform: "rotate(-22deg)" }} // Tilt burger image
              />
            </div>
          </div>
          {/* Center: Quick Links */}
          <div className="flex flex-col items-center lg:items-start ml-0 lg:ml-15">
            <div className="text-xl font-bold mb-4">Quick Links</div>
            <ul className="space-y-3 text-base">
              <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link href="/browse" className="hover:text-green-400 transition">Browse Recipes</Link></li>
              <li><Link href="/flavorbot" className="hover:text-green-400 transition">Ask FlavorBot</Link></li>
              <li><Link href="/login" className="hover:text-green-400 transition">Login/ Sign Up</Link></li>
            </ul>
          </div> 
          {/* Right: Contact, social, herbs image */}
          <div className="flex flex-col items-center lg:items-start justify-between relative w-full">
            <div>
              <div className="text-xl font-bold mb-4">Contact</div>
              <div className="flex items-center mb-3">
                <span>Email: <a href="mailto:hello@flavorhub254.com" className="underline hover:text-green-400">hello@flavorhub254.com</a></span>
              </div>
              <div className="flex space-x-4 mb-4">
                <a href="https://twitter.com/FHub25439525" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <FaTwitter className="w-7 h-7" />
                </a>
                <a href="https://instagram.com/flavorhub254" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <FaInstagram className="w-7 h-7" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61584228176241" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <FaFacebook className="w-7 h-7" />
                </a>
                <a href="https://tiktok.com/@flavorhub254" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <FaTiktok className="w-7 h-7" />
                </a>
                <a href="https://youtube.com/@flavorhub254" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <FaYoutube className="w-7 h-7" />
                </a>
              </div>
              <div className="text-sm mt-2 mb-2">@2025 flavorHub254. All rights reserved</div>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start justify-between relative w-full">
            <img 
              src="/assets/herbsfooter.png" 
              alt="Spices and Herbs" 
              className="w-55 h-55 object-contain  -mt-2 mx-auto lg:mx-0"
              style={{ minWidth: "100px" }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <a href="/legal/tos" className="text-xs text-gray-400 hover:text-green-500">Terms of Service</a>
        <a href="/legal/privacy" className="text-xs text-gray-400 hover:text-green-500">Privacy Policy</a>
      </div>
    </footer>
  );
}