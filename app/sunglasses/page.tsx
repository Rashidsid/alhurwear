"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const products = [
  { id: 1, name: "Classic Aviator Sunglasses", price: "NPR 129.99", image: "/products/sunglasses/1.jpg" },
  { id: 2, name: "Retro Round Sunglasses", price: "NPR 99.99", image: "/products/sunglasses/2.jpg" },
  { id: 3, name: "Sport Performance Sunglasses", price: "NPR 159.99", image: "/products/sunglasses/3.jpg" },
  { id: 4, name: "Luxury Designer Sunglasses", price: "NPR 299.99", image: "/products/sunglasses/4.jpg" },
];

export default function Sunglasses() {
  const { setIsOpen, cart } = useCart();
  return (
    <div className="min-h-screen bg-white text-slate-900 px-4 py-6 max-w-6xl mx-auto">

      {/* Navbar */}
      <header className="flex items-center justify-between mb-6">
        <Link href="/" className="text-2xl font-bold">
          Alhur<span className="text-blue-600">wear</span>
        </Link>
        <div className="flex gap-4 text-xl">
          <button 
            onClick={() => setIsOpen(true)}
            className="cursor-pointer hover:opacity-70 transition relative"
          >
            🛒
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <h1 className="text-3xl font-bold">Sunglasses</h1>
      <p className="text-lg text-slate-600 mt-1">Browse our premium range of UV-protected sunglasses</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {products.map((p, i) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl p-2 border shadow hover:shadow-lg cursor-pointer overflow-hidden"
            >
              <Image
                src={p.image}
                width={300}
                height={300}
                alt={p.name}
                className="rounded-lg object-cover h-40 w-full"
              />
              <h3 className="mt-2 font-medium">{p.name}</h3>
              <p className="text-blue-600 font-semibold mt-1">{p.price}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
