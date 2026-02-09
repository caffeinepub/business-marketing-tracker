# Specification

## Summary
**Goal:** Enable fully anonymous access for core app workflows (including Hook Template Library) and add a persisted “Lead Contact Info” field to outreach entries.

**Planned changes:**
- Remove backend authorization barriers so anonymous callers can create/read/update/delete outreach entries and read/write group notes without “Unauthorized” traps.
- Keep existing user-profile authorization rules unchanged (do not broaden access to profile methods).
- Add a new `leadContactInfo` text field to the backend outreach entry record, including upgrade compatibility for previously stored entries (default to empty text).
- Update frontend Add/Edit Entry flow to capture, save, and pre-fill “Lead Contact Info”, and display the saved value somewhere in the entry UI.
- Adjust hook-template backend methods used by the Hook Template Library to work in anonymous mode (load defaults and save exactly 3 templates).

**User-visible outcome:** Users can use the app without signing in (including creating entries, managing notes, and using the Hook Template Library), and each outreach entry can store and display “Lead Contact Info”.
