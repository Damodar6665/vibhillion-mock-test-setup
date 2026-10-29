import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: STUDENT ATTEMPTS MANAGEMENT
// File: apps/admin/src/pages/AttemptsPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDuration } from '@vibhillion/shared';
export const AttemptsPage = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        adminService.getStudentAttempts().then((data) => {
            setAttempts(data);
            setLoading(false);
        });
    }, []);
    return (_jsxs("div", { className: "page-wrapper", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Candidate Test Attempts" }), _jsx("p", { className: "page-subtitle", children: "Track in-progress, completed, and submitted student test sessions" })] }) }), _jsx("div", { className: "content-card", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading candidate attempts..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Attempt ID & Mode" }), _jsx("th", { children: "Submitted At" }), _jsx("th", { children: "Score" }), _jsx("th", { children: "Accuracy" }), _jsx("th", { children: "Breakdown (C / W / U)" }), _jsx("th", { children: "Time Spent" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: attempts.map((att) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { className: "font-mono text-xs font-bold text-slate-800", children: att.id }), _jsx("span", { className: `badge ${att.mode === 'timed' ? 'badge-info' : 'badge-warning'} mt-1`, children: att.mode.toUpperCase() })] }), _jsx("td", { className: "text-sm text-slate-600", children: att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Progress' }), _jsxs("td", { children: [_jsx("span", { className: "text-base font-extrabold text-blue-600", children: att.score.toFixed(1) }), _jsx("span", { className: "text-xs text-slate-400", children: " Marks" })] }), _jsx("td", { children: _jsxs("span", { className: "font-semibold text-emerald-600", children: [att.accuracy_percentage.toFixed(1), "%"] }) }), _jsxs("td", { className: "text-sm text-slate-700", children: [_jsx("span", { className: "text-emerald-600 font-bold", children: att.correct_count }), " /", ' ', _jsx("span", { className: "text-red-500 font-bold", children: att.wrong_count }), " /", ' ', _jsx("span", { className: "text-slate-400 font-bold", children: att.unattempted_count })] }), _jsx("td", { className: "text-sm text-slate-600", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 13, className: "text-slate-400" }), _jsx("span", { children: formatDuration(att.total_time_seconds) })] }) }), _jsx("td", { children: att.status === 'completed' ? (_jsxs("span", { className: "badge badge-success flex items-center gap-1 w-max", children: [_jsx(CheckCircle2, { size: 12 }), " Completed"] })) : (_jsx("span", { className: "badge badge-warning flex items-center gap-1 w-max", children: "In Progress" })) })] }, att.id))) })] }) })) })] }));
};
