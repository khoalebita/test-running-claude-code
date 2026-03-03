export default function TodoEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
      <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-sm font-medium">No todos yet</p>
      <p className="text-xs mt-1">Add one above to get started</p>
    </div>
  )
}
