# Habitate — CLAUDE.md

## Project Overview

**Habitate** is a habit-building app grounded in a consciousness-based philosophy: cultivate healthy habits with ease, without strain or force. The design ethos is gentle awareness, not rigid discipline.

## Code Philosophy

> **IMPORTANT: Every change must be elegant, clean, and simple. This is non-negotiable.**

- **Simple** — prefer the obvious solution over the clever one
- **Elegant** — clean structure, clear naming, minimal noise
- **Non-redundant** — no duplication; shared logic lives in one place

Apply these to every change. When in doubt, do less. Resist the urge to over-engineer.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Angular 19 (standalone, signals, Material) |
| Backend | Express 5, Node.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (1-week expiry) + bcrypt |
| AI | OpenAI `text-embedding-3-small` (goal ranking) + `gpt-4o-mini` (habit coach) |
| Scheduling | node-cron |
| Notifications | nodemailer (email) + web-push (PWA push) |
| Shared | `/global` folder for types/validation shared between front and back |

## Architecture

```
habitate/
├── backend/          # Express REST API (port 3000)
│   ├── database/     # Mongoose schemas, connection, queries
│   ├── goals/        # Goals + Habits CRUD, AI embeddings & coach
│   ├── progresses/   # Daily habit progress tracking + cron
│   ├── reflections/  # Daily reflections + reminder cron
│   ├── users/        # Auth, JWT middleware, password reset, tour
│   ├── utils/        # Error class, handlers, date utils, logging
│   └── server.ts     # App entry point, route mounting
├── frontend/         # Angular 19 SPA + PWA
│   └── src/app/
│       ├── goals/    # Goal & habit management UI
│       ├── habits/   # Habit display & updates
│       ├── progresses/ # Progress tracking & stats
│       ├── reflections/ # Reflection UI
│       ├── users/    # Auth flows
│       ├── state.service.ts  # Global signal-based state (localStorage)
│       └── main/     # App bootstrap, navigation
└── global/           # Shared types & validation rules
```

## Key Domain Concepts

- **Goal** — a user's high-level intention (e.g. "Get healthier"). Max 3 habits per goal. Stored with an OpenAI embedding for similarity ranking.
- **Habit** — a concrete daily practice attached to a goal. Has a `latestProgress` reference.
- **HabitProgress** — one record per habit per day. Tracks `completed` and `attempted` booleans.
- **Reflection** — one per user per day. Tracks `intention`, `what went well`, completion status.
- **User** — has timezone, reflection reminder preferences, push subscription, tour state.

## Core Flows

1. **Daily cron (midnight UTC adjusted per timezone):** creates `HabitProgress` records for all habits + a `Reflection` for each user.
2. **Reminder cron (every 15 min):** emails/pushes users who haven't completed their reflection and whose reminder time window matches now.
3. **AI goal ranking:** on `postGoal`, embeds goal name and computes cosine similarity against existing goals to assign a `ranking`.
4. **AI habit coach:** multi-turn `gpt-4o-mini` conversation with function-calling to fetch goal context, helping users define good habits.

## State Management (Frontend)

- Angular signals only — no external state library.
- Single `$state` signal in `state.service.ts` persisted to `localStorage` key `HABITATE_APP_STATE`.
- Goals list lives in `goals.service.ts` as a `$goals` signal.

## API Structure

All routes under `/` on port 3000:
- `POST /users/register`, `POST /users/login` — public
- `/goals`, `/progresses`, `/reflections` — JWT-protected (middleware in `users.middleware.ts`)

## Conventions

- TypeScript strict mode, no `any`.
- Custom error class: `ErrorWithStatus` in `utils/error.class.ts`.
- Standard API response wrapper: `utils/standardResponse.ts`.
- Date utilities shared between front and back: `utils/date.utils.shared.ts`.
- No NgModules on the frontend — standalone components throughout.

## Environment Variables (backend .env)

```
DB_URL=
SECRET_KEY_FOR_SIGNING_TOKEN=
OPEN_AI_KEY=
```
