import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: QUESTION MANAGEMENT & CSV IMPORT
// File: apps/admin/src/pages/QuestionsPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { Plus, Trash2, HelpCircle, Download, Upload, } from 'lucide-react';
import { adminService } from '../services/adminService';
export const QuestionsPage = () => {
    const [sections, setSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    // Form states
    const [questionNumber, setQuestionNumber] = useState(1);
    const [questionText, setQuestionText] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [topic, setTopic] = useState('Grammar');
    const [subtopic, setSubtopic] = useState('');
    const [marks, setMarks] = useState(2.0);
    const [negativeMarks, setNegativeMarks] = useState(0.5);
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    // CSV State
    const [csvContent, setCsvContent] = useState('');
    const loadData = async () => {
        setLoading(true);
        const secData = await adminService.getSections();
        setSections(secData);
        if (secData.length > 0) {
            const secId = selectedSectionId || secData[0].id;
            setSelectedSectionId(secId);
            loadQuestions(secId);
        }
        else {
            setLoading(false);
        }
    };
    const loadQuestions = async (secId) => {
        setLoading(true);
        const qData = await adminService.getQuestions(secId);
        setQuestions(qData);
        setQuestionNumber(qData.length + 1);
        setLoading(false);
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleSelectSection = (e) => {
        const secId = e.target.value;
        setSelectedSectionId(secId);
        loadQuestions(secId);
    };
    const handleOptionChange = (index, value) => {
        const next = [...options];
        next[index] = value;
        setOptions(next);
    };
    const openCreateModal = () => {
        setQuestionNumber(questions.length + 1);
        setQuestionText('');
        setDifficulty('medium');
        setTopic('Grammar');
        setSubtopic('');
        setMarks(2.0);
        setNegativeMarks(0.5);
        setExplanation('');
        setOptions(['', '', '', '']);
        setCorrectIndex(0);
        setIsModalOpen(true);
    };
    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!questionText || options.some((o) => !o.trim())) {
            alert('Please enter question text and all four options.');
            return;
        }
        await adminService.createQuestion({
            section_id: selectedSectionId,
            question_number: Number(questionNumber),
            question_text: questionText,
            difficulty,
            topic,
            subtopic,
            marks: Number(marks),
            negative_marks: Number(negativeMarks),
            explanation,
            solution_steps: [explanation],
            options,
            correctOptionIndex: correctIndex,
        });
        setIsModalOpen(false);
        loadQuestions(selectedSectionId);
    };
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this question?')) {
            await adminService.deleteQuestion(id);
            loadQuestions(selectedSectionId);
        }
    };
    // CSV Template generation
    const downloadTemplate = () => {
        const csvHeader = 'question_number,question_text,option_A,option_B,option_C,option_D,correct_option,difficulty,topic,subtopic,marks,negative_marks,explanation\n';
        const sampleRow = '1,"Select the synonym of METICULOUS","Painstaking","Careless","Hasty","Casual","A","easy","Vocabulary","Synonyms",2.0,0.5,"Meticulous means careful"\n';
        const blob = new Blob([csvHeader + sampleRow], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'vibhillion_questions_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleCsvImport = async () => {
        if (!csvContent.trim()) {
            alert('Please paste CSV content');
            return;
        }
        const lines = csvContent.split('\n').filter((l) => l.trim().length > 0);
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
            if (parts.length >= 7) {
                const correctOpt = parts[6].toUpperCase();
                let cIdx = 0;
                if (correctOpt === 'B')
                    cIdx = 1;
                else if (correctOpt === 'C')
                    cIdx = 2;
                else if (correctOpt === 'D')
                    cIdx = 3;
                await adminService.createQuestion({
                    section_id: selectedSectionId,
                    question_number: Number(parts[0]) || questions.length + imported + 1,
                    question_text: parts[1],
                    difficulty: parts[7] || 'medium',
                    topic: parts[8] || 'General',
                    subtopic: parts[9] || '',
                    marks: Number(parts[10]) || 2.0,
                    negative_marks: Number(parts[11]) || 0.5,
                    explanation: parts[12] || '',
                    options: [parts[2], parts[3], parts[4], parts[5]],
                    correctOptionIndex: cIdx,
                });
                imported++;
            }
        }
        setIsCsvModalOpen(false);
        setCsvContent('');
        loadQuestions(selectedSectionId);
        alert(`Successfully imported ${imported} questions!`);
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Question Management" }), _jsx("p", { className: "page-subtitle", children: "Author questions, configure 4 options, protect answers, and import via CSV" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn btn-secondary", onClick: downloadTemplate, title: "Download CSV format template", children: [_jsx(Download, { size: 16 }), _jsx("span", { children: "CSV Template" })] }), _jsxs("button", { className: "btn btn-secondary", onClick: () => setIsCsvModalOpen(true), children: [_jsx(Upload, { size: 16 }), _jsx("span", { children: "Import CSV" })] }), _jsxs("button", { className: "btn btn-primary", onClick: openCreateModal, children: [_jsx(Plus, { size: 16 }), _jsx("span", { children: "Add Question" })] })] })] }), _jsxs("div", { className: "content-card p-4 mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "text-sm font-bold text-slate-700", children: "Filter By Section:" }), _jsx("select", { className: "form-input max-w-sm", value: selectedSectionId, onChange: handleSelectSection, children: sections.map((sec) => (_jsx("option", { value: sec.id, children: sec.name }, sec.id))) })] }), _jsxs("div", { className: "text-sm font-semibold text-slate-600", children: ["Showing ", questions.length, " questions in section"] })] }), _jsx("div", { className: "space-y-4", children: loading ? (_jsx("div", { className: "content-card p-6 text-center text-slate-500", children: "Loading questions..." })) : questions.length === 0 ? (_jsxs("div", { className: "content-card p-8 text-center text-slate-500", children: [_jsx(HelpCircle, { size: 36, className: "mx-auto text-slate-300 mb-2" }), _jsx("p", { className: "font-semibold text-slate-700", children: "No questions added to this section yet." }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Click \"Add Question\" or \"Import CSV\" to upload questions." })] })) : (questions.map((q) => (_jsxs("div", { className: "content-card p-5", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "order-circle bg-blue-100 text-blue-700 font-bold", children: ["Q", q.question_number] }), _jsxs("div", { children: [_jsx("span", { className: "badge badge-info", children: q.topic }), q.subtopic && _jsxs("span", { className: "text-xs text-slate-500 ml-2", children: ["\u2022 ", q.subtopic] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "badge badge-success", children: ["+", q.marks, " / \u2212", q.negative_marks] }), _jsx("button", { className: "btn-icon text-red-600 hover:bg-red-50", onClick: () => handleDelete(q.id), title: "Delete Question", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsx("p", { className: "text-slate-800 font-medium text-base mb-4 leading-relaxed", children: q.question_text }), _jsx("div", { className: "grid-2-cols gap-2 mb-3", children: q.options?.map((opt) => {
                                const isCorrect = opt.id === q.correct_option_id;
                                return (_jsxs("div", { className: `p-3 rounded-lg border text-sm flex items-center justify-between ${isCorrect
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-700'}`, children: [_jsxs("span", { children: [_jsxs("strong", { className: "mr-2", children: [opt.option_label, "."] }), " ", opt.option_text] }), isCorrect && (_jsx("span", { className: "text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold", children: "Answer Key" }))] }, opt.id));
                            }) }), q.explanation && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 mt-2", children: [_jsx("strong", { children: "Explanation:" }), " ", q.explanation] }))] }, q.id)))) }), isModalOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog modal-lg", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: "Create New Question" }), _jsx("button", { className: "btn-close", onClick: () => setIsModalOpen(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSaveQuestion, children: [_jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("div", { className: "grid-3-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Question # *" }), _jsx("input", { type: "number", className: "form-input", value: questionNumber, onChange: (e) => setQuestionNumber(Number(e.target.value)), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Topic *" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. Grammar, Vocabulary", value: topic, onChange: (e) => setTopic(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Subtopic" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. Subject-Verb Agreement", value: subtopic, onChange: (e) => setSubtopic(e.target.value) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Question Text *" }), _jsx("textarea", { className: "form-input", rows: 3, placeholder: "Enter the complete question prompt...", value: questionText, onChange: (e) => setQuestionText(e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "form-label", children: "Four Answer Options (Select radio for correct answer) *" }), ['A', 'B', 'C', 'D'].map((label, idx) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "radio", name: "correctOption", checked: correctIndex === idx, onChange: () => setCorrectIndex(idx), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer", title: "Mark as correct answer" }), _jsxs("span", { className: "font-bold text-slate-700 w-6", children: [label, "."] }), _jsx("input", { type: "text", className: "form-input flex-1", placeholder: `Option ${label} text...`, value: options[idx], onChange: (e) => handleOptionChange(idx, e.target.value), required: true })] }, label)))] }), _jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Marks for Correct (+)" }), _jsx("input", { type: "number", step: "0.1", className: "form-input", value: marks, onChange: (e) => setMarks(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Negative Penalty (\u2212)" }), _jsx("input", { type: "number", step: "0.05", className: "form-input", value: negativeMarks, onChange: (e) => setNegativeMarks(Number(e.target.value)) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Detailed Solution & Explanation" }), _jsx("textarea", { className: "form-input", rows: 3, placeholder: "Provide official grammatical rule or mathematical steps...", value: explanation, onChange: (e) => setExplanation(e.target.value) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary", children: "Save Question & Protect Key" })] })] })] }) })), isCsvModalOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog modal-lg", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: "Bulk Import Questions from CSV" }), _jsx("button", { className: "btn-close", onClick: () => setIsCsvModalOpen(false), children: "\u00D7" })] }), _jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("p", { className: "text-sm text-slate-600", children: ["Paste CSV data below matching the columns:", _jsx("br", {}), _jsx("code", { className: "text-xs bg-slate-100 p-1 rounded font-mono", children: "question_number,question_text,option_A,option_B,option_C,option_D,correct_option,difficulty,topic,subtopic,marks,negative_marks,explanation" })] }), _jsx("textarea", { className: "form-input font-mono text-xs", rows: 10, placeholder: "Paste CSV rows here...", value: csvContent, onChange: (e) => setCsvContent(e.target.value) })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-secondary", onClick: () => setIsCsvModalOpen(false), children: "Cancel" }), _jsx("button", { className: "btn btn-primary", onClick: handleCsvImport, children: "Import Rows into Current Section" })] })] }) }))] }));
};
