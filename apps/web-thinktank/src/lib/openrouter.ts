import type { StageConfig, StageRequest, StageResponse } from './types'

const getCostFromResponse = (data: Record<string, unknown>) => {
  const usage = data.usage as Record<string, unknown> | undefined
  const usageCost = usage?.total_cost ?? usage?.cost
  if (typeof usageCost === 'number') return usageCost
  const directCost = data.cost
  return typeof directCost === 'number' ? directCost : null
}

const buildUserMessage = (problem: string, priorOutputs: string[]) => {
  if (priorOutputs.length === 0) {
    return `Problem:\n${problem}`
  }

  return [
    `Problem:\n${problem}`,
    'Previous stage outputs:',
    ...priorOutputs.map((output, index) => `Stage ${index + 1} output:\n${output}`),
  ].join('\n\n')
}

export const requestStage = async ({
  apiKey,
  baseUrl,
  stage,
  problem,
  priorOutputs,
}: {
  apiKey: string
  baseUrl: string
  stage: StageConfig
  problem: string
  priorOutputs: string[]
}) => {
  const request: StageRequest = {
    model: stage.modelId,
    temperature: stage.temperature,
    messages: [
      { role: 'system', content: stage.systemPrompt },
      { role: 'user', content: buildUserMessage(problem, priorOutputs) },
    ],
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Thinktank Pipeline',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `OpenRouter request failed (${response.status})`)
  }

  const data = (await response.json()) as Record<string, unknown>
  const choice = (data.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]
  const content = choice?.message?.content ?? ''

  const responseMeta: StageResponse = {
    id: typeof data.id === 'string' ? data.id : undefined,
    model: typeof data.model === 'string' ? data.model : undefined,
    created: typeof data.created === 'number' ? data.created : undefined,
    usage: (data.usage as StageResponse['usage']) ?? undefined,
    cost: getCostFromResponse(data),
  }

  return { content, request, responseMeta }
}
