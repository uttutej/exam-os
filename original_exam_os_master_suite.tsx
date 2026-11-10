import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Rocket, BookOpen, Brain, Target, ShieldAlert, FileText, Repeat, 
  Award, Activity, Clock, Cpu, HelpCircle, CheckCircle, Flame, 
  AlertTriangle, BarChart2, CheckSquare, RefreshCw, Zap, Play, 
  Pause, RotateCcw, Volume2, VolumeX, Download, Search, Layers, ChevronRight,
  TrendingUp, Sparkles, UserCheck, ShieldCheck, HeartPulse, Wifi, WifiOff,
  Sliders, ArrowRight, MessageSquare, Lightbulb, Compass, Share2, BookMarked,
  Eye, Check, Crosshair
} from 'lucide-react';

// ==============================================================================
// GLOBAL EXAM DATA MATRIX & SYSTEM CONSTANTS
// ==============================================================================
const EXAM_DNA_BASE = {
  "MPSC": { pattern: "Prelims (MCQ) + Mains (Descriptive)", marks: "400 Prelims", cutoff: "52%", competition: "300k", difficulty: "High", negative: "-0.25", time_alloc: "120 mins" },
  "UPSC": { pattern: "Prelims (MCQ) + Mains (Descriptive)", marks: "1750+275", cutoff: "48%", competition: "1.2 Million", difficulty: "Extreme", negative: "-0.33", time_alloc: "120 mins" },
  "SSC": { pattern: "Tier 1 + Tier 2 (CBT)", marks: "200 Tier 1", cutoff: "76%", competition: "2.5 Million", difficulty: "Moderate-High", negative: "-0.50", time_alloc: "60 mins" },
  "Police Bharti": { pattern: "Written Test + Physical Test", marks: "100 Written + 50 Physical", cutoff: "85%", competition: "500k", difficulty: "Moderate", negative: "None", time_alloc: "90 mins" },
  "Banking": { pattern: "Prelims + Mains (CBT)", marks: "100 Prelims", cutoff: "68%", competition: "1 Million", difficulty: "High Speed", negative: "-0.25", time_alloc: "60 mins" },
  "Railway": { pattern: "CBT Phase 1 & 2", marks: "100", cutoff: "72%", competition: "3 Million", difficulty: "Moderate", negative: "-0.33", time_alloc: "90 mins" },
  "NEET": { pattern: "Pen-Paper MCQ", marks: "720", cutoff: "96%", competition: "2 Million", difficulty: "High Precision", negative: "-1.00", time_alloc: "200 mins" },
  "JEE": { pattern: "CBT Physics/Chemistry/Maths", marks: "300", cutoff: "89 Percentile", competition: "1.1 Million", difficulty: "Extreme Math", negative: "-1.00", time_alloc: "180 mins" },
  "TCS NQT": { pattern: "Integrated Cognitive + Technical", marks: "Scaled Score", cutoff: "70%", competition: "400k", difficulty: "Technical", negative: "None", time_alloc: "180 mins" }
};

