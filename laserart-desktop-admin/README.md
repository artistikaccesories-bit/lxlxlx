# LaserArt Admin (Desktop + Android)

This app manages `laserartlb.com` products and live analytics through Firebase.

## 1) Environment Variables

Create `laserart-desktop-admin/.env.local`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=admin@yourdomain.com
```

`VITE_ADMIN_EMAIL` pre-fills the login email field. Password is validated by Firebase Auth.

## 2) Local Development

```bash
npm install
npm run dev
```

Desktop (Electron) dev mode:

```bash
npm run electron:start
```

## 3) Build Windows EXE

```bash
npm run electron:build
```

Artifacts are generated in `laserart-desktop-admin/dist-electron/` (installer and portable executable).

## 4) Build Android APK

First-time Android setup:

```bash
npm run android:add
```

Sync latest web build into native wrapper:

```bash
npm run android:build
```

Create debug APK:

```bash
npm run android:apk:debug
```

Create release APK:

```bash
npm run android:apk:release
```

APK outputs are under:
- `laserart-desktop-admin/android/app/build/outputs/apk/debug/`
- `laserart-desktop-admin/android/app/build/outputs/apk/release/`

If you need signing or Play Store metadata, open Android Studio:

```bash
npm run android:open
```

## 5) Firebase Security Rules

Deploy updated rules after verifying:

```bash
firebase deploy --only firestore:rules
```

The current rules allow public read for products and public create for visitor/order telemetry, while restricting product/settings writes to authenticated admins.
