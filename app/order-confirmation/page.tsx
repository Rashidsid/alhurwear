"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  created_at: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/customer?id=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Alhur<span className="text-blue-600">wear</span>
          </Link>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">✓</span>
          </motion.div>

          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 text-lg mb-8">
            Thank you for your purchase
          </p>

          {order ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-50 rounded-lg p-6 mb-8 text-left"
            >
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-blue-600">
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Order Date</p>
                  <p className="text-lg font-bold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Shipping To</p>
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-sm text-slate-600">{order.shipping_address}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="font-semibold">{order.customer_email}</p>
                </div>

                <div className="flex justify-between border-t pt-4">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Status:</strong> {order.status === "pending" ? "Pending Processing" : order.status}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You will receive a confirmation email shortly
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-6 mb-8 text-center">
              <p className="text-slate-600">Order details not found</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
            >
              View My Orders
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t space-y-4 text-left">
            <h3 className="font-semibold text-lg">What&apos;s Next?</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <span className="text-xl">📧</span>
                <p>A confirmation email has been sent to your email address</p>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🚚</span>
                <p>Your order will be processed within 24-48 hours</p>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">📱</span>
                <p>Track your order status in your account dashboard</p>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">❓</span>
                <p>For questions, contact our support team</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
