// ==============================================================================
// VIBHILLION ADMIN: SMART EXAM & SECTION QUESTION DISTRIBUTOR
// Enforces whole-exam question limit & divides bulk questions across sections
// by content (section_name, topic, subtopic, text) + configured section counts.
// ==============================================================================

export interface SectionAllocationConfig {
  id: string;
  name: string;
  display_order: number;
  question_count: number;
  duration_seconds: number;
  marks_per_correct: number;
  negative_marks_per_wrong: number;
}

export type DistributionMode = 'content_and_count' | 'sequential';

export interface SectionDistributionSummary {
  section_id: string;
  section_name: string;
  target_count: number;
  existing_count: number;
  matched_by_content: number;
  assigned_now: number;
  final_count: number;
}

export interface DistributionResult {
  assignedQuestions: any[];
  inputCount: number;
  examLimit: number;
  existingExamCount: number;
  remainingExamCapacity: number;
  acceptedCount: number;
  excludedExcessCount: number;
  sectionBreakdown: SectionDistributionSummary[];
}

// Keyword hints for content-based section classification
const SECTION_CONTENT_KEYWORDS: { pattern: RegExp; keywords: string[] }[] = [
  {
    pattern: /english|verbal|comprehension|grammar|vocab/i,
    keywords: [
      'english', 'grammar', 'vocabulary', 'synonym', 'antonym', 'idiom', 'phrase',
      'spelling', 'comprehension', 'cloze', 'voice', 'narration', 'sentence',
      'preposition', 'tense', 'article', 'one word', 'substitution', 'error spotting',
      'verb', 'noun', 'adjective', 'adverb', 'pronoun', 'conjunction', 'passage',
    ],
  },
  {
    pattern: /reason|intelligence|logic|mental ability|analytical/i,
    keywords: [
      'reasoning', 'analogy', 'coding', 'decoding', 'syllogism', 'blood relation',
      'series', 'number series', 'letter series', 'mirror', 'water image', 'dice',
      'cube', 'venn', 'seating', 'arrangement', 'direction', 'puzzle', 'odd one out',
      'classification', 'figure', 'pattern', 'statement', 'conclusion', 'matrix',
      'calendar', 'clock', 'ranking', 'order', 'inequality', 'logical',
    ],
  },
  {
    pattern: /quant|math|arithmetic|aptitude|numeric/i,
    keywords: [
      'math', 'quant', 'quantitative', 'algebra', 'geometry', 'trigonometry',
      'mensuration', 'percentage', 'profit', 'loss', 'discount', 'ratio', 'proportion',
      'average', 'time and work', 'speed', 'distance', 'train', 'boat', 'interest',
      'compound interest', 'simple interest', 'number system', 'hcf', 'lcm', 'lcm',
      'simplification', 'data interpretation', 'bar graph', 'pie chart', 'mixture',
      'alligation', 'partnership', 'triangle', 'circle', 'polygon', 'equation',
      'quadratic', 'lcm', 'remainder', 'divisibility', 'sin', 'cos', 'tan',
    ],
  },
  {
    pattern: /general awareness|general studies|general knowledge|\bga\b|\bgs\b|\bgk\b|polity|history|geography|science|economy|current/i,
    keywords: [
      'history', 'polity', 'constitution', 'article', 'amendment', 'parliament',
      'president', 'governor', 'geography', 'river', 'mountain', 'climate', 'soil',
      'economy', 'economics', 'gdp', 'rbi', 'inflation', 'budget', 'tax', 'gst',
      'physics', 'chemistry', 'biology', 'vitamin', 'disease', 'cell', 'acid',
      'current affairs', 'award', 'sports', 'scheme', 'yojana', 'static gk',
      'dance', 'festival', 'book', 'author', 'capital', 'currency', 'india',
      'mughal', 'maurya', 'gandhi', 'freedom', 'harappa', 'vedic', 'science',
      'ecology', 'environment', 'national park', 'biosphere', 'ministry', 'census',
    ],
  },
  {
    pattern: /computer|it|digital|software|cyber/i,
    keywords: [
      'computer', 'cpu', 'ram', 'rom', 'os', 'operating system', 'network', 'tcp',
      'http', 'html', 'database', 'sql', 'ms word', 'ms excel', 'shortcut', 'virus',
      'malware', 'firewall', 'browser', 'internet', 'memory', 'binary', 'bit', 'byte',
    ],
  },
];

/**
 * Evenly divides totalQuestions across sectionCount sections.
 * Example: divideTotalAcrossSections(100, 4) -> [25, 25, 25, 25]
 * Example: divideTotalAcrossSections(50, 3) -> [17, 17, 16]
 */
