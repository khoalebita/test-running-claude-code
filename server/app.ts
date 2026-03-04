import express from 'express'
import cors from 'cors'
import type { Database } from 'better-sqlite3'
import { createTodosRouter } from './routes/todos.ts'

export function createApp(db: Database) {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/api', createTodosRouter(db))
  return app
}
