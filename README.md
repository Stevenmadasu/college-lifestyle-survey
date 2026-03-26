# College Lifestyle Survey

A responsive, single-page survey web application that explores how college students balance their schedules and unwind. Built with vanilla JavaScript, Vite, Supabase, and Chart.js.

## Live Demo

> Deployed via Azure Static Web Apps — link TBD

## Features

- **8-question survey** covering location, college year, schedule, and unwinding habits
- **Multiple input types**: text input, dropdown, radio buttons, checkboxes with conditional "Other" field
- **Anonymous data storage** via Supabase (PostgreSQL with Row Level Security)
- **Real-time results dashboard** with interactive Chart.js visualizations
- **Mobile-first responsive design** with a premium purple theme
- **Single-page application** with smooth view transitions

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML / CSS / JavaScript | Core frontend |
| Vite 5 | Build tool & dev server |
| Supabase | Backend (PostgreSQL database + RLS) |
| Chart.js | Data visualization |
| Azure Static Web Apps | Hosting & deployment |
| GitHub Actions | CI/CD pipeline |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
college-lifestyle-survey/
├── index.html                  # Single-page app (all views)
├── src/
│   ├── main.js                 # View routing, form logic, submission
│   ├── supabase.js             # Supabase client & data functions
│   ├── charts.js               # Chart.js rendering
│   └── style.css               # Styles (mobile-first, purple theme)
├── staticwebapp.config.json    # Azure SWA routing config
├── .github/workflows/          # GitHub Actions CI/CD
├── WORKING_NOTES.md            # Development notes
├── package.json
└── vite.config.js
```

## Author

Survey by **Steven Madasu**, BAIS:3300 – Spring 2026.
