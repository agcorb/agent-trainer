import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Trainer",
  description: "Sales & CS training with AI voice agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className} style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <nav style={{ background: "var(--text-primary)", borderBottom: "1px solid #1e293b" }} className="px-6 py-2 flex items-center gap-8">
          <Link href="/">
            <Image src="/logo.svg" alt="Agent Trainer" width={340} height={102} priority />
          </Link>
          <div className="flex gap-6 ml-4">
            <Link href="/train" style={{ color: "var(--accent-blue)" }} className="text-sm font-semibold hover:opacity-80 transition-opacity">
              Train
            </Link>
            <Link href="/admin" style={{ color: "#E9E6E7" }} className="text-sm font-medium hover:opacity-80 transition-opacity">
              Admin
            </Link>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
