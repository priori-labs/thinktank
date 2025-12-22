import type { StageConfig } from '../lib/types'

export const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

export const AGENT_OPTIONS = [
  {
    id: 'claude-haiku-45',
    label: 'Claude Haiku 4.5',
    modelId: 'anthropic/claude-haiku-4.5',
  },
  {
    id: 'gemini-3-flash',
    label: 'Gemini 3 Flash',
    modelId: 'google/gemini-3-flash-preview',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    modelId: 'openai/gpt-4o',
  },
]

export const DEFAULT_AGENT_MODEL_IDS = [
  'anthropic/claude-haiku-4.5',
  'x-ai/grok-4.1-fast',
  'google/gemini-3-flash-preview',
]

export const DEFAULT_SYNTHESIS_MODEL_ID = 'google/gemini-3-flash-preview'

export const DEFAULT_REVIEW_MODEL_ID = 'google/gemini-3-flash-preview'

export const DEFAULT_STAGES: StageConfig[] = [
  {
    id: 'planning',
    label: 'Planning',
    enabled: true,
    temperature: 0.4,
    kind: 'agent',
    systemPrompt:
      'You are a strategic planning model. Carefully analyze the provided problem statement and then develop a robust solution approach. Consider multiple perspectives and all edge cases and potential bugs. This should be a high level solution description with detailed implementation steps—not the actual implementation.',
  },
  {
    id: 'solution',
    label: 'Solution',
    enabled: true,
    temperature: 0.4,
    kind: 'agent',
    systemPrompt:
      'You are tasked with implementing a solution to a problem statement. You are given a detailed solution plan and the original problem statement. Analyze each of these and then produce a detailed solution to the original problem statement, carefully considering all details in the plan and making revisions or improvements where needed.',
  },
  {
    id: 'synthesis',
    label: 'Synthesis',
    enabled: true,
    temperature: 0.35,
    kind: 'synthesis',
    systemPrompt:
      'You are provided with an original problem statement and multiple proposed solutions crafted by other AI models. Review all of these solutions and synthesize a new solution that combines the best aspects of all of the given options.',
  },
  {
    id: 'review',
    label: 'Review',
    enabled: true,
    temperature: 0.2,
    kind: 'review',
    systemPrompt:
      'You are provided with a problem statement and a response. Carefully review the response for any issues, inconsistencies, logical fallacies, hallucinations, etc. Edit and correct any issues you find and produce a new, revised solution to the problem.',
  },
]
