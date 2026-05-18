# WhisperWrap Frontend MVP

Angular + Ionic standalone frontend for WhisperWrap MVP, integrated with Firebase Auth/Firestore/Storage and backend Node/Express APIs.

## Implemented MVP Pages
- LoginPage
- SignupPage
- DashboardPage
- CreateWhisperPage
- ReviewWhisperPage
- WhisperSentPage
- UnwrapWhisperPage

## Backend Endpoints Used
- `POST /api/whispers/generate`
- `POST /api/whispers/send-consent`
- `GET /api/whispers/unwrap/:token`
- `POST /api/whispers/unwrap/:token/accept`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Update `src/environments/environment.ts` with Firebase config and backend URL.
3. Ensure backend env vars are configured:
   - OPENAI_API_KEY
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - SENDGRID_API_KEY
   - FROM_EMAIL
   - APP_BASE_URL
4. Run frontend:
   ```bash
   npm start
   ```

## Test Flow
1. Sign up and log in.
2. In Firestore, set `users/{uid}.subscriptionStatus` to `active`.
3. Create a WhisperWrap with recipient and intent details.
4. Generate AI content, edit fields, optionally upload audio.
5. Confirm and send consent email.
6. Open unwrap link `/unwrap/:token`, accept, and view/play message.
7. Verify status updates in backend/Firestore (`draft`, `generated`, `consent_sent`, `accepted`, `opened`, `listened`, `failed`).

## Notes
- Mobile-first Ionic layout.
- No icon libraries used.
- Validation and error handling included for auth and whisper flows.
