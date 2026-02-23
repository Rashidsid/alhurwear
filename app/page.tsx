"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useCart } from "./context/CartContext";
import { useUser } from "./context/UserContext";


const heroImage = "/assets/hero.jpg";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  description: string;
  stock: number;
  images: string[];
}

export default function Home() {
  const { setIsOpen, cart, addToCart } = useCart();
  const { user, isAuthenticated, logout } = useUser();
  const categoriesRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(p => p.category))].sort();

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    return true;
  });

  const handleShopNow = () => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Alhur<span className="text-blue-600">wear</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-blue-600 transition">Home</Link>
            {categories.length > 0 && (
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium px-3 py-1 border border-slate-200 rounded hover:border-blue-600 transition cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
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

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/account"
                  className="text-sm font-medium px-3 py-1 rounded hover:bg-slate-100 transition"
                >
                  👤 {user?.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium px-3 py-1 rounded hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-2xl"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-slate-100 py-4 px-4"
          >
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block text-sm font-medium text-slate-900 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {categories.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Categories</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setMobileMenuOpen(false);
                        categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                        selectedCategory === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setMobileMenuOpen(false);
                          categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`block w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          <motion.img
            src={heroImage}
            alt="Hero"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />

          <div className="relative h-full flex flex-col justify-center pl-8 md:pl-16 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight">
                Community<br />Driven<br />Culture
              </h1>
              <p className="text-gray-200 text-lg max-w-md">
                More than just a brand. We&apos;re a movement connecting creatives, creators, and trendsetters who define the streets.
              </p>
              <motion.button
                onClick={handleShopNow}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Shop Now
                <span>→</span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Featured Collections Carousel */}
        <section className="bg-black text-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 md:gap-8 min-w-max md:min-w-full md:flex-wrap">
                {[
                  { number: "01", title: "Limited Drops", subtitle: "Maximum Impact" },
                  { number: "02", title: "Built for", subtitle: "the Streets" },
                  { number: "03", title: "Art Meets", subtitle: "Attitude" },
                  { number: "04", title: "Future-ready", subtitle: "Fashion" },
                  { number: "05", title: "Community", subtitle: "Driven Culture" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="shrink-0 w-40 md:w-48 group cursor-pointer"
                  >
                    <div className="mb-4">
                      <p className="text-5xl md:text-6xl font-black text-gray-600 group-hover:text-white transition">
                        {item.number}
                      </p>
                    </div>
                    <div className="border-t border-gray-700 pt-4 group-hover:border-white transition">
                      <p className="text-sm text-gray-400 group-hover:text-white transition font-medium">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-600 group-hover:text-gray-300 transition">
                        {item.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section ref={categoriesRef} className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-2">Featured Products</h2>
            <p className="text-lg text-slate-600">Explore our curated collections</p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-slate-700">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full transition font-medium ${
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full transition font-medium ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            {/* Badge Filter - Removed as these fields don't exist in database */}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-slate-600">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group rounded-lg overflow-hidden border border-slate-200 hover:shadow-lg transition"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-slate-100 h-64">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}

                    {/* Badges - Removed as these fields don't exist in database */}
                    <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
                      {/* Product badges would go here */}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-1">{product.category}</p>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart({
                          id: typeof product.id === 'string' ? parseInt(product.id) : product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0] || "/assets/placeholder.jpg",
                          quantity: 1
                        })}
                        disabled={product.stock === 0}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <p className="text-slate-600 text-lg">No products found in this category.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-white text-xl font-bold mb-2">
              Alhur<span className="text-blue-600">wear</span>
            </h3>
            <p className="text-sm">Your destination for premium fashion and eyewear</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sunglasses" className="hover:text-white transition">
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link href="/clothes" className="hover:text-white transition">
                  Clothes
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.facebook.com/share/1N1KknYqyK/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/alhurwear?igsh=MW5obWt6b3hqNmNndQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@alhur.wear?_r=1&_t=ZS-91dmM26h9hn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/message/KP7CSZCLIL47M1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 Alhurwear. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
