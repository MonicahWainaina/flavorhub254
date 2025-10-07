'use client';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PremiumPage() {
    const { user } = useAuth();
    const router = useRouter();

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
                        <div className="flex items-center justify-center mb-2">
                            {/* Gold crown icon */}
                            <svg className="inline-block w-8 h-8 mr-2 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 8l3.5 7 3.5-7 3.5 7L19 8" stroke="#FFD700" strokeWidth="1.5" fill="#FFD700"/>
                                <rect x="4" y="16" width="16" height="3" rx="1.5" fill="#FFD700" />
                            </svg>
                            <h1 className="text-3xl font-bold text-center text-[#FFD700]">
                                Go Premium
                            </h1>
                        </div>
                        <p className="text-lg text-center text-white font-semibold mb-4">
                            You can explore all recipes and use core features for free.<br />
                            Upgrade to Premium to unlock Smart Cooking, unlimited downloads, and more!
                        </p>
                        {/* Free vs Premium comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Free Plan */}
                            <div className="bg-[#232323] border-2 border-gray-400 rounded-xl p-6 shadow-lg flex flex-col items-center">
                                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
                                    <span className="mr-2">🧩</span> Free Plan
                                </h3>
                                <ul className="text-white text-sm space-y-2 mb-6">
                                    <li>✅ Access all public recipes</li>
                                    <li>✅ Adjust ingredient amounts/servings</li>
                                    <li>✅ Chat with FlavorBot (20 queries/day)</li>
                                    <li>✅ Up to 3 PDF downloads/day</li>
                                </ul>
                                <button
                                    className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-base mt-auto"
                                    onClick={() => router.push('/browse')}
                                >
                                    Continue Free
                                </button>
                            </div>
                            {/* Premium Plan */}
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
                        <span className="text-sm text-white text-center mt-4">
                            Only <span className="text-green-400 font-bold">KSh 250/month</span> (<span className="text-[#FFD700] font-bold">$1.99 USD/month</span> for international users). Cancel anytime.
                        </span>
                    </section>
                </main>
            </div>
        </div>
    );
}