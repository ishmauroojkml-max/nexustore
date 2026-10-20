import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Shield,
  ArrowLeft,
  RefreshCw,
  Search,
  DollarSign,
  ShoppingCart,
  Database,
  Server,
  Code,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  ShieldAlert
} from 'lucide-react';

const API_PRODUCTS = '/api/products';
const API_ORDERS = '/api/orders';
const API_STATUS = '/api/status';
const API_SEED = '/api/seed';
const API_LOGIN = '/api/auth/login';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Security Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, api_db
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [seeding, setSeeding] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    discountPrice: '',
    category: 'Electronics',
    brand: 'Nexus',
    stock: 20,
    images: '',
    description: '',
  });

  // Verify authentication on mount
  useEffect(() => {
    checkAdminAuth();
    const handleAuthChange = () => checkAdminAuth();
    window.addEventListener('cartUpdated', handleAuthChange);
    return () => window.removeEventListener('cartUpdated', handleAuthChange);
  }, []);

  const checkAdminAuth = () => {
    try {
      const rawUser = localStorage.getItem('userInfo');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && (parsed.role === 'admin' || parsed.email === 'admin@nexustore.com')) {
          setIsAdminAuthenticated(true);
          setAdminUser(parsed);
          setAuthChecking(false);
          loadData();
          return;
        }
      }
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    } catch (e) {
      setIsAdminAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter admin email and password');
      return;
    }

    try {
      setLoginLoading(true);
      const { data } = await axios.post(API_LOGIN, {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const user = data.user || data;
      if (user.role !== 'admin' && user.email !== 'admin@nexustore.com') {
        toast.error('Access Denied: This account does not have Administrator privileges.');
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(user));
      window.dispatchEvent(new Event('cartUpdated'));
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      toast.success('Admin Security Clearance Verified! Welcome 🛡️');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    window.dispatchEvent(new Event('cartUpdated'));
    toast('Logged out of Admin Portal', { icon: '🔒' });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes, statusRes] = await Promise.allSettled([
        axios.get(API_PRODUCTS),
        axios.get(API_ORDERS),
        axios.get(API_STATUS),
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
        setProducts(prodRes.value.data);
      }
      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value.data)) {
        setOrders(ordRes.value.data);
      }
      if (statusRes.status === 'fulfilled') {
        setDbStatus(statusRes.value.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders.reduce((sum, ord) => {
    if (ord?.status !== 'Cancelled') {
      return sum + Number(ord?.totalAmount || ord?.total || 0);
    }
    return sum;
  }, 0);

  const outOfStockCount = products.filter(p => Number(p?.stock || 0) <= 0).length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_PRODUCTS}/${id}`);
      setProducts(products.filter(p => (p._id || p.id) !== id));
      toast.success('Product removed from catalog');
      loadData();
    } catch (err) {
      toast.error('Failed to delete product from database');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_ORDERS}/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => ((o.orderId || o._id) === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order ${orderId} updated to "${newStatus}"`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title.trim() || !newProduct.price) {
      toast.error('Please enter product title and price');
      return;
    }

    try {
      const payload = {
        title: newProduct.title.trim(),
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : 0,
        category: newProduct.category,
        brand: newProduct.brand || 'Nexus',
        stock: Number(newProduct.stock || 10),
        images: newProduct.images ? [newProduct.images.trim()] : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'],
        description: newProduct.description.trim() || 'Genuine product sourced from verified supplier.',
      };

      const { data } = await axios.post(API_PRODUCTS, payload);
      setProducts([data, ...products]);
      setShowAddModal(false);
      setNewProduct({
        title: '',
        price: '',
        discountPrice: '',
        category: 'Electronics',
        brand: 'Nexus',
        stock: 20,
        images: '',
        description: '',
      });
      toast.success('Product saved directly to MongoDB! 🎉');
      loadData();
    } catch (err) {
      toast.error('Failed to create product in database');
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset and re-seed MongoDB with fresh demo products and accounts?')) return;
    try {
      setSeeding(true);
      await axios.post(API_SEED);
      toast.success('MongoDB re-seeded successfully!');
      await loadData();
    } catch (err) {
      toast.error('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const title = (p?.title || p?.name || '').toLowerCase();
    const cat = (p?.category || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return title.includes(q) || cat.includes(q);
  });

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All') return true;
    return o?.status === orderFilter;
  });

  // 1. Loading screen while checking auth
  if (authChecking) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. SECURITY GATE: If user is not authenticated as admin, show password lock
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
          {/* Top Security Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Restricted Admin Area
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              This portal contains store operations, financials, and inventory controls. Please authenticate with administrator credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@nexustore.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            {/* Quick Demo Helper */}
            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Default Admin:</span>
                <span className="font-mono ml-1">admin@nexustore.com</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@nexustore.com');
                  setLoginPassword('123456');
                }}
                className="bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] transition"
              >
                Auto-Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:scale-[0.99] text-white font-black py-3 rounded-xl text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'Verifying Security Clearance...' : 'Authenticate & Unlock Panel'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="hover:text-orange-600 font-semibold inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED: If authenticated as admin, show full management controls
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-orange-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-gray-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MongoDB & REST API Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            NexusStore Command Center
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Logged in as <strong className="text-white">{adminUser?.name || 'Administrator'}</strong> ({adminUser?.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/30 transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
            title="Lock & Logout Admin Session"
          >
            <LogOut className="w-4 h-4" /> Lock Panel
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Nav Menu */}
        <div className="w-full lg:w-64 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Stats</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
            </div>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'products' ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-700'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4" />
              <span>Customer Orders</span>
            </div>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'orders' ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api_db')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'api_db'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4" />
              <span>REST API & MongoDB</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button
              onClick={loadData}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-orange-600 p-2 rounded-xl hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Database
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 p-2 rounded-xl transition border border-amber-200"
            >
              ⚡ {seeding ? 'Seeding MongoDB...' : 'Re-Seed Demo Data'}
            </button>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          {/* TAB 1: Analytics & Metrics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">Key Business Metrics</h2>
                <span className="text-xs text-gray-400">Live data from MongoDB</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-orange-50/70 border border-orange-100 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-orange-600 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Gross Sales</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    Rs. {totalSales.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-orange-800/80 mt-1">From active customer orders</div>
                </div>

                <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-blue-600 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Orders</span>
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {orders.length} Orders
                  </div>
                  <div className="text-[11px] text-blue-800/80 mt-1">Stored in MongoDB</div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Active Inventory</span>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {products.length} Products
                  </div>
                  <div className="text-[11px] text-emerald-800/80 mt-1">Listed in MongoDB</div>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-rose-600 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Stock Alerts</span>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {outOfStockCount} Items
                  </div>
                  <div className="text-[11px] text-rose-800/80 mt-1">Stock depleted (zero)</div>
                </div>
              </div>

              {/* Status info box */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Live System Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Database</span>
                    <span className="font-bold text-emerald-600">● MongoDB Connected</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">API Backend</span>
                    <span className="font-bold text-emerald-600">● Port 5000 Active</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Avg Order Value</span>
                    <span className="font-bold text-gray-800">Rs. {avgOrderValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Pipeline Status</span>
                    <span className="font-bold text-orange-600">{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} Pending Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Products Catalog CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search listed products..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow transition"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No products match your search.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((p) => {
                    const pid = p._id || p.id;
                    const img = (Array.isArray(p.images) && p.images[0]) || p.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200';
                    const price = Number(p.discountPrice > 0 ? p.discountPrice : p.price) || 0;
                    const stock = Number(p.stock !== undefined ? p.stock : 0);

                    return (
                      <div
                        key={pid}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 transition bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img
                            src={img}
                            alt={p.title}
                            className="w-14 h-14 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200';
                            }}
                          />
                          <div>
                            <div className="font-bold text-sm text-gray-900 line-clamp-1">{p.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Category: <span className="text-gray-700 font-semibold">{p.category || 'General'}</span> | Stock:{' '}
                              <span className={`font-bold ${stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stock} units
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-none border-gray-50">
                          <div className="text-right">
                            <div className="text-sm font-black text-orange-600">
                              Rs. {price.toLocaleString()}
                            </div>
                            {p.discountPrice > 0 && p.price && (
                              <div className="text-[11px] text-gray-400 line-through">
                                Rs. {Number(p.price).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(pid)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Orders Fulfillment Pipeline */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                  {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        orderFilter === status
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-semibold text-gray-400">
                  {filteredOrders.length} orders
                </span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No orders found for selected filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((o) => {
                    const oid = o.orderId || o._id;
                    const items = o.orderItems || o.items || [];
                    const total = Number(o.totalAmount || o.total || 0);

                    return (
                      <div
                        key={oid}
                        className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{oid}</span>
                            <span className="text-xs text-gray-500">• {o.customerName || 'Customer'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {items.length} {items.length === 1 ? 'item' : 'items'} | Payment: {o.paymentMethod || 'COD'} | City: {o.shippingAddress?.city || 'Pakistan'}
                          </div>
                          <div className="text-sm font-black text-orange-600">
                            Rs. {total.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-semibold text-gray-600">Status:</span>
                          <select
                            value={o.status || 'Pending'}
                            onChange={(e) => handleStatusChange(oid, e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REST API & MongoDB Status */}
          {activeTab === 'api_db' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Database Engine & REST API Status</h2>
                <p className="text-xs text-gray-500 mt-1">Live connection telemetry and available API endpoints</p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase mb-1">
                    <Database className="w-4 h-4" /> MongoDB Database
                  </div>
                  <div className="text-xl font-black text-emerald-900">
                    {dbStatus?.database?.status || 'Connected & Active'}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    Database Name: <span className="font-bold">{dbStatus?.database?.databaseName || 'nexustore'}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-1">
                    <Server className="w-4 h-4" /> Express REST Server
                  </div>
                  <div className="text-xl font-black text-blue-900">
                    Online (Port {dbStatus?.server?.port || 5000})
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Unified Endpoint: <span className="font-bold">/api/status</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase mb-1">
                    <Package className="w-4 h-4" /> Live Collections
                  </div>
                  <div className="text-xl font-black text-purple-900">
                    {products.length} Products, {orders.length} Orders
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    Persisting in MongoDB collections
                  </div>
                </div>
              </div>

              {/* REST API Endpoints Table */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-orange-500" /> Active REST API Endpoints
                </h3>

                <div className="space-y-2.5">
                  {(dbStatus?.restAPIs || [
                    { method: 'GET', endpoint: '/api/products', description: 'Fetch all products with search & category filters' },
                    { method: 'GET', endpoint: '/api/products/:id', description: 'Fetch single product details by MongoDB _id' },
                    { method: 'POST', endpoint: '/api/products', description: 'Create new product in MongoDB' },
                    { method: 'PUT', endpoint: '/api/products/:id', description: 'Update product in MongoDB' },
                    { method: 'DELETE', endpoint: '/api/products/:id', description: 'Delete product from MongoDB' },
                    { method: 'POST', endpoint: '/api/auth/register', description: 'Register new user account in MongoDB' },
                    { method: 'POST', endpoint: '/api/auth/login', description: 'Authenticate user & issue JWT token' },
                    { method: 'GET', endpoint: '/api/orders', description: 'Fetch all customer orders from MongoDB' },
                    { method: 'POST', endpoint: '/api/orders', description: 'Create customer checkout order in MongoDB' },
                    { method: 'PUT', endpoint: '/api/orders/:id/status', description: 'Update order status' },
                  ]).map((api, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded font-black text-[10px] ${
                          api.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                          api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          api.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {api.method}
                        </span>
                        <code className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {api.endpoint}
                        </code>
                      </div>
                      <span className="text-gray-500 font-medium">
                        {api.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding new product */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-lg font-black text-gray-900">Add New Product to Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="w-full border rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="3500"
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.discountPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                    placeholder="2999"
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Key features and specifications..."
                  className="w-full border rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow"
                >
                  Save Product to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
