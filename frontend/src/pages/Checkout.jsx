import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';

const API_ORDERS = '/api/orders';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Lahore',
    postalCode: '',
    paymentMethod: 'Cash on Delivery',
  });

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('nexu_cart')) || [];
      if (items.length === 0) {
        toast('Your cart is empty. Please add products first.');
        navigate('/cart');
      }
      setCartItems(items);

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        setForm(prev => ({
          ...prev,
          fullName: userInfo.name || '',
          phone: userInfo.phone || '',
          street: userInfo.address?.street || '',
          city: userInfo.address?.city || 'Lahore',
        }));
      }
    } catch (e) {
      navigate('/cart');
    }
  }, [navigate]);

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.qty || 1)), 0);
  const shippingFee = subtotal > 3000 || subtotal === 0 ? 0 : 200;
  const totalAmount = subtotal + shippingFee;

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.street.trim()) {
      toast.error('Please fill in your name, phone, and complete shipping address');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: form.fullName,
        phone: form.phone,
        shippingAddress: {
          street: form.street,
          city: form.city,
        },
        paymentMethod: form.paymentMethod,
        orderItems: cartItems.map(item => ({
          title: item.title,
          qty: item.qty || 1,
          price: item.price,
          image: (item.images && item.images[0]) || item.image || '',
        })),
        itemsPrice: subtotal,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
      };

      // Send to backend API
      let placedOrder = null;
      try {
        const { data } = await axios.post(API_ORDERS, orderData);
        placedOrder = data;
      } catch (err) {
        console.warn('Backend order call failed, saving locally:', err.message);
        placedOrder = {
          ...orderData,
          _id: orderData.orderId,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
      }

      // Also persist to localStorage for seamless instant feedback
      const localOrders = JSON.parse(localStorage.getItem('nexu_orders')) || [];
      localOrders.unshift({
        ...placedOrder,
        date: new Date().toISOString().split('T')[0],
      });
      localStorage.setItem('nexu_orders', JSON.stringify(localOrders));

      // Clear cart
      localStorage.removeItem('nexu_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-orange-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">Checkout & Shipping</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form details */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" /> Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ali Ahmed"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="0300 1234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={form.street}
                  onChange={handleInputChange}
                  placeholder="House #, Street #, Sector / Area"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Other">Other City</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postal Code (Optional)</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleInputChange}
                  placeholder="54000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" /> Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                form.paymentMethod === 'Cash on Delivery' ? 'border-orange-500 bg-orange-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={form.paymentMethod === 'Cash on Delivery'}
                  onChange={handleInputChange}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</div>
                  <div className="text-xs text-gray-500 mt-0.5">Pay in cash when your order reaches your door.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                form.paymentMethod === 'Online Card Payment' ? 'border-orange-500 bg-orange-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online Card Payment"
                  checked={form.paymentMethod === 'Online Card Payment'}
                  onChange={handleInputChange}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-sm text-gray-900">Debit / Credit Card</div>
                  <div className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, or UnionPay accepted.</div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-orange-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? 'Confirming Order...' : `Place Order (Rs. ${totalAmount.toLocaleString()})`}
          </button>
        </form>

        {/* Order Preview Sidebar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Order Items ({cartItems.length})
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center flex-shrink-0">
                    {item.qty || 1}
                  </span>
                  <span className="font-medium text-gray-800 truncate">{item.title}</span>
                </div>
                <span className="font-bold text-gray-900 flex-shrink-0">
                  Rs. {(Number(item.price) * (item.qty || 1)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span className="font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="font-bold text-emerald-600">
                {shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Payable Total:</span>
            <span className="text-2xl font-black text-orange-600">Rs. {totalAmount.toLocaleString()}</span>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Buyer Protection Guarantee on all shipments.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
