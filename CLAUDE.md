# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A full-stack TODO app with:
- **Frontend**: Vite + React 19 + TypeScript + TailwindCSS v4
- **Backend**: Express.js on port 3001
- **Database**: SQLite via better-sqlite3 (file: `todos.db`)

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Vite (:5173) and Express (:3001) concurrently |
| `npm run dev:client` | Start Vite dev server only |
| `npm run dev:server` | Start Express server only (tsx watch) |
| `npm run build` | Type-check + Vite production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint with zero-warnings policy |
| `npm run format` | Prettier format src + server files |
| `npm run typecheck` | TypeScript check without emit |

## Architecture

```
Frontend (Vite :5173)  →  /api/* proxy  →  Express (:3001)  →  SQLite (todos.db)
```

The Vite dev server proxies `/api` requests to Express — no CORS issues, no hardcoded URLs in frontend code.

## API Reference

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/todos` | — | List all todos (ordered by created_at ASC) |
| POST | `/api/todos` | `{ title }` | Create a new todo |
| PUT | `/api/todos/:id` | `{ title?, completed? }` | Update title and/or completed |
| DELETE | `/api/todos/:id` | — | Delete a todo |

## Component Tree

```
App
└── TodoApp          (state owner: todos[], loading, all handlers)
    ├── TodoHeader   (title + "X of Y completed")
    ├── TodoInput    (controlled form, calls onAdd)
    └── TodoList
        ├── TodoItem (checkbox, inline edit on double-click, edit+delete buttons)
        └── TodoEmpty (dashed border empty state)
```

## Key Files

| File | Role |
|------|------|
| `src/types/todo.ts` | Shared Todo interface |
| `server/db.ts` | SQLite init + schema |
| `server/routes/todos.ts` | All 4 CRUD endpoints |
| `server/index.ts` | Express entry point (port 3001) |
| `src/components/TodoApp.tsx` | State owner, API orchestration |
| `src/components/TodoItem.tsx` | Inline editing UX |
| `vite.config.ts` | TailwindCSS v4 plugin + /api proxy |
| `.claude/settings.json` | PostToolUse hooks (lint + typecheck) |
| `tsconfig.server.json` | TypeScript config for server/ files |

## TailwindCSS v4 Notes

- Uses Vite plugin (`@tailwindcss/vite`) — **no `tailwind.config.js`** needed
- `src/index.css` uses `@import "tailwindcss"` instead of three `@tailwind` directives
- v4 auto-detects source files — no content array configuration

## Worktree Usage

```bash
# In Claude Code, use the EnterWorktree tool or:
# /worktree <name>
```

Requires HEAD to exist (initial commit must be made first).

## Available Skills

- `vercel-react-best-practices` — React/Next.js performance optimization
- `find-skills` — Discover and install additional agent skills
