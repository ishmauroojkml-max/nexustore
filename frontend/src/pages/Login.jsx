import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const API_LOGIN = '/api/auth/login';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(API_LOGIN, {
        email,
        password,
      });

      const userObject = data.user || {
        id: data.id || data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem('userInfo', JSON.stringify(userObject));
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(`Welcome back, ${userObject.name || 'User'}! 👋`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            ⚡
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to your NexusStore account</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>

          {/* Quick Demo Credentials pill */}
          <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100 text-xs text-orange-800">
            <span className="font-bold">Demo Login:</span> admin@nexustore.com / 123456
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-600 font-bold hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
