# Live Smoke Test Checklist

This document outlines the critical smoke tests to run in the Live environment to verify the application is working correctly for anonymous users (no Internet Identity login required).

## Pre-Test: Backend Health Check

Before running any other tests, verify the backend canister is running:

1. **Backend Health Endpoint**
   - [ ] Open the Live application in an incognito/private browser window
   - [ ] Open browser DevTools Console
   - [ ] Verify no "Backend Service Unavailable" error appears on the Dashboard
   - [ ] If error appears, click "Retry" button and wait for backend to start
   - [ ] Confirm the error clears and dashboard loads successfully

## Anonymous Dashboard Access

Test that the Dashboard loads and displays data without requiring login:

1. **Dashboard Page Load**
   - [ ] Open the Live application in an incognito/private browser window (no login)
   - [ ] Verify the Dashboard page loads without any "Unauthorized" errors
   - [ ] Confirm the sticky header displays "Marketing Tracker" title
   - [ ] Verify "Add Entry" button is visible and clickable in the header

2. **Dashboard Data Display**
   - [ ] Confirm "Follow-up Reminders" section loads (or shows empty state)
   - [ ] Verify "Winning Posts" section loads (or shows empty state)
   - [ ] Confirm "Days Since Last Post" section loads (or shows empty state)
   - [ ] Verify "Success Rate Chart" section loads (or shows empty state)
   - [ ] Confirm "Recent Posts" table loads (or shows empty state)

## Anonymous Entry Creation

Test that anonymous users can create new outreach entries:

1. **Open Entry Form**
   - [ ] Click the "Add Entry" button in the sticky header
   - [ ] Verify the "Add New Entry" dialog opens without errors

2. **Form Field Validation**
   - [ ] Confirm "Craft Category" dropdown is present with placeholder text
   - [ ] Verify dropdown contains options: "Splatter Room", "Candle Making", "Soap Making"
   - [ ] Confirm "Type of Interest" dropdown is present with placeholder text
   - [ ] Verify dropdown contains options: "Price", "Availability", "Group Booking"
   - [ ] Confirm "Image Attachment" field is present with file picker

3. **Create Entry**
   - [ ] Fill in all required fields:
     - Group/Page Name: "Test Group"
     - Group URL: "https://facebook.com/groups/test"
     - Craft Category: Select "Splatter Room"
     - Type of Interest: Select "Price"
     - Date Posted: Select today's date
     - Post Content: "Test post content"
     - Number of Reactions: 0
     - Number of Comments: 0
     - Response Status: "No Response"
     - Follow-up Date: Select today's date
   - [ ] Click "Create Entry" button
   - [ ] Verify success toast appears: "Entry created successfully"
   - [ ] Confirm dialog closes automatically
   - [ ] Verify new entry appears in the "Recent Posts" table

4. **Entry Display**
   - [ ] Confirm the new entry shows correct Group Name
   - [ ] Verify the entry displays correct Craft Category badge
   - [ ] Confirm the entry shows correct Response Status badge with proper color
   - [ ] Verify action menu (three dots) is present for the entry

## Anonymous Entry Viewing

Test that anonymous users can view existing entries:

1. **View Entry Details**
   - [ ] Click the action menu (three dots) on any entry in the table
   - [ ] Select "Edit" from the dropdown
   - [ ] Verify the "Edit Entry" dialog opens without "Unauthorized" errors
   - [ ] Confirm all entry fields are populated correctly
   - [ ] Verify "Craft Category" dropdown shows the correct selection
   - [ ] Confirm "Type of Interest" dropdown shows the correct selection
   - [ ] Click "Cancel" to close the dialog

## Hook Template Library (Authenticated Only)

The Hook Template Library requires Internet Identity login and should not be tested in anonymous mode.

## Navigation

1. **Header Navigation**
   - [ ] Verify the sticky header remains visible when scrolling down the page
   - [ ] Confirm "Dashboard" and "Hook Library" navigation buttons are present
   - [ ] Click "Dashboard" button and verify it stays on Dashboard page
   - [ ] Click "Hook Library" button and verify it navigates to Hook Library page

## Footer

1. **Footer Display**
   - [ ] Scroll to the bottom of the page
   - [ ] Verify footer displays: "© 2026. Built with love using caffeine.ai"
   - [ ] Confirm "caffeine.ai" is a clickable link
   - [ ] Verify "Smoke Test" link is present with tooltip

## Error Handling

1. **Stopped Canister Recovery**
   - [ ] If "Backend Service Unavailable" error appears, click "Retry"
   - [ ] Verify the health check runs again
   - [ ] Confirm data loads successfully after backend starts
   - [ ] Verify no "Unauthorized" errors appear during recovery

## Summary

All tests should pass without requiring Internet Identity login for Dashboard and Entry operations. The application should work seamlessly for anonymous users creating and viewing outreach entries.
