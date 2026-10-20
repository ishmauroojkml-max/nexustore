import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [inWishlist, setInWishlist] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id || '1';
  const image = (Array.isArray(product.images) && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500';
  const rawPrice = Number(product.price) || 0;
  const rawDiscount = Number(product.discountPrice) || 0;
  const price = rawDiscount > 0 ? rawDiscount : rawPrice;
  const originalPrice = rawPrice;
  const hasDiscount = rawDiscount > 0 && rawDiscount < rawPrice;
  const title = product.title || product.name || 'Nexus Product';

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('nexu_wishlist')) || [];
      setInWishlist(wishlist.some(item => (item._id || item.id) === productId));
    } catch (e) {
      // ignore
    }
  }, [productId]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const cart = JSON.parse(localStorage.getItem('nexu_cart')) || [];
      const existingIndex = cart.findIndex(item => (item._id || item.id) === productId);

      if (existingIndex > -1) {
        cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
      } else {
        cart.push({
          _id: productId,
          title: title,
          price: price,
          images: [image],
          stock: product.stock !== undefined ? Number(product.stock) : 15,
          qty: 1,
        });
      }

      localStorage.setItem('nexu_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`${title} added to cart! 🛒`);
    } catch (err) {
      toast.error('Could not add to cart');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let wishlist = JSON.parse(localStorage.getItem('nexu_wishlist')) || [];
      const exists = wishlist.some(item => (item._id || item.id) === productId);

      if (exists) {
        wishlist = wishlist.filter(item => (item._id || item.id) !== productId);
        setInWishlist(false);
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        wishlist.push({
          _id: productId,
          title: title,
          price: price,
          images: [image],
          category: product.category,
        });
        setInWishlist(true);
        toast.success('Saved to your wishlist! ❤️');
      }

      localStorage.setItem('nexu_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top badges & Wishlist button */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {hasDiscount ? (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm pointer-events-auto">
            SALE
          </span>
        ) : (
          <span className="bg-gray-900/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-auto">
            {product.category || 'Store'}
          </span>
        )}

        <button
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm pointer-events-auto ${
            inWishlist 
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
              : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link to={`/product/${productId}`} className="block relative bg-gray-50/60 pt-4 px-4 pb-2 overflow-hidden">
        <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500';
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{product.ratings || 4.8}</span>
            <span className="text-gray-400 font-normal">({product.numReviews || 12})</span>
          </div>

          <Link to={`/product/${productId}`}>
            <h3 className="font-bold text-gray-900 text-sm hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-orange-600">
              Rs. {price.toLocaleString()}
            </div>
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through">
                Rs. {originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
