# SOCIALGRAPH RELEASE CHECKLIST & DELIVERABLE VERIFICATION

**Release Target**: Android APK (`app-debug.apk`) & Full-Stack Platform  
**Package ID**: `com.socialgraph.app`  

---

## 1. Architectural & Functional Checklist

- [ ] **Single Account, Multiple Spaces**: Multiple spaces with independent handles, bios, avatars, and visibility under 1 user account.
- [ ] **Space Isolation**: Switching spaces without relogging; private space associations never leaked publicly.
- [ ] **Contextual Feeds**: Per-space topic filtering and content type restrictions.
- [ ] **MyID Engine**: Structured canvas (Problem, Solution, Prior Art, Feasibility, Challenges) + AI prior art synthesis.
- [ ] **Discourse & Perspectives**: Multi-perspective debate clustering (Perspective A/B/C).
- [ ] **Safe Proximity**: Uber H3-indexed discovery with double-blind consent handshake.
- [ ] **Reels & Media**: Vertical reel feed with playback, sound toggle, likes, and comment sheet.
- [ ] **In-App Messaging**: Ephemeral & direct messaging sandboxed per space.
- [ ] **Content Moderation & Privacy**: Block, mute, report triage, and server-side authorization.

---

## 2. Android Build & Package Checklist

- [ ] `android/` Gradle project configured.
- [ ] App ID verified: `com.socialgraph.app`.
- [ ] Permissions declared: `INTERNET`, `READ_EXTERNAL_STORAGE`, `CAMERA`.
- [ ] OpenJDK 17 configured for Gradle wrapper.
- [ ] Android SDK Platforms 34/35 linked.
- [ ] Debug APK compiled: `android/app/build/outputs/apk/debug/app-debug.apk`.
- [ ] APK verified: exists, nonempty, valid ZIP/package structure.
- [ ] Release documentation: instructions for installation via `adb install` or device side-loading.
