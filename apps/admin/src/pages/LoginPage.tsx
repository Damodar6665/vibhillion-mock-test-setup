// ==============================================================================
// VIBHILLION ADMIN: LOGIN PAGE & ROLE VERIFICATION
// File: apps/admin/src/pages/LoginPage.tsx
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loginAsDemo, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('admin@vibhillion.ai');
  const [password, setPassword] = useState('Admin@123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          navigate('/');
        } else {
          setErrorMsg(
            res.error === 'Invalid login credentials'
              ? 'User not registered in Supabase Auth yet. Switch to "Create Account" tab above or click "Explore Demo Console Directly" below.'
              : res.error || 'Failed to authenticate.'
          );
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (res.success) {
          setSuccessMsg('Account created! Logging in to Administrator Console...');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setErrorMsg(res.error || 'Failed to create account.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    loginAsDemo();
    navigate('/');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vibhillion AI</h1>
          <p className="text-sm font-semibold text-blue-600 mt-1">ADMINISTRATOR CONTROL CONSOLE</p>
          <p className="text-xs text-slate-500 mt-2">
            Restricted portal connected to Supabase Cloud PostgreSQL database.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signin' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
          >
            <UserPlus size={14} />
            <span>Create Admin User</span>
          </button>
        </div>

        {errorMsg && (
          <div className="login-error-alert mb-4">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="text-xs">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="validation-box validation-success mb-4 p-3 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 rounded-lg">
            <CheckCircle size={16} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Administrator Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                className="form-input pl-9"
                placeholder="admin@vibhillion.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                className="form-input pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-2.5" disabled={loading}>
            {loading
              ? 'Processing...'
              : mode === 'signin'
              ? 'Sign In to Console'
              : 'Create Account & Log In'}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary w-full flex items-center justify-center gap-2"
          onClick={handleDemoBypass}
        >
          <span>Explore Demo Console Directly</span>
          <ArrowRight size={14} />
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-4 leading-relaxed">
          Connected to Supabase Project: <code className="text-slate-600 font-mono">chkhsshofywlsaqskdqo</code>
        </p>
      </div>
    </div>
  );
};
