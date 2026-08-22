import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Create your account</h1>
        {['name', 'email', 'phone', 'password'].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm mb-1 text-gray-600 capitalize">{field}</label>
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <button
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2 rounded-md font-medium hover:bg-brand-700 disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
