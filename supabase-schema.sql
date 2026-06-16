-- Run this in the Supabase SQL editor to set up the schema

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  description text not null,
  agent_role text not null,
  trainee_role text not null,
  context text not null,
  rubric jsonb not null default '[]',
  success_criteria text not null,
  pass_threshold integer not null default 70
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  scenario_id uuid references scenarios(id) on delete cascade,
  transcript jsonb not null default '[]',
  scores jsonb,
  total_score integer,
  passed boolean,
  feedback text
);

-- Enable RLS (open for now; add auth later)
alter table scenarios enable row level security;
alter table sessions enable row level security;

create policy "allow all scenarios" on scenarios for all using (true) with check (true);
create policy "allow all sessions" on sessions for all using (true) with check (true);
