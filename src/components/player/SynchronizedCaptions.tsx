import React from 'react';
import { CaptionCue, DifficultWord } from '../../types';
import { Sparkles, Volume2 } from 'lucide-react';
import { speakWord } from '../../services/speechService';

interface Props {
  captions: CaptionCue[];
  difficultWords: DifficultWord[];
  currentTime: number;
  isVisible: boolean;
  onWordClick: (word: DifficultWord) => void;
  onToggleCaptions?: () => void;
}

export const SynchronizedCaptions: React.FC<Props> = ({
  captions,
  difficultWords,
  currentTime,
  isVisible,
  onWordClick,
  onToggleCaptions
}) => {
  if (!isVisible) {
    return (
      <div className="py-2 text-center">
        <button
          onClick={onToggleCaptions}
          className="text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors font-medium inline-flex items-center gap-1.5"
        >
          Captions are off &bull; Click to show (CC)
        </button>
      </div>
    );
  }

  // Find active cue matching currentTime
  const activeCue = captions.find(c => currentTime >= c.start && currentTime <= c.end)
    || captions.find(c => Math.abs(currentTime - c.start) <= 0.5);

  const displayText = activeCue ? activeCue.text : '';

  /**
   * Replaces words in caption text that match difficultWords with clickable hotspot buttons
   */
  const renderInteractiveCaption = (text: string) => {
    if (!text) return null;

    // Build regex of difficult words
    if (!difficultWords || difficultWords.length === 0) {
      return <span>{text}</span>;
    }

    // Sort words by length descending to match phrases first (e.g. "on the house" before "house")
    const sortedWords = [...difficultWords].sort((a, b) => b.word.length - a.word.length);
    const pattern = new RegExp(
      `\\b(${sortedWords.map(w => w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const matchWord = sortedWords.find(w => w.word.toLowerCase() === part.toLowerCase());
      if (matchWord) {
        return (
          <span
            key={index}
            className="inline-flex items-center mx-1 group"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(matchWord);
              }}
              title={`Click to view definition: "${matchWord.word}"`}
              className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-900 border border-amber-400/60 font-bold hover:bg-amber-400 hover:text-slate-900 transition-all inline-flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
            >
              <span>{part}</span>
              <Sparkles className="w-3 h-3 text-amber-600 group-hover:text-amber-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(matchWord.word);
              }}
              title="Pronounce word"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-60 group-hover:opacity-100 transition-all ml-0.5"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg text-center relative overflow-hidden min-h-[90px] flex flex-col justify-center items-center">
      <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Synchronized Captions
      </div>

      <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed px-4 pt-2">
        {displayText ? (
          renderInteractiveCaption(displayText)
        ) : (
          <span className="text-slate-500 italic text-sm">
            [ Listening closely... captions will appear when audio plays ]
          </span>
        )}
      </div>

      <div className="mt-2 text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Golden badges represent difficult vocabulary hotspots. Click any word to see definition!</span>
      </div>
    </div>
  );
};
