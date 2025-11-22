'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Script from 'next/script';

export default function CheckoutPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [paystackReady, setPaystackReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.isPremium) router.push('/premium');
  }, [user, loading, router]);

  // Called when Paystack script loads
  const handleScriptLoad = () => setPaystackReady(true);

  // Accepts 'mpesa' or 'card'
  const handlePaystackPay = (method) => {
    setStatus('Opening Paystack checkout...');
    if (!user?.email) {
      setStatus('Please log in to continue.');
      return;
    }
    if (!window.PaystackPop) {
      setStatus('Paystack is not loaded. Please wait and try again.');
      return;
    }
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 250 * 100,
      currency: 'KES',
      channels: method === 'mpesa' ? ['mobile_money'] : ['card'],
      callback: function(response) {
        setStatus('Payment successful! Upgrading...');
        fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference, uid: user.uid }),
        }).then(async () => {
          if (refreshUser) await refreshUser();
          router.push('/premium');
        });
      },
      onClose: function() {
        setStatus('Payment cancelled.');
      },
    });
    handler.openIframe();
  };

  const isLive = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.startsWith('pk_live_');

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-white text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <div className="fixed inset-0 z-0">
          <img
            src="/assets/backdrop.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-black opacity-80" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header showSearch={false} />
          <main className="flex-1 flex flex-col items-center pt-28 pb-12 px-2 sm:px-4">
            <section className="w-full max-w-xl flex flex-col gap-8 bg-[#232323]/95 rounded-3xl shadow-2xl border border-green-700 p-6 sm:p-10 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-center text-[#FFD700] mb-2">
                Checkout
              </h1>
              <p className="text-center text-white mb-4">
                Choose your payment method to upgrade to Premium.
              </p>
              <div className="flex justify-center gap-4 mb-6 w-full max-w-md mx-auto">
                {/* M-Pesa Button */}
                <button
                  className={`flex items-center justify-center w-full min-w-0 px-2 py-2 rounded-lg font-bold border-2 transition ${
                    isLive
                      ? 'bg-[#e6ffe6] text-green-700 border-green-700 hover:bg-[#b3ffb3]'
                      : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  }`}
                  style={{ fontSize: '1rem', letterSpacing: '0.03em', maxWidth: '200px' }}
                  disabled={!isLive || loading || !paystackReady}
                  onClick={isLive ? () => handlePaystackPay('mpesa') : undefined}
                  aria-label="Pay with M-Pesa"
                  title={isLive ? "Pay with M-Pesa" : "M-Pesa available in live mode only"}
                >
                  <span className="flex items-center whitespace-nowrap text-center">
                    <span className="font-bold" style={{ marginRight: '-8px' }}>M</span>
                    <img src="/assets/mpesa-icon.png" alt="M-Pesa" className="w-8 h-8" style={{ marginLeft: '-1px', marginRight: '-1px' }} />
                    <span className="font-bold" style={{ marginLeft: '-8px' }}>PESA</span>
                  </span>
                  {!isLive && <span className="ml-2 text-xs">(Live mode only)</span>}
                </button>
                {/* Card Button */}
                <button
                  className="flex flex-row items-center justify-center w-full min-w-0 px-2 py-2 rounded-lg font-bold border-2 transition bg-[#e6edff] text-[#635bff] border-[#635bff] hover:bg-[#b3c6ff] hover:text-[#635bff]"
                  style={{ fontSize: '1rem', letterSpacing: '0.03em', maxWidth: '200px' }}
                  onClick={() => handlePaystackPay('card')}
                  disabled={loading || !paystackReady}
                  aria-label="Pay with Card"
                >
                  <span className="flex items-center mr-2">
                    <img src="/assets/stripe.png" alt="Card" className="w-8 h-8 mr-1" />
                  </span>
                  <span className="text-center leading-tight break-words text-sm">
                    Credit/Debit<br />Card
                  </span>
                </button>
              </div>
              {status && (
                <div className="text-center text-green-400 font-bold mt-4">
                  {status}
                </div>
              )}
              <span className="text-sm text-white text-center mt-4">
                One-time payment of{' '}
                <span className="text-green-400 font-bold">KSh 250</span> (
                <span className="text-[#FFD700] font-bold">$1.99 USD</span>
                ). Enjoy premium features instantly!
              </span>
              <div className="flex justify-center mt-4">
                <img src="/assets/paystack.png" alt="Paystack" className="h-6 mr-2" />
                <span className="text-xs text-gray-300">Powered by Paystack</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
