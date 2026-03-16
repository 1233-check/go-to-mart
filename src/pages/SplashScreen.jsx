import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Transition to Phase 2 after 2.5 seconds
    const timer1 = setTimeout(() => setPhase(2), 2500);

    // Call onComplete after Phase 2 completes (2.5s delay + 1.5s hold = 4.0s total)
    const timer2 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 to-[#0a1526]">
      {/* Phase 1: Scooter & Trail */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-0 m-0 w-full h-full"
            key="phase1"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Trail */}
            <motion.div
              className="absolute h-1 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              style={{ top: '55%', left: 0, transformOrigin: 'left' }}
              initial={{ width: '0vw' }}
              animate={{ width: '100vw' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
            {/* 3D Scooter/Rider Image */}
            <motion.div
              className="absolute w-[22rem] md:w-[32rem] z-10"
              style={{ top: '50%', y: '-50%' }}
              initial={{ left: '-30vw' }}
              animate={{ left: '130vw' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80" style={{ transform: 'translateX(-20%)' }}>
                <svg width="100%" height="60%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="20" width="80" height="2" fill="#60a5fa" rx="1" opacity="0.6"/>
                  <rect x="30" y="40" width="120" height="2" fill="#93c5fd" rx="1" opacity="0.4"/>
                  <rect x="10" y="60" width="100" height="3" fill="#bfdbfe" rx="1.5" opacity="0.8"/>
                  <rect x="50" y="80" width="90" height="2" fill="#60a5fa" rx="1" opacity="0.5"/>
                  <rect x="20" y="30" width="60" height="1" fill="#ffffff" rx="0.5" opacity="0.5"/>
                  <rect x="40" y="70" width="70" height="1.5" fill="#e0f2fe" rx="0.75" opacity="0.7"/>
                </svg>
              </div>
              <img 
                src="/3d-rider.png" 
                alt="3D Delivery Rider" 
                className="w-full h-auto drop-shadow-2xl relative z-10"
                style={{
                  maskImage: 'radial-gradient(circle, black 60%, transparent 85%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 85%)'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Brand Reveal */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            key="phase2"
            className="flex flex-col items-center justify-center z-20 text-center px-4"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
          >
            <img 
              src="/3d-rider.png" 
              alt="3D Delivery Rider" 
              className="w-64 md:w-80 drop-shadow-2xl mb-2"
              style={{
                maskImage: 'radial-gradient(circle, black 45%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(circle, black 45%, transparent 75%)'
              }}
            />
            <h1 
              className="text-white text-5xl md:text-7xl font-bold mb-3 tracking-tight drop-shadow-lg" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Go To Mart
            </h1>
            <p className="text-blue-200 text-xs md:text-sm font-bold tracking-[0.2em] uppercase opacity-90">
              FAST • FRESH • EVERYDAY ESSENTIALS
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
