# Fans Toys Power Rankings

Drag-and-drop ranking tool for Fans Toys collectible figures, with snapshot submissions and a leaderboard that shows movement between ranking updates.

## Overview

This project combines a small React frontend with a lightweight Express backend.

- The frontend lets you reorder figure cards with drag and drop.
- The working ranking is saved to disk so the latest order persists between sessions.
- You can submit a `Top N` snapshot to create leaderboard entries.
- The leaderboard compares the latest submission to the previous one and shows up/down/new movement for each figure.
- You can search the list, reset to the initial seed order, shuffle the board, and export the current visible ranking grid as a PNG.
- Presenter mode supports fullscreen show playback for recording or live ranking discussions.

## Tech Stack

- Frontend: React 18 + Vite
- Drag and drop: `@dnd-kit`
- Image export: `html-to-image`
- Backend: Express
- Persistence: local JSON files in `data/`

## Project Structure

```text
.
├── data/
│   ├── rankings.json         # Current working ranking order
│   └── submissions.json      # Historical submitted snapshots
├── src/
│   ├── components/
│   │   ├── FigureCard.jsx
│   │   ├── Leaderboard.jsx
│   │   └── RankingList.jsx
│   ├── data/
│   │   └── figures.json      # Seed figure catalog
│   ├── App.jsx               # Main app shell and user flow
│   ├── App.css               # Styling
│   └── main.jsx              # React entry
├── server.js                 # Express API + static serving
├── vite.config.js            # Frontend dev server config
└── index.html
```

## How It Works

### Ranking view

- Loads the current ranking from `GET /api/rankings`
- Falls back to `src/data/figures.json` if no saved ranking is available
- Supports drag-and-drop reordering across the full grid
- Saves changes back to `PUT /api/rankings`
- Lets the user choose the leaderboard cutoff with `Top 5` through `Top 50`
- Includes fullscreen presenter mode from the header toggle or the `F` keyboard shortcut

### Submission flow

- Clicking `Submit` captures only the top-tier slice currently selected
- The app sends `{ tier, rankings }` to `POST /api/submissions`
- Each submission gets an incrementing numeric ID and timestamp

### Leaderboard view

- `GET /api/leaderboard` returns the latest submission, previous submission, recent history, and movement deltas
- Movement is calculated by comparing each figure's current position against its position in the previous submission
- A figure missing from the previous submission is marked as `NEW`

## API

### `GET /api/rankings`

Returns the current working ranking array.

### `PUT /api/rankings`

Replaces the current working ranking array.

Expected body:

```json
[
  {
    "id": "FT-14",
    "name": "Forager",
    "img": "https://fans.toys/images/ft-14-001.jpg",
    "year": 2016
  }
]
```

### `GET /api/submissions`

Returns submitted snapshots in descending ID order.

### `POST /api/submissions`

Creates a new ranking snapshot.

Expected body:

```json
{
  "tier": 25,
  "rankings": ["FT-14", "FT-31", "FT-60"]
}
```

### `GET /api/leaderboard`

Returns:

- `current`: latest submission
- `previous`: prior submission, if one exists
- `movements`: per-figure delta map
- `submissionCount`: total number of submissions
- `history`: recent submission metadata

### `GET /api/submissions/:id`

Returns a specific submission plus movement data relative to the submission immediately before it.

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run the backend

```bash
npm run server
```

The API server runs on `http://localhost:3001`.

### Run the frontend

In a second terminal:

```bash
npm run dev
```

The Vite dev server runs on `http://localhost:5173`.

During development, Vite proxies `/api/*` requests to `http://localhost:3001`.

## Production Build

Build the frontend:

```bash
npm run build
```

Then start the Express server:

```bash
npm run server
```

In production mode, `server.js` serves the compiled frontend from `dist/`.

## Data Files

This project currently uses file-based persistence.

- `data/rankings.json` stores the live working order
- `data/submissions.json` stores submitted leaderboard snapshots

That makes the app simple to run locally, but it also means:

- there is no concurrency protection
- there is no user-level ownership of submissions
- the app is best suited to a single editor or low-volume internal use in its current form

## Current Limitations

- No tests yet
- No schema validation for API requests
- No auth or per-user submissions
- Data is stored in local JSON files instead of a database
- Figure images are hotlinked from an external source
- No README-driven deployment workflow or environment configuration yet

## Improvement Priorities

### Phase 1: stabilize the current app

- Add request validation for ranking and submission payloads
- Add error states in the UI for failed saves, failed submits, and failed leaderboard loads
- Add automated tests for API behavior and the main ranking flow
- Add a small dev script to run frontend and backend together

### Phase 2: make the data model safer

- Move rankings and submissions into SQLite or Postgres
- Track submitter name or user identity with each snapshot
- Add submission titles, notes, or tags for better leaderboard history
- Add server-side safeguards for malformed or duplicate figure IDs

### Phase 3: improve the product

- Add filtered ranking views by line, year, or release family
- Add side-by-side comparison between two saved submissions
- Add import/export for rankings as JSON or CSV
- Add shareable public leaderboard URLs
- Add image fallbacks and asset ownership strategy for figure media

## Suggested Next Steps

If you want to keep this lightweight, the best next move is:

1. Add validation and tests
2. Improve failure handling in the UI
3. Move persistence to SQLite

If you want it to become a real multi-user product, the next move is:

1. Add auth
2. Add a real database
3. Attach submissions to users and make leaderboards shareable
