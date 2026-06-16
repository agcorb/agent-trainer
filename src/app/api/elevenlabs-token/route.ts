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

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        overrides: {
          agent: {
            prompt: { prompt: systemPrompt },
          },
        },
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `ElevenLabs error: ${text}` }, { status: 500 })
  }

  const { signed_url } = await res.json()
  return NextResponse.json({ signed_url })
}
