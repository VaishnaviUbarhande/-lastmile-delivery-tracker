import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/agent' : '/customer';

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to={user ? dashboardPath : '/'} className="text-lg font-bold text-brand-700">
        📦 Last-Mile Tracker
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              {user.name} <span className="uppercase text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full ml-1">{user.role}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-700 hover:text-brand-600">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
