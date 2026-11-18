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
      const resolvedTopic = inferQuestionTopic(
        q.question_text || q.text || '',
        sec.name,
        q.topic
      );
      finalAssigned.push({
        ...q,
        exam_id: examId,
        section_id: sec.id,
        section_name: sec.name,
        topic: resolvedTopic.topic,
        subtopic: q.subtopic || resolvedTopic.subtopic,
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

// ==============================================================================
// AUTO TOPIC CLASSIFICATION & SECTION-WISE TOPIC ANALYSIS AGGREGATOR
// ==============================================================================

const TOPIC_RULES: Array<{ sectionHint?: RegExp; pattern: RegExp; topic: string; subtopic: string }> = [
  // English Comprehension (checked with exact English indicators)
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bsynonym\b|similar in meaning|closest in meaning/i, topic: 'Vocabulary (Synonyms)', subtopic: 'Synonyms' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bantonym\b|opposite in meaning/i, topic: 'Vocabulary (Antonyms)', subtopic: 'Antonyms' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bidiom\b|\bphrase\b|meaning of the given idiom/i, topic: 'Idioms & Phrases', subtopic: 'Figurative Meaning' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /one-word|one word|can be substituted|word substitute|substitution/i, topic: 'One-Word Substitution', subtopic: 'Vocabulary' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bhomophone\b|\bhomonym\b|correctly spelt|misspelt|incorrectly spelt|\bspelling\b/i, topic: 'Spelling & Homophones', subtopic: 'Word Usage' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /grammatical error|contains an error|segment.*error|improve the bracketed|sentence improvement|no substitution/i, topic: 'Error Spotting & Grammar', subtopic: 'Grammar Rules' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bpassive voice\b|\bactive voice\b/i, topic: 'Active & Passive Voice', subtopic: 'Voice Transformation' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bindirect speech\b|\bdirect speech\b|\breported speech\b|\bnarration\b/i, topic: 'Direct & Indirect Speech', subtopic: 'Narration' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\brearrange\b|\bjumbled\b|para jumble|correct order|\bpqrs\b/i, topic: 'Para Jumbles', subtopic: 'Sentence Rearrangement' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /fill in the blank|most appropriate option to fill|\bcloze\b/i, topic: 'Fill in the Blanks / Cloze', subtopic: 'Contextual Vocabulary' },
  { sectionHint: /english|verbal|comprehension/i, pattern: /\bpassage\b|\bcomprehension\b|according to the passage/i, topic: 'Reading Comprehension', subtopic: 'Passage Inference' },

  // Reasoning
  { sectionHint: /reason|intelligence|logic/i, pattern: /father['’]s|mother['’]s|\bbrother\b|\bsister\b|\buncle\b|\baunt\b|\bson of\b|\bdaughter of\b|\bhusband\b|\bwife\b|blood relation/i, topic: 'Blood Relations', subtopic: 'Family Tree' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /coded as|code language|shifted forward|shifted backward|\bcoding\b|\bdecoding\b/i, topic: 'Coding-Decoding', subtopic: 'Letter & Number Shifting' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /letter-cluster|letter series|alphabetical|missing letter|\balphabet\b/i, topic: 'Letter & Alphabet Series', subtopic: 'Pattern Sequence' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /number series|missing number|next term|wrong term|\b\d+,\s*\d+,\s*\d+/i, topic: 'Number Series', subtopic: 'Numerical Progression' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /\bsyllogism\b|statements?:[\s\S]*conclusions?|all .+ are .+/i, topic: 'Syllogism', subtopic: 'Deductive Logic' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /facing north|facing south|facing east|facing west|\bclockwise\b|\banticlockwise\b|turns? right|turns? left|\bkm north\b|\bkm south\b/i, topic: 'Direction & Distance', subtopic: 'Spatial Sense' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /mirror image|water image|embedded figure|paper fold|\bdice\b|\bcube\b|venn diagram/i, topic: 'Non-Verbal Reasoning', subtopic: 'Visual & Spatial' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /\bsitting\b|\bseating\b|circular table|row facing|\branking\b|\btallest\b|\bshortest\b|\bolder than\b/i, topic: 'Seating & Ranking', subtopic: 'Order Arrangement' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /odd one out|different from the others|three of the following four are alike/i, topic: 'Classification', subtopic: 'Odd One Out' },
  { sectionHint: /reason|intelligence|logic/i, pattern: /related to .* in the same way|\banalogy\b|::/i, topic: 'Analogy', subtopic: 'Relationship Mapping' },

  // Quantitative Aptitude / Arithmetic
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\binvests?\b|\bpartnership\b|profit sharing/i, topic: 'Partnership', subtopic: 'Investment Ratio' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bcost price\b|\bselling price\b|\bmarked price\b|\bprofit\b|\bloss\b|\bdiscount\b/i, topic: 'Profit, Loss & Discount', subtopic: 'Commercial Math' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /simple interest|compound interest|per annum|\bprincipal\b|rate of interest/i, topic: 'Interest (SI & CI)', subtopic: 'Rate & Principal' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bpercentage\b|\bpercent\b|\d+%/i, topic: 'Percentage', subtopic: 'Percentage Applications' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bratio\b|\bproportion\b|mean proportional|third proportional/i, topic: 'Ratio & Proportion', subtopic: 'Proportions' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\baverage\b|\bmean of\b/i, topic: 'Average', subtopic: 'Arithmetic Mean' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /days to complete|alone can do|together can complete|\bpipes?\b|\bcistern\b/i, topic: 'Time & Work', subtopic: 'Efficiency & Days' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bkm\/h\b|\bm\/s\b|\btrain\b|\bspeed\b|\bdistance\b|\bupstream\b|\bdownstream\b|\bboat\b/i, topic: 'Time, Speed & Distance', subtopic: 'Relative Speed' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bsimplify\b|\bbodmas\b|evaluate\s*:/i, topic: 'Simplification', subtopic: 'BODMAS & Arithmetic' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\btriangle\b|\bcircle\b|\bchord\b|\btangent\b|\bradius\b|\bdiameter\b|\bpolygon\b|\bangle\b|\brectangle\b|\bsquare\b|\bcylinder\b|\bcone\b|\bsphere\b|\bvolume\b|\bperimeter\b/i, topic: 'Geometry & Mensuration', subtopic: 'Shapes & Volumes' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\b(sin|cos|tan|sec|cosec|cot)\s*[\d(θA-Z]|\btrigonometr/i, topic: 'Trigonometry', subtopic: 'Identities & Angles' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\balgebra\b|\bquadratic\b|\bpolynomial\b|x\^2|x²|\bequation\b|\broots\b/i, topic: 'Algebra', subtopic: 'Equations & Identities' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bhcf\b|\blcm\b|\bdivisible\b|\bremainder\b|\bprime number\b|\bunit digit\b|number system/i, topic: 'Number System', subtopic: 'Divisibility & HCF/LCM' },
  { sectionHint: /quant|math|arithmetic|aptitude/i, pattern: /\bmixture\b|\balligation\b|milk and water|\balloy\b/i, topic: 'Mixture & Alligation', subtopic: 'Concentration Ratio' },

  // General Awareness / GS
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\bconstitution\b|\barticle \d|\bamendment\b|\bschedule\b|\bparliament\b|lok sabha|rajya sabha|\bpresident\b|\bgovernor\b|supreme court|fundamental rights|\bdpsp\b|\bpanchayat\b|\bpolity\b/i, topic: 'Indian Polity', subtopic: 'Constitution & Governance' },
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\bharappa\b|\bindus\b|\bvedic\b|\bmaurya\b|\bgupta\b|\bmughal\b|delhi sultanate|battle of|revolt of 1857|\bgandhi\b|\bdynasty\b|\bempire\b|\bhistory\b/i, topic: 'Indian History', subtopic: 'Ancient, Medieval & Modern' },
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\briver\b|\bmountain\b|\bplateau\b|\bmonsoon\b|\bclimate\b|\bsoil\b|\bbiosphere\b|national park|\blatitude\b|\blongitude\b|\bocean\b|\bcontinent\b|\bgeography\b|\bglacier\b|\bdam\b/i, topic: 'Geography', subtopic: 'Indian & World Geography' },
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\bgdp\b|\brbi\b|\binflation\b|\brepo rate\b|\bfiscal\b|\bbudget\b|\bgst\b|five year plan|niti aayog|\bcurrency\b|\beconomy\b|\bunemployment\b|\bcensus\b/i, topic: 'Indian Economy', subtopic: 'Macroeconomics & Finance' },
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\bvitamin\b|\bcell\b|\bdna\b|\bphotosynthesis\b|\bacid\b|\bchemical\b|periodic table|\belement\b|\batom\b|\bnewton\b|\blens\b|\belectricity\b|\bohm\b|\bsi unit\b|\bdisease\b|\bbacteria\b|\bvirus\b|\bphysics\b|\bchemistry\b|\bbiology\b/i, topic: 'General Science', subtopic: 'Physics, Chemistry & Biology' },
  { sectionHint: /general awareness|general studies|\bga\b|\bgs\b|\bgk\b/i, pattern: /\bdance\b|\bfestival\b|\bgharana\b|\binstrument\b|\bmusic\b|\bpainting\b|\btemple\b|\bunesco\b|\bheritage\b|\bauthor\b|\baward\b|\bnobel\b|bharat ratna|\bsports\b|\bolympic\b|\bscheme\b|\byojana\b|current affairs/i, topic: 'Static GK & Current Affairs', subtopic: 'Culture, Awards & Schemes' },
];

