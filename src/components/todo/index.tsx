import { useState, useEffect } from 'react'
import type { Todo } from '../../types/todo'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../../utils/api'
import TodoHeader from './todo-header'
import TodoInput from './todo-input'
import TodoList from './todo-list'

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
    const optimisticTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      created_at: Date.now(),
    }

    setTodos((previousTodos) => [...previousTodos, optimisticTodo])

    await createTodo(title)

    await loadTodos()
  }

  async function handleToggle(id: string) {
    const todo = todos.find((existingTodo) => existingTodo.id === id)

    if (!todo) return

    setTodos((previousTodos) =>
      previousTodos.map((existingTodo) =>
        existingTodo.id === id
          ? { ...existingTodo, completed: !existingTodo.completed }
          : existingTodo
      )
    )

    await updateTodo(id, { completed: !todo.completed })

    await loadTodos()
  }

  async function handleEdit(id: string, title: string) {
    setTodos((previousTodos) =>
      previousTodos.map((existingTodo) =>
        existingTodo.id === id ? { ...existingTodo, title } : existingTodo
      )
    )

    await updateTodo(id, { title })

    await loadTodos()
  }

  async function handleDelete(id: string) {
    setTodos((previousTodos) => previousTodos.filter((existingTodo) => existingTodo.id !== id))

    await deleteTodo(id)

    await loadTodos()
  }

  const completedCount = todos.filter((todo) => todo.completed).length

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
        <TodoHeader total={todos.length} completed={completedCount} />
        <TodoInput onAdd={handleAdd} />
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
