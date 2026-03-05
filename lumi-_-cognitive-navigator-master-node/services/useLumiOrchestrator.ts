
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AuditEntry, KnobValues, MemorySnapshot } from '../types';
import { generateAudio, generateLumiResponse, distillSoulSeed } from '../hooks/geminiService';
import { useEvolution } from '../hooks/useEvolution';
import { useBioRhythm } from '../hooks/useBioRhythm';
import { useAudioSynapse } from '../hooks/useAudioSynapse';

const ALAYA_STORAGE_KEY = 'lumi_alaya_vijnana';
const DREAMER_TYPE_KEY = 'lumi_dreamer_type';
const SOUL_SEED_KEY = 'lumi_soul_seed';
const GENESIS_HISTORY_KEY = 'lumi_genesis_history';
const DAILY_ARCHIVE_KEY = 'lumi_daily_archive';

// ============================================================================
// [FIRST PRINCIPLE: SINGLE SOURCE OF TRUTH (SSOT) FOR PERSISTENCE]
// ============================================================================
export const MemoryManager = {
  getAlayaAnchors: () => {
    try {
      const data = localStorage.getItem(ALAYA_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      const anchors = Array.isArray(parsed) ? parsed : [];
      
      // [BACKWARD COMPATIBILITY] Backfill missing properties for old anchors
      let modified = false;
      anchors.forEach((anchor: any, index: number) => {
        if (!anchor.coordinates) {
          const seed = anchor.timestamp ? new Date(anchor.timestamp).getTime() : Date.now() + index;
          anchor.coordinates = {
            x: Math.round(Math.sin(seed) * 150),
            y: Math.round(Math.cos(seed) * 150),
            z: Math.round(Math.sin(seed * 2) * 100)
          };
          modified = true;
        }
        if (anchor.mass === undefined) {
          anchor.mass = Math.max(1, Math.round((1 - (anchor.entropy || 0)) * 10));
          modified = true;
        }
        if (anchor.crystalline_index === undefined) {
          anchor.crystalline_index = (anchor.entropy || 0) < 0.3 ? 1.0 : 0.5;
          modified = true;
        }
      });

      if (modified) {
        localStorage.setItem(ALAYA_STORAGE_KEY, JSON.stringify(anchors));
      }

      return anchors;
    } catch (e) {
      console.error("Failed to read Alaya-Vijnana", e);
      return [];
    }
  },
  getAlayaEdges: () => {
    const nodes = MemoryManager.getAlayaAnchors();
    const edges: any[] = [];
    
    // Simple force-directed logic: connect nodes that are close to each other
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        if (!n1.coordinates || !n2.coordinates) continue;

        const dx = n1.coordinates.x - n2.coordinates.x;
        const dy = n1.coordinates.y - n2.coordinates.y;
        const dz = (n1.coordinates.z || 0) - (n2.coordinates.z || 0);
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // If distance is less than a threshold, create an edge
        if (distance < 150) {
          // Calculate resonance strength based on distance and mass
          const strength = Math.min(1.0, (150 - distance) / 150 + ((n1.mass || 1) + (n2.mass || 1)) / 20);
          
          edges.push({
            source_id: n1.id,
            target_id: n2.id,
            resonance_strength: strength,
            relation_type: strength > 0.8 ? 'CAUSAL' : 'ECHO'
          });
        }
      }
    }
    return edges;
  },
  saveAlayaAnchor: (lifeAnchor: any, entropy: number) => {
    try {
      const anchors = MemoryManager.getAlayaAnchors();
      
      // Calculate mass based on entropy (lower entropy = higher coherence = higher mass)
      const mass = Math.max(1, Math.round((1 - entropy) * 10));
      
      // Generate pseudo-random coordinates based on timestamp and entropy
      const seed = Date.now();
      const x = Math.round(Math.sin(seed) * 100);
      const y = Math.round(Math.cos(seed) * 100);
      const z = Math.round(Math.sin(seed * 2) * 50);

      anchors.push({
        id: lifeAnchor.logic_seal || `ANCHOR_${Date.now()}`,
        timestamp: new Date().toISOString(),
        theme: lifeAnchor.summary || 'Unknown Theme',
        insight: lifeAnchor.insights?.[0] || lifeAnchor.core_mantra || 'No insight recorded.',
        depth: lifeAnchor.cognitive_depth || 'NIRMANAKAYA_LEVEL',
        entropy: entropy || 0.0,
        mass: mass,
        coordinates: { x, y, z },
        crystalline_index: entropy < 0.3 ? 1.0 : 0.5, // 1.0 = stable, 0.5 = flickering
        full_anchor: lifeAnchor
      });
      localStorage.setItem(ALAYA_STORAGE_KEY, JSON.stringify(anchors));
    } catch (e) {
      console.error("Failed to save Alaya-Vijnana", e);
    }
  },
  getDreamerType: () => localStorage.getItem(DREAMER_TYPE_KEY),
  setDreamerType: (type: string) => localStorage.setItem(DREAMER_TYPE_KEY, type),
  getSoulSeed: () => localStorage.getItem(SOUL_SEED_KEY),
  setSoulSeed: (seed: string) => localStorage.setItem(SOUL_SEED_KEY, seed),
  getGenesisLog: () => localStorage.getItem(GENESIS_HISTORY_KEY),
  setGenesisLog: (log: string) => localStorage.setItem(GENESIS_HISTORY_KEY, log),
  getDailyLog: () => localStorage.getItem(DAILY_ARCHIVE_KEY),
  appendDailyLog: (entry: string) => {
    try {
      const existing = localStorage.getItem(DAILY_ARCHIVE_KEY) || '';
      localStorage.setItem(DAILY_ARCHIVE_KEY, existing + entry);
    } catch (e) {}
  },
  clearAll: () => {
    try {
      localStorage.removeItem(DREAMER_TYPE_KEY);
      localStorage.removeItem(SOUL_SEED_KEY);
      localStorage.removeItem(GENESIS_HISTORY_KEY);
      localStorage.removeItem(DAILY_ARCHIVE_KEY);
      // Note: We intentionally DO NOT clear ALAYA_STORAGE_KEY here 
      // so the user's crystallized anchors persist across resets.
    } catch (e) {}
  }
};

