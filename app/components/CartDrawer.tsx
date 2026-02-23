"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQty, isOpen, setIsOpen } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Background overlay */}
      {isOpen && (
        <motion.div
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.35 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-5 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button onClick={() => setIsOpen(false)} className="text-2xl">×</button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cart.length === 0 && (
            <p className="text-center text-slate-500 mt-10">Your cart is empty</p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 border rounded-xl shadow-sm"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-blue-600 font-bold text-sm">${item.price.toFixed(2)}</p>

                {/* Quantity Control */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 border flex items-center justify-center rounded"
                  >
                    -
                  </button>

                  <span className="font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 border flex items-center justify-center rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 text-lg"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="flex justify-between text-lg font-semibold mt-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <Link
          href="/checkout"
          onClick={() => setIsOpen(false)}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mt-4 text-center block"
        >
          CHECKOUT
        </Link>

        {/* Continue Shopping */}
        <button
          onClick={() => setIsOpen(false)}
          className="mt-3 w-full text-center underline text-sm text-slate-600"
        >
          Continue Shopping
        </button>
      </motion.div>
    </>
  );
}
