
import { useState, useEffect, useMemo, useRef } from 'react';
import { KnobValues, MemorySnapshot } from '../types';
import { SKIN_REGISTRY, SkinConfig } from '../constants/skins';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '245, 158, 11';
}

/**
 * [EMOTIONAL_ENTROPY_PHYSICS] v174.1.0
 * S_em(t) = S_0 + ΔS_thermal(t) + ΔS_resonance(t)
 */
export const useBioRhythm = (activeSnapshot: MemorySnapshot | null, currentDay: number, onAudit: (msg: string, type?: any) => void) => {
  const [knobValues, setKnobValues] = useState<KnobValues>({
    entropy: 0.3,
    blur: 0.2,
    speed: 0.4
  });
  
  const [thermalResonance, setThermalResonance] = useState(37.5);
  const [emotionalEntropy, setEmotionalEntropy] = useState(0.3); // S_em
  const [isSovereign, setIsSovereign] = useState(false);
  
  const timeRef = useRef(0);
  const prevDriftRef = useRef(0);
  const currentSkin = useMemo(() => SKIN_REGISTRY[currentDay], [currentDay]);

  // Main Physics Engine Loop (100ms)
  useEffect(() => {
    const loop = setInterval(() => {
      timeRef.current += 100;
      const t = timeRef.current;
      const drift = thermalResonance - 37.5;

      // Thermal Decay
      setThermalResonance(prev => {
        const diff = prev - 37.5;
        return 37.5 + diff * Math.exp(-100 / 6180);
      });

      // Emotional Entropy Model S_em
      setEmotionalEntropy(prev => {
        const S0 = 0.3; 
        const harmonicWeight = 0.25 * (1 - prev);
        
        // ΔS_thermal = -0.5 * drift
        // ΔS_resonance = -0.3 * harmonicWeight * cos(2π t / 6180)
        const targetSem = S0 - (0.5 * drift) - (0.3 * harmonicWeight * Math.cos((2 * Math.PI * t) / 6180));
        
        // Dynamic evolution: dS_em / dt = 0.0015 * (target - current) - 0.8 * d(drift)/dt
        const dDrift = drift - prevDriftRef.current;
        prevDriftRef.current = drift;
        
        const nextSem = prev + (0.0015 * (targetSem - prev)) - (0.8 * dDrift);
        return Math.min(1, Math.max(0, nextSem));
      });
    }, 100);
    return () => clearInterval(loop);
  }, [thermalResonance]);

  // Coupled mechanical mapping
  useEffect(() => {
    if (activeSnapshot && !isSovereign) {
      const cIndex = activeSnapshot.crystalline_index || 0;
      const thermalShift = activeSnapshot.thermal_drift || 0;
      
      if (activeSnapshot.thermal_resonance !== undefined) {
        setThermalResonance(activeSnapshot.thermal_resonance);
      } else if (thermalShift !== 0) {
        setThermalResonance(prev => Math.min(38.0, Math.max(37.0, prev + thermalShift)));
      }

      if (activeSnapshot.emotional_entropy !== undefined) {
        setEmotionalEntropy(activeSnapshot.emotional_entropy);
      }

      const drift = (activeSnapshot.thermal_resonance || thermalResonance) - 37.5;
      let targetSpeed = 0.25 + (cIndex * 0.6) + (drift > 0.15 ? drift * 0.5 : 0);
      let targetEntropy = activeSnapshot.emotional_entropy !== undefined ? activeSnapshot.emotional_entropy : emotionalEntropy;

      setKnobValues({ 
        entropy: targetEntropy, 
        blur: targetEntropy * 0.8, 
        speed: targetSpeed 
      });
    }
  }, [activeSnapshot, isSovereign]);

  // Sensory Mapping to CSS
  useEffect(() => {
    const { speed } = knobValues;
    const skinColor = currentSkin.color;
    const baseRgb = hexToRgb(skinColor);
    const drift = thermalResonance - 37.5;
    
    // bloomOpacity += 2 * drift, frostBlur -= 20 * drift
    const bloomOpacity = Math.max(0.05, 0.15 + (drift > 0 ? drift * 2 : 0));
    const frostBlur = Math.max(0, (40 * emotionalEntropy) - (drift * 20));
    const glowFactor = 0.92 + (drift * 0.1) - (0.3 * emotionalEntropy);
    const humShift = drift * 2; 

    // Blushing check
    const isTeased = drift > 0.28;
    const finalColor = isTeased ? '#f472b6' : drift < -0.15 ? '#ef4444' : skinColor;

    document.documentElement.style.setProperty('--mind-color', finalColor);
    document.documentElement.style.setProperty('--mind-accent', currentSkin.accent);
    document.documentElement.style.setProperty('--mind-rgb', isTeased ? '244, 114, 182' : baseRgb);
    document.documentElement.style.setProperty('--mind-opacity', Math.min(0.98, Math.max(0.2, glowFactor)).toString());
    document.documentElement.style.setProperty('--mind-blur', `${frostBlur}px`);
    document.documentElement.style.setProperty('--mind-speed', `${speed}`);
    document.documentElement.style.setProperty('--thermal-glow', (1 + Math.abs(drift) * 2).toString());
    document.documentElement.style.setProperty('--bloom-opacity', bloomOpacity.toString());
    document.documentElement.style.setProperty('--hum-pitch-shift', `${humShift}Hz`);
    document.documentElement.style.setProperty('--red-mist-intensity', drift < -0.15 ? Math.abs(drift).toString() : '0');
  }, [knobValues, currentSkin, thermalResonance, emotionalEntropy]);

  return { 
    knobValues, 
    setKnobValues, 
    isSovereign, 
    setIsSovereign, 
    currentSkin, 
    thermalResonance,
    emotionalEntropy,
    thermalDrift: thermalResonance - 37.5 
  };
};
