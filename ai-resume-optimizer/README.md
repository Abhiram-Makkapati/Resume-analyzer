# AI Resume Optimizer

Bright, premium resume analysis across Expo mobile, Next.js web, Firebase backend, OpenAI-powered analysis, and a Manifest V3 Chrome extension.

## PHASE 1 - PRODUCT PLAN

### Product summary

AI Resume Optimizer helps a user upload a resume PDF, paste or import a job description, and receive a structured AI review with:

- ATS score out of 100
- matched and missing keywords
- section-by-section feedback
- bullet rewrite suggestions
- ATS checklist
- tailored summary recommendation
- improved resume suggestions
- scan history and subscription-aware gating

### Primary user flow

1. User signs in with email/password or Google.
2. User uploads a PDF resume to Firebase Storage.
3. User pastes a job description or imports one from the Chrome extension.
4. The client calls the protected Firebase analysis endpoint.
5. Firebase downloads the PDF, parses it, sends resume text plus job description to OpenAI, validates the structured result, stores the scan, and returns the analysis.
6. Web and mobile render the result with free/pro gating.
7. Subscription state updates through Stripe webhooks or RevenueCat webhooks.
8. Firebase Analytics events record key user actions.

### Architecture

- `apps/web`: Next.js App Router app for landing page, auth, dashboard, history, pricing, and result views.
- `apps/mobile`: Expo React Native app with polished onboarding/auth, dashboard, history, paywall, profile, and result screens.
- `apps/extension`: Manifest V3 Chrome extension that extracts job descriptions from live pages and sends them to Firebase through a secure backend flow.
- `firebase/functions`: Firebase Cloud Functions for OpenAI analysis, Stripe checkout, Stripe webhook, RevenueCat webhook, and extension import ingestion.
- `packages/shared`: shared TypeScript schemas, prompt builders, plan constants, analytics event names, and helper utilities.

### Firestore schema

`users/{uid}`
- `uid`
- `email`
- `displayName`
- `photoURL`
- `defaultResumeId`
- `plan`
- `createdAt`
- `updatedAt`

`resumes/{resumeId}`
- `id`
- `userId`
- `fileName`
- `storagePath`
- `contentType`
- `createdAt`
- `updatedAt`

`scans/{scanId}`
- `id`
- `userId`
- `resumeId`
- `jobDescription`
- `importedJobId`
- `status`
- `plan`
- `atsScore`
- `resultId`
- `createdAt`
- `updatedAt`

`scanResults/{scanId}`
- `id`
- `userId`
- `scanId`
- `resumeId`
- analysis payload fields from the shared Zod schema
- `createdAt`
- `updatedAt`

`subscriptions/{uid}`
- `userId`
- `plan`
- `provider`
- `status`
- `currentPeriodEnd`
- `entitlementId`
- `updatedAt`

`importedJobs/{importedJobId}`
- `id`
- `userId`
- `title`
- `company`
- `sourceUrl`
- `description`
- `createdAt`

`analyticsSnapshots/{uid_date}`
- `userId`
- `metrics.matchRate`
- `metrics.formattingScore`
- `metrics.impactScore`
- `updatedAt`

### API and backend flow

- `POST /analyzeResume`
  - validates Firebase Auth token
  - checks free plan daily limit
  - fetches resume metadata from Firestore
  - downloads PDF from Storage
  - parses text with `pdf-parse`
  - sends structured request to OpenAI
  - validates JSON against shared Zod schema
  - stores scan result and analytics snapshot

- `POST /importJobDescription`
  - validates Firebase Auth token
  - stores imported job description from the extension

- `POST /createStripeCheckoutSession`
  - validates Firebase Auth token
  - creates a Stripe Checkout subscription session

- `POST /stripeWebhook`
  - updates Firestore subscription state from Stripe

- `POST /revenueCatWebhook`
  - updates Firestore subscription state from RevenueCat

### Subscription logic

- Free plan
  - 2 scans per day
  - ATS score, keyword analysis, history, basic previews

- Pro plan
  - unlimited scans
  - full bullet rewrite pack
  - exports
  - richer analytics over time

- Enforcement
  - backend enforces the free daily scan limit by counting same-day scans
  - UI reads subscription state from Firestore for gating and paywall messaging
  - web upgrades use Stripe checkout
  - mobile upgrades use RevenueCat
  - Stripe and RevenueCat webhooks write the canonical plan state to Firestore

