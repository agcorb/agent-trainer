'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Scenario, RubricCriterion } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'

export default function EditScenarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    agent_role: '',
    trainee_role: '',
    context: '',
    success_criteria: '',
    pass_threshold: 70,
  })
  const [rubric, setRubric] = useState<RubricCriterion[]>([])

  useEffect(() => {
    fetch(`/api/scenarios/${id}`)
      .then(r => r.json())
      .then((s: Scenario) => {
        setForm({
          title: s.title,
          description: s.description,
          agent_role: s.agent_role,
          trainee_role: s.trainee_role,
          context: s.context,
          success_criteria: s.success_criteria,
          pass_threshold: s.pass_threshold,
        })
        setRubric(s.rubric ?? [])
        setLoading(false)
      })
  }, [id])

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string | number) => {
    setRubric(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const addCriterion = () => {
    setRubric(prev => [...prev, { id: uuidv4(), name: '', description: '', weight: 5 }])
  }

  const removeCriterion = (index: number) => {
    setRubric(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/scenarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rubric }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      alert('Failed to save.')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this scenario? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
    router.push('/admin')
  }

  const field = (label: string, key: keyof typeof form, multiline = false, hint?: string) => (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      {hint && <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {multiline ? (
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          rows={5}
          value={form[key] as string}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          required
        />
      ) : (
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          value={form[key] as string}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          required
        />
      )}
    </div>
  )

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
          ← Scenarios
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Scenario</h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* Basic info */}
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Basic Info</div>
          {field('Title', 'title')}
          {field('Description', 'description', false, 'Shown in the scenario library.')}
        </div>

        {/* Roles */}
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Roles</div>
          {field('Trainee Role', 'trainee_role', false, 'What the human trainee is playing.')}
          {field('Agent Role (AI Customer)', 'agent_role', true, 'Full persona description for the AI — personality, name, situation, how they behave.')}
        </div>

        {/* Context & criteria */}
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Context & Success</div>
          {field('Context', 'context', true, 'Shown to the trainee before the session starts. Sets the scene.')}
          {field('Success Criteria', 'success_criteria', true, 'Plain English — what does passing look like?')}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Pass Threshold (%)</label>
            <input
              type="number" min={0} max={100}
              className="w-24 border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              value={form.pass_threshold}
              onChange={e => setForm(prev => ({ ...prev, pass_threshold: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        {/* Rubric */}
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scoring Rubric</div>
            <button type="button" onClick={addCriterion} className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--accent-blue)' }}>
              + Add Criterion
            </button>
          </div>
          {rubric.map((c, i) => (
            <div key={c.id} className="rounded-lg p-4 flex flex-col gap-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div className="flex gap-2 items-center">
                <input
                  placeholder="Criterion name"
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  value={c.name}
                  onChange={e => updateCriterion(i, 'name', e.target.value)}
                  required
                />
                <div className="flex items-center gap-1.5">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Weight</label>
                  <input
                    type="number" min={1} max={10}
                    className="w-14 border rounded px-2 py-1.5 text-sm text-center"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    value={c.weight}
                    onChange={e => updateCriterion(i, 'weight', parseInt(e.target.value))}
                  />
                </div>
                {rubric.length > 1 && (
                  <button type="button" onClick={() => removeCriterion(i)} className="text-sm px-1 hover:opacity-70" style={{ color: '#ef4444' }}>✕</button>
                )}
              </div>
              <textarea
                placeholder="Description — what does scoring well look like?"
                className="w-full border rounded px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                rows={2}
                value={c.description}
                onChange={e => updateCriterion(i, 'description', e.target.value)}
                required
              />
              <input
                placeholder="Examples (optional)"
                className="w-full border rounded px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                value={c.examples ?? ''}
                onChange={e => updateCriterion(i, 'examples', e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #2563EB)' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-lg font-medium border text-sm hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
            >
              Cancel
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm hover:opacity-70 disabled:opacity-50"
            style={{ color: '#ef4444' }}
          >
            {deleting ? 'Deleting...' : 'Delete Scenario'}
          </button>
        </div>
      </form>
    </div>
  )
}
