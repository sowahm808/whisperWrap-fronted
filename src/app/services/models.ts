export type WhisperType = 'congratulations' | 'comfort' | 'motivation' | 'forgiveness' | 'apology' | 'reconnection' | 'encouragement';
export type WrapStyle = 'gentle' | 'prophetic' | 'elegant' | 'celebration' | 'healing' | 'reconciliation';
export type DeliveryFormat = 'text' | 'audio' | 'text_audio';

export interface WhisperInput {
  recipientName: string; recipientEmail: string; recipientPhone: string;
  whisperType: WhisperType; wrapStyle: WrapStyle; deliveryFormat: DeliveryFormat; senderIntent: string;
}
export interface GeneratedWhisper { title: string; message: string; scriptureReference: string; scriptureText: string; shortPrayer: string; }
export interface WhisperRecord extends WhisperInput, GeneratedWhisper { id?: string; status: 'draft'|'generated'|'consent_sent'|'accepted'|'opened'|'listened'|'failed'; audioUrl?: string; }
