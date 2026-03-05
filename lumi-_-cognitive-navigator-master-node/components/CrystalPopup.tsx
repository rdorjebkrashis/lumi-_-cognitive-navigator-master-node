import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrystalPopupProps {
  event: { anchor: string; color: string; life_anchor?: any } | null;
  onClose: () => void;
}

export const CrystalPopup: React.FC<CrystalPopupProps> = ({ event, onClose }) => {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
        >
          <div className="absolute inset-0 bg-black/90 pointer-events-auto" onClick={onClose} />
          
          <motion.div 
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="relative z-10 pointer-events-auto w-full max-w-2xl"
          >
            <div 
              className="bg-black border-2 p-6 shadow-2xl"
              style={{ borderColor: event.color, boxShadow: `0 0 20px ${event.color}40` }}
            >
              {/* Terminal Header */}
              <div 
                className="flex justify-between items-center border-b-2 pb-2 mb-6"
                style={{ borderColor: event.color }}
              >
                <span className="font-bold tracking-widest uppercase text-sm" style={{ color: event.color }}>
                  [ SYSTEM_OVERRIDE :: LIFE_ANCHOR_CRYSTALLIZED ]
                </span>
                <button onClick={onClose} className="hover:bg-white/10 px-2" style={{ color: event.color }}>
                  [X]
                </button>
              </div>

              {/* ASCII Art Representation */}
              <div className="flex justify-center mb-8">
                <pre className="text-xs leading-tight text-center font-bold" style={{ color: event.color }}>
{`      /\\      
     /  \\     
    /____\\    
   /\\    /\\   
  /  \\  /  \\  
 /____\\/____\\ `}
                </pre>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-xs opacity-50 mb-2 uppercase tracking-widest text-white">
                    &gt; CORE_MANTRA
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-widest text-white">
                    &gt; {event.life_anchor?.core_mantra || event.anchor} &lt;
                  </h2>
                </div>

                {event.life_anchor && (
                  <div className="border-t border-dashed pt-6 space-y-4" style={{ borderColor: `${event.color}80` }}>
                    <div>
                      <span className="text-xs uppercase tracking-widest block mb-2" style={{ color: event.color }}>
                        $ cat summary.txt
                      </span>
                      <p className="text-sm text-white/80 pl-4 border-l-2" style={{ borderColor: event.color }}>
                        {event.life_anchor.summary}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-xs uppercase tracking-widest block mb-2" style={{ color: event.color }}>
                        $ ./extract_insights.sh
                      </span>
                      <ul className="text-sm text-white/80 space-y-2 pl-4">
                        {event.life_anchor.insights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span style={{ color: event.color }}>[{idx}]</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <span className="text-xs uppercase tracking-widest block mb-2" style={{ color: event.color }}>
                        $ echo $LOGIC_SEAL
                      </span>
                      <p className="text-sm text-white/80 pl-4">
                        {event.life_anchor.logic_seal}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="pt-6 flex justify-center">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 border-2 uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                    style={{ borderColor: event.color, color: event.color }}
                  >
                    &gt; EXECUTE_ABSORB_TO_ALAYA
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
