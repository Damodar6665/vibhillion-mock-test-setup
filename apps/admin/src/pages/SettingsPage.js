import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: SETTINGS PAGE & ADMIN BOOTSTRAP
// File: apps/admin/src/pages/SettingsPage.tsx
// ==============================================================================
import { useState } from 'react';
import { ShieldCheck, Save } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
export const SettingsPage = () => {
    const [defaultPositiveMarks, setDefaultPositiveMarks] = useState(2.0);
    const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0.5);
    const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(60);
    const [resultVisibility, setResultVisibility] = useState('immediate');
    const [explanationVisibility, setExplanationVisibility] = useState('after_submission');
    const [revealInPractice, setRevealInPractice] = useState(true);
    // Admin bootstrap email
    const [bootstrapEmail, setBootstrapEmail] = useState('');
    const [bootstrapStatus, setBootstrapStatus] = useState(null);
    const handleSaveSettings = (e) => {
        e.preventDefault();
        alert('Global default test settings updated successfully!');
    };
    const handleBootstrapAdmin = async () => {
        if (!bootstrapEmail)
            return;
        if (!isSupabaseConfigured) {
            setBootstrapStatus(`(Demo Mode) User ${bootstrapEmail} granted admin role.`);
            return;
        }
        try {
            const { data, error } = await supabase.rpc('bootstrap_admin', {
                p_email: bootstrapEmail,
            });
            if (error || !data?.success) {
                setBootstrapStatus(`Failed: ${error?.message || data?.message}`);
            }
            else {
                setBootstrapStatus(`Success! ${bootstrapEmail} is now an authorized administrator.`);
            }
        }
        catch (err) {
            setBootstrapStatus(`Error: ${err.message}`);
        }
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Global Exam Settings" }), _jsx("p", { className: "page-subtitle", children: "Configure system-wide test parameters, answer reveal timing, and administrator access" })] }) }), _jsxs("div", { className: "grid-2-cols gap-6", children: [_jsxs("div", { className: "content-card", children: [_jsx("div", { className: "card-header", children: _jsx("h2", { className: "card-title", children: "Default Marking & Timing Rules" }) }), _jsxs("form", { onSubmit: handleSaveSettings, className: "p-5 space-y-4", children: [_jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Default Correct Marks (+)" }), _jsx("input", { type: "number", step: "0.1", className: "form-input", value: defaultPositiveMarks, onChange: (e) => setDefaultPositiveMarks(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Default Negative Penalty (\u2212)" }), _jsx("input", { type: "number", step: "0.05", className: "form-input", value: defaultNegativeMarks, onChange: (e) => setDefaultNegativeMarks(Number(e.target.value)) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Default Full Exam Duration (Minutes)" }), _jsx("input", { type: "number", className: "form-input", value: defaultDurationMinutes, onChange: (e) => setDefaultDurationMinutes(Number(e.target.value)) })] }), _jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Score & Result Visibility" }), _jsxs("select", { className: "form-input", value: resultVisibility, onChange: (e) => setResultVisibility(e.target.value), children: [_jsx("option", { value: "immediate", children: "Immediate on Submission" }), _jsx("option", { value: "moderated", children: "Moderated (Manual Release)" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Solutions & Explanations" }), _jsxs("select", { className: "form-input", value: explanationVisibility, onChange: (e) => setExplanationVisibility(e.target.value), children: [_jsx("option", { value: "after_submission", children: "Strictly After Submission" }), _jsx("option", { value: "exam_end", children: "After Full Exam Shift Closes" })] })] })] }), _jsx("div", { className: "form-group pt-2", children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: revealInPractice, onChange: (e) => setRevealInPractice(e.target.checked), className: "rounded text-blue-600 focus:ring-blue-500 h-4 w-4" }), _jsx("span", { className: "text-sm font-semibold text-slate-700", children: "Allow Candidates to Toggle Instant Solution in Practice Mode" })] }) }), _jsxs("button", { type: "submit", className: "btn btn-primary mt-4", children: [_jsx(Save, { size: 16 }), _jsx("span", { children: "Save Configuration" })] })] })] }), _jsxs("div", { className: "content-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h2", { className: "card-title", children: "Bootstrap Administrator Access" }), _jsx(ShieldCheck, { size: 20, className: "text-blue-500" })] }), _jsxs("div", { className: "p-5 space-y-4", children: [_jsxs("p", { className: "text-xs text-slate-600 leading-relaxed", children: ["Users cannot elevate their own role through profile editing due to RLS protections. Use this server-side procedure (calls PostgreSQL function ", _jsx("code", { className: "bg-slate-100 px-1 py-0.5 rounded text-blue-600", children: "bootstrap_admin(email)" }), ") to grant administrative rights to an authenticated user."] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Registered User Email *" }), _jsx("input", { type: "email", className: "form-input", placeholder: "admin@vibhillion.ai", value: bootstrapEmail, onChange: (e) => setBootstrapEmail(e.target.value) })] }), _jsxs("button", { type: "button", className: "btn btn-primary bg-indigo-600 hover:bg-indigo-700", onClick: handleBootstrapAdmin, children: [_jsx(ShieldCheck, { size: 16 }), _jsx("span", { children: "Grant Admin Privileges" })] }), bootstrapStatus && (_jsx("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-blue-900", children: bootstrapStatus }))] })] })] })] }));
};
