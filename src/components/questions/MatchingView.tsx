import React, { useState } from 'react';
import { MatchingQuestion } from '../../types';
import { Link2, Check, X, RefreshCw } from 'lucide-react';

interface Props {
  question: MatchingQuestion;
  // Answer format: Record<string, string> mapping pair.id -> selected right text or right id
  userMatches: Record<string, string>;
  isAnswerRevealed: boolean;
  onUpdateMatches: (matches: Record<string, string>) => void;
  disabled?: boolean;
}

export const MatchingView: React.FC<Props> = ({
  question,
  userMatches,
  isAnswerRevealed,
  onUpdateMatches,
  disabled = false,
}) => {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  // Shuffled right items for presentation
  const rightOptions = React.useMemo(() => {
    return question.pairs.map(p => ({ id: p.id, text: p.right }));
  }, [question.pairs]);

  const handleLeftClick = (id: string) => {
    if (disabled || isAnswerRevealed) return;
    if (selectedLeftId === id) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(id);
    }
  };

  const handleRightClick = (rightText: string) => {
    if (disabled || isAnswerRevealed || !selectedLeftId) return;

    const next = { ...userMatches };
    // Check if rightText is already matched with another left item, remove it
    Object.keys(next).forEach(leftId => {
      if (next[leftId] === rightText) {
        delete next[leftId];
      }
    });

    next[selectedLeftId] = rightText;
    onUpdateMatches(next);
    setSelectedLeftId(null);
  };

  const handleClearMatch = (leftId: string) => {
    if (disabled || isAnswerRevealed) return;
    const next = { ...userMatches };
    delete next[leftId];
    onUpdateMatches(next);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 font-medium">
        Click an item on the left, then click its corresponding definition or match on the right.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Items</h4>
          {question.pairs.map((pair) => {
            const isSelected = selectedLeftId === pair.id;
            const matchedRightText = userMatches[pair.id];
            const isCorrect = isAnswerRevealed && matchedRightText === pair.right;
            const isWrong = isAnswerRevealed && matchedRightText && matchedRightText !== pair.right;

            return (
              <div
                key={pair.id}
                onClick={() => handleLeftClick(pair.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-500/30'
                    : matchedRightText
                    ? 'border-slate-300 bg-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                } ${isAnswerRevealed ? (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">{pair.left}</span>
                  {matchedRightText && !isAnswerRevealed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearMatch(pair.id);
                      }}
                      className="text-xs text-slate-400 hover:text-rose-600 p-1"
                      title="Clear match"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAnswerRevealed && (
                    <span>
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500 font-bold" />
                      )}
                    </span>
                  )}
                </div>

                {matchedRightText && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-brand-700">
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{matchedRightText}</span>
                  </div>
                )}

                {isAnswerRevealed && !isCorrect && (
                  <div className="mt-1 text-xs text-emerald-700 font-medium">
                    Correct match: {pair.right}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descriptions / Pairs</h4>
          {rightOptions.map((opt) => {
            const isAssigned = Object.values(userMatches).includes(opt.text);

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleRightClick(opt.text)}
                disabled={disabled || isAnswerRevealed || !selectedLeftId}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs leading-relaxed ${
                  isAssigned
                    ? 'border-brand-300 bg-brand-50/50 text-slate-600 line-through opacity-70'
                    : selectedLeftId
                    ? 'border-brand-400 bg-white hover:bg-brand-50 text-slate-800 shadow-sm animate-pulse-subtle'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
