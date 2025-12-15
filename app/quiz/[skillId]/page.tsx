'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from '@/lib/next-mock';
import { Sidebar } from '@/components/Sidebar';
import { QuestionRenderer } from '@/components/QuestionRenderer';
import { ExplanationPane } from '@/components/ExplanationPane';
import { calculateSmartScore } from '@/services/scoringService';
import { generateQuestion, QUESTION_GENERATORS } from '@/services/questionService';
import { Question } from '@/types';
import { RefreshCw, CheckCircle2, Trophy, ArrowLeft, Database } from 'lucide-react';

interface PageProps {
  params: {
    skillId: string;
  };
}

export default function QuizPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { skillId } = params;
  
  const subject = searchParams.get('subject') || 'Math';
  const gradeLabel = searchParams.get('gradeLabel') || 'Grade';
  const skillName = searchParams.get('name') || skillId;
  const skillDesc = searchParams.get('desc') || 'Practice your skills';

  const [sessionStart] = useState(Date.now());
  const [smartScore, setSmartScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isDbQuestion, setIsDbQuestion] = useState(false);
  
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [lastUserAnswer, setLastUserAnswer] = useState<string>('');
  
  const isChallengeZone = smartScore >= 90;
  const isMastered = smartScore >= 100;

  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  const loadNextQuestion = async () => {
    let difficulty = "medium";
    if (smartScore < 40) difficulty = "easy";
    if (smartScore >= 80) difficulty = "hard";

    // 1. Try to fetch from DB first
    try {
        const res = await fetch(`/api/questions?skillId=${skillId}&limit=1`);
        if (res.ok) {
            const dbQuestion = await res.json();
            if (dbQuestion && dbQuestion.id) {
                setCurrentQuestion(dbQuestion);
                setIsDbQuestion(true);
                return;
            }
        }
    } catch (err) {
        console.warn("Failed to fetch DB question, falling back to generator.", err);
    }

    // 2. Fallback to Generator
    setIsDbQuestion(false);
    try {
        if (QUESTION_GENERATORS[skillId]) {
            const q = generateQuestion(skillId, difficulty);
            setCurrentQuestion(q);
        } else {
            console.error("No generator found for", skillId);
            setCurrentQuestion({
                id: 'error',
                skillId,
                type: 'text-input',
                prompt: { text: "Generator not found. Type 'skip' to continue." },
                explanation: { text: "Missing generator configuration." },
                correctAnswer: "skip"
            });
        }
    } catch (e) {
        console.error("Error generating question", e);
    }
  };

  const handleAnswerSubmit = useCallback((answer: string) => {
    if (!currentQuestion) return;

    setLastUserAnswer(answer);
    
    let isCorrect = false;
    
    // Validation Logic
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'sorting') {
        try {
            const userOrder = JSON.parse(answer);
            if (Array.isArray(userOrder) && Array.isArray(currentQuestion.correctOrder)) {
                isCorrect = JSON.stringify(userOrder) === JSON.stringify(currentQuestion.correctOrder);
            }
        } catch (e) { isCorrect = false; }
    } else if (currentQuestion.type === 'fill-in-blank' && currentQuestion.content) {
        try {
            const userAnswers = JSON.parse(answer); 
            const blanks = currentQuestion.content.blanks;
            isCorrect = blanks.every((blank: any) => {
                const userVal = userAnswers[blank.id];
                if (!userVal) return false;
                return userVal.trim().toLowerCase() === blank.correctAnswer.trim().toLowerCase();
            });
        } catch (e) { isCorrect = false; }
    } else if (currentQuestion.type === 'vertical-multiplication') {
        try {
            const userAnswers = JSON.parse(answer); 
            const expected = currentQuestion.answerConfig?.expectedAnswers || [];
            isCorrect = expected.every((exp: any) => {
                const userVal = userAnswers[exp.id];
                return userVal && userVal.toString().trim() === exp.value.toString().trim();
            });
        } catch (e) { isCorrect = false; }
    } else if (currentQuestion.type === 'graphing' && currentQuestion.graphConfig?.correctPoints) {
        try {
            const userPoints = JSON.parse(answer) as {x: number, y: number}[];
            const correctPoints = currentQuestion.graphConfig.correctPoints;
            if (userPoints.length === correctPoints.length) {
                const sortPoints = (p1: {x: number, y: number}, p2: {x: number, y: number}) => 
                    p1.x - p2.x || p1.y - p2.y;
                const sortedUser = [...userPoints].sort(sortPoints);
                const sortedCorrect = [...correctPoints].sort(sortPoints);
                isCorrect = sortedUser.every((p, i) => {
                    const c = sortedCorrect[i];
                    return Math.abs(p.x - c.x) < 0.001 && Math.abs(p.y - c.y) < 0.001;
                });
            }
        } catch (e) { isCorrect = false; }
    } else if (currentQuestion.type === 'drag-and-drop' && currentQuestion.dragDropConfig) {
        try {
            const userPlacement = JSON.parse(answer);
            const correctMapping = currentQuestion.dragDropConfig.correctMapping;
            const itemIds = Object.keys(correctMapping);
            isCorrect = itemIds.every(id => userPlacement[id] === correctMapping[id]);
        } catch (e) { isCorrect = false; }
    } else if (currentQuestion.type === 'number-line' && currentQuestion.numberLineConfig) {
        try {
            const userSelection = JSON.parse(answer) as number[];
            const cfg = currentQuestion.numberLineConfig;
            
            if (cfg.interactionType === 'multi-select' && cfg.correctValues) {
                const s1 = [...userSelection].sort();
                const s2 = [...cfg.correctValues].sort();
                isCorrect = JSON.stringify(s1) === JSON.stringify(s2);
            } else if (cfg.correctValue !== undefined) {
                isCorrect = userSelection.length === 1 && userSelection[0] === cfg.correctValue;
            }
        } catch (e) { isCorrect = false; }
    } else {
      const normalizedInput = answer.trim().toLowerCase();
      if (currentQuestion.acceptableAnswers) {
          isCorrect = currentQuestion.acceptableAnswers.some(a => a.toLowerCase() === normalizedInput);
      } else {
          isCorrect = normalizedInput === currentQuestion.correctAnswer?.toLowerCase();
      }
    }

    if (isCorrect) {
      setFeedbackState('correct');
      setSmartScore(prev => calculateSmartScore(prev, true, streak));
      setStreak(prev => prev + 1);
      setQuestionCount(prev => prev + 1);
      
      setTimeout(() => {
        setFeedbackState('idle');
        setLastUserAnswer('');
        loadNextQuestion();
      }, 1500);
    } else {
      setFeedbackState('incorrect');
      setSmartScore(prev => calculateSmartScore(prev, false, streak));
      setStreak(0);
      setQuestionCount(prev => prev + 1);
    }
  }, [currentQuestion, streak, smartScore]);

  const handleExplanationDismiss = () => {
    setFeedbackState('idle');
    setLastUserAnswer('');
    loadNextQuestion();
  };

  const handleRestart = () => {
    setSmartScore(0);
    setQuestionCount(0);
    setStreak(0);
    setFeedbackState('idle');
    loadNextQuestion();
  };

  const handleBack = () => {
    router.back();
  };

  if (isMastered) {
    return (
        <div className="flex h-screen bg-[#f3f9f9] font-sans overflow-hidden">
             <Sidebar score={100} questionCount={questionCount} streak={streak} sessionStartTime={sessionStart} />
             <main className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full border-t-8 border-[#f5a623] animate-in zoom-in-50 duration-500">
                    <div className="mx-auto bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                        <Trophy className="w-12 h-12 text-[#f5a623]" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Skill Mastered!</h1>
                    <p className="text-gray-600 text-lg mb-8">
                        You achieved a SmartScore of 100 on <strong>{skillName}</strong>.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleBack} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="w-5 h-5" /> Back to Topics
                        </button>
                        <button onClick={handleRestart} className="flex items-center justify-center gap-2 bg-[#56a700] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg">
                            <RefreshCw className="w-5 h-5" /> Practice Again
                        </button>
                    </div>
                </div>
             </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f3f9f9] font-sans overflow-hidden">
      <Sidebar score={smartScore} questionCount={questionCount} streak={streak} sessionStartTime={sessionStart} />

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="p-4 flex items-center gap-2 text-gray-500 hover:text-[#0074e8] cursor-pointer w-fit" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Back to {gradeLabel}</span>
        </div>

        {isChallengeZone && (
             <div className="bg-[#f5a623] text-white py-2 px-4 text-center font-bold tracking-wide shadow-sm z-20 mx-4 rounded">
                CHALLENGE ZONE &mdash; Push for 100!
             </div>
        )}

        <div className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-[#0074e8] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {subject}
                    </span>
                    <span className="text-gray-400 text-sm font-semibold">{skillId}</span>
                    {isDbQuestion && (
                        <span className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                            <Database className="w-3 h-3" /> DB
                        </span>
                    )}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">{skillName}</h2>
                <p className="text-gray-600 text-lg">{skillDesc}</p>
            </header>

            {currentQuestion ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {feedbackState === 'correct' && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-50/90 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center transform scale-110">
                                <div className="bg-green-100 p-3 rounded-full mb-3">
                                    <CheckCircle2 className="w-12 h-12 text-[#56a700]" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Excellent!</h3>
                                <p className="text-green-600 font-bold text-lg mt-1">+{isChallengeZone ? '1' : smartScore < 50 ? '10' : smartScore < 70 ? '5' : '2'}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-10">
                        <div className="mb-8">
                            {currentQuestion.type !== 'fill-in-blank' && (
                                <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {currentQuestion.prompt.text}
                                </p>
                            )}
                            
                            {currentQuestion.type === 'fill-in-blank' && currentQuestion.prompt.text && (
                                <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
                                    {currentQuestion.prompt.text}
                                </p>
                            )}

                            {currentQuestion.prompt.image && (
                                <div className="mt-6">
                                    <img 
                                        src={currentQuestion.prompt.image} 
                                        alt="Question Diagram" 
                                        className="rounded-lg border border-gray-100 max-h-64 object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        <QuestionRenderer 
                            question={currentQuestion}
                            onAnswerSubmit={handleAnswerSubmit}
                            isSubmitting={feedbackState !== 'idle'}
                            userPreviousAnswer={lastUserAnswer}
                        />
                    </div>

                    {feedbackState === 'incorrect' && (
                        <ExplanationPane 
                            question={currentQuestion}
                            userAnswer={lastUserAnswer}
                            onClose={handleExplanationDismiss}
                        />
                    )}
                </div>
            ) : (
                <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-[#56a700] border-t-transparent rounded-full"></div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}