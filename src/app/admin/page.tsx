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
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Scenarios</h1>
        <Link
          href="/admin/scenarios/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}
        >
          + New Scenario
        </Link>
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading...</p>}

      {!loading && scenarios.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <p className="mb-4">No scenarios yet.</p>
          <Link href="/admin/scenarios/new" style={{ color: "var(--accent-blue)" }} className="underline">Create your first one</Link>
        </div>
      )}

      <div className="grid gap-4">
        {scenarios.map(s => (
          <div key={s.id} className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.title}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{s.description}</p>
                <div className="flex gap-3 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{s.rubric?.length ?? 0} criteria</span>
                  <span>Pass: {s.pass_threshold}%</span>
                </div>
              </div>
              <Link
                href={`/train?scenario=${s.id}`}
                className="text-sm font-medium whitespace-nowrap ml-4 hover:opacity-80"
                style={{ color: "var(--accent-blue)" }}
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
