import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
  const systemPrompt = `You are playing the role of: ${scenario.agent_role}.

Context: ${scenario.context}

The person you are speaking with is playing the role of: ${scenario.trainee_role}.

Stay in character throughout. Be realistic and react naturally. Keep responses conversational and concise — this is a phone call, not an essay. Do not break character or reveal you are an AI.`

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!
  const apiKey = process.env.ELEVENLABS_API_KEY!

  // Update the agent's system prompt directly via API
  const patchRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
    {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: { prompt: systemPrompt },
          },
        },
      }),
    }
  )

  if (!patchRes.ok) {
    const text = await patchRes.text()
    return NextResponse.json({ error: `ElevenLabs patch error: ${text}` }, { status: 500 })
  }

  // Now get a signed URL for the updated agent
  const tokenRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: { 'xi-api-key': apiKey },
    }
  )

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return NextResponse.json({ error: `ElevenLabs error: ${text}` }, { status: 500 })
  }

  const { signed_url } = await tokenRes.json()
  return NextResponse.json({ signed_url })
}
