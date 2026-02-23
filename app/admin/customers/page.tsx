"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
}

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchCustomers();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");
      if (!response.ok) {
        setError("Failed to load customers");
        setCustomers([]);
        return;
      }
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load customers");
      setCustomers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage and view customer information ({customers.length} customers)</p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Total Customers</p>
            <p className="text-3xl font-bold mt-2">{customers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Active Customers</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{customers.filter(c => c.total_orders > 0).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">NPR {customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Avg Order Value</p>
            <p className="text-3xl font-bold mt-2">NPR {customers.length > 0 ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(2) : "0.00"}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading customers...</div>
        ) : (
          /* Customers Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Orders</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Spent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{customer.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm">{customer.phone || "N/A"}</td>
                    <td className="px-6 py-4">{customer.total_orders}</td>
                    <td className="px-6 py-4 font-semibold">NPR {customer.total_spent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800">👁️ View</button>
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
