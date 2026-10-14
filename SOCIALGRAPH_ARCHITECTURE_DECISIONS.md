# SOCIALGRAPH ARCHITECTURE DECISION RECORDS (ADR)

## ADR-001: Single-Account Multi-Space Domain Model
- **Status**: Approved by User
- **Context**: Users reject the friction of maintaining multiple disjoint logins, but also dislike rigid pre-canned "modes" (e.g. Student Mode, Founder Mode).
- **Decision**: Introduce User-Defined Spaces. A single unified account can create and manage multiple independently customized spaces (e.g. "Hardware Lab", "Study Prep", "Art & Media"). Each space has its own handle, bio, avatar, feed filters, and discovery permissions. Space ownership is strictly private on the backend unless explicitly linked by the user.

## ADR-002: Android Packaging Strategy (Capacitor + Vite + React/TS)
- **Status**: Approved
- **Context**: The user requires a fully functional Android application packaged as an installable APK. Node.js v26.2.0, OpenJDK 17, and Android SDK (v34/35) are installed. Bleeding-edge Node 26 often breaks React Native's C++ NDK compiler bridges on Windows.
- **Decision**: Use Capacitor with Vite + React + TypeScript + Tailwind CSS for the client, paired with a full-stack Node.js backend. Capacitor generates a standard native Android Gradle project in `android/`, allowing `gradlew.bat assembleDebug` to compile directly to an installable `.apk` file.

## ADR-003: Privacy-Preserving Proximity via Uber H3
- **Status**: Approved
- **Context**: Proximity mentor/collaborator matching must never enable stalking or reveal exact addresses.
- **Decision**: Index coordinates into Uber H3 spatial resolution 7 (~5 km hexagonal cells). All inquiries proceed via a double-blind mutual consent handshake before in-app chat is unlocked. Phone numbers are never exposed.

## ADR-004: Dual-Store Persistence Architecture
- **Status**: Approved
- **Context**: SocialGraph requires relational consistency for accounts, spaces, posts, and transactions, combined with vector search for semantic idea prior-art checks and graph traversals.
- **Decision**: Core relational data stored in SQLite/PostgreSQL with rigorous foreign keys and cascades; in-memory vector embedding index for idea similarity and semantic research retrieval.
