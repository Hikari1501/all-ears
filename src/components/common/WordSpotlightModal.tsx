import React from 'react';
import { DifficultWord } from '../../types';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { speakWord } from '../../services/speechService';

interface Props {
  word: DifficultWord | null;
  isOpen: boolean;
  onClose: () => void;
  isTeacherSpotlight?: boolean;
}

export const WordSpotlightModal: React.FC<Props> = ({
  word,
  isOpen,
  onClose,
  isTeacherSpotlight = false
}) => {
  if (!isOpen || !word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200/60 transform transition-all animate-scale-up">
        {/* Header Banner */}
        <div className={`p-4 flex items-center justify-between ${
          isTeacherSpotlight
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md'
            : 'bg-slate-900 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {isTeacherSpotlight ? (
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
            ) : (
              <BookOpen className="w-5 h-5 text-brand-300" />
            )}
            <div>
              <span className="text-xs uppercase tracking-wider font-bold">
                {isTeacherSpotlight ? 'Classroom Vocabulary Spotlight' : 'Vocabulary Hotspot'}
              </span>
              {isTeacherSpotlight && (
                <p className="text-[11px] text-amber-100">Teacher paused audio to highlight this word</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Image if present */}
        {word.imageUrl && (
          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-full h-full object-cover"
              onError={(e) => {
                // hide on error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Word Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
                  {word.word}
                </h3>
                {word.partOfSpeech && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {word.partOfSpeech.replace('_', ' ')}
                  </span>
                )}
              </div>
              {word.phonetic && (
                <p className="text-sm font-mono text-slate-500 mt-0.5">{word.phonetic}</p>
              )}
            </div>

            <button
              onClick={() => speakWord(word.word)}
              title="Listen to pronunciation"
              className="p-3 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 active:scale-95 transition-all shadow-sm border border-brand-200"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Definition</h4>
              <p className="text-slate-800 leading-relaxed font-medium">
                {word.definition}
              </p>
            </div>

            {word.exampleSentence && (
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Example in Context</h4>
                  <button
                    onClick={() => speakWord(word.exampleSentence, 0.85)}
                    className="text-amber-700 hover:text-amber-900 text-xs font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Read
                  </button>
                </div>
                <p className="text-slate-700 italic text-sm leading-relaxed">
                  "{word.exampleSentence}"
                </p>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Got it, continue listening
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
