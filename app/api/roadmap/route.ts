import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/lib/prompt'
import { RoadmapRequest } from '@/lib/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body: RoadmapRequest = await req.json()
    const { declaration, worldview } = body

    if (!declaration || declaration.trim().length < 5) {
      return NextResponse.json({ error: 'Declaration is too short.' }, { status: 400 })
    }

    if (!worldview) {
      return NextResponse.json({ error: 'Worldview is required.' }, { status: 400 })
    }

    const prompt = buildPrompt({ declaration: declaration.trim(), worldview })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()
    const roadmap = JSON.parse(clean)

    return NextResponse.json({ roadmap })

  } catch (error: unknown) {
    console.error('Roadmap API error:', error)
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
