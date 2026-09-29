# GaadiDue

GaadiDue is an India-focused vehicle and driving-licence expiry reminder prototype built with Expo and React Native. The project targets Android first and keeps the app code cross-platform for a later iOS release.

**Live lookup is not connected.** Entering a registration or DL number saves it locally, but does not fetch vehicle details or expiry dates. No expiry reminder is scheduled for a number without a retrieved date. The **Try a sample** action creates clearly marked, simulated dates for testing.

## Current features

- Save multiple cars, bikes, and driving licences on the device.
- View sample RC, insurance, PUCC, road-tax, and DL validity dates.
- Test local reminders at 30, 14, 7, and 1 day before a sample expiry, plus the expiry date. Schedules are replaced when sample dates change.
- View representative car and bike illustrations. They are not images of the registered vehicles.
- Simulate a renewal to exercise the date update and reminder-rescheduling flow.

## Run locally

Use Node.js and an Android emulator with the Android SDK installed:

```sh
npm ci
npx expo run:android
```

After the native development build is installed, start the JavaScript server with `npx expo start --dev-client` and open the app in the emulator. Local notifications need a native development build; Expo Go is insufficient for this notification test. The generated `android/` and `ios/` folders are ignored by Git.

## Check the project

```sh
npm run typecheck
npm run lint
npm test
```

## Data access

`src/demoProvider.ts` supplies only simulated data. A production provider must be approved, return the needed fields, permit repeat checks after renewals, and support the required consent flow. Actual coverage and freshness remain unverified. See [the data-access feasibility brief](docs/data-access-feasibility.md) for the research and live-test criteria.

The Android package ID and local-storage key still contain `Parivahan` for compatibility with the existing emulator installation. Choose the final release package ID before publishing to an app store.
