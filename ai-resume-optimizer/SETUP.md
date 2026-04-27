# AI Resume Optimizer — Setup Guide

A full-stack AI resume analysis platform with Expo mobile, Next.js web, Chrome extension, Firebase backend, OpenAI-powered analysis, Stripe subscriptions (web), and RevenueCat subscriptions (mobile).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | Required for all packages |
| pnpm | 10+ | Workspace manager (`npm i -g pnpm`) |
| Firebase CLI | latest | `npm i -g firebase-tools` |
| Expo CLI | latest | `npm i -g expo-cli` |
| Git | any | Version control |

---

## 1. Clone and install

```bash
git clone <your-repo-url> ai-resume-optimizer
cd ai-resume-optimizer
pnpm install
```

---

## 2. Environment variables

Copy the root `.env.example` to `.env.local` at the repo root:

```bash
cp .env.example .env.local
```

Fill in every value. Here's what each one does:

### Firebase (web + extension share these)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=          # Firebase project API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=      # yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=       # yourproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=   # yourproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=   # G-XXXXXXXXXX (optional, for analytics)
NEXT_PUBLIC_FUNCTIONS_REGION=us-central1
NEXT_PUBLIC_EXTENSION_IMPORT_URL=      # URL of your deployed web app
NEXT_PUBLIC_STRIPE_PRICE_ID=           # price_xxxxxx from Stripe dashboard
```

### Firebase (mobile)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_FUNCTIONS_REGION=us-central1
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=    # From RevenueCat dashboard
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=
EXPO_PUBLIC_EXTENSION_IMPORT_URL=
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=     # OAuth client IDs for Google sign-in
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

---

## 3. Firebase setup

### 3a. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (disable Google Analytics if not needed)
3. Enable **Firestore Database** (production mode)
4. Enable **Storage** (production mode)
5. Enable **Authentication** → Sign-in methods:
   - Email/Password ✓
   - Google ✓

### 3b. Deploy Firestore rules, indexes, and Storage rules

```bash
cd firebase
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 3c. Set Cloud Function secrets

These never go in `.env` — they're stored securely in Google Cloud Secret Manager:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set WEB_APP_URL   # https://your-deployed-web-app.com
```

### 3d. Build and deploy functions

```bash
cd firebase/functions
pnpm install
pnpm build
cd ..
firebase deploy --only functions
```

After deployment, note your function base URL:
`https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net`

---

## 4. OpenAI setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key with enough credits
3. Store it: `firebase functions:secrets:set OPENAI_API_KEY`
4. The model used is `gpt-4.1` — change in `firebase/functions/src/openai.ts` if needed

---

## 5. Stripe setup (web subscriptions)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create a **Product** called "AI Resume Optimizer Pro"
3. Add a **recurring monthly Price** (e.g. $9.99/month)
4. Copy the price ID (`price_xxxxx`) → set as `NEXT_PUBLIC_STRIPE_PRICE_ID`
5. Set the Stripe secret: `firebase functions:secrets:set STRIPE_SECRET_KEY`
6. Set up webhook:
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://us-central1-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret → `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`

---

## 6. RevenueCat setup (mobile subscriptions)

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Create a new project
3. Add iOS app (bundle ID from `apps/mobile/app.json`) and Android app (package name)
4. Add your App Store / Google Play products
5. Create an **Entitlement** called `pro`
6. Create an **Offering** and attach the product package
7. Copy public SDK keys:
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
8. Set up webhook:
   - Integrations → Webhooks → Add webhook
   - URL: `https://us-central1-YOUR_PROJECT.cloudfunctions.net/revenueCatWebhook`

---

## 7. Run the web app locally

```bash
# From repo root
pnpm dev:web
# → http://localhost:3000
```

The web app needs `.env.local` populated at the repo root.

---

## 8. Run the mobile app locally

```bash
# From repo root
pnpm dev:mobile
# → Opens Expo Dev Tools, scan QR with Expo Go

# For native builds (required for RevenueCat + Firebase Analytics):
cd apps/mobile
npx expo prebuild      # generates ios/ and android/ folders
npx expo run:ios       # requires Xcode on macOS
npx expo run:android   # requires Android Studio
```

**Note:** `@react-native-firebase/analytics` and `react-native-purchases` are native modules — they require a native build (not Expo Go) to function fully.

---

## 9. Build and load the Chrome extension

```bash
# From repo root
pnpm dev:extension     # watch mode
# or
cd apps/extension && pnpm build
```

