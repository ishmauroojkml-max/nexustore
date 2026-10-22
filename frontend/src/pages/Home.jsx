import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Loader';
import { Sparkles, ShieldCheck, Truck, Headphones, Search, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexustore-pearl.vercel.app';
const API_URL = `${API_BASE_URL}/api/products`;

const categories = [
  { name: 'All Products', icon: '🛍️' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home & Living', icon: '🏠' },
  { name: 'Accessories', icon: '⌚' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get(API_URL);
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Products load nahi ho sake. Backend server check karein.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts.filter((product) => {
    if (!product) return false;
    const title = product.title || product.name || '';
    const desc = product.description || '';
    const brand = product.brand || '';
    const q = (search || '').toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      brand.toLowerCase().includes(q);

    const productCategory = product.category || '';
    const matchesCategory =
      category === 'All Products' ||
      productCategory.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const priceA = Number(a?.discountPrice > 0 ? a.discountPrice : (a?.price || 0));
    const priceB = Number(b?.discountPrice > 0 ? b.discountPrice : (b?.price || 0));

    if (sortBy === 'lowest') return priceA - priceB;
    if (sortBy === 'highest') return priceB - priceA;
    if (sortBy === 'rating') return (Number(b?.ratings) || 0) - (Number(a?.ratings) || 0);
    return 0;
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-gray-900 to-orange-950 text-white shadow-xl">
        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Shopping Experience
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Discover Quality Products at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                NexusStore
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-lg leading-relaxed">
              Explore handpicked electronics, premium fashion, stylish accessories, and home living collections with cash on delivery across Pakistan.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#products-section"
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 transition hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/orders"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl backdrop-blur-sm border border-white/10 transition"
              >
                Track Orders
              </Link>
            </div>
          </div>

          {/* Right Highlights Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-2 hover:bg-white/15 transition">
              <div className="text-4xl mb-1">💻</div>
              <h3 className="font-extrabold text-white text-base">Electronics</h3>
              <p className="text-xs text-orange-200">Audio, Watches & Gear</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-2 hover:bg-white/15 transition">
              <div className="text-4xl mb-1">👟</div>
              <h3 className="font-extrabold text-white text-base">Fashion</h3>
              <p className="text-xs text-orange-200">Denim, Sneakers & More</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-2 hover:bg-white/15 transition">
              <div className="text-4xl mb-1">⌚</div>
              <h3 className="font-extrabold text-white text-base">Accessories</h3>
              <p className="text-xs text-orange-200">Luxury & Everyday</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center space-y-2 hover:bg-white/15 transition">
              <div className="text-4xl mb-1">🏠</div>
              <h3 className="font-extrabold text-white text-base">Home & Living</h3>
              <p className="text-xs text-orange-200">Modern & Minimalist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">Free Fast Shipping</h4>
            <p className="text-xs text-gray-500 mt-0.5">On all orders over Rs. 3,000</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">Cash on Delivery</h4>
            <p className="text-xs text-gray-500 mt-0.5">Pay safely upon parcel arrival</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">24/7 Customer Care</h4>
            <p className="text-xs text-gray-500 mt-0.5">Dedicated customer assistance</p>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Shop by Category</h2>
          <span className="text-xs text-gray-400 font-semibold">{filteredProducts.length} items shown</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((item) => (
            <button
              key={item.name}
              onClick={() => setCategory(item.name)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap shadow-sm ${
                category === item.name
                  ? 'bg-orange-500 text-white shadow-orange-500/25 scale-105'
                  : 'bg-white text-gray-700 hover:border-orange-300 border border-gray-200'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product List Section */}
      <section id="products-section" className="space-y-6">
        {/* Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in current products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="featured">Featured / Newest</option>
              <option value="lowest">Price: Low to High</option>
              <option value="highest">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <ProductSkeleton key={item} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="font-bold text-rose-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">No products match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Try adjusting your search terms or select "All Products" category.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All Products');
                setSearchParams({});
              }}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-600 transition shadow"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
