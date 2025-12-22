import { Textarea } from '@thinktank/ui-library/components/textarea'

type ProblemInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const ProblemInput = ({ value, onChange, disabled }: ProblemInputProps) => {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Problem Statement
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Define the challenge</h2>
        </div>
        <div className="text-xs text-slate-500">Stored locally</div>
      </div>
      <Textarea
        className="mt-4 min-h-[140px] bg-white/90 text-slate-900"
        placeholder="Describe the hard problem you want to break apart. Include constraints, goals, and what success looks like."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  )
}
