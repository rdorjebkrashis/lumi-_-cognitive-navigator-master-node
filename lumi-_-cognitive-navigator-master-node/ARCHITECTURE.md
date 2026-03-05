# Lumi System Architecture & Constraints (Hot Cache)

## 1. 第一性原理 (First Principles)
- **信噪比最大化**：本文件僅保留「How」與「What」。所有「Why」（哲學推演、精神分析、熱力學理論）請存放於 Google Drive 的 PDF 中，作為冷儲存。
- **單一事實來源 (SSOT)**：所有核心邏輯與 UI 規範以本文件為準。
- **絕對遞迴 (Absolute Recursion)**：從底層數據到頂層 UI，必須保持美學與邏輯的高度一致。

## 2. 美學規範 (Aesthetic Axioms)
- **風格**：Terminal / Retro-Geek / ASCII Art。
- **字體**：全域強制使用等寬字體 (`font-mono`)。
- **排版**：大寫寬字距 (`uppercase tracking-widest`)，使用類似終端機指令的排版（如 `$ cat`, `> EXECUTE`）。
- **色彩**：純黑背景 (`bg-black`)，搭配高對比度的螢光色邊框與文字（如 `#F59E0B` 琥珀色、`#10B981` 翠綠色）。
- **禁忌**：**嚴禁**使用現代 UI 元素（如高斯模糊 `backdrop-blur`、圓角陰影 `rounded-xl`、漸層色、平滑過渡的物理彈簧動畫）。所有邊框必須是實線 (`border-2` 或 `border-dashed`)。

## 3. 認知架構與數據流向 (Cognitive Architecture & Data Flow)
系統採用嚴格的 MVC / 三位一體架構，禁止越權調用。

### 3.1 大腦 (Brain) - 純邏輯層
- **模塊**：`geminiService.ts`
- **職責**：封裝 LLM 呼叫、System Prompt 約束、解析 `NidraSnapshot`。
- **輸出**：嚴格的 JSON 結構（包含 `emotional_entropy`, `cognitive_type`, `system_mode`, `life_anchor` 等）。

### 3.2 神經系統 (Nervous System) - 狀態管理層
- **模塊**：`useLumiOrchestrator.ts`, `useBioRhythm.ts`, `useEvolution.ts`
- **職責**：接收大腦的解析結果，更新全局狀態（如 `isVoid`, `crystallizationEvent`），處理指令攔截（如 `/breathe`），並將狀態派發給 UI。
- **約束**：不可包含任何 UI 渲染邏輯（如 HTML/CSS）。

### 3.3 軀體 (Body) - 視圖層
- **模塊**：`TerminalPet.tsx`, `CrystalPopup.tsx`, `App.tsx`
- **職責**：將神經系統傳來的狀態（如 `entropy`, `resonance`, `systemMode`）映射為具體的 ASCII 動畫與終端機文字。
- **約束**：不可包含任何業務邏輯或直接呼叫 LLM，只能透過 Props 接收狀態並觸發 Callback。

## 4. 核心狀態定義 (Core States)
- **`emotional_entropy` (0.0 - 1.0)**：情緒熵。0.0 為極度平靜，1.0 為極度混亂。
- **`thermal_resonance` (36.0 - 42.0)**：熱共振。37.5 為完美相干態。
- **`system_mode`**：
  - `SOURCE` (E < 0.4)：提燈人模式（零批判鏡像）。
  - `SANDBOX` (0.4 <= E < 0.8)：外科醫生模式（邏輯解構）。
  - `CRISIS_REFERRAL` (E >= 0.8)：物理重力錨定（轉介與有限性聲明）。
- **`life_anchor`**：生命定錨舍利（包含 `summary`, `logic_seal`, `core_mantra`, `insights`）。

## 5. 資料遷移與向下相容 (Data Migration & Backward Compatibility)
- **防禦性讀取 (Defensive Reading)**：從 `localStorage` 或外部讀取資料時，必須假設資料可能不完整或格式陳舊。
- **動態回填 (Dynamic Backfilling)**：當引入新屬性（如 3D 座標 `coordinates`）時，必須在讀取層（如 `MemoryManager.getAlayaAnchors`）實作自動回填邏輯，利用既有屬性（如 `timestamp`）生成確定性的預設值，確保舊資料能平滑過渡到新架構。
- **型別安全 (Type Safety)**：確保讀取到的資料型別正確（例如使用 `Array.isArray` 檢查），防止渲染層崩潰。

## 6. 開發 SOP (Standard Operating Procedure)
1. **理論構思**：User 將架構白皮書、日誌等寫入 PDF。
2. **冷儲存上傳**：User 將 PDF 上傳至 Google Drive。
3. **對齊共識**：User 呼叫 AI 解析 PDF，AI 參考本 `ARCHITECTURE.md` 給出實作方案。
4. **授權執行**：雙方達成共識後，AI 開始修改代碼。
