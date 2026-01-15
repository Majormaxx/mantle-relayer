'use client';

import { useState } from 'react';
import { 
  Gamepad2, 
  Image, 
  Landmark, 
  Users,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const useCases = [
  {
    id: 'gaming',
    label: 'Gaming',
    icon: Gamepad2,
    quote: 'Perfect for in-game transactions',
    description: 'Eliminate friction and let players focus on gameplay, not gas fees.',
    examples: [
      'In-game item purchases',
      'Achievement minting as NFTs',
      'Player-to-player trades',
      'Reward distributions',
    ],
  },
  {
    id: 'nfts',
    label: 'NFTs',
    icon: Image,
    quote: 'Seamless NFT minting experience',
    description: 'Remove the biggest barrier to NFT adoption for new collectors.',
    examples: [
      'Free mint campaigns',
      'Gasless NFT transfers',
      'Lazy minting for creators',
      'Airdrop distributions',
    ],
  },
  {
    id: 'defi',
    label: 'DeFi',
    icon: Landmark,
    quote: 'Onboard users to DeFi easily',
    description: 'Help users take their first DeFi steps without worrying about gas.',
    examples: [
      'First-time deposits',
      'Token approvals',
      'Small trades subsidized',
      'Yield farming entries',
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    quote: 'Frictionless social interactions',
    description: 'Make on-chain social actions feel as smooth as Web2.',
    examples: [
      'Posting and reactions',
      'Tipping creators',
      'Following and subscribing',
      'NFT gifts to friends',
    ],
  },
];

export function UseCasesSection() {
  const [activeTab, setActiveTab] = useState('gaming');
  const activeCase = useCases.find((uc) => uc.id === activeTab)!;
  const ActiveIcon = activeCase.icon;

  return (
    <section className="py-24 px-4 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Power Any Use Case
          </h2>
          <p className="text-lg text-zinc-400">
            See how teams are using gasless transactions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex gap-1 p-1 bg-zinc-800/50 rounded-lg">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              const isActive = activeTab === useCase.id;
              
              return (
                <button
                  key={useCase.id}
                  onClick={() => setActiveTab(useCase.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-zinc-700/50 rounded-md" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{useCase.label}</span>
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div
          key={activeTab}
          className="animate-in fade-in duration-300"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Icon and Quote */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 mb-6">
                <ActiveIcon className="w-10 h-10 text-indigo-400" />
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-semibold text-white mb-4">
                &ldquo;{activeCase.quote}&rdquo;
              </blockquote>
              
              <p className="text-zinc-400 text-lg">
                {activeCase.description}
              </p>

              {/* Placeholder for project logo */}
              <div className="mt-8 flex items-center gap-3 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center">
                  <span className="text-xs text-zinc-500">◆</span>
                </div>
                <span className="text-sm text-zinc-500">
                  Used by teams building on Mantle
                </span>
              </div>
            </div>

            {/* Right - Examples */}
            <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/50">
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                Example Use Cases
              </h4>
              <ul className="space-y-3">
                {activeCase.examples.map((example, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-zinc-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
