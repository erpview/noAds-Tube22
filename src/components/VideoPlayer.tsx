import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import Player from '@vimeo/player';
import { Youtube, AlertCircle, SkipForward, Clock } from 'lucide-react';
import { useAdStore } from '../stores/adStore';
import type { VideoDetails, Ad } from '../types/youtube';

interface VideoPlayerProps {
  videoDetails: VideoDetails | null;
}

export function VideoPlayer({ videoDetails }: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [adElapsedTime, setAdElapsedTime] = useState(0);
  const [mainVideoProgress, setMainVideoProgress] = useState(0);
  const [shouldPlayMainVideo, setShouldPlayMainVideo] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);
  const adPlayerRef = useRef<ReactPlayer | Player | null>(null);
  const mainPlayerRef = useRef<ReactPlayer | null>(null);
  const vimeoAdPlayerRef = useRef<HTMLDivElement>(null);
  
  const { ads, shouldPlayAd, fetchAds } = useAdStore();

  useEffect(() => {
    fetchAds().catch(console.error);
  }, [fetchAds]);

  useEffect(() => {
    if (videoDetails) {
      setError(null);
      setShowAd(false);
      setCurrentAd(null);
      setAdElapsedTime(0);
      setMainVideoProgress(0);
      setShouldPlayMainVideo(false);
      setSavedProgress(0);

      const preRollAd = ads.find(ad => ad.type === 'pre-roll' && shouldPlayAd(ad));
      if (preRollAd) {
        setCurrentAd(preRollAd);
        setShowAd(true);
        setShouldPlayMainVideo(false);
      } else {
        setShouldPlayMainVideo(true);
      }
    }
  }, [videoDetails, ads, shouldPlayAd]);

  useEffect(() => {
    if (showAd && currentAd?.platform === 'vimeo' && vimeoAdPlayerRef.current) {
      const videoId = extractVimeoId(currentAd.url);
      if (!videoId) return;

      const player = new Player(vimeoAdPlayerRef.current);
      adPlayerRef.current = player;

      player.on('timeupdate', ({ seconds }) => {
        setAdElapsedTime(Math.floor(seconds));
      });

      player.on('ended', handleAdEnded);

      return () => {
        player.destroy();
      };
    }
  }, [showAd, currentAd]);

  const extractVimeoId = (url: string): string | null => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const handleAdProgress = (progress: { playedSeconds: number }) => {
    setAdElapsedTime(Math.floor(progress.playedSeconds));
  };

  const handleMainVideoProgress = (progress: { playedSeconds: number }) => {
    if (showAd) return;
    
    setMainVideoProgress(progress.playedSeconds);

    const midRollAd = ads.find(ad => {
      if (ad.type !== 'mid-roll' || !shouldPlayAd(ad) || !ad.interval) return false;
      const currentInterval = Math.floor(progress.playedSeconds / ad.interval);
      const previousInterval = Math.floor(mainVideoProgress / ad.interval);
      return currentInterval > previousInterval;
    });

    if (midRollAd) {
      setSavedProgress(progress.playedSeconds);
      setShouldPlayMainVideo(false);
      setCurrentAd(midRollAd);
      setShowAd(true);
    }
  };

  const handleSkipAd = () => {
    if (currentAd?.platform === 'vimeo' && adPlayerRef.current instanceof Player) {
      adPlayerRef.current.destroy();
    }

    setShowAd(false);
    setCurrentAd(null);
    setAdElapsedTime(0);
    setShouldPlayMainVideo(true);

    // Resume main video from saved position for mid-roll ads
    if (currentAd?.type === 'mid-roll' && mainPlayerRef.current) {
      mainPlayerRef.current.seekTo(savedProgress, 'seconds');
    }

    // Ensure main video starts playing after ad
    if (mainPlayerRef.current) {
      setTimeout(() => {
        if (mainPlayerRef.current) {
          mainPlayerRef.current.getInternalPlayer()?.playVideo();
        }
      }, 100);
    }
  };

  const handleAdEnded = () => {
    handleSkipAd();
  };

  if (!videoDetails) {
    return (
      <div className="max-w-4xl mx-auto aspect-video rounded-2xl bg-gray-800/30 flex items-center justify-center border-2 border-dashed border-gray-700/50 backdrop-blur-sm animate-fade-in">
        <div className="text-center text-gray-400 p-8">
          <Youtube className="w-20 h-20 mx-auto mb-6 opacity-50" />
          <p className="text-2xl">Ready to watch? Paste a video URL above</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto aspect-video rounded-2xl bg-gray-800/30 flex items-center justify-center border-2 border-dashed border-red-500/50 backdrop-blur-sm">
        <div className="text-center text-red-400 p-8">
          <AlertCircle className="w-20 h-20 mx-auto mb-6 opacity-50" />
          <p className="text-2xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="react-player-wrapper">
        {/* Main Video Player */}
        <ReactPlayer
          ref={mainPlayerRef}
          url={videoDetails.platform === 'wistia' 
            ? `https://fast.wistia.net/embed/iframe/${videoDetails.id}`
            : videoDetails.platform === 'vimeo'
            ? `https://player.vimeo.com/video/${videoDetails.id}`
            : `https://www.youtube.com/watch?v=${videoDetails.id}`}
          width="100%"
          height="100%"
          playing={shouldPlayMainVideo && !showAd}
          controls={!showAd}
          onError={(e) => {
            console.error('Player error:', e);
            setError('Unable to load video. Please try refreshing or using a different video URL.');
          }}
          onProgress={handleMainVideoProgress}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin,
                enablejsapi: 1,
                autoplay: 0,
                cc_load_policy: 0, // Disable captions by default
                controls: 1 // Enable player controls
              }
            },
            vimeo: {
              playerOptions: {
                autoplay: false,
                controls: true,
                responsive: true,
                dnt: true,
                texttrack: false // Disable captions by default
              }
            },
            wistia: {
              options: {
                playbar: true,
                fullscreenButton: true,
                playButton: true,
                autoPlay: false,
                captions: false // Disable captions by default
              }
            }
          }}
          className="react-player"
        />
        
        {/* Ad Player Overlay */}
        {showAd && currentAd && (
          <div className="absolute inset-0 z-50 bg-black rounded-2xl overflow-hidden">
            {currentAd.platform === 'vimeo' ? (
              <div ref={vimeoAdPlayerRef} className="w-full h-full" />
            ) : (
              <ReactPlayer
                ref={adPlayerRef as any}
                url={currentAd.url}
                width="100%"
                height="100%"
                playing={true}
                controls={false}
                onProgress={handleAdProgress}
                onEnded={handleAdEnded}
                onError={() => {
                  console.error('Ad playback error');
                  handleSkipAd();
                }}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      controls: 0,
                      showinfo: 0,
                      autoplay: 1,
                      cc_load_policy: 0 // Disable captions for ads
                    }
                  }
                }}
              />
            )}
            
            {/* Ad overlay with timer */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Advertisement</span>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span className="tabular-nums font-medium">
                  {Math.max(0, (currentAd.skipAfter || 5) - adElapsedTime)}s
                </span>
              </div>
            </div>

            {adElapsedTime >= (currentAd.skipAfter || 5) && (
              <button
                onClick={handleSkipAd}
                className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-medium group"
              >
                <SkipForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                Skip Ad
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Video not loading? Make sure you're using a valid {videoDetails.platform} URL.</p>
      </div>
    </div>
  );
}