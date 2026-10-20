import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importing Components & Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Application Routes Content */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-950 text-slate-300 mt-16 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">
                  Nexu<span className="text-orange-500">Store</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your premier online shopping hub for genuine electronics, trendsetting fashion, and living essentials.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/" className="hover:text-white transition">Home Store</Link></li>
                <li><Link to="/cart" className="hover:text-white transition">My Cart</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link></li>
                <li><Link to="/orders" className="hover:text-white transition">Track Orders</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Customer Support</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Email: support@nexustore.com</li>
                <li>Helpline: +92 (300) 123-4567</li>
                <li>Cash on Delivery All Over Pakistan</li>
                <li>7-Day Hassle-Free Returns</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Account & Admin</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Register Account</Link></li>
                <li><Link to="/admin" className="text-amber-400 hover:text-amber-300 transition font-bold">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} NexusStore Inc. All rights reserved. Built for seamless high-performance e-commerce.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