export function inferQuestionTopic(
  questionText: string,
  sectionName: string,
  existingTopic?: string
): { topic: string; subtopic: string } {
  const cleanExisting = (existingTopic || '').trim();
  const isGeneric =
    !cleanExisting ||
    cleanExisting.toLowerCase() === 'general' ||
    cleanExisting.toLowerCase() === 'general topic' ||
    cleanExisting.toLowerCase() === 'untitled';

  if (!isGeneric) {
    return { topic: cleanExisting, subtopic: '' };
  }

  const text = String(questionText || '');
  const secStr = String(sectionName || '');

  // Pass 1: Prefer rules matching this section's domain
  for (const rule of TOPIC_RULES) {
    if (rule.sectionHint && rule.sectionHint.test(secStr) && rule.pattern.test(text)) {
      return { topic: rule.topic, subtopic: rule.subtopic };
    }
  }

  // Pass 2: Fallback across all rules if section name is custom (e.g. "Section 1")
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(text)) {
      return { topic: rule.topic, subtopic: rule.subtopic };
    }
  }

  return {
    topic: sectionName ? `${sectionName} (Core)` : 'General Topic',
    subtopic: 'Concept Application',
  };
}

export interface TopicStatItem {
  topic: string;
  subtopic: string;
  count: number;
  percentage: number;
  easy: number;
  medium: number;
  hard: number;
  questionNumbers: number[];
}

