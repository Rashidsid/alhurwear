"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  email: string;
  phone: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError("Failed to load order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchOrder();
  }, [orderId, router, fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      setOrder({ ...order, status: newStatus });
      alert("Order status updated successfully");
    } catch (error) {
      alert("Error updating order status");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        setUpdating(true);
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to cancel order");

        alert("Order cancelled successfully");
        router.push("/admin/orders");
      } catch (error) {
        alert("Error cancelling order");
        console.error(error);
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-10">Loading order...</div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          {error || "Order not found"}
        </div>
      </AdminLayout>
    );
  }

  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">Order details and management</p>
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-medium">{order.shipping_address || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className={`px-4 py-2 rounded-lg text-center font-semibold ${
                  order.status === "Delivered" ? "bg-green-100 text-green-700" :
                  order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                  order.status === "Processing" ? "bg-purple-100 text-purple-700" :
                  order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {order.status}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Update Status</p>
                <select
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating || order.status === "Cancelled"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  defaultValue={order.status}
                >
                  <option value="">Select new status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{item.product_name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">NPR {item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">
                      NPR {(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-64 space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">NPR {order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping:</span>
                <span className="font-medium">NPR 0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span>NPR {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleCancelOrder}
            disabled={updating || order.status === "Cancelled"}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {updating ? "Updating..." : "Cancel Order"}
          </button>
          <Link
            href="/admin/orders"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
