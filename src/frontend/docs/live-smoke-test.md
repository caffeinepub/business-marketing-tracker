# Live Environment Smoke Test

This checklist verifies that the Live deployment is working correctly with anonymous access and all key features.

## Pre-Test Setup
- [ ] Ensure backend canister is running in Live environment
- [ ] Open Live URL in an incognito/private browser window (to test anonymous access)
- [ ] Do NOT sign in with Internet Identity

## Backend Health Check
- [ ] Backend responds to health check (no "Backend Service Unavailable" error)
- [ ] Dashboard loads without errors
- [ ] Hook Template Library loads without errors

## Dashboard - Anonymous Access
- [ ] Dashboard page renders main content (no sign-in gate)
- [ ] Dashboard header is sticky when scrolling on mobile
- [ ] "Add Entry" button is visible and clickable in header
- [ ] Follow-up reminders card displays (or shows empty state)
- [ ] Winning posts card displays (or shows empty state)
- [ ] Days since last post card displays (or shows empty state)
- [ ] Success rate chart displays (or shows empty state)
- [ ] Recent posts table displays (or shows empty state)

## Add Entry Form - Anonymous Access
- [ ] Click "Add Entry" button opens the form dialog
- [ ] Form includes "Craft Category" dropdown with options (Splatter Room, Candle Making, Soap Making)
- [ ] Form includes "Type of Interest" dropdown with options (Price, Availability, Group Booking)
- [ ] Form includes "Image Upload" field with file picker
- [ ] Fill out all required fields including Craft Category and Type of Interest
- [ ] Select an image file (optional)
- [ ] Submit form successfully creates an entry
- [ ] New entry appears in the Recent Posts table

## Hook Template Library - Anonymous Access
- [ ] Navigate to Hook Library using header navigation
- [ ] Hook Library page renders main content (no sign-in gate)
- [ ] Three hook template cards are visible
- [ ] Can edit hook titles and content
- [ ] "Save Templates" button is visible and enabled
- [ ] Save templates successfully
- [ ] "Copy to Clipboard" button works for non-empty hooks

## Error Handling
- [ ] If backend is stopped, "Backend Service Unavailable" error displays
- [ ] "Retry" button in error message works correctly
- [ ] After retry with running backend, data loads successfully

## Mobile Responsiveness
- [ ] Test on mobile viewport (or use browser dev tools)
- [ ] Dashboard header remains sticky on scroll
- [ ] "Add Entry" button is accessible and not cut off
- [ ] Navigation buttons work correctly
- [ ] Forms are usable on mobile

## Final Verification
- [ ] No console errors in browser dev tools
- [ ] All interactive elements are clickable (not blocked by overlays)
- [ ] Application works smoothly without requiring sign-in
- [ ] Craft Category and Image Upload fields are present and functional

---

**Test Date:** _____________  
**Tester:** _____________  
**Result:** ☐ Pass  ☐ Fail  
**Notes:** _____________________________________________
