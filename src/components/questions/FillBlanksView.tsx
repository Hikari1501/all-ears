import React, { useState } from 'react';
import { FillInBlanksQuestion } from '../../types';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface Props {
  question: FillInBlanksQuestion;
  // Answer format: Record<string, string> mapping blank.id -> user word
  userAnswers: Record<string, string>;
  isAnswerRevealed: boolean;
  onUpdateAnswers: (answers: Record<string, string>) => void;
  disabled?: boolean;
}

export function isBlankCorrect(userWord: string, correctWord: string): boolean {
  if (!userWord) return false;
  const cleanUser = userWord.trim().toLowerCase().replace(/[.,!?'"]/g, '');
  const cleanCorrect = correctWord.trim().toLowerCase().replace(/[.,!?'"]/g, '');
  return cleanUser === cleanCorrect;
}

export const FillBlanksView: React.FC<Props> = ({
  question,
  userAnswers,
  isAnswerRevealed,
  onUpdateAnswers,
  disabled = false,
}) => {
  const [activeBlankId, setActiveBlankId] = useState<string | null>(
    question.blanks[0]?.id || null
  );

  const handleInputChange = (blankId: string, value: string) => {
    onUpdateAnswers({
      ...userAnswers,
      [blankId]: value
    });
  };

  const handleWordBankClick = (word: string) => {
    if (disabled || isAnswerRevealed || !activeBlankId) return;

    onUpdateAnswers({
      ...userAnswers,
      [activeBlankId]: word
    });

    // Move to next unfilled blank if available
    const currentIndex = question.blanks.findIndex(b => b.id === activeBlankId);
    if (currentIndex !== -1 && currentIndex + 1 < question.blanks.length) {
      setActiveBlankId(question.blanks[currentIndex + 1].id);
    }
  };

  // Render template with embedded inputs
  const renderTemplateWithInputs = () => {
    const parts = question.template.split(/(\[blank_\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[(blank_\d+)\]/);
      if (match) {
        const blankId = match[1];
        const blankDef = question.blanks.find(b => b.id === blankId);
        const value = userAnswers[blankId] || '';

        const isCorrect = isAnswerRevealed && blankDef && isBlankCorrect(value, blankDef.correctWord);
        const isWrong = isAnswerRevealed && blankDef && !isBlankCorrect(value, blankDef.correctWord);

        return (
          <span key={index} className="inline-block mx-1 my-1">
            <span className="relative inline-flex items-center">
              <input
                type="text"
                value={value}
                onFocus={() => setActiveBlankId(blankId)}
                onChange={(e) => handleInputChange(blankId, e.target.value)}
                disabled={disabled || isAnswerRevealed}
                placeholder={blankDef?.hint ? `(${blankDef.hint})` : '______'}
                className={`w-36 px-2.5 py-1 text-center font-bold text-sm rounded-lg border-2 transition-all ${
                  isAnswerRevealed
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                      : 'border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-400'
                    : activeBlankId === blankId
                    ? 'border-brand-500 bg-white ring-2 ring-brand-500/30'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              />
              {isAnswerRevealed && (
                <span className="ml-1">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 inline" />
                  )}
                </span>
              )}
            </span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* Template with inputs */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-base leading-loose shadow-xs">
        {renderTemplateWithInputs()}
      </div>

      {/* Word Bank if available */}
      {!isAnswerRevealed && question.wordBank && question.wordBank.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Word Bank (Click word to fill active blank)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {question.wordBank.map((word, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleWordBankClick(word)}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors shadow-xs"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Revealed correct answers */}
      {isAnswerRevealed && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
          <span className="font-bold text-emerald-900">Correct blanks:</span>
          <div className="flex flex-wrap gap-2">
            {question.blanks.map((b) => (
              <span key={b.id} className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold">
                {b.id}: <span className="underline">{b.correctWord}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
