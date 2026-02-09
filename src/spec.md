# Specification

## Summary
**Goal:** Show entry image attachments as thumbnails in the Dashboard Recent Posts list and allow mobile users to capture photos from their device camera when uploading an entry image.

**Planned changes:**
- Add a thumbnail area/column to the Dashboard “Recent Posts” table that renders a small, consistent-size thumbnail when an entry has an image attachment, using the attachment’s existing direct URL.
- Display a clear empty state in the thumbnail spot for entries without an image attachment, without breaking the table layout.
- Update the Add/Edit Entry form’s Image Upload control to support camera capture on supported mobile browsers (in addition to selecting an image from the device library), keeping existing preview/clear/replace behaviors and English-only text.

**User-visible outcome:** Users can quickly identify recent posts by a small image thumbnail in the Recent Posts list, and on mobile they can either upload an image or take a new photo with their camera for an entry.
