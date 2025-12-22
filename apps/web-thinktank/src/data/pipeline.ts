import type { StageConfig } from '../lib/types'

export const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

export const MODEL_PRESETS = [
  {
    id: 'claude-haiku-45',
    label: 'Claude Haiku 4.5',
    modelId: 'anthropic/claude-3.5-haiku-20241022',
  },
  {
    id: 'gemini-3-flash',
    label: 'Gemini 3 Flash',
    modelId: 'google/gemini-1.5-flash',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    modelId: 'openai/gpt-4o',
  },
]

export const DEFAULT_STAGES: StageConfig[] = [
  {
    id: 'planning',
    label: 'Planning',
    enabled: true,
    modelId: MODEL_PRESETS[0].modelId,
    temperature: 0.4,
    systemPrompt:
      'You are a strategic planning model. Break down the problem into clear stages, assumptions, and risks. Produce a numbered plan with milestones and unknowns.',
  },
  {
    id: 'solution',
    label: 'Solution',
    enabled: true,
    modelId: MODEL_PRESETS[2].modelId,
    temperature: 0.4,
    systemPrompt:
      'You are a solution designer. Build a concrete approach informed by the plan. Include tradeoffs, implementation notes, and what to verify.',
  },
  {
    id: 'synthesis',
    label: 'Synthesis',
    enabled: true,
    modelId: MODEL_PRESETS[1].modelId,
    temperature: 0.35,
    systemPrompt:
      'You are a synthesis model. Combine the strongest ideas from earlier stages into a cohesive answer. Remove redundancy and highlight key decisions.',
  },
  {
    id: 'review',
    label: 'Review',
    enabled: true,
    modelId: MODEL_PRESETS[0].modelId,
    temperature: 0.2,
    systemPrompt:
      'You are a critical reviewer. Find gaps, risks, and missing validations. Provide a short checklist and any fixes needed.',
  },
]
