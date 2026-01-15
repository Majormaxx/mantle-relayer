'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const benefits = [
  'Works with any React framework',
  'Full TypeScript support',
  'Handles all complexity for you',
  'Users sign, we relay',
];

const codeExample = `import { MantleRelayer } from '@mantle/relayer-sdk';

// Initialize the SDK with your Paymaster
const relayer = new MantleRelayer({
  paymasterId: 'your-paymaster-id',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
});

// Execute a gasless transaction
const result = await relayer.execute({
  target: contractAddress,
  data: encodedFunctionData,
  userAddress: connectedWallet,
});

console.log('Transaction hash:', result.txHash);`;

export function CodePreviewSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeExample);
      setCopied(true);
      toast({
        title: 'Code copied to clipboard!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Integrate in Minutes
          </h2>
          <p className="text-lg text-zinc-400">
            Simple API, powerful results
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-zinc-300"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <Button asChild className="gap-2">
              <Link href="/docs">
                View Full Documentation
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Right Side - Code Block */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-xl blur-sm opacity-25" />
            <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
              {/* Code Block Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500 ml-2">
                    TypeScript
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code>
                    {codeExample.split('\n').map((line, index) => (
                      <div key={index} className="flex">
                        <span className="select-none text-zinc-600 w-8 text-right pr-4 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-zinc-300">
                          {highlightSyntax(line)}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function highlightSyntax(line: string): React.ReactNode {
  // Handle empty lines
  if (line.trim() === '') {
    return <span>&nbsp;</span>;
  }

  // Apply simple coloring for key elements
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Import statements
  if (line.startsWith('import')) {
    const match = line.match(/^(import)(\s+\{)([^}]+)(\}\s+from\s+)('[^']+')/);
    if (match) {
      parts.push(<span key={key++} className="text-purple-400">{match[1]}</span>);
      parts.push(<span key={key++}>{match[2]}</span>);
      parts.push(<span key={key++} className="text-yellow-400">{match[3]}</span>);
      parts.push(<span key={key++}>{match[4]}</span>);
      parts.push(<span key={key++} className="text-green-400">{match[5]}</span>);
      parts.push(<span key={key++}>{line.slice(match[0].length)}</span>);
      return <>{parts}</>;
    }
  }

  // Comments
  if (line.trim().startsWith('//')) {
    return <span className="text-zinc-500">{line}</span>;
  }

  // const declarations
  if (line.includes('const ')) {
    const match = line.match(/^(\s*)(const)(\s+)(\w+)/);
    if (match) {
      parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<span key={key++} className="text-purple-400">{match[2]}</span>);
      parts.push(<span key={key++}>{match[3]}</span>);
      parts.push(<span key={key++} className="text-sky-400">{match[4]}</span>);
      remaining = line.slice(match[0].length);
    }
  }

  // await and new keywords
  remaining = remaining.replace(/\b(await|new)\b/g, '<AWAIT>$1</AWAIT>');

  // Strings
  const stringParts = remaining.split(/('[^']*')/g);
  for (const part of stringParts) {
    if (part.startsWith("'") && part.endsWith("'")) {
      parts.push(<span key={key++} className="text-green-400">{part}</span>);
    } else if (part.includes('<AWAIT>')) {
      const subParts = part.split(/<AWAIT>|<\/AWAIT>/g);
      for (const subPart of subParts) {
        if (subPart === 'await' || subPart === 'new') {
          parts.push(<span key={key++} className="text-purple-400">{subPart}</span>);
        } else if (subPart) {
          parts.push(<span key={key++}>{subPart}</span>);
        }
      }
    } else if (part) {
      parts.push(<span key={key++}>{part}</span>);
    }
  }

  return parts.length > 0 ? <>{parts}</> : line;
}
