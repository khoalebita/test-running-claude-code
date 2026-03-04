import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodoHeader from '../../components/TodoHeader'

describe('TodoHeader', () => {
  it('shows "Todo App" h1', () => {
    render(<TodoHeader total={0} completed={0} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Todo App' })).toBeInTheDocument()
  })

  it('hides count when total is 0', () => {
    render(<TodoHeader total={0} completed={0} />)
    expect(screen.queryByText(/completed/)).not.toBeInTheDocument()
  })

  it('shows correct count "2 of 5 completed"', () => {
    render(<TodoHeader total={5} completed={2} />)
    expect(screen.getByText('2 of 5 completed')).toBeInTheDocument()
  })

  it('shows "0 of 3 completed" when none done', () => {
    render(<TodoHeader total={3} completed={0} />)
    expect(screen.getByText('0 of 3 completed')).toBeInTheDocument()
  })
})
