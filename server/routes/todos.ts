import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

interface TodoRow {
  id: string
  title: string
  completed: number
  created_at: number
}

function rowToTodo(row: TodoRow) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    created_at: row.created_at,
  }
}

router.get('/todos', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM todos ORDER BY created_at ASC').all() as TodoRow[]
  res.json(rows.map(rowToTodo))
})

router.post('/todos', (req: Request, res: Response) => {
  const { title } = req.body as { title: string }
  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required' })
    return
  }
  const todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: 0,
    created_at: Date.now(),
  }
  db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
    todo.id,
    todo.title,
    todo.completed,
    todo.created_at
  )
  res.status(201).json(rowToTodo(todo))
})

router.put('/todos/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { title, completed } = req.body as { title?: string; completed?: boolean }

  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined
  if (!existing) {
    res.status(404).json({ error: 'Todo not found' })
    return
  }

  const newTitle = title !== undefined ? title.trim() : existing.title
  const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed

  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(newTitle, newCompleted, id)

  res.json(rowToTodo({ ...existing, title: newTitle, completed: newCompleted }))
})

router.delete('/todos/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Todo not found' })
    return
  }
  res.status(204).end()
})

export default router
