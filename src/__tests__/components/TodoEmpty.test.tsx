import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodoEmpty from '../../components/todo/todo-empty'

describe('TodoEmpty', () => {
  it('renders "No todos yet" text', () => {
    render(<TodoEmpty />)
    expect(screen.getByText('No todos yet')).toBeInTheDocument()
  })

  it('renders "Add one above to get started"', () => {
    render(<TodoEmpty />)
    expect(screen.getByText('Add one above to get started')).toBeInTheDocument()
  })
})
