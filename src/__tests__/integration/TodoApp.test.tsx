import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Todo } from '../../types/todo'
import TodoApp from '../../components/todo'

type MockBody = Todo[] | null

type MockResponse = {
  ok: boolean
  status?: number
  body?: MockBody
}

type MockFetchReturn = {
  ok: boolean
  status: number
  json: () => Promise<MockBody>
}

// Queue-based fetch mock: each call consumes one response from the queue
function makeFetchMock(responses: MockResponse[]) {
  const queue = [...responses]

  return vi.fn().mockImplementation(() => {
    const next = queue.shift()

    if (!next) throw new Error('Fetch mock queue exhausted')

    const result: MockFetchReturn = {
      ok: next.ok,
      status: next.status ?? (next.ok ? 200 : 500),
      json: () => Promise.resolve(next.body ?? null),
    }

    return Promise.resolve(result)
  })
}

function jsonResponse(body: MockBody): MockResponse {
  return { ok: true, body }
}

function makeOkResponse(status: number = 200): MockResponse {
  return { ok: true, status, body: null }
}

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Test todo',
    completed: false,
    created_at: 1000,
    ...overrides,
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TodoApp — loading and empty state', () => {
  it('shows loading spinner before fetch resolves', async () => {
    let resolveFirst!: (value: MockFetchReturn) => void
    const pending = new Promise<MockFetchReturn>((res) => {
      resolveFirst = res
    })

    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending))

    render(<TodoApp />)

    // Spinner has animate-spin class
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()

    resolveFirst({ ok: true, status: 200, json: () => Promise.resolve([]) })
  })

  it('shows TodoEmpty after empty GET response', async () => {
    vi.stubGlobal('fetch', makeFetchMock([jsonResponse([])]))

    render(<TodoApp />)

    await waitFor(() => expect(screen.getByText('No todos yet')).toBeInTheDocument())
  })

  it('does not crash on network error, shows TodoEmpty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    render(<TodoApp />)

    await waitFor(() => expect(screen.getByText('No todos yet')).toBeInTheDocument())
  })
})

describe('TodoApp — renders todos after load', () => {
  it('displays todos returned by GET', async () => {
    const todos = [
      makeTodo({ id: '1', title: 'First task' }),
      makeTodo({ id: '2', title: 'Second task' }),
    ]

    vi.stubGlobal('fetch', makeFetchMock([jsonResponse(todos)]))

    render(<TodoApp />)

    await waitFor(() => expect(screen.getByText('First task')).toBeInTheDocument())
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('shows correct header count after load', async () => {
    const todos = [
      makeTodo({ id: '1', title: 'T1', completed: true }),
      makeTodo({ id: '2', title: 'T2', completed: false }),
    ]

    vi.stubGlobal('fetch', makeFetchMock([jsonResponse(todos)]))

    render(<TodoApp />)

    await waitFor(() => expect(screen.getByText('1 of 2 completed')).toBeInTheDocument())
  })
})

describe('TodoApp — add todo', () => {
  it('calls POST then re-fetches, new todo appears, input cleared', async () => {
    const newTodo = makeTodo({ id: 'new-1', title: 'New task' })

    vi.stubGlobal(
      'fetch',
      makeFetchMock([
        jsonResponse([]), // initial GET
        makeOkResponse(201), // POST
        jsonResponse([newTodo]), // re-fetch GET
      ])
    )

    const user = userEvent.setup()

    render(<TodoApp />)
    await waitFor(() => expect(screen.getByText('No todos yet')).toBeInTheDocument())

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'New task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument())
    expect(input).toHaveValue('')
  })
})

describe('TodoApp — toggle todo', () => {
  it('calls PUT with completed:true then re-fetches', async () => {
    const todo = makeTodo({ id: 'abc', title: 'Toggle me', completed: false })
    const toggled = { ...todo, completed: true }

    vi.stubGlobal(
      'fetch',
      makeFetchMock([
        jsonResponse([todo]), // initial GET
        makeOkResponse(200), // PUT
        jsonResponse([toggled]), // re-fetch GET
      ])
    )

    const user = userEvent.setup()

    render(<TodoApp />)
    await waitFor(() => expect(screen.getByText('Toggle me')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox'))

    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked())
  })
})

describe('TodoApp — edit todo', () => {
  it('calls PUT with new title after double-click and Enter', async () => {
    const todo = makeTodo({ id: 'abc', title: 'Old title' })
    const updated = { ...todo, title: 'New title' }

    vi.stubGlobal(
      'fetch',
      makeFetchMock([
        jsonResponse([todo]), // initial GET
        makeOkResponse(200), // PUT
        jsonResponse([updated]), // re-fetch GET
      ])
    )

    const user = userEvent.setup()

    render(<TodoApp />)
    await waitFor(() => expect(screen.getByText('Old title')).toBeInTheDocument())

    await user.dblClick(screen.getByText('Old title'))

    const editInput = screen.getByDisplayValue('Old title')
    await user.clear(editInput)
    await user.type(editInput, 'New title{Enter}')

    await waitFor(() => expect(screen.getByText('New title')).toBeInTheDocument())
  })
})

describe('TodoApp — delete todo', () => {
  it('calls DELETE then re-fetches, item removed', async () => {
    const todo = makeTodo({ id: 'del-1', title: 'Delete me' })

    vi.stubGlobal(
      'fetch',
      makeFetchMock([
        jsonResponse([todo]), // initial GET
        makeOkResponse(204), // DELETE
        jsonResponse([]), // re-fetch GET
      ])
    )

    const user = userEvent.setup()

    render(<TodoApp />)
    await waitFor(() => expect(screen.getByText('Delete me')).toBeInTheDocument())

    await user.click(screen.getByTitle('Delete'))

    await waitFor(() => expect(screen.getByText('No todos yet')).toBeInTheDocument())
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })
})
