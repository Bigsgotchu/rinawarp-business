# Changelog

## Version 0.4.0 - License State Machine (December 20, 2025)

### 🛡️ Major License System Improvements

**Production-Grade License State Machine**

- Implemented deterministic 6-state license management system
- Enhanced offline support with 72-hour grace periods
- Improved abuse prevention with intelligent rate limiting
- Better user experience with clear state messaging

### 🔧 Technical Improvements

**Core Features:**

- **6-State License Model**: UNLICENSED → ACTIVE → GRACE → EXPIRED → INVALID → RATE_LIMITED
- **Offline Tolerance**: 72-hour grace period prevents service interruption
- **Smart Rate Limiting**: 10 attempts/hour with exponential backoff
- **Enhanced UX**: Color-coded status indicators and clear next actions
- **Local Persistence**: 24-hour cache with proper validation

**Architecture Enhancements:**

- **Event-Driven Design**: Clean state transitions with no side effects
- **Single Source of Truth**: Centralized license decision logic
- **Backward Compatibility**: Existing API preserved while adding new features
- **Internal Analytics**: State transition tracking for support debugging

### 🎨 User Experience Improvements

**License Status Display:**

- Real-time status indicator with color-coded states
- Grace period banner with countdown timer
- Activation dialog with input validation
- Comprehensive license information panel

**Responsive Design:**

- Mobile-friendly interface
- Dark theme support
- Clear action paths for each license state

### 🔒 Security & Reliability

**Abuse Prevention:**

- Rate limiting with progressive delays (1min to 30min max)
- Grace period protection for legitimate users
- Internal analytics for monitoring patterns

**Support Improvements:**

- Clear error messaging per state
- Deterministic behavior for easier debugging
- Enhanced observability for support teams

### 📦 Build & Distribution

**Linux Release:**

- AppImage format for universal Linux compatibility
- SHA256 checksums for integrity verification
- Streamlined build process

### 🔮 Next Steps

- Windows/macOS builds (coming soon)
- Enhanced analytics dashboard
- Enterprise license features

---

## Version 0.3.x (Previous Releases)

_Previous changelog entries..._
