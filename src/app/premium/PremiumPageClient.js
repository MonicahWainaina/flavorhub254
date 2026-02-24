'use client';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PremiumPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Helper: check if premium expired
  const premiumExpired = user?.premiumExpires
    ? new Date() > new Date(user.premiumExpires.seconds * 1000)
    : false;

  // Helper: show expiry date
  const showExpiry = user?.isPremium && user?.premiumExpires;

  // Helper: show upgrade button if not premium or expired
  const showUpgrade = !user?.isPremium || premiumExpired;

  // Helper: is premium user
  const isPremium = user?.isPremium && !premiumExpired;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-white text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background image and overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/backdrop.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black opacity-80" />
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header showSearch={false} />
        <main className="flex-1 flex flex-col items-center pt-28 pb-12 px-2 sm:px-4">
          <section className="w-full max-w-3xl flex flex-col gap-8 bg-[#232323]/95 rounded-3xl shadow-2xl border border-green-700 p-6 sm:p-10 backdrop-blur-sm">
            {/* Card Heading */}
            <div className="flex items-center justify-center mb-2 gap-2">
              <svg className="w-7 h-7 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 8l3.5 7 3.5-7 3.5 7L19 8" stroke="#FFD700" strokeWidth="1.5" fill="#FFD700"/>
                <rect x="4" y="16" width="16" height="3" rx="1.5" fill="#FFD700" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#FFD700]">
                Premium Membership
              </h1>
            </div>
            {/* Only show pitch and free plan for non-premium users */}
            {!isPremium && (
              <>
                <p className="text-lg text-center text-white font-semibold mb-4">
                  You can explore all recipes and use core features for free.<br />
                  Upgrade to Premium to unlock Smart Cooking, unlimited downloads, and more!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Free Plan */}
                  <div className="bg-[#232323] border-2 border-gray-400 rounded-xl p-6 shadow-lg flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
                      <span className="mr-2">🧩</span> Free Plan
                    </h3>
                    <ul className="text-white text-sm space-y-2 mb-6">
                      <li>✅ Access all public recipes</li>
                      <li>✅ Adjust ingredient amounts/servings</li>
                      <li>✅ Chat with FlavorBot (10 queries/day)</li>
                      <li>✅ Up to 3 PDF downloads/day</li>
                    </ul>
                    <button
                      className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-base mt-auto"
                      onClick={() => router.push('/browse')}
                    >
                      Continue Free
                    </button>
                  </div>
                  {/* Premium Plan Card */}
                  <div className="bg-[#232323] border-2 border-yellow-400 rounded-xl p-6 shadow-lg flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-yellow-400/30">
                    <h3 className="text-lg font-bold text-[#FFD700] mb-4 flex items-center">
                      <span className="mr-2">💎</span> Premium Plan
                    </h3>
                    <ul className="text-white text-sm space-y-2 mb-6">
                      <li>💎 Unlimited PDF downloads</li>
                      <li>💎 Unlimited Audio (AI voice)</li>
                      <li>💎 Smart Cooking Mode</li>
                      <li>💎 Unlimited chats with FlavorBot</li>
                      <li>💎 Priority Support</li>
                      <li>💎 Early Access to new features</li>
                    </ul>
                    {!user ? (
                      <button
                        className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg font-bold text-base mt-auto"
                        onClick={() => router.push('/login')}
                      >
                        Log in to Upgrade
                      </button>
                    ) : isPremium ? (
                      <div className="flex flex-col items-center w-full">
                        <span className="bg-yellow-400 text-[#232323] px-5 py-2 rounded-lg font-bold text-base mt-auto flex items-center justify-center mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="black"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                          </svg>
                          You’re a Premium Member
                        </span>
                        {showExpiry && (
                          <span className="text-white text-sm mt-1 mb-2">
                            Expires on: {new Date(user.premiumExpires.seconds * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        className="bg-[#FFD700] hover:bg-[#ffe066] text-[#232323] px-5 py-2 rounded-lg font-bold text-base mt-auto"
                        onClick={() => router.push('/checkout')}
                      >
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Premium user card */}
            {isPremium && (
              <div className="flex flex-col items-center w-full">
                <div className="bg-[#232323] border-2 border-yellow-400 rounded-xl p-8 shadow-lg max-w-md w-full mx-auto flex flex-col items-center">
                  <ul className="text-white text-base space-y-3 mb-8 w-full">
                    <li>💎 Unlimited PDF downloads</li>
                    <li>💎 Unlimited Audio (AI voice)</li>
                    <li>💎 Smart Cooking Mode</li>
                    <li>💎 Unlimited chats with FlavorBot</li>
                    <li>💎 Priority Support</li>
                    <li>💎 Early Access to new features</li>
                  </ul>
                  <span className="bg-yellow-400 text-[#232323] px-5 py-2 rounded-lg font-bold text-base flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="black"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                    </svg>
                    You’re a Premium Member
                  </span>
                  {showExpiry && (
                    <span className="text-white text-sm mb-2 text-center w-full">
                      Expires on: {new Date(user.premiumExpires.seconds * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white text-center mt-6">
                  Only <span className="text-green-400 font-bold">KSh 250</span> (<span className="text-[#FFD700] font-bold">$1.99 USD</span> for international users) per premium period. Pay again to renew when expired.
                </span>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}