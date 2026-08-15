import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync('src/app/pages/sms-consent-request.page.ts', 'utf8');
const service = readFileSync('src/app/services/whisper.service.ts', 'utf8');
const models = readFileSync('src/app/services/models.ts', 'utf8');
const routes = readFileSync('src/app/app.routes.ts', 'utf8');
const interceptor = readFileSync('src/app/services/auth.interceptor.ts', 'utf8');
const netlify = readFileSync('netlify.toml', 'utf8');
const allAppSource = [page, service, models, routes,
  readFileSync('src/app/pages/whisper-sent.page.ts', 'utf8')].join('\n');

test('consent page loads the lookup from its route token', () => {
  assert.match(page, /paramMap\.get\('token'\)/);
  assert.match(page, /getSmsConsent\(this\.token\)/);
});

test('invalid and expired tokens render the safe invitation error', () => {
  assert.match(page, /invalid or has expired\. Please ask the sender for a new Whisper invitation/);
  assert.match(service, /invalid_or_expired_consent_link/);
  assert.match(service, /expired_consent_link/);
});

test('SMS starts unchecked and is not a required control', () => {
  assert.match(page, /smsConsent: false/);
  assert.doesNotMatch(page, /smsConsent[^\n]+requiredTrue/);
  assert.match(page, /SMS consent is optional and is not required to receive or view a Whisper/);
});

test('both declined and granted values are submitted unchanged', () => {
  assert.match(models, /smsConsent: boolean/);
  assert.match(page, /submitSmsConsent\(this\.token, \{ phoneNumber, smsConsent \}\)/);
  assert.match(page, /You declined SMS notifications/);
});

test('phone validation permits blank declines and requires a usable phone for opt-in', () => {
  assert.match(page, /Validators\.pattern\(\/\^\\s\*\(\?:\\\+\?\[\\d\\s\(\)\.\-\]\{7,25\}\)\?\\s\*\$\/\)/);
  assert.match(page, /smsConsent && !phoneNumber/);
  assert.match(page, /this\.form\.controls\.phoneNumber\.invalid/);
});

test('loading, submitting, and already-consented states are represented', () => {
  assert.match(page, /state === 'loading' \|\| state === 'submitting'/);
  assert.match(page, /if \(this\.submitting \|\| this\.state !== 'ready'\) return/);
  assert.match(page, /Your SMS preference has already been recorded/);
});

test('public APIs URL-encode tokens and do not request auth headers', () => {
  const publicMethods = service.slice(service.indexOf('getSmsConsent('), service.indexOf('getUnwrap('));
  assert.match(publicMethods, /encodeURIComponent\(token\)/);
  assert.doesNotMatch(publicMethods, /withAuthHeaders/);
  assert.doesNotMatch(publicMethods, /headers/);
});

test('auth interceptor bypasses the public recipient endpoint', () => {
  assert.match(interceptor, /\/api\/whispers\/sms-consent\//);
  assert.match(interceptor, /isPublicRecipientRequest[^]*return next\(req\)/);
});

test('sender invitation remains authenticated', () => {
  const method = service.slice(service.indexOf('sendConsent('), service.indexOf('getSmsConsent('));
  assert.match(method, /withAuthHeaders\(true\)/);
  assert.match(method, /\{ headers \}/);
});

test('legal links and optional disclosure remain visible', () => {
  assert.match(page, /routerLink="\/privacy"/);
  assert.match(page, /routerLink="\/terms"/);
  assert.match(page, /ion-checkbox formControlName="smsConsent"/);
});

test('legacy keyword opt-in wording is absent', () => {
  for (const legacy of ['Reply YES', 'YES to consent', 'text consent', 'SMS consent request',
    'send SMS consent', 'opt-in keyword', 'reply YES to receive']) {
    assert.equal(allAppSource.toLowerCase().includes(legacy.toLowerCase()), false, legacy);
  }
});

test('draft persistence does not grant SMS consent', () => {
  const persistence = service.slice(service.indexOf('saveDraftToFirestore('), service.indexOf('uploadAudio('));
  assert.doesNotMatch(persistence, /smsConsent|consent.*granted/i);
});

test('direct public route and Netlify fallback are configured', () => {
  const route = routes.slice(routes.indexOf("path: 'sms-consent/:token'"), routes.indexOf("path: 'help'"));
  assert.match(route, /loadComponent/);
  assert.doesNotMatch(route, /canActivate|authGuard|subscriberGuard/);
  assert.match(netlify, /from = "\/\*"[\s\S]*to = "\/index\.html"[\s\S]*status = 200/);
});

test('both consent routes precede the wildcard route', () => {
  assert.ok(routes.indexOf("path: 'sms-consent'") < routes.indexOf("path: '**'"));
  assert.ok(routes.indexOf("path: 'sms-consent/:token'") < routes.indexOf("path: '**'"));
});

test('lookup states and continuation response contracts are handled', () => {
  assert.match(page, /if \(!this\.consent\.valid\)/);
  assert.match(page, /else if \(this\.consent\.alreadyConsented\)/);
  assert.match(page, /this\.state = 'ready'/);
  assert.match(page, /response\.unwrapUrl \?\? \(response\.unwrapToken/);
  assert.match(page, /encodeURIComponent\(response\.unwrapToken\)/);
  assert.match(models, /unwrapUrl\?: string/);
});

test('public error mapping preserves backend consent error distinctions', () => {
  for (const code of [
    'invalid_or_expired_consent_link',
    'recipient_phone_mismatch',
    'sms_recipient_suppressed',
    'sms_consent_required',
    'invalid_request',
  ]) {
    assert.match(service, new RegExp(`${code}:`));
  }
});
