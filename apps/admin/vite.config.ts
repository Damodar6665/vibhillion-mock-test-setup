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

function recalculateTotals(store: any) {
  if (!store.exam) return;
  const sections = store.sections || [];
  store.exam.total_questions = sections.reduce((acc: number, s: any) => acc + (Number(s.question_count) || 0), 0);
  store.exam.total_duration_seconds = sections.reduce((acc: number, s: any) => acc + (Number(s.duration_seconds) || 0), 0);
  store.exam.total_marks = sections.reduce(
    (acc: number, s: any) => acc + ((Number(s.question_count) || 0) * (Number(s.marks_per_correct) || 2.0)),
    0
  );
  store.exam.updated_at = new Date().toISOString();
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

        // 2. EXAMS
        if (pathname === '/api/exams' && req.method === 'GET') {
          return res.end(JSON.stringify(store.exam ? [store.exam] : []));
        }
        if (pathname.startsWith('/api/exams/') && req.method === 'PUT') {
          const body = await parseBody(req);
          store.exam = { ...store.exam, ...body, updated_at: new Date().toISOString() };
          writeLiveStore(store);
          return res.end(JSON.stringify(store.exam));
        }

        // 3. SECTIONS
        if (pathname === '/api/sections' && req.method === 'GET') {
          const sorted = [...(store.sections || [])].sort((a, b) => a.display_order - b.display_order);
          return res.end(JSON.stringify(sorted));
        }
        if (pathname === '/api/sections' && req.method === 'POST') {
          const body = await parseBody(req);
          const newSec = {
            id: body.id || 'sec-' + Date.now(),
            exam_id: body.exam_id || store.exam?.id,
            name: body.name || 'New Section',
            display_order: Number(body.display_order) || (store.sections.length + 1),
            question_count: Number(body.question_count) || 25,
            duration_seconds: Number(body.duration_seconds) || 900,
            marks_per_correct: Number(body.marks_per_correct) || 2.0,
            negative_marks_per_wrong: Number(body.negative_marks_per_wrong) || 0.5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          store.sections.push(newSec);
          recalculateTotals(store);
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
            recalculateTotals(store);
            writeLiveStore(store);
            return res.end(JSON.stringify(store.sections[idx]));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Section not found' }));
        }
        if (pathname.startsWith('/api/sections/') && req.method === 'DELETE') {
          const sectionId = pathname.replace('/api/sections/', '');
          store.sections = store.sections.filter((s: any) => s.id !== sectionId);
          store.questions = store.questions.filter((q: any) => q.section_id !== sectionId);
          recalculateTotals(store);
          writeLiveStore(store);
          return res.end(JSON.stringify({ success: true }));
        }

        // 4. QUESTIONS
        if (pathname === '/api/questions' && req.method === 'GET') {
          const sectionId = searchParams.get('section_id');
          let list = store.questions || [];
          if (sectionId) {
            list = list.filter((q: any) => q.section_id === sectionId);
          }
          return res.end(JSON.stringify(list));
        }

        // 4.1 BULK UPLOAD QUESTIONS VIA JSON
        if (pathname === '/api/questions/bulk' && req.method === 'POST') {
          const body = await parseBody(req);
          const rawQuestions = Array.isArray(body) ? body : (Array.isArray(body.questions) ? body.questions : []);
          const replaceMode = Boolean(body.replace);

          if (!rawQuestions || rawQuestions.length === 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'No valid questions array found in JSON payload.' }));
          }

          const labels = ['A', 'B', 'C', 'D'];
          const sections = store.sections || [];
          const defaultSectionId = sections[0]?.id || 'sec-default';

          const processed = rawQuestions.map((item: any, idx: number) => {
            const qId = item.id || `q-bulk-${Date.now()}-${idx + 1}`;
            
            // Resolve section_id: by id or by section name
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
              section_id: secId,
              question_number: Number(item.question_number) || (replaceMode ? (idx + 1) : (store.questions.length + idx + 1)),
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
            store.questions = processed;
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

          // Recalculate section counts
          store.sections.forEach((sec: any) => {
            sec.question_count = store.questions.filter((q: any) => q.section_id === sec.id).length;
          });

          recalculateTotals(store);
          writeLiveStore(store);

          return res.end(JSON.stringify({
            success: true,
            uploaded_count: processed.length,
            total_questions: store.questions.length,
            questions: store.questions,
          }));
        }

        if (pathname === '/api/questions' && req.method === 'POST') {
          const body = await parseBody(req);
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

          // Update section question count automatically
          const targetSec = store.sections.find((s: any) => s.id === body.section_id);
          if (targetSec) {
            const secQuestionsCount = store.questions.filter((q: any) => q.section_id === body.section_id).length;
            targetSec.question_count = secQuestionsCount;
          }

          recalculateTotals(store);
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

            // If section changed, update question counts
            if (body.section_id && body.section_id !== existing.section_id) {
              store.sections.forEach((s: any) => {
                s.question_count = store.questions.filter((q: any) => q.section_id === s.id).length;
              });
            }

            recalculateTotals(store);
            writeLiveStore(store);
            return res.end(JSON.stringify(store.questions[idx]));
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Question not found' }));
        }
        if (pathname.startsWith('/api/questions/') && req.method === 'DELETE') {
          const questionId = pathname.replace('/api/questions/', '');
          const existing = store.questions.find((q: any) => q.id === questionId);
          const secId = existing?.section_id;

          store.questions = store.questions.filter((q: any) => q.id !== questionId);

          if (secId) {
            const targetSec = store.sections.find((s: any) => s.id === secId);
            if (targetSec) {
              targetSec.question_count = store.questions.filter((q: any) => q.section_id === secId).length;
            }
          }

          recalculateTotals(store);
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
