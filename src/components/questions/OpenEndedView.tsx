import React from 'react';
import { OpenEndedQuestion } from '../../types';
import { HelpCircle, CheckCircle } from 'lucide-react';

interface Props {
  question: OpenEndedQuestion;
  userAnswer: string;
  isAnswerRevealed: boolean;
  onUpdateAnswer: (answer: string) => void;
  disabled?: boolean;
}

export const OpenEndedView: React.FC<Props> = ({
  question,
  userAnswer,
  isAnswerRevealed,
  onUpdateAnswer,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Your Response / Reflection
        </label>
        <textarea
          rows={4}
          value={userAnswer || ''}
          onChange={(e) => onUpdateAnswer(e.target.value)}
          disabled={disabled || isAnswerRevealed}
          placeholder="Write your explanation or reasoning in English..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-sm leading-relaxed"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Explain using evidence from the audio clip.</span>
          <span>{(userAnswer || '').length} characters</span>
        </div>
      </div>

      {isAnswerRevealed && (
        <div className="space-y-3 pt-2">
          {question.sampleAnswer && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Exemplary / Model Answer:</span>
              </div>
              <p className="text-slate-700 leading-relaxed italic mt-1">
                "{question.sampleAnswer}"
              </p>
            </div>
          )}

          {question.evaluationRubric && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Key Criteria & Rubric:</span>
              </div>
              <p className="text-slate-600 mt-1">
                {question.evaluationRubric}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
