# ONYX Smart Accounting

Arabic-first local accounting application. The current repository contains the initial Smart Accountant web/Electron application and a GitHub Actions pipeline that packages the current app for Windows and Android.

## Build monitoring

Open **Actions** to view the Windows and Android jobs:
https://github.com/mohammed73ed-web/smart-accountant./actions

Artifacts are attached to a successful workflow run:
- ONYX-Windows-Installer
- ONYX-Android-APK

## Local build

Requirements: Node.js 22, Java 21 and Android SDK for Android builds; Windows for the Windows installer.

```bash
npm install
npm start
npm run build
npm run prepare:web
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

## Important implementation status

The current application is an initial accounting application, not yet the complete FULL ERP specification. The build workflow proves packaging of the current source only. Accounting modules, SQLite persistence, inventory, sales/purchases, double-entry posting, reports, backup/restore and device-to-device local synchronization must be implemented and tested before declaring the ERP complete.
