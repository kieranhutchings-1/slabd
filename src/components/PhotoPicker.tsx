import { useEffect, useRef, useState } from 'react'
import { MAX_UPLOAD_BYTES } from '../lib/images'

/** Choose, replace or remove a card photo. Holds the chosen File; the form
 *  uploads it on save, so abandoning the form leaves nothing behind in the
 *  bucket. */
export function PhotoPicker({
  existingUrl,
  file,
  removed,
  onPick,
  onRemove,
  onRestore,
}: {
  existingUrl: string | null
  file: File | null
  removed: boolean
  onPick: (f: File) => void
  onRemove: () => void
  onRestore: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Object URLs are a real allocation, not a string — released on change so
  // picking several photos in a row doesn't leak them.
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function accept(f: File | undefined) {
    setError(null)
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('That file isn’t an image.')
      return
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setError('That image is too large. 25MB is the limit.')
      return
    }
    onPick(f)
  }

  const shown = preview ?? (removed ? null : existingUrl)

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          accept(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex aspect-[3/4] w-full max-w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragging ? 'border-brass bg-brass/10' : 'border-hairline bg-raised hover:border-brass/60'
        }`}
      >
        {shown ? (
          <img src={shown} alt="Card photo" className="h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-[0.8rem] text-tertiary">
            Drop a photo here, or click to choose one
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.84rem]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer text-brass-bright transition-opacity hover:opacity-80"
        >
          {shown ? 'Replace photo' : 'Choose photo'}
        </button>
        {shown && (
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer text-secondary transition-colors hover:text-loss"
          >
            Remove
          </button>
        )}
        {removed && !preview && existingUrl && (
          <button
            type="button"
            onClick={onRestore}
            className="cursor-pointer text-secondary transition-colors hover:text-primary"
          >
            Undo remove
          </button>
        )}
      </div>

      {removed && !preview && (
        <p className="mt-2 text-[0.76rem] text-tertiary">
          The photo is removed when you save.
        </p>
      )}
      {error && <p className="mt-2 text-[0.78rem] text-loss">{error}</p>}
    </div>
  )
}
