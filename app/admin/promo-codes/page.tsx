"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface PromoCode {
  id: number;
  code: string;
  discount_value: number;
  discount_type: string;
  usage_count: number;
  usage_limit: number;
  status: string;
  expiry_date: string;
  min_order_amount?: number;
  description?: string;
}

export default function AdminPromoCodes() {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchPromoCodes();
  }, [router]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/promo-codes");
      if (!response.ok) {
        setError("Failed to load promo codes");
        setPromoCodes([]);
        return;
      }
      const data = await response.json();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load promo codes");
      setPromoCodes([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      try {
        const response = await fetch(`/api/promo-codes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setPromoCodes(promoCodes.filter(p => p.id !== id));
          alert("Promo code deleted successfully");
        } else {
          alert("Failed to delete promo code");
        }
      } catch (error) {
        console.error("Error deleting promo code:", error);
        alert("Error deleting promo code");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Promo Codes</h1>
            <p className="text-gray-600 mt-1">Manage discount codes and promotions (4 codes)</p>
          </div>
          <Link href="/admin/promo-codes/create" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            + Create Promo Code
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Total Codes</p>
            <p className="text-3xl font-bold mt-2">{promoCodes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Active Codes</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{promoCodes.filter(p => p.status === "Active").length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Total Usage</p>
            <p className="text-3xl font-bold mt-2">{promoCodes.reduce((sum, p) => sum + (p.usage_count || 0), 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Expired Codes</p>
            <p className="text-3xl font-bold mt-2 text-red-600">{promoCodes.filter(p => p.status === "Expired").length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading promo codes...</div>
        ) : (
          /* Promo Codes Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Min Purchase</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiry</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{code.code}</p>
                      <p className="text-sm text-gray-600">{code.discount_type === 'percentage' ? 'Percentage' : 'Fixed amount'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">
                        {code.discount_type === 'percentage' ? `${code.discount_value}%` : `NPR ${code.discount_value}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">NPR {code.min_order_amount || "No limit"}</td>
                    <td className="px-6 py-4">
                      <p>{code.usage_count || 0} / {code.usage_limit || "Unlimited"}</p>
                    </td>
                    <td className="px-6 py-4">{code.expiry_date ? new Date(code.expiry_date).toLocaleDateString() : "No expiry"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        code.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">✏️</button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
