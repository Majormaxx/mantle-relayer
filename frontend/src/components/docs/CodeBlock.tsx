'use client';

import { useState, useRef, isValidElement, type ReactNode, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy, Terminal, FileCode } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: string; // e.g., "1,3-5,10"
  diff?: boolean;
}

// Parse highlight lines string like "1,3-5,10" into Set of line numbers
function parseHighlightLines(highlightLines?: string): Set<number> {
  const lines = new Set<number>();
  if (!highlightLines) return lines;
  
  const parts = highlightLines.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Number(startStr);
      const end = Number(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          lines.add(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num)) {
        lines.add(num);
      }
    }
  }
  return lines;
}

// Extract text content from React children
function extractTextContent(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('');
  }
  
  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return extractTextContent(element.props.children);
  }
  
  return '';
}

export function CodeBlock({
  children,
  className,
  filename,
  language,
  showLineNumbers = false,
  highlightLines,
  diff = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    const text = codeRef.current?.textContent || '';
    // Remove line numbers and diff markers for copying
    const cleanText = text
      .split('\n')
      .map(line => {
        if (diff) {
          return line.replace(/^[+-]\s?/, '');
        }
        return line;
      })
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(cleanText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageIcon = () => {
    if (language === 'bash' || language === 'shell' || language === 'terminal') {
      return <Terminal className="h-4 w-4" />;
    }
    return <FileCode className="h-4 w-4" />;
  };

  const getLanguageLabel = () => {
    const labels: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript',
      typescript: 'TypeScript',
      js: 'JavaScript',
      jsx: 'JavaScript',
      javascript: 'JavaScript',
      sol: 'Solidity',
      solidity: 'Solidity',
      bash: 'Terminal',
      shell: 'Terminal',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
      md: 'Markdown',
      markdown: 'Markdown',
    };
    return labels[language || ''] || language;
  };

  const highlightedLines = parseHighlightLines(highlightLines);

  // Process content for line numbers and highlighting
  const renderContent = () => {
    const textContent = extractTextContent(children);
    const lines = textContent.split('\n');
    
    if (!showLineNumbers && !highlightLines && !diff) {
      return children;
    }

    return (
      <div className="relative">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isHighlighted = highlightedLines.has(lineNumber);
          const isDiffAdd = diff && line.startsWith('+');
          const isDiffRemove = diff && line.startsWith('-');
          
          return (
            <div
              key={index}
              className={cn(
                'flex',
                isHighlighted && 'bg-indigo-500/10 -mx-4 px-4',
                isDiffAdd && 'bg-emerald-500/10 -mx-4 px-4',
                isDiffRemove && 'bg-red-500/10 -mx-4 px-4'
              )}
            >
              {showLineNumbers && (
                <span className="mr-4 inline-block w-8 flex-shrink-0 select-none text-right text-zinc-600">
                  {lineNumber}
                </span>
              )}
              <span className={cn(
                'flex-1',
                isDiffAdd && 'text-emerald-400',
                isDiffRemove && 'text-red-400'
              )}>
                {diff && (isDiffAdd || isDiffRemove) ? (
                  <>
                    <span className={cn(
                      'inline-block w-4',
                      isDiffAdd && 'text-emerald-500',
                      isDiffRemove && 'text-red-500'
                    )}>
                      {line.charAt(0)}
                    </span>
                    {line.slice(1)}
                  </>
                ) : (
                  line
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('group relative my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950', className)}>
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {getLanguageIcon()}
            <span>{filename || getLanguageLabel()}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code content */}
      <div
        ref={codeRef}
        className={cn(
          'overflow-x-auto p-4 text-sm font-mono',
          '[&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent'
        )}
      >
        {renderContent()}
      </div>

      {/* Copy button for blocks without header */}
      {!filename && !language && (
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 rounded-md p-2 text-zinc-500 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

// Terminal component for shell commands
interface TerminalProps {
  children: React.ReactNode;
  output?: boolean;
  className?: string;
}

export function TerminalBlock({ children, output, className }: TerminalProps) {
  const [copied, setCopied] = useState(false);
  const textContent = extractTextContent(children);

  const copyToClipboard = async () => {
    // Only copy commands, not output or prompts
    const commands = textContent
      .split('\n')
      .filter(line => line.startsWith('$'))
      .map(line => line.replace(/^\$\s*/, ''))
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(commands || textContent.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('group relative my-6 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Terminal className="h-4 w-4" />
          <span>Terminal</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal content */}
      <div className="overflow-x-auto p-4 font-mono text-sm">
        {textContent.split('\n').map((line, index) => {
          const isCommand = line.startsWith('$');
          const isOutput = output || (!isCommand && line.trim());
          
          return (
            <div key={index} className="flex">
              {isCommand ? (
                <>
                  <span className="mr-2 text-emerald-500">$</span>
                  <span className="text-zinc-200">{line.slice(1).trim()}</span>
                </>
              ) : isOutput ? (
                <span className="text-zinc-500">{line}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pre component wrapper for MDX
export function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <CodeBlock>
      <pre {...props}>{children}</pre>
    </CodeBlock>
  );
}
