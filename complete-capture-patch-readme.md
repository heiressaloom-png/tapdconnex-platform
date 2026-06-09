TAPDconnex Complete Capture Patch
Files in this patch:
`tapd-intelligence-framework.js`  
Adds browser constants for Signal → Required Fields, field fillability, provenance, and the 5-minute Complete Capture window.
`completeness.js`  
Adds `computeCompleteness()` and `extractCapturedFields()`.
`capture-window.js`  
Adds static-browser orchestration for Complete Capture, segment storage, provenance tagging, and the provenance-weight helper.
`capture-updated-complete-capture.html`  
Existing Capture screen with a Pro-only Complete Capture panel added to the review screen.
Recommended GitHub placement:
Add `tapd-intelligence-framework.js`, `completeness.js`, and `capture-window.js` at the same level as `capture.html`.
Replace current `capture.html` with `capture-updated-complete-capture.html` after renaming it to `capture.html`.
Important product decisions locked:
Feature name: Complete Capture, not recapture.
Metric name: Engagement Completeness.
Completeness is separate from signalScore, confidence, and momentum.
Starter does not get the completeness block or 5-minute window.
Pro gets Complete Capture when there are self-fillable gaps.
User-supplied details can complete tasks but cannot inflate intelligence about the contact.
