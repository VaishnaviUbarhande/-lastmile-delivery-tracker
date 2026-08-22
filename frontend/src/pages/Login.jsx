import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.name}`);
      const path = data.role === 'admin' ? '/admin' : data.role === 'agent' ? '/agent' : '/customer';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Log in</h1>
        <label className="block text-sm mb-1 text-gray-600">Email</label>
        <input
          type="email"
          required
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label className="block text-sm mb-1 text-gray-600">Password</label>
        <input
          type="password"
          required
          className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2 rounded-md font-medium hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          New customer?{' '}
          <Link to="/register" className="text-brand-600 font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
