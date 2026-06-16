import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Agent Trainer</h1>
      <p className="text-gray-600 max-w-md">
        Practice sales and customer service conversations with an AI customer, then get scored on your performance.
      </p>
      <div className="flex gap-4">
        <Link
          href="/train"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Training
        </Link>
        <Link
          href="/admin"
          className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Manage Scenarios
        </Link>
      </div>
    </div>
  );
}
