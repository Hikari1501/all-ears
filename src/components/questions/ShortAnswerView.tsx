import React from 'react';
import { CloseEndedQuestion } from '../../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  question: CloseEndedQuestion;
  userAnswer: string;
  isAnswerRevealed: boolean;
  onUpdateAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function isCloseEndedCorrect(userAnswer: string, question: CloseEndedQuestion): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const cleanInput = userAnswer.trim().replace(/[.,!?'"]/g, '');

  return question.acceptableAnswers.some(ans => {
    const cleanAns = ans.trim().replace(/[.,!?'"]/g, '');
    if (question.caseSensitive) {
      return cleanInput === cleanAns;
    }
    return cleanInput.toLowerCase() === cleanAns.toLowerCase();
  });
}

export const ShortAnswerView: React.FC<Props> = ({
  question,
  userAnswer,
  isAnswerRevealed,
  onUpdateAnswer,
  disabled = false,
}) => {
  const isCorrect = isAnswerRevealed && isCloseEndedCorrect(userAnswer, question);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Your Answer (Word or Short Phrase)
        </label>
        <div className="relative">
          <input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => onUpdateAnswer(e.target.value)}
            disabled={disabled || isAnswerRevealed}
            placeholder="Type what you heard..."
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              isAnswerRevealed
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-rose-400 bg-rose-50/70 text-rose-900 ring-2 ring-rose-400/20'
                : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
            }`}
          />
          {isAnswerRevealed && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {isAnswerRevealed && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700">Acceptable Answer(s):</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {question.acceptableAnswers.map((ans, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg"
              >
                {ans}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
