// ==============================================================================
// VIBHILLION ADMIN: CATEGORY MANAGEMENT PAGE
// File: apps/admin/src/pages/CategoriesPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { Category } from '@vibhillion/shared';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    if (editingCategory) {
      await adminService.updateCategory(editingCategory.id, {
        name,
        slug,
        description,
        display_order: Number(displayOrder),
        is_active: isActive,
      });
    } else {
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

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      await adminService.deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Configure competitive exam categories and public stream visibility</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading categories...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-semibold text-slate-700">#{cat.display_order}</td>
                    <td>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Layers size={16} className="text-blue-500" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td><span className="code-pill">{cat.slug}</span></td>
                    <td className="text-sm text-slate-500 max-w-xs">{cat.description || '—'}</td>
                    <td>
                      {cat.is_active ? (
                        <span className="badge badge-success flex items-center gap-1 w-max">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-danger flex items-center gap-1 w-max">
                          <XCircle size={12} /> Disabled
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-icon text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditModal(cat)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SSC, Banking, Railways"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingCategory) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug * (Unique URL identifier)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ssc, banking"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Description of competitive exams under this category"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid-2-cols">
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm font-semibold text-slate-700">Category Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
