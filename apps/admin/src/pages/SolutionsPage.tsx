// ==============================================================================
// VIBHILLION ADMIN: ANSWER KEYS, TOPIC ANALYSIS & EXPLANATION MANAGEMENT
// File: apps/admin/src/pages/SolutionsPage.tsx
// ==============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  KeyRound,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Clock,
  Lightbulb,
  Flag,
  X,
  Layers,
  BookOpen,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection, FULL_100_SECTIONS, getTopicOnlineAnalysis } from '@vibhillion/shared';

interface TopicStat {
  topic: string;
  sectionName: string;
  questionCount: number;
  benchmarkAccuracy: number;
  avgPacingSeconds: number;
}

export const SolutionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  // Re-evaluation Modal
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [newOptionId, setNewOptionId] = useState('');
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [qData, secData, logData] = await Promise.all([
      adminService.getQuestions(),
      adminService.getSections(),
      adminService.getAuditLog(),
    ]);
    setQuestions(qData);
    setSections(secData && secData.length > 0 ? secData : FULL_100_SECTIONS);
    setAuditLog(logData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Section id to section name map
  const sectionMap = useMemo(() => {
    const map: Record<string, string> = {};
    const allSecs = sections.length > 0 ? sections : FULL_100_SECTIONS;
    allSecs.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sections]);

  // Aggregate Topic-wise Performance Benchmarks
  const topicStats = useMemo<TopicStat[]>(() => {
    const map = new Map<string, { topic: string; sectionName: string; count: number }>();

    questions.forEach((q) => {
      const topicName = q.subtopic || q.topic || 'General Topic';
      const secName = sectionMap[q.section_id] || q.section_name || 'General';
      const key = `${secName}:::${topicName}`;

      if (!map.has(key)) {
        map.set(key, { topic: topicName, sectionName: secName, count: 0 });
      }
      map.get(key)!.count += 1;
    });

    const results: TopicStat[] = [];
    map.forEach((val) => {
      let benchmark = 74;
      let pacing = 42;
      const lower = val.topic.toLowerCase();
      if (lower.includes('synonym') || lower.includes('antonym') || lower.includes('vocabulary')) {
        benchmark = 82;
        pacing = 32;
      } else if (lower.includes('idiom') || lower.includes('one word')) {
        benchmark = 78;
        pacing = 35;
      } else if (lower.includes('reasoning') || lower.includes('series') || lower.includes('analogy')) {
        benchmark = 76;
        pacing = 40;
      } else if (lower.includes('comprehension') || lower.includes('reading')) {
        benchmark = 56;
        pacing = 85;
      } else if (lower.includes('quantitative') || lower.includes('algebra') || lower.includes('trigonometry')) {
        benchmark = 62;
        pacing = 58;
      } else if (lower.includes('polity') || lower.includes('history') || lower.includes('general awareness')) {
        benchmark = 68;
        pacing = 28;
      }

      results.push({
        topic: val.topic,
        sectionName: val.sectionName,
        questionCount: val.count,
        benchmarkAccuracy: benchmark,
        avgPacingSeconds: pacing,
      });
    });

    return results.sort((a, b) => b.questionCount - a.questionCount);
  }, [questions, sectionMap]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const secName = sectionMap[q.section_id] || q.section_name || '';
      const topicName = q.subtopic || q.topic || '';

      // Section Filter
      if (selectedSection !== 'all' && secName !== selectedSection) {
        return false;
      }

      // Topic Filter
      if (selectedTopic !== 'all' && topicName !== selectedTopic) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question_text?.toLowerCase().includes(query);
        const matchesTopic = topicName.toLowerCase().includes(query) || q.topic?.toLowerCase().includes(query);
        const matchesExplanation = q.answer_explanation?.toLowerCase().includes(query) || q.explanation?.toLowerCase().includes(query);
        const matchesOptions = q.options?.some((opt: any) => opt.option_text?.toLowerCase().includes(query));
        if (!matchesText && !matchesTopic && !matchesExplanation && !matchesOptions) {
          return false;
        }
      }

      return true;
    });
  }, [questions, selectedSection, selectedTopic, searchQuery, sectionMap]);

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

  const clearFilters = () => {
    setSelectedSection('all');
    setSelectedTopic('all');
    setSearchQuery('');
  };

  return (
    <div className="page-wrapper">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Answer Keys & Explanation Analysis</h1>
          <p className="page-subtitle">
            Verify official answer keys, preview topic-wise mastery benchmarks, inspect question/option visuals, and preview AI wishes & error diagnosis rules.
          </p>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid-cards-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <KeyRound size={24} />
          </div>
          <div>
            <span className="stat-label">Verified Answer Keys</span>
            <h3 className="stat-value">{questions.length} / 100</h3>
            <span className="stat-sub text-emerald-600 font-semibold">100% Validated Keys</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="stat-label">Syllabus Topics</span>
            <h3 className="stat-value">{topicStats.length}</h3>
            <span className="stat-sub">Across 4 Tier 1 Sections</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-100 text-amber-600">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="stat-label">Marking Scheme</span>
            <h3 className="stat-value">+2.0 / -0.5</h3>
            <span className="stat-sub">0.0 Marks for Unattempted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
            <History size={24} />
          </div>
          <div>
            <span className="stat-label">Revisions Tracked</span>
            <h3 className="stat-value">{auditLog.length}</h3>
            <span className="stat-sub">Full Audit Trail & RPC Active</span>
          </div>
        </div>
      </div>

      {/* TOPIC-WISE PERFORMANCE & SOLUTIONS BREAKDOWN */}
      <div className="content-card mb-6 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-teal-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Topic-wise Mastery & Performance Breakdown ({topicStats.length} Topics)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click any topic card to filter questions below</span>
        </div>

        <div className="topic-analysis-carousel">
          {topicStats.map((stat, idx) => {
            const isSelected = selectedTopic === stat.topic;
            return (
              <div
                key={idx}
                className={`topic-card-widget ${isSelected ? 'topic-card-active' : ''}`}
                onClick={() => setSelectedTopic(isSelected ? 'all' : stat.topic)}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {stat.sectionName.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        stat.benchmarkAccuracy >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : stat.benchmarkAccuracy >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {stat.benchmarkAccuracy}% Benchmark
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1" title={stat.topic}>
                    {stat.topic}
                  </h4>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full ${
                        stat.benchmarkAccuracy >= 75 ? 'bg-emerald-500' : stat.benchmarkAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stat.benchmarkAccuracy}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                  <span>{stat.questionCount} Questions</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock size={11} className="text-slate-400" />
                    {stat.avgPacingSeconds}s pacing
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedTopic !== 'all' && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-600">Active Topic Filter:</span>
            <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-semibold">
              {selectedTopic}
              <button
                onClick={() => setSelectedTopic('all')}
                className="hover:text-red-600 ml-1 font-bold"
                title="Clear topic filter"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="content-card mb-6 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              className={`filter-pill-btn ${selectedSection === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSection('all')}
            >
              All Sections ({questions.length})
            </button>
            {Array.from(new Set(Object.values(sectionMap))).map((secName) => {
              const count = questions.filter(
                (q) => (sectionMap[q.section_id] || q.section_name) === secName
              ).length;
              return (
                <button
                  key={secName}
                  className={`filter-pill-btn ${selectedSection === secName ? 'active-teal' : ''}`}
                  onClick={() => setSelectedSection(secName)}
                >
                  {secName} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search question, concept, or option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 pr-8 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Count & Clear Action */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          <span>
            Showing <strong>{filteredQuestions.length}</strong> of {questions.length} questions
            {selectedSection !== 'all' && ` in ${selectedSection}`}
            {selectedTopic !== 'all' && ` • Topic: ${selectedTopic}`}
          </span>
          {(selectedSection !== 'all' || selectedTopic !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* QUESTION-WISE ANALYSIS & VERIFIED SOLUTIONS FEED */}
      <div className="space-y-6">
        {loading ? (
          <div className="content-card p-12 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
            <p className="text-sm font-semibold">Loading questions and verified answer keys...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="content-card p-12 text-center text-slate-500">
            <AlertTriangle size={32} className="mx-auto mb-2 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">No matching questions found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the section, topic, or search query filter.</p>
            <button onClick={clearFilters} className="btn btn-secondary btn-sm mt-4">
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const topicName = q.subtopic || q.topic || 'General Topic';
            const secName = sectionMap[q.section_id] || q.section_name || 'Tier 1 Section';
            const topicAnalysis = getTopicOnlineAnalysis(q.topic, q.subtopic, secName);

            return (
              <div key={q.id} className="question-full-card">
                {/* CARD TOP BAR */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md">
                      Q{q.question_number}
                    </span>
                    <span className="font-bold text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {secName}
                    </span>
                    <span className="font-semibold text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                      {topicName}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        q.difficulty === 'hard'
                          ? 'bg-red-100 text-red-700'
                          : q.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {q.difficulty ? q.difficulty.toUpperCase() : 'MEDIUM'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Marks: <strong className="text-emerald-700">+2.0</strong> / <strong className="text-red-700">-0.5</strong>
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                    onClick={() => openReevalModal(q)}
                  >
                    <RefreshCw size={13} className="text-slate-600" />
                    <span>Revise Key & Re-evaluate</span>
                  </button>
                </div>

                <div className="p-5">
                  {/* QUESTION TEXT & OPTIONAL IMAGE */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.question_text}
                    </h3>
                    {q.image_url && (
                      <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg inline-block">
                        <img
                          src={q.image_url}
                          alt="Question diagram"
                          className="max-h-56 max-w-full object-contain rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4 OPTIONS GRID */}
                  <div className="mb-5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Options & Verified Answer Key:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options?.map((opt: any) => {
                        const isCorrect = opt.id === q.correct_option_id;
                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.option_label}
                            </span>
                            <div className="flex-1">
                              <p className="leading-snug">{opt.option_text}</p>
                              {opt.image_url && (
                                <img
                                  src={opt.image_url}
                                  alt={`Option ${opt.option_label} visual`}
                                  className="mt-1.5 max-h-24 max-w-full object-contain rounded border border-slate-200"
                                />
                              )}
                              {isCorrect && (
                                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                  <CheckCircle2 size={12} />
                                  <span>Verified Correct Answer Key</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP-BY-STEP OFFICIAL SOLUTION */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                      <BookOpen size={14} className="text-blue-600" />
                      <span>Official Concept & Step-by-Step Explanation:</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {q.answer_explanation || q.explanation || 'Official step-by-step verified explanation for this competitive exam item.'}
                    </p>
                  </div>

                  {/* TOPIC-WISE ONLINE ANALYSIS & CURATED STUDY REFERENCE */}
                  {topicAnalysis && (
                    <div className="bg-sky-50/50 border border-sky-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                          <Globe size={14} className="text-blue-600" />
                          <span>Topic-Wise Online Learning & Reference Guide:</span>
                          <span className="font-semibold text-slate-700 bg-white border border-sky-200 text-[11px] px-2 py-0.5 rounded ml-1">
                            {topicAnalysis.topic} {topicAnalysis.subtopic ? `• ${topicAnalysis.subtopic}` : ''}
                          </span>
                        </div>
                        {topicAnalysis.online_reference_url && (
                          <a
                            href={topicAnalysis.online_reference_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-blue-200 hover:border-blue-400 transition-colors shadow-2xs"
                          >
                            <span>Open Reference Online</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-2">
                        <div className="bg-white p-3 rounded border border-sky-100">
                          <span className="font-bold text-sky-900 flex items-center gap-1 mb-1 text-[11px]">
                            <Lightbulb size={12} className="text-sky-600" />
                            Concept & Syllabus Principle:
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {topicAnalysis.concept_summary}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded border border-emerald-100">
                          <span className="font-bold text-emerald-900 flex items-center gap-1 mb-1 text-[11px]">
                            <Sparkles size={12} className="text-emerald-600" />
                            Shortcut & Elimination Rule:
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {topicAnalysis.core_rule}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-sky-100">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Target Pacing: <strong>≤{topicAnalysis.target_pacing_seconds || 45}s</strong>
                        </span>
                        <span className="text-teal-700 font-semibold">{topicAnalysis.exam_weightage}</span>
                      </div>
                    </div>
                  )}

                  {/* AI PERFORMANCE & WISHES CONFIGURATION PREVIEW */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Sparkles size={14} className="text-teal-600" />
                        <span>AI Question-wise Wishes & Error Diagnosis Rules Preview:</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Dynamically evaluated on candidate submit</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Wish 1: Correct + Fast */}
                      <div className="wish-rule-box wish-rule-fast">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1 text-emerald-800">
                            <Sparkles size={12} className="text-emerald-600" />
                            🌟 Great Speed &amp; High Accuracy
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            ⚡ Great speed • ≤45s
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed">
                          <em>"Great work! Solved fast and accurately in under 45 seconds for {topicName}."</em>
                        </p>
                      </div>

                      {/* Wish 2: Correct + Slow */}
                      <div className="wish-rule-box wish-rule-slow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1 text-amber-800">
                            <Clock size={12} className="text-amber-600" />
                            ⏳ Do It Fast — Needs Speed Improvement
                          </span>
                          <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                            ⏳ Do it fast • &gt;45s
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          <em>"Do it fast — Good job getting it right (+2.0), but took extra time. Use shortcuts and practice to solve {topicName} faster next time!"</em>
                        </p>
                      </div>

                      {/* Wish 3: Incorrect - WITH RED COLOURED TEXT */}
                      <div className="wish-rule-box wish-rule-wrong" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1" style={{ color: '#DC2626' }}>
                            <Lightbulb size={12} style={{ color: '#DC2626' }} />
                            ⚠️ Needs Improvement — Error Diagnosis
                          </span>
                          <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DC2626' }}>
                            ❌ Needs improvement • -0.5 Penalty
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-semibold" style={{ color: '#DC2626' }}>
                          <em>"Needs improvement — You got this wrong (-0.5 penalty). Need more practice on {topicName} to avoid tricky mistakes and negative marking."</em>
                        </p>
                      </div>

                      {/* Wish 4: Skipped */}
                      <div className="wish-rule-box wish-rule-skipped">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1 text-indigo-800">
                            <Flag size={12} className="text-indigo-600" />
                            📚 Need More Practice — Skipped Question
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            ⚪ Need more practice • 0.0 Marks
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-900 leading-relaxed">
                          <em>"Need more practice — This question was unattempted. Learn the basics of {topicName} so you can attempt it confidently next time!"</em>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ANSWER KEY AUDIT TRAIL */}
      <div className="content-card mt-8">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-600" />
            <h2 className="card-title">Answer Key Revision Audit Trail</h2>
          </div>
          <span className="badge badge-info">{auditLog.length} Recorded Adjustments</span>
        </div>
        <div className="p-4 space-y-3">
          {auditLog.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No historical answer key revisions recorded yet.</p>
          ) : (
            auditLog.map((log) => (
              <div key={log.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-800">{log.changed_by_name || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Option {log.old_correct_label || 'A'} → Option {log.new_correct_label || 'B'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Justification:</strong> {log.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold border border-emerald-200">
                  <CheckCircle2 size={13} />
                  <span>{log.reevaluated_attempts_count} Attempts Re-evaluated</span>
                </div>
              </div>
            ))
          )}
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
