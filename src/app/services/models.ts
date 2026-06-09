export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled';
export type WhisperType =
  | 'congratulations'
  | 'comfort'
  | 'motivation'
  | 'forgiveness'
  | 'apology'
  | 'reconnection'
  | 'encouragement';
export type WrapStyle = 'gentle' | 'prophetic' | 'elegant' | 'celebration' | 'healing' | 'reconciliation';
export type DeliveryFormat = 'text' | 'audio' | 'text_audio';
export type WhisperStatus = 'draft' | 'generated' | 'consent_sent' | 'accepted' | 'opened' | 'listened' | 'failed';

export interface UserProfile {
  id?: string;
  email: string;
  displayName: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt?: unknown;
}

export interface WhisperInput {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  whisperType: WhisperType;
  wrapStyle: WrapStyle;
  deliveryFormat: DeliveryFormat;
  senderIntent: string;
}

export interface GeneratedWhisper {
  title: string;
  message: string;
  scriptureReference: string;
  scriptureText: string;
  shortPrayer: string;
}

export interface WhisperRecord extends WhisperInput, GeneratedWhisper {
  id?: string;
  senderId?: string;
  senderName?: string;
  status: WhisperStatus;
  audioUrl?: string;
  unwrapToken?: string;
  unwrapLink?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ConsentResponse {
  whisperId?: string;
  token?: string;
  unwrapLink?: string;
  status?: WhisperStatus;
}

export interface RecipientEvent {
  id?: string;
  whisperId?: string;
  token?: string;
  eventType: WhisperStatus;
  createdAt?: unknown;
}
