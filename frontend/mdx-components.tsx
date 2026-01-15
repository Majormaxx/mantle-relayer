import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout, Pre, DocCard, DocCardGrid, ApiEndpoint, ApiSection, ParameterTable } from '@/components/docs';

// Custom components for MDX
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default elements with custom styling
    h1: ({ children, ...props }) => (
      <h1
        className="scroll-m-20 text-4xl font-bold tracking-tight text-zinc-100 lg:text-5xl"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="scroll-m-20 border-b border-zinc-800 pb-2 text-3xl font-semibold tracking-tight text-zinc-100 first:mt-0 mt-12"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="scroll-m-20 text-2xl font-semibold tracking-tight text-zinc-200 mt-8"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="scroll-m-20 text-xl font-semibold tracking-tight text-zinc-200 mt-6"
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="leading-7 text-zinc-400 [&:not(:first-child)]:mt-4" {...props}>
        {children}
      </p>
    ),
    a: ({ href, children, className }) => {
      const isExternal = href?.startsWith('http');
      const linkClassName = className || 'font-medium text-indigo-400 underline underline-offset-4 hover:text-indigo-300';
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href || '#'}
          className={linkClassName}
        >
          {children}
        </Link>
      );
    },
    ul: ({ children, ...props }) => (
      <ul className="my-6 ml-6 list-disc text-zinc-400 [&>li]:mt-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="my-6 ml-6 list-decimal text-zinc-400 [&>li]:mt-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-zinc-400" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="mt-6 border-l-2 border-zinc-700 pl-6 italic text-zinc-400"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => (
      <code
        className="relative rounded bg-zinc-800 px-[0.3rem] py-[0.2rem] font-mono text-sm text-indigo-300"
        {...props}
      >
        {children}
      </code>
    ),
    pre: Pre,
    table: ({ children, ...props }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full text-sm" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="border-b border-zinc-800" {...props}>
        {children}
      </thead>
    ),
    tr: ({ children, ...props }) => (
      <tr className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/50" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-left font-medium text-zinc-300" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-3 text-zinc-400" {...props}>
        {children}
      </td>
    ),
    hr: (props) => <hr className="my-8 border-zinc-800" {...props} />,
    img: (props) => (
      <img className="rounded-lg border border-zinc-800" {...props} />
    ),
    // Custom components
    Callout,
    DocCard,
    DocCardGrid,
    ApiEndpoint,
    ApiSection,
    ParameterTable,
    // Spread any custom components passed
    ...components,
  };
}
