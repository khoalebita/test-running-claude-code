import ClipboardIcon from '../icons/clipboard-icon'

export default function TodoEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
      <ClipboardIcon />

      <p className="text-sm font-medium">No todos yet</p>

      <p className="text-xs mt-1">Add one above to get started</p>
    </div>
  )
}
