import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: ANSWER KEYS, AUDIT LOG & RE-EVALUATION
// File: apps/admin/src/pages/SolutionsPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { History, AlertTriangle, CheckCircle2, RefreshCw, } from 'lucide-react';
import { adminService } from '../services/adminService';
export const SolutionsPage = () => {
    const [questions, setQuestions] = useState([]);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [newOptionId, setNewOptionId] = useState('');
    const [reason, setReason] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const loadData = async () => {
        setLoading(true);
        const [qData, logData] = await Promise.all([
            adminService.getQuestions(),
            adminService.getAuditLog(),
        ]);
        setQuestions(qData);
        setAuditLog(logData);
        setLoading(false);
    };
    useEffect(() => {
        loadData();
    }, []);
    const openReevalModal = (q) => {
        setSelectedQuestion(q);
        setNewOptionId(q.correct_option_id || (q.options && q.options[0]?.id) || '');
        setReason('');
        setIsModalOpen(true);
    };
    const handleExecuteReevaluation = async (e) => {
        e.preventDefault();
        if (!selectedQuestion || !newOptionId || !reason.trim()) {
            alert('Please select the new correct option and provide a justification reason.');
            return;
        }
        try {
            setIsProcessing(true);
            const res = await adminService.updateAnswerKeyWithAudit(selectedQuestion.id, newOptionId, reason);
            setIsProcessing(false);
            setIsModalOpen(false);
            alert(`Answer key updated successfully! ${res.count} affected candidate attempts were re-evaluated and scores updated atomically.`);
            loadData();
        }
        catch (err) {
            setIsProcessing(false);
            alert(`Error updating answer key: ${err.message}`);
        }
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Answer Keys & Audit Re-evaluation" }), _jsx("p", { className: "page-subtitle", children: "Secure answer key administration. Updates record audit entries and trigger safe, transparent re-evaluations." })] }) }), _jsxs("div", { className: "validation-box validation-warning mb-6", children: [_jsx(AlertTriangle, { size: 24, className: "text-amber-600 flex-shrink-0" }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-amber-900 text-sm", children: "Protected Answer Key Security Policy" }), _jsxs("p", { className: "text-xs text-amber-800 mt-1 leading-relaxed", children: ["Answer keys are protected by PostgreSQL Row Level Security (RLS) and never queried by candidates during live timed tests. When an official representation is accepted and an answer key changes, historical attempts are re-evaluated transparently via the server RPC function ", _jsx("code", { className: "bg-amber-100 px-1 rounded", children: "reevaluate_exam_attempts" }), " with audit tracking."] })] })] }), _jsxs("div", { className: "grid-2-cols gap-6", children: [_jsxs("div", { className: "content-card", children: [_jsx("div", { className: "card-header", children: _jsx("h2", { className: "card-title", children: "Questions & Current Answer Keys" }) }), _jsx("div", { className: "p-4 space-y-3 max-h-[600px] overflow-y-auto", children: loading ? (_jsx("p", { className: "text-slate-500 text-sm", children: "Loading question keys..." })) : questions.map((q) => {
                                    const correctOpt = q.options?.find((o) => o.id === q.correct_option_id);
                                    return (_jsxs("div", { className: "p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-start", children: [_jsxs("div", { className: "flex-1 pr-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("span", { className: "font-bold text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: ["Q", q.question_number] }), _jsx("span", { className: "text-xs text-slate-500", children: q.topic })] }), _jsx("p", { className: "text-xs text-slate-800 font-medium line-clamp-2", children: q.question_text }), _jsxs("div", { className: "mt-2 text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Official Key: " }), _jsxs("strong", { className: "text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded", children: ["Option ", correctOpt?.option_label, ": ", correctOpt?.option_text] })] })] }), _jsxs("button", { className: "btn btn-secondary btn-sm flex items-center gap-1 flex-shrink-0", onClick: () => openReevalModal(q), children: [_jsx(RefreshCw, { size: 12 }), _jsx("span", { children: "Revise Key" })] })] }, q.id));
                                }) })] }), _jsxs("div", { className: "content-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h2", { className: "card-title", children: "Answer Key Audit Trail" }), _jsx(History, { size: 16, className: "text-slate-400" })] }), _jsx("div", { className: "p-4 space-y-3 max-h-[600px] overflow-y-auto", children: auditLog.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 text-center py-6", children: "No historical answer key revisions recorded yet." })) : auditLog.map((log) => (_jsxs("div", { className: "p-3 border border-slate-200 rounded-lg bg-white shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center text-xs text-slate-500 mb-1", children: [_jsx("span", { className: "font-semibold text-slate-700", children: log.changed_by_name || 'Admin' }), _jsx("span", { children: new Date(log.created_at).toLocaleDateString() })] }), _jsxs("div", { className: "text-xs font-bold text-slate-800 mb-1", children: ["Answer changed: Option ", log.old_correct_label || 'A', " \u2192 Option ", log.new_correct_label || 'B'] }), _jsxs("p", { className: "text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100", children: [_jsx("strong", { children: "Justification:" }), " ", log.reason] }), _jsxs("div", { className: "mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-semibold", children: [_jsx(CheckCircle2, { size: 12 }), _jsxs("span", { children: [log.reevaluated_attempts_count, " candidate attempts re-evaluated"] })] })] }, log.id))) })] })] }), isModalOpen && selectedQuestion && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: "Revise Answer Key & Re-evaluate" }), _jsx("button", { className: "btn-close", onClick: () => setIsModalOpen(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleExecuteReevaluation, children: [_jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-xs font-bold text-blue-600", children: ["Question #", selectedQuestion.question_number] }), _jsx("p", { className: "text-sm text-slate-800 font-medium mt-1", children: selectedQuestion.question_text })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Select New Correct Option *" }), _jsx("select", { className: "form-input", value: newOptionId, onChange: (e) => setNewOptionId(e.target.value), required: true, children: selectedQuestion.options?.map((opt) => (_jsxs("option", { value: opt.id, children: ["Option ", opt.option_label, ": ", opt.option_text] }, opt.id))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Mandatory Audit Justification / Reason *" }), _jsx("textarea", { className: "form-input", rows: 3, placeholder: "e.g. Official SSC answer key challenge accepted. Question ambiguity reviewed by subject matter expert.", value: reason, onChange: (e) => setReason(e.target.value), required: true })] }), _jsxs("div", { className: "bg-amber-50 p-3 rounded text-xs text-amber-900 border border-amber-200", children: [_jsx("strong", { children: "Warning:" }), " Submitting will atomically re-evaluate all submitted student attempts that answered this question and recalculate their final scores."] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setIsModalOpen(false), disabled: isProcessing, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary bg-amber-600 hover:bg-amber-700", disabled: isProcessing, children: isProcessing ? 'Re-evaluating Attempts...' : 'Confirm & Re-evaluate' })] })] })] }) }))] }));
};
