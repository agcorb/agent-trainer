'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Scenario } from '@/lib/types'

export default function AdminPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scenarios')
      .then(r => r.json())
      .then(data => { setScenarios(data); setLoading(false) })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scenarios</h1>
        <Link
          href="/admin/scenarios/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Scenario
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && scenarios.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">No scenarios yet.</p>
          <Link href="/admin/scenarios/new" className="text-blue-600 underline">Create your first one</Link>
        </div>
      )}

      <div className="grid gap-4">
        {scenarios.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{s.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>{s.rubric?.length ?? 0} criteria</span>
                  <span>Pass: {s.pass_threshold}%</span>
                </div>
              </div>
              <Link
                href={`/train?scenario=${s.id}`}
                className="text-sm text-blue-600 hover:underline whitespace-nowrap ml-4"
              >
                Start session →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
