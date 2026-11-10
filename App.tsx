import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Activity, AlertTriangle, ArrowRight, Award, BarChart3, BookOpen, Brain,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Compass,
  Download, FileText, Flame, Gauge, GraduationCap, HeartPulse, Lightbulb,
  ListChecks, Menu, MessageCircle, Mic, Pause, Play, Plus, RefreshCw, Rocket,
  Search, Settings2, ShieldAlert, ShieldCheck, Sparkles, Target, Timer,
  TrendingUp, Upload, Volume2, VolumeX, Wifi, WifiOff, X, Zap
} from 'lucide-react';
import './styles.css';

GlobalWorkerOptions.workerSrc = pdfWorker;

const EXAM_DNA = {
  MPSC: { pattern: 'Prelims (MCQ) + Mains (Descriptive)', marks: '400 Prelims', cutoff: '52%', competition: '300k', difficulty: 'High', negative: 0.25, time: 120 },
  UPSC: { pattern: 'Prelims (MCQ) + Mains (Descriptive)', marks: '1750 + 275', cutoff: '48%', competition: '1.2M', difficulty: 'Extreme', negative: 0.33, time: 120 },
  SSC: { pattern: 'Tier 1 + Tier 2 (CBT)', marks: '200 Tier 1', cutoff: '76%', competition: '2.5M', difficulty: 'Moderate–High', negative: 0.5, time: 60 },
  'Police Bharti': { pattern: 'Written Test + Physical Test', marks: '100 Written + 50 Physical', cutoff: '85%', competition: '500k', difficulty: 'Moderate', negative: 0, time: 90 },
  Banking: { pattern: 'Prelims + Mains (CBT)', marks: '100 Prelims', cutoff: '68%', competition: '1M', difficulty: 'High speed', negative: 0.25, time: 60 },
  Railway: { pattern: 'CBT Phase 1 & 2', marks: '100', cutoff: '72%', competition: '3M', difficulty: 'Moderate', negative: 0.33, time: 90 },
  NEET: { pattern: 'Pen-and-paper MCQ', marks: '720', cutoff: '96%', competition: '2M', difficulty: 'High precision', negative: 1, time: 200 },
  JEE: { pattern: 'CBT Physics / Chemistry / Maths', marks: '300', cutoff: '89 percentile', competition: '1.1M', difficulty: 'Extreme mathematics', negative: 1, time: 180 },
  'TCS NQT': { pattern: 'Integrated cognitive + technical', marks: 'Scaled score', cutoff: '70%', competition: '400k', difficulty: 'Technical', negative: 0, time: 180 },
} as const;
type ExamKey = keyof typeof EXAM_DNA;

