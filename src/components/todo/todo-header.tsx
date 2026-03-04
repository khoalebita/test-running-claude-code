type TodoHeaderProps = {
  total: number
  completed: number
}

export default function TodoHeader({ total, completed }: TodoHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Todo App</h1>

      {total > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          {completed} of {total} completed
        </p>
      )}
    </div>
  )
}
