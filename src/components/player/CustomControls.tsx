import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Subtitles, Lock } from 'lucide-react';
import { formatTime } from '../../services/captionParser';

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  captionsVisible: boolean;
  volume: number;
  isMuted: boolean;
  disabled?: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleCaptions: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const CustomControls: React.FC<Props> = ({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  captionsVisible,
  volume,
  isMuted,
  disabled = false,
  onPlayPause,
  onSeek,
  onPlaybackRateChange,
  onToggleCaptions,
  onVolumeChange,
  onToggleMute,
}) => {
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newTime = Number(e.target.value);
    onSeek(newTime);
  };

  const handleSkip = (secondsDelta: number) => {
    if (disabled) return;
    const target = Math.max(0, Math.min(duration, currentTime + secondsDelta));
    onSeek(target);
  };

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/95 backdrop-blur border border-slate-800 text-white shadow-xl select-none transition-all ${
      disabled ? 'opacity-90 ring-1 ring-amber-500/30' : ''
    }`}>
      {/* Student Controlled by Teacher banner */}
      {disabled && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Playback & Captions controlled live by teacher</span>
          </div>
          <span className="text-[11px] font-mono bg-amber-400/20 px-2 py-0.5 rounded text-amber-200">
            SYNCED
          </span>
        </div>
      )}

      {/* Progress Scrubber */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-slate-300 w-12 text-right">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={disabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors bg-slate-700 accent-brand-400 ${
              disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-600'
            }`}
          />
        </div>

        <span className="text-xs font-mono text-slate-400 w-12">
          {formatTime(duration)}
        </span>
      </div>

      {/* Main Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSkip(-5)}
            disabled={disabled}
            title="Rewind 5 seconds"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>-5s</span>
          </button>

          <button
            onClick={onPlayPause}
            disabled={disabled}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              disabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-400 active:scale-95 text-white shadow-lg shadow-brand-500/30'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => handleSkip(5)}
            disabled={disabled}
            title="Forward 5 seconds"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <span>+5s</span>
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Playback Speed Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            Speed
          </span>
          <div className="flex items-center gap-1">
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                disabled={disabled}
                onClick={() => onPlaybackRateChange(rate)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  playbackRate === rate
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Captions & Volume */}
        <div className="flex items-center gap-2">
          {/* Captions Toggle */}
          <button
            onClick={onToggleCaptions}
            disabled={disabled}
            title={captionsVisible ? 'Turn captions off' : 'Turn captions on'}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              captionsVisible
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50'
            }`}
          >
            <Subtitles className="w-4 h-4" />
            <span>CC</span>
          </button>

          {/* Volume toggle */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