export interface SectionTopicAnalysisGroup {
  section_id: string;
  section_name: string;
  target_count: number;
  uploaded_count: number;
  unique_topic_count: number;
  easy: number;
  medium: number;
  hard: number;
  topics: TopicStatItem[];
}

export function buildSectionTopicAnalysis(
  sections: Array<{ id: string; name: string; display_order?: number; question_count?: number }>,
  questions: any[]
): SectionTopicAnalysisGroup[] {
  const sortedSections = [...sections].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return sortedSections.map((sec) => {
    const secQs = questions.filter((q) => q.section_id === sec.id);
    const topicMap = new Map<string, TopicStatItem>();

    let easy = 0;
    let medium = 0;
    let hard = 0;

    secQs.forEach((q) => {
      const inferred = inferQuestionTopic(q.question_text || q.text || '', sec.name, q.topic);
      const topicName = inferred.topic;
      const subtopicName = q.subtopic || inferred.subtopic || '';
      const diff = String(q.difficulty || 'medium').toLowerCase();

      if (diff === 'easy') easy++;
      else if (diff === 'hard') hard++;
      else medium++;

      const key = topicName.toLowerCase();
      if (!topicMap.has(key)) {
        topicMap.set(key, {
          topic: topicName,
          subtopic: subtopicName,
          count: 0,
          percentage: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          questionNumbers: [],
        });
      }
      const entry = topicMap.get(key)!;
      entry.count += 1;
      if (diff === 'easy') entry.easy += 1;
      else if (diff === 'hard') entry.hard += 1;
      else entry.medium += 1;
      if (q.question_number !== undefined) {
        entry.questionNumbers.push(Number(q.question_number));
      }
    });

    const topics = Array.from(topicMap.values())
      .map((t) => ({
        ...t,
        percentage: secQs.length > 0 ? Math.round((t.count / secQs.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));

    return {
      section_id: sec.id,
      section_name: sec.name,
      target_count: Number(sec.question_count) || 0,
      uploaded_count: secQs.length,
      unique_topic_count: topics.length,
      easy,
      medium,
      hard,
      topics,
    };
  });
}