export function divideTotalAcrossSections(totalQuestions: number, sectionCount: number): number[] {
  const safeTotal = Math.max(1, Math.floor(Number(totalQuestions) || 1));
  const safeCount = Math.max(1, Math.floor(Number(sectionCount) || 1));
  const base = Math.floor(safeTotal / safeCount);
  const remainder = safeTotal % safeCount;

  return Array.from({ length: safeCount }, (_, idx) => base + (idx < remainder ? 1 : 0));
}

/**
 * Builds default section names when auto-generating sections for a given section count.
 */
export function getDefaultSectionNames(count: number): string[] {
  const presets = [
    'English Comprehension',
    'General Intelligence & Reasoning',
    'Quantitative Aptitude',
    'General Awareness',
    'Computer Knowledge',
    'Current Affairs & GK',
  ];
  return Array.from({ length: count }, (_, idx) => presets[idx] || `Section ${idx + 1}`);
}

/**
 * Scores how strongly a question's content matches a given section.
 */
function scoreQuestionForSection(question: any, section: SectionAllocationConfig): number {
  let score = 0;
  const secNameLower = (section.name || '').toLowerCase().trim();
  if (!secNameLower) return 0;

  // 1. Direct section_id match
  if (question.section_id && question.section_id === section.id) {
    score += 100;
  }

  // 2. Explicit section_name match
  const qSecName = String(question.section_name || question.section || question.subject || '').toLowerCase().trim();
  if (qSecName) {
    if (qSecName === secNameLower) {
      score += 90;
    } else if (secNameLower.includes(qSecName) || qSecName.includes(secNameLower)) {
      score += 70;
    } else {
      // Word overlap with section name
      const secWords = secNameLower.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const qWords = qSecName.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const overlap = qWords.filter((w) => secWords.includes(w)).length;
      if (overlap > 0) score += overlap * 30;
    }
  }

  // 3. Topic, subtopic, and question text content matching
  const topicText = `${question.topic || ''} ${question.subtopic || ''}`.toLowerCase();
  const fullContent = `${topicText} ${question.question_text || question.text || ''} ${question.explanation || ''}`.toLowerCase();

  // Direct word match from section name into topic/subtopic
  const secTokens = secNameLower.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !['general', 'section', 'paper', 'part'].includes(w));
  for (const token of secTokens) {
    if (topicText.includes(token)) score += 25;
    else if (fullContent.includes(token)) score += 10;
  }

  // Domain keyword match
  for (const group of SECTION_CONTENT_KEYWORDS) {
    if (group.pattern.test(secNameLower)) {
      for (const kw of group.keywords) {
        if (topicText.includes(kw)) {
          score += 18;
        } else if (fullContent.includes(kw)) {
          score += 6;
        }
      }
    }
  }

  return score;
}

/**
 * Distributes uploaded questions strictly within examLimit and section question_count quotas.
 */
