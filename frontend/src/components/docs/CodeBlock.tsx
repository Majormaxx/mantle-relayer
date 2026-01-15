'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy, Terminal, FileCode } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  className,
  filename,
  language,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const codeElement = document.querySelector(`[data-code-block="${filename || 'default'}"]`);
    const text = codeElement?.textContent || '';
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageIcon = () => {
    if (language === 'bash' || language === 'shell') {
      return <Terminal className="h-4 w-4" />;
    }
    return <FileCode className="h-4 w-4" />;
  };

  return (
    <div className={cn('group relative my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950', className)}>
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {getLanguageIcon()}
            <span>{filename || language}</span>
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
        data-code-block={filename || 'default'}
        className={cn(
          'overflow-x-auto p-4 text-sm',
          showLineNumbers && 'pl-12',
          '[&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent'
        )}
      >
        {children}
      </div>

      {/* Copy button for blocks without header */}
      {!filename && !language && (
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 rounded-md p-2 text-zinc-500 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
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

// Pre component wrapper for MDX
export function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <CodeBlock>
      <pre {...props}>{children}</pre>
    </CodeBlock>
  );
}