Then load in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Select the `apps/extension/dist` folder
5. The extension icon appears in the Chrome toolbar

Test on LinkedIn, Indeed, Greenhouse, Lever, or any job posting page.

---

## 10. Deploy the web app

### Option A: Vercel (recommended)

```bash
npm i -g vercel
cd apps/web
vercel --prod
```

Add all `NEXT_PUBLIC_*` env variables in the Vercel dashboard under Project → Settings → Environment Variables.

### Option B: Firebase Hosting

```bash
cd apps/web
pnpm build
# Output is in apps/web/out (static export) or use Next.js server

cd ../../firebase
firebase deploy --only hosting
```

After deployment, add your domain to:
- Firebase Console → Authentication → Authorized domains
- Google Cloud Console → OAuth consent screen → Authorized redirect URIs
- Set `WEB_APP_URL` Firebase secret to your domain

---

## 11. Deploy the mobile apps

### iOS (App Store)

1. Update `bundleIdentifier` in `apps/mobile/app.json`
2. Configure App Store Connect: create app, add capabilities
3. Add native Firebase config: download `GoogleService-Info.plist` from Firebase Console → Project Settings → iOS app → place in `apps/mobile/ios/`
4. Build: `cd apps/mobile && npx expo run:ios --configuration Release`
5. Or use EAS: `npx eas build --platform ios`

### Android (Google Play)

1. Update `package` in `apps/mobile/app.json`
2. Add `google-services.json` from Firebase Console → Android app → place in `apps/mobile/android/app/`
3. Build: `cd apps/mobile && npx expo run:android --variant release`
4. Or use EAS: `npx eas build --platform android`

---

## 12. Deploy the Chrome extension

1. Build: `cd apps/extension && pnpm build`
2. Zip the `dist/` folder: `zip -r extension.zip dist/`
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Click **Add new item** → upload `extension.zip`
5. Fill in store listing, screenshots, privacy policy
6. Submit for review

---

## Development scripts reference

```bash
pnpm dev:web          # Start Next.js dev server
pnpm dev:mobile       # Start Expo dev server
pnpm dev:extension    # Build extension in watch mode
pnpm build            # Build all packages
pnpm typecheck        # TypeScript check all packages
pnpm lint             # Lint all packages
```

---

## Architecture overview

```
Monorepo (pnpm workspaces)
├── apps/web          → Next.js App Router (landing, auth, dashboard, results)
├── apps/mobile       → Expo React Native (iOS + Android)
├── apps/extension    → Manifest V3 Chrome extension
├── firebase/
│   ├── functions/    → Cloud Functions (analyze, Stripe, RevenueCat, import)
│   ├── firestore.rules
│   ├── storage.rules
│   └── firestore.indexes.json
└── packages/
    └── shared/       → Zod schemas, types, prompts, constants (shared by all)
```

**Data flow:**
1. User uploads PDF → Firebase Storage
2. Client calls `analyzeResume` Cloud Function with Bearer token
3. Function downloads PDF, parses text, sends to OpenAI, validates with Zod
4. Result stored in Firestore `scanResults` collection
5. Client reads result and renders UI
6. Subscription state maintained by Stripe/RevenueCat webhooks → Firestore

---

## Security checklist

- [x] OpenAI + Stripe keys stored in Google Cloud Secret Manager (never in env files)
- [x] All Cloud Functions validate Firebase Auth JWT tokens
- [x] Firestore rules enforce ownership on all user data
- [x] Storage rules restrict resume access to the uploading user
- [x] Stripe webhook signature verified before processing
- [x] Subscription entitlements enforced server-side (never trust client plan state)
- [x] Extension writes go through authenticated backend endpoint only
- [x] No API keys exposed in client bundles

---

## Troubleshooting

**"Missing required env variable" error on web**
→ Make sure `.env.local` is at the repo root and all `NEXT_PUBLIC_*` values are filled.

**Firebase functions fail to deploy**
→ Run `firebase functions:secrets:access OPENAI_API_KEY` to verify secrets are set.

**Extension fails to extract job description**
→ Some pages have strict CSP. Try the manual textarea fallback in the extension popup.

**RevenueCat purchase not updating subscription**
→ Verify the webhook URL is correctly set and the `app_user_id` matches Firebase `uid`.

**PDF parse returns empty text**
→ The resume may be image-based (scanned). Encourage users to upload text-selectable PDFs.
