import React from 'react';
import {
  Question,
  MultipleChoiceQuestion,
  MatchingQuestion,
  CloseEndedQuestion,
  OpenEndedQuestion,
  DragAndDropQuestion,
  FillInBlanksQuestion
} from '../../types';
import { MultipleChoiceView } from './MultipleChoiceView';
import { MatchingView } from './MatchingView';
import { ShortAnswerView, isCloseEndedCorrect } from './ShortAnswerView';
import { OpenEndedView } from './OpenEndedView';
import { DragAndDropView } from './DragAndDropView';
import { FillBlanksView, isBlankCorrect } from './FillBlanksView';
import { formatTime } from '../../services/captionParser';
import { Clock, Award, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  question: Question;
  userAnswer: any;
  isAnswerRevealed: boolean;
  isActive: boolean;
  onAnswerChange: (answer: any) => void;
  onSubmitAnswer?: () => void;
  disabled?: boolean;
  showSubmitButton?: boolean;
  hasSubmitted?: boolean;
}

/**
 * Calculates whether user answer is correct
 */
export function evaluateAnswer(question: Question, userAnswer: any): { isCorrect: boolean | null; pointsEarned: number } {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
    return { isCorrect: false, pointsEarned: 0 };
  }

  switch (question.type) {
    case 'multiple_choice': {
      const correct = userAnswer === question.correctAnswerIndex;
      return { isCorrect: correct, pointsEarned: correct ? question.points : 0 };
    }
    case 'close_ended': {
      const correct = isCloseEndedCorrect(userAnswer, question);
      return { isCorrect: correct, pointsEarned: correct ? question.points : 0 };
    }
    case 'matching': {
      if (!userAnswer || typeof userAnswer !== 'object') return { isCorrect: false, pointsEarned: 0 };
      let correctMatches = 0;
      question.pairs.forEach(p => {
        if (userAnswer[p.id] === p.right) correctMatches++;
      });
      const ratio = correctMatches / (question.pairs.length || 1);
      return {
        isCorrect: ratio >= 0.99,
        pointsEarned: Math.round(ratio * question.points)
      };
    }
    case 'drag_and_drop': {
      if (!userAnswer || typeof userAnswer !== 'object') return { isCorrect: false, pointsEarned: 0 };
      let correctSlots = 0;
      question.items.forEach(item => {
        // userAnswer is { slotId: itemId }
        const matchedItemId = userAnswer[item.targetSlotId];
        if (matchedItemId === item.id) correctSlots++;
      });
      const ratio = correctSlots / (question.items.length || 1);
      return {
        isCorrect: ratio >= 0.99,
        pointsEarned: Math.round(ratio * question.points)
      };
    }
    case 'fill_in_blanks': {
      if (!userAnswer || typeof userAnswer !== 'object') return { isCorrect: false, pointsEarned: 0 };
      let correctBlanks = 0;
      question.blanks.forEach(b => {
        if (isBlankCorrect(userAnswer[b.id], b.correctWord)) correctBlanks++;
      });
      const ratio = correctBlanks / (question.blanks.length || 1);
      return {
        isCorrect: ratio >= 0.99,
        pointsEarned: Math.round(ratio * question.points)
      };
    }
    case 'open_ended': {
      // Open ended awarded full or partial upon submission
      const hasContent = typeof userAnswer === 'string' && userAnswer.trim().length > 15;
      return { isCorrect: hasContent ? true : null, pointsEarned: hasContent ? question.points : 0 };
    }
    default:
      return { isCorrect: null, pointsEarned: 0 };
  }
}

export const QuestionCard: React.FC<Props> = ({
  question,
  userAnswer,
  isAnswerRevealed,
  isActive,
  onAnswerChange,
  onSubmitAnswer,
  disabled = false,
  showSubmitButton = false,
  hasSubmitted = false,
}) => {
  const { isCorrect, pointsEarned } = evaluateAnswer(question, userAnswer);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'matching': return 'Matching Pairs';
      case 'close_ended': return 'Short Answer';
      case 'open_ended': return 'Open-Ended Synthesis';
      case 'drag_and_drop': return 'Drag & Drop Sequencing';
      case 'fill_in_blanks': return 'Fill In The Blanks';
      default: return 'Question';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isActive
        ? 'bg-white border-brand-500 shadow-xl ring-4 ring-brand-500/20'
        : 'bg-white border-slate-200/90 shadow-sm opacity-95'
    }`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
            {getTypeLabel(question.type)}
          </span>
          <span className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(question.timestamp)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{question.points} pts</span>
          </span>

          {isAnswerRevealed && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              isCorrect
                ? 'bg-emerald-100 text-emerald-800'
                : isCorrect === false
                ? 'bg-rose-100 text-rose-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{pointsEarned} pts)
                </>
              ) : isCorrect === false ? (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Incorrect
                </>
              ) : (
                'Submitted'
              )}
            </span>
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.prompt}
        </h3>
      </div>

      {/* Question Body by Type */}
      <div className="mb-4">
        {question.type === 'multiple_choice' && (
          <MultipleChoiceView
            question={question as MultipleChoiceQuestion}
            selectedAnswer={userAnswer}
            isAnswerRevealed={isAnswerRevealed}
            onSelectAnswer={onAnswerChange}
            disabled={disabled}
          />
        )}

        {question.type === 'matching' && (
          <MatchingView
            question={question as MatchingQuestion}
            userMatches={userAnswer || {}}
            isAnswerRevealed={isAnswerRevealed}
            onUpdateMatches={onAnswerChange}
            disabled={disabled}
          />
        )}

        {question.type === 'close_ended' && (
          <ShortAnswerView
            question={question as CloseEndedQuestion}
            userAnswer={userAnswer || ''}
            isAnswerRevealed={isAnswerRevealed}
            onUpdateAnswer={onAnswerChange}
            disabled={disabled}
          />
        )}

        {question.type === 'open_ended' && (
          <OpenEndedView
            question={question as OpenEndedQuestion}
            userAnswer={userAnswer || ''}
            isAnswerRevealed={isAnswerRevealed}
            onUpdateAnswer={onAnswerChange}
            disabled={disabled}
          />
        )}

        {question.type === 'drag_and_drop' && (
          <DragAndDropView
            question={question as DragAndDropQuestion}
            userPlacements={userAnswer || {}}
            isAnswerRevealed={isAnswerRevealed}
            onUpdatePlacements={onAnswerChange}
            disabled={disabled}
          />
        )}

        {question.type === 'fill_in_blanks' && (
          <FillBlanksView
            question={question as FillInBlanksQuestion}
            userAnswers={userAnswer || {}}
            isAnswerRevealed={isAnswerRevealed}
            onUpdateAnswers={onAnswerChange}
            disabled={disabled}
          />
        )}
      </div>

      {/* Teacher Explanation once revealed */}
      {isAnswerRevealed && question.explanation && (
        <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Listening Context & Explanation:</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Student Submit button in active mode */}
      {showSubmitButton && !isAnswerRevealed && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {hasSubmitted ? 'Response recorded! Waiting for teacher to reveal...' : 'Answer the question above.'}
          </span>
          <button
            onClick={onSubmitAnswer}
            disabled={disabled || hasSubmitted}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              hasSubmitted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
            }`}
          >
            {hasSubmitted ? 'Answer Submitted ✓' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
