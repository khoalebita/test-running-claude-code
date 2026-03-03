import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEdit() {
    setEditValue(todo.title)
    setEditing(true)
  }

  function saveEdit() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed)
    }
    setEditing(false)
  }

  function cancelEdit() {
    setEditValue(todo.title)
    setEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm group hover:border-gray-200 transition">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600 shrink-0"
      />

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm px-2 py-0.5 rounded border border-blue-400 outline-none focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={`flex-1 text-sm cursor-default select-none ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {todo.title}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button
          onClick={startEdit}
          title="Edit"
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          {/* Pencil icon */}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          title="Delete"
          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
        >
          {/* Trash icon */}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  )
}