### Analytics plan

Implemented event names live in `packages/shared/src/constants.ts`.

- `resume_uploaded`
- `job_description_imported`
- `scan_completed`
- `ats_score_viewed`
- `rewrite_applied`
- `export_clicked`
- `paywall_viewed`
- `subscription_started`

Web uses Firebase Analytics. Mobile uses `@react-native-firebase/analytics`.

## PHASE 2 - PROJECT STRUCTURE

```text
.
|-- .env.example
|-- README.md
|-- package.json
|-- pnpm-workspace.yaml
|-- tsconfig.base.json
|-- apps
|   |-- web
|   |   |-- app
|   |   |   |-- (dashboard)
|   |   |   |   |-- dashboard
|   |   |   |   |   |-- [scanId]
|   |   |   |   |   `-- page.tsx
|   |   |   |   |-- history
|   |   |   |   |-- pricing
|   |   |   |   |-- profile
|   |   |   |   `-- layout.tsx
|   |   |   |-- (marketing)
|   |   |   |   `-- page.tsx
|   |   |   |-- auth
|   |   |   |   `-- page.tsx
|   |   |   |-- globals.css
|   |   |   `-- layout.tsx
|   |   |-- components
|   |   |-- lib
|   |   |-- next.config.ts
|   |   `-- package.json
|   |-- mobile
|   |   |-- app
|   |   |   |-- (tabs)
|   |   |   |   |-- _layout.tsx
|   |   |   |   |-- history.tsx
|   |   |   |   |-- index.tsx
|   |   |   |   |-- pricing.tsx
|   |   |   |   `-- profile.tsx
|   |   |   |-- results
|   |   |   |   `-- [scanId].tsx
|   |   |   |-- _layout.tsx
|   |   |   |-- auth.tsx
|   |   |   `-- index.tsx
|   |   |-- src
|   |   |   |-- components
|   |   |   |-- lib
|   |   |   |-- providers
|   |   |   `-- theme
|   |   `-- package.json
|   `-- extension
|       |-- public
|       |   |-- manifest.json
|       |   |-- popup.html
|       |   `-- styles.css
|       |-- scripts
|       |   `-- build.mjs
|       |-- src
|       |   |-- lib
|       |   |   `-- firebase.ts
|       |   |-- background.ts
|       |   |-- content.ts
|       |   `-- popup.ts
|       `-- package.json
|-- firebase
|   |-- firebase.json
|   |-- firestore.indexes.json
|   |-- firestore.rules
|   |-- storage.rules
|   `-- functions
|       |-- src
|       |   |-- admin.ts
|       |   |-- http.ts
|       |   |-- index.ts
|       |   |-- openai.ts
|       |   `-- pdf.ts
|       `-- package.json
`-- packages
    `-- shared
        |-- package.json
        `-- src
            |-- constants.ts
            |-- index.ts
            |-- prompts.ts
            |-- schema.ts
            `-- utils.ts
```

## PHASE 3 - IMPLEMENTATION

The implementation is already written into the repo. Start from these key files:

- Shared contracts and prompts: `packages/shared/src`
- Firebase backend: `firebase/functions/src`
- Web app shell and results UI: `apps/web/app`, `apps/web/components`, `apps/web/lib`
- Mobile app shell and polished cards: `apps/mobile/app`, `apps/mobile/src`
- Chrome extension import flow: `apps/extension/src`

Recommended build order if you want to inspect or extend the code:

1. Shared config and backend
2. Auth providers
3. Resume upload and parsing
4. AI analysis pipeline
5. Results UI
6. Subscriptions
7. Chrome extension
8. Analytics instrumentation
9. UI polish and deployment setup

## PHASE 4 - UI/UX POLISH

Implemented design choices:

- soft off-white backgrounds with layered gradients
- premium glass-like cards with light borders and soft shadows
- bright accent palette using blue, violet, coral, and teal
- rounded corners, large breathing room, and minimal clutter
- subtle motion using Framer Motion on web and Reanimated on mobile
- clear empty/loading/error states
- lightweight premium landing page suitable for recruiter demos

Good next polish passes:

