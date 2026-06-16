'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Session, TranscriptTurn } from '@/lib/types'

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended'

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([])
  const [scoring, setScoring] = useState(false)
  const conversationRef = useRef<unknown>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(setSession)
  }, [sessionId])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const startCall = async () => {
    if (!session) return
    setStatus('connecting')

    try {
      // Get signed URL from server (required for overrides)
      const tokenRes = await fetch('/api/elevenlabs-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const { signed_url, system_prompt, error: tokenError } = await tokenRes.json()
      if (tokenError || !signed_url) {
        console.error('Failed to get signed URL:', tokenError)
        setStatus('idle')
        return
      }

      const { Conversation } = await import('@elevenlabs/client')

      const conversation = await Conversation.startSession({
        signedUrl: signed_url,
        overrides: {
          agent: { prompt: { prompt: system_prompt } },
        },
        onConnect: () => setStatus('active'),
        onDisconnect: () => setStatus('ended'),
        onMessage: (msg: { source: string; message: string }) => {
          const role = msg.source === 'ai' ? 'agent' : 'trainee'
          setTranscript(prev => [...prev, {
            role,
            text: msg.message,
            timestamp: Date.now(),
          }])
        },
        onError: (err: unknown) => {
          console.error('ElevenLabs error:', err)
        },
      })

      conversationRef.current = conversation
    } catch (err) {
      console.error('Failed to start call:', err)
      setStatus('idle')
    }
  }

  const endCall = async () => {
    if (conversationRef.current) {
      const conv = conversationRef.current as { endSession?: () => Promise<void> }
      await conv.endSession?.()
      conversationRef.current = null
    }
    setStatus('ended')

    // Save transcript
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    })
  }

  const getScore = async () => {
    setScoring(true)
    // Ensure transcript is saved first
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    })
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
    router.push(`/results/${sessionId}`)
  }

  if (!session) return <p className="text-gray-500">Loading session...</p>

  const scenario = session.scenario!

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{scenario.title}</h1>
        <p className="text-sm text-gray-500">Your role: {scenario.trainee_role}</p>
      </div>

      {/* Context card */}
      {status === 'idle' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          <div className="font-medium mb-1">Briefing</div>
          {scenario.context}
        </div>
      )}

      {/* Call controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 flex flex-col items-center gap-4">
        {status === 'idle' && (
          <>
            <p className="text-gray-600 text-sm text-center">Ready when you are. Click Start to begin the conversation.</p>
            <button
              onClick={startCall}
              className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              Start Call
            </button>
          </>
        )}

        {status === 'connecting' && (
          <p className="text-gray-500 text-sm animate-pulse">Connecting...</p>
        )}

        {status === 'active' && (
          <>
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
            <button
              onClick={endCall}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              End Call
            </button>
          </>
        )}

        {status === 'ended' && (
          <>
            <p className="text-gray-600 text-sm">Call ended. Ready to see your score?</p>
            <button
              onClick={getScore}
              disabled={scoring}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {scoring ? 'Scoring...' : 'Get My Score →'}
            </button>
          </>
        )}
      </div>

      {/* Live transcript */}
      {transcript.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
          <div className="text-xs font-medium text-gray-400 uppercase mb-3">Transcript</div>
          {transcript.map((turn, i) => (
            <div key={i} className={`mb-3 flex ${turn.role === 'trainee' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  turn.role === 'trainee'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-xs opacity-60 mb-0.5">
                  {turn.role === 'trainee' ? 'You' : 'Customer'}
                </div>
                {turn.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}
    </div>
  )
}
