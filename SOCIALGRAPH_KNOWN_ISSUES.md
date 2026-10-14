# SOCIALGRAPH KNOWN ISSUES & LIMITATIONS

**Status as of**: 2026-10-14  
**Project**: SocialGraph  

This document tracks all known issues, limitations, hardware constraints, and pending upstream configurations.

---

## Active Known Issues

| Issue ID | Severity | Category | Description | Workaround / Mitigation | Target Resolution |
|:---|:---:|:---|:---|:---|:---:|
| **ISSUE-001** | Low | Environment | Windows PowerShell restricts `.ps1` script execution (`npm.ps1`). | Use `npm.cmd` and `npx.cmd` explicitly in CLI invocations. | Permanent |
| **ISSUE-002** | Medium | Deployment | No physical Android device or active emulator daemon currently connected. | Build and verify APK via Gradle CLI and `aapt`/`apksigner`/`adb` tool verification. | Phase 15 |

---

## External Service Requirements

1. **Production Video Transcoding**: Cloudflare Stream / AWS MediaConvert for production HLS transcoding. The local environment will handle standard MP4/WebM uploads with client-side preview and standard HTML5 playback.
2. **Govt Bhashini API**: External API key required for production multilingual translation; fallback includes local multilingual dictionary and Google Translate API compatibility layer.
