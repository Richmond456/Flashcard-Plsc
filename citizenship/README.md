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
