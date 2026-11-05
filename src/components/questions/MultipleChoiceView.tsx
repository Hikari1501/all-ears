import React from 'react';
import { MultipleChoiceQuestion } from '../../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  question: MultipleChoiceQuestion;
  selectedAnswer: number | null;
  isAnswerRevealed: boolean;
  onSelectAnswer: (index: number) => void;
  disabled?: boolean;
}

export const MultipleChoiceView: React.FC<Props> = ({
  question,
  selectedAnswer,
  isAnswerRevealed,
  onSelectAnswer,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = question.correctAnswerIndex === index;

        let buttonStyle = 'border-slate-200 hover:border-brand-400 bg-white hover:bg-brand-50/50 text-slate-800';

        if (isSelected && !isAnswerRevealed) {
          buttonStyle = 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/30';
        }

        if (isAnswerRevealed) {
          if (isCorrect) {
            buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/40 font-semibold';
          } else if (isSelected && !isCorrect) {
            buttonStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-400/40';
          } else {
            buttonStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
          }
        }

        const letter = String.fromCharCode(65 + index);

        return (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            disabled={disabled || isAnswerRevealed}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${buttonStyle} ${
              disabled && !isAnswerRevealed ? 'cursor-not-allowed opacity-80' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                isSelected && !isAnswerRevealed
                  ? 'bg-brand-500 text-white'
                  : isAnswerRevealed && isCorrect
                  ? 'bg-emerald-600 text-white'
                  : isAnswerRevealed && isSelected
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {letter}
              </span>
              <span className="text-sm font-medium leading-relaxed">{option}</span>
            </div>

            {isAnswerRevealed && (
              <div className="shrink-0">
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
