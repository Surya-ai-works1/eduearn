"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { aiInterviewService, InterviewQuestion, InterviewSession, AIInterviewEvaluation } from '@/services/aiInterviewService';
import { Play, Video, Mic, CheckCircle, Brain, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

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

  const startHardwareCheck = () => {
    setStep('checking');
    setTimeout(() => {
      setCameraAccess(true);
      setMicAccess(true);
    }, 1000);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerEvaluation = useCallback(async () => {
    if (!session) return;
    setIsEvaluating(true);
    try {
      const result = await aiInterviewService.getEvaluation(session.id);
      setEvaluation(result);
      setStep('results');
    } catch (err) {
      console.error(err);
    } finally {
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

  const proceedToNextOnboardingStep = () => {
    goNext();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      
      {/* 1. Welcome Step */}
      {step === 'welcome' && (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Interactive Interview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            To ensure high tutoring quality, you will participate in a short 3-question AI interview. 
            We will ask questions about your pedagogical style, background, and coding communication.
          </p>
          <div className="flex justify-center pt-4">
            <button
              onClick={startHardwareCheck}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center space-x-2 transition"
            >
              <span>Get Started</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Device Check Step */}
      {step === 'checking' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">Camera & Microphone Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3">
                <Video className="w-6 h-6 text-gray-500" />
                <div>
                  <span className="font-bold text-sm block">Camera Check</span>
                  <span className="text-xs text-gray-400">Allows AI to record reactions</span>
                </div>
              </div>
              {cameraAccess ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1 rounded-full">Active</span>
              ) : (
                <span className="text-xs text-gray-400">Requesting...</span>
              )}
            </div>

            <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3">
                <Mic className="w-6 h-6 text-gray-500" />
                <div>
                  <span className="font-bold text-sm block">Microphone Check</span>
                  <span className="text-xs text-gray-400">Records your verbal responses</span>
                </div>
              </div>
              {micAccess ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1 rounded-full">Active</span>
              ) : (
                <span className="text-xs text-gray-400">Requesting...</span>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t pt-6 dark:border-t-gray-700">
            <button
              onClick={() => setStep('welcome')}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              onClick={handleStartInterview}
              disabled={!cameraAccess || !micAccess || isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center space-x-2 transition"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Start Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Active Interview Screen */}
      {step === 'active' && currentQuestion && session && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Question {session.currentQuestionIndex + 1} of {session.totalQuestions}
            </span>
            <div className="flex items-center space-x-2 text-sm font-bold text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span>Time Left: {timer}s</span>
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200">{currentQuestion.text}</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Your Answer</label>
            <textarea
              rows={6}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your detailed response here..."
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t dark:border-t-gray-700">
            <button
              onClick={handleNextQuestion}
              disabled={isSubmitting || !answer.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{session.currentQuestionIndex === session.totalQuestions - 1 ? 'Finish Interview' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Analyzing Screen */}
      {step === 'evaluating' && (
        <div className="text-center py-12 space-y-6">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">AI is Evaluating Your Responses...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while the AI grading engine analyzes your pedagogical skills, language style, and subject matter delivery.
          </p>
        </div>
      )}

      {/* 5. Results Screen */}
      {step === 'results' && evaluation && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-b-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">Interview Feedback</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your AI interview results have been compiled.</p>
            </div>
            <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-lg border border-emerald-250">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-450" />
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Evaluation Score</span>
                <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{evaluation.score} / 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10">
              <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-3">Key Strengths</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10">
              <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-3">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {evaluation.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-gray-700">
            <button
              onClick={() => {
                setStep('welcome');
                setAnswer('');
                setSession(null);
                setCurrentQuestion(null);
              }}
              className="px-6 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center space-x-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Interview</span>
            </button>
            <button
              onClick={proceedToNextOnboardingStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
