import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '../../components/todo/todo-item'
import type { Todo } from '../../types/todo'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  title: 'Test todo',
  completed: false,
  created_at: 1000,
  ...overrides,
})

describe('TodoItem — display', () => {
  it('shows the todo title', () => {
    render(
      <TodoItem
        todo={makeTodo({ title: 'My task' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('My task')).toBeInTheDocument()
  })

  it('checkbox is unchecked for incomplete todo', () => {
    render(
      <TodoItem
        todo={makeTodo({ completed: false })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('checkbox is checked for completed todo', () => {
    render(
      <TodoItem
        todo={makeTodo({ completed: true })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('completed todo title has line-through class', () => {
    render(
      <TodoItem
        todo={makeTodo({ completed: true, title: 'Done task' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Done task')).toHaveClass('line-through')
  })

  it('incomplete todo title does not have line-through class', () => {
    render(
      <TodoItem
        todo={makeTodo({ completed: false, title: 'Active task' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Active task')).not.toHaveClass('line-through')
  })
})

describe('TodoItem — toggle and delete', () => {
  it('calls onToggle with id when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ id: 'abc' })}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('calls onDelete with id when trash button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ id: 'xyz' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    )
    await user.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('xyz')
  })
})

describe('TodoItem — enter edit mode', () => {
  it('double-click on title shows input', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Click me' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Click me'))
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
  })

  it('edit button click shows input', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Edit me' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await user.click(screen.getByTitle('Edit'))
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
  })

  it('input is pre-filled with current title', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Current title' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Current title'))
    expect(screen.getByRole('textbox', { name: '' })).toHaveValue('Current title')
  })
})

describe('TodoItem — save edit', () => {
  it('Enter key calls onEdit with new title and exits edit mode', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ id: 'abc', title: 'Old' })}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, 'New title{Enter}')
    expect(onEdit).toHaveBeenCalledWith('abc', 'New title')
    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument()
  })

  it('blur calls onEdit with changed title', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ id: 'abc', title: 'Old' })}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, 'Blurred')
    await user.tab()
    expect(onEdit).toHaveBeenCalledWith('abc', 'Blurred')
  })

  it('does not call onEdit when value is unchanged', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Same' })}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Same'))
    await user.keyboard('{Enter}')
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('does not call onEdit for whitespace-only value', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Valid' })}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Valid'))
    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, '   {Enter}')
    expect(onEdit).not.toHaveBeenCalled()
  })
})

describe('TodoItem — cancel edit', () => {
  it('Escape key does not call onEdit', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Original' })}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Original'))
    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, 'Changed')
    await user.keyboard('{Escape}')
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('Escape key restores original title in span', async () => {
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={makeTodo({ title: 'Original' })}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await user.dblClick(screen.getByText('Original'))
    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, 'Changed')
    await user.keyboard('{Escape}')
    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '' })).not.toBeInTheDocument()
  })
})
