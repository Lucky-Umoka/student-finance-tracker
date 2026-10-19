# Student Finance Tracker

A responsive, accessible finance tracker for students, built with HTML, CSS and JavaScript.

Theme: Student Finance Tracker

Live site (GitHub Pages): https://lucky-umoka.github.io/student-finance-tracker/

Demo video: 

Author: Lucky Umoka

GitHub: https://github.com/lucky-umoka 

Email: l.umoka@alustudent.com

## Features
- Add, edit (inside the table row), and delete transactions with a confirm dialog
- Records show as a table on large screens and as cards on phones
- Sort by date, description (A to Z) and amount (low to high)
- Live regex search with a case-insensitive toggle, safe pattern compiling, and `<mark>` highlights
- Dashboard: total records, total spent, top category (by money spent), last 7 days, and a 7-day bar chart
- Spending cap with a polite live message when under and an assertive alert when over
- Settings: base currency plus two others with manual rates, cap, and editable categories
- Auto-saves to localStorage; JSON export and import with validation; sample data button
- Keyboard-friendly, with skip link, visible focus and ARIA live regions

## How to run
1. Clone the repo.
2. Serve the folder with any static server (modules do not work from `file://`). For example `python3 -m http.server 8000`, or the VS Code Live Server extension.
3. Open `http://localhost:8000`.

## How to run the tests
Open `tests.html` through the same server. Every line should show PASS and the summary should say `0 failed`.

## Regex catalog

| Rule | Pattern | Matches | Rejects |
|---|---|---|---|
| Description | `/^\S(?:.*\S)?$/` | `Lunch at cafeteria` | `" Lunch"`, `"Lunch "` |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | `12`, `12.50`, `0` | `012`, `1.234`, `-5` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | `2025-09-29` | `2025-13-01`, `29-09-2025` |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Food`, `Fast-food` | `Food2`, `Fast--food` |
| Advanced: duplicate word (named group and back-reference) | `/\b(?<word>\w+)\s+\k<word>\b/i` | blocks `the the` | `Bus pass` is fine |
| Exchange rate | `/^(0\|[1-9]\d*)(\.\d{1,6})?$/` | `0.0007`, `1450` | `0.0000001` |

Extra checks on top of the regex: the date must be a real calendar day (so `2025-02-30` fails), repeated spaces inside a description are collapsed to one, and a rate must be above 0.

**Search examples to try:** `coffee|tea` (keywords), `\.\d{2}\b` (amounts with cents), `^2025-1` (dates in late 2025), `^[A-F]` (categories starting with A to F), `\b(\w+)\s+\1\b` (repeated words). A broken pattern such as `(` shows a message and does not crash the app.

## Keyboard map

| Key | What it does |
|---|---|
| Tab / Shift+Tab | Move to the next / previous control |
| Tab (first press on page) | Reveals the "Skip to main content" link |
| Enter | Follow a link, press a button, or save the row being edited |
| Escape | Cancel the row edit, or close the delete dialog |
| Space | Press a button or toggle the case checkbox |
| Arrow keys | Change the value in the Sort and Base currency dropdowns |

## Accessibility notes
- Landmarks (`header`, `nav`, `main`, `section`, `footer`), one `h1`, and a heading order with no gaps
- Skip link; every input has a label bound with `for` and `id`
- Visible focus ring on every interactive element
- Errors are text under each field, linked with `aria-describedby`, and fields get `aria-invalid`
- `role="status"` (polite) for updates and `role="alert"` (assertive) for going over the cap
- The 7-day chart has a text description for screen readers
- Row buttons have unique names, such as "Delete Bus pass"
- Delete confirmation uses the native `<dialog>` element (focus is trapped, Escape closes it)
- Colour contrast is at least 4.5:1 for text; motion is turned off for people who prefer reduced motion
- Responsive at 360px, 768px and 1024px, mobile-first

## Data model
Each record: `id`, `description`, `amount`, `category`, `date`, `createdAt`, `updatedAt`. Settings: `baseCurrency`, `rates`, `cap`, `categories`. Saved in localStorage under `sft:records` and `sft:settings`.

## Design decisions
- Amounts are stored as plain numbers in your base currency. Changing the base currency does not convert old records.
- Exchange rates are manual (no API), as required.
- Import **merges**: duplicates are skipped and nothing is deleted. A file with any invalid record is rejected completely.
- "Top category" means the category with the most money spent.

## Project structure
```
index.html        tests.html        seed.json
styles/main.css
scripts/  main.js  state.js  storage.js  ui.js  validators.js  search.js
          stats.js  dashboard.js  currency.js  settings.js  data.js  inline-edit.js
docs/     spec.md  a11y-and-wireframes.md
assets/
```
