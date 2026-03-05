export type MessageType = 'normal' | 'life_anchor_crystal' | 'dreamer_type_crystal';

export interface CrystalCardData {
    type: 'life_anchor' | 'dreamer_type';
    color: string;
    anchor?: string;
    life_anchor?: LifeAnchor;
    crystallized_type?: string;
    hakomi_clinical_notes?: string;
}

export interface LumiMessage {
    role: 'user' | 'lumi';
    content: string;
    color?: string;
    isInternal?: boolean;
    type?: MessageType;
    crystallData?: CrystalCardData;
}