export interface RubricCriterion {
  id: string
  name: string
  description: string
  weight: number // 1-10
  examples?: string
}

export interface Scenario {
  id: string
  created_at: string
  title: string
  description: string
  agent_role: string        // what the AI plays (e.g. "a frustrated homeowner")
  trainee_role: string      // what the human plays (e.g. "Roof Maxx sales rep")
  context: string           // background info shown to trainee before session
  rubric: RubricCriterion[]
  success_criteria: string  // plain text: what passing looks like
  pass_threshold: number    // 0-100 minimum score to pass
}

export interface TranscriptTurn {
  role: 'agent' | 'trainee'
  text: string
  timestamp: number
}

export interface Session {
  id: string
  created_at: string
  scenario_id: string
  scenario?: Scenario
  transcript: TranscriptTurn[]
  scores: CriterionScore[] | null
  total_score: number | null
  passed: boolean | null
  feedback: string | null
}

export interface CriterionScore {
  criterion_id: string
  criterion_name: string
  score: number   // 0-10
  weight: number
  notes: string
}
