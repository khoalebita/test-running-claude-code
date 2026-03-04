import type { Todo } from '../../src/types/todo.ts'
import type { TodoRow } from '../types/todo.ts'

export function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    created_at: row.created_at,
  }
}
