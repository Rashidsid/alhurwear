"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_hot_selling?: boolean;
  is_new_arrival?: boolean;
  is_top_viewed?: boolean;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        setError("Failed to load products");
        setProducts([]);
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products");
      setProducts([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          alert("Product deleted successfully");
        } else {
          alert("Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const toggleBadge = async (productId: number, badgeType: 'hot_selling' | 'new_arrival' | 'top_viewed') => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const currentValue = product[`is_${badgeType}` as keyof Product];
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          [`is_${badgeType}`]: !currentValue
        })
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, [`is_${badgeType}`]: !currentValue }
            : p
        ));
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your inventory ({products.length} products)</p>
          </div>
          <Link href="/admin/products/add" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            + Add Product
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Badges</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">NPR {product.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{product.stock}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleBadge(product.id, 'hot_selling')}
                          className={`px-2 py-1 text-xs rounded font-semibold transition ${
                            product.is_hot_selling
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title="Toggle Hot Selling"
                        >
                          🔥 Hot
                        </button>
                        <button
                          onClick={() => toggleBadge(product.id, 'new_arrival')}
                          className={`px-2 py-1 text-xs rounded font-semibold transition ${
                            product.is_new_arrival
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title="Toggle New Arrival"
                        >
                          ✨ New
                        </button>
                        <button
                          onClick={() => toggleBadge(product.id, 'top_viewed')}
                          className={`px-2 py-1 text-xs rounded font-semibold transition ${
                            product.is_top_viewed
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title="Toggle Top Viewed"
                        >
                          ⭐ Top
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-800">
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
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
