import { Input } from '@thinktank/ui-library/components/input'
import { Textarea } from '@thinktank/ui-library/components/textarea'
import { MODEL_PRESETS } from '../data/pipeline'
import type { StageConfig, StageResult } from '../lib/types'

const statusStyles: Record<NonNullable<StageResult['status']>, string> = {
  pending: 'bg-slate-100 text-slate-600',
  running: 'bg-amber-100 text-amber-700',
  complete: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-700',
}

type StageCardProps = {
  stage: StageConfig
  result?: StageResult
  disabled?: boolean
  onToggle: (id: string) => void
  onPromptChange: (id: string, value: string) => void
  onModelChange: (id: string, value: string) => void
  onTemperatureChange: (id: string, value: number) => void
}

export const StageCard = ({
  stage,
  result,
  disabled,
  onToggle,
  onPromptChange,
  onModelChange,
  onTemperatureChange,
}: StageCardProps) => {
  const presetId = MODEL_PRESETS.find((preset) => preset.modelId === stage.modelId)?.id ?? 'custom'

  const modelSelectId = `stage-${stage.id}-preset`
  const modelInputId = `stage-${stage.id}-model`
  const temperatureId = `stage-${stage.id}-temp`

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{stage.label}</h3>
            {result?.status && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  statusStyles[result.status]
                }`}
              >
                {result.status}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">{stage.id}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
            checked={stage.enabled}
            onChange={() => onToggle(stage.id)}
            disabled={disabled}
          />
          Enabled
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="grid gap-2">
          <label
            htmlFor={modelSelectId}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
          >
            Model preset
          </label>
          <select
            id={modelSelectId}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm"
            value={presetId}
            onChange={(event) => {
              const nextPreset = MODEL_PRESETS.find((preset) => preset.id === event.target.value)
              if (nextPreset) {
                onModelChange(stage.id, nextPreset.modelId)
              }
            }}
            disabled={disabled}
          >
            {MODEL_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          <Input
            id={modelInputId}
            value={stage.modelId}
            onChange={(event) => onModelChange(stage.id, event.target.value)}
            disabled={disabled}
            className="bg-white/90"
            placeholder="Model ID"
          />
          <p className="text-xs text-slate-500">
            Update the model ID if your OpenRouter naming differs.
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor={temperatureId}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
          >
            Temperature
          </label>
          <div className="flex items-center gap-3">
            <input
              id={temperatureId}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={stage.temperature}
              onChange={(event) => onTemperatureChange(stage.id, Number(event.target.value))}
              disabled={disabled}
              className="w-full accent-slate-900"
            />
            <span className="w-12 text-right text-sm text-slate-600">
              {stage.temperature.toFixed(2)}
            </span>
          </div>
        </div>

        <details className="group rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
            Edit system prompt
          </summary>
          <Textarea
            className="mt-3 min-h-[140px] bg-white/90"
            value={stage.systemPrompt}
            onChange={(event) => onPromptChange(stage.id, event.target.value)}
            disabled={disabled}
          />
        </details>
      </div>
    </div>
  )
}
