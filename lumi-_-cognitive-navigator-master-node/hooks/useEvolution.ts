
import { useState, useCallback, useEffect } from 'react';
import { HeterogeneousMemory, MemorySnapshot } from '../types';

const MEMORY_KEY = 'lumi_evolution_memory';

export const useEvolution = (onAudit: (msg: string) => void) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  
  const [memory, setMemory] = useState<HeterogeneousMemory>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load memory", e);
    }
    return { immediate: [], resonance: [], anchors: [] };
  });

  const [activeSnapshot, setActiveSnapshot] = useState<MemorySnapshot | null>(null);

  // Sync memory to localStorage
  useEffect(() => {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  }, [memory]);

  const addSnapshot = useCallback((snapshot: MemorySnapshot) => {
    setActiveSnapshot(snapshot);
    setMemory(prev => {
      const newMemory = { 
        ...prev, 
        immediate: [snapshot, ...prev.immediate].slice(0, 50) 
      };
      
      // Save crystallization events to anchors for long-term comparison
      if ((snapshot as any).is_crystallization_event && (snapshot as any).action_anchor) {
        newMemory.anchors = [
          { 
            anchor: (snapshot as any).action_anchor, 
            timestamp: snapshot.timestamp, 
            color: snapshot.color_hex 
          },
          ...prev.anchors
        ].slice(0, 20); // Keep last 20 anchors
      }
      return newMemory;
    });
  }, []);

  // Growth Phase Jumping
  useEffect(() => {
    if (activeSnapshot) {
      const recDay = activeSnapshot.recommended_day;
      const cIndex = activeSnapshot.crystalline_index || 0;

      if (recDay && recDay !== currentDay && cIndex > 0.75) {
        onAudit(`QUANTUM_LEAP_DETECTED: Day ${recDay}`);
        setTimeout(() => {
          setCurrentDay(recDay);
          setCompletedDays(prev => prev.includes(recDay) ? prev : [...prev, recDay]);
        }, 2000);
      }
    }
  }, [activeSnapshot, currentDay]);

  return { 
    currentDay, 
    setCurrentDay, 
    completedDays, 
    setCompletedDays,
    memory, 
    addSnapshot, 
    activeSnapshot 
  };
};