export function distributeQuestionsAcrossSections(params: {
  rawQuestions: any[];
  sections: SectionAllocationConfig[];
  examLimit: number;
  existingQuestions?: any[];
  replaceMode: boolean;
  mode: DistributionMode;
  examId: string;
}): DistributionResult {
  const {
    rawQuestions,
    sections,
    examLimit,
    existingQuestions = [],
    replaceMode,
    mode,
    examId,
  } = params;

  const sortedSections = [...sections].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const safeExamLimit = Math.max(1, Math.floor(Number(examLimit) || 100));

  // Count existing questions for this exam (0 if replaceMode is enabled)
  const existingExamCount = replaceMode ? 0 : existingQuestions.length;
  const remainingExamCapacity = Math.max(0, safeExamLimit - existingExamCount);

  // Track per-section existing & available slots
  const existingPerSection: Record<string, number> = {};
  const availableSlots: Record<string, number> = {};
  const assignedPerSection: Record<string, any[]> = {};
  const matchedByContentCount: Record<string, number> = {};

  let totalAvailableSectionSlots = 0;

  sortedSections.forEach((sec) => {
    const existingCount = replaceMode
      ? 0
      : existingQuestions.filter((q) => q.section_id === sec.id).length;
    const target = Math.max(0, Math.floor(Number(sec.question_count) || 0));
    const slots = Math.max(0, target - existingCount);

    existingPerSection[sec.id] = existingCount;
    availableSlots[sec.id] = slots;
    assignedPerSection[sec.id] = [];
    matchedByContentCount[sec.id] = 0;
    totalAvailableSectionSlots += slots;
  });

  // Effective maximum questions allowed to be taken (strictly enforces Whole Exam Limit & Section Quotas)
  const effectiveMaxUpload = Math.min(
    remainingExamCapacity,
    sortedSections.length > 0 ? totalAvailableSectionSlots : remainingExamCapacity
  );

  if (sortedSections.length === 0) {
    const capped = rawQuestions.slice(0, effectiveMaxUpload);
    return {
      assignedQuestions: capped.map((q, idx) => ({
        ...q,
        exam_id: examId,
        question_number: existingExamCount + idx + 1,
      })),
      inputCount: rawQuestions.length,
      examLimit: safeExamLimit,
      existingExamCount,
      remainingExamCapacity,
      acceptedCount: capped.length,
      excludedExcessCount: Math.max(0, rawQuestions.length - capped.length),
      sectionBreakdown: [],
    };
  }

  let totalPlaced = 0;

  if (mode === 'sequential') {
    // Strictly slice questions sequentially by each section's available count up to effectiveMaxUpload
    const candidateQuestions = rawQuestions.slice(0, effectiveMaxUpload);
    let cursor = 0;
    for (const sec of sortedSections) {
      const remainingGlobal = Math.max(0, effectiveMaxUpload - totalPlaced);
      const takeCount = Math.min(availableSlots[sec.id], remainingGlobal);
      const slice = candidateQuestions.slice(cursor, cursor + takeCount);
      assignedPerSection[sec.id].push(...slice);
      cursor += slice.length;
      totalPlaced += slice.length;
    }
  } else {
    // Smart Content + Section Count mode:
    // Inspect ALL uploaded questions so every section gets its true content-matched questions
    // while strictly enforcing BOTH each section's question_count AND the whole exam's limit!
    const scoredItems = rawQuestions.map((q, originalIdx) => {
      const scores = sortedSections.map((sec) => ({
        sectionId: sec.id,
        score: scoreQuestionForSection(q, sec),
      }));
      scores.sort((a, b) => b.score - a.score);
      return {
        q,
        originalIdx,
        bestScore: scores[0]?.score || 0,
        rankedSections: scores,
        placed: false,
      };
    });

    // Pass 1: Assign strong content matches to their best matching section up to section quota & exam cap
    const matchedItems = scoredItems
      .filter((item) => item.bestScore > 0)
      .sort((a, b) => b.bestScore - a.bestScore || a.originalIdx - b.originalIdx);

    for (const item of matchedItems) {
      if (totalPlaced >= effectiveMaxUpload) break;
      for (const candidateSec of item.rankedSections) {
        if (candidateSec.score <= 0) break;
        if (assignedPerSection[candidateSec.sectionId].length < availableSlots[candidateSec.sectionId]) {
          assignedPerSection[candidateSec.sectionId].push(item.q);
          matchedByContentCount[candidateSec.sectionId] += 1;
          item.placed = true;
          totalPlaced += 1;
          break;
        }
      }
    }

    // Pass 2: If any section still has open quota slots AND we are below exam limit,
    // fill remaining open section quotas sequentially from unplaced questions
    if (totalPlaced < effectiveMaxUpload) {
      const unplaced = scoredItems
        .filter((item) => !item.placed)
        .sort((a, b) => a.originalIdx - b.originalIdx);

      for (const item of unplaced) {
        if (totalPlaced >= effectiveMaxUpload) break;
        for (const sec of sortedSections) {
          if (assignedPerSection[sec.id].length < availableSlots[sec.id]) {
            assignedPerSection[sec.id].push(item.q);
            item.placed = true;
            totalPlaced += 1;
            break;
          }
        }
      }
    }
  }

  // Flatten sections in display order and assign clean sequential question numbers & section metadata
  const finalAssigned: any[] = [];
  let runningQuestionNumber = replaceMode ? 1 : existingExamCount + 1;

  const sectionBreakdown: SectionDistributionSummary[] = sortedSections.map((sec) => {
    const secQuestions = assignedPerSection[sec.id];
    secQuestions.forEach((q) => {
      finalAssigned.push({
        ...q,
        exam_id: examId,
        section_id: sec.id,
        section_name: sec.name,
        marks: q.marks !== undefined ? Number(q.marks) : sec.marks_per_correct,
        negative_marks: q.negative_marks !== undefined ? Number(q.negative_marks) : sec.negative_marks_per_wrong,
        question_number: runningQuestionNumber++,
      });
    });

    return {
      section_id: sec.id,
      section_name: sec.name,
      target_count: sec.question_count,
      existing_count: existingPerSection[sec.id],
      matched_by_content: matchedByContentCount[sec.id],
      assigned_now: secQuestions.length,
      final_count: existingPerSection[sec.id] + secQuestions.length,
    };
  });

  return {
    assignedQuestions: finalAssigned,
    inputCount: rawQuestions.length,
    examLimit: safeExamLimit,
    existingExamCount,
    remainingExamCapacity,
    acceptedCount: finalAssigned.length,
    excludedExcessCount: Math.max(0, rawQuestions.length - finalAssigned.length),
    sectionBreakdown,
  };
}
