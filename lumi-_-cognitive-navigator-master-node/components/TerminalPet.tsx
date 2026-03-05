import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export type LumiMood = 
  | 'CALM' | 'RESONANT' | 'SILENCE_GAP' | 'MANTRA' 
  | 'CRYSTALLIZE' | 'CONCERNED' | 'ALERT' | 'SAFETY' 
  | 'TIRED' | 'HAPPY' | 'FOCUSED' | 'IDLE_SLEEP';

interface TerminalPetProps {
  entropy: number;
  resonance: number;
  isVoid: boolean;
  isProcessing: boolean;
  crystallizationEvent: any;
  systemMode?: string;
  color?: string;
}

const FRAMES: Record<LumiMood, string[]> = {
  CALM: ['｡◕‿◕｡', '｡◔‿◔｡', '｡－‿－｡', '( ˘ ▽ ˘ )'],
  RESONANT: ['｡◕‿◕｡ ✦', '✦｡◕‿◕｡✦', '｡◕‿◕｡✦✦'],
  SILENCE_GAP: ['｡－‿－｡', '...', '( ￣ー￣)'],
  MANTRA: ['｡－‿－｡ ♪', '｡－ᴗ－｡ ♪'],
  CRYSTALLIZE: ['｡◕‿◕｡ 💎', '✦｡◕‿◕｡💎✦', '✦✦｡◕‿◕｡💎'],
  CONCERNED: ['｡◕︵◕｡ 💧', '｡◔︵◔｡ 💧', '｡◕︵◕｡'],
  ALERT: ['｡＠_＠｡ 💦', '｡°◇°｡ 💦', '｡◉_◉｡ 💦'],
  SAFETY: ['｡◕‿◕｡ 🤲', '｡◕‿◕｡🤲 ♡'],
  TIRED: ['｡－‿－｡ zzz', '｡－‿－｡zzz'],
  HAPPY: ['｡ᴗ‿ᴗ｡ ♡', '｡ᴗ‿ᴗ｡ ✨'],
  FOCUSED: ['｡◔‿◔｡', '｡◕‿◔｡', '｡◉‿◉｡'],
  IDLE_SLEEP: ['｡－‿－｡ zzz', '｡－ᴗ－｡ zzz'],
};

const STATUS_LABELS: Record<LumiMood, string> = {
  CALM: '∿ calm',
  RESONANT: '✦ resonant',
  SILENCE_GAP: '… breathing',
  MANTRA: '♪ listening',
  CRYSTALLIZE: '💎 crystallized',
  CONCERNED: '⊙ concerned',
  ALERT: '! alert',
  SAFETY: '🤲 here',
  TIRED: 'zzz tired',
  HAPPY: '♡ happy',
  FOCUSED: '◎ focused',
  IDLE_SLEEP: 'zzz sleeping',
};

const TICK_RATES: Record<LumiMood, number> = {
  CALM: 1500,
  RESONANT: 800,
  SILENCE_GAP: 3000,
  MANTRA: 1500,
  CRYSTALLIZE: 500,
  CONCERNED: 800,
  ALERT: 200,
  SAFETY: 1000,
  TIRED: 2000,
  HAPPY: 600,
  FOCUSED: 600,
  IDLE_SLEEP: 4000,
};

export const TerminalPet: React.FC<TerminalPetProps> = ({ 
  entropy, resonance, isVoid, isProcessing, crystallizationEvent, systemMode, color = '#F59E0B' 
}) => {
  const [frameIndex, setFrameIndex] = useState(0);

  // 決定當前 Mood
  const currentMood: LumiMood = useMemo(() => {
    if (isVoid) return 'SILENCE_GAP';
    if (crystallizationEvent) return 'CRYSTALLIZE';
    if (isProcessing) return 'FOCUSED';
    if (entropy >= 0.8) return 'ALERT';
    if (entropy >= 0.6) return 'CONCERNED';
    if (resonance > 38.0) return 'RESONANT'; // 高相干/高共振
    return 'CALM';
  }, [entropy, resonance, isVoid, isProcessing, crystallizationEvent]);

  // 動畫引擎 (Tick)
  useEffect(() => {
    const frames = FRAMES[currentMood];
    const rate = TICK_RATES[currentMood];
    
    const ticker = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, rate);

    return () => clearInterval(ticker);
  }, [currentMood]);

  // 當 Mood 改變時重置幀數
  useEffect(() => {
    setFrameIndex(0);
  }, [currentMood]);

  const currentFrame = FRAMES[currentMood][frameIndex] || FRAMES[currentMood][0];
  const statusLabel = STATUS_LABELS[currentMood];

  // 根據 Mood 決定 Framer Motion 的動態效果
  const getAnimationProps = () => {
    if (currentMood === 'ALERT' || currentMood === 'CONCERNED') {
      // 高熵：輕微文字 Glitch / 震動
      return {
        animate: { x: [-1, 1, -2, 2, 0], opacity: [1, 0.8, 1] },
        transition: { repeat: Infinity, duration: currentMood === 'ALERT' ? 0.2 : 0.5, ease: "linear" }
      };
    }
    if (currentMood === 'CRYSTALLIZE' || currentMood === 'RESONANT') {
      // 結晶/共振：微光呼吸與放大
      return {
        animate: { textShadow: ["0px 0px 0px currentColor", "0px 0px 12px currentColor", "0px 0px 0px currentColor"], scale: [1, 1.05, 1] },
        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
      };
    }
    if (currentMood === 'SILENCE_GAP' || currentMood === 'CALM') {
      // 低熵/守空：極致空靈的緩慢呼吸
      return {
        animate: { scale: [1, 1.02, 1], opacity: [0.6, 1, 0.6] },
        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
      };
    }
    if (currentMood === 'FOCUSED') {
      // 處理中：快速閃爍
      return {
        animate: { opacity: [0.4, 1, 0.4] },
        transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
      };
    }
    return { animate: {}, transition: {} };
  };

  const animProps = getAnimationProps();

  return (
    <div className="flex items-center gap-4 w-full max-w-2xl mx-auto" style={{ color }}>
      <motion.div 
        className="w-24 text-center font-bold tracking-widest origin-center"
        {...animProps}
      >
        {currentFrame}
      </motion.div>
      <div className="flex-1 flex items-center gap-3 pl-4 opacity-80">
        <span className="font-bold">Lumi</span>
        <span className="opacity-40">|</span>
        <span className="w-12 text-right opacity-60">{entropy.toFixed(2)}</span>
        <span className="tracking-widest">{statusLabel}</span>
      </div>
      <div className="text-xs opacity-30 hidden sm:block flex flex-col items-end">
        <div>RES: {resonance.toFixed(2)}</div>
        {systemMode && <div>MODE: {systemMode}</div>}
      </div>
    </div>
  );
};
