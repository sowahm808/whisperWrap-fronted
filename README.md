# WhisperWrap Frontend MVP

Angular + Ionic standalone frontend for the WhisperWrap MVP. This repository intentionally implements only the frontend. It integrates with Firebase Auth, Firestore, Firebase Storage, and the Node/Express WhisperWrap backend endpoints.

## MVP Scope

WhisperWrap flow only. ShepherdCare is not implemented.

Core flow:

1. Subscribed user signs up or logs in.
2. User creates a WhisperWrap request.
3. Backend AI endpoint returns title, message, scripture, and prayer.
4. User reviews, edits, optionally regenerates, and confirms the content.
5. User optionally uploads audio for `audio` or `text_audio` delivery.
6. Backend sends the recipient consent email.
7. Recipient opens `/unwrap/:token`, accepts, reads the message, plays audio if present, and can click “Join Resurgence Vibe”.
8. Backend/Firestore track `draft`, `generated`, `consent_sent`, `accepted`, `opened`, `listened`, and `failed` statuses.

## Frontend Pages

- `LoginPage`
- `SignupPage`
- `DashboardPage`
- `CreateWhisperPage`
- `ReviewWhisperPage`
- `WhisperSentPage`
- `UnwrapWhisperPage`

## Backend Endpoints Used

- `POST /api/whispers/generate`
- `POST /api/whispers/send-consent`
- `GET /api/whispers/unwrap/:token`
- `POST /api/whispers/unwrap/:token/accept`
- `POST /api/whispers/unwrap/:token/listened`

The generate response must include:

```json
{
  "title": "string",
  "message": "string",
  "scriptureReference": "string",
  "scriptureText": "string",
  "shortPrayer": "string"
}
```

## Firebase Collections

The frontend expects these MVP collections to exist and be writable/readable according to your security rules:

- `users`
- `whispers`
- `recipientEvents`

New signups create `users/{uid}` with `subscriptionStatus: "inactive"`. Set it to `"active"` in Firestore, or through your subscription system, before testing send flow.

## Environment Configuration

Update `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
  },
  backendUrl: 'http://localhost:3000',
};
```

The backend should be configured with:

- `OPENAI_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SENDGRID_API_KEY`
- `FROM_EMAIL`
- `APP_BASE_URL`

## Setup

```bash
npm install
npm start
```

For production build:

```bash
npm run build
```

## Test Flow

1. Enable Email/Password in Firebase Authentication.
2. Sign up with name, email, and password.
3. Set `users/{uid}.subscriptionStatus` to `active` in Firestore.
4. Log in and open the dashboard.
5. Create a WhisperWrap with recipient name, email, phone, whisper type, wrap style, delivery format, and sender intent.
6. Generate AI content through `POST /api/whispers/generate`.
7. Edit the title/message/scripture/prayer, regenerate if needed, and optionally upload audio.
8. Confirm and send consent email through `POST /api/whispers/send-consent`.
9. Open the returned `/unwrap/:token` link.
10. Accept the consent prompt, read the message, play audio if attached, and verify statuses/events in Firestore.

## Product Notes

- Uses standalone Angular components.
- Uses mobile-first Ionic UI.
- Uses no icon library.
- Includes validation, user-facing errors, auth guarding, subscriber gating, Firebase Storage audio upload, and public unwrap flow.
