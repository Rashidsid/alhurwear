"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export default function Clothes() {
  const { setIsOpen, cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?category=clothes");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 px-4 py-6 max-w-6xl mx-auto">

      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Alhur<span className="text-blue-600">wear</span>
          </Link>

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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-slate-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-slate-600">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {products.map((p, i) => (
            <Link key={p.id} href={`/product/${p.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl p-2 border shadow hover:shadow-lg cursor-pointer overflow-hidden h-full flex flex-col"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-sm font-medium">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="mt-2 font-medium text-sm line-clamp-2">{p.name}</h3>
                <p className="text-blue-600 font-semibold mt-1">NPR {p.price.toFixed(2)}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
