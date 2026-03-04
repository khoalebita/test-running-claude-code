import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoInput from '../../components/TodoInput'

describe('TodoInput', () => {
  it('Add button is disabled when input is empty', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('Add button is disabled for whitespace-only input', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), '   ')
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('Add button is enabled when input has text', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Buy milk')
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()
  })

  it('calls onAdd with trimmed value on button click', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), '  Buy milk  ')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledWith('Buy milk')
  })

  it('calls onAdd with trimmed value on Enter key', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Walk dog{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Walk dog')
  })

  it('clears input after submit', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Task{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not call onAdd for whitespace-only input on Enter', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), '   {Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})
