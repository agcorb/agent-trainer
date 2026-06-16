import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center">
      <div>
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
          Welcome to Agent Trainer
        </h1>
        <p className="max-w-md text-base" style={{ color: "var(--text-secondary)" }}>
          Practice real sales and customer service conversations with an AI customer. Get scored on every session.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/train"
          className="px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}
        >
          Start Training
        </Link>
        <Link
          href="/admin"
          className="px-8 py-3 rounded-lg font-medium border transition-colors hover:opacity-80"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          Manage Scenarios
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-4 max-w-2xl w-full">
        {[
          { label: "Upload Scenarios", desc: "Define use cases, roles, and context for each training session." },
          { label: "Practice Live", desc: "Talk with an AI customer in real time using your microphone." },
          { label: "Get Scored", desc: "Claude evaluates your performance against the rubric and gives feedback." },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-5 text-left" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--accent-blue)" }}>{card.label}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
