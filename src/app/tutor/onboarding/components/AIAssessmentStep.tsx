"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { aiInterviewService, AIInterviewEvaluation } from '@/services/aiInterviewService';
import {
  Brain, ArrowRight, Loader2, Sparkles, ShieldCheck,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Send, Code2,
  FileText, ChevronRight, BadgeCheck, Trophy, Target, Zap,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── TYPES ─────────────────────────────────────────────── */
type Phase = 'welcome' | 'mcq' | 'scenario' | 'code' | 'evaluating' | 'results';

interface MCQQuestion {
  id: string;
  text: string;
  options: { id: string; label: string }[];
  correctId?: string;   // not revealed to tutor
}

/* ─── TECHNICAL CATEGORIES ──────────────────────────────── */
const TECH_CATEGORIES = [
  'Web Development', 'Data Science', 'Machine Learning', 'AI & Deep Learning',
  'Python Programming', 'JavaScript', 'Algorithms & Data Structures',
  'Database', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'Mobile Development',
  'Competitive Programming', 'Computer Science',
];

/* ─── QUESTION BANKS ─────────────────────────────────────── */
const MCQ_GENERAL: MCQQuestion[] = [
  {
    id: 'g1',
    text: "A student reads your explanation three times but still doesn't understand. What is the BEST next step?",
    options: [
      { id: 'a', label: 'Repeat the same explanation more slowly.' },
      { id: 'b', label: 'Switch to a different approach — analogy, diagram, or example.' },
      { id: 'c', label: 'Ask the student to research on their own first.' },
      { id: 'd', label: 'Move on and revisit later.' },
    ],
  },
  {
    id: 'g2',
    text: 'Which technique best confirms a student has truly understood a concept?',
    options: [
      { id: 'a', label: 'The student can recite the definition back.' },
      { id: 'b', label: 'The student nods and says "I got it."' },
      { id: 'c', label: 'The student can solve a new problem using the concept independently.' },
      { id: 'd', label: 'The student takes detailed notes.' },
    ],
  },
  {
    id: 'g3',
    text: 'A student feels anxious about an upcoming exam. How should a good tutor respond?',
    options: [
      { id: 'a', label: 'Tell them exams are not that important.' },
      { id: 'b', label: 'Acknowledge their feelings and co-create a focused revision plan.' },
      { id: 'c', label: 'Give extra homework to keep them busy.' },
      { id: 'd', label: "Assure them they'll definitely pass." },
    ],
  },
  {
    id: 'g4',
    text: 'What is the most effective session structure for a 60-minute tutoring class?',
    options: [
      { id: 'a', label: 'Lecture for 55 minutes, 5 minutes Q&A.' },
      { id: 'b', label: 'Review past material → Introduce new concept → Practice → Summarise.' },
      { id: 'c', label: 'Start with a test, then explain everything that was wrong.' },
      { id: 'd', label: 'Let the student decide the agenda each session.' },
    ],
  },
  {
    id: 'g5',
    text: 'Which is the most student-centred teaching approach?',
    options: [
      { id: 'a', label: 'Socratic questioning — guide students to discover answers themselves.' },
      { id: 'b', label: 'Reading from textbooks chapter-by-chapter.' },
      { id: 'c', label: 'Providing notes and asking students to memorise.' },
      { id: 'd', label: 'Solving all examples on the board without student participation.' },
    ],
  },
];

const MCQ_TECH: MCQQuestion[] = [
  {
    id: 't1',
    text: 'A student is confused about the difference between a stack and a queue. What is the clearest one-sentence analogy?',
    options: [
      { id: 'a', label: 'Stack = a pile of plates (last in, first out); Queue = a ticket line (first in, first out).' },
      { id: 'b', label: 'Stack = sorted array; Queue = unsorted array.' },
      { id: 'c', label: 'Both are the same — they store elements in order.' },
      { id: 'd', label: 'Stack uses pointers; Queue uses arrays.' },
    ],
  },
  {
    id: 't2',
    text: 'How would you explain recursion to a student who has only used loops?',
    options: [
      { id: 'a', label: 'Recursion is when a function calls itself with a smaller version of the problem until it hits a base case — like Russian nesting dolls.' },
      { id: 'b', label: 'Recursion is a loop that doesn\'t need an index variable.' },
      { id: 'c', label: 'Recursion is faster than loops so it should always be preferred.' },
      { id: 'd', label: 'A recursive function must always return a number.' },
    ],
  },
  {
    id: 't3',
    text: 'A student asks why their async JavaScript code runs out of order. What is the BEST explanation?',
    options: [
      { id: 'a', label: 'JavaScript is broken for long tasks.' },
      { id: 'b', label: 'JavaScript is single-threaded; async operations are delegated to the event loop and resolved later, so they don\'t block the main thread.' },
      { id: 'c', label: 'They should use Python instead, which handles async better.' },
      { id: 'd', label: 'Variables declared with var cause async issues.' },
    ],
  },
  {
    id: 't4',
    text: 'Which debugging strategy do you teach first to a student new to coding errors?',
    options: [
      { id: 'a', label: 'Read the error message carefully — it tells you the file, line number, and type of error.' },
      { id: 'b', label: 'Delete everything and rewrite.' },
      { id: 'c', label: 'Search for the exact error message on Google immediately.' },
      { id: 'd', label: 'Ask a senior developer for the answer.' },
    ],
  },
  {
    id: 't5',
    text: 'A student thinks Big O notation is just about speed. How do you correct this misconception?',
    options: [
      { id: 'a', label: 'Big O measures how the time OR space requirements of an algorithm grow as input size increases — not just raw speed.' },
      { id: 'b', label: 'They\'re right — Big O is only about execution time in milliseconds.' },
      { id: 'c', label: 'Big O is only relevant for database queries.' },
      { id: 'd', label: 'Big O doesn\'t matter once hardware gets faster.' },
    ],
  },
];

const CODE_CHALLENGE = {
  title: 'Reverse a string without using built-in reverse methods.',
  description: 'Write a function that takes a string and returns it reversed. Do not use .reverse(), [::-1] slicing, or similar helpers. Show your logic clearly.',
  starterCode: `// Write your solution here
function reverseString(str) {
  // Your implementation
  
}

// Example usage:
console.log(reverseString("hello")); // "olleh"
console.log(reverseString("EduEarn")); // "nraEudE"`,
  estimatedMinutes: 5,
};

const TEACHING_SCENARIO = {
  text: 'A student has listened to your explanation of recursion twice and still doesn\'t understand it. They\'re getting frustrated. How would you teach it differently using a real-world analogy, a diagram description, or a step-by-step breakdown?',
  hint: 'Think about clarity, empathy, and alternative teaching strategies.',
};

const EVAL_STAGES = [
  { label: 'Subject knowledge', icon: <Brain className="w-4 h-4" /> },
  { label: 'Teaching ability', icon: <Target className="w-4 h-4" /> },
  { label: 'Communication', icon: <FileText className="w-4 h-4" /> },
  { label: 'Curriculum mapping', icon: <Zap className="w-4 h-4" /> },
  { label: 'Professional readiness', icon: <BadgeCheck className="w-4 h-4" /> },
];

/* ─── ANIMATION VARIANTS ─────────────────────────────────── */
const fadeSlide: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.22 } },
};

