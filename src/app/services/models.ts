export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'past_due'
  | 'canceled';

export type WhisperType =
  | 'congratulations'
  | 'comfort'
  | 'motivation'
  | 'forgiveness'
  | 'apology'
  | 'reconnection'
  | 'encouragement';

export type WrapStyle =
  | 'gentle'
  | 'prophetic'
  | 'elegant'
  | 'celebration'
  | 'healing'
  | 'reconciliation'
  | 'gratitude'
  | 'romantic'
  | 'encouragement'
  | 'legacy';

export type DeliveryFormat =
  | 'text'
  | 'audio'
  | 'text_audio';

export type RecipientGender = 'male' | 'female';

export type WhisperStatus =
  | 'draft'
  | 'generated'
  | 'consent_sent'
  | 'accepted'
  | 'opened'
  | 'listened'
  | 'failed';

export interface UserProfile {
  id?: string;
  email: string;
  displayName: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt?: unknown;
}

export interface WhisperInput {
  recipientName: string;
  recipientAddressName: string;
  recipientGender: RecipientGender;

  // Either email or phone (or both)
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  senderName?: string;
  whisperType: WhisperType;
  wrapStyle: WrapStyle;
  deliveryFormat: DeliveryFormat;
  prompt: string;
  senderIntent: string;
}

export interface GeneratedWhisper {
  recipientAddressName: string;
  recipientGender: RecipientGender;
  title: string;
  message: string;
  scriptureReference: string;
  scriptureText: string;
  shortPrayer: string;
}

export interface WhisperRecord extends WhisperInput, GeneratedWhisper {
  id?: string;

  /**
   * Backend ownership
   */
  userId?: string;
  senderId?: string;

  /**
   * Display information
   */
  senderName?: string;

  /**
   * Delivery
   */
  status: WhisperStatus;

  /**
   * Frontend playback URL
   */
  audioUrl?: string;

  /**
   * Backend Firebase Storage path
   */
  audioPath?: string | null;

  /**
   * Consent
   */
  unwrapToken?: string;
  unwrapLink?: string;

  consentChannels?: {
    email: boolean;
    manual: boolean;
  };
  consentLink?: string;

  /**
   * Firestore timestamps
   */
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ConsentResponse {
  success?: boolean;

  whisperId?: string;

  consentLink: string;

  status?: WhisperStatus;

  channels?: {
    email: boolean;
    manual: boolean;
  };
}

export interface SmsConsentRequest {
  valid: boolean;
  recipientName?: string;
  senderName?: string;
  maskedPhone?: string;
  alreadyConsented: boolean;
  expired?: boolean;
}

export interface SmsConsentSubmission {
  phoneNumber: string;
  smsConsent: true;
  disclosureVersion: string;
  termsVersion: string;
  privacyVersion: string;
}

export interface SmsConsentResponse {
  success: boolean;
  alreadyProcessed?: boolean;
}

export interface RecipientEvent {
  id?: string;

  whisperId?: string;

  token?: string;

  eventType: WhisperStatus;

  createdAt?: unknown;
}
