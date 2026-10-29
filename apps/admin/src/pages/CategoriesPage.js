import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: CATEGORY MANAGEMENT PAGE
// File: apps/admin/src/pages/CategoriesPage.tsx
// ==============================================================================
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
export const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [displayOrder, setDisplayOrder] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const loadCategories = () => {
        setLoading(true);
        adminService.getCategories().then((data) => {
            setCategories(data);
            setLoading(false);
        });
    };
    useEffect(() => {
        loadCategories();
    }, []);
    const openCreateModal = () => {
        setEditingCategory(null);
        setName('');
        setSlug('');
        setDescription('');
        setDisplayOrder(categories.length + 1);
        setIsActive(true);
        setIsModalOpen(true);
    };
    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setDisplayOrder(cat.display_order);
        setIsActive(cat.is_active);
        setIsModalOpen(true);
    };
    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !slug)
            return;
        if (editingCategory) {
            await adminService.updateCategory(editingCategory.id, {
                name,
                slug,
                description,
                display_order: Number(displayOrder),
                is_active: isActive,
            });
        }
        else {
            await adminService.createCategory({
                name,
                slug,
                description,
                display_order: Number(displayOrder),
                is_active: isActive,
            });
        }
        setIsModalOpen(false);
        loadCategories();
    };
    const handleDelete = async (id, catName) => {
        if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
            await adminService.deleteCategory(id);
            loadCategories();
        }
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Category Management" }), _jsx("p", { className: "page-subtitle", children: "Configure competitive exam categories and public stream visibility" })] }), _jsxs("button", { className: "btn btn-primary", onClick: openCreateModal, children: [_jsx(Plus, { size: 16 }), _jsx("span", { children: "Add New Category" })] })] }), _jsx("div", { className: "content-card", children: loading ? (_jsx("div", { className: "p-6 text-center text-slate-500", children: "Loading categories..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order" }), _jsx("th", { children: "Category Name" }), _jsx("th", { children: "Slug" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: categories.map((cat) => (_jsxs("tr", { children: [_jsxs("td", { className: "font-semibold text-slate-700", children: ["#", cat.display_order] }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2 font-bold text-slate-900", children: [_jsx(Layers, { size: 16, className: "text-blue-500" }), _jsx("span", { children: cat.name })] }) }), _jsx("td", { children: _jsx("span", { className: "code-pill", children: cat.slug }) }), _jsx("td", { className: "text-sm text-slate-500 max-w-xs", children: cat.description || '—' }), _jsx("td", { children: cat.is_active ? (_jsxs("span", { className: "badge badge-success flex items-center gap-1 w-max", children: [_jsx(CheckCircle2, { size: 12 }), " Active"] })) : (_jsxs("span", { className: "badge badge-danger flex items-center gap-1 w-max", children: [_jsx(XCircle, { size: 12 }), " Disabled"] })) }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn-icon text-blue-600 hover:bg-blue-50", onClick: () => openEditModal(cat), title: "Edit", children: _jsx(Edit2, { size: 15 }) }), _jsx("button", { className: "btn-icon text-red-600 hover:bg-red-50", onClick: () => handleDelete(cat.id, cat.name), title: "Delete", children: _jsx(Trash2, { size: 15 }) })] }) })] }, cat.id))) })] }) })) }), isModalOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-dialog", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: editingCategory ? 'Edit Category' : 'Create New Category' }), _jsx("button", { className: "btn-close", onClick: () => setIsModalOpen(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSave, children: [_jsxs("div", { className: "modal-body space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category Name *" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. SSC, Banking, Railways", value: name, onChange: (e) => {
                                                        setName(e.target.value);
                                                        if (!editingCategory) {
                                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                                        }
                                                    }, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Slug * (Unique URL identifier)" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. ssc, banking", value: slug, onChange: (e) => setSlug(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Description" }), _jsx("textarea", { className: "form-input", rows: 3, placeholder: "Description of competitive exams under this category", value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: "grid-2-cols", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Display Order" }), _jsx("input", { type: "number", className: "form-input", value: displayOrder, onChange: (e) => setDisplayOrder(Number(e.target.value)) })] }), _jsx("div", { className: "form-group flex items-center pt-6", children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: isActive, onChange: (e) => setIsActive(e.target.checked), className: "rounded text-blue-600 focus:ring-blue-500 h-4 w-4" }), _jsx("span", { className: "text-sm font-semibold text-slate-700", children: "Category Active" })] }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary", children: editingCategory ? 'Update Category' : 'Save Category' })] })] })] }) }))] }));
};
