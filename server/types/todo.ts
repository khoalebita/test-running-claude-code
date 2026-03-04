import type { Todo } from '../../src/types/todo.ts'

export type TodoRow = {
  id: string
  title: string
  completed: number
  created_at: number
}

export type CreateTodoBody = {
  title: string
}

export type UpdateTodoBody = {
  title?: string
  completed?: boolean
}

export type TodoResponse = Todo
