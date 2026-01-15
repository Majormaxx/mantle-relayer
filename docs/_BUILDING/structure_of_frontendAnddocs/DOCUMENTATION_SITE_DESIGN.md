# Mantle Gasless Relayer - Documentation Site Design

**Document Version**: 1.0.0  
**Last Updated**: January 14, 2026  
**Purpose**: Complete design specification for the developer documentation portal

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Information Architecture](#information-architecture)
4. [Design System](#design-system)
5. [Navigation & Search](#navigation--search)
6. [Page Templates](#page-templates)
7. [Code Blocks & Copy Feature](#code-blocks--copy-feature)
8. [Interactive Components](#interactive-components)
9. [API Reference Design](#api-reference-design)
10. [SDK Reference Design](#sdk-reference-design)
11. [Tutorial & Guide Design](#tutorial--guide-design)
12. [Playground & Live Examples](#playground--live-examples)
13. [Versioning Strategy](#versioning-strategy)
14. [SEO & Discoverability](#seo--discoverability)
15. [Feedback & Community](#feedback--community)
16. [Deployment Strategy](#deployment-strategy)

---

## 🎯 Project Overview

### Vision Statement

Create the **gold standard for Web3 developer documentation** - as intuitive as Stripe's docs, as comprehensive as Vercel's, and as developer-friendly as Tailwind's.

### Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Copy-Paste Ready** | Every code example should work immediately |
| **Progressive Learning** | Start simple, reveal complexity as needed |
| **Visual First** | Diagrams and visuals before walls of text |
| **Search Everything** | Instant access to any information |
| **Always Up-to-Date** | Auto-generated API docs from source |

### Inspiration References

- **Stripe Docs** - Best-in-class API documentation
- **Vercel Docs** - Clean, modern, searchable
- **Tailwind CSS** - Interactive examples, excellent organization
- **Chainlink Docs** - Web3 documentation patterns
- **Ethers.js Docs** - TypeScript SDK documentation
- **Alchemy Docs** - Web3 API documentation structure
- **Supabase Docs** - Modern, interactive, great DX

---

## 🛠 Tech Stack & Architecture

### Framework Comparison

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Nextra** | Next.js based, MDX, fast, customizable | Less out-of-box features | ✅ **Recommended** |
| **Docusaurus** | Feature-rich, versioning, i18n | React-only, larger bundle | Good alternative |
| **Mintlify** | Beautiful defaults, API docs | Paid, less customizable | Too restrictive |
| **GitBook** | Easy editing, nice UI | Limited customization | Too basic |

### Chosen Stack: Nextra 3.0

```
┌─────────────────────────────────────────────────────────────┐
│                     Nextra 3.0                               │
│                                                              │
│  • Built on Next.js 14+ (App Router)                        │
│  • MDX for content + React components                        │
│  • Full-text search built-in                                │
│  • Dark mode by default                                      │
│  • Excellent performance                                     │
│  • Full customization possible                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Choices

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Framework** | Nextra 3.0 | Best MDX-based docs framework |
| **Base** | Next.js 14+ | Same stack as main app |
| **Content** | MDX | Markdown + React components |
| **Styling** | TailwindCSS v4 | Consistent with main app |
| **Code Highlighting** | Shiki | Best syntax highlighting |
| **Search** | FlexSearch / Algolia | Instant full-text search |
| **Icons** | Lucide React | Consistent with main app |
| **Diagrams** | Mermaid / Excalidraw | Visual explanations |
| **API Docs** | TypeDoc + Custom | Auto-generated from SDK |
| **Deployment** | Vercel | Optimal for Next.js |

### Project Structure

```
docs-site/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   └── [[...slug]]/              # Catch-all for MDX pages
│       └── page.tsx
├── content/                      # MDX documentation files
│   ├── index.mdx                 # Home page
│   ├── getting-started/
│   │   ├── _meta.json            # Section metadata
│   │   ├── introduction.mdx
│   │   ├── quick-start.mdx
│   │   └── installation.mdx
│   ├── guides/
│   │   ├── _meta.json
│   │   ├── create-paymaster.mdx
│   │   ├── whitelist-contracts.mdx
│   │   ├── spending-limits.mdx
│   │   └── react-integration.mdx
│   ├── sdk/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   ├── client.mdx
│   │   ├── builder.mdx
│   │   └── signer.mdx
│   ├── api/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   ├── relay.mdx
│   │   ├── paymaster.mdx
│   │   └── errors.mdx
│   ├── contracts/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   ├── paymaster.mdx
│   │   ├── factory.mdx
│   │   └── relayer-hub.mdx
│   └── resources/
│       ├── _meta.json
│       ├── faq.mdx
│       ├── troubleshooting.mdx
│       └── changelog.mdx
├── components/
│   ├── CodeBlock/                # Enhanced code blocks
│   ├── APIEndpoint/              # API endpoint display
│   ├── Playground/               # Live code editor
│   ├── Callout/                  # Info/warning boxes
│   ├── Tabs/                     # Tab groups
│   ├── Steps/                    # Step-by-step guides
│   └── Cards/                    # Card grids
├── lib/
│   ├── code-examples.ts          # Centralized code examples
│   └── sdk-types.ts              # SDK type definitions
├── public/
│   ├── images/
│   └── diagrams/
├── styles/
│   └── globals.css
├── theme.config.tsx              # Nextra theme config
└── next.config.mjs
```

---

## 🗂 Information Architecture

### Content Hierarchy

```
Documentation
├── 🏠 Home
│   └── Quick overview, main CTA, search
│
├── 🚀 Getting Started
│   ├── Introduction
│   ├── Quick Start (5-minute guide)
│   ├── Installation
│   └── Core Concepts
│
├── 📖 Guides
│   ├── Create Your First Paymaster
│   ├── Fund Your Paymaster
│   ├── Whitelist Contracts & Functions
│   ├── Configure Spending Limits
│   ├── React/Vue Integration
│   ├── Node.js Backend Integration
│   ├── Error Handling
│   └── Best Practices
│
├── 📦 SDK Reference
│   ├── Overview
│   ├── MantleRelayerClient
│   ├── MetaTransactionBuilder
│   ├── Signer Utilities
│   ├── Error Classes
│   └── TypeScript Types
│
├── 🔌 API Reference
│   ├── Overview
│   ├── Authentication
│   ├── POST /relay
│   ├── POST /validate
│   ├── GET /paymaster/:address
│   ├── GET /nonce
│   ├── Error Codes
│   └── Rate Limits
│
├── 📜 Smart Contracts
│   ├── Overview
│   ├── Paymaster Contract
│   ├── PaymasterFactory Contract
│   ├── RelayerHub Contract
│   ├── Contract Addresses
│   └── ABI Downloads
│
├── 🧪 Examples
│   ├── Basic Usage
│   ├── React Hook Example
│   ├── Next.js Integration
│   ├── Paymaster Management
│   └── Advanced Patterns
│
└── 📚 Resources
    ├── FAQ
    ├── Troubleshooting
    ├── Changelog
    ├── Migration Guides
    └── Community & Support
```

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 Mantle Relayer Docs                              [Search ⌘K]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Getting Started ▼]  [Guides ▼]  [SDK ▼]  [API ▼]  [Contracts]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar (Left)

```
┌────────────────────────┐
│ Getting Started        │
│ ├─ Introduction        │
│ ├─ Quick Start         │
│ ├─ Installation        │
│ └─ Core Concepts       │
│                        │
│ Guides                 │
│ ├─ Create Paymaster    │
│ ├─ Whitelist Contracts │
│ ├─ Spending Limits     │
│ └─ React Integration   │
│                        │
│ SDK Reference          │
│ ├─ Overview            │
│ ├─ Client              │
│ ├─ Builder             │
│ └─ Signer              │
│                        │
│ API Reference          │
│ ├─ Overview            │
│ ├─ POST /relay         │
│ └─ GET /paymaster      │
│                        │
│ Smart Contracts        │
│ └─ ...                 │
│                        │
│ Resources              │
│ └─ ...                 │
└────────────────────────┘
```

### Table of Contents (Right)

```
┌────────────────────────┐
│ On this page           │
│                        │
│ Overview               │
│ Installation           │
│ Quick Start            │
│ Configuration          │
│ ├─ Basic Setup         │
│ └─ Advanced Options    │
│ Error Handling         │
│ Next Steps             │
│                        │
└────────────────────────┘
```

---

## 🎨 Design System

### Color Palette (Dark Theme Primary)

| Element | Color | Usage |
|---------|-------|-------|
| **Background** | `#0A0A0B` | Page background |
| **Surface** | `#141415` | Cards, code blocks |
| **Border** | `#262626` | Dividers |
| **Primary** | `#6366F1` | Links, accents |
| **Code BG** | `#1E1E2E` | Code block background |
| **Code Text** | `#E4E4E7` | Code text |
| **Success** | `#22C55E` | Success callouts |
| **Warning** | `#F59E0B` | Warning callouts |
| **Error** | `#EF4444` | Error callouts |
| **Info** | `#3B82F6` | Info callouts |

### Typography

```
--font-sans: "Inter", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

| Element | Size | Weight |
|---------|------|--------|
| **Page Title** | 32px | 700 |
| **H2** | 24px | 600 |
| **H3** | 20px | 600 |
| **H4** | 16px | 600 |
| **Body** | 16px | 400 |
| **Small** | 14px | 400 |
| **Code** | 14px | 400 |

### Layout Specifications

- **Max content width**: 768px (prose)
- **Sidebar width**: 256px
- **TOC width**: 200px
- **Total max width**: 1400px
- **Mobile breakpoint**: 768px

---

## 🔍 Navigation & Search

### Global Search (Command Palette)

```
┌─────────────────────────────────────────────────────────────────┐
│  [🔍] Search documentation...                             ⌘ K  │
└─────────────────────────────────────────────────────────────────┘

When opened:

┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search documentation...                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Recent                                                         │
│  ├─ 📄 Quick Start                                              │
│  └─ 📄 POST /relay                                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Pages                                                          │
│  ├─ 📄 Create Your First Paymaster                              │
│  ├─ 📄 MantleRelayerClient Reference                            │
│  └─ 📄 Error Codes                                              │
│                                                                  │
│  API                                                            │
│  ├─ 🔌 POST /api/v1/relay                                       │
│  └─ 🔌 GET /api/v1/paymaster/:address                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ↑↓ Navigate   ↵ Select   esc Close                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Search Features

- **Instant search**: Results appear as you type
- **Fuzzy matching**: Tolerant of typos
- **Recent searches**: Quick access to recent queries
- **Keyboard navigation**: Full keyboard support
- **Categorized results**: Grouped by section
- **Preview snippets**: Show matching content

### Breadcrumbs

```
Home > Guides > Create Your First Paymaster
```

### Pagination

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ← Previous                                     Next →          │
│  Installation                         Quick Start Guide         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Page Templates

### Home Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 Mantle Relayer Documentation                    [Search ⌘K] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         Welcome to Mantle Gasless Relayer                       │
│                                                                  │
│    Enable gasless transactions on Mantle. Your users can        │
│    interact with your dApp without paying gas fees.             │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  [🔍] Search documentation...                    ⌘K  │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                  │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│    │  🚀 Quick Start │  │  📖 Guides      │  │  📦 SDK     │   │
│    │                 │  │                 │  │             │   │
│    │  Get up and     │  │  Step-by-step   │  │  Full API   │   │
│    │  running in     │  │  tutorials for  │  │  reference  │   │
│    │  5 minutes      │  │  common tasks   │  │  docs       │   │
│    │                 │  │                 │  │             │   │
│    │  [Start →]      │  │  [Browse →]     │  │  [Explore →]│   │
│    └─────────────────┘  └─────────────────┘  └─────────────┘   │
│                                                                  │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│    │  🔌 API         │  │  📜 Contracts   │  │  🧪 Examples│   │
│    │                 │  │                 │  │             │   │
│    │  REST API       │  │  Smart contract │  │  Copy-paste │   │
│    │  endpoints for  │  │  reference and  │  │  ready code │   │
│    │  relayer        │  │  addresses      │  │  samples    │   │
│    │                 │  │                 │  │             │   │
│    │  [View →]       │  │  [View →]       │  │  [View →]   │   │
│    └─────────────────┘  └─────────────────┘  └─────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Standard Documentation Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Content Area                        │  [TOC]     │
│             │                                      │            │
│  Getting    │  # Create Your First Paymaster      │ On this    │
│  Started    │                                      │ page       │
│  ├─ Intro   │  Learn how to deploy and configure  │            │
│  ├─ Quick   │  your first Paymaster contract.     │ Overview   │
│  └─ Install │                                      │ Prereq.    │
│             │  ┌──────────────────────────────┐   │ Step 1     │
│  Guides     │  │ ⏱ 5 min  │ 🎯 Beginner     │   │ Step 2     │
│  ├─ Create  │  └──────────────────────────────┘   │ Step 3     │
│  ├─ White   │                                      │ Next       │
│  └─ Limits  │  ## Prerequisites                   │            │
│             │                                      │            │
│  SDK        │  Before starting, ensure you have:  │            │
│  └─ ...     │                                      │            │
│             │  - [ ] Node.js 18+                   │            │
│             │  - [ ] Wallet with MNT              │            │
│             │  - [ ] SDK installed                 │            │
│             │                                      │            │
│             │  ## Step 1: Connect to Factory      │            │
│             │                                      │            │
│             │  ┌────────────────────────────────┐ │            │
│             │  │```typescript                   │ │            │
│             │  │import { ethers } from 'ethers';│ │            │
│             │  │                                │ │            │
│             │  │const factory = new ethers...   │ │            │
│             │  │```                    [Copy 📋]│ │            │
│             │  └────────────────────────────────┘ │            │
│             │                                      │            │
│             │  ┌────────────────────────────────┐ │            │
│             │  │ 💡 Tip                         │ │            │
│             │  │                                │ │            │
│             │  │ You can use the SDK to simplify│ │            │
│             │  │ this process. See SDK Guide.   │ │            │
│             │  └────────────────────────────────┘ │            │
│             │                                      │            │
│             │  ─────────────────────────────────  │            │
│             │  ← Installation      Quick Start →  │            │
│             │                                      │            │
└─────────────────────────────────────────────────────────────────┘
```

### API Reference Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Content Area                                     │
│             │                                                    │
│  API Ref    │  # POST /api/v1/relay                             │
│  ├─ Over    │                                                    │
│  ├─ Auth    │  Submit a signed meta-transaction for execution.  │
│  ├─ relay   │                                                    │
│  └─ ...     │  ┌──────────────────────────────────────────────┐│
│             │  │  POST  https://api.mantle-relayer.xyz/api/v1/││
│             │  │        relay                                  ││
│             │  └──────────────────────────────────────────────┘│
│             │                                                    │
│             │  ## Request                                        │
│             │                                                    │
│             │  ### Headers                                       │
│             │  ┌──────────────────────────────────────────────┐│
│             │  │ Header        │ Value           │ Required  ││
│             │  │───────────────│─────────────────│───────────││
│             │  │ Content-Type  │ application/json│ Yes       ││
│             │  └──────────────────────────────────────────────┘│
│             │                                                    │
│             │  ### Body Parameters                               │
│             │  ┌──────────────────────────────────────────────┐│
│             │  │ Param       │ Type    │ Required │ Desc.    ││
│             │  │─────────────│─────────│──────────│──────────││
│             │  │ paymaster   │ address │ Yes      │ Paymaster││
│             │  │ user        │ address │ Yes      │ User addr││
│             │  │ target      │ address │ Yes      │ Target   ││
│             │  │ data        │ bytes   │ Yes      │ Calldata ││
│             │  │ signature   │ bytes   │ Yes      │ EIP-712  ││
│             │  └──────────────────────────────────────────────┘│
│             │                                                    │
│             │  ### Example Request                               │
│             │  ┌────────────────────────────────────────────────┐
│             │  │ [cURL] [JavaScript] [Python]               ← Tabs
│             │  │────────────────────────────────────────────────│
│             │  │```javascript                                   │
│             │  │const response = await fetch(                   │
│             │  │  'https://api.../relay',                       │
│             │  │  {                                             │
│             │  │    method: 'POST',                             │
│             │  │    headers: { 'Content-Type': '...' },        │
│             │  │    body: JSON.stringify({ ... })              │
│             │  │  }                                             │
│             │  │);                               [Copy 📋]      │
│             │  │```                                             │
│             │  └────────────────────────────────────────────────┘
│             │                                                    │
│             │  ## Response                                       │
│             │  ...                                               │
│             │                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Blocks & Copy Feature

### Code Block Design

```
┌─────────────────────────────────────────────────────────────────┐
│  filename.ts                                         [Copy 📋] │
├─────────────────────────────────────────────────────────────────┤
│  1  │ import { MantleRelayerClient } from '@mantle-relayer/sdk';│
│  2  │                                                           │
│  3  │ // Initialize client for Mantle Testnet                   │
│  4  │ const client = MantleRelayerClient.forTestnet(            │
│  5  │   'https://api.mantle-relayer.xyz'                        │
│  6  │ );                                                        │
│  7  │                                                           │
│  8  │ // Build and sign a meta-transaction                      │
│  9  │ const signedTx = await client.buildTransaction()          │
│ 10  │   .setPaymaster('0x...')                                  │
│ 11  │   .setTarget(tokenAddress)                                │
│ 12  │   .setCallData(transferData)                              │
│ 13  │   .sign(signer);                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Code Block Features

| Feature | Implementation |
|---------|----------------|
| **Syntax Highlighting** | Shiki with custom theme matching site |
| **Line Numbers** | Optional, shown for longer blocks |
| **Copy Button** | Top-right, shows ✓ feedback on copy |
| **File Name** | Optional tab showing filename |
| **Line Highlighting** | Highlight specific lines with `{3-5}` |
| **Diff View** | Show additions/deletions with +/- |
| **Language Badge** | Small label showing language |

### Copy Button States

```
Default:    [📋 Copy]
Hover:      [📋 Copy] (highlighted)
Clicked:    [✓ Copied!] (green, 2s)
Error:      [⚠ Failed] (red, 2s)
```

### Multi-Language Code Tabs

```
┌─────────────────────────────────────────────────────────────────┐
│  [JavaScript]  [TypeScript]  [Python]  [cURL]                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  // JavaScript example                                          │
│  const response = await fetch('https://api.../relay', {         │
│    method: 'POST',                                              │
│    headers: { 'Content-Type': 'application/json' },            │
│    body: JSON.stringify({                                       │
│      paymaster: '0x...',                                        │
│      ...signedTx                                                │
│    })                                                           │
│  });                                                            │
│                                                           [Copy]│
└─────────────────────────────────────────────────────────────────┘
```

### Inline Code Styling

```
Regular text with `inline code` that is highlighted.

Variables: `paymasterAddress`
Functions: `client.relay()`
Values: `0x1234...5678`
```

---

## 🧩 Interactive Components

### Callout Boxes

```
┌─────────────────────────────────────────────────────────────────┐
│  💡 Tip                                                         │
│                                                                  │
│  You can use the SDK's builder pattern to simplify transaction  │
│  construction. This handles nonce fetching and deadline         │
│  setting automatically.                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Warning                                                     │
│                                                                  │
│  Make sure your Paymaster has sufficient balance before         │
│  submitting transactions. Transactions will fail if balance     │
│  is too low.                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚨 Danger                                                      │
│                                                                  │
│  Never expose your private key in client-side code. Always      │
│  use environment variables and secure key management.           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ℹ️ Info                                                        │
│                                                                  │
│  This feature is available on Mantle Sepolia testnet. Mainnet  │
│  deployment coming soon.                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Component

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ① Install the SDK                                              │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Install the SDK using npm or yarn:                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ npm install @mantle-relayer/sdk                    [Copy]  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ② Initialize the Client                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Create a client instance for your target network:              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ const client = MantleRelayerClient.forTestnet(...) [Copy]  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ③ Build and Sign Transaction                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Use the builder pattern to construct your transaction:         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ const signedTx = await client.buildTransaction()... [Copy] ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Expandable Sections

```
┌─────────────────────────────────────────────────────────────────┐
│  ▶ Advanced Configuration Options                               │
└─────────────────────────────────────────────────────────────────┘

When expanded:

┌─────────────────────────────────────────────────────────────────┐
│  ▼ Advanced Configuration Options                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ### Custom Timeout                                             │
│                                                                  │
│  You can configure custom timeouts for API requests...          │
│                                                                  │
│  ### Retry Configuration                                        │
│                                                                  │
│  The SDK supports automatic retry with exponential backoff...   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Interactive Parameter Tables

```
┌─────────────────────────────────────────────────────────────────┐
│  Parameter        │ Type     │ Required │ Description          │
│───────────────────│──────────│──────────│──────────────────────│
│  paymaster        │ address  │ ✓        │ The Paymaster        │
│                   │          │          │ contract address     │
│  ↳ Click to copy example: 0x1234...5678                   [📋] │
│───────────────────│──────────│──────────│──────────────────────│
│  user             │ address  │ ✓        │ The user's wallet    │
│                   │          │          │ address              │
│───────────────────│──────────│──────────│──────────────────────│
│  target           │ address  │ ✓        │ Target contract      │
│                   │          │          │ to call              │
│───────────────────│──────────│──────────│──────────────────────│
│  gasLimit         │ uint256  │ ✗        │ Optional gas limit   │
│                   │          │          │ Default: auto        │
└─────────────────────────────────────────────────────────────────┘
```

### Card Grid Component

```
┌───────────────────────┐  ┌───────────────────────┐
│  📦 SDK               │  │  🔌 API               │
│                       │  │                       │
│  TypeScript SDK for   │  │  REST API endpoints   │
│  building gasless     │  │  for direct           │
│  transactions         │  │  integration          │
│                       │  │                       │
│  [View SDK Docs →]    │  │  [View API Docs →]    │
└───────────────────────┘  └───────────────────────┘

┌───────────────────────┐  ┌───────────────────────┐
│  📜 Contracts         │  │  🧪 Examples          │
│                       │  │                       │
│  Smart contract       │  │  Copy-paste ready     │
│  reference and        │  │  code examples        │
│  addresses            │  │                       │
│                       │  │                       │
│  [View Contracts →]   │  │  [Browse Examples →]  │
└───────────────────────┘  └───────────────────────┘
```

---

## 🔌 API Reference Design

### Endpoint Documentation Structure

Each API endpoint page includes:

1. **Header**
   - HTTP Method badge (POST/GET/PUT/DELETE)
   - Endpoint path
   - Brief description

2. **Authentication**
   - Required headers
   - Auth type (if any)

3. **Request**
   - Path parameters
   - Query parameters
   - Body parameters (with types)
   - Example request in multiple languages

4. **Response**
   - Success response (200)
   - Error responses (4xx, 5xx)
   - Response schema
   - Example responses

5. **Try It** (Optional)
   - Interactive API tester

### Endpoint Badge Styles

```
[POST]   - Blue background (#3B82F6)
[GET]    - Green background (#22C55E)
[PUT]    - Orange background (#F59E0B)
[DELETE] - Red background (#EF4444)
```

### Response Code Badges

```
200 OK           - Green
201 Created      - Green
400 Bad Request  - Orange
401 Unauthorized - Orange
404 Not Found    - Orange
500 Server Error - Red
```

### Error Code Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  Error Codes                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  │ Code │ Name                    │ Description              │ │
│  │──────│─────────────────────────│──────────────────────────│ │
│  │ 1    │ INSUFFICIENT_BALANCE    │ Paymaster has           │ │
│  │      │                         │ insufficient MNT        │ │
│  │──────│─────────────────────────│──────────────────────────│ │
│  │ 2    │ CONTRACT_NOT_WHITELISTED│ Target contract not     │ │
│  │      │                         │ in whitelist            │ │
│  │──────│─────────────────────────│──────────────────────────│ │
│  │ 3    │ FUNCTION_NOT_WHITELISTED│ Function selector       │ │
│  │      │                         │ not whitelisted         │ │
│  │──────│─────────────────────────│──────────────────────────│ │
│  │ 4    │ INVALID_SIGNATURE       │ EIP-712 signature       │ │
│  │      │                         │ verification failed     │ │
│  └──────┴─────────────────────────┴──────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 SDK Reference Design

### Class Documentation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  # MantleRelayerClient                                          │
│                                                                  │
│  Main SDK entry point for interacting with the Mantle           │
│  Gas-Less Relayer.                                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ## Import                                                       │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ import { MantleRelayerClient } from '@mantle-relayer/sdk'; ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ## Constructor                                                  │
│                                                                  │
│  ```typescript                                                   │
│  new MantleRelayerClient(config: ClientConfig)                  │
│  ```                                                            │
│                                                                  │
│  ### Parameters                                                  │
│  │ Name    │ Type         │ Description                       │ │
│  │─────────│──────────────│───────────────────────────────────│ │
│  │ config  │ ClientConfig │ Client configuration object       │ │
│                                                                  │
│  ## Static Methods                                               │
│                                                                  │
│  ### forTestnet()                                                │
│  Create client for Mantle Sepolia Testnet.                      │
│                                                                  │
│  ```typescript                                                   │
│  static forTestnet(relayerUrl: string, rpcUrl?: string):        │
│    MantleRelayerClient                                          │
│  ```                                                            │
│                                                                  │
│  ### forMainnet()                                                │
│  Create client for Mantle Mainnet.                              │
│                                                                  │
│  ## Instance Methods                                             │
│                                                                  │
│  ### relay()                                                     │
│  Submit a signed meta-transaction for execution.                │
│                                                                  │
│  ```typescript                                                   │
│  async relay(                                                    │
│    paymasterAddress: string,                                    │
│    signedTx: SignedMetaTransaction                              │
│  ): Promise<RelayResult>                                        │
│  ```                                                            │
│                                                                  │
│  #### Example                                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ const result = await client.relay(paymaster, signedTx);    ││
│  │ console.log(result.txHash);                                ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ### validate()                                                  │
│  Dry-run validation without executing.                          │
│  ...                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Type Definition Display

```
┌─────────────────────────────────────────────────────────────────┐
│  ## Types                                                        │
│                                                                  │
│  ### ClientConfig                                                │
│                                                                  │
│  ```typescript                                                   │
│  interface ClientConfig {                                        │
│    /** Relayer backend URL */                                   │
│    relayerUrl: string;                                          │
│                                                                  │
│    /** Chain ID (default: 5003 for Mantle Sepolia) */          │
│    chainId?: number;                                            │
│                                                                  │
│    /** RPC URL for direct queries */                            │
│    rpcUrl?: string;                                             │
│                                                                  │
│    /** HTTP timeout in milliseconds (default: 30000) */        │
│    timeout?: number;                                            │
│                                                                  │
│    /** Number of retry attempts (default: 3) */                │
│    retryAttempts?: number;                                      │
│  }                                                              │
│  ```                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📖 Tutorial & Guide Design

### Tutorial Page Structure

1. **Hero Section**
   - Title
   - Description
   - Time estimate
   - Difficulty level
   - Prerequisites

2. **Table of Contents**
   - Clickable links to each section
   - Progress indicator (optional)

3. **Step-by-Step Content**
   - Numbered steps
   - Code blocks for each step
   - Explanations
   - Screenshots/diagrams where helpful

4. **Summary**
   - What was accomplished
   - Key takeaways

5. **Next Steps**
   - Related guides
   - Further reading

### Tutorial Header

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  # Create Your First Paymaster                                  │
│                                                                  │
│  Deploy a Paymaster contract and configure it to sponsor        │
│  gas fees for your users.                                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  ⏱ 10 minutes  │  🎯 Beginner  │  📋 Prerequisites        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ### What you'll learn                                          │
│  • How to deploy a Paymaster via PaymasterFactory              │
│  • How to fund your Paymaster with MNT                         │
│  • How to whitelist your first contract                        │
│                                                                  │
│  ### Prerequisites                                               │
│  • [ ] Node.js 18+ installed                                    │
│  • [ ] Wallet with testnet MNT                                  │
│  • [ ] SDK installed (`npm i @mantle-relayer/sdk`)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Indicator (Optional)

```
Step 1       Step 2       Step 3       Step 4
  ●────────────●────────────○────────────○
Install      Setup        Deploy       Configure
```

---

## 🎮 Playground & Live Examples

### Live Code Playground

```
┌─────────────────────────────────────────────────────────────────┐
│  🎮 Interactive Playground                              [Reset] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │  Editor                  │  │  Output                      ││
│  │                          │  │                              ││
│  │  import { Mantle... }    │  │  ▶ Click "Run" to execute   ││
│  │                          │  │                              ││
│  │  const client = ...      │  │                              ││
│  │                          │  │                              ││
│  │  // Try modifying this   │  │                              ││
│  │  const signedTx = ...    │  │                              ││
│  │                          │  │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  [▶ Run]  [📋 Copy]  [↗ Open in CodeSandbox]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Playground Features

| Feature | Description |
|---------|-------------|
| **Live Editing** | Monaco editor with IntelliSense |
| **Instant Execution** | Run code in sandboxed environment |
| **Console Output** | Show logs, results, errors |
| **Shareable Links** | Generate link to current state |
| **Template Library** | Pre-built examples to start from |
| **Network Selector** | Switch between testnet/mainnet |

### Example Gallery

```
┌─────────────────────────────────────────────────────────────────┐
│  # Code Examples                                                │
│                                                                  │
│  Copy-paste ready examples for common use cases.                │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Basic Transaction  │  │  React Hook         │              │
│  │                     │  │                     │              │
│  │  Simple gasless     │  │  useGaslessTransfer │              │
│  │  transfer example   │  │  custom hook        │              │
│  │                     │  │                     │              │
│  │  [View →]           │  │  [View →]           │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Next.js App        │  │  Error Handling     │              │
│  │                     │  │                     │              │
│  │  Full Next.js       │  │  Comprehensive      │              │
│  │  integration        │  │  error handling     │              │
│  │                     │  │                     │              │
│  │  [View →]           │  │  [View →]           │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Versioning Strategy

### Version Selector

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 Mantle Relayer Docs         [v2.0.0 ▼]          [Search ⌘K]│
│                                  ├─ v2.0.0 (latest)            │
│                                  ├─ v1.5.0                     │
│                                  └─ v1.0.0                     │
└─────────────────────────────────────────────────────────────────┘
```

### Version Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ You're viewing documentation for v1.0.0.                    │
│  [Switch to latest version (v2.0.0) →]                          │
└─────────────────────────────────────────────────────────────────┘
```

### Changelog Format

```
┌─────────────────────────────────────────────────────────────────┐
│  # Changelog                                                    │
│                                                                  │
│  ## v2.0.0 (January 10, 2026)                                   │
│                                                                  │
│  ### ✨ New Features                                             │
│  - Added batch transaction support                              │
│  - New `estimateCost()` method                                  │
│                                                                  │
│  ### 🐛 Bug Fixes                                                │
│  - Fixed nonce handling for concurrent requests                 │
│                                                                  │
│  ### 💥 Breaking Changes                                         │
│  - Renamed `submit()` to `relay()`                              │
│  - Changed response format for errors                           │
│                                                                  │
│  ### 📚 Documentation                                            │
│  - Added React integration guide                                │
│  - Updated API reference                                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ## v1.5.0 (December 15, 2025)                                  │
│  ...                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 SEO & Discoverability

### Meta Tags Strategy

Each page includes:
- **Title**: Descriptive, unique title
- **Description**: 150-160 character summary
- **OpenGraph**: Social sharing metadata
- **Twitter Cards**: Twitter-specific meta
- **Canonical URL**: Prevent duplicate content

### URL Structure

```
/                           → Home
/getting-started/quick-start → Getting Started / Quick Start
/sdk/client                  → SDK Reference / MantleRelayerClient
/api/relay                   → API Reference / POST /relay
/guides/create-paymaster     → Guides / Create Your First Paymaster
```

### Structured Data

- **BreadcrumbList**: For navigation trail
- **TechArticle**: For documentation pages
- **SoftwareSourceCode**: For code examples
- **FAQPage**: For FAQ section

### Sitemap

Auto-generated XML sitemap including:
- All documentation pages
- Last modified dates
- Change frequency
- Priority weights

---

## 💬 Feedback & Community

### Page Feedback

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Was this page helpful?                                         │
│                                                                  │
│  [👍 Yes]  [👎 No]                                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [✏️ Edit this page]  [🐛 Report issue]  [💬 Join Discord]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Community Links

```
┌─────────────────────────────────────────────────────────────────┐
│  ## Community & Support                                         │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  💬 Discord         │  │  🐦 Twitter         │              │
│  │                     │  │                     │              │
│  │  Join our Discord   │  │  Follow for         │              │
│  │  for help           │  │  updates            │              │
│  │                     │  │                     │              │
│  │  [Join →]           │  │  [Follow →]         │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  📧 Email           │  │  🐙 GitHub          │              │
│  │                     │  │                     │              │
│  │  Contact us         │  │  View source        │              │
│  │  directly           │  │  code               │              │
│  │                     │  │                     │              │
│  │  [Email →]          │  │  [Star ⭐]          │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Edit on GitHub

Every page has "Edit this page" link leading to GitHub source.

---

## 🚀 Deployment Strategy

### Hosting

| Option | Recommendation |
|--------|----------------|
| **Vercel** | ✅ Recommended - optimal for Next.js |
| **Domain** | `docs.mantle-relayer.xyz` or `/docs` subdirectory |

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Preview** | `docs-pr-*.vercel.app` | PR previews |
| **Staging** | `docs-staging.mantle-relayer.xyz` | Pre-production |
| **Production** | `docs.mantle-relayer.xyz` | Live documentation |

### CI/CD Pipeline

```
Push to PR → Build → Link Check → Preview Deploy
                          ↓
                   [Review & Approve]
                          ↓
Merge to main → Build → Deploy to Staging
                          ↓
                   [Auto-deploy to Production]
```

### Performance Targets

| Metric | Target |
|--------|--------|
| **First Contentful Paint** | < 1s |
| **Largest Contentful Paint** | < 2s |
| **Time to Interactive** | < 2.5s |
| **Search latency** | < 100ms |

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Nextra project
- [ ] Configure TailwindCSS and theme
- [ ] Design system components (Callouts, Cards, Steps)
- [ ] Navigation structure
- [ ] Search integration

### Phase 2: Core Content (Week 1-2)
- [ ] Home page
- [ ] Getting Started section
  - Introduction
  - Quick Start
  - Installation
  - Core Concepts
- [ ] Basic code blocks with copy

### Phase 3: Guides (Week 2)
- [ ] Create Paymaster guide
- [ ] Whitelist Contracts guide
- [ ] Spending Limits guide
- [ ] React Integration guide
- [ ] Step-by-step component

### Phase 4: Reference Docs (Week 2-3)
- [ ] SDK Reference
  - Auto-generate from TypeDoc
  - Add examples to each method
- [ ] API Reference
  - All endpoints documented
  - Multi-language examples
- [ ] Smart Contract Reference

### Phase 5: Examples & Polish (Week 3)
- [ ] Example gallery
- [ ] Interactive playground (if time permits)
- [ ] FAQ and Troubleshooting
- [ ] Changelog
- [ ] SEO optimization
- [ ] Final review and testing

---

## 🔗 Related Documents

- [Frontend Application Design](./FRONTEND_APP_DESIGN.md)
- [Frontend Requirements](./FRONTEND_REQUIREMENTS.md)
- [Developer Guide](../DEVELOPER_GUIDE.md)
- [SDK README](../../sdk/README.md)

---

**Document Owner**: Frontend Team  
**Last Review**: January 14, 2026  
**Next Review**: Before Phase 2 completion
