import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MediaType, Question } from '../../types';
import { extractYouTubeId } from '../../services/captionParser';

interface Props {
  mediaType: MediaType;
  mediaUrl: string;
  isPlaying: boolean;
  playbackRate: number;
  seekToTime?: number | null;
  volume: number;
  isMuted: boolean;
  questions?: Question[];
  onTimeUpdate: (seconds: number) => void;
  onDurationLoaded: (duration: number) => void;
  onEnded: () => void;
  onQuestionTriggered?: (question: Question) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const MediaPlayer: React.FC<Props> = ({
  mediaType,
  mediaUrl,
  isPlaying,
  playbackRate,
  seekToTime,
  volume,
  isMuted,
  questions = [],
  onTimeUpdate,
  onDurationLoaded,
  onEnded,
  onQuestionTriggered,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const [isYtReady, setIsYtReady] = useState(false);
  const triggeredQuestionIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<any>(null);

  const youtubeId = mediaType === 'youtube' ? extractYouTubeId(mediaUrl) : null;

  // Question timestamp watcher
  const checkQuestionTimestamps = useCallback((currentTime: number) => {
    if (!questions || !onQuestionTriggered) return;

    for (const q of questions) {
      // If we are within 0.5s of the question timestamp and haven't triggered it in this range
      if (Math.abs(currentTime - q.timestamp) <= 0.5 && !triggeredQuestionIdsRef.current.has(q.id)) {
        triggeredQuestionIdsRef.current.add(q.id);
        onQuestionTriggered(q);
        break;
      }
    }
  }, [questions, onQuestionTriggered]);

  // Load YouTube Iframe API script if needed
  useEffect(() => {
    if (mediaType !== 'youtube') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    }

    function initYouTubePlayer() {
      if (!ytContainerRef.current || !youtubeId) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0, // hide native controls in favor of custom UI
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          fs: 0
        },
        events: {
          onReady: (event: any) => {
            setIsYtReady(true);
            const dur = event.target.getDuration();
            if (dur) onDurationLoaded(dur);
            event.target.setPlaybackRate(playbackRate);
            event.target.setVolume(isMuted ? 0 : volume * 100);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            }
          }
        }
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [youtubeId, mediaType]);

  // Polling for YouTube player time update
  useEffect(() => {
    if (mediaType !== 'youtube' || !isYtReady || !ytPlayerRef.current) return;

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const time = ytPlayerRef.current.getCurrentTime() || 0;
            onTimeUpdate(time);
            checkQuestionTimestamps(time);
          }
        } catch (e) {
          // player might be destroyed
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isYtReady, mediaType, onTimeUpdate, checkQuestionTimestamps]);

  // Sync isPlaying state with YouTube
  useEffect(() => {
    if (mediaType !== 'youtube' || !isYtReady || !ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (e) {
      // ignore
    }
  }, [isPlaying, isYtReady, mediaType]);

  // Sync playbackRate with YouTube
  useEffect(() => {
    if (mediaType !== 'youtube' || !isYtReady || !ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.setPlaybackRate(playbackRate);
    } catch (e) {
      // ignore
    }
  }, [playbackRate, isYtReady, mediaType]);

  // Sync seekToTime with YouTube
  useEffect(() => {
    if (seekToTime === null || seekToTime === undefined) return;
    // Reset triggered questions that are after this seek point so they can trigger again if replayed
    triggeredQuestionIdsRef.current.forEach(id => {
      const q = questions.find(item => item.id === id);
      if (q && q.timestamp > seekToTime) {
        triggeredQuestionIdsRef.current.delete(id);
      }
    });

    if (mediaType === 'youtube' && isYtReady && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(seekToTime, true);
        onTimeUpdate(seekToTime);
      } catch (e) {
        // ignore
      }
    } else if (mediaType === 'video' && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      onTimeUpdate(seekToTime);
    } else if (mediaType === 'audio' && audioRef.current) {
      audioRef.current.currentTime = seekToTime;
      onTimeUpdate(seekToTime);
    }
  }, [seekToTime, isYtReady, mediaType, questions, onTimeUpdate]);

  // Sync volume / mute with YouTube
  useEffect(() => {
    if (mediaType !== 'youtube' || !isYtReady || !ytPlayerRef.current) return;
    try {
      if (isMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume * 100);
      }
    } catch (e) {
      // ignore
    }
  }, [volume, isMuted, isYtReady, mediaType]);

  // Native HTML5 Video/Audio handlers
  const handleNativeTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const time = e.currentTarget.currentTime;
    onTimeUpdate(time);
    checkQuestionTimestamps(time);
  };

  const handleNativeLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    onDurationLoaded(e.currentTarget.duration);
  };

  useEffect(() => {
    const media = mediaType === 'video' ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.play().catch(e => console.warn('Autoplay prevented:', e));
    } else {
      media.pause();
    }
    media.playbackRate = playbackRate;
    media.volume = volume;
    media.muted = isMuted;
  }, [isPlaying, playbackRate, volume, isMuted, mediaType]);

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      {mediaType === 'youtube' && (
        <div className="w-full h-full pointer-events-none">
          <div ref={ytContainerRef} className="w-full h-full" />
        </div>
      )}

      {mediaType === 'video' && (
        <video
          ref={videoRef}
          src={mediaUrl}
          onTimeUpdate={handleNativeTimeUpdate}
          onLoadedMetadata={handleNativeLoadedMetadata}
          onEnded={onEnded}
          className="w-full h-full object-contain pointer-events-none"
          playsInline
        />
      )}

      {mediaType === 'audio' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <audio
            ref={audioRef}
            src={mediaUrl}
            onTimeUpdate={handleNativeTimeUpdate}
            onLoadedMetadata={handleNativeLoadedMetadata}
            onEnded={onEnded}
          />
          <div className="w-24 h-24 rounded-full bg-brand-500/20 border-2 border-brand-400 flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-12 h-12 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5v-1a7 7 0 1 1 14 0v1h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z" />
            </svg>
          </div>
          <h4 className="text-xl font-bold tracking-tight">Audio Listening Session</h4>
          <p className="text-sm text-slate-400 mt-1">Focus your ears on the speech flow and accents</p>
        </div>
      )}
    </div>
  );
};
