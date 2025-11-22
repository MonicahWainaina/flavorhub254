import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingFlavorBotButton from "@/components/FloatingFlavorBotButton";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "flavorHUB254",
  description: "Discover and share amazing recipes on flavorHUB254!",
  icons: {
    icon: "/favicon.png", // <-- Correct path for favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon for browsers and Google */}
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <EmailVerificationGuard>
            {children}
            <FloatingFlavorBotButton />
          </EmailVerificationGuard>
        </AuthProvider>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{
            fontFamily: "inherit",
            borderRadius: "10px",
            background: "#232323",
            color: "#fff",
            fontSize: "1rem",
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
