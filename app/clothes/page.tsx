"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const clothes = [
  { id: 101, name: "Premium Cotton T-Shirt", price: "NPR 49.99", image: "/products/clothes/1.jpg" },
  { id: 102, name: "Designer Denim Jacket", price: "NPR 189.99", image: "/products/clothes/2.jpg" },
  { id: 103, name: "Black Angora Wool Sweatshirt", price: "NPR 2500", image: "/products/clothes/3.jpg" },
  { id: 104, name: "Slim Fit Chinos", price: "NPR 89.99", image: "/products/clothes/4.jpg" },
];

export default function Clothes() {
  const { setIsOpen, cart } = useCart();

  return (
    <div className="min-h-screen bg-white text-slate-900 px-4 py-6 max-w-6xl mx-auto">

      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <motion.div className="text-2xl font-bold tracking-tight">
            Alhur<span className="text-blue-600">wear</span>
          </motion.div>

          <motion.div className="flex items-center gap-4 text-xl">
            <button
              aria-label="Cart"
              onClick={() => setIsOpen(true)}
              className="rounded-full border border-slate-200 p-2 hover:bg-slate-100 transition relative"
            >
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </header>

      <h1 className="text-3xl font-bold mt-4">Clothes</h1>
      <p className="text-lg text-slate-600 mt-1">
        Browse our collection of premium clothes
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {clothes.map((p, i) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl p-2 border shadow hover:shadow-lg cursor-pointer overflow-hidden"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={300}
                height={300}
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
