import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const loadCart = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('nexu_cart')) || [];
      setCartItems(savedCart);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateLocalStorage = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem('nexu_cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQtyChange = (id, newQty) => {
    const updated = cartItems.map(item => {
      if ((item._id || item.id) === id) {
        const itemStock = item.stock !== undefined ? item.stock : 20;
        if (newQty > itemStock) {
          toast.error(`Only ${itemStock} units in stock!`);
          return item;
        }
        return { ...item, qty: Math.max(1, newQty) };
      }
      return item;
    });
    updateLocalStorage(updated);
  };

  const handleRemove = (id) => {
    const itemToRemove = cartItems.find(item => (item._id || item.id) === id);
    const updated = cartItems.filter(item => (item._id || item.id) !== id);
    updateLocalStorage(updated);
    toast('Item removed from cart', { icon: '🗑️' });
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      updateLocalStorage([]);
      toast.success('Cart cleared');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.qty || 1)), 0);
  const shippingFee = subtotal > 3000 || subtotal === 0 ? 0 : 200;
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            Shopping Cart
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'unique product' : 'unique products'} in your basket
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl text-center shadow-sm border border-gray-100 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-4xl mx-auto mb-4">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/25"
          >
            Start Shopping Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemId = item._id || item.id;
              const image = (item.images && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300';
              const itemTotal = Number(item.price) * (item.qty || 1);

              return (
                <div
                  key={itemId}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
                >
                  <Link to={`/product/${itemId}`} className="flex-shrink-0">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-24 h-24 object-contain bg-gray-50 rounded-xl border border-gray-100 p-2"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <Link
                      to={`/product/${itemId}`}
                      className="font-bold text-gray-900 text-base hover:text-orange-600 transition line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      Unit Price: <span className="font-semibold text-gray-800">Rs. {Number(item.price).toLocaleString()}</span>
                    </div>
                    <div className="text-orange-600 font-extrabold text-base mt-1">
                      Total: Rs. {itemTotal.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => handleQtyChange(itemId, (item.qty || 1) - 1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 font-bold transition"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center font-bold text-sm bg-white py-1.5">{item.qty || 1}</span>
                      <button
                        onClick={() => handleQtyChange(itemId, (item.qty || 1) + 1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 font-bold transition"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(itemId)}
                      className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Delivery</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">Rs. {shippingFee}</span>
                )}
              </div>
              {subtotal < 3000 && (
                <div className="text-[12px] text-amber-700 bg-amber-50 p-2.5 rounded-xl">
                  Add Rs. {(3000 - subtotal).toLocaleString()} more to qualify for <strong>FREE Shipping!</strong>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Estimated Total</span>
                <span className="text-2xl font-black text-orange-600">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Includes all applicable duties & taxes</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/25 active:scale-[0.99]"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
