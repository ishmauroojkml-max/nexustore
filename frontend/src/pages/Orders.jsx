import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight, Printer } from 'lucide-react';

const API_ORDERS = '/api/orders';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let serverOrders = [];
      try {
        const { data } = await axios.get(API_ORDERS);
        serverOrders = data;
      } catch (err) {
        console.warn('Backend orders fetch failed, reading localStorage:', err.message);
      }

      const localOrders = JSON.parse(localStorage.getItem('nexu_orders')) || [];

      // Merge avoiding duplicate IDs
      const combined = [...localOrders];
      serverOrders.forEach(so => {
        if (!combined.some(co => (co.orderId || co._id) === (so.orderId || so._id))) {
          combined.push(so);
        }
      });

      // Default sample order if completely empty
      if (combined.length === 0) {
        combined.push({
          _id: 'ORD-89421',
          orderId: 'ORD-89421',
          date: new Date().toISOString().split('T')[0],
          totalAmount: 5499,
          status: 'Shipped',
          orderItems: [
            { title: 'Smart Fitness Watch Series 8 (Amoled Display & SpO2)', qty: 1, price: 5499 }
          ],
          shippingAddress: { street: 'Main Boulevard, Gulberg', city: 'Lahore' },
          paymentMethod: 'Cash on Delivery'
        });
      }

      setOrders(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      try {
        await axios.put(`${API_ORDERS}/${orderId}/status`, { status: 'Cancelled' });
      } catch (e) {}

      const updated = orders.map(ord => {
        if ((ord.orderId || ord._id) === orderId) {
          return { ...ord, status: 'Cancelled' };
        }
        return ord;
      });

      setOrders(updated);
      localStorage.setItem('nexu_orders', JSON.stringify(updated));
      toast.success(`Order ${orderId} has been cancelled.`);
    } catch (e) {
      toast.error('Failed to cancel order');
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId || order._id}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            .header { border-bottom: 2px solid #ea580c; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #ea580c; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f3f4f6; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">NexusStore - Official Invoice</div>
            <p>Order ID: ${order.orderId || order._id} | Date: ${order.date || (order.createdAt && order.createdAt.split('T')[0]) || 'Recent'}</p>
            <p>Customer: ${order.customerName || 'Valued Customer'}</p>
            <p>Address: ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || ''}</p>
            <p>Payment: ${order.paymentMethod || 'COD'}</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${(order.orderItems || order.items || []).map(i => `
                <tr>
                  <td>${i.title}</td>
                  <td>${i.qty}</td>
                  <td>Rs. ${i.price}</td>
                  <td>Rs. ${i.price * i.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total Amount: Rs. ${order.totalAmount || order.total || 0}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'Processing':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      case 'Shipped':
        return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full"><Truck className="w-3.5 h-3.5" /> Shipped</span>;
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-500" />
            My Orders & Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track current shipments and view order receipts</p>
        </div>

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100 max-w-md mx-auto">
          <div className="text-5xl mb-3">📦</div>
          <h2 className="text-xl font-bold text-gray-800">No Orders Placed Yet</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">You have not ordered anything yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-orange-600 transition"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderKey = order.orderId || order._id;
            const items = order.orderItems || order.items || [];
            const dateStr = order.date || (order.createdAt && order.createdAt.split('T')[0]) || 'Recent';

            return (
              <div
                key={orderKey}
                className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm transition hover:shadow-md"
              >
                {/* Header details */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-900 text-base">{orderKey}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Placed on: <span className="text-gray-600 font-medium">{dateStr}</span> | Payment:{' '}
                      <span className="text-gray-600 font-medium">{order.paymentMethod || 'COD'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">Order Amount</div>
                    <div className="text-xl font-black text-orange-600">
                      Rs. {(order.totalAmount || order.total || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {order.status !== 'Cancelled' ? (
                  <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className={`flex flex-col items-center font-bold ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs text-white ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          1
                        </div>
                        <span>Placed</span>
                      </div>
                      <div className={`flex flex-col items-center font-bold ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs text-white ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          2
                        </div>
                        <span>Processing</span>
                      </div>
                      <div className={`flex flex-col items-center font-bold ${['Shipped', 'Delivered'].includes(order.status) ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs text-white ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          3
                        </div>
                        <span>Shipped</span>
                      </div>
                      <div className={`flex flex-col items-center font-bold ${order.status === 'Delivered' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs text-white ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          4
                        </div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-rose-50 text-rose-700 text-xs font-semibold p-3 rounded-xl border border-rose-200">
                    This order was cancelled and will not be processed.
                  </div>
                )}

                {/* Items in order */}
                <div className="space-y-2 mb-5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-none">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-gray-100 text-gray-700 rounded text-xs font-bold flex items-center justify-center">
                          {item.qty}x
                        </span>
                        <span className="font-medium text-gray-800">{item.title}</span>
                      </div>
                      <span className="font-bold text-gray-900">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Delivering to: <span className="font-semibold text-gray-700">{order.shippingAddress?.street || 'Customer Address'}, {order.shippingAddress?.city || ''}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePrintInvoice(order)}
                      className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Receipt
                    </button>

                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleCancelOrder(orderKey)}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
