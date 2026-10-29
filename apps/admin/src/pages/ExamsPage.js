import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: EXAM MANAGEMENT PAGE
// File: apps/admin/src/pages/ExamsPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, } from 'lucide-react';
import { adminService } from '../services/adminService';
export const ExamsPage = () => {
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    // Form Fields
    const [categoryId, setCategoryId] = useState('');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [examType, setExamType] = useState('previous_year_paper');
    const [year, setYear] = useState(2025);
    const [examDate, setExamDate] = useState('2025-09-12');
    const [session, setSession] = useState('Shift 1');
    const [description, setDescription] = useState('');
    const [totalQuestions, setTotalQuestions] = useState(100);
    const [totalDurationSeconds, setTotalDurationSeconds] = useState(3600); // 60 mins
    const [totalMarks, setTotalMarks] = useState(200);
    const [positiveMarks, setPositiveMarks] = useState(2.0);
    const [negativeMarks, setNegativeMarks] = useState(0.5);
    const [status, setStatus] = useState('published');
    const loadData = () => {
        setLoading(true);
        Promise.all([adminService.getExams(), adminService.getCategories()]).then(([examData, catData]) => {
            setExams(examData);
            setCategories(catData);
            if (catData.length > 0 && !categoryId)
                setCategoryId(catData[0].id);
            setLoading(false);
        });
    };
    useEffect(() => {
        loadData();
    }, []);
    const openCreateModal = () => {
        setEditingExam(null);
        setTitle('');
        setSlug('');
        setExamType('previous_year_paper');
        setYear(2025);
        setExamDate('2025-09-12');
        setSession('Shift 1');
        setDescription('');
        setTotalQuestions(100);
        setTotalDurationSeconds(3600);
        setTotalMarks(200);
        setPositiveMarks(2.0);
        setNegativeMarks(0.5);
        setStatus('published');
        setIsModalOpen(true);
    };
    const openEditModal = (exam) => {
        setEditingExam(exam);
        setCategoryId(exam.category_id);
        setTitle(exam.title);
        setSlug(exam.slug);
        setExamType(exam.exam_type);
        setYear(exam.year || 2025);
        setExamDate(exam.exam_date || '2025-09-12');
        setSession(exam.session || 'Shift 1');
        setDescription(exam.description || '');
        setTotalQuestions(exam.total_questions);
        setTotalDurationSeconds(exam.total_duration_seconds);
        setTotalMarks(exam.total_marks);
        setPositiveMarks(exam.positive_marks);
        setNegativeMarks(exam.negative_marks);
        setStatus(exam.status);
        setIsModalOpen(true);
    };
    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || !slug || !categoryId)
            return;
        // Validation: Total questions must be positive
        if (totalQuestions <= 0) {
            alert('Total questions must be greater than 0');
            return;
        }
        const payload = {
            category_id: categoryId,
            title,
            slug,
            exam_type: examType,
            year: Number(year),
            exam_date: examDate,
            session,
            description,
            total_questions: Number(totalQuestions),
            total_duration_seconds: Number(totalDurationSeconds),
            total_marks: Number(totalMarks),
            positive_marks: Number(positiveMarks),
            negative_marks: Number(negativeMarks),
            status,
        };
        if (editingExam) {
            await adminService.updateExam(editingExam.id, payload);
        }
        else {
            await adminService.createExam(payload);
        }
        setIsModalOpen(false);
        loadData();
    };
    const handleTogglePublish = async (exam) => {
        const nextStatus = exam.status === 'published' ? 'draft' : 'published';
        await adminService.updateExam(exam.id, { status: nextStatus });
        loadData();
    };
    const handleDelete = async (id, examTitle) => {
        if (confirm(`Are you sure you want to delete exam "${examTitle}"?`)) {
            await adminService.deleteExam(id);
            loadData();
        }
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Exam Management" }), _jsx("p", { className: "page-subtitle", children: "Create, configure, publish, and audit test series & official shifts" })] }), _jsxs("button", { className: "btn btn-primary", onClick: openCreateModal, children: [_jsx(Plus, { size: 16 }), _jsx("span", { children: "Create New Exam" })] })] }), _jsx("div", { className: "content-card", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading exams catalog..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Exam Title" }), _jsx("th", { children: "Type & Year" }), _jsx("th", { children: "Questions & Time" }), _jsx("th", { children: "Marks Pattern" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: exams.map((exam) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { className: "font-bold text-slate-900", children: exam.title }), _jsx("div", { className: "text-xs text-slate-500", children: exam.slug })] }), _jsxs("td", { children: [_jsx("span", { className: "badge badge-info", children: exam.exam_type.replace(/_/g, ' ') }), _jsxs("div", { className: "text-xs text-slate-600 mt-1", children: [exam.year, " \u2022 ", exam.session] })] }), _jsxs("td", { children: [_jsxs("div", { className: "font-semibold text-slate-800", children: [exam.total_questions, " Questions"] }), _jsxs("div", { className: "text-xs text-slate-500", children: [Math.round(exam.total_duration_seconds / 60), " Minutes"] })] }), _jsxs("td", { children: [_jsxs("span", { className: "text-sm font-semibold text-emerald-600", children: ["+", exam.positive_marks] }), _jsx("span", { className: "text-xs text-slate-400", children: " / " }), _jsxs("span", { className: "text-sm font-semibold text-red-500", children: ["\u2212", exam.negative_marks] }), _jsxs("div", { className: "text-xs text-slate-500", children: ["Max: ", exam.total_marks] })] }), _jsx("td", { children: exam.status === 'published' ? (_jsx("button", { className: "badge badge-success cursor-pointer", onClick: () => handleTogglePublish(exam), title: "Click to switch to Draft", children: "\u25CF Published" })) : (_jsx("button", { className: "badge badge-warning cursor-pointer", onClick: () => handleTogglePublish(exam), title: "Click to Publish", children: "\u25CB Draft" })) }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn-icon text-blue-600 hover:bg-blue-50", onClick: () => openEditModal(exam), title: "Edit", children: _jsx(Edit2, { size: 15 }) }), _jsx("button", { className: "btn-icon text-red-600 hover:bg-red-50", onClick: () => handleDelete(exam.id, exam.title), title: "Delete", children: _jsx(Trash2, { size: 15 }) })] }) })] }, exam.id))) })] }) })) }), isModalOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog modal-lg", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: editingExam ? 'Edit Exam Paper' : 'Create New Exam' }), _jsx("button", { className: "btn-close", onClick: () => setIsModalOpen(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSave, children: [_jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category *" }), _jsx("select", { className: "form-input", value: categoryId, onChange: (e) => setCategoryId(e.target.value), required: true, children: categories.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Exam Type *" }), _jsxs("select", { className: "form-input", value: examType, onChange: (e) => setExamType(e.target.value), children: [_jsx("option", { value: "previous_year_paper", children: "Previous Year Paper" }), _jsx("option", { value: "mock_test", children: "Mock Test" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Exam Title *" }), _jsx("input", { type: "text", className: "form-input", value: title, placeholder: "e.g. SSC CGL T-1 \u2014 Held on 12 Sep 2025, Shift 1", onChange: (e) => {
                                                        setTitle(e.target.value);
                                                        if (!editingExam) {
                                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                                                        }
                                                    }, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Slug *" }), _jsx("input", { type: "text", className: "form-input", value: slug, onChange: (e) => setSlug(e.target.value), required: true })] }), _jsxs("div", { className: "grid-3-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Year" }), _jsx("input", { type: "number", className: "form-input", value: year, onChange: (e) => setYear(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Exam Date" }), _jsx("input", { type: "date", className: "form-input", value: examDate, onChange: (e) => setExamDate(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Shift / Session" }), _jsx("input", { type: "text", className: "form-input", value: session, onChange: (e) => setSession(e.target.value) })] })] }), _jsxs("div", { className: "grid-3-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Total Questions" }), _jsx("input", { type: "number", className: "form-input", value: totalQuestions, onChange: (e) => setTotalQuestions(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Duration (Minutes)" }), _jsx("input", { type: "number", className: "form-input", value: Math.round(totalDurationSeconds / 60), onChange: (e) => setTotalDurationSeconds(Number(e.target.value) * 60) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Total Marks" }), _jsx("input", { type: "number", className: "form-input", value: totalMarks, onChange: (e) => setTotalMarks(Number(e.target.value)) })] })] }), _jsxs("div", { className: "grid-3-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Positive Mark (+)" }), _jsx("input", { type: "number", step: "0.1", className: "form-input", value: positiveMarks, onChange: (e) => setPositiveMarks(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Negative Penalty (\u2212)" }), _jsx("input", { type: "number", step: "0.05", className: "form-input", value: negativeMarks, onChange: (e) => setNegativeMarks(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Publication Status" }), _jsxs("select", { className: "form-input", value: status, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "draft", children: "Draft (Private)" }), _jsx("option", { value: "published", children: "Published (Public)" }), _jsx("option", { value: "archived", children: "Archived" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Description" }), _jsx("textarea", { className: "form-input", rows: 2, value: description, onChange: (e) => setDescription(e.target.value) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary", children: editingExam ? 'Update Exam' : 'Save Exam' })] })] })] }) }))] }));
};
