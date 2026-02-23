"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold">
            Alhur<span className="text-blue-600">wear</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-8">
          <Link href="/admin/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            📊 Dashboard
          </Link>
          <Link href="/admin/products" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            📦 Products
          </Link>
          <Link href="/admin/orders" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            📋 Orders
          </Link>
          <Link href="/admin/promo-codes" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            🏷️ Promo Codes
          </Link>
          <Link href="/admin/customers" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            👥 Customers
          </Link>
          <Link href="/admin/settings" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-l-4 border-transparent hover:border-blue-600">
            ⚙️ Settings
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Admin User</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