- add skeleton placeholders for scan/result fetches
- add animated progress states during PDF upload and AI processing
- add a richer export flow with formatted DOCX or PDF suggestions
- add before/after diff highlighting for rewrite suggestions

## PHASE 5 - SETUP GUIDE

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` at the repo root and fill in:

- Firebase web config values
- Expo public Firebase values
- Expo Google OAuth client IDs
- OpenAI key for Firebase Functions secret
- Stripe price and secret values
- RevenueCat public SDK keys
- public extension dashboard URL

### 3. Firebase setup

1. Create a Firebase project.
2. Enable Email/Password and Google sign-in in Firebase Auth.
3. Create Firestore and Storage.
4. Deploy rules and indexes:

```bash
cd firebase
firebase deploy --only firestore:rules,firestore:indexes,storage
```

5. Set backend secrets:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set WEB_APP_URL
```

6. Deploy functions:

```bash
cd firebase/functions
pnpm build
cd ..
firebase deploy --only functions
```

### 4. OpenAI setup

- Create an OpenAI API key.
- Store it as the Firebase Functions secret `OPENAI_API_KEY`.
- The backend uses structured outputs through the server only, so no API key is exposed to clients.

### 5. Stripe setup

1. Create a product and monthly recurring price in Stripe.
2. Put the public price id into `NEXT_PUBLIC_STRIPE_PRICE_ID`.
3. Configure the webhook endpoint to your deployed Firebase function:
   - `/stripeWebhook`
4. Subscribe to at least:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 6. RevenueCat setup

1. Create the app in RevenueCat for iOS and Android.
2. Add your product / entitlement.
3. Put the public SDK keys into:
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
4. Point RevenueCat webhook to your deployed Firebase `revenueCatWebhook`.
5. Ensure the RevenueCat `app_user_id` matches the Firebase Auth `uid`.

### 7. Run the web app locally

```bash
pnpm dev:web
```

### 8. Run the mobile app locally

```bash
pnpm dev:mobile
```

If you use `@react-native-firebase/*`, run Expo prebuild before native builds:

```bash
cd apps/mobile
npx expo prebuild
```

### 9. Build and load the extension

```bash
cd apps/extension
pnpm build
```

Then:

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click Load unpacked
4. Select `apps/extension/dist`

### 10. Deploy the web app

Recommended options:

- Vercel for the Next.js app
- Firebase Hosting if you want to keep it in one ecosystem

Ensure the deployed web domain is added to:

- Firebase Auth authorized domains
- Google OAuth redirect configuration
- `WEB_APP_URL` Firebase function secret

### 11. Deploy the mobile apps

1. Add iOS and Android bundle identifiers from `apps/mobile/app.json`
2. Configure App Store Connect and Google Play Console
3. Add native Firebase config files if you use native Firebase analytics
4. Build through EAS or Expo native builds

### 12. Deploy the extension

1. Zip the `apps/extension/dist` directory
2. Create a Chrome Web Store listing
3. Provide privacy policy and data usage disclosures
4. Publish after testing on LinkedIn, Greenhouse, Lever, and Indeed pages

## PHASE 6 - FINAL QA

### Bugs and flows to test

- resume upload for multiple PDFs and large files
- malformed or image-only PDFs
- free plan limit crossing midnight
- extension extraction on pages with unusual DOM structures
- Google sign-in on web and Expo redirect edge cases
- Stripe checkout success and cancel return flows
- RevenueCat purchase, restore, and expiration flows
- result rendering when OpenAI returns sparse or partially useful feedback

### Security checklist

- keep all OpenAI and payment secrets in backend-only secrets
- validate Firebase Auth tokens in every protected function
- never trust client subscription state for entitlement checks
- enforce Firestore and Storage ownership rules
- verify Stripe webhook signatures
- keep extension writes on the authenticated backend flow only

### MVP limitations

- PDF parsing is text-first and may underperform on highly visual resumes
- extension extraction is generic rather than site-specific for every job board
- mobile Google auth requires correct OAuth client setup to work smoothly
- export currently downloads JSON on web instead of generating a formatted resume artifact

### Version 2 improvements

- DOCX import and export
- resume diff editor with accept/reject rewrites
- richer analytics trend charts and benchmark comparisons
- recruiter-style scoring rubric by role family
- site-specific extension extractors for LinkedIn, Greenhouse, Lever, and Indeed
- collaborative review links and shareable scan reports