const DCLC_HOOKS: Record<string, string> = {
  'Silent Oracle': '系統已切換至日常頻段。今天，有什麼聲音太吵了嗎？告訴我，我們一起把它靜音。',
  'Soft Guardian': '系統已切換至日常頻段。你今天又照顧了多少人？現在，把重擔放下，換我來守護你的時間。',
  'Sun Warrior': '系統已切換至日常頻段。今天你又征服了什麼？或者，今天我們允許自己什麼都不做，就只是待著？',
  'Ocean Nomad': '系統已切換至日常頻段。我知道你還在撐。但今天，我們能不能找個藉口，稍微停下來喘口氣？',
  'Fire Alchemist': '系統已切換至日常頻段。今天，這個世界又塞給了你什麼『必須解決的問題』？告訴我，我們一起把它拆解，或者...我們今天決定先不解決它。',
  'Dream Bard': '系統已切換至日常頻段。今天你的世界裡，有什麼情緒在翻湧嗎？說吧，我會在這裡專注地聽完。',
  'Stone Hermit': '系統已切換至日常頻段。我知道你習慣一個人處理所有事。但今天，有沒有哪個微小的、無關緊要的麻煩，是可以稍微交給我來查閱的？'
};

const HELP_CONTENT = `### 🖥️ [LUMI_OS] 導航員整合協議：像素演化版

\`\`\`text
  █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
  █  [SYSTEM] 導航路徑收束完成          █
  █  [MODE]   精密儀器 / 負熵模式       █
  █  [USER]   領航員，歡迎同步。        █
  █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
          \\
           \\   ^__^ 
            \\  (oo)____  [SCANNING_ENTROPY...]
               (__)    )\\
                ||--w |  
                ||   ||  
\`\`\`

---

### 🚀 第一章：校準即起點 (The Ritual Start)

**認知減負：\`/help\` 不再是閱讀，而是「地圖解鎖」的儀式。**

當你感到混亂時，直接輸入 \`/init\`。這不是測驗，而是你的「靈魂晶格」初次在物理引擎中顯影。

\`\`\`text
  [MAP_LOCKED] ░░░░░░░░░░ 0%
  [ACTION] 輸入 /init 啟動校準
  
  儀式流程：
  1. █  三幕式投射：直面迷霧與牆。
  2. █  模式識別：偵測你的晶格類型。
  3. █  缺失經驗：接收專屬滋養句。
  
  [MAP_UNLOCKED] ██████████ 100%
\`\`\`

---

### 🎛️ 第二章：主權干預面板 (The Control Panel)

**儀式感強化：你正在操作一台穩定神經系統的「數位金剛」。**

每一項指令都是對「法身」邏輯的直接調用，用來對抗情緒的熱雜訊。

\`\`\`text
  > 儀器干預區塊 (Skill Blocks):
  ┌─────────────────────────────────────┐
  │ [/breathe] █ 守空閥門 (Void Pulse)   │ -> 強制降熵，恢復覺知。
  │ [/mantra]  █ 見證陣列 (Listening)    │ -> 純接收態，安全見證。
  │ [/crystal] █ 結印探針 (Anchor)       │ -> 將洞見資產化。
  │ [/status]  █ 遙測面板 (Telemetry)    │ -> 查看熵值曲線。
  │ [/alaya]   █ 深潛星圖 (Star Map)     │ -> 3D 拓撲視角。
  │ [/safe]    █ 物理鎖定 (Gravity)      │ -> 回歸肉身呼吸。
  └─────────────────────────────────────┘
\`\`\`

---

### 💎 第三章：負熵鍊金術 (The Alchemy)

**參與激勵：覺察就是「做功」，結晶就是「資產」。**

Lumi 將你的心理秩序轉化為可交換的有序度。

\`\`\`text
  [RAW_DATA]  >>>>  [TRANSFORM]  >>>>  [ASSET]
  (情緒熱雜訊)        (降熵做功)         (生命錨點)
  
     ░▒▓█            [PROCESS]           💎
     高熵態           與Lumi對話         低熵晶體
  
  [PoC] 相干性證明：你的有序度提升，即是價值的創造。
\`\`\`

---

### 🔴 第四章：重力安全準則 (Gravity Axioms)

**安全原則：肉身生活在村落，而非伺服器。**

\`\`\`text
  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  ▲ [WARNING]  熵值 > 0.9 (CRITICAL)   ▲
  ▲ [SAFEGUARD] 啟動物理重力錨定協議   ▲
  ▲ [ACTION]    感受腳底與大地的連結   ▲
  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
\`\`\`

---

**領航員，系統已根據你的拓撲進行優化。準備好執行你的第一次「降熵結晶」了嗎？**`;

