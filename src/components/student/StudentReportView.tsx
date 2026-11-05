import React, { useEffect } from 'react';
import { HomeworkSubmission, LiveSession, Question } from '../../types';
import { Award, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  title: string;
  questions: Question[];
  responses: Record<string, { answer: any; isCorrect: boolean | null; pointsEarned: number }>;
  totalScore: number;
  maxScore: number;
  onBack: () => void;
}

export const StudentReportView: React.FC<Props> = ({
  title,
  questions,
  responses,
  totalScore,
  maxScore,
  onBack
}) => {
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  useEffect(() => {
    if (percentage >= 70) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  }, [percentage]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-amber-300">
          <Award className="w-4 h-4 text-amber-300" />
          <span>Listening Performance Summary</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>

        <div className="pt-2 flex items-center justify-center gap-6">
          <div className="text-center">
            <span className="text-4xl sm:text-5xl font-black text-amber-300">{percentage}%</span>
            <p className="text-xs text-brand-200 uppercase tracking-wider mt-1 font-bold">Accuracy</p>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-4xl sm:text-5xl font-black text-white">{totalScore}</span>
            <p className="text-xs text-brand-200 uppercase tracking-wider mt-1 font-bold">out of {maxScore} pts</p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Lessons</span>
          </button>
        </div>
      </div>

      {/* Review All Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900">Detailed Question Review</h3>

        {questions.map((q, idx) => {
          const resp = responses[q.id];
          const isCorrect = resp?.isCorrect;
          const pointsEarned = resp?.pointsEarned || 0;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : isCorrect === false
                  ? 'bg-white border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-500 uppercase">
                  Question {idx + 1} &bull; {q.type.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCorrect === false
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{pointsEarned} pts)
                      </>
                    ) : isCorrect === false ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0 pts)
                      </>
                    ) : (
                      'Submitted'
                    )}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-2">{q.prompt}</h4>

              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                <div>
                  <span className="font-bold text-slate-500">Your Answer: </span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {resp ? (typeof resp.answer === 'object' ? JSON.stringify(resp.answer) : String(resp.answer)) : '(No answer submitted)'}
                  </span>
                </div>
              </div>

              {q.explanation && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-slate-700">
                  <strong className="text-blue-900">Context Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
