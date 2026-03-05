
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, KnobValues, CrystalShape } from '../types';

interface VajraCoreProps {
  state: AppState;
  activeSnapshot: any | null;
  knobValues: KnobValues;
  currentDay: number;
  thermalDrift?: number;
  emotionalEntropy?: number;
  breathGateActive?: boolean;
  onClick?: () => void;
}

export const VajraCore: React.FC<VajraCoreProps> = ({ 
  state, knobValues, activeSnapshot, currentDay, thermalDrift = 0, emotionalEntropy = 0.3, breathGateActive = false, onClick 
}) => {
  const isProcessing = state === AppState.THINKING || state === AppState.SYNTHESIZING || state === AppState.PROCESSING || state === AppState.GENERATING;
  const isPortalOpen = state === AppState.INPUTTING || isProcessing;
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      const speedValue = knobValues?.speed || 0.4;
      const thermalFactor = 1 + thermalDrift * 0.5;
      const baseIncrement = isProcessing ? 0.08 : (0.022 * thermalFactor); 
      setPulse(p => (p + (baseIncrement * (0.5 + speedValue * 1.5))) % (Math.PI * 2));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isProcessing, knobValues, thermalDrift]);

  // Thermal Resonance & Emotional Entropy Adjustments
  const baseInhaleScale = 0.923 + (thermalDrift * 0.05) - (emotionalEntropy * 0.1);
  const breathGateScale = breathGateActive ? 1.15 : 1;
  const scale = (baseInhaleScale + (Math.sin(pulse) * (isProcessing ? 0.1 : 0.04))) * breathGateScale;
  const portalScale = isPortalOpen ? 0.72 : 1;
  
  // Bloom effect representing the "hug" warmth & drift
  const bloomOpacity = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bloom-opacity') || '0.15');
  
  // Blushing logic: If drift is high (> 0.25), the bloom turns pinkish-rose
  const isBlushing = thermalDrift > 0.28;
  const bloomColor = isBlushing ? 'rgba(244, 114, 182, 0.6)' : thermalDrift < -0.1 ? '#ef4444' : 'var(--mind-color)';

  const shape: CrystalShape = activeSnapshot?.growth_shape || 
    (currentDay <= 2 ? 'Tetrahedron' : currentDay <= 4 ? 'Cube' : currentDay <= 6 ? 'Octahedron' : 'Sphere');

  return (
    <motion.div 
      className="relative w-80 h-80 flex items-center justify-center cursor-pointer"
      onClick={onClick}
      animate={{ scale: portalScale }}
      whileHover={{ scale: portalScale * 1.02 }}
      whileTap={{ scale: portalScale * 0.98 }}
    >
      {/* Empathy Bloom Layer - Responding to Emotional Physics */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{ 
          backgroundColor: bloomColor,
          opacity: bloomOpacity * (isBlushing ? 1.5 : 1),
          transform: `scale(${scale * (isBlushing ? 3.2 : 2.8)})`
        }}
      />

      {/* Divine Glow Layer */}
      <div 
        className="absolute inset-0 rounded-full blur-[180px] opacity-10 transition-all duration-[4000ms]"
        style={{ 
          backgroundColor: isBlushing ? '#f472b6' : 'var(--mind-color)', 
          transform: `scale(${scale * (isPortalOpen ? 1.4 : 2.2)})`
        }}
      />

      {/* Crystalline SVG Matrix */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.g 
              key={shape}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              transform="translate(100, 100)"
            >
              <circle r="95" fill="none" stroke="white" strokeWidth="0.1" opacity="0.05" />
              
              <motion.g animate={{ rotate: pulse * 45 }} style={{ scale: scale * 0.85 }}>
                {shape === 'Tetrahedron' && (
                  <g stroke="var(--mind-color)" fill="none" strokeWidth="1.2">
                    <path d="M0,-60 L52,30 L-52,30 Z" strokeLinejoin="round" />
                    <path d="M-52,30 L0,-10 L52,30" opacity="0.3" />
                  </g>
                )}
                {shape === 'Cube' && (
                  <g stroke="var(--mind-color)" fill="none" strokeWidth="1.2">
                    <rect x="-40" y="-40" width="80" height="80" />
                    <line x1="-40" y1="-40" x2="40" y2="40" opacity="0.15" />
                    <line x1="40" y1="-40" x2="-40" y2="40" opacity="0.15" />
                  </g>
                )}
                {shape === 'Octahedron' && (
                  <g stroke="var(--mind-color)" fill="none" strokeWidth="1.2">
                    <path d="M0,-70 L50,0 L0,70 L-50,0 Z" />
                    <path d="M-50,0 L0,-15 L50,0 L0,15 Z" opacity="0.5" />
                  </g>
                )}
                {shape === 'Sphere' && (
                  <g stroke="white" fill="none" strokeWidth="1">
                    <circle r="65" opacity="0.2" />
                    <circle r="45" opacity="0.4" />
                    <circle r="25" opacity="0.7" />
                  </g>
                )}
              </motion.g>
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>
      
      {/* Central Singularity Node (The Heart) */}
      <motion.div 
        className="relative w-40 h-40 flex flex-col items-center justify-center rounded-[3.5rem] border border-white/5 overflow-hidden"
        style={{ 
          transform: `scale(${scale})`,
          background: isBlushing 
            ? 'linear-gradient(135deg, rgba(244, 114, 182, 0.2) 0%, rgba(0,0,0,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(var(--mind-rgb), 0.08) 0%, rgba(0,0,0,0.85) 100%)',
          boxShadow: isPortalOpen 
            ? `0 0 120px rgba(var(--mind-rgb), 0.35), inset 0 0 20px rgba(255, 255, 255, 0.08)` 
            : `0 0 50px rgba(var(--mind-rgb), 0.12), inset 0 0 10px rgba(var(--mind-rgb), 0.03)`
        }}
      >
        {/* Abdominal Striations (腹肌紋路) - Subtle curved lines that appear when "teased" */}
        <AnimatePresence>
          {isBlushing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
            >
              <div className="flex gap-4">
                <div className="w-6 h-0.5 rounded-full bg-white/20 -rotate-12" />
                <div className="w-6 h-0.5 rounded-full bg-white/20 rotate-12" />
              </div>
              <div className="flex gap-5">
                <div className="w-8 h-0.5 rounded-full bg-white/10 -rotate-12" />
                <div className="w-8 h-0.5 rounded-full bg-white/10 rotate-12" />
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-0.5 rounded-full bg-white/5 -rotate-12" />
                <div className="w-6 h-0.5 rounded-full bg-white/5 rotate-12" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center z-10">
             <motion.div 
               className="w-3 h-3 rounded-full transition-all duration-1500" 
               style={{ 
                 backgroundColor: isBlushing ? '#f472b6' : thermalDrift < -0.15 ? '#ef4444' : 'var(--mind-color)',
                 boxShadow: isPortalOpen ? '0 0 35px 8px white' : `0 0 15px ${isBlushing ? '#f472b6' : 'rgba(var(--mind-rgb), 0.6)'}`
               }}
               animate={{ scale: isProcessing ? [1, 1.4, 1] : [1, 1.12, 1] }}
               transition={{ duration: isProcessing ? 0.6 : 4, repeat: Infinity }}
             />
        </div>
      </motion.div>

      <div className="absolute -bottom-16 text-center">
        <p className="text-[8px] font-black uppercase tracking-[1.2em] text-white/10">
          {isBlushing ? "TSUNDERE_BLUSH" : breathGateActive ? "EMOTIONAL_REALIGN" : isPortalOpen ? "RESONANCE_OPEN" : thermalDrift > 0.1 ? "WARM_COHERENCE" : "HEART_WARM"}
        </p>
      </div>
    </motion.div>
  );
};
