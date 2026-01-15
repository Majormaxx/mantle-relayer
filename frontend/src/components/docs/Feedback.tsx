'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Send, X, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedbackProps {
  className?: string;
}

type FeedbackState = 'idle' | 'positive' | 'negative' | 'form' | 'submitted';

export function PageFeedback({ className }: FeedbackProps) {
  const pathname = usePathname();
  const [state, setState] = useState<FeedbackState>('idle');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const handlePositive = () => {
    // Save to localStorage for now (can be sent to backend later)
    saveFeedback('positive');
    setState('positive');
    
    // Reset after a delay
    setTimeout(() => setState('submitted'), 2000);
  };

  const handleNegative = () => {
    setState('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFeedback('negative', { feedback, email });
    setState('submitted');
    setFeedback('');
    setEmail('');
  };

  const saveFeedback = (type: 'positive' | 'negative', data?: { feedback: string; email: string }) => {
    const feedbackEntry = {
      page: pathname,
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('docs-feedback') || '[]');
    existing.push(feedbackEntry);
    localStorage.setItem('docs-feedback', JSON.stringify(existing));
    
    // TODO: Send to backend when available
    console.log('Feedback saved:', feedbackEntry);
  };

  const handleCancel = () => {
    setState('idle');
    setFeedback('');
    setEmail('');
  };

  if (state === 'submitted') {
    return (
      <div
        className={cn(
          'mt-12 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-4 text-sm',
          className
        )}
      >
        <Check className="h-4 w-4 text-emerald-400" />
        <span className="text-zinc-400">Thank you for your feedback!</span>
      </div>
    );
  }

  if (state === 'positive') {
    return (
      <div
        className={cn(
          'mt-12 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-sm',
          className
        )}
      >
        <ThumbsUp className="h-4 w-4 text-emerald-400" />
        <span className="text-emerald-400">Glad this was helpful!</span>
      </div>
    );
  }

  if (state === 'form') {
    return (
      <div
        className={cn(
          'mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6',
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-zinc-400" />
            <h4 className="font-medium text-zinc-200">What can we improve?</h4>
          </div>
          <button
            onClick={handleCancel}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us how we can improve this page..."
              className={cn(
                'w-full h-24 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200',
                'placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                'resize-none'
              )}
              required
            />
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional) - if you'd like a response"
              className={cn(
                'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200',
                'placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-2">
              <Send className="h-3.5 w-3.5" />
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mt-12 flex flex-col items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-6',
        className
      )}
    >
      <p className="text-sm text-zinc-400">Was this page helpful?</p>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handlePositive}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300',
            'transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400'
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </button>
        
        <button
          onClick={handleNegative}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300',
            'transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </button>
      </div>
    </div>
  );
}
