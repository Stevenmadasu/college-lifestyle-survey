# Working Notes — College Lifestyle Survey

## Project Overview

This is a responsive single-page survey application for BAIS:3300 (Spring 2026). The survey collects anonymous data about college students' lifestyles, schedules, and preferred ways to unwind.

## Key Decisions

### Architecture
- **Single-page application (SPA)** — All four views (landing, survey, success, results) live in one HTML file. JavaScript shows/hides views for instant navigation without page reloads.
- **Vite 5** — Used as the build tool for fast HMR during development and optimized production bundles. Version 5 chosen for Node.js v20 compatibility.

### Data Layer
- **Supabase** — Chosen for its PostgreSQL backend with built-in REST API and Row Level Security. The anon key allows direct browser-to-database communication without a custom backend.
- **RLS Policies** — Insert-only for anonymous users (can submit but not modify/delete), select for reading aggregated results.

### Styling
- **Purple gradient theme** — Matches the reference site aesthetic. Uses soft gradients, glassmorphic navbar, custom-styled radio buttons and checkboxes.
- **Mobile-first** — All layouts start at mobile and scale up using CSS `@media` queries at 640px and 1024px breakpoints.

### Survey Design
- **8 questions** with a mix of input types for variety: 2 text inputs, 2 dropdowns, 3 radio button groups, 1 checkbox group with conditional text input.
- **Conditional "Other" input** — On Q5 (unwind activities), selecting "Other" reveals a text input with a smooth CSS transition.

### Charts
- **Chart.js** — Renders 5 charts on the results page: bar charts for college year and mental reset, horizontal bars for schedule and unwind activities, doughnut for self-time frequency.
- Charts are rendered once and cached to avoid re-creation on repeated visits.

## Challenges & Solutions

1. **Node.js version** — Vite 6+ requires Node 20.19+. Solved by pinning Vite 5 which supports Node 20.18.
2. **Array column in Supabase** — Unwind activities stored as `text[]` PostgreSQL array. Supabase JS handles this natively.
3. **Form validation** — Custom validation highlights the first errored group and scrolls to it for a better UX than native browser validation.

## Development Timeline

- 2026-03-26: Project scaffolded, Supabase table created, all source files written.