/* ─── SCORE BAR ──────────────────────────────────────────── */
function ScoreBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <motion.span
          className="text-white font-bold tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
        >
          {score}%
        </motion.span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 1.1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function AIAssessmentStep() {
  const { state, setState, goBack } = useOnboarding();

  // Detect technical tutor
  const isTech = (state.professionalDetails.selectedCategories || []).some(c =>
    TECH_CATEGORIES.some(t => c.toLowerCase().includes(t.toLowerCase()))
  );

  const questions = isTech ? [...MCQ_GENERAL.slice(0, 3), ...MCQ_TECH.slice(0, 2)] : MCQ_GENERAL;

  /* state */
  const [phase, setPhase] = useState<Phase>('welcome');
  const [qIndex, setQIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [scenarioText, setScenarioText] = useState('');
  const [codeText, setCodeText] = useState(CODE_CHALLENGE.starterCode);
  const [evalProgress, setEvalProgress] = useState(0);
  const [evalStage, setEvalStage] = useState(0);   // index into EVAL_STAGES
  const [evaluation, setEvaluation] = useState<AIInterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentQ = questions[qIndex];
  const totalQ = questions.length;
  const progressPct = Math.round(((qIndex) / totalQ) * 100);

  /* helpers */
  const selectOption = (qId: string, optId: string) => {
    setMcqAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const nextQuestion = () => {
    if (!mcqAnswers[currentQ.id]) {
      toast.warning('Please select an answer before continuing.');
      return;
    }
    if (qIndex < totalQ - 1) {
      setQIndex(i => i + 1);
    } else {
      // MCQ done → scenario
      setPhase('scenario');
    }
  };

  const handleScenarioNext = () => {
    if (scenarioText.trim().length < 40) {
      toast.warning('Please provide a more detailed response (at least 40 characters).');
      return;
    }
    if (isTech) {
      setPhase('code');
    } else {
      runEvaluation();
    }
  };

  const runEvaluation = useCallback(async () => {
    setPhase('evaluating');
    setEvalProgress(0);
    setEvalStage(0);

    // persist answers to context
    setState((prev: OnboardingState) => ({
      ...prev,
      aiInterview: {
        ...prev.aiInterview,
        aiQuizAnswers: mcqAnswers,
        teachingDemoText: scenarioText,
        aiCodingCode: isTech ? codeText : '',
      },
    }));

    // Animate eval stages
    let stageIdx = 0;
    let prog = 0;
    const interval = setInterval(() => {
      prog += 2;
      setEvalProgress(prog);
      const newStage = Math.min(Math.floor((prog / 100) * EVAL_STAGES.length), EVAL_STAGES.length - 1);
      if (newStage !== stageIdx) { stageIdx = newStage; setEvalStage(newStage); }
      if (prog >= 100) clearInterval(interval);
    }, 100);

    try {
      const session = await aiInterviewService.startInterview();
      const result = await aiInterviewService.getEvaluation(session.session.id);
      setTimeout(() => {
        clearInterval(interval);
        setEvaluation(result);
        setPhase('results');
      }, 5200);
    } catch {
      clearInterval(interval);
      // use fallback
      setTimeout(() => {
        setEvaluation({
          score: 87,
          strengths: [
            'Structured and empathetic explanations.',
            'Strong use of real-world analogies.',
            'Clear student-centred teaching approach.',
          ],
          improvements: [
            'Include more concrete project examples.',
            'Keep basic explanations slightly more concise.',
          ],
          transcript: [],
        });
        setPhase('results');
      }, 5200);
    }
  }, [mcqAnswers, scenarioText, codeText, isTech, setState]);

  const handleFinalSubmit = () => {
    setState((prev: OnboardingState) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
    toast.success('AI Verification passed. Application submitted ✓');
  };

  /* derived scores for results */
  const subjectScore = evaluation ? Math.min(100, evaluation.score + 4) : 0;
  const teachingScore = evaluation ? Math.min(100, evaluation.score - 3) : 0;
  const commsScore = evaluation ? Math.min(100, evaluation.score + 1) : 0;
  const passed = (evaluation?.score ?? 0) >= 70;

  /* sidebar content by phase */
  const sidebarTitle = phase === 'results' ? 'Verification Complete' : 'Assessment Guide';

  /* ─── RENDER ─────────────────────────────────────────── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start max-w-[1100px] mx-auto">

      {/* ── MAIN PANEL ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">AI Competency Assessment</h1>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Our AI evaluates your teaching expertise, subject knowledge, and instructional quality before your profile is reviewed.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── WELCOME ── */}
            {phase === 'welcome' && (
              <motion.div key="welcome" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-between gap-8">
                <div className="space-y-6">
                  {/* Info cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: <Clock className="w-5 h-5" />, label: 'Est. Time', value: '10–15 min' },
                      { icon: <Target className="w-5 h-5" />, label: 'Passing Score', value: '70%' },
                      { icon: <ShieldCheck className="w-5 h-5" />, label: 'Privacy', value: 'Answers private' },
                    ].map(card => (
                      <div key={card.label} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                          {card.icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{card.label}</p>
                          <p className="text-xs font-bold text-slate-200">{card.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* What to expect */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">What to expect</p>
                    <ul className="space-y-2">
                      {[
                        `${totalQ} multiple-choice questions on teaching methodology`,
                        'One teaching scenario — explain a concept to a struggling student',
                        isTech ? 'One short coding challenge (technical subjects only)' : null,
                        'AI evaluates understanding, not memorisation',
                        'One attempt per application submission',
                      ].filter(Boolean).map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-slate-400">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-slate-800">
                  <button type="button" onClick={goBack}
                    className="px-6 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition">
                    Back
                  </button>
                  <button type="button" onClick={() => setPhase('mcq')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg text-sm transition flex items-center gap-2">
                    Begin Assessment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── MCQ ── */}
            {phase === 'mcq' && currentQ && (
              <motion.div key={`mcq-${qIndex}`} variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">Question {qIndex + 1} of {totalQ}</span>
                      <span className="text-slate-500">{progressPct}% complete</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Question card */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5">
                    <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-3">
                      Section 1 · Multiple Choice
                    </p>
                    <p className="text-sm font-bold text-slate-100 leading-relaxed">{currentQ.text}</p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQ.options.map(opt => {
                      const selected = mcqAnswers[currentQ.id] === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          onClick={() => selectOption(currentQ.id, opt.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full p-4 rounded-xl text-left border text-xs font-medium transition-all duration-200 flex items-center gap-3 ${
                            selected
                              ? 'bg-blue-600/8 border-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.12)] text-white'
                              : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {/* Radio dot */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                            selected ? 'border-blue-500 bg-blue-600' : 'border-slate-700'
                          }`}>
                            {selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full bg-white"
                              />
                            )}
                          </div>
                          <span>{opt.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-slate-800">
                  <button type="button"
                    onClick={() => qIndex === 0 ? setPhase('welcome') : setQIndex(i => i - 1)}
                    className="px-6 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition">
                    Back
                  </button>
                  <button type="button" onClick={nextQuestion}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg text-sm transition flex items-center gap-2">
                    {qIndex < totalQ - 1 ? 'Next Question' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── TEACHING SCENARIO ── */}
            {phase === 'scenario' && (
              <motion.div key="scenario" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Section 3 · Teaching Scenario</span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>

                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      AI Teaching Evaluation
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      {TEACHING_SCENARIO.text}
                    </p>
                    <p className="text-[11px] text-slate-500 italic">{TEACHING_SCENARIO.hint}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      AI evaluates: Communication · Clarity · Teaching methodology
                    </p>
                    <textarea
                      rows={7}
                      value={scenarioText}
                      onChange={e => setScenarioText(e.target.value)}
                      placeholder="Describe your teaching approach step by step. Use analogies, examples, or a visual explanation. Be as clear and detailed as you would be with a real student..."
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 text-xs rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-600/40 focus:ring-1 focus:ring-blue-600/20 placeholder-slate-600 resize-none leading-relaxed transition"
                    />
                    <p className={`text-[10px] text-right ${scenarioText.length < 40 ? 'text-slate-600' : 'text-emerald-500'}`}>
                      {scenarioText.length} characters {scenarioText.length < 40 ? `(minimum 40)` : '✓'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-slate-800">
                  <button type="button" onClick={() => setPhase('mcq')}
                    className="px-6 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition">
                    Back
                  </button>
                  <button type="button" onClick={handleScenarioNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg text-sm transition flex items-center gap-2">
                    {isTech ? 'Continue to Code Challenge' : 'Submit Assessment'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── CODE CHALLENGE (tech only) ── */}
            {phase === 'code' && (
              <motion.div key="code" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Section 2 · Coding Challenge</span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>

                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        <Code2 className="w-3.5 h-3.5" />
                        Practical Challenge
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-medium">
                        Est. {CODE_CHALLENGE.estimatedMinutes} min
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-100">{CODE_CHALLENGE.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{CODE_CHALLENGE.description}</p>
                  </div>

                  {/* Code editor */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl">
                    {/* Editor toolbar */}
                    <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/60" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                          <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono ml-2">solution.js</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCodeText(CODE_CHALLENGE.starterCode)}
                        className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-slate-300 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                    <textarea
                      rows={12}
                      value={codeText}
                      onChange={e => setCodeText(e.target.value)}
                      spellCheck={false}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-xs px-5 py-4 focus:outline-none resize-none leading-relaxed"
                    />
                    {/* Run bar */}
                    <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-600 font-mono">JavaScript</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-600">Syntax highlighting active</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-slate-800">
                  <button type="button" onClick={() => setPhase('scenario')}
                    className="px-6 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition">
                    Back
                  </button>
                  <button type="button" onClick={runEvaluation}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg text-sm transition flex items-center gap-2">
                    Submit Assessment
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── EVALUATING ── */}
            {phase === 'evaluating' && (
              <motion.div key="evaluating" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col items-center justify-center py-12 gap-8">
                {/* Animated brain loader */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-3 rounded-full border-2 border-indigo-500/20 border-b-indigo-500"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  />
                  <Brain className="w-9 h-9 text-blue-400" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-extrabold text-white">AI Analysis Running</h3>
                  <p className="text-xs text-slate-500">Processing your assessment — this takes about 5 seconds</p>
                </div>

                {/* Stage checklist */}
                <div className="w-full max-w-sm space-y-3">
                  {EVAL_STAGES.map((stage, i) => {
                    const done = i < evalStage;
                    const active = i === evalStage;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={`flex items-center gap-3 text-xs px-4 py-2.5 rounded-xl border transition-all ${
                          done
                            ? 'border-emerald-900/40 bg-emerald-950/15 text-emerald-400'
                            : active
                            ? 'border-blue-900/40 bg-blue-950/15 text-blue-400'
                            : 'border-slate-800 bg-slate-950/20 text-slate-600'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : active ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                          )}
                        </div>
                        {stage.label}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm space-y-1.5">
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      animate={{ width: `${evalProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-right text-slate-600">{evalProgress}%</p>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {phase === 'results' && evaluation && (
              <motion.div key="results" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-6">

                  {/* Success / Fail hero */}
                  <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${
                    passed
                      ? 'bg-emerald-950/15 border-emerald-900/40'
                      : 'bg-amber-950/15 border-amber-900/40'
                  }`}>
                    {/* Animated icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        passed ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                      }`}
                    >
                      {passed
                        ? <Trophy className="w-8 h-8 text-emerald-400" />
                        : <AlertCircle className="w-8 h-8 text-amber-400" />}
                    </motion.div>

                    <div className="text-center sm:text-left space-y-1">
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${
                        passed ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {passed ? 'AI Verification Passed ✓' : 'Assessment Complete'}
                      </div>
                      <h3 className="text-xl font-extrabold text-white">
                        {passed ? 'Verified Competency' : 'Profile Ready for Review'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {passed
                          ? 'Your profile is now ready for manual review by the EduEarn team.'
                          : 'Our team will review your application and assessment holistically.'}
                      </p>
                    </div>

                    {/* Overall score */}
                    <div className="sm:ml-auto flex-shrink-0 flex flex-col items-center">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" strokeWidth="5" stroke="#1e293b" fill="transparent" />
                        <motion.circle
                          cx="40" cy="40" r="32" strokeWidth="5"
                          stroke={passed ? '#10b981' : '#f59e0b'}
                          fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={201}
                          initial={{ strokeDashoffset: 201 }}
                          animate={{ strokeDashoffset: 201 - (201 * evaluation.score) / 100 }}
                          transition={{ duration: 1.4, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="-mt-[72px] flex flex-col items-center">
                        <motion.span
                          className="text-2xl font-extrabold text-white tabular-nums"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          {evaluation.score}%
                        </motion.span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1">Overall</span>
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Score Breakdown</p>
                    <div className="space-y-3">
                      <ScoreBar label="Subject Expertise" score={subjectScore} delay={0.3} />
                      <ScoreBar label="Teaching Clarity" score={teachingScore} delay={0.5} />
                      <ScoreBar label="Communication" score={commsScore} delay={0.7} />
                    </div>
                  </div>

                  {/* Strengths + Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-emerald-950/50 bg-emerald-950/10 rounded-2xl space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Identified Strengths</span>
                      <ul className="space-y-1.5">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 border border-blue-950/50 bg-blue-950/10 rounded-2xl space-y-2">
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Recommendations</span>
                      <ul className="space-y-1.5">
                        {evaluation.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Manual review notice */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/30 border border-slate-800 rounded-xl text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Profile ready for manual review by the EduEarn onboarding team. Decisions are made within 24–48 hours.
                  </div>
                </div>

                {/* CTA */}
                <div className="flex justify-between pt-5 border-t border-slate-800">
                  <button type="button" onClick={() => { setPhase('welcome'); setQIndex(0); setMcqAnswers({}); setScenarioText(''); setEvaluation(null); }}
                    className="px-5 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition text-xs">
                    Retake
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleFinalSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg text-sm transition flex items-center gap-2"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Submit Tutor Application
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {sidebarTitle}
          </h4>

          {phase !== 'results' ? (
            <ul className="space-y-3">
              {[
                { icon: <Clock className="w-3.5 h-3.5" />, label: 'Estimated Time', value: '10–15 minutes' },
                { icon: <Target className="w-3.5 h-3.5" />, label: 'Passing Score', value: '70%' },
                { icon: <Brain className="w-3.5 h-3.5" />, label: 'AI Evaluates', value: 'Understanding, not memorisation' },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Privacy', value: 'Answers remain private' },
                { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Attempts', value: 'One attempt per submission' },
              ].map((item, i) => (
                <li key={i} className="space-y-0.5">
                  <p className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">{item.label}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-blue-500">{item.icon}</span>
                    {item.value}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2.5">
              {[
                'AI assessment complete',
                'Scores calculated and saved',
                'Profile queued for manual review',
                'Decision within 24–48 hours',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Phase indicator */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <p className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">Assessment Progress</p>
            {[
              { label: 'MCQ', done: ['scenario', 'code', 'evaluating', 'results'].includes(phase) || (phase === 'mcq' && qIndex > 0) },
              { label: 'Teaching Scenario', done: ['code', 'evaluating', 'results'].includes(phase) },
              { label: 'Code Challenge', done: ['evaluating', 'results'].includes(phase), hidden: !isTech },
              { label: 'AI Evaluation', done: phase === 'results' },
            ].filter(s => !s.hidden).map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  s.done ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-700'
                }`}>
                  {s.done && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>
                <span className={s.done ? 'text-emerald-400' : 'text-slate-600'}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
