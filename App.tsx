
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBizarreFortunes } from './services/geminiService';
import { AudioService } from './services/audioService';
import { Fortune, AppState } from './types';
import { FALLBACK_FORTUNES } from './constants';
import FortuneCookie from './components/FortuneCookie';
import Confetti from './components/Confetti';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [fortunes, setFortunes] = useState<Fortune[]>(FALLBACK_FORTUNES);
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true); // Default to muted to follow browser autoplay policies
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const init = async () => {
      const fresh = await fetchBizarreFortunes();
      if (fresh.length > 0) {
        // Combine with fallback to ensure variety
        setFortunes([...FALLBACK_FORTUNES, ...fresh]);
      }
    };
    init();
  }, []);

  // Update mute state in AudioService whenever isMuted changes
  useEffect(() => {
    if (hasInteracted) {
      AudioService.setMuted(isMuted);
    }
  }, [isMuted, hasInteracted]);

  // Extract unique categories for the filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(fortunes.map(f => f.category)));
    return ['All', ...cats.sort()];
  }, [fortunes]);

  const crackCookie = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsMuted(false);
    }

    if (state !== AppState.IDLE) return;
    
    setState(AppState.CRACKING);
    AudioService.playCrack();
    
    // Haptic feedback for the initial crack
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Determine the pool based on category selection
    let pool = fortunes;
    if (selectedCategory !== 'All') {
      pool = fortunes.filter(f => f.category === selectedCategory);
    }

    // Try to find unread fortunes in the current pool
    const unreadPool = pool.filter(f => !history.includes(f.text));
    const activePool = unreadPool.length > 0 ? unreadPool : pool;
    
    // Safety check: if for some reason activePool is empty, fallback to everything
    const finalPool = activePool.length > 0 ? activePool : fortunes;
    const selection = finalPool[Math.floor(Math.random() * finalPool.length)];

    setTimeout(() => {
      setCurrentFortune(selection);
      setHistory(prev => [selection.text, ...prev].slice(0, 10));
      setState(AppState.REVEALED);
      AudioService.playReveal();

      // Haptic feedback for the magical reveal
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 30, 40]);
      }
    }, 600);
  }, [state, fortunes, history, hasInteracted, selectedCategory]);

  const reset = () => {
    setState(AppState.IDLE);
    setCurrentFortune(null);
  };

  const toggleMute = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setIsMuted(!isMuted);
  };

  const handleShare = async () => {
    if (!currentFortune) return;

    const shareData = {
      title: 'My Cosmic Fortune 🥠',
      text: `My Cosmic Fortune: "${currentFortune.text}" — Reveal yours at Cosmic Crunch!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.text);
        alert("Fortune copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        // Secondary fallback
        await navigator.clipboard.writeText(shareData.text);
        alert("Fortune copied to clipboard!");
      }
    }
  };

  // Randomized bounce effect for the big reveal text
  const mainTextAnimation = useMemo(() => {
    const randomY = Math.random() > 0.5 ? [10, -5, 0] : [0, -10, 0];
    const randomScale = [0.8, 1.1, 1];
    return {
      y: randomY,
      scale: randomScale,
      opacity: [0, 1]
    };
  }, [currentFortune]);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      
      {/* Whimsical Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] text-6xl animate-bounce">🥠</div>
        <div className="absolute bottom-[20%] right-[10%] text-4xl rotate-12">✨</div>
        <div className="absolute top-[30%] right-[15%] text-2xl animate-pulse">☁️</div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black text-amber-900 serif tracking-tighter">
          COSMIC CRUNCH
        </h1>
        <p className="text-amber-700/60 font-medium italic mt-2">Bizarre Prophecies & Unsolicited Advice</p>
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl z-10"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              if (state === AppState.IDLE) {
                setSelectedCategory(cat);
              }
            }}
            disabled={state !== AppState.IDLE}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border ${
              selectedCategory === cat 
                ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-md' 
                : 'bg-white text-amber-900/40 border-amber-900/10 hover:border-amber-900/30'
            } ${state !== AppState.IDLE ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-xl min-h-[450px]">
        {state === AppState.REVEALED && <Confetti />}

        <FortuneCookie 
          isCracked={state === AppState.REVEALED}
          isCracking={state === AppState.CRACKING}
          onClick={crackCookie}
          fortuneText={currentFortune?.text}
        />

        <AnimatePresence>
          {state === AppState.REVEALED && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-12 flex flex-col items-center space-y-6 z-40"
            >
              <motion.div 
                className="text-center max-w-sm px-4"
                animate={mainTextAnimation}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {currentFortune?.category} • Luck {currentFortune?.luckScore}%
                  </span>
                </div>
                <p className="text-xl text-amber-950 font-bold serif italic mb-2">
                  "{currentFortune?.text}"
                </p>
              </motion.div>

              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="px-8 py-3 bg-amber-900 text-amber-50 rounded-full font-bold shadow-xl hover:bg-amber-800 transition-all active:scale-95 flex items-center gap-2"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  Get Another Fortune
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share Fortune"
                  className="p-3 bg-white text-amber-900 border-2 border-amber-900/10 rounded-full hover:bg-amber-50 transition-all active:scale-90"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {state === AppState.IDLE && (
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-4 text-amber-900/30 font-bold uppercase tracking-widest text-xs"
          >
            Touch to unlock the void
          </motion.div>
        )}
      </div>

      {/* Floating Mute Button */}
      <button 
        onClick={toggleMute}
        className="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center bg-white shadow-lg rounded-full text-amber-900/40 hover:text-amber-900 transition-colors border border-amber-100 z-50"
      >
        <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
      </button>

      {/* History Log */}
      <div className="fixed bottom-8 left-8 hidden md:block z-50">
        <p className="text-[10px] font-bold text-amber-900/20 uppercase tracking-tighter mb-1">Previous Fates</p>
        <div className="flex flex-col-reverse gap-1">
          {history.slice(1).map((h, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-[9px] text-amber-900/40 bg-white/50 px-2 py-0.5 rounded truncate max-w-[150px]"
            >
              {h}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
