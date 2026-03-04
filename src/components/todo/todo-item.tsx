import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import type { Todo } from '../../types/todo'
import PencilIcon from '../icons/pencil-icon'
import TrashIcon from '../icons/trash-icon'

type TodoItemProps = {
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

  function handleToggle() {
    onToggle(todo.id)
  }

  function handleDelete() {
    onDelete(todo.id)
  }

  function handleEditValueChange(event: ChangeEvent<HTMLInputElement>) {
    setEditValue(event.target.value)
  }

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

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') saveEdit()

    if (event.key === 'Escape') cancelEdit()
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm group hover:border-gray-200 transition">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600 shrink-0"
      />

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleEditValueChange}
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
          <PencilIcon />
        </button>

        <button
          onClick={handleDelete}
          title="Delete"
          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
