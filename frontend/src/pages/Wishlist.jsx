import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('nexu_wishlist')) || [];
      setWishlist(saved);
    } catch (e) {
      setWishlist([]);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = (id) => {
    const updated = wishlist.filter(item => (item._id || item.id) !== id);
    setWishlist(updated);
    localStorage.setItem('nexu_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    toast('Removed from wishlist', { icon: '💔' });
  };

  const handleMoveToCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('nexu_cart')) || [];
      const itemId = item._id || item.id;
      const existing = cart.find(c => (c._id || c.id) === itemId);

      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({
          _id: itemId,
          title: item.title,
          price: item.price,
          images: item.images || [item.image],
          stock: 15,
          qty: 1,
        });
      }

      localStorage.setItem('nexu_cart', JSON.stringify(cart));
      handleRemove(itemId);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`Moved "${item.title}" to cart! 🛒`);
    } catch (e) {
      toast.error('Failed to move to cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            My Wishlist
          </h1>
          <p className="text-gray-500 text-sm mt-1">Saved favorites for your future purchases</p>
        </div>

        <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl text-center shadow-sm border border-gray-100 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-4xl mx-auto mb-4">
            💔
          </div>
          <h2 className="text-xl font-bold text-gray-800">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Explore our curated catalog and tap the heart icon to save products here!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/25"
          >
            Explore Store <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const itemId = item._id || item.id;
            const image = (item.images && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400';

            return (
              <div
                key={itemId}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <Link to={`/product/${itemId}`} className="block relative bg-gray-50 rounded-2xl p-4 overflow-hidden mb-3">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-44 object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <Link to={`/product/${itemId}`}>
                    <h3 className="font-bold text-sm text-gray-900 hover:text-orange-600 transition line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="text-orange-600 font-black text-base mt-2">
                    Rs. {Number(item.price).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(itemId)}
                    className="p-2 border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove"
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
  );
};

export default Wishlist;
