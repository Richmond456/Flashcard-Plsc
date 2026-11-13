# Next Chapter — Citizenship study companion

Static, dependency-free family study site for GitHub Pages, with civics and English practice. Open `index.html` or serve this directory with a static server.

## Included
- Full 128-question 2025-version civics bank, topic/search filters, and 65/20 starred subset.
- Flashcards, speech synthesis, local review scheduling, and missed-question review.
- 10-question multiple-choice warm-ups drawn from a curated subset with explicit distractors.
- Self-scored oral simulations: stop at 12 correct / 9 incorrect, or 6 / 5 for eligible 65/20 learners.
- 44 interview examples, 18 English reading/dictation pairs, test overview and official USCIS resource links.
- Browser-local family profiles, current-official overrides, checklist, export/import backups and larger text.

No backend, analytics, microphone capture or account login. Speech uses the browser's available speech-synthesis service; support and voices vary. Progress is stored per browser, not synced. This site does not determine naturalization eligibility, grade speech, or provide official USCIS assessment.

## Content maintenance
Source check: November 12, 2026. `data.js` holds generic questions and practice examples. Always verify current-officeholder answers and test rules with USCIS before an interview. The guide is for N-400 filings on or after October 20, 2025 under the rules checked. Earlier filings use a different bank.

Official resources:
- https://www.uscis.gov/citizenship/testupdates
- https://www.uscis.gov/citizenship/learn-about-citizenship/the-naturalization-interview-and-test
- https://www.uscis.gov/citizenship/exceptions-and-accommodations
- https://www.uscis.gov/n-400

Run validation: `node citizenship/tests/study.test.cjs` from repository root.

Browser QA covered flashcard reveal, multiple-choice scoring, a complete 12-correct mock exam, writing feedback, search, independent profiles and a 390px phone layout. Computational checks cover all four exam stopping thresholds, mixed-answer stopping, unique question draws and complete content counts.

## Theme, audio and PDF
The family PDF is publicly downloadable with the owner’s authorization. The header includes a saved dark/light toggle and an English voice picker with preview and playback speed. Voice selection uses the browser’s available voices, preferring voices labeled natural/enhanced/premium/neural and U.S. English when available. This heuristic cannot guarantee sound quality. Online system voices may use a remote speech provider; no app-owned TTS key or paid service is used. Voice, rate and theme are saved per profile and included in backups.

## Family learning update — November 2026
Five nickname-only profiles (Richmond, Davis, Desmond, Tomi, Maurice) are added once without overwriting existing records. No birth dates, ages, residence dates or personal interview answers are stored in the repository. Tomi defaults to Simple English, larger text, 0.85× speech, and five-question daily practice. Other profiles default to ten questions.

Added 128 original study explanations and memory tips; a basic English glossary; adaptive daily review; topic accuracy and confidence summaries; local-date practice streaks; and a full, self-checked interview rehearsal. Study explanations supplement the unchanged official question wording and example answers. All profiles start with the full question bank; a language preference does not enable an exemption.

Offline assets (including PDF) are precached by a service worker scoped to this directory. Increment the CACHE value in sw.js whenever changing a cached asset. Updates activate when old tabs close. Audio depends on device voices and may require internet. No paid speech provider is configured. Import creates separate copies; transfers between devices are manual, not automatic sync.

Validation: `node citizenship/tests/study.test.cjs`. Tests cover family migration, content completeness, unique adaptive daily sets, topic totals, streaks, both full-rehearsal outcomes, existing civics scoring, and offline asset coverage. Browser QA includes offline reload with the preview server stopped.

## Draft automatic sync (requires Richmond's Firebase project)
This branch prepares one Firebase Authentication account per family member and a Firestore document at `studyProfiles/{uid}`. The static site stays on GitHub Pages. Never commit passwords, service account keys or an Admin SDK key. The public web config in `firebase-config.js` is not a secret; security depends on deploying `firestore.rules` before any sign-in. Current production remains local-only until project setup and a live two-device test pass.

Create a Firebase project on the Spark plan, register a web app for `richmond456.github.io`, enable Authentication > Google (and optionally Email/Password), create a Cloud Firestore database, deploy the included rules and replace the null config object with the Firebase Web App config. Add `richmond456.github.io` to Authentication > Settings > Authorized domains. Google sign-in uses a popup, which may require allowing pop-ups on mobile Safari. Keep the account tied to each person's selected local profile on first sign-in; signing in on another device pulls that account's profile. Review initial profile ownership and concurrent offline edits before release. Do not switch to a paid plan or store immigration answers.
