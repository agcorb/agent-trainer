'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scenario } from '@/lib/types'
import { Suspense } from 'react'

function TrainSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselected = searchParams.get('scenario')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState(preselected ?? '')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetch('/api/scenarios').then(r => r.json()).then(setScenarios)
  }, [])

  const start = async () => {
    if (!selected) return
    setStarting(true)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: selected }),
    })
    const session = await res.json()
    router.push(`/train/${session.id}`)
  }

  const scenario = scenarios.find(s => s.id === selected)

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose a Scenario</h1>
      <p className="text-gray-500 text-sm mb-6">Select the use case you want to practice.</p>

      <div className="flex flex-col gap-3 mb-6">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`text-left border rounded-lg p-4 transition-colors ${
              selected === s.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">{s.title}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.description}</div>
          </button>
        ))}
      </div>

      {scenario && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm">
          <div className="font-medium text-amber-900 mb-1">Your role: {scenario.trainee_role}</div>
          <div className="text-amber-800">{scenario.context}</div>
        </div>
      )}

      <button
        onClick={start}
        disabled={!selected || starting}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {starting ? 'Starting...' : 'Start Session →'}
      </button>
    </div>
  )
}

export default function TrainPage() {
  return (
    <Suspense>
      <TrainSelector />
    </Suspense>
  )
}
