# SOCIALGRAPH CHANGELOG

All notable changes to the SocialGraph platform are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.0.0-rc1] - 2026-10-14

### Added
- **Single-Account Multi-Space Engine**: Full multi-space context switching without re-logging; backend user identity remains strictly private.
- **MyID Innovation Engine**: Structured idea canvas with problem statements, proposed solutions, technical challenges, and AI prior art synthesis.
- **Multi-Perspective Discourse Engine**: 3-perspective debate clustering (Perspective A/B/C) with cited evidence sources.
- **Short-Form Reels Player**: Vertical technical reel player with sound toggle and interactive comments/reactions.
- **Safe Proximity (Uber H3)**: Mentor/peer matching indexed into ~5 km fuzzy hexagonal cells with double-blind consent handshake.
- **Sandboxed In-App Messaging**: Ephemeral direct space-to-space chat sandbox.
- **Full-Text & Tag Search**: Explore page for spaces, posts, and innovation ideas.
- **Web Platform Live Servers**: Production server running on `http://localhost:4000` and Vite dev server on `http://localhost:5173`.
- **Android APK Build**: Native Android Gradle build configured with Android Studio JBR and compiled to `client/android/app/build/outputs/apk/debug/app-debug.apk`.

### Initializing (Phase 0) - 2026-10-14
- Initialized local Git repository at `socialgraph`.
- Verified system build environment: Node.js v26.2.0, npm 11.13.0, OpenJDK, Android SDK (Platforms 34, 35; Build-tools 34/35), ADB v1.0.41.
- Initialized project tracking suite:
  - `SOCIALGRAPH_BUILD_TRACKER.md`
  - `SOCIALGRAPH_CHANGELOG.md`
  - `SOCIALGRAPH_KNOWN_ISSUES.md`
  - `SOCIALGRAPH_ARCHITECTURE_DECISIONS.md`
  - `SOCIALGRAPH_TEST_REPORT.md`
  - `SOCIALGRAPH_RELEASE_CHECKLIST.md`
- Confirmed architectural source of truth: Single-account multi-space model with MyID innovation canvas, safe proximity matching, and user-curated spaces.
