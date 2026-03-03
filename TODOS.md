# Project Setup Checklist

## Infrastructure
- [x] Scaffold Vite + React 19 + TypeScript project
- [x] Install TailwindCSS v4 (`@tailwindcss/vite`)
- [x] Install backend deps: `express`, `better-sqlite3`, `cors`
- [x] Install dev deps: `tsx`, `concurrently`, `prettier`, `@types/*`

## Configuration
- [x] `vite.config.ts` — TailwindCSS v4 plugin + `/api` proxy to :3001
- [x] `src/index.css` — `@import "tailwindcss"` (v4 syntax)
- [x] `package.json` scripts — dev, build, lint, format, typecheck
- [x] `tsconfig.server.json` — TypeScript config for `server/` files

## Backend
- [x] `server/db.ts` — SQLite init + todos table schema
- [x] `server/routes/todos.ts` — GET, POST, PUT, DELETE endpoints
- [x] `server/index.ts` — Express app on port 3001

## Frontend Types
- [x] `src/types/todo.ts` — `Todo` interface

## Frontend Components
- [x] `src/App.tsx` — mounts TodoApp
- [x] `src/components/TodoApp.tsx` — state owner, API calls
- [x] `src/components/TodoHeader.tsx` — title + completion count
- [x] `src/components/TodoInput.tsx` — controlled add form
- [x] `src/components/TodoList.tsx` — list or empty state
- [x] `src/components/TodoItem.tsx` — checkbox, inline edit, delete
- [x] `src/components/TodoEmpty.tsx` — dashed empty state

## Claude Code
- [x] `.claude/settings.json` — PostToolUse hooks (lint + typecheck)
- [x] `CLAUDE.md` — full project documentation

## Git
- [x] Initial commit

## Verification
- [ ] `npm run dev` — both servers start
- [ ] `npm run lint` — zero warnings/errors
- [ ] `npm run typecheck` — zero type errors
- [ ] `npm run build` — dist/ produced
- [ ] Manual: add, toggle, edit, delete, refresh persist
