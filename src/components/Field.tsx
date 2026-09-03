import { type ReactNode } from 'react'

const control =
  'w-full rounded-xl border border-hairline bg-raised px-3.5 py-2.5 text-[0.9rem] text-primary placeholder:text-tertiary focus:border-brass/60 focus:outline-none'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.82rem] text-secondary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.74rem] text-tertiary">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  ...rest
}: {
  value: string
  onChange: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <input {...rest} className={control} value={value} onChange={(e) => onChange(e.target.value)} />
  )
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
}) {
  return (
    <select className={control} value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      className={control}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-brass)]"
      />
      <span className="text-[0.9rem] text-primary">{label}</span>
    </label>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-6">
      <h2 className="font-display mb-5 text-[1rem] font-bold text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
