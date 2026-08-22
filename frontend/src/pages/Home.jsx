import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  if (user) {
    const path = user.role === 'admin' ? '/admin' : user.role === 'agent' ? '/agent' : '/customer';
    return <Navigate to={path} replace />;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-4">📦 Last-Mile Delivery Tracker</h1>
      <p className="text-gray-500 max-w-xl mb-8">
        Auto-calculated shipping charges, intelligent agent assignment, and real-time delivery
        tracking for B2B and B2C shipments.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-brand-600 text-white px-6 py-2.5 rounded-md font-medium">
          Log In
        </Link>
        <Link to="/register" className="border px-6 py-2.5 rounded-md font-medium">
          Create Account
        </Link>
      </div>
    </div>
  );
}
