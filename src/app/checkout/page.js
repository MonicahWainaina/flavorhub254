'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [status, setStatus] = useState('');
  const [accountRef, setAccountRef] = useState(null);

  // Redirect guests to login page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Block premium users from accessing checkout
    if (!loading && user?.isPremium) {
      router.push('/premium');
    }
  }, [user, loading, router]);

  function normalizePhone(input) {
    let phone = input.trim();
    // Accept 07xxxxxxxx or 01xxxxxxxx
    if (/^(07|01)\d{8}$/.test(phone)) {
      phone = '254' + phone.slice(1);
    }
    // Accept 2547xxxxxxxx or 2541xxxxxxxx
    if (/^254[17]\d{8}$/.test(phone)) {
      return phone;
    }
    return null; // Invalid format
  }

  const handleMpesaPay = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setStatus('Please enter a valid phone number');
      return;
    }
    if (!user?.uid || !user?.email) {
      setStatus('Please ensure you are logged in.');
      return;
    }
    setStatus('Processing M-Pesa payment...');
    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: 1,
          uid: user.uid,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Check your phone and complete the payment...');
        setAccountRef(data.accountRef); // Save for polling
        pollPaymentStatus(data.accountRef);
      } else {
        setStatus(data.message || 'Payment initiation failed.');
      }
    } catch (err) {
      setStatus('Error initiating payment.');
    }
  };

  const pollPaymentStatus = async (accountRef) => {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const res = await fetch(`/api/mpesa/status?accountRef=${accountRef}`);
      const data = await res.json();
      if (data.resultCode === 0) {
        setStatus('Payment successful! You are now premium.');
        setPhone('');
        if (refreshUser) await refreshUser(); // Refresh user data
        router.push('/premium'); // Redirect to premium page
        return;
      }
      // Show specific error messages for known result codes
      if (data.resultCode === 1032) {
        setStatus('Payment cancelled.');
        return;
      }
      if (data.resultCode === 1037) {
        setStatus('Payment timed out..');
        return;
      }
      if (data.resultCode && data.resultDesc) {
        setStatus(`Payment failed: ${data.resultDesc}`);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
      attempts++;
    }
    setStatus('Payment not completed. Please try again.');
  };


  if (loading || !user) {
    // Show nothing or a spinner while loading or redirecting
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
                className={`flex items-center justify-center w-full min-w-0 px-2 py-2 rounded-lg font-bold border-2 transition
                  ${
                    method === 'mpesa'
                      ? 'bg-[#43b02a] text-white border-[#43b02a] shadow-lg'
                      : 'bg-white text-[#43b02a] border-[#43b02a] hover:bg-[#43b02a]/90 hover:text-white'
                  }
                `}
                style={{ fontSize: '1rem', letterSpacing: '0.03em', maxWidth: '200px' }}
                onClick={() => setMethod('mpesa')}
                aria-label="Pay with M-Pesa"
              >
                <span className="flex items-center whitespace-nowrap text-center">
                  <span className="font-bold" style={{ marginRight: '-8px' }}>M</span>
                  <img src="/assets/mpesa-icon.png" alt="M-Pesa" className="w-8 h-8" style={{ marginLeft: '-1px', marginRight: '-1px' }} />
                  <span className="font-bold" style={{ marginLeft: '-8px' }}>PESA</span>
                </span>
              </button>
              {/* Credit/Debit Card Button */}
              <button
                className={`flex flex-row items-center justify-center w-full min-w-0 px-2 py-2 rounded-lg font-bold border-2 transition
                  ${
                    method === 'card'
                      ? 'bg-[#635bff] text-white border-[#635bff] shadow-lg'
                      : 'bg-[#e6edff] text-[#635bff] border-[#635bff] hover:bg-[#b3c6ff] hover:text-[#635bff]'
                  }
                `}
                style={{ fontSize: '1rem', letterSpacing: '0.03em', maxWidth: '200px' }}
                onClick={() => setMethod('card')}
                aria-label="Pay with Credit or Debit Card"
              >
                <span className="flex items-center mr-2">
                  <img src="/assets/stripe.png" alt="Visa" className="w-8 h-8 mr-1" />
                </span>
                <span className="text-center leading-tight break-words text-sm">
                  Credit/Debit<br />Card
                </span>
              </button>
            </div>
            {method === 'mpesa' ? (
              <div className="flex flex-col gap-4">
                <label className="text-white font-semibold flex items-center gap-1">
                  <span className="font-bold">M</span>
                  <img
                    src="/assets/mpesa-icon.png"
                    alt="M-Pesa"
                    className="w-6 h-6 mx-0"
                    style={{ marginLeft: '-8px', marginRight: '-8px' }}
                  />
                  <span className="font-bold">PESA Phone Number</span>
                </label>
                <input
                  type="tel"
                  className="px-4 py-2 rounded-lg border border-gray-400 bg-gray-900 text-white"
                  placeholder="e.g. 2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="bg-[#43b02a] hover:bg-[#388e1c] text-white px-5 py-2 rounded-lg font-bold text-base mt-2 transition flex items-center justify-center gap-2"
                  onClick={handleMpesaPay}
                  disabled={loading}
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <span className="font-bold">Pay with M</span>
                      <img
                        src="/assets/mpesa-icon.png"
                        alt="M-Pesa"
                        className="w-6 h-6 mx-0"
                        style={{ marginLeft: '-11px', marginRight: '-11px' }}
                      />
                      <span className="font-bold">PESA</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <label className="text-white font-semibold">Card Details</label>
                <input
                  type="text"
                  className="px-4 py-2 rounded-lg border border-gray-400 bg-gray-900 text-white"
                  placeholder="Card number"
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="bg-[#635bff] hover:bg-[#7d73ff] text-white px-5 py-2 rounded-lg font-bold text-base mt-2 transition"
                  onClick={handleCardPay}
                  disabled={loading || !card}
                >
                  {loading ? 'Processing...' : 'Pay with Bank Card'}
                </button>
              </div>
            )}
            {status && (
              <div className="text-center text-green-400 font-bold mt-4">
                {status}
              </div>
            )}
            <span className="text-sm text-white text-center mt-4">
              Only{' '}
              <span className="text-green-400 font-bold">KSh 250/month</span> (
              <span className="text-[#FFD700] font-bold">$1.99 USD/month</span>
              ). Cancel anytime.
            </span>
          </section>
        </main>
      </div>
    </div>
  );
}
