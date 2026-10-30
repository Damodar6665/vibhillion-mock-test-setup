// ==============================================================================
// VIBHILLION ADMIN: ANSWER KEYS, AUDIT LOG & RE-EVALUATION
// File: apps/admin/src/pages/SolutionsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { adminService } from '../services/adminService';

export const SolutionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
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

  const openReevalModal = (q: any) => {
    setSelectedQuestion(q);
    setNewOptionId(q.correct_option_id || (q.options && q.options[0]?.id) || '');
    setReason('');
    setIsModalOpen(true);
  };

  const handleExecuteReevaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !newOptionId || !reason.trim()) {
      alert('Please select the new correct option and provide a justification reason.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await adminService.updateAnswerKeyWithAudit(
        selectedQuestion.id,
        newOptionId,
        reason
      );
      setIsProcessing(false);
      setIsModalOpen(false);
      alert(`Answer key updated successfully! ${res.count} affected candidate attempts were re-evaluated and scores updated atomically.`);
      loadData();
    } catch (err: any) {
      setIsProcessing(false);
      alert(`Error updating answer key: ${err.message}`);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Answer Keys & Audit Re-evaluation</h1>
          <p className="page-subtitle">
            Secure answer key administration. Updates record audit entries and trigger safe, transparent re-evaluations.
          </p>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="validation-box validation-warning mb-6">
        <AlertTriangle size={24} className="text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Protected Answer Key Security Policy</h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Answer keys are protected by PostgreSQL Row Level Security (RLS) and never queried by candidates during live timed tests.
            When an official representation is accepted and an answer key changes, historical attempts are re-evaluated transparently
            via the server RPC function <code className="bg-amber-100 px-1 rounded">reevaluate_exam_attempts</code> with audit tracking.
          </p>
        </div>
      </div>

      <div className="grid-2-cols gap-6">
        {/* Active Questions & Keys */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Questions & Current Answer Keys</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-slate-500 text-sm">Loading question keys...</p>
            ) : questions.map((q) => {
              const correctOpt = q.options?.find((o: any) => o.id === q.correct_option_id);
              return (
                <div key={q.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Q{q.question_number}
                      </span>
                      <span className="text-xs text-slate-500">{q.topic}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium line-clamp-2">{q.question_text}</p>
                    <div className="mt-2 text-xs">
                      <span className="text-slate-500">Official Key: </span>
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Option {correctOpt?.option_label}: {correctOpt?.option_text}
                      </strong>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm flex items-center gap-1 flex-shrink-0"
                    onClick={() => openReevalModal(q)}
                  >
                    <RefreshCw size={12} />
                    <span>Revise Key</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Answer Key Audit Trail</h2>
            <History size={16} className="text-slate-400" />
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {auditLog.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No historical answer key revisions recorded yet.</p>
            ) : auditLog.map((log) => (
              <div key={log.id} className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{log.changed_by_name || 'Admin'}</span>
                  <span>{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">
                  Answer changed: Option {log.old_correct_label || 'A'} → Option {log.new_correct_label || 'B'}
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <strong>Justification:</strong> {log.reason}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                  <CheckCircle2 size={12} />
                  <span>{log.reevaluated_attempts_count} candidate attempts re-evaluated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RE-EVALUATION MODAL */}
      {isModalOpen && selectedQuestion && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Revise Answer Key & Re-evaluate</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleExecuteReevaluation}>
              <div className="modal-body space-y-4">
                <div>
                  <span className="text-xs font-bold text-blue-600">Question #{selectedQuestion.question_number}</span>
                  <p className="text-sm text-slate-800 font-medium mt-1">{selectedQuestion.question_text}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Select New Correct Option *</label>
                  <select
                    className="form-input"
                    value={newOptionId}
                    onChange={(e) => setNewOptionId(e.target.value)}
                    required
                  >
                    {selectedQuestion.options?.map((opt: any) => (
                      <option key={opt.id} value={opt.id}>
                        Option {opt.option_label}: {opt.option_text}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Audit Justification / Reason *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Official SSC answer key challenge accepted. Question ambiguity reviewed by subject matter expert."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded text-xs text-amber-900 border border-amber-200">
                  <strong>Warning:</strong> Submitting will atomically re-evaluate all submitted student attempts that answered this question and recalculate their final scores.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary bg-amber-600 hover:bg-amber-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Re-evaluating Attempts...' : 'Confirm & Re-evaluate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

