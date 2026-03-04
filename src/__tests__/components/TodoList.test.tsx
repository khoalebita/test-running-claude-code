import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoList from '../../components/TodoList'
import type { Todo } from '../../types/todo'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  title: 'Test todo',
  completed: false,
  created_at: 1000,
  ...overrides,
})

describe('TodoList', () => {
  it('shows TodoEmpty when todos is empty', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('No todos yet')).toBeInTheDocument()
  })

  it('renders a TodoItem for each todo', () => {
    const todos = [
      makeTodo({ id: '1', title: 'First' }),
      makeTodo({ id: '2', title: 'Second' }),
      makeTodo({ id: '3', title: 'Third' }),
    ]
    render(<TodoList todos={todos} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('calls onToggle with todo id when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const todos = [makeTodo({ id: 'abc', title: 'Toggle me' })]
    render(<TodoList todos={todos} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('calls onDelete with todo id when trash button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const todos = [makeTodo({ id: 'xyz', title: 'Delete me' })]
    render(<TodoList todos={todos} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('xyz')
  })
})
