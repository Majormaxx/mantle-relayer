import Link from 'next/link';
import { ArrowRight, Rocket, BookOpen, Box, FileCode, Settings } from 'lucide-react';
import { DocCardGrid, DocCard } from '@/components/docs';

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-400">
          <Rocket className="h-4 w-4" />
          Getting Started
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 lg:text-5xl">
          Mantle Gasless Relayer
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          Enable gasless transactions on Mantle Network. Sponsor gas fees for your users 
          and provide a seamless Web3 experience.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs/getting-started/quickstart"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Quick Start
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/docs/sdk/installation"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Install SDK
        </Link>
        <a
          href="https://github.com/mantle-relayer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          View on GitHub
        </a>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-100">Why Mantle Relayer?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <span className="text-xl">⛽</span>
            </div>
            <h3 className="font-semibold text-zinc-200">Gasless Transactions</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Users don&apos;t need MNT to interact with your dApp. You sponsor the gas.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <span className="text-xl">🔒</span>
            </div>
            <h3 className="font-semibold text-zinc-200">Secure & Permissionless</h3>
            <p className="mt-1 text-sm text-zinc-400">
              EIP-712 signed transactions. No private keys exposed. Fully on-chain.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-zinc-200">Full Analytics</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Track usage, monitor spending, and analyze user behavior in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-100">Explore the Docs</h2>
        <DocCardGrid>
          <DocCard
            title="Getting Started"
            description="Learn the basics and set up your first paymaster in minutes."
            href="/docs/getting-started"
            icon={<Rocket className="h-5 w-5" />}
          />
          <DocCard
            title="Guides"
            description="Step-by-step tutorials for common use cases and integrations."
            href="/docs/guides"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <DocCard
            title="SDK Reference"
            description="Complete TypeScript SDK documentation with examples."
            href="/docs/sdk"
            icon={<Box className="h-5 w-5" />}
          />
          <DocCard
            title="API Reference"
            description="RESTful API endpoints for the relayer backend."
            href="/docs/api-reference"
            icon={<FileCode className="h-5 w-5" />}
          />
          <DocCard
            title="Smart Contracts"
            description="Technical documentation for on-chain contracts."
            href="/docs/contracts"
            icon={<Settings className="h-5 w-5" />}
          />
        </DocCardGrid>
      </div>

      {/* Architecture Overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-100">How It Works</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <ol className="space-y-4 text-sm text-zinc-400">
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                1
              </span>
              <div>
                <p className="font-medium text-zinc-200">Create a Paymaster</p>
                <p className="mt-1">Deploy your own paymaster contract to sponsor transactions.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                2
              </span>
              <div>
                <p className="font-medium text-zinc-200">Fund & Configure</p>
                <p className="mt-1">Add MNT and whitelist the contracts you want to sponsor.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                3
              </span>
              <div>
                <p className="font-medium text-zinc-200">Integrate the SDK</p>
                <p className="mt-1">Add a few lines of code to your dApp using our TypeScript SDK.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                4
              </span>
              <div>
                <p className="font-medium text-zinc-200">Go Gasless!</p>
                <p className="mt-1">Your users sign transactions, you pay the gas. Simple as that.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Ready to get started?</h3>
            <p className="text-sm text-zinc-400">
              Create your first paymaster and enable gasless transactions in minutes.
            </p>
          </div>
          <Link
            href="/docs/getting-started/quickstart"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
