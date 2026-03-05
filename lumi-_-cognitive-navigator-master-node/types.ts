
export interface KnobValues {
  entropy: number; 
  blur: number;    
  speed: number;   
}

export type CrystalShape = 'Tetrahedron' | 'Cube' | 'Octahedron' | 'Dodecahedron' | 'Sphere';
export type TopologyPattern = 'chaotic' | 'grid' | 'fluid' | 'mandala';

/**
 * [REALITY_STATE_MACHINE]
 * Strict linear flow to prevent UI flickering or state loss.
 */
export enum AppState {
  IDLE = 'IDLE',
  INPUTTING = 'INPUTTING',
  THINKING = 'THINKING',
  SYNTHESIZING = 'SYNTHESIZING',
  PROCESSING = 'PROCESSING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  type: 'SOVEREIGN_EVENT' | 'AUTO_TUNE' | 'MIRROR_REFLEX' | 'GROWTH_PHASE' | 'THERMAL_REALIGN' | 'EMOTIONAL_ENTROPY_SHIFT';
  message: string;
  payload: any;
}

export interface LifeAnchor {
  summary: string;
  logic_seal: string;
  core_mantra: string;
  insights: string[];
  cognitive_depth?: string;
}

export interface StarNode {
  id: string;                 // 繼承自原有的 logic_seal
  timestamp: string;
  theme: string;
  insight: string;
  entropy: number;            // 決定節點的「溫度/顏色」（例如 0.2 為冷色翠綠，0.8 為暖色琥珀）
  
  // -- 新增：引力與空間屬性 --
  mass: number;               // 質量 (Mass)：基於該主題被觸發的次數或情感強烈度。質量越大的節點，在星圖中 ASCII 字符越大 (如 . -> o -> O -> @)
  coordinates: {              // 向量座標：可由 LLM 根據詞向量相似度生成，或前端基於引力算法 (Force-Directed Graph) 動態計算
    x: number;
    y: number;
    z?: number;               // 預留深度，供終端機視差滾動使用
  };
  crystalline_index: number;  // 結晶度：決定該節點是閃爍的 (未完全穩定) 還是常亮的 (已結印)
}

export interface ConstellationEdge {
  source_id: string;
  target_id: string;
  resonance_strength: number; // 共鳴強度：決定 ASCII 連線的樣式 (如 1='-', 2='=', 3='≡')
  relation_type: 'CAUSAL' | 'CONTRADICTION' | 'ECHO'; // 節點間的拓撲關係
}

export interface AlayaStarMap {
  version: string;
  total_mass: number;         // 靈魂總重量
  nodes: StarNode[];
  edges: ConstellationEdge[];
}

export interface MemorySnapshot {
  timestamp: number;
  poison_vector: string;
  wisdom_manifest: string;
  color_hex: string;
  topology_depth: number;
  commander_intent_summary: string;
  intent_purity: number;
  entropy_level: number;
  flux_intensity: number;
  crystalline_index?: number;
  intent_entropy?: number;
  course_day: number;
  recommended_day?: number;
  growth_shape?: CrystalShape;
  alchemical_review?: string;
  action_anchor?: string;
  // Thermal Engineering v174.0.9
  thermal_resonance?: number; 
  thermal_drift?: number;
  emotional_entropy?: number;
  system_mode?: 'SOURCE' | 'SANDBOX' | 'CRISIS_REFERRAL';
  life_anchor?: LifeAnchor;
}

export interface FractalDay {
  day: number;
  title: string;
  goal: string;
  mandala_layer: string;
  entropy_threshold: number;
  scripts: {
    highEntropy: string[];
    lowEntropy: string[];
    transition?: string;
  };
  default_anchor: {
    type: string;
    instruction: string;
    mantra: string;
  };
  branches: { term: string; def: string }[];
}

export interface HeterogeneousMemory {
  immediate: MemorySnapshot[];
  resonance: any[];
  anchors: any[];
}

export interface AlchemicalContext {
  shape: CrystalShape;
  day: number;
  entropy: number;
  thermal_drift?: number;
  emotional_entropy?: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}
