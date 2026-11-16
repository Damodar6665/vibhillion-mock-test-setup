// ==============================================================================
// VIBHILLION AI: TOPIC-WISE ONLINE ANALYSIS & CURATED STUDY REFERENCES
// File: packages/shared/src/topicAnalysis.ts
// ==============================================================================

import { TopicOnlineAnalysis } from './types';

/**
 * Standard Curated Online Reference Database for Competitive Exam Topics
 * (SSC CGL, CHSL, CPO, Banking, State PSCs)
 */
export const DEFAULT_TOPIC_ANALYSIS_DB: Record<string, TopicOnlineAnalysis> = {
  // ---------------------------------------------------------------------------
  // SECTION 1: ENGLISH COMPREHENSION
  // ---------------------------------------------------------------------------
  'english grammar|subject-verb agreement': {
    topic: 'English Grammar',
    subtopic: 'Subject-Verb Agreement',
    section_name: 'English Comprehension',
    concept_summary:
      'The verb must agree in number and person with its true grammatical subject. With correlatives like "neither...nor" or "either...or", the verb agrees with the proximate (closer) subject. Phrases like "along with", "as well as", and parenthetical clauses do not alter the number of the initial subject.',
    core_rule:
      'Proximate Agreement Rule: "Neither A nor B + Verb" -> Verb matches B. With "A as well as B" -> Verb matches A. Collective nouns take singular verbs unless members act individually.',
    online_reference_title: 'English Grammar: Subject-Verb Agreement Rules & Drills',
    online_reference_url:
      'https://www.google.com/search?q=Subject-Verb+Agreement+rules+exercises+SSC+CGL+English',
    target_pacing_seconds: 35,
    exam_weightage: 'High Frequency (2-3 Questions per Tier-1 Paper)',
    difficulty_tier: 'Medium',
    recommended_resources: [
      {
        title: 'Complete Subject-Verb Agreement Rules & Exception Sheets',
        url: 'https://www.google.com/search?q=Subject-Verb+Agreement+complete+rules+exceptions+pdf',
      },
    ],
  },

  'english grammar|collective nouns': {
    topic: 'English Grammar',
    subtopic: 'Collective Nouns',
    section_name: 'English Comprehension',
    concept_summary:
      'A collective noun (jury, committee, fleet, flock) denotes a group acting as a single cohesive unit and takes a singular verb. When individuals within the group are in disagreement or acting separately, plural verbs and pronouns are used.',
    core_rule:
      'Unanimity = Singular Verb ("The committee has decided"). Division/Dispute = Plural Verb ("The jury were divided in their opinions").',
    online_reference_title: 'Collective Nouns & Verb Agreement Guide',
    online_reference_url:
      'https://www.google.com/search?q=Collective+Nouns+rules+with+examples+SSC+English',
    target_pacing_seconds: 30,
    exam_weightage: 'Medium Frequency (1-2 Questions)',
    difficulty_tier: 'Easy',
  },

  'grammar|voice': {
    topic: 'Grammar',
    subtopic: 'Active & Passive Voice',
    section_name: 'English Comprehension',
    concept_summary:
      'Voice transformation alters the focus between the doer (agent) and the recipient (patient) of an action without modifying the core tense. Continuous tenses insert "being"; perfect tenses insert "been"; modals take "be + V3".',
    core_rule:
      'Never change the grammatical tense in Voice! Active [Sub + V + Obj] -> Passive [Obj + Form of "Be" + Past Participle (V3) + by + Sub]. Check modal verbs (can -> can be, should -> should be).',
    online_reference_title: 'Active & Passive Voice Transformation Formulae',
    online_reference_url:
      'https://www.google.com/search?q=Active+Passive+Voice+rules+formula+chart+SSC+CGL',
    target_pacing_seconds: 40,
    exam_weightage: 'High Frequency (2-3 Questions in Tier-1, up to 20 in Tier-2)',
    difficulty_tier: 'Medium',
  },

  'grammar|narration': {
    topic: 'Grammar',
    subtopic: 'Direct & Indirect Speech',
    section_name: 'English Comprehension',
    concept_summary:
      'Reporting spoken words indirectly requires systematically shifting reporting tenses one step into the past (Present Simple -> Past Simple; Past Simple -> Past Perfect), adjusting deictic adverbs of time/place (now -> then, yesterday -> the previous day), and changing pronouns (SON formula).',
    core_rule:
      'Apply SON rule (1st person -> Subject, 2nd person -> Object, 3rd person -> No change). Universal truths and habitual facts never change tense even with a past reporting verb.',
    online_reference_title: 'Direct & Indirect Speech Transformation Rules',
    online_reference_url:
      'https://www.google.com/search?q=Direct+Indirect+Speech+rules+tense+change+chart+SSC',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (2-3 Questions in Tier-1)',
    difficulty_tier: 'Medium',
  },

  'english grammar|conjunctions': {
    topic: 'English Grammar',
    subtopic: 'Conjunctions',
    section_name: 'English Comprehension',
    concept_summary:
      'Correlative conjunctions operate in strict pairs: "Scarcely / Hardly... when", "No sooner... than", "Not only... but also", "Lest... should". Pay particular attention to inversion when negative conjunctions begin a sentence.',
    core_rule:
      'Negative Inversion: "No sooner had / did [Sub]... than [Clause]". Watch for fake pairs (e.g., "Hardly... than" is wrong; use "when"). Maintain parallel structure with "not only... but also".',
    online_reference_title: 'Correlative Conjunctions & Inversion Rules',
    online_reference_url:
      'https://www.google.com/search?q=Conjunctions+rules+error+spotting+SSC+CGL',
    target_pacing_seconds: 35,
    exam_weightage: 'High Frequency (1-2 Questions)',
    difficulty_tier: 'Medium',
  },

  'english grammar|prepositions': {
    topic: 'English Grammar',
    subtopic: 'Prepositions & Phrasal Verbs',
    section_name: 'English Comprehension',
    concept_summary:
      'Fixed prepositions attach to specific adjectives, nouns, and verbs (e.g., abstained from, refrain from, prefer to, accustomed to, look forward to + gerund). Misplaced prepositions are a common distractor in error spotting.',
    core_rule:
      'Look forward to / With a view to / Accustomed to + V1+ing (Gerund). Latin adjectives (superior, inferior, prior, senior) always take "to", never "than".',
    online_reference_title: 'Fixed Prepositions Complete Reference List',
    online_reference_url:
      'https://www.google.com/search?q=Fixed+prepositions+list+pdf+SSC+CGL',
    target_pacing_seconds: 30,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'english grammar|relative clauses': {
    topic: 'English Grammar',
    subtopic: 'Relative Clauses',
    section_name: 'English Comprehension',
    concept_summary:
      'Relative pronouns (who, whom, which, that, whose) connect clauses and must agree with their antecedent. Use "who" as subject pronoun and "whom" as objective pronoun. Use "that" after superlative adjectives and words like "all, none, the only, same".',
    core_rule:
      'Subject test: Substitute "he" -> use "who"; substitute "him" -> use "whom". After "the only / all / superlative", prefer "that" over "which".',
    online_reference_title: 'Relative Pronouns & Clauses in Competitive Exams',
    online_reference_url:
      'https://www.google.com/search?q=Relative+clauses+who+whom+that+rules+SSC',
    target_pacing_seconds: 35,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Medium',
  },

  'vocabulary|synonyms': {
    topic: 'Vocabulary',
    subtopic: 'Synonyms',
    section_name: 'English Comprehension',
    concept_summary:
      'Synonym questions evaluate vocabulary breadth, morphological roots, prefixes, and suffixes. Beware of secondary definitions and words with identical connotation (positive vs. negative valence).',
    core_rule:
      'Root Word & Tone Method: Identify Latin/Greek roots (e.g., "bene-" = good, "mal-" = bad, "chron-" = time). Eliminate options that do not match the grammatical part of speech or positive/negative tone of the stem word.',
    online_reference_title: 'Top 1000 High-Frequency SSC CGL Synonyms & Root Words',
    online_reference_url:
      'https://www.google.com/search?q=High+frequency+synonyms+root+words+SSC+CGL',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'vocabulary|antonyms': {
    topic: 'Vocabulary',
    subtopic: 'Antonyms',
    section_name: 'English Comprehension',
    concept_summary:
      'Antonyms test your ability to recognize words with diametrically opposite meanings. Distractor traps often include close synonyms of the question word.',
    core_rule:
      'First formulate your own simple antonym before looking at choices. Beware of picking a synonym by mistake due to reading in haste. Check negative prefixes (un-, in-, dis-, a-).',
    online_reference_title: 'Essential Antonyms & Word Pairs for SSC Exams',
    online_reference_url:
      'https://www.google.com/search?q=SSC+CGL+antonyms+repeated+previous+year+questions',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'idioms & phrases|idioms': {
    topic: 'Idioms & Phrases',
    subtopic: 'Idiomatic Expressions',
    section_name: 'English Comprehension',
    concept_summary:
      'Idioms carry figurative meanings distinct from their literal wording. Options providing literal interpretations of the words in the idiom are almost always incorrect distractors.',
    core_rule:
      'Elimination heuristic: Eliminate any option that takes the physical words literally (e.g. "burn bridges" does not mean lighting fire to a wooden structure). Focus on cultural or historical origin context.',
    online_reference_title: 'Most Repeated SSC CGL Idioms & Phrases with Meanings',
    online_reference_url:
      'https://www.google.com/search?q=Most+repeated+idioms+phrases+SSC+CGL',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  'vocabulary|one word substitution': {
    topic: 'Vocabulary',
    subtopic: 'One Word Substitution',
    section_name: 'English Comprehension',
    concept_summary:
      'Condensing a descriptive phrase into a single precise lexical term. Heavy reliance on root words: -cide (killing), -phobia (fear), -phile (lover), -logy (study), somn- (sleep), ambi- (both).',
    core_rule:
      'Morphology Breakdown: Split the word into prefix, root, and suffix. "Altruist" (alter = other), "Misanthrope" (mis = hate, anthrop = human).',
    online_reference_title: 'Complete One Word Substitution Directory for SSC CGL',
    online_reference_url:
      'https://www.google.com/search?q=One+word+substitution+list+SSC+CGL+pdf',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  'vocabulary|spelling correction': {
    topic: 'Vocabulary',
    subtopic: 'Spelling Correction',
    section_name: 'English Comprehension',
    concept_summary:
      'Commonly misspelled words usually feature double consonants (accommodate, embarrass, harass), silent letters, or tricky "ie" vs "ei" digraphs.',
    core_rule:
      'Write it down on scratch paper without looking at the four choices first! Seeing flawed spellings causes visual cognitive bias. Remember "I before E except after C".',
    online_reference_title: 'Commonly Misspelled Words in Competitive Exams',
    online_reference_url:
      'https://www.google.com/search?q=Repeated+spelling+errors+SSC+CGL+questions',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  'english|homophones': {
    topic: 'English',
    subtopic: 'Homophones & Confusing Words',
    section_name: 'English Comprehension',
    concept_summary:
      'Words that sound alike but differ in spelling, origin, and syntactic function (e.g., affect vs. effect, complement vs. compliment, principal vs. principle).',
    core_rule:
      'Affect is usually a Verb (Action); Effect is usually a Noun (End result). ComplIment gives praise ("I like you"); ComplEment completes a whole ("E for Extra/Entire").',
    online_reference_title: 'Homophones & Confusing Words in Competitive English',
    online_reference_url:
      'https://www.google.com/search?q=Homophones+confusing+words+exercises+SSC+English',
    target_pacing_seconds: 25,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Medium',
  },

  // ---------------------------------------------------------------------------
  // SECTION 2: GENERAL INTELLIGENCE & REASONING
  // ---------------------------------------------------------------------------
  'reasoning|blood relations': {
    topic: 'Reasoning',
    subtopic: 'Blood Relations',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Deciphering genealogical ties from direct statements, coded symbols, or pointing dialogues. Never assume gender based on a name unless specified or deduced from parental/spousal links.',
    core_rule:
      'Family Tree Shorthand: Use horizontal line for siblings (A — B), double horizontal line for marriage (A = B), vertical line for generation gap (Parent | Child). Circle for female (-), square/plus for male (+).',
    online_reference_title: 'Blood Relations Family Tree Tricks & Coded Relationships',
    online_reference_url:
      'https://www.google.com/search?q=Blood+relations+tricks+family+tree+SSC+CGL',
    target_pacing_seconds: 40,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  'reasoning|analogy': {
    topic: 'Reasoning',
    subtopic: 'Analogy',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Identifying proportional logical relationships between pairs of entities: semantic, functional, tool-worker, product-raw material, or numerical transformation.',
    core_rule:
      'Strict Hierarchy in Priority: 1. Prime Number relation -> 2. Squares & Cubes -> 3. Multiplication/Division -> 4. Addition/Subtraction -> 5. Digit operations.',
    online_reference_title: 'Analogy Solving Principles & Number Pattern Hierarchy',
    online_reference_url:
      'https://www.google.com/search?q=Analogy+reasoning+tricks+formula+SSC+CGL',
    target_pacing_seconds: 30,
    exam_weightage: 'High Frequency (3-4 Questions)',
    difficulty_tier: 'Easy',
  },

  'reasoning|number series': {
    topic: 'Reasoning',
    subtopic: 'Number Series',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Finding the underlying progression pattern in a sequence of integers. Patterns include arithmetic differences, difference of differences (step-ladder), powers ($n^2 \pm k$, $n^3 \pm k$), alternating series, and Fibonacci variations.',
    core_rule:
      'Step-Difference First: If numbers increase moderately, compute consecutive differences. If differences form an AP or prime sequence, the next term is immediate. If numbers escalate rapidly, look for $x \times k + m$ or cube series.',
    online_reference_title: 'Number Series Patterns & Shortcut Formulae',
    online_reference_url:
      'https://www.google.com/search?q=Number+series+tricks+formula+difference+method+SSC',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'reasoning|coding-decoding': {
    topic: 'Reasoning',
    subtopic: 'Coding-Decoding',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Letter-to-letter, letter-to-number, and substitution cipher transformations based on alphabet position values and opposite letter pairs (AZ, BY, CX, DW, EV, FU, GT, HS, IR, JQ, KP, LO, MN).',
    core_rule:
      'Use EJOTY (5, 10, 15, 20, 25) for forward positions and the Sum of 27 rule for reverse positions (Opposite letter position = 27 - Forward position).',
    online_reference_title: 'EJOTY & Reverse Alphabet Pair Coding Tricks',
    online_reference_url:
      'https://www.google.com/search?q=Coding+decoding+reasoning+EJOTY+tricks+SSC+CGL',
    target_pacing_seconds: 40,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'reasoning|syllogism': {
    topic: 'Reasoning',
    subtopic: 'Syllogism',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Deductive logic evaluating categorical propositions (All, Some, No, Some Not). A conclusion is valid if and only if it holds true across every possible Venn diagram model.',
    core_rule:
      'Venn Method: Draw the minimal/standard diagram. A definite conclusion must be true in all diagrams. "Possibility" conclusions are true if valid in at least one non-contradictory diagram. Either/Or requires: complementary pair (Some + No or All + Some Not), same subject & predicate, both conclusions false individually.',
    online_reference_title: 'Syllogism 100-50 & Venn Diagram Methods',
    online_reference_url:
      'https://www.google.com/search?q=Syllogism+Venn+diagram+rules+tricks+SSC+CGL',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  'reasoning|classification': {
    topic: 'Reasoning',
    subtopic: 'Classification (Odd One Out)',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Identifying the single entity that does not share the common defining characteristic of the group (prime vs composite, vowels/consonants count, geographic capital vs city, odd/even cubes).',
    core_rule:
      'Define the unifying property of the remaining THREE items first, rather than focusing solely on what makes one unique.',
    online_reference_title: 'Classification & Odd-One-Out Strategies',
    online_reference_url:
      'https://www.google.com/search?q=Classification+odd+one+out+reasoning+tricks+SSC',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Easy',
  },

  'reasoning|mathematical operations': {
    topic: 'Reasoning',
    subtopic: 'Mathematical Operations',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Solving arithmetic equations with substituted operators (+ means -, × means ÷). Strict adherence to BODMAS / PEMDAS order of operations is mandatory.',
    core_rule:
      'Focus on Division (÷) First! Division constraints often require integers; check if the number after ÷ divides the preceding number cleanly to eliminate 2-3 options in seconds without calculating.',
    online_reference_title: 'Mathematical Operations & BODMAS Sign Interchanges',
    online_reference_url:
      'https://www.google.com/search?q=Mathematical+operations+reasoning+BODMAS+tricks+SSC',
    target_pacing_seconds: 35,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  'reasoning|direction & distance': {
    topic: 'Reasoning',
    subtopic: 'Direction & Distance',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Tracking movement across cardinal and ordinal directions (North, South, East, West, NE, NW, SE, SW), angular rotations, and shortest distance calculation via the Pythagorean theorem.',
    core_rule:
      'Facing North: Right is East (+x), Left is West (-x). Facing South: Right is West, Left is East. Shortest straight-line distance = $\\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$.',
    online_reference_title: 'Direction Sense & Pythagoras Shortcuts',
    online_reference_url:
      'https://www.google.com/search?q=Direction+sense+test+reasoning+tricks+shortcuts+SSC',
    target_pacing_seconds: 40,
    exam_weightage: 'High Frequency (1-2 Questions)',
    difficulty_tier: 'Easy',
  },

  'reasoning|seating arrangement': {
    topic: 'Reasoning',
    subtopic: 'Seating Arrangement',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Arranging people in linear rows or around circular/polygonal tables with specific facing conditions (facing centre vs outward).',
    core_rule:
      'Facing Center in Circle: Clockwise = Left, Counter-Clockwise = Right. Start with definite positional clues (e.g. "X sits third to the right of Y") rather than ambiguous relative clues.',
    online_reference_title: 'Circular & Linear Seating Arrangement Guide',
    online_reference_url:
      'https://www.google.com/search?q=Seating+arrangement+tricks+circular+linear+SSC+CGL',
    target_pacing_seconds: 60,
    exam_weightage: 'Medium Frequency (1-2 Questions)',
    difficulty_tier: 'Medium',
  },

  'reasoning|calendar': {
    topic: 'Reasoning',
    subtopic: 'Calendar',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Calculating day of the week for given dates using odd day counts. Ordinary year has 1 odd day (365 = 52 weeks + 1 day); leap year has 2 odd days. Century odd days: 100 yrs = 5, 200 yrs = 3, 300 yrs = 1, 400 yrs = 0.',
    core_rule:
      'Odd Day Formula: Total Odd Days = (Year odd days + Month odd days + Date) mod 7. Day 0 = Sunday, 1 = Monday, 6 = Saturday.',
    online_reference_title: 'Calendar Reasoning Odd Days Method & Formulae',
    online_reference_url:
      'https://www.google.com/search?q=Calendar+reasoning+odd+days+tricks+formula+SSC',
    target_pacing_seconds: 45,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Medium',
  },

  'reasoning|venn diagrams': {
    topic: 'Reasoning',
    subtopic: 'Venn Diagrams',
    section_name: 'General Intelligence & Reasoning',
    concept_summary:
      'Representing set relationships (subset, intersection, disjoint) geometrically among three or four real-world categories.',
    core_rule:
      'Hierarchy Check: Are all members of A inside B? (Subset). Do some members overlap? (Intersection). Are they mutually exclusive? (Disjoint circles).',
    online_reference_title: 'Logical Venn Diagrams Classification & Practice',
    online_reference_url:
      'https://www.google.com/search?q=Venn+diagrams+reasoning+tricks+SSC+CGL',
    target_pacing_seconds: 25,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  // ---------------------------------------------------------------------------
  // SECTION 3: QUANTITATIVE APTITUDE
  // ---------------------------------------------------------------------------
  'quantitative aptitude|profit and loss': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Profit and Loss',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Calculations relating Cost Price (CP), Selling Price (SP), Marked Price (MP), Discount, and Profit/Loss percentages. Profit% is always computed on CP unless explicitly stated otherwise; Discount% is computed on MP.',
    core_rule:
      'Golden Relation: $\\frac{MP}{CP} = \\frac{100 + P\\%}{100 - D\\%}$. Successive discounts $a\\%$ and $b\\%$ produce single equivalent discount $d = a + b - \\frac{ab}{100}$.',
    online_reference_title: 'Profit, Loss & Discount Formulas and Fraction Multipliers',
    online_reference_url:
      'https://www.google.com/search?q=Profit+and+loss+shortcuts+tricks+formula+SSC+CGL',
    target_pacing_seconds: 50,
    exam_weightage: 'High Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|percentages': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Percentages',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Base fraction-to-percentage conversions and successive percentage change. If a quantity increases by $x\\%$, the reduction needed to restore it to the original value is $\\frac{x}{100 + x} \\times 100\\%$.',
    core_rule:
      'Fraction Equivalents: $1/6 = 16.67\\%$, $1/7 = 14.28\\%$, $1/8 = 12.5\\%$, $1/9 = 11.11\\%$, $1/11 = 9.09\\%$, $1/12 = 8.33\\%$. Successive change: $A + B + \\frac{AB}{100}$.',
    online_reference_title: 'Percentage Fraction Chart & Quick Multipliers',
    online_reference_url:
      'https://www.google.com/search?q=Percentage+fraction+table+shortcuts+SSC+CGL',
    target_pacing_seconds: 40,
    exam_weightage: 'High Frequency (1-2 Questions)',
    difficulty_tier: 'Easy',
  },

  'quantitative aptitude|ratio and proportion': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Ratio and Proportion',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Relative magnitudes, combined ratios ($A:B$ and $B:C \\rightarrow A:B:C$), third and fourth proportional calculations, and mean proportional ($b = \\sqrt{ac}$).',
    core_rule:
      'Combined Ratio: If $A:B = 2:3$ and $B:C = 4:5$, then $A:B:C = (2 \\times 4) : (3 \\times 4) : (3 \\times 5) = 8 : 12 : 15$. Fourth proportional to $a, b, c$ is $x = \\frac{bc}{a}$.',
    online_reference_title: 'Ratio & Proportion Concepts & Proportionality Tricks',
    online_reference_url:
      'https://www.google.com/search?q=Ratio+and+proportion+tricks+formula+SSC+CGL',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Easy',
  },

  'quantitative aptitude|time and work': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Time and Work',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Work equals Efficiency multiplied by Time. If person A completes work in $x$ days and B in $y$ days, total work is taken as $\\text{LCM}(x, y)$ units to convert all computations to simple integer efficiencies.',
    core_rule:
      'LCM Total Work Method: Efficiency = Total Work / Days. For man-days problems: $\\frac{M_1 D_1 H_1}{W_1} = \\frac{M_2 D_2 H_2}{W_2}$.',
    online_reference_title: 'Time & Work LCM Method & Efficiency Shortcuts',
    online_reference_url:
      'https://www.google.com/search?q=Time+and+work+LCM+method+tricks+SSC+CGL',
    target_pacing_seconds: 50,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|pipes and cisterns': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Pipes and Cisterns',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Identical to Time & Work with the distinction that inlet pipes possess positive efficiency while leak/outlet pipes possess negative efficiency.',
    core_rule:
      'Net Efficiency = $\\sum \\text{Inlet efficiencies} - \\sum \\text{Outlet efficiencies}$. Tank capacity = LCM of individual times.',
    online_reference_title: 'Pipes & Cisterns Capacity & Efficiency Guide',
    online_reference_url:
      'https://www.google.com/search?q=Pipes+and+cisterns+shortcuts+formula+SSC+CGL',
    target_pacing_seconds: 50,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|time and distance': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Time, Speed and Distance',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Distance = Speed × Time. Unit conversion: $1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}$. Average speed when distances are equal = $\\frac{2xy}{x+y}$. Trains crossing stationary objects cover their own length; crossing a platform covers $\\text{Length}_{train} + \\text{Length}_{platform}$.',
    core_rule:
      'Unit check first: multiply km/h by $5/18$ for m/s. Relative speed: Same direction = $S_1 - S_2$; Opposite direction = $S_1 + S_2$.',
    online_reference_title: 'Speed, Time, Distance & Train Problems Shortcuts',
    online_reference_url:
      'https://www.google.com/search?q=Time+speed+distance+trains+shortcuts+SSC+CGL',
    target_pacing_seconds: 55,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|boats and streams': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Boats and Streams',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Speed downstream ($D$) = Speed of boat in still water ($u$) + Speed of stream ($v$). Speed upstream ($U$) = $u - v$.',
    core_rule:
      'Boat in still water: $u = \\frac{D + U}{2}$. Speed of current/stream: $v = \\frac{D - U}{2}$.',
    online_reference_title: 'Boats & Streams Formulas and Quick Equations',
    online_reference_url:
      'https://www.google.com/search?q=Boats+and+streams+formula+shortcuts+SSC+CGL',
    target_pacing_seconds: 45,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Easy',
  },

  'quantitative aptitude|simple interest': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Simple Interest',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Interest calculated strictly on original principal throughout tenure: $SI = \\frac{P \\times R \\times T}{100}$. Amount = $P + SI$.',
    core_rule:
      'If sum becomes $n$ times in $T$ years: $R = \\frac{(n-1) \\times 100}{T}$.',
    online_reference_title: 'Simple Interest Shortcuts & Multiplier Rules',
    online_reference_url:
      'https://www.google.com/search?q=Simple+interest+shortcuts+tricks+SSC+CGL',
    target_pacing_seconds: 40,
    exam_weightage: 'Medium Frequency (1 Question)',
    difficulty_tier: 'Easy',
  },

  'quantitative aptitude|compound interest': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Compound Interest',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Interest calculated on accumulated principal plus prior interest: $A = P(1 + \\frac{R}{100})^T$. Difference between CI and SI for 2 years = $P(\\frac{R}{100})^2$.',
    core_rule:
      '2-Year Difference: $CI - SI = \\frac{P \\cdot R^2}{100^2}$. For 3 years: $CI - SI = \\frac{P \\cdot R^2(300 + R)}{100^3}$. Use Pascal tree ratio $(2:1$ for 2 years, $3:3:1$ for 3 years) for rapid calculation.',
    online_reference_title: 'Compound Interest Tree Method & CI-SI Differences',
    online_reference_url:
      'https://www.google.com/search?q=Compound+interest+tree+method+shortcuts+SSC+CGL',
    target_pacing_seconds: 55,
    exam_weightage: 'High Frequency (1-2 Questions)',
    difficulty_tier: 'Hard',
  },

  'quantitative aptitude|algebra': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Algebra & Polynomials',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Algebraic identities ($a^3+b^3+c^3-3abc$, $(a+b+c)^2$, $(x+\\frac{1}{x})$ reciprocal relations), quadratic roots, and symmetry-based value putting.',
    core_rule:
      'Reciprocal Shortcuts: If $x + \\frac{1}{x} = k$, then $x^2 + \\frac{1}{x^2} = k^2 - 2$ and $x^3 + \\frac{1}{x^3} = k^3 - 3k$. Value Putting: If number of variables exceeds number of equations, set symmetric variables to 0, 1, or 2.',
    online_reference_title: 'Algebra Value-Putting Method & Identity Master Sheet',
    online_reference_url:
      'https://www.google.com/search?q=Algebra+value+putting+shortcuts+identities+SSC+CGL',
    target_pacing_seconds: 50,
    exam_weightage: 'High Frequency (3-4 Questions)',
    difficulty_tier: 'Hard',
  },

  'quantitative aptitude|geometry': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Geometry',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Properties of triangles (similarity, congruence, incenter, circumcenter, centroid, orthocenter), circles (chords, tangents, secants, cyclic quadrilaterals), and angles.',
    core_rule:
      'Tangent-Secant Theorem: $PT^2 = PA \\times PB$. Incircle radius of right triangle: $r = \\frac{a + b - c}{2}$. Angle subtended by chord at centre is double the angle at circumference.',
    online_reference_title: 'Geometry Theorems & Circle Tangent Properties',
    online_reference_url:
      'https://www.google.com/search?q=Geometry+theorems+triangles+circles+shortcuts+SSC+CGL',
    target_pacing_seconds: 60,
    exam_weightage: 'High Frequency (3-4 Questions)',
    difficulty_tier: 'Hard',
  },

  'quantitative aptitude|mensuration': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Mensuration (2D & 3D)',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Surface areas and volumes of cylinder, cone, sphere, hemisphere, cuboid, and prism. Volume of cone = $\\frac{1}{3}\\pi r^2 h$; Sphere = $\\frac{4}{3}\\pi r^3$.',
    core_rule:
      'Divisibility by 11 Shortcut: Formulas with $\\pi$ (cylinder, cone, sphere) frequently evaluate to a multiple of 11. Test option divisibility by 11 to eliminate invalid answers.',
    online_reference_title: 'Mensuration 2D & 3D Complete Formula Reference',
    online_reference_url:
      'https://www.google.com/search?q=Mensuration+formulas+tricks+11+divisibility+SSC+CGL',
    target_pacing_seconds: 55,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|trigonometry': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Trigonometry',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Fundamental identities ($\\sin^2\\theta + \\cos^2\\theta = 1$, $\\sec^2\\theta - \\tan^2\\theta = 1$), complementary angles ($90 - \\theta$), standard angles ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$), and heights/distances.',
    core_rule:
      'Angle Substitution: If options are numerical, substitute $\\theta = 45^\\circ$ (or $0^\\circ / 90^\\circ$ ensuring denominators are non-zero) to instantly collapse complex expressions.',
    online_reference_title: 'Trigonometry Value-Putting Shortcuts & Formulas',
    online_reference_url:
      'https://www.google.com/search?q=Trigonometry+shortcuts+value+putting+SSC+CGL',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (3 Questions)',
    difficulty_tier: 'Medium',
  },

  'quantitative aptitude|number system': {
    topic: 'Quantitative Aptitude',
    subtopic: 'Number System & Divisibility',
    section_name: 'Quantitative Aptitude',
    concept_summary:
      'Divisibility rules (7, 11, 13, 72, 88), unit digits, remainder theorems, LCM/HCF relations ($HCF \\times LCM = A \\times B$), and factors count.',
    core_rule:
      'Divisibility by 72: Check divisibility by 8 (last 3 digits) AND 9 (sum of digits). Divisibility by 88: Check 8 and 11 (alternating sum).',
    online_reference_title: 'Divisibility Rules & Remainder Theorem Shortcuts',
    online_reference_url:
      'https://www.google.com/search?q=Number+system+divisibility+rules+shortcuts+SSC+CGL',
    target_pacing_seconds: 45,
    exam_weightage: 'High Frequency (2 Questions)',
    difficulty_tier: 'Medium',
  },

  // ---------------------------------------------------------------------------
  // SECTION 4: GENERAL AWARENESS
  // ---------------------------------------------------------------------------
  'general awareness|polity': {
    topic: 'General Awareness',
    subtopic: 'Indian Polity & Constitution',
    section_name: 'General Awareness',
    concept_summary:
      'Fundamental Rights (Articles 12-35), Directive Principles of State Policy (Articles 36-51), Fundamental Duties (Article 51A), Emergency Provisions (352, 356, 360), Constitutional Amendments, and President/Governor powers.',
    core_rule:
      'Article Grouping Mnemonic: Articles 14-18 (Right to Equality), 19-22 (Right to Freedom), 23-24 (Against Exploitation), 25-28 (Freedom of Religion), 29-30 (Cultural/Educational), 32 (Constitutional Remedies - "Heart and Soul of the Constitution").',
    online_reference_title: 'Important Articles & Amendments of Indian Constitution',
    online_reference_url:
      'https://www.google.com/search?q=Indian+polity+important+articles+amendments+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (4-5 Questions per Paper)',
    difficulty_tier: 'Medium',
  },

  'general awareness|history': {
    topic: 'General Awareness',
    subtopic: 'Indian History',
    section_name: 'General Awareness',
    concept_summary:
      'Ancient India (Indus Valley Civilization, Vedic Period, Buddhism, Jainism, Mauryan & Gupta Empires), Medieval India (Delhi Sultanate, Mughal Empire, Vijayanagara), and Modern National Movement (1857 Revolt, INC Sessions, Gandhi Era, Governor-Generals).',
    core_rule:
      'Chronological Anchor Technique: Memorize milestone dates: 1526 (1st Panipat), 1757 (Plassey), 1857 (First War of Independence), 1885 (INC Formation), 1905 (Bengal Partition), 1920 (Non-Cooperation), 1930 (Civil Disobedience), 1942 (Quit India).',
    online_reference_title: 'Chronological Timeline & NCERT Indian History Notes',
    online_reference_url:
      'https://www.google.com/search?q=Indian+history+timeline+notes+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (4-5 Questions)',
    difficulty_tier: 'Medium',
  },

  'general awareness|geography': {
    topic: 'General Awareness',
    subtopic: 'Geography',
    section_name: 'General Awareness',
    concept_summary:
      'Physiography of India (Himalayas, Peninsular Plateau, Coastal Plains), River Drainage Systems (Himalayan vs Peninsular rivers, West-flowing: Narmada, Tapi), Climate, National Parks, Biosphere Reserves, and Mineral Resources.',
    core_rule:
      'River Direction Trick: Narmada, Tapi, Mahi, Sabarmati, and Periyar flow WEST into the Arabian Sea and form estuaries. Almost all other major rivers (Ganga, Godavari, Krishna, Cauvery) flow EAST into Bay of Bengal forming deltas.',
    online_reference_title: 'Indian Rivers, National Parks & Physical Geography Guide',
    online_reference_url:
      'https://www.google.com/search?q=Indian+geography+rivers+national+parks+map+tricks+SSC',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (3-4 Questions)',
    difficulty_tier: 'Medium',
  },

  'general awareness|general science': {
    topic: 'General Awareness',
    subtopic: 'General Science',
    section_name: 'General Awareness',
    concept_summary:
      'Physics (SI Units, Optics, Motion, Sound, Thermodynamics), Chemistry (Periodic Table, Acids & Bases, Everyday Chemical Compounds), and Biology (Human Anatomy, Diseases & Deficiencies, Vitamins, Cell Organelles, Plant Kingdom).',
    core_rule:
      'High-Yield Associations: Mitochondria = Powerhouse; Ribosome = Protein factory; Vitamin A deficiency = Night blindness; Vitamin C = Scurvy; Vitamin D = Rickets; Bleaching powder = $CaOCl_2$; Baking soda = $NaHCO_3$; Washing soda = $Na_2CO_3 \\cdot 10H_2O$.',
    online_reference_title: 'General Science NCERT Revision & Repeated Questions',
    online_reference_url:
      'https://www.google.com/search?q=General+science+notes+physics+chemistry+biology+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (5-6 Questions)',
    difficulty_tier: 'Easy',
  },

  'general awareness|economics': {
    topic: 'General Awareness',
    subtopic: 'Economics',
    section_name: 'General Awareness',
    concept_summary:
      'Macroeconomic indicators: GDP, GNP, NNP, Inflation (CPI, WPI), Fiscal Deficit, Monetary Policy tools (Repo Rate, Reverse Repo, CRR, SLR), Five-Year Plans, and Financial Institutions (RBI, SEBI, NITI Aayog).',
    core_rule:
      'Monetary Policy Tool Direction: To curb inflation, RBI RAISES Repo Rate / CRR to contract money supply. To stimulate growth, RBI LOWERS rates to inject liquidity.',
    online_reference_title: 'Basic Economics Concepts & Indian Economic Planning',
    online_reference_url:
      'https://www.google.com/search?q=Basic+economics+GDP+inflation+monetary+policy+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'Medium Frequency (2-3 Questions)',
    difficulty_tier: 'Medium',
  },

  'general awareness|art & culture': {
    topic: 'General Awareness',
    subtopic: 'Art & Culture',
    section_name: 'General Awareness',
    concept_summary:
      'Classical Dances (8 Sangeet Natak Akademi recognized styles and their state origins: Bharatanatyam - TN, Kathak - UP, Kathakali - Kerala, Kuchipudi - AP, Odissi - Odisha, Manipuri - Manipur, Mohiniyattam - Kerala, Sattriya - Assam), folk dances, classical music gharanas, and festivals.',
    core_rule:
      '8 Classical Dances Mnemonic: Remember states pairing: Bharatanatyam (Tamil Nadu), Kuchipudi (Andhra Pradesh), Sattriya (Assam - founded by Sankaradeva), Mohiniyattam & Kathakali (Kerala).',
    online_reference_title: 'Indian Classical Dances, Folk Arts & Festivals Compendium',
    online_reference_url:
      'https://www.google.com/search?q=Indian+classical+dances+folk+art+festivals+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'High Frequency (3 Questions)',
    difficulty_tier: 'Medium',
  },

  'general awareness|sports': {
    topic: 'General Awareness',
    subtopic: 'Sports & Trophies',
    section_name: 'General Awareness',
    concept_summary:
      'Major sporting events (Olympics, Asian Games, Commonwealth, Cricket World Cup), player terminology, stadium locations, and trophy names (e.g., Santosh Trophy - Football, Ranji Trophy - Cricket, Thomas/Uber Cup - Badminton).',
    core_rule:
      'Trophy Association Checklist: Thomas Cup (Men\'s Badminton), Uber Cup (Women\'s Badminton), Santosh Trophy (Football), Ryder Cup (Golf), Davis Cup (Tennis).',
    online_reference_title: 'Sports Terminologies, Cups & Trophies List',
    online_reference_url:
      'https://www.google.com/search?q=Sports+terminologies+cups+trophies+list+SSC+CGL',
    target_pacing_seconds: 20,
    exam_weightage: 'Medium Frequency (1-2 Questions)',
    difficulty_tier: 'Easy',
  },
};

/**
 * Intelligent Fallback Generator for any arbitrary or newly created topic
 */
export function generateGenericTopicAnalysis(
  topic: string,
  subtopic?: string,
  sectionName?: string
): TopicOnlineAnalysis {
  const cleanTopic = (topic || 'General Topic').trim();
  const cleanSub = (subtopic || '').trim();
  const label = cleanSub ? `${cleanTopic} • ${cleanSub}` : cleanTopic;
  const query = encodeURIComponent(`${label} competitive exam concept rules shortcuts`.trim());

  return {
    topic: cleanTopic,
    subtopic: cleanSub,
    section_name: sectionName || 'General',
    concept_summary: `Core principles and problem-solving patterns tested under ${label}. Focus on understanding foundational rules, identifying key question indicators, and avoiding common trap options.`,
    core_rule: `Step 1: Identify given parameters and constraints. Step 2: Apply targeted elimination rule or standard shortcut formula. Step 3: Validate the choice against edge cases.`,
    online_reference_title: `Online Reference & Study Notes: ${label}`,
    online_reference_url: `https://www.google.com/search?q=${query}`,
    target_pacing_seconds: 40,
    exam_weightage: 'Standard Frequency (1-2 Questions)',
    difficulty_tier: 'Medium',
    recommended_resources: [
      {
        title: `Comprehensive Guide & Solved Questions: ${label}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${label} questions with solutions and shortcut tricks`)}`,
      },
    ],
  };
}

/**
 * Retrieve curated or dynamically generated online analysis for any topic & question
 */
export function getTopicOnlineAnalysis(
  topic?: string | null,
  subtopic?: string | null,
  sectionName?: string | null,
  questionText?: string | null,
  customOverrides?: Record<string, TopicOnlineAnalysis>
): TopicOnlineAnalysis {
  const t = (topic || 'General').toLowerCase().trim();
  const st = (subtopic || '').toLowerCase().trim();

  // 1. Check custom overrides from admin
  if (customOverrides) {
    const fullKey = `${t}|${st}`;
    if (customOverrides[fullKey]) return customOverrides[fullKey];
    if (customOverrides[st]) return customOverrides[st];
    if (customOverrides[t]) return customOverrides[t];
  }

  // 2. Direct exact match in default DB
  const exactKey = `${t}|${st}`;
  if (DEFAULT_TOPIC_ANALYSIS_DB[exactKey]) {
    return { ...DEFAULT_TOPIC_ANALYSIS_DB[exactKey], section_name: sectionName || DEFAULT_TOPIC_ANALYSIS_DB[exactKey].section_name };
  }

  // 3. Subtopic match
  if (st) {
    for (const [key, analysis] of Object.entries(DEFAULT_TOPIC_ANALYSIS_DB)) {
      const parts = key.split('|');
      if (parts[1] && (parts[1] === st || parts[1].includes(st) || st.includes(parts[1]))) {
        return { ...analysis, section_name: sectionName || analysis.section_name };
      }
    }
  }

  // 4. Topic fuzzy match
  for (const [key, analysis] of Object.entries(DEFAULT_TOPIC_ANALYSIS_DB)) {
    const parts = key.split('|');
    if (parts[0] && (parts[0] === t || parts[0].includes(t) || t.includes(parts[0]))) {
      return { ...analysis, section_name: sectionName || analysis.section_name };
    }
  }

  // 5. Intelligent Fallback
  return generateGenericTopicAnalysis(topic || 'General', subtopic || '', sectionName || 'General');
}

/**
 * Returns all default topic analyses as a flat array for Admin UI management
 */
export function getAllDefaultTopicAnalyses(): TopicOnlineAnalysis[] {
  return Object.values(DEFAULT_TOPIC_ANALYSIS_DB);
}
