import { Button } from '@thinktank/ui-library/components/button'
import { Input } from '@thinktank/ui-library/components/input'
import { KeyRound, Loader2, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ProblemInput } from './components/ProblemInput'
import { ResultsPanel } from './components/ResultsPanel'
import { RunHistory } from './components/RunHistory'
import { StageCard } from './components/StageCard'
import { DEFAULT_BASE_URL, DEFAULT_STAGES } from './data/pipeline'
import { requestStage } from './lib/openrouter'
import { loadStoredState, saveStoredState } from './lib/storage'
import type { PipelineRun, StageConfig, StageResult } from './lib/types'

const MAX_RUNS = 20

const cloneDefaultStages = () => DEFAULT_STAGES.map((stage) => ({ ...stage }))

const createRunId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `run_${Date.now()}`
}

const updateRunStages = (
  runs: PipelineRun[],
  runId: string,
  stageId: string,
  updater: (stage: StageResult) => StageResult,
) =>
  runs.map((run) => {
    if (run.id !== runId) return run
    return {
      ...run,
      stages: run.stages.map((stage) => (stage.stageId === stageId ? updater(stage) : stage)),
    }
  })

export default function App() {
  const stored = loadStoredState()
  const [apiKey, setApiKey] = useState(stored?.apiKey ?? '')
  const [baseUrl, setBaseUrl] = useState(stored?.baseUrl ?? DEFAULT_BASE_URL)
  const [problem, setProblem] = useState(stored?.problem ?? '')
  const [stages, setStages] = useState<StageConfig[]>(stored?.stages ?? cloneDefaultStages())
  const [runs, setRuns] = useState<PipelineRun[]>(stored?.runs ?? [])
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(
    stored?.selectedRunId ?? stored?.runs?.[0]?.id,
  )
  const [isRunning, setIsRunning] = useState(false)

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? runs[0],
    [runs, selectedRunId],
  )

  useEffect(() => {
    saveStoredState({
      apiKey,
      baseUrl,
      problem,
      stages,
      runs,
      selectedRunId: selectedRun?.id,
    })
  }, [apiKey, baseUrl, problem, runs, selectedRun?.id, stages])

  const enabledStages = stages.filter((stage) => stage.enabled)
  const canRun = Boolean(problem.trim()) && enabledStages.length > 0 && Boolean(apiKey.trim())

  const handleStageToggle = (id: string) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, enabled: !stage.enabled } : stage)),
    )
  }

  const handlePromptChange = (id: string, value: string) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, systemPrompt: value } : stage)),
    )
  }

  const handleModelChange = (id: string, value: string) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, modelId: value } : stage)),
    )
  }

  const handleTemperatureChange = (id: string, value: number) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, temperature: value } : stage)),
    )
  }

  const handleReset = () => {
    setProblem('')
    setStages(cloneDefaultStages())
  }

  const handleClearHistory = () => {
    setRuns([])
    setSelectedRunId(undefined)
  }

  const handleRun = async () => {
    if (!canRun || isRunning) return

    const runId = createRunId()
    const createdAt = new Date().toISOString()
    const runStages: StageResult[] = enabledStages.map((stage) => ({
      stageId: stage.id,
      stageLabel: stage.label,
      modelId: stage.modelId,
      systemPrompt: stage.systemPrompt,
      status: 'pending',
    }))

    const newRun: PipelineRun = {
      id: runId,
      problem: problem.trim(),
      createdAt,
      stages: runStages,
    }

    setRuns((prev) => [newRun, ...prev].slice(0, MAX_RUNS))
    setSelectedRunId(runId)
    setIsRunning(true)

    const priorOutputs: string[] = []

    for (const stageConfig of enabledStages) {
      const startTime = new Date()
      setRuns((prev) =>
        updateRunStages(prev, runId, stageConfig.id, (stage) => ({
          ...stage,
          status: 'running',
          startedAt: startTime.toISOString(),
        })),
      )

      try {
        const { content, request, responseMeta } = await requestStage({
          apiKey,
          baseUrl,
          stage: stageConfig,
          problem: problem.trim(),
          priorOutputs,
        })

        const finishedAt = new Date()
        const durationMs = finishedAt.getTime() - startTime.getTime()

        setRuns((prev) =>
          updateRunStages(prev, runId, stageConfig.id, (stage) => ({
            ...stage,
            status: 'complete',
            completedAt: finishedAt.toISOString(),
            durationMs,
            output: content,
            request,
            response: responseMeta,
          })),
        )

        priorOutputs.push(content)
      } catch (error) {
        const finishedAt = new Date()
        const durationMs = finishedAt.getTime() - startTime.getTime()
        const message = error instanceof Error ? error.message : 'Request failed'

        setRuns((prev) =>
          updateRunStages(prev, runId, stageConfig.id, (stage) => ({
            ...stage,
            status: 'error',
            completedAt: finishedAt.toISOString(),
            durationMs,
            error: message,
          })),
        )
        break
      }
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5ede1,_#f7f4ef_45%,_#eef2f7_100%)]">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Thinktank Pipeline
              </p>
              <h1 className="font-display mt-3 text-4xl text-slate-900">
                Multi-model workflow for hard problems
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-600">
                Design a multi-stage LLM pipeline, route requests through OpenRouter, and keep every
                intermediate artifact in your browser.
              </p>
            </div>
            <div className="w-full max-w-md space-y-3">
              <label
                htmlFor="openrouter-api-key"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                OpenRouter API key
              </label>
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <Input
                  id="openrouter-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="sk-or-..."
                  className="bg-white/90"
                />
              </div>
              <details className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Advanced settings
                </summary>
                <div className="mt-3 grid gap-2">
                  <label
                    htmlFor="openrouter-base-url"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                  >
                    OpenRouter base URL
                  </label>
                  <Input
                    id="openrouter-base-url"
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    className="bg-white/90"
                  />
                  <p className="text-xs text-slate-500">
                    Stored locally only. Defaults to https://openrouter.ai/api/v1.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </header>

        <ProblemInput value={problem} onChange={setProblem} disabled={isRunning} />

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{enabledStages.length}</span> of{' '}
                {stages.length} stages enabled
              </p>
              <p className="text-xs text-slate-500">
                {isRunning ? 'Pipeline running...' : 'Ready to run'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isRunning}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleRun}
                disabled={!canRun || isRunning}
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'Processing' : 'Run pipeline'}
              </Button>
            </div>
          </div>
          {!apiKey.trim() && (
            <p className="mt-3 text-xs text-amber-600">
              Add an OpenRouter API key to run live requests.
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Pipeline stages
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Configure the workflow</h2>
            </div>
            {stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                result={selectedRun?.stages.find((result) => result.stageId === stage.id)}
                disabled={isRunning}
                onToggle={handleStageToggle}
                onPromptChange={handlePromptChange}
                onModelChange={handleModelChange}
                onTemperatureChange={handleTemperatureChange}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Outputs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Results + history</h2>
            </div>
            <ResultsPanel run={selectedRun} />
            <RunHistory
              runs={runs}
              selectedRunId={selectedRun?.id}
              onSelect={setSelectedRunId}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
