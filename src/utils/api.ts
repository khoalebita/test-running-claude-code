import type { Todo } from '../types/todo.ts'

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos')

  if (!response.ok) throw new Error('Failed to fetch todos')

  const data: Todo[] = await response.json()

  return data
}

export async function createTodo(title: string): Promise<void> {
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export async function updateTodo(id: string, patch: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<void> {
  await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export async function deleteTodo(id: string): Promise<void> {
  await fetch(`/api/todos/${id}`, { method: 'DELETE' })
}
