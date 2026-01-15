import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Method badge component for API endpoints
interface MethodBadgeProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
  PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        methodColors[method]
      )}
    >
      {method}
    </span>
  );
}

// API Endpoint documentation component
interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  children?: React.ReactNode;
}

export function ApiEndpoint({ method, path, description, children }: ApiEndpointProps) {
  return (
    <div className="my-6 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <MethodBadge method={method} />
        <code className="text-sm font-medium text-zinc-200">{path}</code>
      </div>

      {/* Description */}
      {description && (
        <p className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
          {description}
        </p>
      )}

      {/* Content (request/response examples) */}
      {children && <div className="p-4">{children}</div>}
    </div>
  );
}

// Request/Response section
interface ApiSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ApiSection({ title, children }: ApiSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
      {children}
    </div>
  );
}

// Parameter table
interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface ParameterTableProps {
  parameters: Parameter[];
}

export function ParameterTable({ parameters }: ParameterTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left">
            <th className="px-3 py-2 font-medium text-zinc-400">Name</th>
            <th className="px-3 py-2 font-medium text-zinc-400">Type</th>
            <th className="px-3 py-2 font-medium text-zinc-400">Required</th>
            <th className="px-3 py-2 font-medium text-zinc-400">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="border-b border-zinc-800/50">
              <td className="px-3 py-2">
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-indigo-400">
                  {param.name}
                </code>
              </td>
              <td className="px-3 py-2 text-zinc-400">{param.type}</td>
              <td className="px-3 py-2">
                {param.required ? (
                  <span className="text-amber-400">Yes</span>
                ) : (
                  <span className="text-zinc-500">No</span>
                )}
              </td>
              <td className="px-3 py-2 text-zinc-400">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card component for feature links
interface DocCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export function DocCard({ title, description, href, icon }: DocCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-200 group-hover:text-indigo-400">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
      </div>
    </Link>
  );
}

// Card grid
interface DocCardGridProps {
  children: React.ReactNode;
}

export function DocCardGrid({ children }: DocCardGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2 not-prose my-6">{children}</div>;
}
