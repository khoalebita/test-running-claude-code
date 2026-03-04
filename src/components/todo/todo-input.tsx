import { useState, type ChangeEvent, type FormEvent } from 'react'

type TodoInputProps = {
  onAdd: (title: string) => void
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmed = value.trim()

    if (!trimmed) return

    onAdd(trimmed)

    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="What needs to be done?"
        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
      />

      <button
        type="submit"
        disabled={!value.trim()}
        className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Add
      </button>
    </form>
  )
}
