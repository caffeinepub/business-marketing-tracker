# Specification

## Summary
**Goal:** Make Dashboard and Hook Template Library usable without sign-in, fix Live “canister stopped/unavailable” handling, and deploy the current draft to Live.

**Planned changes:**
- Update backend authorization so anonymous callers can use all Dashboard and Hook Template Library methods without trapping “Unauthorized,” while keeping existing authenticated/admin behavior working.
- Ensure the frontend does not place a sign-in wall in front of Dashboard or Hook Template Library in anonymous sessions, while preserving the sticky Dashboard header with the “Add Entry” button and keeping Craft Category + Image Upload in the Entry form.
- Improve Live availability handling: ensure the backend canister is running/restarted and use the existing backend health check to show “Backend Service Unavailable” only when stopped/unreachable, with a working Retry action.
- Deploy the updated draft to Live and run a quick smoke test covering anonymous access, sticky header/Add Entry, and Craft Category + Image Upload in the Entry form.

**User-visible outcome:** In Live, users can open and use the Dashboard and Hook Template Library without signing in; if the backend is actually unreachable they see a clear “Backend Service Unavailable” state with Retry; and the Dashboard retains the sticky “Add Entry” header plus the Entry form’s Craft Category dropdown and Image Upload field.
