import type { PipelineRun, StageResult } from '../lib/types'

const statusStyles: Record<NonNullable<StageResult['status']>, string> = {
  pending: 'border-slate-200 text-slate-500',
  running: 'border-amber-200 text-amber-700',
  complete: 'border-emerald-200 text-emerald-700',
  error: 'border-rose-200 text-rose-700',
}

const formatCost = (cost?: number | null) => (cost != null ? `$${cost.toFixed(4)}` : '—')

const formatDuration = (durationMs?: number) =>
  durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : '—'

const getTotalCost = (run: PipelineRun) =>
  run.stages.reduce((acc, stage) => acc + (stage.response?.cost ?? 0), 0)

const getTotalTokens = (run: PipelineRun) =>
  run.stages.reduce((acc, stage) => acc + (stage.response?.usage?.total_tokens ?? 0), 0)

type ResultsPanelProps = {
  run?: PipelineRun
}

export const ResultsPanel = ({ run }: ResultsPanelProps) => {
  if (!run) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
        Run the pipeline to see stage outputs, costs, and metadata.
      </div>
    )
  }

  const hasCost = run.stages.some((stage) => stage.response?.cost != null)
  const totalCost = hasCost ? getTotalCost(run) : null
  const hasTokens = run.stages.some((stage) => stage.response?.usage?.total_tokens != null)
  const totalTokens = hasTokens ? getTotalTokens(run) : null

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Problem</p>
        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{run.problem}</div>
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Cost Summary
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {totalCost != null ? `$${totalCost.toFixed(4)}` : '—'}
            </h3>
          </div>
          <div className="text-sm text-slate-600">
            Total tokens: <span className="font-semibold text-slate-900">{totalTokens ?? '—'}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          OpenRouter returns usage and cost when supported by the model.
        </p>
      </div>

      {run.stages.map((stage) => (
        <div
          key={stage.stageId}
          className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{stage.stageLabel}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                {stage.modelId}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                statusStyles[stage.status]
              }`}
            >
              {stage.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <span className="font-semibold text-slate-800">Cost</span>
              <div>{formatCost(stage.response?.cost)}</div>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Tokens</span>
              <div>{stage.response?.usage?.total_tokens ?? '—'}</div>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Duration</span>
              <div>{formatDuration(stage.durationMs)}</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            {stage.error ? (
              <p className="text-sm text-rose-600">{stage.error}</p>
            ) : stage.output ? (
              <div className="whitespace-pre-wrap text-sm text-slate-800">{stage.output}</div>
            ) : (
              <p className="text-sm text-slate-500">No output yet.</p>
            )}
          </div>

          <details className="mt-4 rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              Request + response metadata
            </summary>
            <div className="mt-3 grid gap-3 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-700">Request payload</div>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-950/5 p-3 text-[11px] text-slate-700">
                  {JSON.stringify(stage.request, null, 2)}
                </pre>
              </div>
              <div>
                <div className="font-semibold text-slate-700">Response metadata</div>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-950/5 p-3 text-[11px] text-slate-700">
                  {JSON.stringify(stage.response, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  )
}