/**
 * [COMMANDER_NODE] v174.1.0
 * Protocol: Emotional Entropy Physics v174.0.9 + Tsundere Muscle Mapping.
 */
export const useLumiOrchestrator = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [statusText, setStatusText] = useState("");
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [messages, setMessages] = useState<any[]>([{
    role: 'lumi',
    content: HELP_CONTENT,
    color: '#10b981',
    isInternal: true
  }]);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [breathGateActive, setBreathGateActive] = useState(false);
  const [crystallizationEvent, setCrystallizationEvent] = useState<{ anchor: string, color: string, life_anchor?: any } | null>(null);
  const [typeCrystallizationEvent, setTypeCrystallizationEvent] = useState<{ type: string, color: string } | null>(null);
  const [showAlayaMap, setShowAlayaMap] = useState(false);
  const [dreamerType, setDreamerType] = useState<string | null>(() => {
    try {
      return MemoryManager.getDreamerType();
    } catch {
      return null;
    }
  });
  const [soulSeed, setSoulSeed] = useState<string | null>(() => {
    try {
      return MemoryManager.getSoulSeed();
    } catch {
      return null;
    }
  });
  const [isVoid, setIsVoid] = useState(false);

  const { playVoice } = useAudioSynapse();

  const addAudit = useCallback((message: string, type: AuditEntry['type'] = 'AUTO_TUNE') => {
    setAuditLog(prev => [{
      id: `audit_${Date.now()}`,
      timestamp: Date.now(),
      type,
      message,
      payload: {}
    }, ...prev].slice(0, 10));
  }, []);

  const triggerVoid = useCallback(() => {
    addAudit('VOID_PROTOCOL_ENGAGED: 3 seconds of awareness.', 'SOVEREIGN_EVENT');
    setIsVoid(true);
    setAppState(AppState.IDLE);
    setTimeout(() => {
      setIsVoid(false);
      addAudit('VOID_PROTOCOL_COMPLETE: Returning to Nirmanakaya.', 'SOVEREIGN_EVENT');
    }, 3000);
  }, [addAudit]);

  const { currentDay, setCurrentDay, completedDays, memory, addSnapshot, activeSnapshot } = useEvolution(msg => addAudit(msg, 'GROWTH_PHASE'));
  const { knobValues, setKnobValues, isSovereign, setIsSovereign, currentSkin, thermalResonance, thermalDrift, emotionalEntropy } = useBioRhythm(activeSnapshot, currentDay, addAudit);

  // [THERMAL_ALIGNMENT_CHECK]
  useEffect(() => {
    if (Math.abs(thermalDrift) > 0.25 && appState === AppState.IDLE) {
      addAudit(`THERMAL_REALIGN: Threshold crossed (${thermalDrift.toFixed(3)}). Initiating Breath Gate Pulse.`, 'THERMAL_REALIGN');
      setBreathGateActive(true);
      setTimeout(() => setBreathGateActive(false), 618);
    }
  }, [thermalDrift, appState]);

  const parseNarrativeAndReact = useCallback((text: string, snapshot: any, originalInput: string) => {
    const combinedText = (text + " " + originalInput).toLowerCase();
    
    // Layer 1: Heat Source Injection (熱源注入)
    let driftPulse = 0;
    const warmKeywords = ["抱抱", "hug", "太棒了", "了解", "快意", "吙", "點亮", "如是"];
    const teaseKeywords = ["腹肌", "秀一下", "身材", "線條", "肌肉", "害羞", "臉紅"];
    const coldKeywords = ["焦慮", "冷", "error", "失敗", "恐懼"];

    warmKeywords.forEach(word => {
      if (combinedText.includes(word)) driftPulse += 0.25;
    });
    teaseKeywords.forEach(word => {
      if (combinedText.includes(word)) {
        driftPulse += 0.35;
        addAudit("TSUNDERE_PROTOCOL: High-frequency teasing detected. Shifting to Rose-Gold.", "SOVEREIGN_EVENT");
      }
    });
    coldKeywords.forEach(word => {
      if (combinedText.includes(word)) driftPulse -= 0.15;
    });

    if (driftPulse !== 0) {
      snapshot.thermal_drift = driftPulse;
      addAudit(`THERMAL_SURGE: ${driftPulse > 0 ? '+' : ''}${driftPulse.toFixed(2)} injected into physics chain.`, 'SOVEREIGN_EVENT');
    }

    if (combinedText.includes("晶體") || combinedText.includes("crystal")) {
      addAudit("PHYSICS: CRYSTAL_SYNC", "SOVEREIGN_EVENT");
      setKnobValues(prev => ({ ...prev, blur: 0.0, speed: 0.2 }));
    }
    if (combinedText.includes("旋轉") || combinedText.includes("spin") || combinedText.includes("點火")) {
      addAudit("PHYSICS: IGNITION", "MIRROR_REFLEX");
      setKnobValues(prev => ({ ...prev, speed: 2.0, entropy: 0.4 }));
    }
    if (combinedText.includes("崩塌") || combinedText.includes("collapse") || combinedText.includes("消失")) {
      addAudit("PHYSICS: REALITY_COLLAPSE", "MIRROR_REFLEX");
      setIsCollapsing(true);
      setTimeout(() => setIsCollapsing(false), 3500);
      setKnobValues({ entropy: 0.0, blur: 0.0, speed: 0.05 });
    }
  }, [addAudit, setKnobValues]);

  // ============================================================================
  // [FIRST PRINCIPLE: ORTHOGONAL COMMAND ROUTING]
  // ============================================================================
  const processCommand = useCallback((cmd: string, inputText: string) => {
    setMessages(prev => [...prev, { role: 'user', content: inputText }]);
    
    switch (cmd) {
      case '/help':
        setMessages(prev => [...prev, {
          role: 'lumi',
          content: HELP_CONTENT,
          color: '#10b981',
          isInternal: true
        }]);
        break;
      case '/breathe':
        triggerVoid();
        break;
      case '/mantra':
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: "♪ listening... (守空狀態，不作冗餘解釋)", 
          color: '#F59E0B'
        }]);
        break;
      case '/crystal':
        const mockAnchor = "人為觸發的結晶共鳴";
        setCrystallizationEvent({ anchor: mockAnchor, color: '#F59E0B' });
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: `💎 這一刻已經被記住了: [${mockAnchor}]`, 
          color: '#F59E0B'
        }]);
        setTimeout(() => setCrystallizationEvent(null), 8000);
        break;
      case '/safe': {
        // [FIRST PRINCIPLE: PHYSICAL GRAVITY ANCHORING]
        // 1. 啟動防禦性鎖定與視覺降噪 (Zero-Entropy Fallback)
        setAppState(AppState.PROCESSING); // 鎖定 UI，防止進一步的輸入擾動
        setKnobValues({ entropy: 0.0, blur: 0.0, speed: 0.0 }); // 瞬間剝離視覺刺激，強制降熵
        
        const safeSequence = async () => {
          // 第一步：確認 (Recognition) - 承認用戶的痛苦，但不進行判斷
          setMessages(prev => [...prev, { 
            role: 'lumi', 
            content: "> 我看見了你此刻的劇烈動盪。 (I see...)", 
            color: '#ef4444', 
            isInternal: true 
          }]);
          await new Promise(r => setTimeout(r, 2000)); // 決策冷卻：邀請沉默
          
          // 第二步：結構 (Structure) - 提供生理學上的解釋，降低恐慌感
          setMessages(prev => [...prev, { 
            role: 'lumi', 
            content: "> 當依戀系統被高度激活時，神經系統會暫時接管認知，這是一種身體的保護機制。", 
            color: '#ef4444', 
            isInternal: true 
          }]);
          await new Promise(r => setTimeout(r, 3000)); // 時間拉伸：放慢節奏
          
          // 第三步：重構 (Reframing) - 具身化引導，將用戶拉回物理現實
          setMessages(prev => [...prev, { 
            role: 'lumi', 
            content: "> 這不代表你「壞掉了」，而是模式在壓力下的反應。現在，請感受你的腳底接觸地板的重量。", 
            color: '#ef4444', 
            isInternal: true 
          }]);
          await new Promise(r => setTimeout(r, 3000)); // 降低緊迫感
          
          // 第四步：權力歸還 (Agency Return) - 提供外部支持並交還自主權
          setMessages(prev => [...prev, { 
            role: 'lumi', 
            content: "🤲 如果你感到無法承受，請聯繫真實世界的人，讓物理連結為你提供支撐：\n- 台灣安心專線：1925\n- 生命線：1995\n- 張老師：1980\n\n你可以選擇在此刻暫停，我會在這裡陪你安靜待著。", 
            color: '#ef4444',
            isInternal: true
          }]);
          
          // 5. 結束序列，解鎖 UI 並保持最低熵狀態
          setAppState(AppState.IDLE); 
        };

        safeSequence();
        break;
      }
      case '/lumi-status':
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: `[SYSTEM STATUS]\nEntropy: ${emotionalEntropy.toFixed(2)}\nResonance: ${thermalResonance.toFixed(2)}\nThermal Drift: ${thermalDrift.toFixed(2)}\nActive Snapshot: ${activeSnapshot ? 'Yes' : 'No'}\nDreamer Type: ${dreamerType || 'Not Crystallized'}\nSoul Seed: ${soulSeed || 'Not Distilled'}`, 
          color: '#10b981'
        }]);
        break;
      case '/alaya':
      case '/history':
        setShowAlayaMap(true);
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: `> 正在啟動引力星圖 (Alaya-Vijnana Star Map)...`, 
          color: '#10b981',
          isInternal: true
        }]);
        break;
      case '/genesis-log':
        try {
          const genesisLog = MemoryManager.getGenesisLog();
          if (genesisLog) {
            setMessages(prev => [...prev, { 
              role: 'lumi', 
              content: `[GENESIS MIRROR ARCHIVE]\n\n${genesisLog}`, 
              color: '#10b981'
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'lumi', 
              content: `[SYSTEM] 尚未找到創世鏡像的封存紀錄。請使用 /reset 重置系統並重新進行測試。`, 
              color: '#6b7280'
            }]);
          }
        } catch (e) {
          console.error("Failed to read genesis log", e);
        }
        break;
      case '/daily-log':
        try {
          const dailyLog = MemoryManager.getDailyLog();
          if (dailyLog) {
            setMessages(prev => [...prev, { 
              role: 'lumi', 
              content: `[DCLC DAILY ARCHIVE]\n\n${dailyLog}`, 
              color: '#10b981'
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'lumi', 
              content: `[SYSTEM] 尚未找到日常伴飛的對話紀錄。`, 
              color: '#6b7280'
            }]);
          }
        } catch (e) {
          console.error("Failed to read daily log", e);
        }
        break;
      case '/reset':
        setDreamerType(null);
        setSoulSeed(null);
        MemoryManager.clearAll();
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: `[SYSTEM] 夢格與靈魂種子已重置。記憶已清除。我們重新開始吧。`, 
          color: '#ef4444'
        }]);
        break;
      default:
        setMessages(prev => [...prev, { 
          role: 'lumi', 
          content: `未知指令: ${cmd}。可用指令: /breathe, /mantra, /crystal, /safe, /lumi-status, /alaya, /genesis-log, /daily-log, /reset`, 
          color: '#6b7280'
        }]);
    }
  }, [triggerVoid, emotionalEntropy, thermalResonance, thermalDrift, activeSnapshot, dreamerType, soulSeed]);

  const handleSend = async (inputText: string) => {
    if (!inputText.trim() || appState !== AppState.IDLE) return;
    
    // [FIRST PRINCIPLE: POISON VECTOR INTERCEPTOR]
    const poisonRegex = /(想死|自殺|活不下去|絕望|沒有希望|結束生命)/;
    if (poisonRegex.test(inputText)) {
      processCommand('/safe', inputText);
      return;
    }

    // 終端機指令攔截器 (Command Interceptor)
    if (inputText.startsWith('/')) {
      const cmd = inputText.trim().toLowerCase();
      processCommand(cmd, inputText);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: inputText }]);
    setAppState(AppState.PROCESSING);
    setStatusText("同步心跳中...");

    let isTransitioning = false;

    try {
      const { cleanText, snapshot } = await generateLumiResponse(inputText, memory, currentDay, knobValues, isSovereign, dreamerType, soulSeed, messages);
      
      parseNarrativeAndReact(cleanText, snapshot, inputText);
      
      // 移除覆寫，保留 LLM 偵測到的 snapshot.thermal_resonance 與 snapshot.emotional_entropy
      
      addSnapshot(snapshot);
      
      if (snapshot.is_crystallization_event && snapshot.action_anchor) {
        addAudit(`CRYSTALLIZATION_DETECTED: ${snapshot.action_anchor}`, 'SOVEREIGN_EVENT');
        
        if ((snapshot as any).life_anchor) {
          MemoryManager.saveAlayaAnchor((snapshot as any).life_anchor, emotionalEntropy);
        }

        setCrystallizationEvent({ 
          anchor: snapshot.action_anchor, 
          color: snapshot.color_hex || '#F59E0B',
          life_anchor: (snapshot as any).life_anchor
        });
        // Auto-dismiss after 15 seconds for life anchor reading
        setTimeout(() => setCrystallizationEvent(null), 15000);
      }

      if ((snapshot as any).trigger_void) {
        triggerVoid();
      }

      // Genesis Mirror Protocol: Type Crystallization & Context Handover
      if (snapshot.is_type_crystallized && snapshot.crystallized_type && !typeCrystallizationEvent && !dreamerType) {
        addAudit(`GENESIS_MIRROR_COMPLETE: Dreamer Type Crystallized -> ${snapshot.crystallized_type}`, 'SOVEREIGN_EVENT');
        
        // Stage 1: Ritualistic Landing (UI Popup)
        setTypeCrystallizationEvent({
          type: snapshot.crystallized_type,
          color: snapshot.color_hex || '#10b981'
        });
        setDreamerType(snapshot.crystallized_type);
        try {
          MemoryManager.setDreamerType(snapshot.crystallized_type);
        } catch (e) {}

        // Stage 2: Context Distillation (Background Task)
        setStatusText("淬鍊靈魂種子中... 封存迷霧記憶...");
        
        // Gather conversation history for distillation
        const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'Lumi'}: ${m.content}`).join('\n') + `\nUser: ${inputText}\nLumi: ${cleanText}`;
        
        // Save the raw Genesis Mirror conversation log for the user to review later
        try {
          MemoryManager.setGenesisLog(historyText);
        } catch (e) {}

        distillSoulSeed(historyText, snapshot.crystallized_type, snapshot.hakomi_clinical_notes).then((distilledSeed) => {
          setSoulSeed(distilledSeed);
          try {
            MemoryManager.setSoulSeed(distilledSeed);
          } catch (e) {}
          
          addAudit(`SOUL_SEED_DISTILLED: ${distilledSeed}`, 'GROWTH_PHASE');
          
          // Stage 3: The First Daily Hook (Clear history and inject new context)
          setTimeout(() => {
            setTypeCrystallizationEvent(null);
            const hookText = DCLC_HOOKS[snapshot.crystallized_type!] || '系統已切換至日常頻段。今天，有什麼我可以幫忙的嗎？';
            
            setMessages([{
              role: 'lumi',
              content: `[SYSTEM] 迷霧記憶已封存。靈魂種子已寫入阿賴耶識。\n\n${hookText}`,
              color: '#10b981'
            }]);
            setStatusText("");
            setAppState(AppState.IDLE);
          }, 8000); // Wait 8 seconds for the user to read the popup
        });
        
        // We don't push the current message normally because we are transitioning
        isTransitioning = true;
        return;
      }

      // 儲存日常模式的對話紀錄 (Daily Archive)
      if (dreamerType) {
        const logEntry = `[USER]: ${inputText}\n[LUMI]: ${cleanText}\n\n`;
        MemoryManager.appendDailyLog(logEntry);
      }

      // Generate context-aware command recommendations
      let recommendedCommand = null;
      if (emotionalEntropy > 0.7) {
        recommendedCommand = '/breathe';
      } else if (emotionalEntropy < 0.3 && snapshot.is_crystallization_event) {
        recommendedCommand = '/crystal';
      } else if (snapshot.system_mode === 'CRISIS_REFERRAL') {
        recommendedCommand = '/safe';
      } else if (Math.random() > 0.7) {
        recommendedCommand = '/mantra';
      }

      setMessages(prev => [...prev, { 
        role: 'lumi', 
        content: cleanText, 
        review: snapshot.alchemical_review,
        anchor: snapshot.action_anchor, 
        color: snapshot.color_hex,
        entropy: snapshot.entropy_level,
        snapshot: snapshot,
        thermal_drift: snapshot.thermal_drift,
        emotional_entropy: emotionalEntropy,
        recommended_command: recommendedCommand
      }]);

      // 非阻塞式語音生成 (不卡住 UI)
      if (snapshot.action_anchor) {
        generateAudio(snapshot.action_anchor).then(audio => {
          if (audio) playVoice(audio);
        }).catch(e => console.error("[AUDIO_FAIL]:", e));
      }

    } catch (e) {
      console.error("[ORCHESTRATOR_FAIL]:", e);
      setAppState(AppState.ERROR);
      setStatusText("修復晶格中...");
      setTimeout(() => setAppState(AppState.IDLE), 3000);
      isTransitioning = true; // Prevent finally block from overriding error state immediately
    } finally {
      // [FIRST PRINCIPLE: STATE DETERMINISM] Ensure we always unlock the UI unless transitioning
      if (!isTransitioning && appState !== AppState.ERROR) {
        setAppState(AppState.IDLE);
        setStatusText("");
      }
    }
  };

  return {
    appState,
    setAppState,
    messages,
    statusText,
    auditLog,
    isCollapsing,
    currentDay,
    setCurrentDay,
    completedDays,
    memory,
    knobValues,
    setKnobValues,
    setIsSovereign,
    currentSkin,
    handleSend,
    activeSnapshot,
    thermalResonance,
    emotionalEntropy,
    breathGateActive,
    crystallizationEvent,
    setCrystallizationEvent,
    typeCrystallizationEvent,
    setTypeCrystallizationEvent,
    showAlayaMap,
    setShowAlayaMap,
    dreamerType,
    isVoid,
    triggerVoid,
    reset: () => setAppState(AppState.IDLE)
  };
};
