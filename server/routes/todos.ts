import { Router } from 'express'
import type { Request, Response } from 'express'
import type { Database } from 'better-sqlite3'

import type { TodoRow, CreateTodoBody, UpdateTodoBody } from '../types/todo.ts'
import { rowToTodo } from '../utils/todoUtils.ts'

export function createTodosRouter(db: Database) {
  const router = Router()

  router.get('/todos', (_: Request, res: Response) => {
    const rows = db.prepare<[], TodoRow>('SELECT * FROM todos ORDER BY created_at ASC').all()

    res.json(rows.map(rowToTodo))
  })

  router.post('/todos', (req: Request, res: Response) => {
    const body: CreateTodoBody = req.body
    const { title } = body

    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'title is required' })
      return
    }

    const todo: TodoRow = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: 0,
      created_at: Date.now(),
    }

    db.prepare<[string, string, number, number]>(
      'INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)'
    ).run(todo.id, todo.title, todo.completed, todo.created_at)

    res.status(201).json(rowToTodo(todo))
  })

  router.put('/todos/:id', (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params
    const body: UpdateTodoBody = req.body
    const { title, completed } = body

    const existing = db.prepare<[string], TodoRow>('SELECT * FROM todos WHERE id = ?').get(id)

    if (!existing) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    const newTitle = title !== undefined ? title.trim() : existing.title
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed

    db.prepare<[string, number, string]>('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(
      newTitle,
      newCompleted,
      id
    )

    res.json(rowToTodo({ ...existing, title: newTitle, completed: newCompleted }))
  })

  router.delete('/todos/:id', (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params

    const result = db.prepare<[string]>('DELETE FROM todos WHERE id = ?').run(id)

    if (result.changes === 0) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    res.status(204).end()
  })

  return router
}
