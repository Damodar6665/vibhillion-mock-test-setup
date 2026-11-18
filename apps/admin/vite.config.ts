import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';

const dataFilePath = path.resolve(import.meta.dirname, '../../packages/shared/src/data/live_exam_data.json');

function readLiveStore(): any {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read live store:', err);
  }
  return { exam: null, sections: [], questions: [] };
}

function writeLiveStore(data: any): void {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write live store:', err);
  }
}

function recalculateTotals(store: any, targetExamId?: string) {
  const examsList = store.exams && store.exams.length > 0 ? store.exams : (store.exam ? [store.exam] : []);
  const sections = store.sections || [];

  examsList.forEach((ex: any) => {
    if (targetExamId && ex.id !== targetExamId) return;
    const examSections = sections.filter((s: any) => s.exam_id === ex.id);
    if (examSections.length > 0) {
      ex.total_questions = examSections.reduce((acc: number, s: any) => acc + (Number(s.question_count) || 0), 0);
      ex.total_duration_seconds = examSections.reduce((acc: number, s: any) => acc + (Number(s.duration_seconds) || 0), 0);
      ex.total_marks = examSections.reduce(
        (acc: number, s: any) => acc + ((Number(s.question_count) || 0) * (Number(s.marks_per_correct) || 2.0)),
        0
      );
      ex.updated_at = new Date().toISOString();
    }
  });

  if (store.exam && (!targetExamId || store.exam.id === targetExamId)) {
    const matched = examsList.find((e: any) => e.id === store.exam.id);
    if (matched) {
      store.exam = { ...store.exam, ...matched };
    }
  }
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function liveSyncApiPlugin(): Plugin {
  return {
    name: 'live-sync-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url || '';
        if (!url.startsWith('/api')) {
          return next();
        }

        // Set CORS headers so student web app (port 8081) can communicate seamlessly
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        const [pathname, queryString] = url.split('?');
        const searchParams = new URLSearchParams(queryString || '');

        res.setHeader('Content-Type', 'application/json');

        const store = readLiveStore();

        // 1. GET entire store
        if (pathname === '/api/live-exam' && req.method === 'GET') {
          return res.end(JSON.stringify(store));
        }

        // 1.1 CATEGORIES
        if (pathname === '/api/categories' && req.method === 'GET') {
          const cats = (store.categories || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
          return res.end(JSON.stringify(cats));
        }
        if (pathname === '/api/categories' && req.method === 'POST') {
          const body = await parseBody(req);
          const newCat = {
            id: body.id || 'cat-' + Date.now(),
            name: body.name || 'New Category',
            slug: body.slug || (body.name || 'new-category').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: body.description || '',
            icon_url: body.icon_url || 'award',
            display_order: Number(body.display_order) || ((store.categories || []).length + 1),
            is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (!store.categories) store.categories = [];
          store.categories.push(newCat);
          writeLiveStore(store);
          return res.end(JSON.stringify(newCat));
        }
        if (pathname.startsWith('/api/categories/') && req.method === 'PUT') {
          const catId = pathname.replace('/api/categories/', '');
          const body = await parseBody(req);
          if (!store.categories) store.categories = [];
          const idx = store.categories.findIndex((c: any) => c.id === catId);
          if (idx !== -1) {
            store.categories[idx] = {
              ...store.categories[idx],
              ...body,
              updated_at: new Date().toISOString(),
            };
            writeLiveStore(store);
            return res.end(JSON.stringify(store.categories[idx]));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Category not found' }));
        }
        if (pathname.startsWith('/api/categories/') && req.method === 'DELETE') {
          const catId = pathname.replace('/api/categories/', '');
          if (!store.categories) store.categories = [];
          store.categories = store.categories.filter((c: any) => c.id !== catId);
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true }));
        }

        // 2. EXAMS
        if (pathname === '/api/exams' && req.method === 'GET') {
          const catId = searchParams.get('category_id');
          let examList = store.exams && store.exams.length > 0 ? store.exams : (store.exam ? [store.exam] : []);
          if (catId) {
            examList = examList.filter((e: any) => e.category_id === catId);
          }
          return res.end(JSON.stringify(examList));
        }
        if (pathname === '/api/exams' && req.method === 'POST') {
          const body = await parseBody(req);
          const newExam = {
            id: body.id || 'exam-' + Date.now(),
            category_id: body.category_id || store.categories?.[0]?.id || 'c0000001-0000-0000-0000-000000000001',
            title: body.title || 'Untitled Exam',
            slug: body.slug || (body.title || 'untitled-exam').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: body.description || '',
            exam_type: body.exam_type || 'mock_test',
            year: Number(body.year) || new Date().getFullYear(),
            exam_date: body.exam_date || new Date().toISOString().split('T')[0],
            session: body.session || 'Shift 1',
            total_questions: Number(body.total_questions) || 100,
            total_duration_seconds: Number(body.total_duration_seconds) || 3600,
            total_marks: Number(body.total_marks) || 200,
            positive_marks: Number(body.positive_marks) || 2.0,
            negative_marks: Number(body.negative_marks) || 0.5,
            status: body.status || 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (!store.exams) store.exams = store.exam ? [store.exam] : [];
          store.exams.push(newExam);
          if (!store.exam) store.exam = newExam;
          writeLiveStore(store);
          return res.end(JSON.stringify(newExam));
        }
        if (pathname.startsWith('/api/exams/') && req.method === 'PUT') {
          const examId = pathname.replace('/api/exams/', '');
          const body = await parseBody(req);
          if (!store.exams) store.exams = store.exam ? [store.exam] : [];
          const idx = store.exams.findIndex((e: any) => e.id === examId);
          if (idx !== -1) {
            store.exams[idx] = { ...store.exams[idx], ...body, updated_at: new Date().toISOString() };
            if (store.exam && store.exam.id === examId) {
              store.exam = { ...store.exam, ...body, updated_at: new Date().toISOString() };
            }
            writeLiveStore(store);
            return res.end(JSON.stringify(store.exams[idx]));
          }
          if (store.exam && store.exam.id === examId) {
            store.exam = { ...store.exam, ...body, updated_at: new Date().toISOString() };
            writeLiveStore(store);
            return res.end(JSON.stringify(store.exam));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Exam not found' }));
        }
        if (pathname.startsWith('/api/exams/') && req.method === 'DELETE') {
          const examId = pathname.replace('/api/exams/', '');
          if (!store.exams) store.exams = store.exam ? [store.exam] : [];
          store.exams = store.exams.filter((e: any) => e.id !== examId);
          if (store.exam && store.exam.id === examId) {
            store.exam = store.exams[0] || null;
          }
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true }));
        }

        // 2.1 ATOMIC SYNC EXAM QUESTION LIMIT & SECTION-WISE ALLOCATIONS
        if (pathname.match(/^\/api\/exams\/[^/]+\/sections\/sync$/) && req.method === 'POST') {
          const examId = pathname.replace('/api/exams/', '').replace('/sections/sync', '');
          const body = await parseBody(req);
          const incomingSections = Array.isArray(body.sections) ? body.sections : [];
          const totalQuestionsLimit = Number(body.total_questions) || incomingSections.reduce((a: number, s: any) => a + (Number(s.question_count) || 0), 0);

          if (!store.sections) store.sections = [];
          if (!store.exams) store.exams = store.exam ? [store.exam] : [];

          const otherSections = store.sections.filter((s: any) => s.exam_id !== examId);
          const syncedExamSections = incomingSections.map((s: any, idx: number) => {
            const existing = store.sections.find((exSec: any) => exSec.id === s.id && exSec.exam_id === examId);
            return {
              id: existing ? existing.id : (s.id || `sec-${examId}-${Date.now()}-${idx + 1}`),
              exam_id: examId,
              name: String(s.name || `Section ${idx + 1}`).trim(),
              display_order: Number(s.display_order) || (idx + 1),
              question_count: Math.max(0, Math.floor(Number(s.question_count) || 0)),
              duration_seconds: Number(s.duration_seconds) || 900,
              marks_per_correct: Number(s.marks_per_correct) || 2.0,
              negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
              created_at: existing?.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });

          store.sections = [...otherSections, ...syncedExamSections];

          // Update exam total_questions & totals
          const examIdx = store.exams.findIndex((e: any) => e.id === examId);
          if (examIdx !== -1) {
            store.exams[examIdx].total_questions = totalQuestionsLimit;
            store.exams[examIdx].total_marks = syncedExamSections.reduce(
              (acc: number, s: any) => acc + (s.question_count * s.marks_per_correct),
              0
            ) || (totalQuestionsLimit * (store.exams[examIdx].positive_marks || 2.0));
            store.exams[examIdx].updated_at = new Date().toISOString();
            if (store.exam && store.exam.id === examId) {
              store.exam = { ...store.exam, ...store.exams[examIdx] };
            }
          }

          writeLiveStore(store);
          return res.end(JSON.stringify({
            success: true,
            exam_id: examId,
            total_questions: totalQuestionsLimit,
            sections: syncedExamSections,
          }));
        }

        // 3. SECTIONS
        if (pathname === '/api/sections' && req.method === 'GET') {
          const examId = searchParams.get('exam_id');
          let list = [...(store.sections || [])];
          if (examId && examId !== 'all') {
            list = list.filter((s: any) => s.exam_id === examId);
          }
          const sorted = list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          return res.end(JSON.stringify(sorted));
        }
        if (pathname === '/api/sections' && req.method === 'POST') {
          const body = await parseBody(req);
          const targetExamId = body.exam_id || store.exam?.id;
          const newSec = {
            id: body.id || 'sec-' + Date.now(),
            exam_id: targetExamId,
            name: body.name || 'New Section',
            display_order: Number(body.display_order) || (store.sections.filter((s: any) => s.exam_id === targetExamId).length + 1),
            question_count: Number(body.question_count) || 25,
            duration_seconds: Number(body.duration_seconds) || 900,
            marks_per_correct: Number(body.marks_per_correct) || 2.0,
            negative_marks_per_wrong: Number(body.negative_marks_per_wrong) || 0.5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          store.sections.push(newSec);
          recalculateTotals(store, targetExamId);
          writeLiveStore(store);
          return res.end(JSON.stringify(newSec));
        }
        if (pathname.startsWith('/api/sections/') && req.method === 'PUT') {
          const sectionId = pathname.replace('/api/sections/', '');
          const body = await parseBody(req);
          const idx = store.sections.findIndex((s: any) => s.id === sectionId);
          if (idx !== -1) {
            store.sections[idx] = {
              ...store.sections[idx],
              ...body,
              question_count: body.question_count !== undefined ? Number(body.question_count) : store.sections[idx].question_count,
              duration_seconds: body.duration_seconds !== undefined ? Number(body.duration_seconds) : store.sections[idx].duration_seconds,
              marks_per_correct: body.marks_per_correct !== undefined ? Number(body.marks_per_correct) : store.sections[idx].marks_per_correct,
              negative_marks_per_wrong: body.negative_marks_per_wrong !== undefined ? Number(body.negative_marks_per_wrong) : store.sections[idx].negative_marks_per_wrong,
              updated_at: new Date().toISOString(),
            };
            recalculateTotals(store, store.sections[idx].exam_id);
            writeLiveStore(store);
            return res.end(JSON.stringify(store.sections[idx]));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Section not found' }));
        }
        if (pathname.startsWith('/api/sections/') && req.method === 'DELETE') {
          const sectionId = pathname.replace('/api/sections/', '');
          const existingSec = store.sections.find((s: any) => s.id === sectionId);
          store.sections = store.sections.filter((s: any) => s.id !== sectionId);
          store.questions = store.questions.filter((q: any) => q.section_id !== sectionId);
          recalculateTotals(store, existingSec?.exam_id);
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true }));
        }

        // 4. QUESTIONS
        if (pathname === '/api/questions' && req.method === 'GET') {
          const sectionId = searchParams.get('section_id');
          const examId = searchParams.get('exam_id');
          let list = store.questions || [];
          if (sectionId && sectionId !== 'all') {
            list = list.filter((q: any) => q.section_id === sectionId);
          }
          if (examId && examId !== 'all') {
            list = list.filter((q: any) => {
              if (q.exam_id === examId) return true;
              const sec = (store.sections || []).find((s: any) => s.id === q.section_id);
              return sec ? sec.exam_id === examId : (!q.exam_id && (examId === store.exam?.id || (store.exams && store.exams[0]?.id === examId)));
            });
          }
          return res.end(JSON.stringify(list));
        }

        // 4.1 BULK UPLOAD QUESTIONS VIA JSON (STRICT EXAM LIMIT + SECTION-WISE ALLOCATION)
        if (pathname === '/api/questions/bulk' && req.method === 'POST') {
          const body = await parseBody(req);
          const rawQuestions = Array.isArray(body) ? body : (Array.isArray(body.questions) ? body.questions : []);
          const replaceMode = Boolean(body.replace);

          if (!rawQuestions || rawQuestions.length === 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'No valid questions array found in JSON payload.' }));
          }

          const labels = ['A', 'B', 'C', 'D'];
          const targetExamId =
            body.exam_id ||
            rawQuestions[0]?.exam_id ||
            store.exams?.[0]?.id ||
            store.exam?.id;

          const examsList = store.exams && store.exams.length > 0 ? store.exams : (store.exam ? [store.exam] : []);
          const targetExam = examsList.find((e: any) => e.id === targetExamId);

          // Helper to identify questions belonging to targetExamId
          const isQuestionInExam = (q: any, exId: string) => {
            if (q.exam_id === exId) return true;
            const sec = (store.sections || []).find((s: any) => s.id === q.section_id);
            return sec ? sec.exam_id === exId : (!q.exam_id && (exId === store.exam?.id || (store.exams && store.exams[0]?.id === exId)));
          };

          const examSections = (store.sections || []).filter((s: any) => s.exam_id === targetExamId);
          const sections = examSections.length > 0 ? examSections : (store.sections || []);
          const defaultSectionId = sections[0]?.id || 'sec-default';

          // Enforce strict whole-exam question count limit!
          const configuredExamLimit = Math.max(
            1,
            Number(body.exam_question_limit) ||
            Number(targetExam?.total_questions) ||
            sections.reduce((acc: number, s: any) => acc + (Number(s.question_count) || 0), 0) ||
            100
          );

          const existingExamQuestions = replaceMode
            ? []
            : (store.questions || []).filter((q: any) => isQuestionInExam(q, targetExamId));

          const remainingExamCapacity = Math.max(0, configuredExamLimit - existingExamQuestions.length);

          if (remainingExamCapacity <= 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
              error: `Exam question limit reached (${existingExamQuestions.length}/${configuredExamLimit}). Enable "Replace existing questions" or increase the Exam Question Limit to upload more.`,
            }));
          }

          // Cap incoming questions strictly at remainingExamCapacity
          const cappedRawQuestions = rawQuestions.slice(0, remainingExamCapacity);
          const skippedExcessCount = Math.max(0, rawQuestions.length - cappedRawQuestions.length);

          const processed = cappedRawQuestions.map((item: any, idx: number) => {
            const qId = item.id || `q-bulk-${Date.now()}-${idx + 1}`;

            // Resolve section_id: by id or by section name (within target exam sections)
            let secId = item.section_id;
            if (!secId || !sections.some((s: any) => s.id === secId)) {
              const matchedSec = sections.find((s: any) =>
                item.section_name && s.name.toLowerCase().includes(item.section_name.toLowerCase())
              );
              secId = matchedSec ? matchedSec.id : defaultSectionId;
            }

            // Options mapping with image support
            let opts = item.options || [];
            if (Array.isArray(opts)) {
              opts = opts.map((opt: any, oIdx: number) => {
                const optText = typeof opt === 'string' ? opt : (opt.option_text || opt.text || '');
                const optImg = typeof opt === 'object' ? (opt.image_url || null) : null;
                const optId = (typeof opt === 'object' && opt.id) ? opt.id : `opt-${qId}-${oIdx}`;
                const optLabel = (typeof opt === 'object' && (opt.option_label || opt.label)) || labels[oIdx] || `${oIdx + 1}`;
                return {
                  id: optId,
                  question_id: qId,
                  option_label: optLabel,
                  option_text: optText,
                  image_url: optImg,
                  display_order: oIdx + 1,
                };
              });
            } else {
              opts = labels.map((lbl, oIdx) => ({
                id: `opt-${qId}-${oIdx}`,
                question_id: qId,
                option_label: lbl,
                option_text: `Option ${lbl}`,
                image_url: null,
                display_order: oIdx + 1,
              }));
            }

            // Correct Option identification
            let correctOptId = item.correct_option_id;
            if (!correctOptId) {
              if (item.correct_option_label) {
                const found = opts.find((o: any) => o.option_label.toUpperCase() === item.correct_option_label.toUpperCase());
                if (found) correctOptId = found.id;
              } else if (item.correct_index !== undefined && opts[item.correct_index]) {
                correctOptId = opts[item.correct_index].id;
              } else if (item.correctOptionIndex !== undefined && opts[item.correctOptionIndex]) {
                correctOptId = opts[item.correctOptionIndex].id;
              } else {
                correctOptId = opts[0]?.id;
              }
            }

            return {
              id: qId,
              exam_id: targetExamId,
              section_id: secId,
              question_number: Number(item.question_number) || (existingExamQuestions.length + idx + 1),
              question_text: item.question_text || item.text || 'Untitled Question',
              question_type: item.question_type || 'single_choice',
              difficulty: item.difficulty || 'medium',
              topic: item.topic || 'General Topic',
              subtopic: item.subtopic || '',
              marks: Number(item.marks) || 2.0,
              negative_marks: Number(item.negative_marks) || 0.5,
              explanation: item.explanation || item.answer_explanation || '',
              solution_steps: Array.isArray(item.solution_steps) ? item.solution_steps : (item.explanation ? [item.explanation] : []),
              image_url: item.image_url || null,
              options: opts,
              correct_option_id: correctOptId,
              answer_explanation: item.explanation || item.answer_explanation || '',
              created_at: item.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });

          if (replaceMode) {
            // Replace ONLY questions for the target exam, keeping other exams intact!
            const otherExamQuestions = (store.questions || []).filter((q: any) => !isQuestionInExam(q, targetExamId));
            store.questions = [...otherExamQuestions, ...processed];
          } else {
            // Append or upsert
            processed.forEach((newQ: any) => {
              const existingIdx = store.questions.findIndex((q: any) => q.id === newQ.id);
              if (existingIdx !== -1) {
                store.questions[existingIdx] = newQ;
              } else {
                store.questions.push(newQ);
              }
            });
          }

          // Preserve configured section question_count targets (do NOT shrink configured target quotas!)
          const sectionBreakdown = sections.map((sec: any) => ({
            section_id: sec.id,
            section_name: sec.name,
            target_count: Number(sec.question_count) || 0,
            uploaded_now: processed.filter((q: any) => q.section_id === sec.id).length,
            total_after: store.questions.filter((q: any) => q.section_id === sec.id).length,
          }));

          writeLiveStore(store);

          const finalExamQuestionsCount = store.questions.filter((q: any) => isQuestionInExam(q, targetExamId)).length;

          return res.end(JSON.stringify({
            success: true,
            uploaded_count: processed.length,
            skipped_excess_count: skippedExcessCount,
            exam_limit: configuredExamLimit,
            total_exam_questions: finalExamQuestionsCount,
            total_questions: store.questions.length,
            section_breakdown: sectionBreakdown,
            questions: store.questions,
          }));
        }

        if (pathname === '/api/questions' && req.method === 'POST') {
          const body = await parseBody(req);
          const targetExamId = body.exam_id || (store.sections.find((s: any) => s.id === body.section_id)?.exam_id) || store.exams?.[0]?.id || store.exam?.id;
          const examsList = store.exams && store.exams.length > 0 ? store.exams : (store.exam ? [store.exam] : []);
          const targetExam = examsList.find((e: any) => e.id === targetExamId);

          // Enforce whole exam question limit on single add too
          if (targetExam && targetExam.total_questions > 0) {
            const existingInExam = (store.questions || []).filter((q: any) => {
              if (q.exam_id === targetExamId) return true;
              const sec = (store.sections || []).find((s: any) => s.id === q.section_id);
              return sec ? sec.exam_id === targetExamId : false;
            });
            if (existingInExam.length >= Number(targetExam.total_questions)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({
                error: `Exam question limit reached (${existingInExam.length}/${targetExam.total_questions}). Increase the Exam Total Questions limit first.`,
              }));
            }
          }

          const qId = body.id || 'q-' + Date.now();
          const labels = ['A', 'B', 'C', 'D'];
          const options = (body.options || []).map((optItem: any, idx: number) => {
            const optText = typeof optItem === 'string' ? optItem : (optItem.option_text || optItem.text || '');
            const optImg = typeof optItem === 'object' ? (optItem.image_url || null) : null;
            return {
              id: (typeof optItem === 'object' && optItem.id) ? optItem.id : `opt-${qId}-${idx}`,
              question_id: qId,
              option_label: labels[idx] || `${idx + 1}`,
              option_text: optText,
              image_url: optImg,
              display_order: idx + 1,
            };
          });

          const correctOptionId = options[body.correctOptionIndex]?.id || options[0]?.id;

          const newQ = {
            id: qId,
            exam_id: targetExamId,
            section_id: body.section_id,
            question_number: Number(body.question_number) || (store.questions.length + 1),
            question_text: body.question_text,
            question_type: 'single_choice',
            difficulty: body.difficulty || 'medium',
            topic: body.topic || 'General',
            subtopic: body.subtopic || '',
            marks: Number(body.marks) || 2.0,
            negative_marks: Number(body.negative_marks) || 0.5,
            explanation: body.explanation || '',
            solution_steps: body.solution_steps || [body.explanation || ''],
            image_url: body.image_url || null,
            options,
            correct_option_id: correctOptionId,
            answer_explanation: body.explanation || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          store.questions.push(newQ);
          writeLiveStore(store);
          return res.end(JSON.stringify(newQ));
        }
        if (pathname.startsWith('/api/questions/') && req.method === 'PUT') {
          const questionId = pathname.replace('/api/questions/', '');
          const body = await parseBody(req);
          const idx = store.questions.findIndex((q: any) => q.id === questionId);
          if (idx !== -1) {
            const existing = store.questions[idx];
            let updatedOptions = existing.options;

            if (Array.isArray(body.options) && body.options.length > 0) {
              const labels = ['A', 'B', 'C', 'D'];
              updatedOptions = body.options.map((optItem: any, oIdx: number) => {
                const optText = typeof optItem === 'string' ? optItem : (optItem.option_text || optItem.text || '');
                const optImg = typeof optItem === 'object' ? (optItem.image_url !== undefined ? optItem.image_url : existing.options?.[oIdx]?.image_url || null) : null;
                const optId = typeof optItem === 'object' && optItem.id ? optItem.id : (existing.options?.[oIdx]?.id || `opt-${questionId}-${oIdx}`);
                return {
                  id: optId,
                  question_id: questionId,
                  option_label: labels[oIdx] || `${oIdx + 1}`,
                  option_text: optText,
                  image_url: optImg,
                  display_order: oIdx + 1,
                };
              });
            }

            let correctId = existing.correct_option_id;
            if (body.correctOptionIndex !== undefined && updatedOptions[body.correctOptionIndex]) {
              correctId = updatedOptions[body.correctOptionIndex].id;
            } else if (body.correct_option_id) {
              correctId = body.correct_option_id;
            }

            store.questions[idx] = {
              ...existing,
              ...body,
              image_url: body.image_url !== undefined ? body.image_url : existing.image_url,
              options: updatedOptions,
              correct_option_id: correctId,
              answer_explanation: body.explanation !== undefined ? body.explanation : existing.answer_explanation,
              updated_at: new Date().toISOString(),
            };

            writeLiveStore(store);
            return res.end(JSON.stringify(store.questions[idx]));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Question not found' }));
        }
        if (pathname.startsWith('/api/questions/') && req.method === 'DELETE') {
          const questionId = pathname.replace('/api/questions/', '');
          store.questions = store.questions.filter((q: any) => q.id !== questionId);
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true }));
        }

        // 5. TOPIC-WISE ONLINE ANALYSIS & REFERENCES
        if (pathname === '/api/topic-analysis' && req.method === 'GET') {
          return res.end(JSON.stringify(store.topic_analyses || {}));
        }
        if (pathname === '/api/topic-analysis' && (req.method === 'POST' || req.method === 'PUT')) {
          const body = await parseBody(req);
          const key = (body.key || body.topic_key || `${body.topic || ''}|${body.subtopic || ''}`).toLowerCase().trim();
          if (!store.topic_analyses) {
            store.topic_analyses = {};
          }
          if (key && body.analysis) {
            store.topic_analyses[key] = {
              ...(store.topic_analyses[key] || {}),
              ...body.analysis,
              updated_at: new Date().toISOString(),
            };
          } else if (body.topic_analyses && typeof body.topic_analyses === 'object') {
            store.topic_analyses = { ...store.topic_analyses, ...body.topic_analyses };
          }
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true, topic_analyses: store.topic_analyses }));
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveSyncApiPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@vibhillion/shared': path.resolve(import.meta.dirname, '../../packages/shared/src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'react-router-dom'],
  },
  server: {
    port: 5173,
    host: true,
  },
});
