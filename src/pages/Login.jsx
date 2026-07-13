import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HardHat, Lock, User, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(username, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.message || 'Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl mb-4 shadow-inner">
            <HardHat className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">SURYA CONSTRUCTION</h1>
          <p className="text-slate-400 text-sm mt-1">Permit Activity Tracker Portal</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Login Failed</p>
              <p className="text-rose-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="firstname.lastname"
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 placeholder-slate-600 transition outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 placeholder-slate-600 transition outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/20 hover:shadow-amber-950/30 transition duration-150 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Access Account'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          Internal Tracking System • Authorized Access Only
        </div>
      </div>
    </div>
  );
}
