
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { COOKIE_COLORS } from '../constants';

interface FortuneCookieProps {
  isCracked: boolean;
  isCracking: boolean;
  onClick: () => void;
  fortuneText?: string;
}

const FRAGMENT_PATHS = [
  "M0,0 L10,0 L5,10 Z",
  "M0,5 L5,0 L10,5 L5,10 Z",
  "M2,0 L8,2 L6,8 L0,6 Z",
  "M0,0 L8,0 L8,8 L0,8 Z",
  "M5,0 L10,10 L0,10 Z"
];

const FortuneCookie: React.FC<FortuneCookieProps> = ({ isCracked, isCracking, onClick, fortuneText }) => {
  const isIdle = !isCracked && !isCracking;

  // Generate randomized animation parameters for the text entry with an added "pop"
  const textAnimation = useMemo(() => {
    const randomRotation = (Math.random() - 0.5) * 4; // -2 to 2 degrees
    return {
      initial: { 
        opacity: 0, 
        y: 15, 
        rotate: randomRotation, 
        scale: 0.5 
      },
      animate: { 
        opacity: 1, 
        y: 0, 
        rotate: 0, 
        scale: [0.5, 1.2, 1], // Keyframes for the "pop" effect
      },
    };
  }, [fortuneText]);

  // Generate deterministic but random-looking fragment data for the shatter effect
  const fragments = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      path: FRAGMENT_PATHS[i % FRAGMENT_PATHS.length],
      angle: (Math.random() * Math.PI * 2),
      distance: 150 + Math.random() * 200,
      rotation: Math.random() * 720 - 360,
      size: 8 + Math.random() * 12,
      color: Math.random() > 0.5 ? COOKIE_COLORS.primary : (Math.random() > 0.5 ? COOKIE_COLORS.shadow : COOKIE_COLORS.speckle)
    }));
  }, []);

  return (
    <motion.div 
      className="relative w-80 h-80 flex items-center justify-center select-none"
      animate={isIdle ? {
        scale: [1, 1.015, 1], // Subtle scale
        filter: [
          "drop-shadow(0 0 0px rgba(233, 196, 106, 0)) brightness(1)",
          "drop-shadow(0 0 15px rgba(233, 196, 106, 0.3)) brightness(1.03)",
          "drop-shadow(0 0 0px rgba(233, 196, 106, 0)) brightness(1)"
        ], // Subtle glow pulse
      } : { 
        scale: 1, 
        filter: "drop-shadow(0 0 0px rgba(0,0,0,0)) brightness(1)" 
      }}
      transition={isIdle ? {
        duration: 6, // Slower breathing
        repeat: Infinity,
        ease: "easeInOut"
      } : { duration: 0.2 }}
    >
      {/* Interaction Surface */}
      {!isCracked && (
        <div 
          className="absolute inset-0 z-50 cursor-pointer" 
          onClick={onClick}
        />
      )}

      {/* Paper Strip */}
      <motion.div
        initial={{ width: 0, opacity: 0, scaleX: 0 }}
        animate={isCracked ? { width: '85%', opacity: 1, scaleX: 1 } : { width: 0, opacity: 0, scaleX: 0 }}
        transition={{ delay: 0.4, type: 'spring', damping: 15 }}
        className="absolute z-20 min-h-16 py-2 bg-white shadow-md border-y border-gray-200 flex items-center justify-center px-6 overflow-hidden"
        style={{ transformOrigin: 'center' }}
      >
        <motion.p 
          key={fortuneText} // Re-trigger animation on new text
          initial={textAnimation.initial}
          animate={isCracked ? textAnimation.animate : textAnimation.initial}
          transition={{ 
            delay: 0.8, 
            duration: 0.5,
            times: [0, 0.6, 1], // Timing for the scale keyframes
            type: 'spring', 
            stiffness: 200, 
            damping: 12 
          }}
          style={{ textShadow: '0.5px 0.5px 0.5px rgba(0,0,0,0.1)' }}
          className="text-xs md:text-sm text-red-800 font-bold text-center leading-relaxed serif tracking-tight"
        >
          {fortuneText}
        </motion.p>
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-100/80 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-gray-100/80 to-transparent" />
      </motion.div>

      {/* Shatter Fragments */}
      {isCracked && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          {fragments.map((frag) => (
            <motion.svg
              key={frag.id}
              viewBox="0 0 10 10"
              style={{ 
                width: frag.size, 
                height: frag.size,
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -frag.size / 2,
                marginTop: -frag.size / 2
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: Math.cos(frag.angle) * frag.distance, 
                y: Math.sin(frag.angle) * frag.distance, 
                rotate: frag.rotation,
                opacity: 0,
                scale: 0.2
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <path d={frag.path} fill={frag.color} />
            </motion.svg>
          ))}
        </div>
      )}

      {/* Left Cookie Half (Irregular & Organic) */}
      <motion.div
        className="absolute z-30"
        animate={isCracked ? { x: -110, rotate: -32, y: 25 } : isCracking ? { x: [-2, 2, -2], rotate: [-1.2, 1.2, -1.2] } : {}}
        transition={isCracked ? { type: 'spring', stiffness: 90, damping: 12 } : { repeat: Infinity, duration: 0.1 }}
      >
        <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-2xl">
           <path
            d="M 50 12 C 32 10, 8 32, 6 64 C 4 82, 28 94, 50 88 L 50 12"
            fill={COOKIE_COLORS.primary}
            stroke={COOKIE_COLORS.shadow}
            strokeWidth="0.8"
          />
          <path d="M 44 32 Q 18 42, 14 70" fill="none" stroke={COOKIE_COLORS.shadow} strokeWidth="1.8" opacity="0.35" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Right Cookie Half (Irregular & Organic) */}
      <motion.div
        className="absolute z-30"
        animate={isCracked ? { x: 115, rotate: 28, y: 18 } : isCracking ? { x: [2, -2, 2], rotate: [1.2, -1.2, 1.2] } : {}}
        transition={isCracked ? { type: 'spring', stiffness: 95, damping: 12 } : { repeat: Infinity, duration: 0.1 }}
      >
        <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-2xl">
          <path
            d="M 50 15 C 72 13, 98 38, 96 76 C 94 92, 68 96, 50 85 L 50 15"
            fill={COOKIE_COLORS.primary}
            stroke={COOKIE_COLORS.shadow}
            strokeWidth="0.8"
          />
          <path d="M 56 38 Q 84 48, 80 76" fill="none" stroke={COOKIE_COLORS.shadow} strokeWidth="1.8" opacity="0.35" strokeLinecap="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default FortuneCookie;
