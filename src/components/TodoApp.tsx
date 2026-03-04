import { useState, useEffect } from 'react'
import type { Todo } from '../types/todo'
import TodoHeader from './TodoHeader'
import TodoInput from './TodoInput'
import TodoList from './TodoList'

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch('/api/todos')
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  async function loadTodos() {
    try {
      const data = await fetchTodos()
      setTodos(data)
    } catch {
      // silently handle load errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  async function handleAdd(title: string) {
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    await loadTodos()
  }

  async function handleToggle(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    })
    await loadTodos()
  }

  async function handleEdit(id: string, title: string) {
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    await loadTodos()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    await loadTodos()
  }

  const completed = todos.filter((t) => t.completed).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <TodoHeader total={todos.length} completed={completed} />
        <TodoInput onAdd={handleAdd} />
        <TodoList todos={todos} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  )
}
