'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RubricCriterion } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export default function NewScenarioPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    agent_role: '',
    trainee_role: '',
    context: '',
    success_criteria: '',
    pass_threshold: 70,
  })
  const [rubric, setRubric] = useState<RubricCriterion[]>([
    { id: uuidv4(), name: '', description: '', weight: 5 },
  ])

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string | number) => {
    setRubric(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const addCriterion = () => {
    setRubric(prev => [...prev, { id: uuidv4(), name: '', description: '', weight: 5 }])
  }

  const removeCriterion = (index: number) => {
    setRubric(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rubric }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      alert('Failed to save scenario.')
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, multiline = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={form[key] as string}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          required
        />
      ) : (
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form[key] as string}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          required
        />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Scenario</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {field('Title', 'title')}
        {field('Description (shown in library)', 'description')}
        {field('Trainee Role (what the human plays)', 'trainee_role')}
        {field('Agent Role (what the AI plays)', 'agent_role')}
        {field('Context (shown to trainee before session starts)', 'context', true)}
        {field('Success Criteria (plain English — what does passing look like?)', 'success_criteria', true)}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pass Threshold (%)</label>
          <input
            type="number"
            min={0} max={100}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.pass_threshold}
            onChange={e => setForm(prev => ({ ...prev, pass_threshold: parseInt(e.target.value) }))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Scoring Rubric</label>
            <button type="button" onClick={addCriterion} className="text-sm text-blue-600 hover:underline">
              + Add Criterion
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {rubric.map((c, i) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    placeholder="Criterion name"
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                    value={c.name}
                    onChange={e => updateCriterion(i, 'name', e.target.value)}
                    required
                  />
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-gray-500">Weight</label>
                    <input
                      type="number" min={1} max={10}
                      className="w-14 border border-gray-300 rounded px-2 py-1.5 text-sm"
                      value={c.weight}
                      onChange={e => updateCriterion(i, 'weight', parseInt(e.target.value))}
                    />
                  </div>
                  {rubric.length > 1 && (
                    <button type="button" onClick={() => removeCriterion(i)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
                  )}
                </div>
                <input
                  placeholder="Description — what does scoring well on this look like?"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                  value={c.description}
                  onChange={e => updateCriterion(i, 'description', e.target.value)}
                  required
                />
                <input
                  placeholder="Examples (optional)"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                  value={c.examples ?? ''}
                  onChange={e => updateCriterion(i, 'examples', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Scenario'}
          </button>
          <button type="button" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
