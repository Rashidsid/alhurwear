"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import { motion } from "framer-motion";

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AccountDashboard() {
  const { user, logout, isAuthenticated } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `/api/orders/customer?email=${user?.email}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchOrders();
    }
  }, [user, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Alhur<span className="text-blue-600">wear</span>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-white rounded-lg p-6 sticky top-4">
              {/* User Info */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-slate-600 mb-1">Welcome back!</p>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setTab("orders")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    tab === "orders"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  📦 My Orders
                </button>
                <button
                  onClick={() => setTab("profile")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    tab === "profile"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  👤 My Profile
                </button>
                <button
                  onClick={() => setTab("addresses")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    tab === "addresses"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  📍 Addresses
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    tab === "settings"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  ⚙️ Settings
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            {/* Orders Tab */}
            {tab === "orders" && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>

                {loading ? (
                  <p className="text-slate-600">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">You haven&apos;t placed any orders yet</p>
                    <Link
                      href="/"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{order.order_number}</h3>
                            <p className="text-sm text-slate-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-slate-600">
                            Total: <span className="font-bold">${order.total_amount.toFixed(2)}</span>
                          </p>
                          <Link
                            href={`/order-confirmation?orderId=${order.id}`}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {tab === "profile" && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">My Profile</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      disabled
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Account Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                        <p className="text-sm text-slate-600">Total Orders</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ${orders
                            .reduce((sum, o) => sum + o.total_amount, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-600">Total Spent</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {orders.filter((o) => o.status === "delivered").length}
                        </p>
                        <p className="text-sm text-slate-600">Delivered</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

             {/* Addresses Tab */}
            {tab === "addresses" && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Saved Addresses</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    + Add Address
                  </button>
                </div>

                <div className="text-center py-12 text-slate-600">
                  <p>No addresses saved yet</p>
                  <p className="text-sm mt-2">Addresses will appear here after placing an order</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {tab === "settings" && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>

                <div className="space-y-6">
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold mb-3">Email Notifications</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Order updates</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer mt-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Promotional emails</span>
                    </label>
                  </div>

                  <div className="pb-6 border-b">
                    <h3 className="font-semibold mb-3">Privacy</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Allow product recommendations</span>
                    </label>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Danger Zone</h3>
                    <button className="text-red-600 hover:underline font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
