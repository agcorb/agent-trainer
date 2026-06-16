'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Session, CriterionScore } from '@/lib/types'

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(setSession)
  }, [sessionId])

  if (!session) return <p className="text-gray-500">Loading results...</p>
  if (!session.scores) return <p className="text-gray-500">Scores not available yet.</p>

  const passed = session.passed
  const total = session.total_score ?? 0

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Session Results</h1>
        <p className="text-sm text-gray-500">{(session.scenario as { title?: string })?.title}</p>
      </div>

      {/* Overall score */}
      <div className={`rounded-xl p-6 mb-6 flex items-center gap-6 ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`text-5xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {total}
        </div>
        <div>
          <div className={`text-lg font-semibold ${passed ? 'text-green-800' : 'text-red-800'}`}>
            {passed ? 'Passed' : 'Needs Work'}
          </div>
          <div className="text-sm text-gray-600 mt-0.5">out of 100</div>
        </div>
      </div>

      {/* Feedback */}
      {session.feedback && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="text-xs font-medium text-gray-400 uppercase mb-2">Coach Feedback</div>
          <p className="text-sm text-gray-700 leading-relaxed">{session.feedback}</p>
        </div>
      )}

      {/* Per-criterion breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="text-xs font-medium text-gray-400 uppercase mb-4">Criterion Breakdown</div>
        <div className="flex flex-col gap-4">
          {session.scores.map((c: CriterionScore) => (
            <div key={c.criterion_id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{c.criterion_name}</span>
                <span className="text-sm font-bold text-gray-900">{c.score}/10</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full ${c.score >= 7 ? 'bg-green-500' : c.score >= 5 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${c.score * 10}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{c.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/train"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Practice Again
        </Link>
        <Link
          href="/admin"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          Manage Scenarios
        </Link>
      </div>
    </div>
  )
}
