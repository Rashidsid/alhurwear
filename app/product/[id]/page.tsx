"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";

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

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }

        // Fetch related products
        const relatedResponse = await fetch(
          `/api/products?category=${data.category}&limit=4`
        );
        const related = await relatedResponse.json();
        setRelatedProducts(related.filter((p: Product) => p.id !== data.id));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Product not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: typeof product.id === 'string' ? parseInt(product.id) : product.id,
      name: product.name,
      price: product.price,
      image: mainImage || "/assets/placeholder.jpg",
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${product.category}`} className="hover:text-slate-900">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative bg-slate-100 rounded-lg overflow-hidden h-96">
              <Image
                src={mainImage || "/assets/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 rounded border-2 overflow-hidden ${
                      mainImage === img
                        ? "border-blue-600"
                        : "border-slate-200"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Badges - Removed as these fields don't exist in database */}
            <div className="flex flex-wrap gap-2">
              {/* Product badges would go here */}
            </div>

            {/* Title & Price */}
            <div>
              <p className="text-sm text-slate-500 mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  product.stock > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            <p className="text-slate-600">{product.description}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Color: <span className="text-blue-600">{selectedColor}</span>
              </label>
              <div className="flex gap-3">
                {["Black", "White", "Blue", "Red", "Gray"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === c
                        ? "border-blue-600"
                        : "border-slate-200"
                    }`}
                    style={{
                      backgroundColor: c.toLowerCase() === "black" ? "#000" : 
                                      c.toLowerCase() === "white" ? "#fff" :
                                      c.toLowerCase() === "blue" ? "#3b82f6" :
                                      c.toLowerCase() === "red" ? "#ef4444" :
                                      c.toLowerCase() === "gray" ? "#9ca3af" : "#000"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Size: <span className="text-blue-600">{selectedSize}</span>
              </label>
              <div className="flex gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded font-medium transition ${
                      selectedSize === size
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-slate-200 rounded hover:bg-slate-100"
                >
                  −
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-slate-200 rounded hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed text-lg"
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>

            <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              ❤️ Add to Wishlist
            </button>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">SKU:</span>
                <span className="font-medium">ALH-{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Category:</span>
                <span className="font-medium capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping:</span>
                <span className="font-medium">Free worldwide shipping</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Description Section */}
        <div className="border-t pt-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">About this product</h3>
              <p className="text-slate-600">{product.description}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Size Guide</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Chest (in)</th>
                    <th className="text-left py-2">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "XS", chest: "32-34", length: "26-27" },
                    { size: "S", chest: "34-36", length: "27-28" },
                    { size: "M", chest: "38-40", length: "28-29" },
                    { size: "L", chest: "42-44", length: "29-30" },
                    { size: "XL", chest: "46-48", length: "30-31" },
                    { size: "XXL", chest: "50-52", length: "31-32" },
                  ].map((row) => (
                    <tr key={row.size} className="border-b">
                      <td className="py-2">{row.size}</td>
                      <td className="py-2">{row.chest}</td>
                      <td className="py-2">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group rounded-lg overflow-hidden border border-slate-200 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative bg-slate-100 h-64">
                      <Image
                        src={p.images?.[0] || "/assets/placeholder.jpg"}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-500 mb-1">{p.category}</p>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                        {p.name}
                      </h3>
                      <p className="text-lg font-bold text-slate-900">
                        ${p.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

