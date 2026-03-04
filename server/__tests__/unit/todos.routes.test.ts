import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createTodosRouter } from '../../routes/todos.ts'

// Build a minimal mock db that inspects SQL prefix to return appropriate stubs
function makeMockDb(overrides: Record<string, () => unknown> = {}) {
  const mockRun = vi.fn().mockReturnValue({ changes: 1 })
  const mockAll = vi.fn().mockReturnValue([])
  const mockGet = vi.fn().mockReturnValue(undefined)

  return {
    prepare: vi.fn((sql: string) => {
      const sqlUpper = sql.trim().toUpperCase()
      if (sqlUpper.startsWith('SELECT * FROM TODOS ORDER')) {
        return { all: overrides['getAll'] ? vi.fn(overrides['getAll']) : mockAll }
      }
      if (sqlUpper.startsWith('SELECT * FROM TODOS WHERE')) {
        return { get: overrides['getById'] ? vi.fn(overrides['getById']) : mockGet }
      }
      if (sqlUpper.startsWith('INSERT')) {
        return { run: overrides['insert'] ? vi.fn(overrides['insert']) : mockRun }
      }
      if (sqlUpper.startsWith('UPDATE')) {
        return { run: overrides['update'] ? vi.fn(overrides['update']) : mockRun }
      }
      if (sqlUpper.startsWith('DELETE')) {
        return { run: overrides['delete'] ? vi.fn(overrides['delete']) : mockRun }
      }
      return { all: mockAll, get: mockGet, run: mockRun }
    }),
  }
}

function makeApp(overrides: Record<string, () => unknown> = {}) {
  const db = makeMockDb(overrides)
  const app = express()
  app.use(express.json())
  app.use('/api', createTodosRouter(db as never))
  return app
}

describe('GET /api/todos', () => {
  it('returns empty array when no todos', async () => {
    const app = makeApp()
    const res = await request(app).get('/api/todos')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('maps completed from 0/1 to boolean false/true', async () => {
    const rows = [
      { id: 'a', title: 'First', completed: 1, created_at: 1000 },
      { id: 'b', title: 'Second', completed: 0, created_at: 2000 },
    ]
    const app = makeApp({ getAll: () => rows })
    const res = await request(app).get('/api/todos')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: 'a', title: 'First', completed: true, created_at: 1000 },
      { id: 'b', title: 'Second', completed: false, created_at: 2000 },
    ])
  })
})

describe('POST /api/todos', () => {
  it('creates a todo and returns 201 with uuid id', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' })
    expect(res.status).toBe(201)
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(res.body.title).toBe('Buy milk')
    expect(res.body.completed).toBe(false)
    expect(typeof res.body.created_at).toBe('number')
  })

  it('trims title whitespace', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({ title: '  Walk dog  ' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Walk dog')
  })

  it('returns 400 for missing title', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('returns 400 for empty title', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({ title: '' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for whitespace-only title', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({ title: '   ' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-string title', async () => {
    const app = makeApp()
    const res = await request(app).post('/api/todos').send({ title: 123 })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/todos/:id', () => {
  const existing = { id: 'abc', title: 'Old title', completed: 0, created_at: 1000 }

  it('updates title', async () => {
    const app = makeApp({ getById: () => existing })
    const res = await request(app).put('/api/todos/abc').send({ title: 'New title' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('New title')
    expect(res.body.completed).toBe(false)
  })

  it('updates completed', async () => {
    const app = makeApp({ getById: () => existing })
    const res = await request(app).put('/api/todos/abc').send({ completed: true })
    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
    expect(res.body.title).toBe('Old title')
  })

  it('updates both title and completed', async () => {
    const app = makeApp({ getById: () => existing })
    const res = await request(app).put('/api/todos/abc').send({ title: 'Updated', completed: true })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated')
    expect(res.body.completed).toBe(true)
  })

  it('trims title on update', async () => {
    const app = makeApp({ getById: () => existing })
    const res = await request(app).put('/api/todos/abc').send({ title: '  Trimmed  ' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Trimmed')
  })

  it('returns 404 for unknown id', async () => {
    const app = makeApp({ getById: () => undefined })
    const res = await request(app).put('/api/todos/nonexistent').send({ title: 'X' })
    expect(res.status).toBe(404)
    expect(res.body.error).toBeTruthy()
  })
})

describe('DELETE /api/todos/:id', () => {
  it('returns 204 with no body on success', async () => {
    const app = makeApp({ delete: () => ({ changes: 1 }) })
    const res = await request(app).delete('/api/todos/abc')
    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  it('returns 404 for unknown id', async () => {
    const app = makeApp({ delete: () => ({ changes: 0 }) })
    const res = await request(app).delete('/api/todos/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeTruthy()
  })
})
