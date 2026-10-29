import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: SECTION MANAGEMENT PAGE
// File: apps/admin/src/pages/SectionsPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, CheckCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
export const SectionsPage = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    // Form Fields
    const [name, setName] = useState('');
    const [displayOrder, setDisplayOrder] = useState(1);
    const [questionCount, setQuestionCount] = useState(25);
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [marksPerCorrect, setMarksPerCorrect] = useState(2.0);
    const [negativeMarks, setNegativeMarks] = useState(0.5);
    const loadExams = async () => {
        setLoading(true);
        const examData = await adminService.getExams();
        setExams(examData);
        if (examData.length > 0) {
            const firstId = examData[0].id;
            setSelectedExamId(firstId);
            loadSections(firstId);
        }
        else {
            setLoading(false);
        }
    };
    const loadSections = async (examId) => {
        setLoading(true);
        const secData = await adminService.getSections(examId);
        setSections(secData);
        setLoading(false);
    };
    useEffect(() => {
        loadExams();
    }, []);
    const handleSelectExam = (e) => {
        const id = e.target.value;
        setSelectedExamId(id);
        loadSections(id);
    };
    const openCreateModal = () => {
        setEditingSection(null);
        setName('');
        setDisplayOrder(sections.length + 1);
        setQuestionCount(25);
        setDurationMinutes(15);
        setMarksPerCorrect(2.0);
        setNegativeMarks(0.5);
        setIsModalOpen(true);
    };
    const openEditModal = (sec) => {
        setEditingSection(sec);
        setName(sec.name);
        setDisplayOrder(sec.display_order);
        setQuestionCount(sec.question_count);
        setDurationMinutes(Math.round(sec.duration_seconds / 60));
        setMarksPerCorrect(sec.marks_per_correct);
        setNegativeMarks(sec.negative_marks_per_wrong);
        setIsModalOpen(true);
    };
    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !selectedExamId)
            return;
        const payload = {
            exam_id: selectedExamId,
            name,
            display_order: Number(displayOrder),
            question_count: Number(questionCount),
            duration_seconds: Number(durationMinutes) * 60,
            marks_per_correct: Number(marksPerCorrect),
            negative_marks_per_wrong: Number(negativeMarks),
        };
        if (editingSection) {
            await adminService.updateSection(editingSection.id, payload);
        }
        else {
            await adminService.createSection(payload);
        }
        setIsModalOpen(false);
        loadSections(selectedExamId);
    };
    const handleDelete = async (id, secName) => {
        if (confirm(`Delete section "${secName}"? Questions inside will also be removed.`)) {
            await adminService.deleteSection(id);
            loadSections(selectedExamId);
        }
    };
    // Calculations & Validations
    const totalConfiguredQuestions = sections.reduce((acc, s) => acc + s.question_count, 0);
    const totalConfiguredDuration = sections.reduce((acc, s) => acc + s.duration_seconds, 0);
    const activeExam = exams.find((e) => e.id === selectedExamId);
    const isQuestionsMatch = activeExam ? totalConfiguredQuestions === activeExam.total_questions : true;
    const isDurationMatch = activeExam ? totalConfiguredDuration === activeExam.total_duration_seconds : true;
    return (_jsxs("div", { className: "page-wrapper", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Section Management" }), _jsx("p", { className: "page-subtitle", children: "Configure test sections, independent question allocations, and timers" })] }), _jsxs("button", { className: "btn btn-primary", onClick: openCreateModal, children: [_jsx(Plus, { size: 16 }), _jsx("span", { children: "Add Section" })] })] }), _jsxs("div", { className: "content-card p-4 mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "text-sm font-bold text-slate-700", children: "Select Exam Paper:" }), _jsx("select", { className: "form-input max-w-md", value: selectedExamId, onChange: handleSelectExam, children: exams.map((ex) => (_jsx("option", { value: ex.id, children: ex.title }, ex.id))) })] }), _jsxs("div", { className: "text-sm text-slate-500", children: ["Showing ", _jsx("strong", { children: sections.length }), " configured sections"] })] }), _jsxs("div", { className: "grid-2-cols mb-4", children: [_jsxs("div", { className: `validation-box ${isQuestionsMatch ? 'validation-valid' : 'validation-warning'}`, children: [isQuestionsMatch ? _jsx(CheckCircle, { size: 18 }) : _jsx(AlertCircle, { size: 18 }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-sm", children: "Question Count Verification" }), _jsxs("p", { className: "text-xs", children: ["Configured: ", _jsxs("strong", { children: [totalConfiguredQuestions, " Qs"] }), " \u2022 Exam Total: ", _jsxs("strong", { children: [activeExam?.total_questions || 100, " Qs"] })] })] })] }), _jsxs("div", { className: `validation-box ${isDurationMatch ? 'validation-valid' : 'validation-warning'}`, children: [isDurationMatch ? _jsx(CheckCircle, { size: 18 }) : _jsx(AlertCircle, { size: 18 }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-sm", children: "Duration Compatibility" }), _jsxs("p", { className: "text-xs", children: ["Sum of Sections: ", _jsxs("strong", { children: [Math.round(totalConfiguredDuration / 60), " Mins"] }), " \u2022 Exam Total: ", _jsxs("strong", { children: [Math.round((activeExam?.total_duration_seconds || 3600) / 60), " Mins"] })] })] })] })] }), _jsx("div", { className: "content-card", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading sections..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order" }), _jsx("th", { children: "Section Name" }), _jsx("th", { children: "Questions" }), _jsx("th", { children: "Sectional Timer" }), _jsx("th", { children: "Marks Pattern" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: sections.map((sec) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { className: "order-circle", children: sec.display_order }) }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2 font-bold text-slate-900", children: [_jsx(FolderTree, { size: 16, className: "text-blue-500" }), _jsx("span", { children: sec.name })] }) }), _jsx("td", { children: _jsxs("span", { className: "font-semibold text-slate-800", children: [sec.question_count, " Questions"] }) }), _jsx("td", { children: _jsxs("span", { className: "badge badge-info", children: [Math.round(sec.duration_seconds / 60), " Mins (", sec.duration_seconds, "s)"] }) }), _jsxs("td", { children: [_jsxs("span", { className: "text-sm font-semibold text-emerald-600", children: ["+", sec.marks_per_correct] }), _jsx("span", { className: "text-xs text-slate-400", children: " / " }), _jsxs("span", { className: "text-sm font-semibold text-red-500", children: ["\u2212", sec.negative_marks_per_wrong] })] }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn-icon text-blue-600 hover:bg-blue-50", onClick: () => openEditModal(sec), title: "Edit", children: _jsx(Edit2, { size: 15 }) }), _jsx("button", { className: "btn-icon text-red-600 hover:bg-red-50", onClick: () => handleDelete(sec.id, sec.name), title: "Delete", children: _jsx(Trash2, { size: 15 }) })] }) })] }, sec.id))) })] }) })) }), isModalOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: editingSection ? 'Edit Test Section' : 'Add Test Section' }), _jsx("button", { className: "btn-close", onClick: () => setIsModalOpen(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSave, children: [_jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Section Name *" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. English Comprehension", value: name, onChange: (e) => setName(e.target.value), required: true })] }), _jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Display Sequence" }), _jsx("input", { type: "number", className: "form-input", value: displayOrder, onChange: (e) => setDisplayOrder(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Question Count" }), _jsx("input", { type: "number", className: "form-input", value: questionCount, onChange: (e) => setQuestionCount(Number(e.target.value)) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Section Duration (Minutes)" }), _jsx("input", { type: "number", className: "form-input", value: durationMinutes, onChange: (e) => setDurationMinutes(Number(e.target.value)) })] }), _jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Marks Per Correct (+)" }), _jsx("input", { type: "number", step: "0.1", className: "form-input", value: marksPerCorrect, onChange: (e) => setMarksPerCorrect(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Penalty Per Incorrect (\u2212)" }), _jsx("input", { type: "number", step: "0.05", className: "form-input", value: negativeMarks, onChange: (e) => setNegativeMarks(Number(e.target.value)) })] })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary", children: editingSection ? 'Update Section' : 'Create Section' })] })] })] }) }))] }));
};
