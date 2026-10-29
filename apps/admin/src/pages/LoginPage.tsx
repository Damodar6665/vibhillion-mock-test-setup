// ==============================================================================
// VIBHILLION ADMIN: LOGIN PAGE & ROLE VERIFICATION
// File: apps/admin/src/pages/LoginPage.tsx
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await signIn(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Failed to authenticate.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    await signIn('admin@vibhillion.ai', 'vibhillion123');
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
            Restricted portal. Requires verified administrative privileges in Supabase.
          </p>
        </div>

        {errorMsg && (
          <div className="login-error-alert mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'Verifying Credentials...' : 'Sign In to Console'}
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

        {!isConfigured && (
          <p className="text-[11px] text-center text-slate-400 mt-4">
            Running in local demonstration mode. Add Supabase URL and anon key to <code className="text-slate-600">apps/admin/.env</code> to connect cloud PostgreSQL.
          </p>
        )}
      </div>
    </div>
  );
};