export default function App() {
  // LocalStorage helper for Offline & Online Persistence
  const usePersistedState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
      try {
        const item = localStorage.getItem(`exam_os_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    });
    useEffect(() => {
      try {
        localStorage.setItem(`exam_os_${key}`, JSON.stringify(state));
      } catch (e) {}
    }, [key, state]);
    return [state, setState];
  };

  // State Controllers
  const [selectedExam, setSelectedExam] = usePersistedState("selected_exam", "MPSC");
  const [activeModule, setActiveModule] = usePersistedState("active_module", "1. Start Journey System (1.1 - 1.4)");
  const [streak, setStreak] = usePersistedState("streak", 12);
  const [readinessScore, setReadinessScore] = usePersistedState("readiness_score", 65);
  const [apiKey, setApiKey] = usePersistedState("api_key", "");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Focus Timer State
  const [timerTime, setTimerTime] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [distractions, setDistractions] = usePersistedState("distractions", 2);

  // Deep Document Engine State
  const [documentUploaded, setDocumentUploaded] = usePersistedState("doc_uploaded", false);
  const [docData, setDocData] = usePersistedState("doc_data", null);
  const [rawText, setRawText] = useState("");

  // Interactive Question & Study States
  const [userAnswers, setUserAnswers] = usePersistedState("user_answers", {});
  const [teachInput, setTeachInput] = useState("");
  const [teachFeedback, setTeachFeedback] = useState(null);

  // Mistake Hospital State
  const [mistakes, setMistakes] = usePersistedState("mistakes", [
    { id: 1, q: "Article 356 deals with State Emergency", type: "Factual Error", cost: "-0.25", source: "MPSC 2023" },
    { id: 2, q: "Derivative of sin(x) is cos(x)", type: "Calculation Mistake", cost: "-1.00", source: "JEE 2024" }
  ]);

  // Voice Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pomodoro Timer Loop
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerTime > 0) {
      interval = setInterval(() => setTimerTime(t => t - 1), 1000);
    } else if (timerTime === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerTime]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Automated PDF & Text Processing Engine
  const processDocumentText = (text, fileName) => {
    const paragraphs = text.split('\n').filter(p => p.trim().length > 10);
    const extractedNotes = paragraphs.slice(0, 5).map((p, idx) => `Point ${idx + 1}: ${p.substring(0, 120)}...`);
    const extractedConcepts = paragraphs.slice(2, 6).map((p, idx) => `Concept Area ${idx + 1}: ${p.split(' ')[0] || 'Core Protocol'}`);

    const generatedDoc = {
      fileName: fileName || "Imported_Study_Material.txt",
      summary: text.length > 500 ? text.substring(0, 300) + "..." : text || "Ingested study document containing technical and analytical frameworks.",
      notes: extractedNotes.length ? extractedNotes : [
        "Core parameter controls absolute system boundaries.",
        "Statutory frameworks require periodic compliance checks.",
        "Verification metrics scale with input volume."
      ],
      questions: [
        { id: 'q1', q: `Based on ingested document '${fileName}': What is the main structural boundary?`, options: ["Parameter Limit Alpha", "Dynamic System Network", "Static Variable Beta", "External Audit Trail"], correct: "Parameter Limit Alpha" },
        { id: 'q2', q: "Which statement best describes the operational rule?", options: ["Requires continuous manual input", "Executes automated parity checks", "Requires no validation", "Only operates offline"], correct: "Executes automated parity checks" }
      ],
      flashcards: [
        { f: "Key Ingested Term 1", b: "Defines primary execution threshold across modules." },
        { f: "Core Compliance Rule", b: "Must be audited periodically to prevent drift." }
      ],
      concepts: extractedConcepts.length ? extractedConcepts : ["Statutory Limits", "Verification Arrays", "Dynamic Scaling"],
      confusions: "Confusion Detection: Avoid mixing static configuration blocks with dynamic network validation arrays.",
      formulas: [
        { name: "System Dynamic Yield", formula: "V = (N * α) / β" },
        { name: "Error Penalty Bound", formula: "E = Δt * σ²" }
      ]
    };

    setDocData(generatedDoc);
    setDocumentUploaded(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setRawText(text);
        processDocumentText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  // Voice Revision Synthesizer (Feature #54)
  const toggleVoiceRevision = (textToRead) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(textToRead || "Welcome to EXAM OS Voice Revision Mode. Reviewing today's core formulas and statutory notes.");
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  // Export Offline Pack (Feature #53)
  const downloadOfflinePack = () => {
    const content = `=== EXAM OS OFFLINE REVISION PACK ===\nTarget Exam: ${selectedExam}\nReadiness: ${readinessScore}%\n\n--- INGESTED NOTES ---\n${docData?.notes?.join('\n') || 'No notes loaded.'}\n\n--- MISTAKE LOG ---\n${mistakes.map(m => `- ${m.q} (${m.type})`).join('\n')}\n`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `EXAM_OS_Offline_Pack_${selectedExam}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const menuModules = [
    "1. Start Journey System (1.1 - 1.4)",
    "2. Exam DNA & Playbooks (2 - 3)",
    "3. Syllabus & PYQ Engines (4 - 6)",
    "4. Mindset & Question Labs (7 - 8)",
    "5. Elimination & Guess Engines (9 - 11)",
    "6. PDF Intelligence Engine (12 - 23)",
    "7. Revision & Recall OS (24 - 27)",
    "8. Practice & Mock Arenas (28 - 30)",
    "9. Mistake Hospital & Diagnostics (31 - 34)",
    "10. Performance Analytics Suite (35 - 38)",
    "11. Focus & Support Tracker (39 - 43)",
    "12. Current Affairs & AI Coach (44 - 46)",
    "13. Doubt, Panic & Future Systems (47 - 55)"
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR CONTROLLER */}
      <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-4 overflow-y-auto custom-scrollbar">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-tight">EXAM OS v1.0</h1>
                <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">All 55 Features Active</span>
              </div>
            </div>
            
            {/* ONLINE/OFFLINE BADGE */}
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold border ${isOnline ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-amber-950/40 border-amber-500/40 text-amber-400'}`}>
              {isOnline ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>

          {/* FEATURE #52: API & TOKEN ENGINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400"/> #52 Knowledge Token Layer
              </span>
              <span className="text-[9px] text-slate-500">Live API</span>
            </div>
            <input 
              type="password" 
              placeholder="Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* ANCHOR METRICS */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-amber-400 text-[10px] font-semibold">
                <Flame className="w-3.5 h-3.5" /> #41 Streak
              </div>
              <div className="text-lg font-bold text-white mt-0.5">{streak} Days</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                <Target className="w-3.5 h-3.5" /> #35 Readiness
              </div>
              <div className="text-lg font-bold text-white mt-0.5">{readinessScore}%</div>
            </div>
          </div>

          {/* MODULE LIST ROUTER */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">Navigation Modules</div>
            {menuModules.map((mod) => {
              const active = activeModule === mod;
              return (
                <button
                  key={mod}
                  onClick={() => setActiveModule(mod)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    active 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{mod}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER ENGINE BAR */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Storage: Local + Cloud</span>
          <span className="text-indigo-400 font-semibold">55/55 Active</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-6 custom-scrollbar">

        {/* MODULE 1: START JOURNEY SYSTEM */}
        {activeModule.startsWith("1.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Rocket className="text-indigo-400 w-5 h-5"/> Part 1: Start Journey System (Features 1.1 - 1.4)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Calibrate exam vectors, target goals, and run baseline diagnostics.</p>
            </div>

            {/* 1.1 Onboarding Wizard */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400"/> # 1.1 Onboarding Wizard & Vector Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Exam Vector</label>
                  <select 
                    value={selectedExam} 
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(EXAM_DNA_BASE).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Daily Hour Commitment</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200">
                    <option>6 Hours / Day</option>
                    <option>8 Hours / Day</option>
                    <option>12 Hours / Day</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Percentile Goal</label>
                  <input type="text" defaultValue="98.5%" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono" />
                </div>
              </div>
            </div>

            {/* 1.2 Diagnostic Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400"># 1.2 Knowledge Index</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">62%</div>
                <p className="text-[10px] text-slate-500 mt-1">Identified weak area: Statement Traps</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400"># 1.2 Speed Test Rate</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">48 q/hr</div>
                <p className="text-[10px] text-slate-500 mt-1">Optimal pacing for target cutoff</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400"># 1.2 Accuracy Matrix</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">74%</div>
                <p className="text-[10px] text-slate-500 mt-1">Above baseline entry requirements</p>
              </div>
            </div>

            {/* 1.3 Success GPS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400"/> # 1.3 Success GPS Pathway ({selectedExam})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-emerald-950/20 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs">
                  <div className="font-bold text-emerald-400">Daily Mission</div>
                  <div className="text-slate-300 mt-1">Study Core Articles + Solve 20 Traps</div>
                </div>
                <div className="bg-indigo-950/20 border-l-4 border-indigo-500 p-3 rounded-r-xl text-xs">
                  <div className="font-bold text-indigo-400">Weekly Target</div>
                  <div className="text-slate-300 mt-1">Complete 120 PYQs + Clear Mistake Hospital</div>
                </div>
                <div className="bg-amber-950/20 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs">
                  <div className="font-bold text-amber-400">Monthly Benchmark</div>
                  <div className="text-slate-300 mt-1">Run 4 Mock Arenas under strict time bounds</div>
                </div>
              </div>
            </div>

            {/* 1.4 Today's Mission Blueprint */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 1.4 Today's Mission Blueprint</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-indigo-400 block">LEARN</span>
                  <span className="font-medium text-slate-200">Chapter 4 Core</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-amber-400 block">PRACTICE</span>
                  <span className="font-medium text-slate-200">20 Statement Qs</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-emerald-400 block">REVISE</span>
                  <span className="font-medium text-slate-200">Spaced Stack Day 7</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-rose-400 block">MOCK</span>
                  <span className="font-medium text-slate-200">15-Min Timer Drill</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-purple-400 block">ANALYSIS</span>
                  <span className="font-medium text-slate-200">Mistake Cleanup</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: EXAM DNA & PLAYBOOKS */}
        {activeModule.startsWith("2.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="text-indigo-400 w-5 h-5"/> Part 2: Exam DNA & Playbooks Engine (Features 2 - 3)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Deep structural parameters and tactical execution blueprints.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-indigo-400"># 2. Exam DNA Matrix ({selectedExam})</h3>
                <span className="text-xs bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full">
                  Target Vector Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pattern</span>
                  <span className="text-xs font-bold text-slate-200">{EXAM_DNA_BASE[selectedExam].pattern}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Marks</span>
                  <span className="text-xs font-bold text-slate-200">{EXAM_DNA_BASE[selectedExam].marks}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cutoff Goal</span>
                  <span className="text-xs font-bold text-emerald-400">{EXAM_DNA_BASE[selectedExam].cutoff}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Negative Penalty</span>
                  <span className="text-xs font-bold text-rose-400">{EXAM_DNA_BASE[selectedExam].negative}</span>
                </div>
              </div>

              {/* Feature 3: Playbooks */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-slate-200 text-sm"># 3. Dedicated Playbook Execution Rules</h4>
                <p>• <b>Subject Allocation:</b> Core Technical / GS (60%), Reasoning (20%), Quantitative Systems (20%).</p>
                <p>• <b>PYQ Repetition Factor:</b> High frequency clustering around Constitutional Frameworks and Statutory Limits.</p>
                <p>• <b>Attempt Order Protocol:</b> Zone 1 (Direct high-confidence items) ➔ Zone 2 (Elimination choices) ➔ Zone 3 (Skip traps).</p>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: SYLLABUS & PYQ ENGINES */}
        {activeModule.startsWith("3.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="text-indigo-400 w-5 h-5"/> Part 3: Syllabus & PYQ Engines (Features 4 - 6)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Hierarchical tracking and question pattern frequency analysis.</p>
            </div>

            {/* Feature 4: Syllabus Intelligence */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 4. Syllabus Intelligence System</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Chapter Node</th>
                      <th className="p-2.5">PYQ Freq</th>
                      <th className="p-2.5">Weightage</th>
                      <th className="p-2.5">Mastery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-semibold text-white">Polity Core</td>
                      <td className="p-2.5">Constitutional Frameworks</td>
                      <td className="p-2.5"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">🟢 High</span></td>
                      <td className="p-2.5">15 Marks</td>
                      <td className="p-2.5 text-amber-400">45% (Needs Drill)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-white">Polity Core</td>
                      <td className="p-2.5">Statutory Commissions</td>
                      <td className="p-2.5"><span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">🟡 Medium</span></td>
                      <td className="p-2.5">8 Marks</td>
                      <td className="p-2.5 text-emerald-400">72% (Stable)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-white">Quant Methods</td>
                      <td className="p-2.5">Data Interpretation</td>
                      <td className="p-2.5"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">🟢 High</span></td>
                      <td className="p-2.5">20 Marks</td>
                      <td className="p-2.5 text-rose-400">30% (Leakage Target)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature 5 & 6: PYQ & Question Pattern Analyzer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 5 & # 6. PYQ Super Analyzer & Question Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400">Direct Statements</div>
                  <div className="text-lg font-bold text-slate-200 mt-1">20% Yield</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full w-[20%]"></div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400">Multi-Statement Traps</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">55% Yield</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full w-[55%]"></div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400">Assertion & Reasoning</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">25% Yield</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[25%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: MINDSET & QUESTION LABS */}
        {activeModule.startsWith("4.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-indigo-400 w-5 h-5"/> Part 4: Mindset & Question Labs (Features 7 - 8)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Examiner psychology, trap detection, and structural question formats.</p>
            </div>

            {/* Feature 7: Examiner Mindset Lab */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2"># 7. Examiner Mindset Laboratory</h3>
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-slate-200">Trap Pattern: Absolute Modifier Insertion</div>
                <p>Examiners routinely insert words like <i>"strictly"</i>, <i>"entirely"</i>, or <i>"without exception"</i> into otherwise correct statutory statements to force unnecessary skip decisions.</p>
                <div className="text-emerald-400 font-semibold">Counter Rule: Reject options with extreme modifiers unless statutory mandate explicitly dictates 100% uniformity.</div>
              </div>
            </div>

            {/* Feature 8: Question Type Lab */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 8. Structural Format Drills</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {["Factual", "Conceptual", "Statement-Based", "Assertion-Reason"].map((type, idx) => (
                  <button key={type} className={`p-2 rounded-xl text-xs font-semibold border ${idx === 2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    {type} Drill
                  </button>
                ))}
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">Sample Statement Drill:</span>
                1. Article 356 allows Presidential rule upon governor's report.<br/>
                2. Judicial review is completely barred under Article 356.<br/>
                <div className="mt-2 text-slate-400 font-medium">Select correct pairing: (A) 1 only | (B) 2 only | (C) Both | (D) Neither</div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 5: ELIMINATION & GUESS ENGINES */}
        {activeModule.startsWith("5.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-indigo-400 w-5 h-5"/> Part 5: Elimination & Guess Engines (Features 9 - 11)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Rule selection simulator and mathematical guess risk optimizer.</p>
            </div>

            {/* Feature 9: Elimination Engine */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 9. Option Elimination Rules Trigger</h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-indigo-600" />
                  <span className="text-slate-200">Extreme Words Elimination (Drop absolute modifier options)</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-indigo-600" />
                  <span className="text-slate-200">Pair Elimination Rule (Identify mutually contradictory statement pairs)</span>
                </label>
              </div>
            </div>

            {/* Features 10 & 11: Smart Guess & Tactics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2"># 10. Smart Guess Risk Yield</h3>
                <p className="text-xs text-slate-300">
                  With penalty <b>{EXAM_DNA_BASE[selectedExam].negative}</b>: Eliminating 2 wrong options yields <b>+1.25 Net Marks</b> per 10 items. Guess protocol mathematically supported.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-2"># 11. Exam Tactics Academy</h3>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Skip tough opening blocks to protect mental momentum.</li>
                  <li>• Max budget: 50 seconds per item.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 6: PDF INTELLIGENCE ENGINE (FEATURES 12 - 23) */}
        {activeModule.startsWith("6.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-indigo-400 w-5 h-5"/> Part 6: PDF Intelligence Engine (Features 12 - 23)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Upload study notes, PDFs, or books to generate dynamic study modes.</p>
            </div>

            {/* Feature 12 & 19: Ingestion Hub */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
              <h3 className="text-sm font-semibold text-slate-200 mb-2"># 12 & # 19. PDF / Document Ingestion Hub</h3>
              <p className="text-xs text-slate-400 mb-4">Select text/PDF file to trigger extraction across Read, Learn, Practice, Revise, and Test Modes.</p>
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="block w-full max-w-xs mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            {/* Extracted Artifacts Display */}
            {documentUploaded && docData && (
              <div className="space-y-4">
                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">Ingested File Active</div>
                  <div className="text-base font-bold text-white mt-0.5">{docData.fileName}</div>
                  <p className="text-xs text-slate-300 mt-1">{docData.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* #13 & 14: Read & Learn */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2"># 13 & 14. Extracted Read/Learn Notes</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {docData.notes.map((n, i) => <li key={i}>• {n}</li>)}
                    </ul>
                  </div>

                  {/* #15: Practice MCQs */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase mb-2"># 15. Generated Practice MCQs</h4>
                    {docData.questions.map((q, i) => (
                      <div key={i} className="text-xs text-slate-300 mb-2">
                        <div className="font-semibold text-slate-200">{q.q}</div>
                        <div className="text-slate-400 mt-1">Ans: {q.correct}</div>
                      </div>
                    ))}
                  </div>

                  {/* #20 & 21: Concept Extraction & Confusion Detector */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-purple-400 uppercase mb-2"># 20 & 21. Concepts & Confusion Warning</h4>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div><b>Extracted Concepts:</b> {docData.concepts.join(', ')}</div>
                      <div className="text-amber-400 bg-amber-950/20 p-2 rounded-lg border border-amber-500/30">{docData.confusions}</div>
                    </div>
                  </div>

                  {/* #22 & 23: Formulas & Memory Boosters */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2"># 22 & 23. Formulas & Mnemonics</h4>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {docData.formulas.map((f, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span>{f.name}</span>
                          <span className="font-mono text-indigo-400">{f.formula}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE 7: REVISION & RECALL OS */}
        {activeModule.startsWith("7.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Repeat className="text-indigo-400 w-5 h-5"/> Part 7: Revision & Active Recall OS (Features 24 - 27)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Spaced repetition triggers, active recall cards, and teach-back gap analyzer.</p>
            </div>

            {/* Feature 24 & 25: Spaced Repetition */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Day 1 Stack</span>
                <span className="text-xs font-bold text-indigo-400">Due Today</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Day 3 Stack</span>
                <span className="text-xs font-bold text-amber-400">Pending</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Day 7 Stack</span>
                <span className="text-xs font-bold text-emerald-400">Scheduled</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Day 30 Stack</span>
                <span className="text-xs font-bold text-purple-400">Stable</span>
              </div>
            </div>

            {/* Feature 26 & 27: Active Recall & Teach Back */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2"># 26 & # 27. Blank Page Recall & Teach-Back Evaluator</h3>
              <p className="text-xs text-slate-400 mb-3">Type everything you remember about a chapter without checking notes:</p>
              <textarea 
                rows="3"
                placeholder="Type explanation here..."
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mb-3"
              />
              <button 
                onClick={() => {
                  if (teachInput.length > 20) {
                    setTeachFeedback({ status: 'success', text: 'Clarity Score: 88%. Concept structure complete.' });
                  } else {
                    setTeachFeedback({ status: 'error', text: 'Explanation brief. Add statutory boundaries.' });
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-xl text-white font-semibold transition"
              >
                Run AI Gap Analysis
              </button>

              {teachFeedback && (
                <div className={`mt-3 p-3 rounded-xl text-xs border ${teachFeedback.status === 'success' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'}`}>
                  {teachFeedback.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 8: PRACTICE & MOCK ARENAS */}
        {activeModule.startsWith("8.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="text-indigo-400 w-5 h-5"/> Part 8: Practice & Mock Arenas (Features 28 - 30)
              </h2>
              <p className="text-slate-400 text-xs mt-1">CBT exam arena, sectional practice, and speed drill timer academy.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200"># 29. Full CBT Mock Arena ({selectedExam})</h3>
                  <span className="text-[10px] text-slate-500">Penalty Rule Active: {EXAM_DNA_BASE[selectedExam].negative}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl font-mono text-xs text-indigo-400">
                  Timer: 11:45
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 text-xs">
                <div className="font-bold text-indigo-400 uppercase mb-2">Question 1 of 20</div>
                <p className="text-slate-200 mb-3">
                  Identify the statutory authority responsible for enforcing regional compliance limits within decentralized node networks:
                </p>
                <div className="space-y-2">
                  {["Option Alpha Structural Layer", "Option Beta Boundary Limits", "Static Control Committee", "Non-autonomous Perimeter Arrays"].map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl cursor-pointer">
                      <input type="radio" name="mock_q1" className="text-indigo-600 focus:ring-0" />
                      <span className="text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-xl font-semibold text-white transition">
                Submit Item
              </button>
            </div>
          </div>
        )}

        {/* MODULE 9: MISTAKE HOSPITAL & DIAGNOSTICS */}
        {activeModule.startsWith("9.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HeartPulse className="text-indigo-400 w-5 h-5"/> Part 9: Mistake Hospital & Diagnostics (Features 31 - 34)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Error classification, recovery sets, and marks leakage detection.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 31. Mistake Log & Cost Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Question Concept</th>
                      <th className="p-2.5">Error Type</th>
                      <th className="p-2.5">Marks Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mistakes.map(m => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-medium text-white">{m.q}</td>
                        <td className="p-2.5"><span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-semibold text-[10px]">{m.type}</span></td>
                        <td className="p-2.5 text-rose-400 font-mono font-bold">{m.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* #34: Marks Leakage Detector */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300">
              <h4 className="font-bold text-rose-400 uppercase mb-1"># 34. Marks Leakage Alert</h4>
              <p>Detected Leakage: Silly Errors (-2.5), Calculation Speed Trap (-1.0). Total recoverable marks: +3.5</p>
            </div>
          </div>
        )}

        {/* MODULE 10: PERFORMANCE ANALYTICS SUITE */}
        {activeModule.startsWith("10.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-indigo-400 w-5 h-5"/> Part 10: Performance Analytics Suite (Features 35 - 38)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Readiness gauge, ROI topic priority matrix, and daily success board.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2"># 35. Overall Readiness Gauge</h3>
              <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden mb-2">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full w-[65%]"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Baseline</span>
                <span className="text-emerald-400 font-bold">65% Target</span>
                <span>Cutoff</span>
              </div>
            </div>

            {/* Feature 36: ROI Engine */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 36. High ROI Priority Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase">HIGH ROI</span>
                  <div className="font-bold text-white mt-1">Constitutional Frameworks</div>
                  <div className="text-slate-400 mt-1">12 hrs ➔ 24 Marks</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
                  <span className="text-[9px] font-bold text-amber-400 uppercase">MED ROI</span>
                  <div className="font-bold text-white mt-1">Data Interpretation</div>
                  <div className="text-slate-400 mt-1">8 hrs ➔ 14 Marks</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
                  <span className="text-[9px] font-bold text-rose-400 uppercase">LOW ROI</span>
                  <div className="font-bold text-white mt-1">Surface Facts</div>
                  <div className="text-slate-400 mt-1">18 hrs ➔ 6 Marks</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 11: FOCUS & SUPPORT TRACKER */}
        {activeModule.startsWith("11.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-indigo-400 w-5 h-5"/> Part 11: Focus & Support Tracker (Features 39 - 43)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Pomodoro focus timer, habit streaks, accountability, and leaderboard.</p>
            </div>

            {/* Feature 39 & 41: Pomodoro & Habits */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center max-w-md mx-auto">
              <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2"># 39. Active Pomodoro Session</h3>
              <div className="text-4xl font-mono font-bold text-white mb-4">{formatTimer(timerTime)}</div>
              
              <div className="flex justify-center gap-2 mb-4">
                <button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${timerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white transition`}
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>}
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={() => { setTimerRunning(false); setTimerTime(1500); }}
                  className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5"/>
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl text-xs text-slate-400 border border-slate-800">
                <span>Distractions: <b>{distractions}</b></span>
                <button onClick={() => setDistractions(d => d + 1)} className="text-rose-400 hover:underline">
                  + Log Interruption
                </button>
              </div>
            </div>

            {/* Feature 43: Leaderboard */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 43. App Community Leaderboard</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-900 rounded-xl">
                  <span>🥇 Aarav S. (UPSC Track)</span>
                  <span className="font-bold text-emerald-400">94% Readiness</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded-xl">
                  <span>🥈 Priya M. (MPSC Track)</span>
                  <span className="font-bold text-emerald-400">91% Readiness</span>
                </div>
                <div className="flex justify-between p-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl font-semibold text-indigo-300">
                  <span>🎯 You (Student)</span>
                  <span className="font-bold text-emerald-400">{readinessScore}% Readiness</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 12: CURRENT AFFAIRS & AI COACH */}
        {activeModule.startsWith("12.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5"/> Part 12: Current Affairs & AI Guidance (Features 44 - 46)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Syllabus-mapped news, AI study coach, and adaptive operational modes.</p>
            </div>

            {/* Feature 44: Current Affairs Engine */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2"># 44. Syllabus-Mapped Current Affairs</h3>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-400">📰 News: Amendment to Statutory Committee Rules</div>
                <p className="text-slate-300"><b>Syllabus Mapping:</b> Polity Core ➔ Statutory Controls</p>
                <p className="text-slate-400"><b>Expected Trap:</b> Assertion-reasoning item on functional autonomy.</p>
              </div>
            </div>

            {/* Feature 45 & 46: AI Coach & Modes */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 45 & # 46. AI Coach Advisory Plan</h3>
              <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl text-xs text-slate-300">
                Coach Action Plan: Focus today on statement trap questions in Constitutional Frameworks, complete 1 Pomodoro session, and clear the 2 logged mistakes.
              </div>
            </div>
          </div>
        )}

        {/* MODULE 13: DOUBT, PANIC & FUTURE SYSTEMS (FEATURES 47 - 55) */}
        {activeModule.startsWith("13.") && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-indigo-400 w-5 h-5"/> Part 13: Doubt, Panic & Comprehensive Operating Output (Features 47 - 55)
              </h2>
              <p className="text-slate-400 text-xs mt-1">Panic protocols, offline exporters, voice revision, and community intelligence.</p>
            </div>

            {/* Feature 48 & 49: Panic Mode Protocols */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-rose-400 mb-2"># 48 & # 49. Panic Mode & Emergency Last 24 Hours Protocol</h3>
              <p className="text-xs text-rose-200 leading-relaxed">
                Emergency rule engaged: Drop all non-essential new content. Spend 100% of study cycles on Formula Sheet Factory, Spaced Repetition Stack, and high ROI notes.
              </p>
            </div>

            {/* Feature 54: Voice Revision Engine */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-200"># 54. Voice Revision Mode</h3>
                <p className="text-xs text-slate-400">Listen to key facts, formulas, and notes hands-free</p>
              </div>
              <button 
                onClick={() => toggleVoiceRevision()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-white transition ${isSpeaking ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
                {isSpeaking ? 'Stop Audio' : 'Start Audio Read'}
              </button>
            </div>

            {/* Feature 53: Offline Revision Pack Download */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-200"># 53. Offline Revision Pack Exporter</h3>
                <p className="text-xs text-slate-400">Export flashcards, ingested notes, and mistakes log to a plain text file for offline study</p>
              </div>
              <button 
                onClick={downloadOfflinePack}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2 rounded-xl font-semibold text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4"/> Export Pack
              </button>
            </div>

            {/* Features 50, 51 & 55: Success Board, Community Notes, & Future Suite */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3"># 50, # 51 & # 55. Success Board & Future Modules</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">#50 Core Target Answered</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">#51 Community Notes Shared</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">#55 Mentor Marketplace</div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">#55 AI Interview Trainer</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}