import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, Package, Shield, Search } from 'lucide-react';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const syncState = () => {
    try {
      const rawCart = localStorage.getItem('nexu_cart');
      const cart = rawCart ? JSON.parse(rawCart) : [];
      const count = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (Number(item?.qty) || 1), 0) : 0;
      setCartCount(count);

      const rawWish = localStorage.getItem('nexu_wishlist');
      const wishlist = rawWish ? JSON.parse(rawWish) : [];
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);

      const rawUser = localStorage.getItem('userInfo');
      const userInfo = rawUser ? JSON.parse(rawUser) : null;
      setUser(userInfo && typeof userInfo === 'object' ? userInfo : null);
    } catch (e) {
      console.warn('Navbar sync state warning:', e);
    }
  };

  useEffect(() => {
    syncState();
    const handleCartUpdate = () => syncState();
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
            Nexu<span className="text-yellow-300">Store</span>
          </span>
        </Link>

        {/* Global Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-2 hidden sm:flex items-center relative">
          <input
            type="text"
            placeholder="Search products, brands, electronics, fashion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-4 pr-11 rounded-full text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Navigation Action Links */}
        <div className="flex items-center gap-2.5 sm:gap-5 text-sm font-semibold">
          {/* Prominent Always-Visible Admin Panel Button */}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black px-3.5 py-1.5 rounded-full text-xs shadow-md transition transform hover:scale-105 active:scale-95"
            title="Open Admin Management Panel"
          >
            <Shield className="w-4 h-4 text-orange-600" />
            <span>Admin Panel</span>
          </Link>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="hidden md:flex items-center gap-1.5 hover:text-yellow-200 transition relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Orders Link */}
          <Link
            to="/orders"
            className="flex items-center gap-1.5 hover:text-yellow-200 transition"
            title="My Orders"
          >
            <Package className="w-5 h-5" />
            <span className="hidden sm:inline">Orders</span>
          </Link>

          {/* Cart Link with Badge */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm transition relative"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-yellow-300" />
            <span className="hidden sm:inline font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-bold max-w-[90px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-white/20 rounded-lg text-yellow-200 hover:text-white transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <Link
                to="/login"
                className="hover:text-yellow-200 transition text-xs sm:text-sm font-bold"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center relative">
          <input
            type="text"
            placeholder="Search NexuStore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-4 pr-10 rounded-full text-gray-900 bg-white placeholder-gray-400 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="absolute right-1 p-1 bg-orange-600 text-white rounded-full"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
