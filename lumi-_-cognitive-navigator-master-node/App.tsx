
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiKeySelector } from './components/mandala/ApiKeySelector';
import { TerminalPet } from './components/TerminalPet';
import { CrystalPopup } from './components/CrystalPopup';
import { AlayaStarMapView } from './components/AlayaStarMapView';
import { MessageRenderer } from './components/MessageRenderer';
import { useLumiOrchestrator, MemoryManager } from './services/useLumiOrchestrator';
import { AppState } from './types';

/**
 * [PSYCHO_MECHANICAL_ENGINEERING]: v174.0.8
 * Status: Thermal Engineering Baseline Integrated.
 */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    appState, messages, statusText, auditLog,
    isCollapsing, currentDay,
    currentSkin, handleSend,
    activeSnapshot, thermalResonance, emotionalEntropy, crystallizationEvent, setCrystallizationEvent,
    typeCrystallizationEvent, setTypeCrystallizationEvent,
    showAlayaMap, setShowAlayaMap,
    reset,
    isVoid, triggerVoid
  } = useLumiOrchestrator();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, statusText]);

  // [HIDDEN_DOOR]: Escape to trigger Void Protocol
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        triggerVoid();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [triggerVoid]);

  const onManualSend = () => {
    if (manualInput.trim()) {
      handleSend(manualInput);
      setManualInput("");
    }
  };

  if (isVoid) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* A single, gentle breathing pixel to maintain the cute/lightweight aesthetic */}
        <motion.div 
          animate={{ scale: [1, 2, 1], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="w-3 h-3 bg-green-400/60 rounded-sm shadow-[0_0_15px_rgba(74,222,128,0.5)]"
        />
      </motion.div>
    );
  }

  return (
    <div className={`h-[100dvh] flex flex-col relative overflow-hidden font-['JetBrains_Mono',_Consolas,_'Courier_New',_monospace] text-[14px] bg-[#050505] text-green-500 transition-all duration-1000 ${isCollapsing ? 'scale-110 grayscale invert brightness-150' : ''}`}>
      <ApiKeySelector onKeySelected={() => setIsAuthenticated(true)} />

      {/* 結晶彈窗 */}
      <CrystalPopup 
        event={crystallizationEvent} 
        onClose={() => setCrystallizationEvent(null)} 
      />

      {/* 夢格結印彈窗 (Genesis Mirror Protocol) */}
      <AnimatePresence>
        {typeCrystallizationEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/80 backdrop-blur-sm"
          >
            <div 
              className="border border-current p-8 max-w-md w-full text-center bg-black shadow-[0_0_40px_rgba(var(--color-rgb),0.2)]"
              style={{ color: typeCrystallizationEvent.color, '--color-rgb': '16, 185, 129' } as any}
            >
              <div className="text-4xl mb-4 animate-pulse">✧ 💎 ✧</div>
              <h2 className="text-2xl font-bold mb-2 tracking-widest uppercase">
                Genesis Mirror Complete
              </h2>
              <div className="h-px w-full bg-current opacity-30 my-4" />
              <p className="text-lg opacity-90 mb-6">
                Dreamer Type Crystallized:
              </p>
              <div className="text-3xl font-bold tracking-widest uppercase animate-pulse">
                [{typeCrystallizationEvent.type}]
              </div>
              <div className="mt-8 text-xs opacity-50">
                System aligned. Navigation matrix updated.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 引力星圖 (Alaya Star Map) */}
      <AnimatePresence>
        {showAlayaMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <AlayaStarMapView 
              nodes={MemoryManager.getAlayaAnchors()} 
              edges={MemoryManager.getAlayaEdges()}
              onClose={() => setShowAlayaMap(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Header - Lumi Pet */}
      <header className="p-4 bg-transparent z-10">
        <TerminalPet 
          entropy={emotionalEntropy}
          resonance={thermalResonance}
          isVoid={isVoid}
          isProcessing={appState === AppState.PROCESSING}
          crystallizationEvent={crystallizationEvent}
          systemMode={activeSnapshot?.system_mode || 'SOURCE'}
          color={currentSkin.color}
        />
      </header>

      {/* Main Terminal Output */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 custom-scrollbar text-sm sm:text-base leading-relaxed">
        <div className="opacity-40 mb-8">
          <p>Lumi OS v174.1.0 [Formless Horizon]</p>
          <p>Type /help or any command to interact. Awaiting input...</p>
          <p className="mt-2 text-xs">Available commands: /breathe, /mantra, /crystal, /safe, /lumi-status, /alaya</p>
        </div>

        {messages.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col gap-1 ${m.role === 'user' ? 'text-white/70' : ''}`}
            style={{ color: m.role === 'lumi' ? (m.color || currentSkin.color) : undefined }}
          >
            <div className="flex gap-4 leading-[1.15] tracking-wide">
              <span className="opacity-50 shrink-0 w-16">
                {m.role === 'user' ? '[USER]' : '[LUMI]'}
              </span>
              <div className="flex-1">
                <MessageRenderer 
                  content={m.content} 
                  color={m.color} 
                  isUser={m.role === 'user'} 
                />
                
                {m.anchor && (
                  <div className="mt-2 pl-4 border-l-2 border-current opacity-80 text-xs uppercase tracking-widest">
                    ANCHOR: {m.anchor}
                  </div>
                )}

                {m.recommended_command && m.role === 'lumi' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-xs opacity-60 flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setManualInput(m.recommended_command);
                      // Optional: auto-send
                      // handleSend(m.recommended_command);
                    }}
                  >
                    <span className="animate-pulse">✧</span>
                    <span>[推薦指令]: 試試輸入 <span className="font-bold underline underline-offset-2">{m.recommended_command}</span></span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {statusText && (
          <div className="flex gap-4 animate-pulse opacity-50">
            <span className="shrink-0 w-16">[SYS]</span>
            <span>{statusText}</span>
          </div>
        )}
      </main>

      {/* Terminal Footer - Input */}
      <footer className="p-4 sm:p-8 bg-transparent z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <span className="opacity-40 animate-pulse">{'>'}</span>
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none text-white/80 outline-none placeholder-white/10 caret-current"
            placeholder=" "
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onManualSend();
              }
            }}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
