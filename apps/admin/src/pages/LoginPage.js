import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: LOGIN PAGE & ROLE VERIFICATION
// File: apps/admin/src/pages/LoginPage.tsx
// ==============================================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/auth-context';
export const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn, isConfigured } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
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
            }
            else {
                setErrorMsg(res.error || 'Failed to authenticate.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleDemoBypass = async () => {
        await signIn('admin@vibhillion.ai', 'vibhillion123');
        navigate('/');
    };
    return (_jsx("div", { className: "login-screen", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3", children: _jsx(ShieldCheck, { size: 36 }) }), _jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Vibhillion AI" }), _jsx("p", { className: "text-sm font-semibold text-blue-600 mt-1", children: "ADMINISTRATOR CONTROL CONSOLE" }), _jsx("p", { className: "text-xs text-slate-500 mt-2", children: "Restricted portal. Requires verified administrative privileges in Supabase." })] }), errorMsg && (_jsxs("div", { className: "login-error-alert mb-4", children: [_jsx(AlertCircle, { size: 16 }), _jsx("span", { children: errorMsg })] })), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Admin Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 16, className: "absolute left-3 top-3 text-slate-400" }), _jsx("input", { type: "email", className: "form-input pl-9", placeholder: "admin@vibhillion.ai", value: email, onChange: (e) => setEmail(e.target.value), required: true })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 16, className: "absolute left-3 top-3 text-slate-400" }), _jsx("input", { type: "password", className: "form-input pl-9", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true })] })] }), _jsx("button", { type: "submit", className: "btn btn-primary w-full py-2.5", disabled: loading, children: loading ? 'Verifying Credentials...' : 'Sign In to Console' })] }), _jsx("div", { className: "login-divider", children: _jsx("span", { children: "OR" }) }), _jsxs("button", { type: "button", className: "btn btn-secondary w-full flex items-center justify-center gap-2", onClick: handleDemoBypass, children: [_jsx("span", { children: "Explore Demo Console Directly" }), _jsx(ArrowRight, { size: 14 })] }), !isConfigured && (_jsxs("p", { className: "text-[11px] text-center text-slate-400 mt-4", children: ["Running in local demonstration mode. Add Supabase URL and anon key to ", _jsx("code", { className: "text-slate-600", children: "apps/admin/.env" }), " to connect cloud PostgreSQL."] }))] }) }));
};
