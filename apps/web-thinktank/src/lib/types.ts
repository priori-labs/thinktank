export type StageConfig = {
  id: string
  label: string
  enabled: boolean
  modelId: string
  systemPrompt: string
  temperature: number
}

export type StageStatus = 'pending' | 'running' | 'complete' | 'error'

export type StageRequest = {
  model: string
  temperature: number
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
}

export type StageResponse = {
  id?: string
  model?: string
  created?: number
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  cost?: number | null
}

export type StageResult = {
  stageId: string
  stageLabel: string
  modelId: string
  systemPrompt: string
  status: StageStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  output?: string
  error?: string
  request?: StageRequest
  response?: StageResponse
}

export type PipelineRun = {
  id: string
  problem: string
  createdAt: string
  stages: StageResult[]
}

export type StoredState = {
  apiKey: string
  baseUrl: string
  problem: string
  stages: StageConfig[]
  runs: PipelineRun[]
  selectedRunId?: string
}
