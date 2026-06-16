import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { TranscriptTurn, RubricCriterion, CriterionScore } from '@/lib/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { session_id } = await req.json()

  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('*, scenario:scenarios(*)')
    .eq('id', session_id)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const scenario = session.scenario
  const transcript: TranscriptTurn[] = session.transcript
  const rubric: RubricCriterion[] = scenario.rubric

  const traineeLines = transcript
    .filter((t: TranscriptTurn) => t.role === 'trainee')
    .map((t: TranscriptTurn) => t.text)
    .join('\n')

  const fullTranscript = transcript
    .map((t: TranscriptTurn) => `${t.role === 'agent' ? 'CUSTOMER' : 'TRAINEE'}: ${t.text}`)
    .join('\n')

  const prompt = `You are an expert sales and customer service trainer. Evaluate the TRAINEE's performance in this conversation.

SCENARIO: ${scenario.title}
TRAINEE ROLE: ${scenario.trainee_role}
CUSTOMER ROLE: ${scenario.agent_role}

SUCCESS CRITERIA:
${scenario.success_criteria}

RUBRIC CRITERIA:
${rubric.map((c: RubricCriterion) => `- ${c.name} (weight: ${c.weight}/10): ${c.description}${c.examples ? `\n  Examples: ${c.examples}` : ''}`).join('\n')}

FULL TRANSCRIPT:
${fullTranscript}

Score ONLY the trainee's performance. Return a JSON object with this exact shape:
{
  "scores": [
    {
      "criterion_id": "<id>",
      "criterion_name": "<name>",
      "score": <0-10>,
      "weight": <weight>,
      "notes": "<1-2 sentences of specific feedback>"
    }
  ],
  "total_score": <0-100 weighted average>,
  "passed": <true|false based on pass_threshold of ${scenario.pass_threshold}>,
  "feedback": "<3-4 sentence overall coaching summary with top 1-2 improvements>"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse scoring response' }, { status: 500 })
  }

  const result = JSON.parse(jsonMatch[0])

  await supabaseAdmin
    .from('sessions')
    .update({
      scores: result.scores,
      total_score: result.total_score,
      passed: result.passed,
      feedback: result.feedback,
    })
    .eq('id', session_id)

  return NextResponse.json(result)
}
