"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch products count
      const productsRes = await fetch("/api/products");
      const products = await productsRes.json();

      setStats({
        totalRevenue: 573.95,
        totalOrders: 2,
        totalProducts: products.length,
        totalCustomers: 2,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    void fetchStats();
  }, [router, fetchStats]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">NPR {stats.totalRevenue.toFixed(2)}</p>
                <p className="text-green-600 text-sm mt-1">📈 2 orders placed</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-2xl">💲</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-green-600 text-sm mt-1">📦 0 pending</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                <p className="text-gray-600 text-sm mt-1">340 items in stock</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCustomers}</p>
                <p className="text-green-600 text-sm mt-1">✅ 1 delivered</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link href="/admin/products" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <p className="text-lg font-semibold">Manage Products</p>
            <p className="text-gray-600 text-sm mt-1">Add, edit, or delete products</p>
          </Link>
          <Link href="/admin/orders" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <p className="text-lg font-semibold">View Orders</p>
            <p className="text-gray-600 text-sm mt-1">Track customer orders</p>
          </Link>
          <Link href="/admin/promo-codes" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <p className="text-lg font-semibold">Manage Promo Codes</p>
            <p className="text-gray-600 text-sm mt-1">Create discount codes</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
