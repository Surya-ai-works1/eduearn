"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { aiInterviewService, InterviewQuestion, InterviewSession, AIInterviewEvaluation } from '@/services/aiInterviewService';
import { 
  Play, Video, Mic, CheckCircle, Brain, AlertCircle, 
  ArrowRight, Loader2, RefreshCw, Sparkles, Code, Terminal, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIInterviewStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const [step, setStep] = useState<'welcome' | 'checking' | 'active' | 'evaluating' | 'results'>('welcome');

  // Session & Question state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(90); // 90 seconds per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIInterviewEvaluation | null>(null);

  // Timer interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check hardware permissions (Mock)
  const [cameraAccess, setCameraAccess] = useState(false);
  const [micAccess, setMicAccess] = useState(false);
  const [checkingHardware, setCheckingHardware] = useState(false);

  // AI Evaluation details
  const [aiEvalProgress, setAiEvalProgress] = useState(0);
  const [aiEvalStage, setAiEvalStage] = useState('');

  const startHardwareCheck = () => {
    setCheckingHardware(true);
    setStep('checking');
    setTimeout(() => {
      setCameraAccess(true);
      setMicAccess(true);
      setCheckingHardware(false);
      toast.success('Camera & Microphone configured successfully ✓');
    }, 1200);
  };

  const handleStartInterview = async () => {
    setIsSubmitting(true);
    try {
      const response = await aiInterviewService.startInterview();
      setSession(response.session);
      setCurrentQuestion(response.firstQuestion);
      setStep('active');
      setTimer(90);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start AI assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runAiAnalysisAnimation = (callback: () => void) => {
    let prog = 0;
    const stages = [
      'Analyzing portfolio materials...',
      'Verifying credential signatures...',
      'Checking teaching category fit...',
      'Evaluating vocabulary and explanation clarity...',
      'Analyzing pedagogical scoring models...',
      'Finalizing competency review...'
    ];

    const interval = setInterval(() => {
      prog += 5;
      setAiEvalProgress(prog);

      const stageIdx = Math.min(Math.floor(prog / (100 / stages.length)), stages.length - 1);
      setAiEvalStage(stages[stageIdx]);

      if (prog >= 100) {
        clearInterval(interval);
        callback();
      }
    }, 180);
  };

  const triggerEvaluation = useCallback(async () => {
    if (!session) return;
    setIsEvaluating(true);
    try {
      runAiAnalysisAnimation(async () => {
        const result = await aiInterviewService.getEvaluation(session.id);
        setEvaluation(result);
        setStep('results');
        setIsEvaluating(false);
      });
    } catch (err) {
      console.error(err);
      setIsEvaluating(false);
    }
  }, [session]);

  const handleNextQuestion = useCallback(async () => {
    if (!session || !currentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSubmitting(true);
    try {
      const response = await aiInterviewService.submitAnswer(
        session.id,
        currentQuestion.id,
        answer || '[No response entered]'
      );

      // Save answer to global context state for transcript storage later
      setState((prev: OnboardingState) => ({
        ...prev,
        aiInterview: {
          ...prev.aiInterview,
          aiQuizAnswers: {
            ...prev.aiInterview.aiQuizAnswers,
            [currentQuestion.id]: answer,
          },
        },
      }));

      setAnswer('');

      if (response.isFinished) {
        setStep('evaluating');
        await triggerEvaluation();
      } else {
        setSession(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
        setCurrentQuestion(response.nextQuestion);
        setTimer(90);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit response.');
    } finally {
      setIsSubmitting(false);
    }
  }, [session, currentQuestion, answer, setState, triggerEvaluation]);

  // Timer countdown logic
  useEffect(() => {
    if (step === 'active' && currentQuestion) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleNextQuestion(); // Auto-submit when timer expires
            return 90;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, currentQuestion, handleNextQuestion]);

  const isTechnical = state.professionalDetails.selectedCategories.some(cat => 
    cat.toLowerCase().includes('programming') || cat.toLowerCase().includes('tech') || cat.toLowerCase().includes('science')
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* MAIN CONTAINER */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* 1. Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-blue-150/40 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 relative">
              <Brain className="w-8 h-8 animate-pulse-subtle" />
              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">AI</div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Competency Assessment</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                EduEarn reviews credentials and expertise with a short 3-question interactive scenario evaluation.
              </p>
            </div>

            {/* Steps overview list */}
            <div className="max-w-md mx-auto p-5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10 text-left space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center">1</span>
                <span>Pedagogical teaching-style scenario review</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center">2</span>
                <span>Active student explanation & doubt clearance</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center">3</span>
                <span>{isTechnical ? "Coding & code execution structure challenge" : "Short essay explanation review"}</span>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={startHardwareCheck}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-2 transition"
              >
                <span>Initialize Assessment</span>
                <Play className="w-4.5 h-4.5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Device Check Step */}
        {step === 'checking' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" /> Camera & Mic Config
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please grant camera and microphone configuration permissions for our video interview check.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 border dark:border-slate-800 rounded-2xl flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-3">
                  <Video className={`w-6 h-6 ${cameraAccess ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-sm block">Webcam Feed</span>
                    <span className="text-xs text-slate-400">Verifying presence check</span>
                  </div>
                </div>
                {cameraAccess ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-3 py-1 rounded-full">✓ Ready</span>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...</span>
                )}
              </div>

              <div className="p-5 border dark:border-slate-800 rounded-2xl flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-3">
                  <Mic className={`w-6 h-6 ${micAccess ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-sm block">Microphone Feed</span>
                    <span className="text-xs text-slate-400">Recording spoken answers</span>
                  </div>
                </div>
                {micAccess ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-3 py-1 rounded-full">✓ Ready</span>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...</span>
                )}
              </div>
            </div>

            <div className="flex justify-between border-t pt-6 dark:border-t-slate-800">
              <button
                onClick={() => setStep('welcome')}
                className="px-6 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleStartInterview}
                disabled={!cameraAccess || !micAccess || checkingHardware}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. Active Assessment Screen */}
        {step === 'active' && currentQuestion && session && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 dark:border-b-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 px-3.5 py-1.5 rounded-full">
                Question {session.currentQuestionIndex + 1} of {session.totalQuestions}
              </span>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200/30 px-3.5 py-1.5 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span>Timer: {timer}s</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-200 leading-normal">{currentQuestion.text}</h3>
            </div>

            {/* Check if technical question (e.g. coding/exercise) to show code editor visual layout */}
            {isTechnical && session.currentQuestionIndex === 2 ? (
              <div className="border border-slate-250 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-200 shadow-md">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    <span>sparky_editor.py</span>
                  </div>
                  <span className="text-[10px] bg-blue-600/35 border border-blue-500/20 px-2 py-0.5 rounded text-blue-300">Python 3.10</span>
                </div>
                <textarea
                  rows={8}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="def evaluate_student_code(solution):&#10;    # Write your pedagogical review code here...&#10;    pass"
                  className="w-full bg-slate-950 font-mono text-sm p-4 text-emerald-450 focus:outline-none placeholder-slate-600 border-none leading-relaxed"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Your Pedagogical Response</label>
                <textarea
                  rows={6}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Explain how you would introduce this concept, break down complexities, or resolve the student's conceptual block..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting || !answer.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{session.currentQuestionIndex === session.totalQuestions - 1 ? 'Evaluate Assessment' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. Analyzing Screen */}
        {step === 'evaluating' && (
          <div className="text-center py-12 space-y-6">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-450 animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Evaluation Engine Active</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {aiEvalStage || "Evaluating subject complexity structure..."}
              </p>
            </div>

            {/* Mini scanning animation */}
            <div className="max-w-md mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${aiEvalProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 5. Results Screen */}
        {step === 'results' && evaluation && (
          <div className="space-y-6">
            
            {/* Glow Pass badge */}
            <div className="relative border border-slate-200 dark:border-slate-800 p-6 rounded-3xl bg-slate-50/30 dark:bg-slate-950/20 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250/20 px-2.5 py-1 rounded-full">
                  AI Assessment Passed
                </span>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">Evaluation Score</h3>
                <p className="text-xs text-slate-400">Excellent pedagogical clearance rating for onboarding.</p>
              </div>

              {/* Glowing circular gauge or visual */}
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-md">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450">{evaluation.score}</span>
                <span className="text-[9px] font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10">
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Teaching Strengths
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-normal pl-4 list-disc">
                  {evaluation.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10">
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-500" /> Focus Improvement
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-normal pl-4 list-disc">
                  {evaluation.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStep('welcome');
                  setAnswer('');
                  setSession(null);
                  setCurrentQuestion(null);
                }}
                className="px-6 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl transition hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Review</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setState((prev: OnboardingState) => ({
                    ...prev,
                    currentStep: prev.currentStep + 1
                  }));
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-2 transition"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Helper Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Evaluation Criteria
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Minimum passing score requirement: <strong>80/100</strong>.
            </li>
            <li>
              We evaluate response structured grammar, doubt clearance methodology, and subject details accuracy.
            </li>
            <li>
              For coding scenarios, write clean, syntactically sound structures with clear inline comments.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