type Module = { id: string; title: string; subtitle: string; icon: ReactNode; features: number[] };
type FeatureMeta = { id: number; title: string; description: string };
const MODULES: Module[] = [
  { id: '1', title: 'Start Journey', subtitle: 'Calibrate your preparation and set a clear route to the exam.', icon: <Rocket />, features: [1] },
  { id: '2', title: 'Exam DNA & Playbooks', subtitle: 'Understand the exam pattern and build an execution strategy.', icon: <Brain />, features: [2, 3] },
  { id: '3', title: 'Syllabus & PYQ Engines', subtitle: 'Track syllabus coverage and analyze previous-year question trends.', icon: <BarChart3 />, features: [4, 5, 6] },
  { id: '4', title: 'Mindset & Question Labs', subtitle: 'Train for examiner traps and recognize common question structures.', icon: <CircleHelp />, features: [7, 8] },
  { id: '5', title: 'Elimination & Guess Engines', subtitle: 'Use elimination rules, expected-value math, and time tactics.', icon: <ShieldCheck />, features: [9, 10, 11] },
  { id: '6', title: 'PDF Intelligence Engine', subtitle: 'Import study material and turn it into searchable, reviewable study assets.', icon: <FileText />, features: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
  { id: '7', title: 'Revision & Recall OS', subtitle: 'Use spaced repetition, blank-page recall, and teach-back practice.', icon: <RefreshCw />, features: [24, 25, 26, 27] },
  { id: '8', title: 'Practice & Mock Arenas', subtitle: 'Run sectional practice, full mocks, and speed drills.', icon: <Activity />, features: [28, 29, 30] },
  { id: '9', title: 'Mistake Hospital', subtitle: 'Classify errors and turn lost marks into a targeted recovery plan.', icon: <HeartPulse />, features: [31, 32, 33, 34] },
  { id: '10', title: 'Performance Analytics', subtitle: 'Monitor readiness, prioritize high-return topics, and review progress.', icon: <TrendingUp />, features: [35, 36, 37, 38] },
  { id: '11', title: 'Focus & Support', subtitle: 'Protect attention, build consistency, and track accountability.', icon: <Clock3 />, features: [39, 40, 41, 42, 43] },
  { id: '12', title: 'Current Affairs & AI Coach', subtitle: 'Connect news to the syllabus and use adaptive study support.', icon: <Sparkles />, features: [44, 45, 46] },
  { id: '13', title: 'Doubt, Panic & Future Systems', subtitle: 'Handle doubts, emergency revision, community notes, and next-stage growth.', icon: <ShieldAlert />, features: [47, 48, 49, 50, 51, 52, 53, 54, 55] },
];

const FEATURES: FeatureMeta[] = [
  { id: 1, title: 'Start Journey System', description: 'Onboarding wizard, baseline diagnostics, Success GPS, and today’s mission blueprint.' },
  { id: 2, title: 'Exam DNA Matrix', description: 'Pattern, marks, competition, difficulty, time allowance, and negative marking.' },
  { id: 3, title: 'Dedicated Playbook', description: 'Subject allocation, attempt order, confidence zones, and exam-day rules.' },
  { id: 4, title: 'Syllabus Intelligence System', description: 'Track topics, mastery, weightage, and coverage gaps.' },
  { id: 5, title: 'PYQ Super Analyzer', description: 'Log previous-year questions and surface recurring subjects and themes.' },
  { id: 6, title: 'Question Pattern Analyzer', description: 'Compare factual, conceptual, statement-based, and assertion-reason formats.' },
  { id: 7, title: 'Examiner Mindset Laboratory', description: 'Detect absolute modifiers, qualifiers, and likely statement traps.' },
  { id: 8, title: 'Structural Format Drills', description: 'Practice common question structures with instant answer review.' },
  { id: 9, title: 'Option Elimination Engine', description: 'Apply configurable elimination rules to answer options.' },
  { id: 10, title: 'Smart Guess Risk Yield', description: 'Calculate expected marks after eliminating one or more options.' },
  { id: 11, title: 'Exam Tactics Academy', description: 'Create a time budget, attempt order, and skip/return protocol.' },
  { id: 12, title: 'PDF / Document Ingestion Hub', description: 'Import PDF and text-based study files into the local workspace.' },
  { id: 13, title: 'Read Mode', description: 'Search and read the text extracted from your study material.' },
  { id: 14, title: 'Learn Mode', description: 'Turn extracted text into active flashcards.' },
  { id: 15, title: 'Practice MCQ Generator', description: 'Create source-linked cloze questions from extracted study text.' },
  { id: 16, title: 'Revision Mode', description: 'Review cards and schedule the next repetition.' },
  { id: 17, title: 'Test Mode', description: 'Run a quick knowledge check from imported material.' },
  { id: 18, title: 'Document Annotation & Search', description: 'Save highlighted passages and personal annotations.' },
  { id: 19, title: 'Multi-format Import Engine', description: 'Import multiple supported files and organize their extracted text.' },
  { id: 20, title: 'Concept Extraction', description: 'Extract recurring terms and key phrases from imported documents.' },
  { id: 21, title: 'Confusion Detector', description: 'Flag negation, exception, and absolute-language patterns for review.' },
  { id: 22, title: 'Formula Sheet Factory', description: 'Build a searchable formula and definition sheet.' },
  { id: 23, title: 'Mnemonic & Memory Boosters', description: 'Create mnemonic prompts from lists and key terms.' },
  { id: 24, title: 'Spaced Repetition Scheduler', description: 'Schedule review intervals after each card review.' },
  { id: 25, title: 'Four-stage Revision Stack', description: 'Organize Day 1, Day 3, Day 7, and Day 30 revision queues.' },
  { id: 26, title: 'Blank Page Recall', description: 'Write everything you remember before checking notes.' },
  { id: 27, title: 'Teach-back Evaluator', description: 'Check explanation length and concept coverage with a transparent local rubric.' },
  { id: 28, title: 'Sectional Practice Arena', description: 'Build a short practice session around a subject or topic.' },
  { id: 29, title: 'Full CBT Mock Arena', description: 'Run a timed, multi-question mock and calculate the score.' },
  { id: 30, title: 'Speed Drill Timer', description: 'Train question pace with a short countdown drill.' },
  { id: 31, title: 'Mistake Log & Cost Matrix', description: 'Record errors, sources, and the marks lost.' },
  { id: 32, title: 'Error Classification', description: 'Categorize errors by concept, calculation, reading, or time pressure.' },
  { id: 33, title: 'Mistake Recovery Sets', description: 'Turn unresolved mistakes into a targeted retry set.' },
  { id: 34, title: 'Marks Leakage Detector', description: 'Estimate recoverable marks from recurring mistakes.' },
  { id: 35, title: 'Overall Readiness Gauge', description: 'Track preparation readiness against your current target.' },
  { id: 36, title: 'High ROI Priority Matrix', description: 'Compare expected marks with the time needed for each topic.' },
  { id: 37, title: 'Performance Analytics Suite', description: 'Record study sessions and chart your recent performance.' },
  { id: 38, title: 'Daily Success Board', description: 'Check off your daily learn, practice, revise, mock, and analysis goals.' },
  { id: 39, title: 'Pomodoro Focus Session', description: 'Run a 25-minute focus session with pause and reset controls.' },
  { id: 40, title: 'Distraction & Focus Tracker', description: 'Log interruptions and identify patterns that break concentration.' },
  { id: 41, title: 'Habit & Streak Tracker', description: 'Record study-day completion and maintain a streak.' },
  { id: 42, title: 'Accountability Check-in', description: 'Set a commitment and write a daily reflection.' },
  { id: 43, title: 'Community Leaderboard', description: 'Compare local demo benchmarks and record your personal best.' },
  { id: 44, title: 'Syllabus-mapped Current Affairs', description: 'Save news notes against syllabus topics and expected question angles.' },
  { id: 45, title: 'AI Study Coach', description: 'Generate a study plan using a configured Gemini API key or local guidance.' },
  { id: 46, title: 'Adaptive Operating Modes', description: 'Switch between deep work, revision, mock, and recovery modes.' },
  { id: 47, title: 'Doubt Solver', description: 'Break a doubt into a clear question and request a grounded explanation.' },
  { id: 48, title: 'Panic Mode Protocol', description: 'Reduce the workload to a short, high-priority recovery checklist.' },
  { id: 49, title: 'Emergency Last-24-Hours Plan', description: 'Build a final-day timetable from your exam date and remaining priorities.' },
  { id: 50, title: 'Personal Success Board', description: 'Track milestones and mark the targets you have achieved.' },
  { id: 51, title: 'Community Notes Workspace', description: 'Create, tag, export, and share notes from this browser.' },
  { id: 52, title: 'Knowledge Token & API Layer', description: 'Configure an optional Gemini key for AI features.' },
  { id: 53, title: 'Offline Revision Pack Exporter', description: 'Export notes, flashcards, formulas, and mistakes into a portable file.' },
  { id: 54, title: 'Voice Revision Engine', description: 'Listen to saved notes and formulas using browser speech synthesis.' },
  { id: 55, title: 'Mentor & Interview Trainer Suite', description: 'Practice interview questions and organize a personal mentor shortlist.' },
];

const SAMPLE_QUESTIONS = [
  { id: 'q1', topic: 'Polity', question: 'Article 356 of the Constitution of India deals with:', options: ['Financial Emergency', 'President’s Rule in a State', 'Amendment procedure', 'Election Commission'], answer: 1, explain: 'Article 356 concerns failure of constitutional machinery in a State.' },
  { id: 'q2', topic: 'Mathematics', question: 'The derivative of sin(x) is:', options: ['−sin(x)', 'tan(x)', 'cos(x)', '−cos(x)'], answer: 2, explain: 'The derivative of sin(x), with x in radians, is cos(x).' },
  { id: 'q3', topic: 'Polity', question: 'Fundamental Duties are contained in which Part of the Constitution?', options: ['Part III', 'Part IVA', 'Part V', 'Part IX'], answer: 1, explain: 'Fundamental Duties are listed in Part IVA.' },
  { id: 'q4', topic: 'Geography', question: 'Which is the largest planet in the Solar System?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], answer: 2, explain: 'Jupiter is the largest planet in the Solar System.' },
  { id: 'q5', topic: 'Science', question: 'Which gas do plants mainly absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 2, explain: 'Plants use carbon dioxide and water to produce sugars during photosynthesis.' },
];

const INITIAL_WORKSPACE = {
  exam: 'MPSC' as ExamKey,
  dailyHours: 6,
  targetScore: 98.5,
  examDate: '',
  syllabus: [
    { id: 's1', subject: 'Polity Core', topic: 'Constitutional Frameworks', frequency: 'High', weight: 15, mastery: 45 },
    { id: 's2', subject: 'Polity Core', topic: 'Statutory Commissions', frequency: 'Medium', weight: 8, mastery: 72 },
    { id: 's3', subject: 'Quant Methods', topic: 'Data Interpretation', frequency: 'High', weight: 20, mastery: 30 },
  ],
  pyqs: [] as { id: string; subject: string; year: string; pattern: string; question: string }[],
  playbook: 'Attempt direct, high-confidence questions first. Mark uncertain questions for a second pass. Never let one difficult question consume the time budget.',
  cards: [] as { id: string; front: string; back: string; reviewAt: number; interval: number }[],
  document: null as null | { name: string; text: string; paragraphs: string[]; importedAt: string },
  highlights: [] as { id: string; quote: string; note: string }[],
  formulas: [] as { id: string; name: string; formula: string }[],
  mistakes: [
    { id: 'm1', question: 'Article 356 deals with State Emergency', type: 'Factual error', cost: 0.25, source: 'MPSC practice' },
    { id: 'm2', question: 'Derivative of sin(x) is cos(x)', type: 'Calculation error', cost: 1, source: 'JEE practice' },
  ] as { id: string; question: string; type: string; cost: number; source: string; recovered?: boolean }[],
  tasks: [
    { id: 't1', label: 'Learn one core topic', done: false },
    { id: 't2', label: 'Solve 20 practice questions', done: false },
    { id: 't3', label: 'Revise due flashcards', done: false },
    { id: 't4', label: 'Complete one timed drill', done: false },
    { id: 't5', label: 'Review today’s mistakes', done: false },
  ],
  sessions: [] as { id: string; date: string; minutes: number; score?: number; label: string }[],
  distractions: [] as { id: string; time: string; note: string }[],
  streak: 0,
  lastStudyDate: '',
  accountabilityPlan: 'Complete one focused session and clear the due revision queue.',
  accountabilityReflection: '',
  currentAffairs: [] as { id: string; headline: string; topic: string; note: string; date: string }[],
  communityNotes: [] as { id: string; title: string; tag: string; body: string; updatedAt: string }[],
  milestones: [
    { id: 'g1', label: 'Complete first full mock', done: false },
    { id: 'g2', label: 'Reach 70% readiness', done: false },
    { id: 'g3', label: 'Clear 10 logged mistakes', done: false },
    { id: 'g4', label: 'Finish one full syllabus subject', done: false },
  ],
  mentorShortlist: [] as { id: string; name: string; specialty: string; note: string }[],
  recallText: '',
  teachText: '',
  dailyTarget: 6,
  operationMode: 'Deep work',
};
type Workspace = typeof INITIAL_WORKSPACE;

const localISO = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayISO = () => localISO();
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const safeText = (value: string) => value.replace(/\s+/g, ' ').trim();
const moneyless = (value: number) => Number.isFinite(value) ? value.toFixed(2) : '0.00';

function loadWorkspace(): Workspace {
  try {
    const saved = localStorage.getItem('exam_os_workspace_v3');
    if (!saved) return INITIAL_WORKSPACE;
    const parsed = JSON.parse(saved);
    return { ...INITIAL_WORKSPACE, ...parsed, exam: parsed.exam in EXAM_DNA ? parsed.exam : 'MPSC' } as Workspace;
  } catch {
    return INITIAL_WORKSPACE;
  }
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}
function PanelTitle({ eyebrow, title, detail, right }: { eyebrow?: string; title: string; detail?: string; right?: ReactNode }) {
  return <div className="panel-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h3>{title}</h3>{detail && <p>{detail}</p>}</div>{right}</div>;
}
function Btn({ children, onClick, variant = 'primary', disabled = false, size = 'normal', type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; disabled?: boolean; size?: 'normal' | 'small'; type?: 'button' | 'submit' }) {
  return <button type={type} className={`btn ${variant} ${size}`} disabled={disabled} onClick={onClick}>{children}</button>;
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
function Metric({ label, value, note, icon, tone = 'purple' }: { label: string; value: string; note: string; icon: ReactNode; tone?: string }) {
  return <div className={`metric ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></div>;
}
function FeatureCard({ feature, children }: { feature: FeatureMeta; children: ReactNode }) {
  return <Panel className="feature-card"><div className="feature-card-head"><span className="feature-number">{String(feature.id).padStart(2, '0')}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div></div><div className="feature-content">{children}</div></Panel>;
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [activeModule, setActiveModule] = useState('1');
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [apiKey, setApiKey] = useState(''); // deliberately session-only; never persisted
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [doubt, setDoubt] = useState('');
  const [currentHeadline, setCurrentHeadline] = useState('');
  const [currentTopic, setCurrentTopic] = useState('Polity Core');
  const [currentNote, setCurrentNote] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicSubject, setTopicSubject] = useState('General Studies');
  const [newPyq, setNewPyq] = useState('');
  const [pyqSubject, setPyqSubject] = useState('Polity');
  const [pyqYear, setPyqYear] = useState('2025');
  const [pyqPattern, setPyqPattern] = useState('Statement-based');
  const [patternType, setPatternType] = useState('Statement-based');
  const [mindsetText, setMindsetText] = useState('The authority shall always act without exception in every circumstance.');
  const [drillAnswer, setDrillAnswer] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [eliminationText, setEliminationText] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [guessEliminated, setGuessEliminated] = useState(2);
  const [guessQuestions, setGuessQuestions] = useState(10);
  const [tactics, setTactics] = useState(['Direct and familiar questions first', 'Mark uncertain items and return later', 'Protect the final 10 minutes for review']);
  const [newTactic, setNewTactic] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [readQuery, setReadQuery] = useState('');
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswer, setMcqAnswer] = useState<number | null>(null);
  const [mcqReveal, setMcqReveal] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testDone, setTestDone] = useState(false);
  const [highlightQuote, setHighlightQuote] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [confusionText, setConfusionText] = useState('The rule does not apply unless the authority has issued a written order.');
  const [formulaName, setFormulaName] = useState('');
  const [formulaValue, setFormulaValue] = useState('');
  const [mnemonicInput, setMnemonicInput] = useState('Fundamental Rights, Directive Principles, Fundamental Duties');
  const [mnemonic, setMnemonic] = useState('');
  const [recallFeedback, setRecallFeedback] = useState('');
  const [teachFeedback, setTeachFeedback] = useState('');
  const [sectionTopic, setSectionTopic] = useState('Polity');
  const [sectionCount, setSectionCount] = useState(5);
  const [mockStarted, setMockStarted] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({});
  const [mockTime, setMockTime] = useState(20 * 60);
  const [mockFinished, setMockFinished] = useState(false);
  const [mistakeQuestion, setMistakeQuestion] = useState('');
  const [mistakeType, setMistakeType] = useState('Factual error');
  const [mistakeCost, setMistakeCost] = useState('0.25');
  const [mistakeSource, setMistakeSource] = useState('');
  const [roiTopic, setRoiTopic] = useState('Constitutional Frameworks');
  const [roiHours, setRoiHours] = useState(8);
  const [roiMarks, setRoiMarks] = useState(16);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [sessionLabel, setSessionLabel] = useState('Focused study');
  const [distractionNote, setDistractionNote] = useState('');
  const [accountabilityText, setAccountabilityText] = useState(workspace.accountabilityPlan);
  const [reflectionText, setReflectionText] = useState(workspace.accountabilityReflection);
  const [currentSearch, setCurrentSearch] = useState('');
  const [mode, setMode] = useState(workspace.operationMode);
  const [panicMode, setPanicMode] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTag, setNoteTag] = useState('Polity');
  const [noteBody, setNoteBody] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [interviewQuestion, setInterviewQuestion] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [mentorSpecialty, setMentorSpecialty] = useState('');
  const [mentorNote, setMentorNote] = useState('');
  const [newLeaderboardName, setNewLeaderboardName] = useState('');
  const [newLeaderboardScore, setNewLeaderboardScore] = useState('');
  const [leaderboard, setLeaderboard] = useState([{ name: 'Demo learner A', score: 94 }, { name: 'Demo learner B', score: 91 }]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [speedTime, setSpeedTime] = useState(60);
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedDone, setSpeedDone] = useState(false);

  const update = useCallback(<K extends keyof Workspace>(key: K, value: Workspace[K]) => {
    setWorkspace((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem('exam_os_workspace_v3', JSON.stringify(workspace)); } catch { /* browser storage can be unavailable */ }
  }, [workspace]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  useEffect(() => {
    if (!pomodoroRunning) return;
    const id = window.setInterval(() => setPomodoroTime((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [pomodoroRunning]);
  useEffect(() => { if (pomodoroTime === 0) setPomodoroRunning(false); }, [pomodoroTime]);
  useEffect(() => {
    if (!speedRunning) return;
    const id = window.setInterval(() => setSpeedTime((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [speedRunning]);
  useEffect(() => { if (speedTime === 0 && speedRunning) { setSpeedRunning(false); setSpeedDone(true); } }, [speedTime, speedRunning]);
  useEffect(() => {
    if (!mockStarted || mockFinished) return;
    const id = window.setInterval(() => setMockTime((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mockStarted, mockFinished]);
  useEffect(() => { if (mockTime === 0 && mockStarted) setMockFinished(true); }, [mockTime, mockStarted]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const activeModuleData = MODULES.find((m) => m.id === activeModule) || MODULES[0];
  const featureById = (id: number) => FEATURES.find((f) => f.id === id)!;
  const allCards = workspace.cards;
  const dueCards = allCards.filter((c) => c.reviewAt <= Date.now());
  const readiness = useMemo(() => {
    const mastery = workspace.syllabus.length ? workspace.syllabus.reduce((sum, t) => sum + t.mastery, 0) / workspace.syllabus.length : 0;
    const completed = workspace.tasks.filter((t) => t.done).length / Math.max(1, workspace.tasks.length) * 100;
    const mocks = workspace.sessions.filter((s) => typeof s.score === 'number');
    const mockScore = mocks.length ? mocks.reduce((sum, s) => sum + (s.score || 0), 0) / mocks.length : 50;
    return Math.round(mastery * 0.45 + completed * 0.25 + mockScore * 0.30);
  }, [workspace.syllabus, workspace.tasks, workspace.sessions]);
  const totalMistakeCost = workspace.mistakes.filter((m) => !m.recovered).reduce((sum, m) => sum + m.cost, 0);
  const todayTasksDone = workspace.tasks.filter((t) => t.done).length;
  const filteredFeatures = FEATURES.filter((f) => `${f.id} ${f.title} ${f.description}`.toLowerCase().includes(search.toLowerCase()));
  const currentExam = EXAM_DNA[workspace.exam];
  const currentQuestions = useMemo(() => {
    if (workspace.cards.length) {
      return workspace.cards.slice(0, 10).map((card, idx) => ({ id: `doc-${card.id}`, topic: 'Imported material', question: `Which statement best completes this study prompt: “${card.front}”?`, options: [card.back, 'Not stated in the imported source', 'The opposite of the source statement', 'A conclusion not supported by the source'], answer: 0, explain: `Source note: ${card.back}` }));
    }
    return SAMPLE_QUESTIONS;
  }, [workspace.cards]);
  const activeQuestion = SAMPLE_QUESTIONS[drillAnswer === null ? 0 : 1];
  const formattedTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const addCard = (front: string, back: string) => {
    update('cards', [...workspace.cards, { id: uid(), front, back, reviewAt: Date.now(), interval: 1 }]);
  };
  const rescheduleCard = (cardId: string, known: boolean) => {
    update('cards', workspace.cards.map((card) => card.id === cardId ? { ...card, interval: known ? Math.min(card.interval * 2 + 1, 30) : 1, reviewAt: Date.now() + (known ? Math.min(card.interval * 2 + 1, 30) : 1) * 86400000 } : card));
    setFlashFlipped(false);
    setFlashIndex((i) => Math.max(0, Math.min(i, Math.max(0, workspace.cards.length - 2))));
  };

  const extractPdf = async (file: File) => {
    const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    for (let p = 1; p <= pdf.numPages; p += 1) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => item.str || '').join(' '));
    }
    return pages.join('\n');
  };
  const ingestFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploadStatus(`Importing ${list.length} file${list.length > 1 ? 's' : ''}…`);
    try {
      const extracted: { name: string; text: string }[] = [];
      for (const file of list) {
        if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name} is larger than the 30 MB per-file limit.`);
        let text = '';
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) text = await extractPdf(file);
        else if (/\.(txt|md|csv|json|html?)$/i.test(file.name) || file.type.startsWith('text/')) {
          text = await file.text();
          if (/\.html?$/i.test(file.name)) text = new DOMParser().parseFromString(text, 'text/html').body.textContent || '';
          if (/\.json$/i.test(file.name)) { try { text = JSON.stringify(JSON.parse(text), null, 2); } catch { /* keep raw text */ } }
        } else throw new Error(`Unsupported file: ${file.name}. Use PDF, TXT, Markdown, CSV, JSON, or HTML.`);
        if (!text.trim()) throw new Error(`${file.name} contains no selectable text. Scanned PDFs need OCR and are not supported in this build.`);
        extracted.push({ name: file.name, text });
      }
      const combined = extracted.map((f) => `\n\n===== ${f.name} =====\n${f.text}`).join('\n');
      const paragraphs = combined.split(/\n+/).map(safeText).filter((p) => p.length > 24).slice(0, 300);
      const docName = extracted.length === 1 ? extracted[0].name : `${extracted.length} imported files`;
      update('document', { name: docName, text: combined, paragraphs, importedAt: new Date().toISOString() });
      const generatedCards = paragraphs.slice(0, 24).map((p) => ({ id: uid(), front: `Explain: ${p.split(/\s+/).slice(0, 8).join(' ')}…`, back: p, reviewAt: Date.now(), interval: 1 }));
      update('cards', [...workspace.cards, ...generatedCards]);
      setFlashIndex(0); setFlashFlipped(false);
      setUploadStatus(`Imported ${docName}. Extracted ${paragraphs.length} readable text blocks and created ${generatedCards.length} flashcards.`);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : 'Unable to import this file.');
    }
  };

  const addMistake = () => {
    if (!mistakeQuestion.trim()) return;
    update('mistakes', [...workspace.mistakes, { id: uid(), question: mistakeQuestion.trim(), type: mistakeType, cost: Math.max(0, Number(mistakeCost) || 0), source: mistakeSource || 'Self practice' }]);
    setMistakeQuestion(''); setMistakeSource('');
  };
  const callGemini = async (prompt: string) => {
    if (!apiKey.trim()) return { text: '', error: 'Add your Gemini API key in Feature 52 to use live AI. A local guide is available without a key.' };
    setAiLoading(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
        body: JSON.stringify({ model: 'gemini-3.8-flash', input: prompt, store: false, generation_config: { thinking_level: 'low', max_output_tokens: 1200 } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `AI request failed (${response.status}).`);
      const text = data?.output_text || data?.steps?.filter((step: any) => step.type === 'model_output').flatMap((step: any) => step.content || []).filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n') || 'The AI service returned no text.';
      return { text, error: '' };
    } catch (error) {
      return { text: '', error: error instanceof Error ? error.message : 'AI request failed.' };
    } finally { setAiLoading(false); }
  };
  const askCoach = async () => {
    setAiMessage(''); setAiResult('');
    const local = `Your ${workspace.exam} preparation snapshot:\n• Readiness estimate: ${readiness}%\n• Daily target: ${workspace.dailyHours} hours\n• Due review cards: ${dueCards.length}\n• Unresolved mistake marks: ${moneyless(totalMistakeCost)}\n\nRecommended next actions:\n1. Clear ${Math.min(5, dueCards.length)} due flashcards.\n2. Spend one focused block on the lowest-mastery syllabus topic.\n3. Retry one unresolved mistake and record the result.\n\nThis is a local planning suggestion, not an AI-verified exam prediction.`;
    const result = await callGemini(`Act as a careful exam-preparation coach. Do not invent exam rules or current affairs. Use the following learner data and produce a practical 1-day plan with time blocks, revision priorities, and a short rationale.\nExam: ${workspace.exam}; readiness estimate: ${readiness}%; daily hours: ${workspace.dailyHours}; syllabus: ${workspace.syllabus.map(s => `${s.topic} ${s.mastery}%`).join('; ')}; mistakes: ${workspace.mistakes.filter(m => !m.recovered).map(m => m.question).join('; ')}; due cards: ${dueCards.length}.`);
    setAiResult(result.text || local);
    setAiMessage(result.error || (result.text ? 'AI plan generated. Verify any exam-specific facts against official sources.' : 'Local coach plan generated. Add an API key in Feature 52 to enable AI generation.'));
  };
  const solveDoubt = async () => {
    if (!doubt.trim()) return;
    setAiMessage(''); setAiResult('');
    const result = await callGemini(`Explain this exam-preparation doubt clearly. First give the core answer, then a step-by-step explanation, one common trap, and one practice question. State uncertainty and never fabricate citations.\nDoubt: ${doubt}`);
    const local = `Doubt breakdown\n1. Identify the exact term or rule being asked.\n2. Separate the rule from exceptions and qualifying conditions.\n3. Check the statement against your primary textbook or official source.\n4. Write one example and one counter-example.\n\nQuestion to resolve next: Which precise part of “${doubt}” is unclear?`;
    setAiResult(result.text || local);
    setAiMessage(result.error || (result.text ? 'AI explanation generated. Cross-check factual details with your prescribed material.' : 'Local doubt framework shown; configure Feature 52 for AI explanations.'));
  };

  const exportPack = (format: 'json' | 'txt' = 'json') => {
    const pack = { exportedAt: new Date().toISOString(), exam: workspace.exam, readiness, syllabus: workspace.syllabus, document: workspace.document, flashcards: workspace.cards, formulas: workspace.formulas, mistakes: workspace.mistakes, notes: workspace.communityNotes, currentAffairs: workspace.currentAffairs, tasks: workspace.tasks };
    const content = format === 'json' ? JSON.stringify(pack, null, 2) : [
      'EXAM OS — OFFLINE REVISION PACK', `Exam: ${workspace.exam}`, `Readiness estimate: ${readiness}%`, '', 'STUDY NOTES', ...(workspace.document?.paragraphs || ['No document imported.']), '', 'FLASHCARDS', ...workspace.cards.map((c, i) => `${i + 1}. ${c.front}\n   ${c.back}`), '', 'FORMULAS', ...workspace.formulas.map((f) => `${f.name}: ${f.formula}`), '', 'MISTAKE LOG', ...workspace.mistakes.map((m) => `${m.question} | ${m.type} | ${m.cost} marks | ${m.recovered ? 'Recovered' : 'Open'}`), '', 'COMMUNITY NOTES', ...workspace.communityNotes.map((n) => `${n.title} [${n.tag}]\n${n.body}`),
    ].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `EXAM_OS_${workspace.exam}_revision_pack.${format}`; link.click(); URL.revokeObjectURL(url);
  };
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) { setUploadStatus('Speech synthesis is not available in this browser.'); return; }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text || workspace.cards.map((c) => `${c.front}. ${c.back}`).join('. ') || workspace.document?.text.slice(0, 2500) || 'Welcome to EXAM OS voice revision. Add notes or flashcards to hear them here.');
    utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); setSpeaking(true);
  };

  const markTask = (id: string, done: boolean) => update('tasks', workspace.tasks.map((t) => t.id === id ? { ...t, done } : t));
  const markHabitToday = () => {
    const today = todayISO();
    if (workspace.lastStudyDate === today) return;
    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = localISO(yesterdayDate);
    update('streak', workspace.lastStudyDate === yesterday ? workspace.streak + 1 : 1);
    update('lastStudyDate', today);
  };
  const addSession = () => {
    const newSession = { id: uid(), date: todayISO(), minutes: Math.max(1, sessionMinutes), label: sessionLabel };
    update('sessions', [...workspace.sessions, newSession]);
  };

  const renderFeature = (id: number): ReactNode => {
    switch (id) {
      case 1: return <>
        <div className="subfeature-grid">
          <div className="subfeature"><span>1.1 · Onboarding Wizard</span><Field label="Target exam"><select value={workspace.exam} onChange={(e) => update('exam', e.target.value as ExamKey)}>{Object.keys(EXAM_DNA).map((exam) => <option key={exam}>{exam}</option>)}</select></Field><Field label="Daily study commitment"><select value={workspace.dailyHours} onChange={(e) => update('dailyHours', Number(e.target.value))}>{[2, 4, 6, 8, 10, 12].map((h) => <option key={h} value={h}>{h} hours / day</option>)}</select></Field><Field label="Target percentile / score"><input type="number" min="1" max="100" step="0.1" value={workspace.targetScore} onChange={(e) => update('targetScore', Number(e.target.value))} /></Field><Field label="Exam date (optional)"><input type="date" value={workspace.examDate} onChange={(e) => update('examDate', e.target.value)} /></Field></div>
          <div className="subfeature"><span>1.2 · Baseline Diagnostics</span><div className="diagnostic-row"><strong>{Math.round(workspace.syllabus.reduce((s, t) => s + t.mastery, 0) / Math.max(1, workspace.syllabus.length))}%</strong><small>Average syllabus mastery</small></div><div className="diagnostic-row"><strong>{workspace.sessions.length ? Math.round(workspace.sessions.reduce((s, x) => s + x.minutes, 0) / Math.max(1, workspace.sessions.length)) : 0} min</strong><small>Average logged study session</small></div><div className="diagnostic-row"><strong>{workspace.cards.length}</strong><small>Active review cards</small></div></div>
          <div className="subfeature"><span>1.3 · Success GPS</span><ol className="route-list"><li><b>Daily:</b> Learn one topic and solve a short set.</li><li><b>Weekly:</b> Review weak topics and clear mistakes.</li><li><b>Monthly:</b> Complete a timed mock and analyze the score.</li></ol></div>
          <div className="subfeature"><span>1.4 · Today’s Mission Blueprint</span><div className="mission-progress"><b>{todayTasksDone}/{workspace.tasks.length}</b><span>daily tasks completed</span></div><div className="progress"><i style={{ width: `${todayTasksDone / Math.max(1, workspace.tasks.length) * 100}%` }} /></div><p className="muted small">Your mission board is Feature 38. Check it off there as you complete each step.</p><Btn variant="secondary" onClick={() => setActiveModule('10')}>Open Daily Success Board <ArrowRight size={14} /></Btn></div>
        </div>
      </>;
      case 2: return <div className="stats-grid four">{[['Pattern', currentExam.pattern], ['Total marks', currentExam.marks], ['Cutoff reference', currentExam.cutoff], ['Negative marking', currentExam.negative ? `−${currentExam.negative} / wrong` : 'None'], ['Competition reference', currentExam.competition], ['Difficulty', currentExam.difficulty], ['Time allowance', `${currentExam.time} min`], ['Exam selected', workspace.exam]].map(([label, value]) => <div className="stat-tile" key={label}><small>{label}</small><b>{value}</b></div>)}<p className="disclaimer wide">Planner reference values only. Exam patterns, cutoffs, marks, and penalties change by notification and category; verify the latest official notice before relying on them.</p></div>;
      case 3: return <div className="stack gap-12"><Field label="Your playbook / attempt protocol"><textarea rows={4} value={workspace.playbook} onChange={(e) => update('playbook', e.target.value)} /></Field><div className="three-grid"><div className="stat-tile"><small>Suggested subject split</small><b>GS 60%</b><span>Reasoning 20% · Quant 20%</span></div><div className="stat-tile"><small>Attempt zone 1</small><b>High confidence</b><span>Direct, familiar questions</span></div><div className="stat-tile"><small>Attempt zone 2–3</small><b>Eliminate or skip</b><span>Return to uncertain items later</span></div></div><p className="muted small">Edit the playbook above to match your exam’s official structure and your own mock-test evidence.</p></div>;
      case 4: return <><div className="inline-form"><Field label="Subject"><input value={topicSubject} onChange={(e) => setTopicSubject(e.target.value)} /></Field><Field label="Topic"><input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="e.g. Fundamental Rights" /></Field><Btn onClick={() => { if (topicName.trim()) { update('syllabus', [...workspace.syllabus, { id: uid(), subject: topicSubject, topic: topicName.trim(), frequency: 'Unknown', weight: 0, mastery: 0 }]); setTopicName(''); } }}><Plus size={14} /> Add topic</Btn></div><div className="table-wrap"><table><thead><tr><th>Subject</th><th>Topic</th><th>PYQ frequency</th><th>Weight</th><th>Mastery</th></tr></thead><tbody>{workspace.syllabus.map((item) => <tr key={item.id}><td>{item.subject}</td><td>{item.topic}</td><td><select value={item.frequency} onChange={(e) => update('syllabus', workspace.syllabus.map((x) => x.id === item.id ? { ...x, frequency: e.target.value } : x))}><option>Unknown</option><option>High</option><option>Medium</option><option>Low</option></select></td><td><input className="mini-input" type="number" min="0" value={item.weight} onChange={(e) => update('syllabus', workspace.syllabus.map((x) => x.id === item.id ? { ...x, weight: Number(e.target.value) } : x))} /></td><td><div className="mastery-cell"><input type="range" min="0" max="100" value={item.mastery} onChange={(e) => update('syllabus', workspace.syllabus.map((x) => x.id === item.id ? { ...x, mastery: Number(e.target.value) } : x))} /><b>{item.mastery}%</b></div></td></tr>)}</tbody></table></div></>;
      case 5: return <><div className="inline-form"><Field label="Question / PYQ note"><input value={newPyq} onChange={(e) => setNewPyq(e.target.value)} placeholder="Paste a PYQ prompt or topic" /></Field><Field label="Subject"><input value={pyqSubject} onChange={(e) => setPyqSubject(e.target.value)} /></Field><Field label="Year"><input value={pyqYear} onChange={(e) => setPyqYear(e.target.value)} /></Field><Field label="Pattern"><select value={pyqPattern} onChange={(e) => setPyqPattern(e.target.value)}><option>Factual</option><option>Conceptual</option><option>Statement-based</option><option>Assertion-reason</option><option>Calculation</option></select></Field><Btn onClick={() => { if (newPyq.trim()) { update('pyqs', [...workspace.pyqs, { id: uid(), subject: pyqSubject, year: pyqYear, pattern: pyqPattern, question: newPyq.trim() }]); setNewPyq(''); } }}>Log PYQ <Plus size={14} /></Btn></div><div className="stats-grid three">{['Factual', 'Conceptual', 'Statement-based', 'Assertion-reason', 'Calculation'].map((p) => <div className="stat-tile" key={p}><small>{p}</small><b>{workspace.pyqs.filter((q) => q.pattern === p).length}</b><span>logged questions</span></div>)}</div>{workspace.pyqs.length > 0 && <div className="simple-list">{workspace.pyqs.slice().reverse().map((q) => <div className="list-row" key={q.id}><div><b>{q.question}</b><small>{q.subject} · {q.year} · {q.pattern}</small></div><button className="icon-btn" onClick={() => update('pyqs', workspace.pyqs.filter((x) => x.id !== q.id))}><X size={15} /></button></div>)}</div>}</>;
      case 6: return <div className="stack gap-12"><Field label="Question structure"><select value={patternType} onChange={(e) => setPatternType(e.target.value)}><option>Factual</option><option>Conceptual</option><option>Statement-based</option><option>Assertion-reason</option><option>Calculation</option></select></Field><div className="info-banner"><b>{patternType} format</b><p>{({ Factual: 'Tests direct recall of names, dates, provisions, definitions, and one-step facts.', Conceptual: 'Tests whether you understand why a rule works and how it applies to a new example.', 'Statement-based': 'Requires checking each statement independently before evaluating the answer combinations.', 'Assertion-reason': 'Evaluate the truth of both clauses, then test whether the reason explains the assertion.', Calculation: 'Identify the required quantity, choose the correct formula, and estimate before calculating.' } as Record<string, string>)[patternType]}</p></div><p className="muted small">Your logged PYQs are counted in Feature 5. Choose one pattern at a time and practice it under a time limit.</p></div>;
      case 7: return <div className="stack gap-12"><Field label="Paste a statement to inspect"><textarea rows={3} value={mindsetText} onChange={(e) => setMindsetText(e.target.value)} /></Field>{(() => { const terms = ['always', 'never', 'only', 'all', 'none', 'entirely', 'strictly', 'without exception', 'must', 'cannot']; const hits = terms.filter((term) => mindsetText.toLowerCase().includes(term)); return <div className={`info-banner ${hits.length ? 'warning' : 'success'}`}><b>{hits.length ? `Potential trap language: ${hits.join(', ')}` : 'No common absolute modifier detected'}</b><p>This is a language heuristic, not an answer key. Extreme wording can be correct where a rule explicitly makes it absolute; check the statute or source.</p></div>; })()}</div>;
      case 8: return <div className="stack gap-12"><div className="question-box"><span className="eyebrow">STATEMENT-BASED DRILL · POLITY</span><h4>Consider the following statements:</h4><p>1. Article 356 concerns failure of constitutional machinery in a State.</p><p>2. Judicial review is completely barred whenever Article 356 is invoked.</p><b>Select the correct answer.</b><div className="option-list">{['1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2'].map((o, i) => <button key={o} className={`option ${drillAnswer === i ? 'selected' : ''} ${drillAnswer !== null && i === 0 ? 'correct' : ''}`} onClick={() => setDrillAnswer(i)}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div></div>{drillAnswer !== null && <div className={`info-banner ${drillAnswer === 0 ? 'success' : 'warning'}`}><b>{drillAnswer === 0 ? 'Correct' : 'Review this pairing'}</b><p>Statement 1 is correct. Statement 2 is too broad: Article 356 proclamations are subject to judicial review.</p></div>}<Btn variant="secondary" onClick={() => setDrillAnswer(null)}>Reset drill</Btn></div>;
      case 9: return <div className="stack gap-12"><p className="muted small">Edit the sample options, then mark options you can confidently eliminate.</p><div className="option-list">{eliminationText.map((option, i) => <div className={`option ${eliminated.includes(i) ? 'eliminated' : ''}`} key={i}><input value={option} onChange={(e) => setEliminationText(eliminationText.map((x, n) => n === i ? e.target.value : x))} /><button className="btn quiet small" onClick={() => setEliminated(eliminated.includes(i) ? eliminated.filter((x) => x !== i) : [...eliminated, i])}>{eliminated.includes(i) ? 'Restore' : 'Eliminate'}</button></div>)}</div><div className="info-banner"><b>{eliminated.length} of 4 options eliminated</b><p>Eliminate only when you can justify why the option is wrong; a heuristic is not proof.</p></div><Btn variant="secondary" onClick={() => setEliminated([])}>Clear eliminations</Btn></div>;
      case 10: { const p = Math.max(0, Math.min(3, guessEliminated)); const remaining = Math.max(1, 4 - p); const probability = 1 / remaining; const expected = probability * 1 - (1 - probability) * currentExam.negative; return <div className="stack gap-12"><div className="two-grid"><Field label="Wrong options eliminated"><input type="range" min="0" max="3" value={guessEliminated} onChange={(e) => setGuessEliminated(Number(e.target.value))} /><b>{guessEliminated}</b></Field><Field label="Number of questions"><input type="number" min="1" max="100" value={guessQuestions} onChange={(e) => setGuessQuestions(Number(e.target.value))} /></Field></div><div className="stats-grid three"><div className="stat-tile"><small>Remaining options</small><b>{remaining}</b></div><div className="stat-tile"><small>Guess probability</small><b>{Math.round(probability * 100)}%</b></div><div className="stat-tile"><small>Expected net / item</small><b className={expected >= 0 ? 'positive' : 'negative'}>{moneyless(expected)}</b></div></div><div className="info-banner"><b>Expected net across {guessQuestions} guesses: {moneyless(expected * guessQuestions)} marks</b><p>Assumes exactly one correct answer, random selection among remaining options, +1 for a correct response, and −{currentExam.negative} for a wrong response. Verify your exam’s actual scoring rules.</p></div></div>; }
      case 11: return <div className="stack gap-12"><div className="inline-form"><Field label="Add a tactic"><input value={newTactic} onChange={(e) => setNewTactic(e.target.value)} placeholder="e.g. Check marked questions last" /></Field><Btn onClick={() => { if (newTactic.trim()) { setTactics([...tactics, newTactic.trim()]); setNewTactic(''); } }}><Plus size={14} /> Add rule</Btn></div><div className="check-list">{tactics.map((tactic, i) => <label key={`${tactic}-${i}`} className="check-row"><input type="checkbox" defaultChecked /><span>{tactic}</span></label>)}</div><Field label="Time budget per question (seconds)"><input type="range" min="20" max="120" defaultValue="50" /></Field></div>;
      case 12: case 19: return <div className="stack gap-12"><label className="upload-zone"><Upload size={24} /><b>{id === 12 ? 'Choose study material' : 'Import one or multiple files'}</b><span>PDF, TXT, Markdown, CSV, JSON, or HTML · up to 30 MB per file</span><input type="file" accept=".pdf,.txt,.md,.csv,.json,.html,.htm,text/plain,text/markdown,text/csv,application/pdf,application/json" multiple={id === 19} onChange={(e) => { if (e.target.files) void ingestFiles(e.target.files); e.currentTarget.value = ''; }} /></label>{uploadStatus && <div className="info-banner"><p>{uploadStatus}</p></div>}{workspace.document && <div className="imported-file"><FileText size={20} /><div><b>{workspace.document.name}</b><small>{workspace.document.paragraphs.length} text blocks · imported {new Date(workspace.document.importedAt).toLocaleString()}</small></div><Btn size="small" variant="secondary" onClick={() => setActiveModule('6')}>Open document tools</Btn></div>}<p className="disclaimer">PDFs must contain selectable text. OCR for scanned-image PDFs is not included. Files are processed in this browser and are not uploaded to an EXAM OS server.</p></div>;
      case 13: return <div className="stack gap-12">{!workspace.document ? <EmptyState text="Import a PDF or text file in Feature 12 to use Read Mode." /> : <><Field label="Search imported material"><input value={readQuery} onChange={(e) => setReadQuery(e.target.value)} placeholder="Find a word or phrase" /></Field><div className="document-reader">{workspace.document.text.split(/\n+/).filter((line) => !readQuery || line.toLowerCase().includes(readQuery.toLowerCase())).slice(0, 100).map((line, i) => <p key={i}>{line}</p>)}</div><small className="muted">Showing matching lines from {workspace.document.name}.</small></>}</div>;
      case 14: return <div className="stack gap-12">{workspace.cards.length === 0 ? <EmptyState text="Import material or add a manual flashcard to start Learn Mode." /> : <><div className="flashcard" onClick={() => setFlashFlipped(!flashFlipped)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setFlashFlipped(!flashFlipped)}><span>{flashFlipped ? 'ANSWER' : 'PROMPT'} · CARD {Math.min(flashIndex + 1, workspace.cards.length)} / {workspace.cards.length}</span><b>{flashFlipped ? workspace.cards[flashIndex]?.back : workspace.cards[flashIndex]?.front}</b><small>Click card to flip</small></div><div className="button-row"><Btn variant="secondary" onClick={() => { setFlashIndex((i) => (i - 1 + workspace.cards.length) % workspace.cards.length); setFlashFlipped(false); }}>Previous</Btn><Btn onClick={() => { setFlashIndex((i) => (i + 1) % workspace.cards.length); setFlashFlipped(false); }}>Next card <ArrowRight size={14} /></Btn></div></> }<ManualCardAdder onAdd={addCard} /></div>;
      case 15: { const cards = workspace.cards; const card = cards[mcqIndex % Math.max(1, cards.length)]; const options = card ? [card.back, ...cards.filter((_, i) => i !== (mcqIndex % cards.length)).slice(0, 3).map((x) => x.back)] : []; while (options.length > 0 && options.length < 4) options.push(`Not stated in this imported passage (distractor ${options.length})`); return <div className="stack gap-12">{!card ? <EmptyState text="Import a document first. The practice prompt is generated from its extracted text, not invented as a factual answer." /> : <><div className="question-box"><span className="eyebrow">SOURCE-GROUNDED PRACTICE</span><h4>Which passage best answers this recall prompt: “{card.front}”?</h4><div className="option-list">{options.map((o, i) => <button key={i} className={`option ${mcqAnswer === i ? 'selected' : ''} ${mcqReveal && i === 0 ? 'correct' : ''}`} onClick={() => { setMcqAnswer(i); setMcqReveal(false); }}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div>{mcqReveal && <div className={`info-banner ${mcqAnswer === 0 ? 'success' : 'warning'}`}><b>{mcqAnswer === 0 ? 'Correct source passage' : 'Review the source passage'}</b><p>{card.back}</p><p>The correct source-backed option is A in this generated set. Distractors are other paragraphs from your imported material.</p></div>}</div><div className="button-row"><Btn variant="secondary" onClick={() => { setMcqIndex((i) => (i + 1) % cards.length); setMcqAnswer(null); setMcqReveal(false); }}>Next prompt</Btn><Btn disabled={mcqAnswer === null} onClick={() => setMcqReveal(true)}>Check answer</Btn></div></>}</div>; }
      case 16: return <div className="stack gap-12">{dueCards.length === 0 ? <EmptyState text="No cards are due right now. Import material or add a flashcard to build your revision queue." /> : <><div className="info-banner"><b>{dueCards.length} cards due</b><p>Rate each card honestly. “Need practice” schedules it tomorrow; “Know it” increases the interval.</p></div><div className="flashcard"><span>REVISION QUEUE</span><b>{dueCards[flashIndex % dueCards.length]?.front}</b><p>{dueCards[flashIndex % dueCards.length]?.back}</p></div><div className="button-row"><Btn variant="secondary" onClick={() => rescheduleCard(dueCards[flashIndex % dueCards.length].id, false)}>Need practice</Btn><Btn onClick={() => rescheduleCard(dueCards[flashIndex % dueCards.length].id, true)}>Know it <Check size={14} /></Btn></div></>}</div>;
      case 17: return <div className="stack gap-12">{workspace.cards.length === 0 ? <EmptyState text="Import some study material to build a source-based test." /> : <><div className="question-box"><span className="eyebrow">TEST MODE · {testIndex + 1} / {Math.min(5, workspace.cards.length)}</span><h4>{workspace.cards[testIndex % Math.min(5, workspace.cards.length)]?.front}</h4><Field label="Write the answer from memory"><textarea rows={3} value={testAnswers[workspace.cards[testIndex % Math.min(5, workspace.cards.length)]?.id || ''] === undefined ? '' : String(testAnswers[workspace.cards[testIndex % Math.min(5, workspace.cards.length)]?.id])} onChange={(e) => setTestAnswers({ ...testAnswers, [workspace.cards[testIndex % Math.min(5, workspace.cards.length)].id]: e.target.value as any })} /></Field><p className="muted small">This is an open-response self-test. Reveal the source in Read Mode to check your answer.</p></div><div className="button-row"><Btn variant="secondary" onClick={() => setTestIndex((i) => (i + 1) % Math.min(5, workspace.cards.length))}>Next question</Btn><Btn onClick={() => setTestDone(true)}>Finish test</Btn></div>{testDone && <div className="info-banner success"><b>Test saved for self-review.</b><p>Compare your written answers with the source passages. This open-response test does not claim automatic semantic grading.</p></div>}</>}</div>;
      case 18: return <div className="stack gap-12"><Field label="Passage to highlight"><textarea rows={2} value={highlightQuote} onChange={(e) => setHighlightQuote(e.target.value)} placeholder="Paste an important paragraph or rule" /></Field><Field label="Your annotation"><input value={highlightNote} onChange={(e) => setHighlightNote(e.target.value)} placeholder="Why is this important?" /></Field><Btn disabled={!highlightQuote.trim()} onClick={() => { update('highlights', [...workspace.highlights, { id: uid(), quote: highlightQuote.trim(), note: highlightNote.trim() }]); setHighlightQuote(''); setHighlightNote(''); }}>Save annotation <Plus size={14} /></Btn>{workspace.highlights.map((h) => <div className="annotation" key={h.id}><b>{h.note || 'Saved highlight'}</b><p>{h.quote}</p><button className="text-btn" onClick={() => update('highlights', workspace.highlights.filter((x) => x.id !== h.id))}>Remove</button></div>)}</div>;
      case 20: return <div className="stack gap-12">{!workspace.document ? <EmptyState text="Import material to extract repeated terms and key phrases." /> : <><div className="tag-cloud">{(() => { const words = workspace.document.text.toLowerCase().match(/[a-z][a-z-]{4,}/g) || []; const counts = new Map<string, number>(); words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([w, n]) => <span className="tag" key={w}>{w}<b>{n}</b></span>); })()}</div><p className="disclaimer">Frequency-based extraction only. These are candidate keywords, not verified concepts or an AI summary.</p></>}</div>;
      case 21: return <div className="stack gap-12"><Field label="Paste a sentence or rule to inspect"><textarea rows={3} value={confusionText} onChange={(e) => setConfusionText(e.target.value)} /></Field>{(() => { const patterns = [{ re: /\b(not|no|never|cannot|doesn't|isn't|except)\b/i, name: 'Negation / exception' }, { re: /\b(unless|provided that|subject to)\b/i, name: 'Conditional qualifier' }, { re: /\b(always|only|all|none|entirely|without exception|strictly)\b/i, name: 'Absolute language' }]; const found = patterns.filter((p) => p.re.test(confusionText)).map((p) => p.name); return <div className="info-banner warning"><b>{found.length ? `Review signals: ${found.join(' · ')}` : 'No common language signals found'}</b><p>Language signals are prompts for closer reading, not proof that a statement is false. Compare each rule with its exact source and exceptions.</p></div>; })()}</div>;
      case 22: return <div className="stack gap-12"><div className="inline-form"><Field label="Formula / rule name"><input value={formulaName} onChange={(e) => setFormulaName(e.target.value)} /></Field><Field label="Expression"><input value={formulaValue} onChange={(e) => setFormulaValue(e.target.value)} placeholder="e.g. Speed = Distance / Time" /></Field><Btn onClick={() => { if (formulaName.trim() && formulaValue.trim()) { update('formulas', [...workspace.formulas, { id: uid(), name: formulaName.trim(), formula: formulaValue.trim() }]); setFormulaName(''); setFormulaValue(''); } }}>Add formula <Plus size={14} /></Btn></div>{workspace.formulas.map((f) => <div className="list-row" key={f.id}><div><b>{f.name}</b><small className="formula-text">{f.formula}</small></div><button className="icon-btn" onClick={() => update('formulas', workspace.formulas.filter((x) => x.id !== f.id))}><X size={15} /></button></div>)}</div>;
      case 23: return <div className="stack gap-12"><Field label="Enter a list of ideas or key terms"><textarea rows={3} value={mnemonicInput} onChange={(e) => setMnemonicInput(e.target.value)} /></Field><Btn onClick={() => setMnemonic(mnemonicInput.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean).map((x) => x[0]?.toUpperCase()).join(' · '))}>Generate initials mnemonic <Sparkles size={14} /></Btn>{mnemonic && <div className="mnemonic-output"><span>MEMORY CUE</span><b>{mnemonic}</b><small>Use the cue to recall the full list, then test yourself without looking.</small></div>}</div>;
      case 24: return <div className="stack gap-12"><div className="stats-grid four">{[1, 3, 7, 30].map((d) => <div className="stat-tile" key={d}><small>Day {d} review</small><b>{workspace.cards.filter((c) => c.interval >= d && c.reviewAt <= Date.now() + d * 86400000).length}</b><span>cards in this interval</span></div>)}</div><p className="muted small">Review intervals are scheduled locally from the time you mark a card as known or needing practice.</p></div>;
      case 25: return <div className="stack gap-12">{[1, 3, 7, 30].map((d) => <div className="review-stage" key={d}><div><b>Day {d} stack</b><small>{d === 1 ? 'Initial recall' : d === 3 ? 'Short-term reinforcement' : d === 7 ? 'Weekly consolidation' : 'Long-term retention'}</small></div><strong>{workspace.cards.filter((c) => c.reviewAt <= Date.now() + d * 86400000 && c.interval <= d).length}</strong></div>)}<div className="muted small">Due cards can be reviewed in Feature 16. The stack is shared with your imported flashcards.</div></div>;
      case 26: return <div className="stack gap-12"><Field label="Write what you remember before opening your notes"><textarea rows={6} value={workspace.recallText} onChange={(e) => update('recallText', e.target.value)} placeholder="Start with the topic title. Write definitions, rules, examples, exceptions, and connections…" /></Field><div className="button-row"><Btn onClick={() => setRecallFeedback(`Saved ${workspace.recallText.trim().split(/\s+/).filter(Boolean).length} words to your local recall workspace.`)}>Save recall</Btn><Btn variant="secondary" onClick={() => setRecallFeedback('Now compare your recall with the source document and add missing points as flashcards.')}>Show review prompt</Btn></div>{recallFeedback && <div className="info-banner success">{recallFeedback}</div>}</div>;
      case 27: return <div className="stack gap-12"><Field label="Teach this concept in your own words"><textarea rows={5} value={workspace.teachText} onChange={(e) => update('teachText', e.target.value)} placeholder="Explain the concept as if you were teaching a beginner…" /></Field><Btn onClick={() => { const words = workspace.teachText.trim().split(/\s+/).filter(Boolean); const connectors = ['because', 'therefore', 'however', 'example', 'means', 'unless', 'whereas', 'under']; const hits = connectors.filter((w) => workspace.teachText.toLowerCase().includes(w)); setTeachFeedback(`Local rubric: ${words.length} words · ${hits.length} explanation connectors detected. ${words.length >= 80 && hits.length >= 2 ? 'Good structure. Now verify accuracy and exceptions against your source.' : 'Add a definition, the reason behind the rule, one example, and one exception.'}`); }}>Evaluate explanation</Btn>{teachFeedback && <div className="info-banner">{teachFeedback}<p className="muted small">This is a transparent writing heuristic, not an AI factuality score.</p></div>}</div>;
      case 28: return <div className="stack gap-12"><div className="two-grid"><Field label="Section / subject"><select value={sectionTopic} onChange={(e) => setSectionTopic(e.target.value)}>{['Polity', 'Mathematics', 'Geography', 'Science', 'Imported material'].map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Question count"><input type="number" min="1" max="20" value={sectionCount} onChange={(e) => setSectionCount(Number(e.target.value))} /></Field></div><div className="info-banner"><b>Practice set ready</b><p>{Math.min(sectionCount, currentQuestions.length)} available questions · {sectionTopic}. Your imported cards are used when available.</p></div><Btn onClick={() => { setMockStarted(true); setMockFinished(false); setMockIndex(0); setMockAnswers({}); setMockTime(Math.max(60, Math.min(sectionCount, 20) * 60)); setActiveModule('8'); }}>Start sectional practice <ArrowRight size={14} /></Btn></div>;
      case 29: return <div className="stack gap-12">{!mockStarted ? <><div className="stats-grid three"><div className="stat-tile"><small>Question bank</small><b>{currentQuestions.length}</b></div><div className="stat-tile"><small>Time allowance</small><b>{currentExam.time} min</b></div><div className="stat-tile"><small>Negative marking</small><b>{currentExam.negative ? `−${currentExam.negative}` : 'None'}</b></div></div><p className="muted small">Start the mock to answer the sample question bank. This small starter bank is illustrative; expand it with your own PYQs and source-based practice items.</p><Btn onClick={() => { setMockStarted(true); setMockFinished(false); setMockIndex(0); setMockAnswers({}); setMockTime(Math.min(20, currentExam.time) * 60); }}>Start CBT mock <Play size={14} /></Btn></> : mockFinished ? <div className="info-banner success"><b>Mock finished</b><p>{Object.keys(mockAnswers).length} of {currentQuestions.length} answered. Score: {currentQuestions.reduce((s, q) => s + (mockAnswers[q.id] === q.answer ? 1 : 0), 0)} / {currentQuestions.length} correct.</p><Btn onClick={() => { const score = Math.round(currentQuestions.reduce((s, q) => s + (mockAnswers[q.id] === q.answer ? 1 : 0), 0) / currentQuestions.length * 100); update('sessions', [...workspace.sessions, { id: uid(), date: todayISO(), minutes: Math.round((20 * 60 - mockTime) / 60), score, label: 'CBT mock' }]); setMockStarted(false); }}>Save mock result</Btn></div> : <><div className="mock-toolbar"><span>Question {mockIndex + 1} / {currentQuestions.length}</span><b><Timer size={14} /> {formattedTime(mockTime)}</b></div><div className="question-box"><span className="eyebrow">{currentQuestions[mockIndex].topic}</span><h4>{currentQuestions[mockIndex].question}</h4><div className="option-list">{currentQuestions[mockIndex].options.map((o, i) => <button key={i} className={`option ${mockAnswers[currentQuestions[mockIndex].id] === i ? 'selected' : ''}`} onClick={() => setMockAnswers({ ...mockAnswers, [currentQuestions[mockIndex].id]: i })}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div></div><div className="button-row"><Btn variant="secondary" disabled={mockIndex === 0} onClick={() => setMockIndex((i) => i - 1)}>Previous</Btn><Btn onClick={() => mockIndex === currentQuestions.length - 1 ? setMockFinished(true) : setMockIndex((i) => i + 1)}>{mockIndex === currentQuestions.length - 1 ? 'Submit mock' : 'Next question'}</Btn></div></>}</div>;
      case 30: return <div className="timer-card"><div className="timer-display">{formattedTime(speedTime)}</div><p className="muted">One-minute pace drill. Answer as many questions as possible without sacrificing accuracy.</p><div className="button-row center">{!speedRunning ? <Btn onClick={() => { setSpeedDone(false); if (speedTime === 0) setSpeedTime(60); setSpeedRunning(true); }}><Play size={14} /> Start drill</Btn> : <Btn variant="secondary" onClick={() => setSpeedRunning(false)}><Pause size={14} /> Pause</Btn>}<Btn variant="quiet" onClick={() => { setSpeedRunning(false); setSpeedTime(60); setSpeedDone(false); }}>Reset</Btn></div>{speedDone && <div className="info-banner success">Time is up. Log the number of questions attempted in your performance notes.</div>}</div>;
      case 31: return <div className="stack gap-12"><div className="inline-form"><Field label="Question / concept"><input value={mistakeQuestion} onChange={(e) => setMistakeQuestion(e.target.value)} placeholder="What did you get wrong?" /></Field><Field label="Error type"><select value={mistakeType} onChange={(e) => setMistakeType(e.target.value)}><option>Factual error</option><option>Conceptual error</option><option>Calculation error</option><option>Misread question</option><option>Time pressure</option><option>Guessing error</option></select></Field><Field label="Marks lost"><input type="number" min="0" step="0.25" value={mistakeCost} onChange={(e) => setMistakeCost(e.target.value)} /></Field><Field label="Source"><input value={mistakeSource} onChange={(e) => setMistakeSource(e.target.value)} placeholder="Exam / book / mock" /></Field><Btn onClick={addMistake} disabled={!mistakeQuestion.trim()}>Log mistake <Plus size={14} /></Btn></div><div className="simple-list">{workspace.mistakes.map((m) => <div className="list-row" key={m.id}><div><b>{m.question}</b><small>{m.type} · {m.source} · {m.recovered ? 'Recovered' : 'Open'}</small></div><b className={m.recovered ? 'positive' : 'negative'}>{m.cost.toFixed(2)}</b></div>)}</div></div>;
      case 32: return <div className="stack gap-12"><div className="stats-grid three">{['Factual error', 'Conceptual error', 'Calculation error', 'Misread question', 'Time pressure', 'Guessing error'].map((type) => <div className="stat-tile" key={type}><small>{type}</small><b>{workspace.mistakes.filter((m) => m.type === type).length}</b><span>logged</span></div>)}</div><p className="muted small">Change the error category in Feature 31 when you identify the root cause. The counts update from your mistake log.</p></div>;
      case 33: return <div className="stack gap-12">{workspace.mistakes.filter((m) => !m.recovered).length === 0 ? <EmptyState text="No unresolved mistakes. Keep logging new errors after practice sessions." /> : workspace.mistakes.filter((m) => !m.recovered).map((m) => <div className="list-row" key={m.id}><div><b>{m.question}</b><small>{m.type} · {m.cost.toFixed(2)} marks</small></div><Btn size="small" variant="secondary" onClick={() => update('mistakes', workspace.mistakes.map((x) => x.id === m.id ? { ...x, recovered: true } : x))}>Mark recovered</Btn></div>)}</div>;
      case 34: return <div className="stack gap-12"><div className="stats-grid three"><div className="stat-tile"><small>Open mistakes</small><b>{workspace.mistakes.filter((m) => !m.recovered).length}</b></div><div className="stat-tile"><small>Marks at risk</small><b className="negative">{moneyless(totalMistakeCost)}</b></div><div className="stat-tile"><small>Recovered items</small><b className="positive">{workspace.mistakes.filter((m) => m.recovered).length}</b></div></div><div className="info-banner warning"><b>Potential marks to recover: {moneyless(totalMistakeCost)}</b><p>This is the sum of marks you entered for unresolved mistakes, not a prediction of marks gained in a future exam.</p></div></div>;
      case 35: return <div className="stack gap-12"><div className="readiness-wrap"><div className="readiness-ring" style={{ background: `conic-gradient(var(--accent) ${readiness * 3.6}deg, #27314a 0deg)` }}><div><b>{readiness}%</b><small>readiness</small></div></div><div><h4>{readiness >= 80 ? 'Strong preparation trend' : readiness >= 60 ? 'Building consistency' : 'Focus on core foundations'}</h4><p className="muted">Calculated from topic mastery (45%), daily task completion (25%), and recorded mock scores (30%).</p></div></div><div className="progress"><i style={{ width: `${readiness}%` }} /></div></div>;
      case 36: return <div className="stack gap-12"><div className="inline-form"><Field label="Topic"><input value={roiTopic} onChange={(e) => setRoiTopic(e.target.value)} /></Field><Field label="Hours to study"><input type="number" min="1" value={roiHours} onChange={(e) => setRoiHours(Number(e.target.value))} /></Field><Field label="Expected marks / weight"><input type="number" min="0" value={roiMarks} onChange={(e) => setRoiMarks(Number(e.target.value))} /></Field></div><div className="info-banner success"><b>{roiHours > 0 ? (roiMarks / roiHours).toFixed(2) : '—'} expected marks per study hour</b><p>Rank topics by marks-per-hour potential, then adjust using your actual weakness and exam weightage. The values are your estimates.</p></div></div>;
      case 37: return <div className="stack gap-12"><div className="inline-form"><Field label="Session label"><input value={sessionLabel} onChange={(e) => setSessionLabel(e.target.value)} /></Field><Field label="Minutes studied"><input type="number" min="1" max="1440" value={sessionMinutes} onChange={(e) => setSessionMinutes(Number(e.target.value))} /></Field><Btn onClick={addSession}><Plus size={14} /> Log session</Btn></div><div className="stats-grid three"><div className="stat-tile"><small>Total logged minutes</small><b>{workspace.sessions.reduce((s, x) => s + x.minutes, 0)}</b></div><div className="stat-tile"><small>Study sessions</small><b>{workspace.sessions.length}</b></div><div className="stat-tile"><small>Mock results saved</small><b>{workspace.sessions.filter((x) => x.score !== undefined).length}</b></div></div><div className="simple-list">{workspace.sessions.slice().reverse().slice(0, 8).map((s) => <div className="list-row" key={s.id}><div><b>{s.label}</b><small>{s.date} · {s.minutes} minutes</small></div>{s.score !== undefined && <b>{s.score}%</b>}</div>)}</div></div>;
      case 38: return <div className="stack gap-12"><div className="mission-progress"><b>{todayTasksDone} / {workspace.tasks.length}</b><span>daily mission tasks done</span></div><div className="progress"><i style={{ width: `${todayTasksDone / Math.max(1, workspace.tasks.length) * 100}%` }} /></div><div className="check-list">{workspace.tasks.map((task) => <label className="check-row" key={task.id}><input type="checkbox" checked={task.done} onChange={(e) => markTask(task.id, e.target.checked)} /><span className={task.done ? 'completed' : ''}>{task.label}</span></label>)}</div><Btn variant="secondary" onClick={() => update('tasks', workspace.tasks.map((t) => ({ ...t, done: false })))}>Reset today’s checklist</Btn></div>;
      case 39: return <div className="timer-card"><div className="timer-display">{formattedTime(pomodoroTime)}</div><p className="muted">25-minute focus block · keep one task open and silence non-essential notifications.</p><div className="button-row center"><Btn onClick={() => setPomodoroRunning(!pomodoroRunning)}>{pomodoroRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start focus</>}</Btn><Btn variant="secondary" onClick={() => { setPomodoroRunning(false); setPomodoroTime(25 * 60); }}>Reset</Btn></div>{pomodoroTime === 0 && <div className="info-banner success">Focus block complete. Take a short break and log the session in Feature 37.</div>}</div>;
      case 40: return <div className="stack gap-12"><Field label="What interrupted your focus?"><input value={distractionNote} onChange={(e) => setDistractionNote(e.target.value)} placeholder="e.g. phone notification, noise, fatigue" /></Field><Btn onClick={() => { update('distractions', [...workspace.distractions, { id: uid(), time: new Date().toLocaleTimeString(), note: distractionNote.trim() || 'Unspecified interruption' }]); setDistractionNote(''); }}>Log interruption <Plus size={14} /></Btn><div className="stats-grid two"><div className="stat-tile"><small>Total interruptions logged</small><b>{workspace.distractions.length}</b></div><div className="stat-tile"><small>Most recent</small><b>{workspace.distractions.at(-1)?.time || '—'}</b></div></div>{workspace.distractions.slice().reverse().slice(0, 5).map((d) => <div className="list-row" key={d.id}><span>{d.note}</span><small>{d.time}</small></div>)}</div>;
      case 41: return <div className="stack gap-12"><div className="streak-card"><Flame size={28} /><b>{workspace.streak} day{workspace.streak === 1 ? '' : 's'}</b><span>current recorded study streak</span></div><p className="muted small">Mark at most one study day per calendar day. A missed day resets the next recorded streak to 1.</p><Btn onClick={markHabitToday} disabled={workspace.lastStudyDate === todayISO()}>{workspace.lastStudyDate === todayISO() ? 'Today already recorded' : 'Mark today as a study day'} <Check size={14} /></Btn><small className="muted">Last recorded: {workspace.lastStudyDate || 'Not yet recorded'}</small></div>;
      case 42: return <div className="stack gap-12"><Field label="Today’s commitment"><textarea rows={2} value={accountabilityText} onChange={(e) => setAccountabilityText(e.target.value)} /></Field><Field label="End-of-day reflection"><textarea rows={3} value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} placeholder="What did you complete? What needs adjustment?" /></Field><Btn onClick={() => { update('accountabilityPlan', accountabilityText); update('accountabilityReflection', reflectionText); }}>Save check-in</Btn></div>;
      case 43: return <div className="stack gap-12"><div className="disclaimer">This is a local comparison board, not a live community leaderboard. Demo entries are illustrative and do not represent real students.</div><div className="simple-list">{[...leaderboard, { name: 'You', score: readiness }].sort((a, b) => b.score - a.score).map((l, i) => <div className="list-row" key={`${l.name}-${i}`}><b>{i + 1}. {l.name}</b><b>{l.score}% readiness</b></div>)}</div><div className="inline-form"><Field label="Local learner label"><input value={newLeaderboardName} onChange={(e) => setNewLeaderboardName(e.target.value)} /></Field><Field label="Readiness score"><input type="number" min="0" max="100" value={newLeaderboardScore} onChange={(e) => setNewLeaderboardScore(e.target.value)} /></Field><Btn onClick={() => { if (newLeaderboardName.trim()) { setLeaderboard([...leaderboard, { name: newLeaderboardName.trim(), score: Math.max(0, Math.min(100, Number(newLeaderboardScore) || 0)) }]); setNewLeaderboardName(''); setNewLeaderboardScore(''); } }}>Add local entry</Btn></div></div>;
      case 44: return <div className="stack gap-12"><div className="inline-form"><Field label="Headline / development"><input value={currentHeadline} onChange={(e) => setCurrentHeadline(e.target.value)} /></Field><Field label="Syllabus mapping"><input value={currentTopic} onChange={(e) => setCurrentTopic(e.target.value)} /></Field><Field label="Exam angle / note"><input value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} /></Field><Btn onClick={() => { if (currentHeadline.trim()) { update('currentAffairs', [...workspace.currentAffairs, { id: uid(), headline: currentHeadline.trim(), topic: currentTopic, note: currentNote, date: todayISO() }]); setCurrentHeadline(''); setCurrentNote(''); } }}>Save news note</Btn></div>{workspace.currentAffairs.map((n) => <div className="annotation" key={n.id}><span className="eyebrow">{n.date} · {n.topic}</span><b>{n.headline}</b><p>{n.note}</p></div>)}<p className="disclaimer">No live news feed is connected. Add an article or development you have verified from a trusted source and map it to your syllabus.</p></div>;
      case 45: return <div className="stack gap-12"><p className="muted">Generate an adaptive plan from your saved syllabus, tasks, due cards, and unresolved mistakes.</p><Btn onClick={() => void askCoach()} disabled={aiLoading}>{aiLoading ? 'Generating…' : 'Generate study plan'} <Sparkles size={14} /></Btn>{aiMessage && <div className="info-banner"><p>{aiMessage}</p></div>}{aiResult && <pre className="ai-output">{aiResult}</pre>}<p className="disclaimer">Live AI requires a key configured in Feature 52. Without a key, this tool provides a transparent local plan. AI responses may be wrong; verify exam facts.</p></div>;
      case 46: return <div className="stack gap-12"><div className="mode-grid">{['Deep work', 'Revision', 'Mock exam', 'Recovery'].map((m) => <button className={`mode-choice ${mode === m ? 'active' : ''}`} key={m} onClick={() => { setMode(m); update('operationMode', m); }}><b>{m}</b><small>{{ 'Deep work': 'One topic · one focus block', Revision: 'Due cards · active recall', 'Mock exam': 'Timed questions · strict rules', Recovery: 'Mistakes · short priority list' }[m]}</small></button>)}</div><div className="info-banner"><b>Mode active: {mode}</b><p>{{ 'Deep work': 'Keep one topic open and complete a 25-minute Pomodoro.', Revision: 'Start with due cards, then use blank-page recall.', 'Mock exam': 'Use the CBT arena and avoid looking at notes.', Recovery: 'Do not add new topics. Recover the highest-cost mistakes first.' }[mode]}</p></div></div>;
      case 47: return <div className="stack gap-12"><Field label="Describe your doubt clearly"><textarea rows={3} value={doubt} onChange={(e) => setDoubt(e.target.value)} placeholder="Which concept, rule, step, or exception is confusing?" /></Field><Btn disabled={!doubt.trim() || aiLoading} onClick={() => void solveDoubt()}>{aiLoading ? 'Working…' : 'Solve my doubt'} <MessageCircle size={14} /></Btn>{aiMessage && <div className="info-banner"><p>{aiMessage}</p></div>}{aiResult && <pre className="ai-output">{aiResult}</pre>}<p className="disclaimer">The local fallback is a question-structuring guide. Live AI explanations require Feature 52 and must be checked against your textbook or official source.</p></div>;
      case 48: return <div className="stack gap-12"><div className="panic-banner"><AlertTriangle size={22} /><div><b>{panicMode ? 'Panic mode is active' : 'Switch to a simpler plan'}</b><p>Pause new topics. Reduce the next study block to three achievable actions.</p></div></div><Btn variant={panicMode ? 'secondary' : 'danger'} onClick={() => setPanicMode(!panicMode)}>{panicMode ? 'Exit panic mode' : 'Activate panic mode'}</Btn>{panicMode && <div className="check-list">{['Take 3 minutes to reset and breathe', 'Review the 5 most important due cards', 'Solve one short, familiar practice set'].map((x) => <label className="check-row" key={x}><input type="checkbox" /><span>{x}</span></label>)}</div>}</div>;
      case 49: { const days = workspace.examDate ? Math.ceil((new Date(workspace.examDate + 'T12:00:00').getTime() - Date.now()) / 86400000) : null; return <div className="stack gap-12"><div className="info-banner warning"><b>{days === null ? 'Set your exam date in Feature 1' : days < 0 ? 'The selected exam date has passed' : `${days} days until your exam`}</b><p>Use this protocol only in the final day before the exam. Protect sleep, meals, and travel time.</p></div><div className="schedule-list">{[['06:30', 'Wake, hydrate, light review'], ['07:30', 'Formula sheet and high-value facts'], ['09:00', 'Short timed practice set'], ['10:00', 'Review mistakes; no new chapters'], ['12:00', 'Rest, meal, and logistics'], ['15:00', 'Flashcards and key exceptions'], ['18:00', 'Pack documents and plan travel'], ['20:00', 'Stop heavy study and sleep routine']].map(([time, task]) => <div className="schedule-row" key={time}><b>{time}</b><span>{task}</span></div>)}</div></div>; }
      case 50: return <div className="stack gap-12"><div className="mission-progress"><b>{workspace.milestones.filter((m) => m.done).length}/{workspace.milestones.length}</b><span>milestones achieved</span></div><div className="check-list">{workspace.milestones.map((m) => <label className="check-row" key={m.id}><input type="checkbox" checked={m.done} onChange={(e) => update('milestones', workspace.milestones.map((x) => x.id === m.id ? { ...x, done: e.target.checked } : x))} /><span className={m.done ? 'completed' : ''}>{m.label}</span></label>)}</div></div>;
      case 51: return <div className="stack gap-12"><div className="inline-form"><Field label="Note title"><input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} /></Field><Field label="Tag"><input value={noteTag} onChange={(e) => setNoteTag(e.target.value)} /></Field><Field label="Note content"><textarea rows={2} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} /></Field><Btn onClick={() => { if (noteTitle.trim() && noteBody.trim()) { update('communityNotes', [...workspace.communityNotes, { id: uid(), title: noteTitle.trim(), tag: noteTag, body: noteBody.trim(), updatedAt: todayISO() }]); setNoteTitle(''); setNoteBody(''); } }}>Save note</Btn></div>{workspace.communityNotes.map((n) => <div className="annotation" key={n.id}><span className="eyebrow">{n.tag} · {n.updatedAt}</span><b>{n.title}</b><p>{n.body}</p></div>)}<Btn variant="secondary" onClick={() => exportPack('json')}>Export notes & workspace <Download size={14} /></Btn><p className="disclaimer">Notes are private to this browser until you export or share them. No cloud community service is connected.</p></div>;
      case 52: return <div className="stack gap-12"><Field label="Gemini API key"><input type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste your Gemini API key for this session" /></Field><div className="info-banner warning"><b>Security note</b><p>The key is kept only in React memory for this tab and is not saved to localStorage. AI requests go directly from your browser to Google’s Gemini API. For a public or shared deployment, use a server-side proxy and never ship a private key in frontend code.</p></div><div className="button-row"><Btn variant="secondary" onClick={() => { setApiKey(''); setAiResult(''); setAiMessage('Session API key cleared.'); }}>Clear key</Btn><span className="muted small">{apiKey ? 'Key entered for this session' : 'No AI key configured'}</span></div></div>;
      case 53: return <div className="stack gap-12"><p className="muted">Export your current study workspace: syllabus, extracted notes, flashcards, formulas, mistakes, tasks, current affairs, and community notes.</p><div className="button-row"><Btn onClick={() => exportPack('json')}><Download size={14} /> Export JSON pack</Btn><Btn variant="secondary" onClick={() => exportPack('txt')}><FileText size={14} /> Export text pack</Btn></div><div className="stats-grid three"><div className="stat-tile"><small>Notes / paragraphs</small><b>{workspace.document?.paragraphs.length || 0}</b></div><div className="stat-tile"><small>Flashcards</small><b>{workspace.cards.length}</b></div><div className="stat-tile"><small>Formulas</small><b>{workspace.formulas.length}</b></div></div></div>;
      case 54: return <div className="stack gap-12"><Field label="Text to read aloud (optional)"><textarea rows={3} value={voiceText} onChange={(e) => setVoiceText(e.target.value)} placeholder="Leave blank to read your flashcards or imported notes." /></Field><Btn onClick={() => speak(voiceText)}>{speaking ? <><VolumeX size={14} /> Stop voice</> : <><Volume2 size={14} /> Start voice revision</>}</Btn><p className="muted small">Uses your browser’s built-in speech synthesis voices. Voice availability and language depend on the device.</p></div>;
      case 55: return <div className="stack gap-12"><div className="subfeature"><span>AI Interview Trainer</span><div className="interview-q"><b>{['Tell me about yourself and your preparation strategy.', 'Explain a difficult concept you recently mastered.', 'Describe a time you identified and corrected a mistake.', 'How do you prioritize when the syllabus is larger than the available time?'][interviewQuestion % 4]}</b><Btn size="small" variant="secondary" onClick={() => { setInterviewQuestion((i) => i + 1); setInterviewAnswer(''); setInterviewFeedback(''); }}>Next question</Btn></div><Field label="Your response"><textarea rows={4} value={interviewAnswer} onChange={(e) => setInterviewAnswer(e.target.value)} /></Field><Btn disabled={!interviewAnswer.trim()} onClick={() => setInterviewFeedback(`Practice review: ${interviewAnswer.trim().split(/\s+/).length} words. Check whether your answer has a clear opening, one concrete example, your action, and a measurable outcome. Add specifics and avoid memorized claims.`)}>Review answer</Btn>{interviewFeedback && <div className="info-banner">{interviewFeedback}</div>}</div><div className="subfeature"><span>Mentor Shortlist (local)</span><div className="inline-form"><Field label="Name"><input value={mentorName} onChange={(e) => setMentorName(e.target.value)} /></Field><Field label="Specialty"><input value={mentorSpecialty} onChange={(e) => setMentorSpecialty(e.target.value)} /></Field><Field label="Contact / reminder note"><input value={mentorNote} onChange={(e) => setMentorNote(e.target.value)} /></Field><Btn onClick={() => { if (mentorName.trim()) { update('mentorShortlist', [...workspace.mentorShortlist, { id: uid(), name: mentorName.trim(), specialty: mentorSpecialty, note: mentorNote }]); setMentorName(''); setMentorSpecialty(''); setMentorNote(''); } }}>Add mentor</Btn></div>{workspace.mentorShortlist.map((m) => <div className="list-row" key={m.id}><div><b>{m.name}</b><small>{m.specialty} · {m.note}</small></div><button className="icon-btn" onClick={() => update('mentorShortlist', workspace.mentorShortlist.filter((x) => x.id !== m.id))}><X size={15} /></button></div>)}<p className="disclaimer">This is a personal shortlist and interview practice tool, not a connected mentor marketplace.</p></div></div>;
      default: return <EmptyState text="This feature is part of the EXAM OS catalogue." />;
    }
  };

  const navigateToFeature = (id: number) => {
    const module = MODULES.find((m) => m.features.includes(id));
    if (module) { setActiveModule(module.id); setShowAllFeatures(false); setMobileNav(false); }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Rocket size={19} /></div><div><b>EXAM OS</b><span>MASTER SUITE · 55 TOOLS</span></div><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
      <div className="sidebar-scroll"><div className="workspace-badge"><span className={`status-dot ${online ? 'online' : ''}`} />{online ? 'Online' : 'Offline'} <span className="badge-separator">·</span> Saved in this browser</div>
        <div className="nav-label">YOUR WORKSPACE</div>
        <button className={`nav-item ${showAllFeatures ? 'active' : ''}`} onClick={() => { setShowAllFeatures(true); setMobileNav(false); }}><ListChecks size={16} /><span>All 55 features</span><b>55</b></button>
        <div className="nav-label">13 MODULES</div>
        {MODULES.map((module) => <button key={module.id} className={`nav-item ${!showAllFeatures && activeModule === module.id ? 'active' : ''}`} onClick={() => { setActiveModule(module.id); setShowAllFeatures(false); setMobileNav(false); }}><span className="nav-icon">{module.icon}</span><span>{module.title}</span><small>{module.features.length}</small></button>)}
      </div>
      <div className="sidebar-footer"><div className="sidebar-score"><span>READINESS ESTIMATE</span><b>{readiness}%</b></div><div className="progress"><i style={{ width: `${readiness}%` }} /></div><small>Progress is stored locally on this device.</small></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="menu-button icon-btn" onClick={() => setMobileNav(true)}><Menu size={19} /></button><div><div className="breadcrumb">EXAM OS <ChevronRight size={12} /> {showAllFeatures ? 'FEATURE DIRECTORY' : `MODULE ${activeModule}`}</div><h1>{showAllFeatures ? 'All 55 features' : activeModuleData.title}</h1></div></div><div className="topbar-actions"><label className="global-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a feature…" /><kbd>⌘ K</kbd></label><div className="user-chip"><div className="avatar">S</div><span>Student workspace</span><ChevronDown size={13} /></div></div></header>

      <div className="page-content">
        {search.trim() && <div className="search-results"><div className="search-results-head"><b>Feature search</b><button className="text-btn" onClick={() => setSearch('')}>Clear</button></div>{filteredFeatures.length ? filteredFeatures.slice(0, 8).map((f) => <button key={f.id} className="search-result" onClick={() => { navigateToFeature(f.id); setSearch(''); }}><span>{String(f.id).padStart(2, '0')}</span><div><b>{f.title}</b><small>{f.description}</small></div><ChevronRight size={15} /></button>) : <p className="muted small">No matching feature. Try a different search term.</p>}</div>}

        {showAllFeatures ? <>
          <section className="welcome-banner"><div><span className="eyebrow light">COMPLETE FEATURE DIRECTORY</span><h2>One workspace. All 55 tools.</h2><p>Every numbered feature in the original EXAM OS plan is retained across all 13 modules.</p></div><div className="welcome-art"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><GraduationCap size={48} /></div></section>
          <div className="directory-grid">{MODULES.map((module) => <Panel key={module.id} className="directory-module"><div className="directory-head"><span className="module-glyph">{module.icon}</span><div><b>{module.id}. {module.title}</b><small>{module.features.length} feature{module.features.length === 1 ? '' : 's'}</small></div><button className="icon-btn" onClick={() => { setActiveModule(module.id); setShowAllFeatures(false); }}><ArrowRight size={16} /></button></div>{module.features.map((id) => <button className="directory-feature" key={id} onClick={() => navigateToFeature(id)}><span>{String(id).padStart(2, '0')}</span><b>{featureById(id).title}</b><ChevronRight size={14} /></button>)}</Panel>)}</div>
        </> : <>
          <section className="welcome-banner compact"><div><span className="eyebrow light">YOUR EXAM PREPARATION COMMAND CENTRE</span><h2>{activeModuleData.subtitle}</h2><p>All progress saves automatically in this browser. Open any feature card below to work with it.</p></div><div className="welcome-art"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><Rocket size={42} /></div></section>
          {activeModule === '1' && <div className="overview-metrics"><Metric label="Target exam" value={workspace.exam} note={`${workspace.dailyHours} hours / day commitment`} icon={<GraduationCap size={17} />} /><Metric label="Readiness" value={`${readiness}%`} note="Calculated from your workspace data" icon={<Gauge size={17} />} tone="green" /><Metric label="Study streak" value={`${workspace.streak} days`} note="Record today in Feature 41" icon={<Flame size={17} />} tone="orange" /><Metric label="Due revisions" value={`${dueCards.length}`} note={`${workspace.cards.length} flashcards in your deck`} icon={<BookOpen size={17} />} tone="blue" /></div>}
          <div className="module-heading"><div><span className="eyebrow">MODULE {activeModule} · {activeModuleData.features.length} FEATURE{activeModuleData.features.length === 1 ? '' : 'S'}</span><h2>{activeModuleData.title}</h2></div><button className="text-btn" onClick={() => setShowAllFeatures(true)}>View all 55 <ArrowRight size={14} /></button></div>
          <div className={`feature-grid ${activeModule === '6' ? 'dense' : ''}`}>{activeModuleData.features.map((id) => <FeatureCard key={id} feature={featureById(id)}>{renderFeature(id)}</FeatureCard>)}</div>
        </>}
        <footer className="app-footer"><div><b>EXAM OS · 55-FEATURE MASTER SUITE</b><span>13 modules · local-first workspace · responsive web app</span></div><div className="footer-right"><span className="status-dot online" />Autosaved locally</div></footer>
      </div>
    </main>
  </div>;
}

function EmptyState({ text }: { text: string }) { return <div className="empty-state"><BookOpen size={21} /><p>{text}</p></div>; }
function ManualCardAdder({ onAdd }: { onAdd: (front: string, back: string) => void }) {
  const [front, setFront] = useState(''); const [back, setBack] = useState('');
  return <div className="manual-card-adder"><b>Add a manual flashcard</b><div className="two-grid"><Field label="Prompt"><input value={front} onChange={(e) => setFront(e.target.value)} placeholder="What do you want to remember?" /></Field><Field label="Answer"><input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Write the explanation" /></Field></div><Btn size="small" disabled={!front.trim() || !back.trim()} onClick={() => { onAdd(front.trim(), back.trim()); setFront(''); setBack(''); }}>Add card <Plus size={13} /></Btn></div>;
}
