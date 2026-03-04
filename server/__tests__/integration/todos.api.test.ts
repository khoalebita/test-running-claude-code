import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { createApp } from '../../app.ts'

function createMemoryDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `)
  return db
}

let db: ReturnType<typeof createMemoryDb>
let app: ReturnType<typeof createApp>

beforeEach(() => {
  db = createMemoryDb()
  app = createApp(db)
})

afterEach(() => {
  db.close()
})

describe('Full CRUD flow', () => {
  it('creates, reads, updates, and deletes a todo', async () => {
    // Create
    const createRes = await request(app).post('/api/todos').send({ title: 'Buy milk' })
    expect(createRes.status).toBe(201)
    const id: string = createRes.body.id
    expect(createRes.body.title).toBe('Buy milk')
    expect(createRes.body.completed).toBe(false)

    // Read
    const listRes = await request(app).get('/api/todos')
    expect(listRes.status).toBe(200)
    expect(listRes.body).toHaveLength(1)
    expect(listRes.body[0].id).toBe(id)

    // Update title
    const updateTitleRes = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: 'Buy oat milk' })
    expect(updateTitleRes.status).toBe(200)
    expect(updateTitleRes.body.title).toBe('Buy oat milk')
    expect(updateTitleRes.body.completed).toBe(false)

    // Update completed
    const updateCompleteRes = await request(app).put(`/api/todos/${id}`).send({ completed: true })
    expect(updateCompleteRes.status).toBe(200)
    expect(updateCompleteRes.body.completed).toBe(true)
    expect(updateCompleteRes.body.title).toBe('Buy oat milk')

    // Delete
    const deleteRes = await request(app).delete(`/api/todos/${id}`)
    expect(deleteRes.status).toBe(204)

    // Verify gone
    const afterDelete = await request(app).get('/api/todos')
    expect(afterDelete.body).toHaveLength(0)
  })
})

describe('GET /api/todos ordering', () => {
  it('returns todos in created_at ASC order', async () => {
    db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
      'id-3',
      'Third',
      0,
      3000
    )
    db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
      'id-1',
      'First',
      0,
      1000
    )
    db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
      'id-2',
      'Second',
      0,
      2000
    )

    const res = await request(app).get('/api/todos')
    expect(res.status).toBe(200)
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(['First', 'Second', 'Third'])
  })
})

describe('completed field is always boolean', () => {
  it('never returns 0 or 1 for completed', async () => {
    db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
      'id-a',
      'Done',
      1,
      1000
    )
    db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)').run(
      'id-b',
      'Not done',
      0,
      2000
    )

    const res = await request(app).get('/api/todos')
    expect(res.body[0].completed).toBe(true)
    expect(res.body[1].completed).toBe(false)
    expect(typeof res.body[0].completed).toBe('boolean')
    expect(typeof res.body[1].completed).toBe('boolean')
  })
})

describe('Multiple todos accumulate', () => {
  it('persists multiple todos within a session', async () => {
    await request(app).post('/api/todos').send({ title: 'Task A' })
    await request(app).post('/api/todos').send({ title: 'Task B' })
    await request(app).post('/api/todos').send({ title: 'Task C' })

    const res = await request(app).get('/api/todos')
    expect(res.body).toHaveLength(3)
  })
})

describe('Edge cases', () => {
  it('returns 400 for empty title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '' })
    expect(res.status).toBe(400)
  })

  it('returns 404 for nonexistent PUT', async () => {
    const res = await request(app).put('/api/todos/no-such-id').send({ title: 'X' })
    expect(res.status).toBe(404)
  })

  it('returns 404 for nonexistent DELETE', async () => {
    const res = await request(app).delete('/api/todos/no-such-id')
    expect(res.status).toBe(404)
  })

  it('partial update preserves existing title when only completed sent', async () => {
    const create = await request(app).post('/api/todos').send({ title: 'Keep this' })
    const id: string = create.body.id

    const update = await request(app).put(`/api/todos/${id}`).send({ completed: true })
    expect(update.body.title).toBe('Keep this')
    expect(update.body.completed).toBe(true)
  })

  it('partial update preserves completed when only title sent', async () => {
    const create = await request(app).post('/api/todos').send({ title: 'Original' })
    const id: string = create.body.id
    await request(app).put(`/api/todos/${id}`).send({ completed: true })

    const update = await request(app).put(`/api/todos/${id}`).send({ title: 'Renamed' })
    expect(update.body.title).toBe('Renamed')
    expect(update.body.completed).toBe(true)
  })
})
