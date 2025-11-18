import Link from "next/link";
import Image from "next/image";

export default function AdminHeader() {
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
        {/* Admin Navigation */}
        <nav className="flex gap-6">
          <Link href="/admin" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Dashboard</Link>
          <Link href="/admin/users" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Users</Link>
          <Link href="/admin/payments" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Payments</Link>
          <Link href="/admin/recipes" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Recipes</Link>
          <Link href="/admin/logs" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Logs</Link>
          <Link href="/admin/settings" className="capitalize hover:text-green-500 transition text-base text-gray-900 dark:text-white">Settings</Link>
        </nav>
      </div>
    </header>
  );
}