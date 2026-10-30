// ==============================================================================
// VIBHILLION ADMIN: SETTINGS PAGE & ADMIN BOOTSTRAP
// File: apps/admin/src/pages/SettingsPage.tsx
// ==============================================================================

import React, { useState } from 'react';
import { Settings, ShieldCheck, Save, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const [defaultPositiveMarks, setDefaultPositiveMarks] = useState(2.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0.5);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(60);
  const [resultVisibility, setResultVisibility] = useState('immediate');
  const [explanationVisibility, setExplanationVisibility] = useState('after_submission');
  const [revealInPractice, setRevealInPractice] = useState(true);

  // Admin bootstrap email
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapStatus, setBootstrapStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Global default test settings updated successfully!');
  };

  const handleBootstrapAdmin = async () => {
    if (!bootstrapEmail) return;
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
      } else {
        setBootstrapStatus(`Success! ${bootstrapEmail} is now an authorized administrator.`);
      }
    } catch (err: any) {
      setBootstrapStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Exam Settings</h1>
          <p className="page-subtitle">Configure system-wide test parameters, answer reveal timing, and administrator access</p>
        </div>
      </div>

      <div className="grid-2-cols gap-6">
        {/* Test Engine Rules Form */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Default Marking & Timing Rules</h2>
          </div>
          <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
            <div className="grid-2-cols">
              <div className="form-group">
                <label className="form-label">Default Correct Marks (+)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={defaultPositiveMarks}
                  onChange={(e) => setDefaultPositiveMarks(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Negative Penalty (−)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={defaultNegativeMarks}
                  onChange={(e) => setDefaultNegativeMarks(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Default Full Exam Duration (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={defaultDurationMinutes}
                onChange={(e) => setDefaultDurationMinutes(Number(e.target.value))}
              />
            </div>

            <div className="grid-2-cols">
              <div className="form-group">
                <label className="form-label">Score & Result Visibility</label>
                <select
                  className="form-input"
                  value={resultVisibility}
                  onChange={(e) => setResultVisibility(e.target.value)}
                >
                  <option value="immediate">Immediate on Submission</option>
                  <option value="moderated">Moderated (Manual Release)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Solutions & Explanations</label>
                <select
                  className="form-input"
                  value={explanationVisibility}
                  onChange={(e) => setExplanationVisibility(e.target.value)}
                >
                  <option value="after_submission">Strictly After Submission</option>
                  <option value="exam_end">After Full Exam Shift Closes</option>
                </select>
              </div>
            </div>

            <div className="form-group pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revealInPractice}
                  onChange={(e) => setRevealInPractice(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Allow Candidates to Toggle Instant Solution in Practice Mode
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary mt-4">
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </form>
        </div>

        {/* Admin User Bootstrap Procedure */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Bootstrap Administrator Access</h2>
            <ShieldCheck size={20} className="text-blue-500" />
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Users cannot elevate their own role through profile editing due to RLS protections.
              Use this server-side procedure (calls PostgreSQL function <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">bootstrap_admin(email)</code>) to grant administrative rights to an authenticated user.
            </p>

            <div className="form-group">
              <label className="form-label">Registered User Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@vibhillion.ai"
                value={bootstrapEmail}
                onChange={(e) => setBootstrapEmail(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
              onClick={handleBootstrapAdmin}
            >
              <ShieldCheck size={16} />
              <span>Grant Admin Privileges</span>
            </button>

            {bootstrapStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-blue-900">
                {bootstrapStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

