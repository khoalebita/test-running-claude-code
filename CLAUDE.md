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
| `src/types/todo.ts` | Shared `Todo` type |
| `server/db.ts` | SQLite init + schema |
| `server/routes/todos.ts` | All 4 CRUD endpoints |
| `server/index.ts` | Express entry point (port 3001) |
| `src/components/todo/index.tsx` | State owner, API orchestration, optimistic updates |
| `src/components/todo/todo-item.tsx` | Inline editing UX |
| `src/components/icons/` | Shared SVG icon components (kebab-case) |
| `vite.config.ts` | TailwindCSS v4 plugin + /api proxy |
| `.claude/settings.json` | PostToolUse hooks (lint + typecheck) |
| `tsconfig.server.json` | TypeScript config for server/ files |

## Coding Standards

### TypeScript
- **No type assertions** (`as Foo`) anywhere in the codebase. Declare typed variables, use generics, or type function return values explicitly instead.
- **No `unknown` or `any`** — always declare a concrete named type. Exception: the single adapter boundary in test mock setup (`as unknown as Database`) is documented and justified.
- **`type` over `interface`** for component props and all data shapes. Use `interface` only when declaration merging is explicitly required (it never is in this project).
- **No deprecated types** — use lowercase primitives (`string`, `number`, `boolean`) never the wrapper classes (`String`, `Number`, `Boolean`). Do not use `React.FC`, `React.VoidFunctionComponent`, or `React.ReactChild`.
- **Reusable types** — extract shared types into `src/types/` (client) or `server/types/` (server). Never inline a one-off type assertion when a named type can be declared.

### Code Style
- **One blank line between statements** inside function bodies to separate logical steps.
- **No abbreviations** — variable names must be fully descriptive. Never use single-letter or shortened names (`t` → `todo`, `e` → `event`, `res` → `response`).
- **No inline arrow functions as props** — if a JSX prop value is a function, extract it as a named function inside the component (e.g. `handleChange`, `handleDelete`). Render-mapping callbacks (`.map((todo) => <TodoItem />)`) are exempt.
- **Utility functions in `utils/`** — standalone functions that are not component bodies or route handlers belong in `src/utils/` (client) or `server/utils/` (server).
- **Icon components** — every SVG icon lives in its own component under `src/components/icons/` (kebab-case file name, PascalCase export).
- **kebab-case file names** — all component files use kebab-case (`todo-item.tsx`, `pencil-icon.tsx`). Exports remain PascalCase.
- **Optimistic UI** — mutations (add, toggle, edit, delete) update local state immediately before the API call, then re-sync with `loadTodos()` to confirm server state.
- **Prettier** runs automatically via PostToolUse hook after every file edit. Config: `semi: false`, `singleQuote: true`, `printWidth: 100`.

### Key Type Files
| File | Purpose |
|------|---------|
| `src/types/todo.ts` | `Todo` — shared client type |
| `src/utils/api.ts` | `fetchTodos`, `createTodo`, `updateTodo`, `deleteTodo` |
| `server/types/todo.ts` | `TodoRow`, `CreateTodoBody`, `UpdateTodoBody` |
| `server/utils/todoUtils.ts` | `rowToTodo` — SQLite row → domain type |

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
