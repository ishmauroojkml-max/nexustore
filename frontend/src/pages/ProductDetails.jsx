import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Heart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = '/api/products';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState('');
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/${id}`);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImg(data.images[0]);
        } else if (data.image) {
          setSelectedImg(data.image);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Check wishlist
    try {
      const wishlist = JSON.parse(localStorage.getItem('nexu_wishlist')) || [];
      setInWishlist(wishlist.some(item => (item._id || item.id) === id));
    } catch (e) {}
  }, [id]);

  const price = product?.discountPrice > 0 ? product.discountPrice : product?.price;
  const originalPrice = product?.price;
  const stock = product?.stock !== undefined ? product.stock : 15;
  const title = product?.title || product?.name || 'Product Details';

  const addToCartHandler = () => {
    if (!product) return;
    try {
      const cart = JSON.parse(localStorage.getItem('nexu_cart')) || [];
      const existingIndex = cart.findIndex(item => (item._id || item.id) === product._id);

      if (existingIndex > -1) {
        cart[existingIndex].qty = Math.min(stock, (cart[existingIndex].qty || 1) + qty);
      } else {
        cart.push({
          _id: product._id,
          title: title,
          price: price,
          images: product.images && product.images.length > 0 ? product.images : [selectedImg],
          stock: stock,
          qty: qty,
        });
      }

      localStorage.setItem('nexu_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`${qty}x "${title}" added to your cart! 🛒`);
    } catch (e) {
      toast.error('Could not add to cart');
    }
  };

  const toggleWishlistHandler = () => {
    if (!product) return;
    try {
      let wishlist = JSON.parse(localStorage.getItem('nexu_wishlist')) || [];
      const exists = wishlist.some(item => (item._id || item.id) === product._id);

      if (exists) {
        wishlist = wishlist.filter(item => (item._id || item.id) !== product._id);
        setInWishlist(false);
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        wishlist.push({
          _id: product._id,
          title: title,
          price: price,
          images: [selectedImg],
          category: product.category,
        });
        setInWishlist(true);
        toast.success('Added to your wishlist! ❤️');
      }

      localStorage.setItem('nexu_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      toast.error('Could not update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-gray-500 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto my-12 p-8">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 mt-2 text-sm">The product you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </button>

        <div className="text-xs text-gray-400">
          <Link to="/" className="hover:underline">Home</Link> / <span className="text-gray-600">{product.category || 'Shop'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        {/* Images Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-96 bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100 overflow-hidden">
            <img 
              src={selectedImg || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'} 
              alt={title} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thumbnail list if multiple */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`w-20 h-20 rounded-xl border-2 p-1 bg-gray-50 flex items-center justify-center overflow-hidden transition ${
                    selectedImg === img ? 'border-orange-500 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Purchase Options */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                {product.category || 'General'}
              </span>
              {product.brand && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 leading-snug">
              {title}
            </h1>
            
            {/* Reviews */}
            <div className="flex items-center mt-3 gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratings || 4.8) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.ratings || 4.8}</span>
              <span className="text-xs text-gray-400">({product.numReviews || 24} customer reviews)</span>
            </div>

            {/* Price section */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-orange-600">
                Rs. {price.toLocaleString()}
              </span>
              {product.discountPrice > 0 && product.discountPrice < product.price && (
                <span className="text-lg text-gray-400 line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mt-5 leading-relaxed text-sm sm:text-base border-t border-b border-gray-100 py-4">
              {product.description}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* Stock status */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">Availability:</span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stock > 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> In Stock ({stock} units ready to ship)
                  </>
                ) : (
                  'Out of Stock'
                )}
              </span>
            </div>

            {/* Quantity Selector */}
            {stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-semibold text-sm text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-200 font-bold transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm bg-white py-1.5">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(stock, qty + 1))}
                    className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-200 font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={addToCartHandler}
                disabled={stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition active:scale-[0.99] ${
                  stock > 0 
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' 
                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>

              <button 
                onClick={toggleWishlistHandler}
                className={`p-3.5 border rounded-2xl transition shadow-sm ${
                  inWishlist 
                    ? 'border-rose-300 bg-rose-50 text-rose-500' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6 text-center">
              <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70">
                <Truck className="w-5 h-5 text-orange-600 mb-1" />
                <span className="text-xs font-bold text-gray-800">Fast Shipping</span>
                <span className="text-[10px] text-gray-500">Across Pakistan</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-gray-800">100% Genuine</span>
                <span className="text-[10px] text-gray-500">Verified Quality</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70">
                <RefreshCw className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-gray-800">Easy Returns</span>
                <span className="text-[10px] text-gray-500">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
