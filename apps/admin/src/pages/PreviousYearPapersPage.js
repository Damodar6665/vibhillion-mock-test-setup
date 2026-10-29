import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: PREVIOUS-YEAR PAPERS PAGE
// File: apps/admin/src/pages/PreviousYearPapersPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { History, Calendar, Clock, ArrowRight } from 'lucide-react';
import { adminService } from '../services/adminService';
import { Link } from 'react-router-dom';
export const PreviousYearPapersPage = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        adminService.getExams().then((data) => {
            setPapers(data.filter((e) => e.exam_type === 'previous_year_paper'));
            setLoading(false);
        });
    }, []);
    return (_jsxs("div", { className: "page-wrapper", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Previous-Year Papers" }), _jsx("p", { className: "page-subtitle", children: "Archive and curate official shifts, historical question sets, and sectional limits" })] }), _jsxs(Link, { to: "/exams", className: "btn btn-primary", children: [_jsx(History, { size: 16 }), _jsx("span", { children: "Add Official Shift Paper" })] })] }), _jsx("div", { className: "content-card", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading paper archives..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Paper Title" }), _jsx("th", { children: "Exam Date & Shift" }), _jsx("th", { children: "Questions" }), _jsx("th", { children: "Sectional Timing" }), _jsx("th", { children: "Candidate Access" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: papers.map((p) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { className: "font-bold text-slate-900", children: p.title }), _jsxs("div", { className: "text-xs text-slate-500", children: ["SSC CGL Tier 1 \u2022 ", p.year] })] }), _jsxs("td", { children: [_jsxs("div", { className: "flex items-center gap-1 text-sm font-semibold text-slate-700", children: [_jsx(Calendar, { size: 14, className: "text-slate-400" }), _jsx("span", { children: p.exam_date || '2025-09-12' })] }), _jsx("div", { className: "text-xs text-slate-500", children: p.session })] }), _jsx("td", { children: _jsxs("span", { className: "font-semibold text-slate-800", children: [p.total_questions, " Questions"] }) }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-700", children: [_jsx(Clock, { size: 14, className: "text-blue-500" }), _jsx("span", { children: "4 \u00D7 15 Mins (60 Mins Total)" })] }) }), _jsx("td", { children: _jsx("span", { className: "badge badge-success", children: "Published on Mobile App" }) }), _jsx("td", { children: _jsxs(Link, { to: "/questions", className: "btn btn-secondary btn-sm flex items-center gap-1", children: [_jsx("span", { children: "Inspect Qs" }), _jsx(ArrowRight, { size: 12 })] }) })] }, p.id))) })] }) })) })] }));
};
