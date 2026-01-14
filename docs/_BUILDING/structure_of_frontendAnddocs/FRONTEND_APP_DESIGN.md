# Mantle Gasless Relayer - Frontend Application Design

**Document Version**: 1.0.0  
**Last Updated**: January 14, 2026  
**Purpose**: Complete design specification for the main web application (Landing → Dashboard)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [User Journey Maps](#user-journey-maps)
4. [Tech Stack & Architecture](#tech-stack--architecture)
5. [Design System](#design-system)
6. [Page Structure & Navigation](#page-structure--navigation)
7. [Landing Page Design](#landing-page-design)
8. [Authentication Flow](#authentication-flow)
9. [Onboarding Experience](#onboarding-experience)
10. [Dashboard Design](#dashboard-design)
11. [Paymaster Management](#paymaster-management)
12. [Analytics & Monitoring](#analytics--monitoring)
13. [Settings & Configuration](#settings--configuration)
14. [Interaction Patterns](#interaction-patterns)
15. [Component Specifications](#component-specifications)
16. [Real-Time Features](#real-time-features)
17. [Responsive Design Strategy](#responsive-design-strategy)
18. [Animation & Micro-interactions](#animation--micro-interactions)
19. [State Management](#state-management)
20. [Performance Optimization](#performance-optimization)
21. [Accessibility (a11y)](#accessibility-a11y)
22. [Success Metrics & KPIs](#success-metrics--kpis)
23. [Deployment Strategy](#deployment-strategy)
24. [UX Checklist](#ux-checklist)

---

## 🎯 Project Overview

### Vision Statement

Build a **world-class developer platform** that rivals the UX quality of Stripe, Vercel, and Alchemy dashboards - enabling Web3 developers to effortlessly sponsor gas fees for their users.

### Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Clarity First** | Every element serves a purpose. No visual clutter. |
| **Progressive Disclosure** | Show simple options first, advanced features on demand |
| **Instant Feedback** | Every action provides immediate visual response |
| **Trust Through Transparency** | Show exactly what's happening (tx status, gas costs, etc.) |
| **Developer Empathy** | Speak their language, respect their time |

### Inspiration References

- **Stripe Dashboard** - Clean data presentation, excellent tables
- **Vercel** - Minimal aesthetic, smooth animations
- **Alchemy** - Web3 developer dashboard patterns
- **Linear** - Modern UI interactions
- **Railway** - Deployment status visualization
- **Chainlink** - Web3 documentation integration

---

## � User Personas

### Persona 1: Alex - The dApp Developer

```
┌─────────────────────────────────────────────────────────────────┐
│  👨‍💻 Alex Chen                                                   │
│  Full-Stack Web3 Developer                                       │
│  Age: 28 | Experience: 3 years in Web3                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 GOALS                           😤 PAIN POINTS               │
│  ─────────                          ─────────────                │
│  • Make user onboarding             • Complex Web3 onboarding    │
│    seamless                           kills conversion            │
│  • Monitor gas costs                • Hard to predict gas costs  │
│  • Control which features           • Needs technical solution   │
│    are gasless                        that's simple to implement │
│                                                                  │
│  💭 THINKING                         ✅ HOW WE HELP              │
│  ─────────                          ─────────────                │
│  "My users shouldn't need          • SDK integrates in <5 min   │
│   MNT to use my dApp"              • Clear cost monitoring      │
│                                     • Precise whitelist control  │
│                                                                  │
│  📊 BEHAVIOR                                                     │
│  ─────────                                                       │
│  • Builds DeFi protocol on Mantle                               │
│  • Prefers copy-paste code examples                             │
│  • Values good documentation                                     │
│  • Checks dashboard daily for metrics                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Persona 2: Sarah - The Product Manager

```
┌─────────────────────────────────────────────────────────────────┐
│  👩‍💼 Sarah Williams                                               │
│  Product Manager, Web3 Gaming                                    │
│  Age: 32 | Technical Level: Moderate                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 GOALS                           😤 PAIN POINTS               │
│  ─────────                          ─────────────                │
│  • Understand user engagement       • Blockchain data confusing │
│  • Track costs vs. business value   • Hard to explain to team   │
│  • Make data-driven decisions       • Needs clear ROI metrics   │
│                                                                  │
│  💭 THINKING                         ✅ HOW WE HELP              │
│  ─────────                          ─────────────                │
│  "How much are we spending         • Dashboard with clear       │
│   and is it worth it?"               business metrics           │
│                                     • "Savings calculator"      │
│                                     • Simple language, no jargon │
│                                                                  │
│  📊 BEHAVIOR                                                     │
│  ─────────                                                       │
│  • Needs to report metrics to stakeholders                      │
│  • Wants exportable reports                                      │
│  • Checks weekly summaries                                       │
│  • Cares about user retention metrics                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Needs Matrix

| Need | Alex (Developer) | Sarah (PM) | Priority |
|------|------------------|------------|----------|
| Quick setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Critical |
| Code examples | ⭐⭐⭐⭐⭐ | ⭐ | Critical |
| Cost monitoring | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| Transaction history | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| Analytics/Reports | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| Whitelist config | ⭐⭐⭐⭐⭐ | ⭐⭐ | High |
| API documentation | ⭐⭐⭐⭐⭐ | ⭐ | Medium |
| Export functionality | ⭐⭐ | ⭐⭐⭐⭐⭐ | Medium |

---

## 🗺️ User Journey Maps

### Journey 1: First-Time Developer (Critical Path)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY (Before Account)                 ⏱ 0-2 min  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Landing Page                                                    │
│  ├─ 😐 Emotion: Curious but skeptical                           │
│  ├─ 🎯 Goal: Understand what this is                            │
│  ├─ 💭 Thinking: "Is this legit? How much work is this?"       │
│  └─ ✅ Success: Clear value prop in <10 seconds                 │
│                                                                  │
│  What they MUST see:                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Hero: "Let Your Users Transact Without Gas"               ││
│  │ • 3-step visual: Deploy → Fund → Integrate                  ││
│  │ • Live demo showing gasless transaction                     ││
│  │ • Testimonial from known project                            ││
│  │ • Big "Try Free on Testnet" button                         ││
│  │ • Stats: "10,000+ transactions sponsored"                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: FIRST STEPS (Minutes 0-5)                  ⏱ 2-5 min  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 2a: Connect Wallet                                         │
│  ├─ 😊 Emotion: Excited to try                                  │
│  ├─ 🎯 Goal: Get started quickly                                │
│  ├─ 💭 Thinking: "This better be easy..."                      │
│  └─ ✅ Success: Wallet connected in <30 seconds                 │
│                                                                  │
│  What they experience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Click "Connect Wallet"                                   ││
│  │ 2. MetaMask popup (familiar!)                               ││
│  │ 3. Sign message (no gas needed ✨)                          ││
│  │ 4. Instant redirect to dashboard                            ││
│  │ 5. Welcome message with guided next steps                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                            ↓                                     │
│  Step 2b: Create First Paymaster                                 │
│  ├─ 😃 Emotion: Engaged, following flow                        │
│  ├─ 🎯 Goal: Set up first Paymaster                            │
│  ├─ 💭 Thinking: "What's a Paymaster? Okay, makes sense"      │
│  └─ ✅ Success: Paymaster created in <2 minutes                 │
│                                                                  │
│  What they experience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Modal: "Create Your First Paymaster"                    ││
│  │ 2. Tooltip: "A Paymaster sponsors gas for your users"      ││
│  │ 3. Input: Give it a name (optional, pre-filled)            ││
│  │ 4. Button: "Create" → Wallet transaction                   ││
│  │ 5. Success animation 🎉 with confetti                       ││
│  │ 6. Shows Paymaster address with copy button                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                            ↓                                     │
│  Step 2c: Fund Paymaster                                         │
│  ├─ 😀 Emotion: Making progress                                 │
│  ├─ 🎯 Goal: Add funds to start sponsoring                     │
│  ├─ 💭 Thinking: "How much do I need?"                         │
│  └─ ✅ Success: Funded and ready to use                         │
│                                                                  │
│  What they experience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Modal: "Fund Your Paymaster"                            ││
│  │ 2. Calculator: "10 MNT ≈ 500 transactions"                 ││
│  │ 3. Quick buttons: [1 MNT] [5 MNT] [10 MNT] [25 MNT]        ││
│  │ 4. Custom input option                                      ││
│  │ 5. Button: "Fund" → Wallet transaction                     ││
│  │ 6. Success: "Ready to go! 🚀"                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: CONFIGURATION (Minutes 5-15)              ⏱ 5-15 min  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Whitelist Contracts                                             │
│  ├─ 🤔 Emotion: Thoughtful, learning                            │
│  ├─ 🎯 Goal: Set up which contracts users can interact with    │
│  ├─ 💭 Thinking: "I should only allow my token contract"       │
│  └─ ✅ Success: Configured security settings                    │
│                                                                  │
│  What they experience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Guided tour: "Let's whitelist your first contract"      ││
│  │ 2. Input: Contract address                                  ││
│  │ 3. Auto-detect: Contract name, type (ERC20/NFT/Custom)      ││
│  │ 4. Toggle: "Whitelist all functions" (default: off)        ││
│  │ 5. Or: Multi-select specific functions from dropdown        ││
│  │ 6. Preview: "Users can now call transfer(), approve()"     ││
│  │ 7. Button: "Add to Whitelist"                              ││
│  │ 8. Success: "Security configured! ✅"                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: INTEGRATION (Minutes 15-20)               ⏱ 15-20 min │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Integrate SDK                                                   │
│  ├─ 🎯 Emotion: Focused, technical mode                         │
│  ├─ 🎯 Goal: Add gasless transactions to their dApp            │
│  ├─ 💭 Thinking: "Is this plug-and-play?"                      │
│  └─ ✅ Success: SDK working in their app                        │
│                                                                  │
│  What they experience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Big banner: "Ready to integrate?"                       ││
│  │ 2. Pre-filled code example (with THEIR Paymaster address)  ││
│  │ 3. Framework tabs: [React] [Next.js] [Vue] [Vanilla JS]    ││
│  │ 4. Copy button with success feedback                        ││
│  │ 5. Button: "View Full Documentation" → Opens docs          ││
│  │ 6. Optional: 2-minute video tutorial                        ││
│  │ 7. Link back to dashboard to monitor first transaction      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: MONITORING (Ongoing)                          Ongoing │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Daily Dashboard Usage                                           │
│  ├─ 😊 Emotion: Satisfied, in control                           │
│  ├─ 🎯 Goal: Monitor usage and costs                            │
│  ├─ 💭 Thinking: "How are my users doing?"                     │
│  └─ ✅ Success: Full visibility, actionable insights            │
│                                                                  │
│  What they see:                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ At-a-glance metrics:                                        ││
│  │ • Balance: 42.3 MNT (🟢 healthy)                            ││
│  │ • Transactions today: 234 (+12%)                            ││
│  │ • Gas sponsored: $12.34                                     ││
│  │ • Active users: 89                                          ││
│  │                                                              ││
│  │ Features:                                                    ││
│  │ • Chart: Gas spending over time                             ││
│  │ • Real-time feed: New transactions as they happen          ││
│  │ • Insights: "Your users saved $45 in gas this week! 🎉"   ││
│  │                                                              ││
│  │ Alert examples:                                              ││
│  │ • 🟡 "Balance below 10 MNT - Consider refunding"           ││
│  │ • 🔴 "Unusual spike in gas usage detected"                 ││
│  │ • 🟢 "1,000 transactions milestone reached! 🎊"            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Journey 2: End User Gasless Transaction

```
┌─────────────────────────────────────────────────────────────────┐
│  END USER EXPERIENCE (In Developer's dApp)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  dApp Interface                                                  │
│       │                                                          │
│       │ User clicks "Send Tokens"                               │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Confirm Transaction                                        ││
│  │  ─────────────────                                          ││
│  │  Transfer 100 tokens to:                                    ││
│  │  0xabcd...1234                                              ││
│  │                                                              ││
│  │  💡 No gas fees needed!                                     ││
│  │                                                              ││
│  │  [Cancel]  [Confirm]                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       │ Click "Confirm"                                         │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Sign Message (EIP-712)                                     ││
│  │  ───────────────────────                                    ││
│  │  MetaMask Popup                                             ││
│  │                                                              ││
│  │  Sign this message to execute transaction?                  ││
│  │                                                              ││
│  │  ✨ No gas required                                         ││
│  │  Domain: Mantle Gasless                                     ││
│  │                                                              ││
│  │  [Reject]  [Sign]                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       │ Sign (no gas!)                                           │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Processing...                                              ││
│  │  ─────────────                                              ││
│  │  ⏳ Your transaction is being processed...                  ││
│  │                                                              ││
│  │  This usually takes 2-3 seconds                             ││
│  │                                                              ││
│  │  [====================         ] 70%                        ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       │ Backend relays transaction                               │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Success! 🎉                                                ││
│  │  ───────────                                                ││
│  │  Transaction confirmed                                      ││
│  │                                                              ││
│  │  TX: 0x789...def                                            ││
│  │  [View on Explorer →]                                       ││
│  │                                                              ││
│  │  💰 You saved $2.34 in gas!                                 ││
│  │                                                              ││
│  │  [Done]                                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Behind the Scenes:                                              │
│  ─────────────────                                               │
│  User Sign → SDK → Relayer Backend → Smart Contract → Confirmed │
│   (no gas)   (validates)  (pays gas)     (executes)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## �🛠 Tech Stack & Architecture

### Core Framework

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14+ (App Router)              │
│                                                          │
│  • Server Components for fast initial load               │
│  • Client Components for interactivity                   │
│  • API Routes for backend-for-frontend                   │
│  • Edge Runtime for global performance                   │
└─────────────────────────────────────────────────────────┘
```

### Technology Choices

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | Best-in-class React framework, RSC support |
| **Language** | TypeScript (Strict Mode) | Type safety, better DX |
| **Styling** | TailwindCSS v4 | Utility-first, excellent DX |
| **Components** | shadcn/ui | Accessible, customizable, not a dependency |
| **Icons** | Lucide React | Consistent, tree-shakeable |
| **Charts** | Recharts | React-native, composable |
| **Web3** | Wagmi v2 + Viem | Modern hooks-based Web3 |
| **Wallet** | RainbowKit / ConnectKit | Beautiful wallet connection UX |
| **State** | Zustand | Lightweight, intuitive |
| **Forms** | React Hook Form + Zod | Performant forms, schema validation |
| **Tables** | TanStack Table v8 | Headless, powerful |
| **Animations** | Framer Motion | Production-grade animations |
| **Dates** | date-fns | Lightweight date utilities |
| **Toast** | Sonner | Beautiful toast notifications |
| **Deployment** | Vercel | Optimal for Next.js |

### Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages group
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/
│   │   ├── about/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard group
│   │   ├── dashboard/
│   │   ├── paymasters/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard-specific
│   ├── paymaster/                # Paymaster components
│   ├── charts/                   # Chart components
│   └── web3/                     # Web3 components
├── hooks/                        # Custom hooks
├── lib/                          # Utilities
│   ├── utils.ts
│   ├── constants.ts
│   └── validations.ts
├── stores/                       # Zustand stores
├── types/                        # TypeScript types
├── config/                       # App configuration
└── public/                       # Static assets
```

---

## 🎨 Design System

### Color Palette

#### Brand Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary** | `#6366F1` (Indigo-500) | `#818CF8` (Indigo-400) | CTAs, links, focus states |
| **Secondary** | `#0EA5E9` (Sky-500) | `#38BDF8` (Sky-400) | Accents, highlights |
| **Accent** | `#10B981` (Emerald-500) | `#34D399` (Emerald-400) | Success states, positive metrics |

#### Semantic Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Success** | `#22C55E` | `#4ADE80` | Completed transactions |
| **Warning** | `#F59E0B` | `#FBBF24` | Low balance alerts |
| **Error** | `#EF4444` | `#F87171` | Failed transactions, errors |
| **Info** | `#3B82F6` | `#60A5FA` | Informational messages |

#### Neutral Colors (Dark Theme Primary)

| Name | Value | Usage |
|------|-------|-------|
| **Background** | `#09090B` | Page background |
| **Card** | `#18181B` | Card surfaces |
| **Border** | `#27272A` | Dividers, borders |
| **Muted** | `#3F3F46` | Disabled states |
| **Foreground** | `#FAFAFA` | Primary text |
| **Muted Foreground** | `#A1A1AA` | Secondary text |

### Typography

#### Font Stack

```
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

#### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| **Display** | 48px / 3rem | 700 | Hero headlines |
| **H1** | 36px / 2.25rem | 600 | Page titles |
| **H2** | 30px / 1.875rem | 600 | Section titles |
| **H3** | 24px / 1.5rem | 600 | Card titles |
| **H4** | 20px / 1.25rem | 600 | Subsections |
| **Body Large** | 18px / 1.125rem | 400 | Lead paragraphs |
| **Body** | 16px / 1rem | 400 | Default text |
| **Body Small** | 14px / 0.875rem | 400 | Secondary text |
| **Caption** | 12px / 0.75rem | 500 | Labels, badges |
| **Code** | 14px / 0.875rem | 400 | Code snippets |

### Spacing System

```
4px  (1)   - Tight spacing (icons)
8px  (2)   - Component padding
12px (3)   - Small gaps
16px (4)   - Default spacing
24px (6)   - Section padding
32px (8)   - Component gaps
48px (12)  - Section gaps
64px (16)  - Page sections
96px (24)  - Hero spacing
```

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| **sm** | 6px | Buttons, inputs |
| **md** | 8px | Cards |
| **lg** | 12px | Modals |
| **xl** | 16px | Large cards |
| **full** | 9999px | Pills, avatars |

### Shadows (Dark Mode Optimized)

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3); /* Primary glow */
```

### Component Variants

#### Buttons

| Variant | Usage |
|---------|-------|
| **Primary** | Main CTAs (solid primary color) |
| **Secondary** | Secondary actions (outline) |
| **Ghost** | Tertiary actions (transparent) |
| **Destructive** | Delete, disconnect actions |
| **Link** | Text-only actions |

#### Cards

| Variant | Usage |
|---------|-------|
| **Default** | Standard content containers |
| **Interactive** | Clickable cards with hover state |
| **Highlighted** | Featured content with border glow |
| **Stat** | Metric display cards |

---

## 🗺 Page Structure & Navigation

### Site Map

```
/                           # Landing page (public)
├── /pricing                # Pricing page (public)
├── /about                  # About page (public)
├── /login                  # Connect wallet (public)
│
├── /dashboard              # Dashboard home (protected)
├── /paymasters             # Paymaster list (protected)
│   ├── /new                # Create paymaster
│   └── /[id]               # Paymaster detail
│       ├── /whitelist      # Manage whitelists
│       ├── /limits         # Spending limits
│       ├── /transactions   # Transaction history
│       └── /settings       # Paymaster settings
│
├── /analytics              # Global analytics (protected)
├── /settings               # Account settings (protected)
│   ├── /profile
│   ├── /api-keys
│   └── /notifications
│
└── /docs                   # → Redirects to docs subdomain
```

### Navigation Patterns

#### Top Navigation (Marketing)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 Mantle Relayer    Features  Pricing  Docs    [Connect Wallet]│
└─────────────────────────────────────────────────────────────────┘
```

#### Sidebar Navigation (Dashboard)

```
┌──────────────────┐
│ 🔷 Mantle Relayer│
├──────────────────┤
│ 📊 Dashboard     │
│ 💰 Paymasters    │
│ 📈 Analytics     │
│ ⚙️ Settings      │
├──────────────────┤
│ 📚 Documentation │
│ 💬 Support       │
├──────────────────┤
│ 🌙 Theme Toggle  │
│ 👤 0x1a2b...3c4d │
└──────────────────┘
```

---

## 🏠 Landing Page Design

### Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Navigation Bar (sticky, blur backdrop)                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ✨ Animated gradient background               │
│                                                                  │
│         "Let Your Users Transact Without Gas"                   │
│                                                                  │
│    Enable gasless transactions on Mantle. Your users enjoy      │
│    seamless Web3 experiences while you control the costs.       │
│                                                                  │
│         [Get Started - Free] [View Documentation]               │
│                                                                  │
│              ┌─────────────────────────────┐                    │
│              │   Live Demo Animation       │                    │
│              │   (Transaction flow visual) │                    │
│              └─────────────────────────────┘                    │
│                                                                  │
│    🔢 10,000+          🔢 500+              🔢 $50,000+          │
│    Transactions        Developers          Gas Sponsored        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Dark gradient background with subtle animated mesh
- Large, bold headline (Display font)
- Two CTAs: Primary (filled) + Secondary (outline)
- Animated illustration showing transaction flow
- Live stats counter with number animation

### How It Works Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    "How It Works"                                │
│           Three simple steps to gasless transactions            │
│                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │     1️⃣      │   │     2️⃣      │   │     3️⃣      │          │
│   │   Create    │ → │    Fund     │ → │  Integrate  │          │
│   │  Paymaster  │   │  & Config   │   │    SDK      │          │
│   │             │   │             │   │             │          │
│   │ Deploy your │   │ Add MNT and │   │ Copy-paste  │          │
│   │ Paymaster   │   │ whitelist   │   │ SDK code    │          │
│   │ in 1 click  │   │ contracts   │   │ into dApp   │          │
│   └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                  │
│                  Connecting animated line                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Three-step horizontal flow (stacks vertically on mobile)
- Animated connecting line/arrows between steps
- Each step reveals details on hover
- Subtle entrance animations (staggered fade-in)

### Features Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                  "Built for Developers"                          │
│                                                                  │
│   ┌─────────────────────┐   ┌─────────────────────┐            │
│   │ 🔐 Secure by Design │   │ 💰 Cost Control     │            │
│   │                     │   │                     │            │
│   │ EIP-712 signatures  │   │ Set spending limits │            │
│   │ Whitelist contracts │   │ per-tx, daily,      │            │
│   │ Pause anytime       │   │ monthly, global     │            │
│   └─────────────────────┘   └─────────────────────┘            │
│                                                                  │
│   ┌─────────────────────┐   ┌─────────────────────┐            │
│   │ 📊 Real-time        │   │ ⚡ Lightning Fast   │            │
│   │    Analytics        │   │                     │            │
│   │                     │   │ Sub-second relay    │            │
│   │ Track transactions  │   │ Optimized for       │            │
│   │ Monitor gas costs   │   │ Mantle L2           │            │
│   │ Unique user counts  │   │                     │            │
│   └─────────────────────┘   └─────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Bento grid layout (2x2 on desktop, 1 column on mobile)
- Each card has icon, title, bullet points
- Subtle hover effect (lift + glow)
- Icons use primary color

### Code Preview Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│         "Integrate in Minutes, Not Days"                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  // Enable gasless transactions                          │  │
│   │  const client = MantleRelayerClient.forTestnet(url);    │  │
│   │                                                          │  │
│   │  const signedTx = await client.buildTransaction()       │  │
│   │    .setPaymaster('0x...')                               │  │
│   │    .setTarget(tokenAddress)                             │  │
│   │    .setCallData(transferData)                           │  │
│   │    .sign(signer);                                       │  │
│   │                                                          │  │
│   │  const result = await client.relay(signedTx);           │  │
│   │  // User paid ZERO gas! 🎉                              │  │
│   │                                                    [Copy]│  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│                    [View Full Documentation →]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Syntax-highlighted code block
- Dark theme code with JetBrains Mono font
- Copy button with success feedback
- Subtle code typing animation on scroll into view

### Use Cases Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    "Power Any Use Case"                          │
│                                                                  │
│  [🎮 Gaming]  [🖼 NFTs]  [💱 DeFi]  [📱 Social]   ← Tab nav     │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                          │  │
│   │   🎮 Gaming                                              │  │
│   │                                                          │  │
│   │   "Our players complete in-game transactions without    │  │
│   │    ever needing to buy MNT first. Onboarding improved   │  │
│   │    by 340%."                                            │  │
│   │                                                          │  │
│   │   - Example: In-game item purchases                     │  │
│   │   - Example: Achievement minting                        │  │
│   │   - Example: Player-to-player transfers                 │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Tab-based navigation for use cases
- Each tab shows relevant examples
- Testimonial quote if available
- Animated transition between tabs

### CTA Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ╔═══════════════════════════════════════════════════════╗   │
│    ║                                                        ║   │
│    ║   Ready to go gasless?                                ║   │
│    ║                                                        ║   │
│    ║   Start sponsoring gas for your users today.          ║   │
│    ║   Free on testnet. No credit card required.           ║   │
│    ║                                                        ║   │
│    ║          [🚀 Get Started Free]                        ║   │
│    ║                                                        ║   │
│    ╚═══════════════════════════════════════════════════════╝   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Gradient border or background
- Large, prominent CTA button
- Trust signals (free, no credit card)
- Subtle pulsing animation on button

### Footer

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🔷 Mantle Relayer                                              │
│                                                                  │
│  Product        Resources       Company        Legal            │
│  ─────────      ─────────       ─────────      ─────────        │
│  Features       Documentation   About          Privacy          │
│  Pricing        SDK Reference   Blog           Terms            │
│  Changelog      Tutorials       Careers        Cookies          │
│  Status         GitHub          Contact                         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  © 2026 Mantle Relayer. Built on Mantle.     [𝕏] [GitHub] [📧] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Connect Wallet Modal

```
┌─────────────────────────────────────────────────────────┐
│                                           [×]           │
│                                                         │
│              Connect Your Wallet                        │
│                                                         │
│    ┌─────────────────────────────────────────────┐     │
│    │  🦊  MetaMask                            → │     │
│    └─────────────────────────────────────────────┘     │
│    ┌─────────────────────────────────────────────┐     │
│    │  🌈  Rainbow                             → │     │
│    └─────────────────────────────────────────────┘     │
│    ┌─────────────────────────────────────────────┐     │
│    │  🔗  WalletConnect                       → │     │
│    └─────────────────────────────────────────────┘     │
│    ┌─────────────────────────────────────────────┐     │
│    │  💰  Coinbase Wallet                     → │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│    ─────────────────────────────────────────────────   │
│                                                         │
│    New to Mantle? [Learn about wallets →]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sign Message Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    Step 1 of 2                                         │
│                                                         │
│    ✅ Wallet Connected                                  │
│    🔄 Sign message to continue...                       │
│                                                         │
│    ┌─────────────────────────────────────────────┐     │
│    │  Sign this message to verify you own       │     │
│    │  this wallet. This doesn't cost any gas.   │     │
│    │                                             │     │
│    │  Message:                                   │     │
│    │  "Sign in to Mantle Relayer                │     │
│    │   Nonce: a1b2c3d4                          │     │
│    │   Issued: 2026-01-14T10:30:00Z"            │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│    Waiting for signature...                             │
│    [================        ] 60%                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Network Switch Prompt

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ⚠️ Wrong Network                                     │
│                                                         │
│    Please switch to Mantle Sepolia to continue.        │
│                                                         │
│    Current: Ethereum Mainnet                           │
│    Required: Mantle Sepolia (Chain ID: 5003)           │
│                                                         │
│              [Switch Network]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Onboarding Experience

### First-Time Dashboard Visit

```
╭─────────────────────────────────────────────────────────────────╮
│                                                                  │
│         🎉 Welcome to Your Dashboard!                            │
│                                                                  │
│    Hi! Let's get you started in 5 minutes.                      │
│                                                                  │
│    ───────────────────────────────────────────────────────  │
│                                                                  │
│    ✅ Step 1: Create a Paymaster                                 │
│       Deploy your first gas-sponsoring contract                 │
│       [Create Now →]                                            │
│                                                                  │
│    ⏹ Step 2: Fund Your Paymaster                                │
│       Add MNT to start sponsoring (after step 1)                │
│                                                                  │
│    ⏹ Step 3: Configure Security                                 │
│       Whitelist contracts your users can interact with          │
│                                                                  │
│    ⏹ Step 4: Integrate SDK                                      │
│       Copy-paste code into your dApp                            │
│       [View Docs →]                                             │
│                                                                  │
│    ───────────────────────────────────────────────────────  │
│                                                                  │
│    [Skip Tour]                                                   │
│                                                                  │
╰─────────────────────────────────────────────────────────────────╯
```

### Progress Indicator Component

```
     Step 1         Step 2         Step 3         Step 4
       ●────────────○────────────○────────────○
     Create        Fund          Configure      Integrate
     Paymaster     Balance       Whitelists     SDK
     ✅ Done       In Progress     Pending        Pending
```

### Milestone Celebrations

Celebrate user achievements to reinforce positive behavior:

| Milestone | Celebration |
|-----------|-------------|
| **First Paymaster created** | 🎉 Confetti animation + "You're on your way!" |
| **First funding** | 🚀 "Ready for liftoff!" toast |
| **First transaction** | 🌟 "Your first gasless transaction!" banner |
| **100 transactions** | 🏆 "Century Club" achievement badge |
| **1,000 transactions** | 💎 "Power User" status |

### Contextual Help System

**Tooltips for technical terms:**

```tsx
<Tooltip content="A Paymaster pays gas fees on behalf of your users">
  <span className="underline-dashed cursor-help">Paymaster</span>
</Tooltip>
```

**Inline help text:**

```tsx
<HelpText>
  Set a per-transaction limit to prevent abuse.
  Recommended: 0.05 MNT for most use cases.
</HelpText>
```

**Empty state guidance:**

```tsx
<EmptyState
  icon={<PaymasterIcon />}
  title="No Paymasters Yet"
  description="Create your first Paymaster to start sponsoring gas for your users"
  action={<Button>Create Paymaster</Button>}
  help={<Link>Learn more about Paymasters →</Link>}
/>
```

---

## 📊 Dashboard Design

### Dashboard Home

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Dashboard                           🔔  👤 0x1a2b│
│             │──────────────────────────────────────────────────│
│  📊 Dash    │                                                   │
│  💰 Pay     │  Welcome back, 0x1a2b...3c4d                     │
│  📈 Analy   │                                                   │
│  ⚙️ Sett    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│             │  │ Total   │ │ Active  │ │ Total   │ │ This    ││
│             │  │ Balance │ │ Paymast │ │ Trans.  │ │ Month   ││
│             │  │         │ │         │ │         │ │         ││
│             │  │ 125 MNT │ │    3    │ │  1,234  │ │  $450   ││
│             │  │ +12% ↑  │ │         │ │ +8% ↑   │ │ spent   ││
│             │  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│             │                                                   │
│  ────────   │  ┌───────────────────────────────────────────┐   │
│  📚 Docs    │  │                                           │   │
│  💬 Help    │  │     Transaction Volume (Last 30 Days)     │   │
│             │  │                                           │   │
│             │  │     📈 [Line chart visualization]         │   │
│             │  │                                           │   │
│             │  └───────────────────────────────────────────┘   │
│             │                                                   │
│             │  Recent Activity                                  │
│             │  ┌───────────────────────────────────────────┐   │
│             │  │ ✅ Transfer  │ 0x1a..  │ 0.002 MNT │ 2m  │   │
│             │  │ ✅ Approve   │ 0x2b..  │ 0.001 MNT │ 5m  │   │
│             │  │ ❌ Mint      │ 0x3c..  │ Failed    │ 8m  │   │
│             │  │ ✅ Transfer  │ 0x4d..  │ 0.002 MNT │ 12m │   │
│             │  └───────────────────────────────────────────┘   │
│             │                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Stat Cards Design

Each stat card includes:
- Icon with colored background
- Metric value (large font)
- Metric label (small, muted)
- Trend indicator (arrow + percentage)
- Subtle hover glow effect

### Chart Design

- Clean area/line chart
- Tooltip on hover with exact values
- Toggle for different time ranges (7d, 30d, 90d)
- Responsive sizing
- Gradient fill under the line

---

## 💰 Paymaster Management

### Paymaster List View

```
┌─────────────────────────────────────────────────────────────────┐
│  Paymasters                                    [+ New Paymaster]│
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  [Search paymasters...]            [Filter ▼]  [Sort: Recent ▼] │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🟢 Production Paymaster                                    ││
│  │  0x1a2b3c4d5e6f7890...                              [Copy]  ││
│  │                                                              ││
│  │  Balance: 50.5 MNT    │  Transactions: 1,234  │  Users: 89  ││
│  │  Contracts: 3         │  Daily Limit: 100 MNT │  Status: ✅  ││
│  │                                                              ││
│  │                              [View Details →]  [⚙️]  [Pause] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🟡 Development Paymaster                      [Low Balance] ││
│  │  0x2b3c4d5e6f789012...                              [Copy]  ││
│  │                                                              ││
│  │  Balance: 0.5 MNT     │  Transactions: 45     │  Users: 12  ││
│  │  Contracts: 1         │  Daily Limit: None    │  Status: ⚠️  ││
│  │                                                              ││
│  │                              [View Details →]  [⚙️]  [Fund]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ── Empty State (if no paymasters) ──                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │        💰 No Paymasters Yet                                 ││
│  │                                                              ││
│  │    Create your first Paymaster to start sponsoring          ││
│  │    gas fees for your users.                                  ││
│  │                                                              ││
│  │              [Create First Paymaster]                        ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Create Paymaster Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Create New Paymaster                                      [×]  │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  Step 1 of 3: Basic Info                                        │
│  ●────○────○                                                    │
│                                                                  │
│  Name (optional)                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ My Production Paymaster                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Initial Deposit                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 10                                                   MNT  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│    💡 10 MNT ≈ 500 transactions                                 │
│                                                                  │
│  Quick amounts:  [1 MNT]  [5 MNT]  [10 MNT]  [25 MNT]          │
│                                                                  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                        [Cancel]  [Next Step →]  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Paymaster Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Paymasters                                           │
│                                                                  │
│  Production Paymaster                          🟢 Active        │
│  0x1a2b3c4d5e6f7890abcdef...                          [Copy]   │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Balance │ │ Trans.  │ │ Users   │ │ Gas     │              │
│  │ 50 MNT  │ │ 1,234   │ │   89    │ │ 12 MNT  │              │
│  │ [Fund]  │ │ Today:45│ │ New: 12 │ │ Spent   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  [Overview] [Whitelist] [Limits] [Transactions] [Settings]      │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │             Transaction Volume (Last 7 Days)             │  │
│  │                                                          │  │
│  │     📈 [Area chart visualization]                        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Spending Limits Status                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Daily:   ████████████████░░░░  80 / 100 MNT (80%)      │  │
│  │  Monthly: ████████░░░░░░░░░░░░  800 / 2000 MNT (40%)    │  │
│  │  Per-Tx:  5 MNT max                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Whitelist Management Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  Whitelisted Contracts                     [+ Add Contract]     │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📄 MyToken (ERC-20)                                     │  │
│  │  0x1234...5678                                           │  │
│  │                                                          │  │
│  │  Whitelisted Functions:                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │  │
│  │  │ transfer()  │ │ approve()   │ │ transferFrom│        │  │
│  │  │     ✓       │ │     ✓       │ │      ×      │        │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │  │
│  │                                                          │  │
│  │                          [Manage Functions]  [🗑 Remove] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📄 MyNFT (ERC-721)                                      │  │
│  │  0x5678...9012                                           │  │
│  │                                                          │  │
│  │  Whitelisted Functions:                                  │  │
│  │  ┌─────────────┐                                         │  │
│  │  │ mint()      │  ← All functions allowed               │  │
│  │  │     ✓       │                                         │  │
│  │  └─────────────┘                                         │  │
│  │                                                          │  │
│  │                          [Manage Functions]  [🗑 Remove] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Add Contract Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Contract to Whitelist                                 [×]  │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  Contract Address                                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 0x                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ✅ Contract detected: ERC-20 Token                            │
│     Name: MyToken (MTK)                                         │
│                                                                  │
│  Select Functions to Whitelist                                  │
│                                                                  │
│  ☑️ Allow all functions (less secure)                           │
│                                                                  │
│  Or select specific functions:                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ☑️ transfer(address,uint256)                              │ │
│  │ ☑️ approve(address,uint256)                               │ │
│  │ ☐ transferFrom(address,address,uint256)                   │ │
│  │ ☐ burn(uint256)                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                      [Cancel]  [Add to Whitelist]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Analytics & Monitoring

### Global Analytics Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Analytics                    [Last 7 days ▼]  [Export CSV]     │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Total   │ │ Success │ │ Failed  │ │ Avg Gas │              │
│  │ 5,678   │ │  98.5%  │ │  1.5%   │ │ 0.002   │              │
│  │ +23% ↑  │ │ +0.5% ↑ │ │ -0.5% ↓ │ │ MNT/tx  │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │        Transaction Volume Over Time                      │  │
│  │                                                          │  │
│  │    📈 [Area chart with success/failed breakdown]         │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────────┐   │
│  │ Gas Usage by Paymaster │  │  Top Contracts             │   │
│  │                        │  │                            │   │
│  │  🥧 [Pie chart]        │  │  1. MyToken - 45%          │   │
│  │                        │  │  2. MyNFT - 30%            │   │
│  │                        │  │  3. GameItems - 25%        │   │
│  └────────────────────────┘  └────────────────────────────┘   │
│                                                                  │
│  Recent Transactions                               [View All →] │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Hash       │ Paymaster │ User    │ Gas    │ Status │ Time│  │
│  │────────────│───────────│─────────│────────│────────│─────│  │
│  │ 0x1a2b...  │ Prod      │ 0x34... │ 0.002  │ ✅     │ 2m  │  │
│  │ 0x2b3c...  │ Prod      │ 0x45... │ 0.001  │ ✅     │ 5m  │  │
│  │ 0x3c4d...  │ Dev       │ 0x56... │ 0.003  │ ❌     │ 8m  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Transaction Details Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Transaction Details                                       [×]  │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  Status: ✅ Confirmed                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Transaction Hash                                        │  │
│  │  0x1a2b3c4d5e6f7890abcdef1234567890abcdef12     [Copy]  │  │
│  │                                      [View on Explorer ↗] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Details                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Paymaster     │  Production Paymaster (0x1a2b...)       │  │
│  │  User          │  0x3456...7890                          │  │
│  │  Target        │  MyToken (0x5678...9012)                │  │
│  │  Function      │  transfer(address,uint256)              │  │
│  │  Gas Used      │  45,000                                 │  │
│  │  Gas Cost      │  0.0023 MNT                             │  │
│  │  Timestamp     │  Jan 14, 2026, 10:30:45 AM             │  │
│  │  Block         │  #12345678                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Call Data                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  0xa9059cbb000000000000000000000000...          [Copy]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Settings & Configuration

### Settings Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings                                                       │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ Profile         │  ← Active tab                              │
│  │ API Keys        │                                            │
│  │ Notifications   │                                            │
│  │ Danger Zone     │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  ════════════════════════════════════════════════════════════  │
│                                                                  │
│  Profile                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  Wallet Address                                          │  │
│  │  0x1a2b3c4d5e6f7890abcdef1234567890abcdef12             │  │
│  │                                                          │  │
│  │  Display Name (optional)                                 │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ John's Workspace                                   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  Email (for notifications)                               │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ john@example.com                                   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │                                       [Save Changes]     │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Notifications Settings

```
┌──────────────────────────────────────────────────────────────┐
│  Notification Preferences                                    │
│                                                              │
│  Email Notifications                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ☑️ Low balance alerts                                 │ │
│  │     When Paymaster balance falls below threshold       │ │
│  │                                                        │ │
│  │  ☑️ Daily summary                                      │ │
│  │     Daily report of transactions and gas usage         │ │
│  │                                                        │ │
│  │  ☐ Weekly summary                                      │ │
│  │     Weekly analytics report                            │ │
│  │                                                        │ │
│  │  ☑️ Failed transactions                                │ │
│  │     Alert when transactions fail                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Low Balance Threshold                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1                                                 MNT  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                                           [Save Preferences] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Interaction Patterns

### Pattern 1: Optimistic UI Updates

**Scenario:** User funds Paymaster

Provide immediate visual feedback while blockchain confirms:

```
1. User clicks "Fund"
   → Immediately disable button
   → Show "Processing..." spinner
   → Update button text: "Confirming..."

2. Wallet popup appears
   → Keep button disabled
   → Show: "Waiting for wallet confirmation..."

3. User confirms in wallet
   → Show pending state in UI
   → Update balance with "(pending)" indicator
   → Show toast: "Transaction submitted!"

4. Transaction confirmed (2-5 seconds later)
   → Update balance to actual value
   → Remove "(pending)" indicator
   → Show toast: "Funded successfully! 🎉"
   → Re-enable button

5. If error occurs:
   → Revert all UI changes
   → Show error toast with clear reason
   → Provide "Try Again" action
   → Re-enable button
```

**Implementation:**

```tsx
const [isPending, setIsPending] = useState(false);
const [optimisticBalance, setOptimisticBalance] = useState(null);

const handleFund = async (amount) => {
  setIsPending(true);
  setOptimisticBalance(balance + amount); // Show optimistic update
  
  try {
    const tx = await fundPaymaster(amount);
    toast.success('Transaction submitted!');
    
    await tx.wait(); // Wait for confirmation
    
    // Fetch real balance
    const newBalance = await getBalance();
    setOptimisticBalance(null);
    setBalance(newBalance);
    toast.success('Funded successfully! 🎉');
  } catch (error) {
    setOptimisticBalance(null); // Revert
    toast.error(error.message);
  } finally {
    setIsPending(false);
  }
};
```

### Pattern 2: Progressive Disclosure

**Scenario:** Paymaster Details Page

```
Default View (Clean & Simple):
├─ Key metrics only (balance, transactions, status)
├─ One primary chart
└─ [View More Analytics →]

After clicking "View More":
├─ Expanded analytics section
├─ Multiple charts (gas usage, user growth)
├─ Detailed breakdown tables
└─ Export options

Tabs for Deep Dives:
├─ Overview (simple, high-level)
├─ Whitelist (when they need to configure)
├─ Analytics (when they want details)
└─ Settings (when they need to change things)
```

### Pattern 3: Dangerous Action Confirmation

**Scenario:** Pause Paymaster / Withdraw Funds

```tsx
// Level 1: Simple confirmation (Pause)
<ConfirmDialog
  title="Pause Paymaster?"
  description="Pausing will prevent new transactions. Existing pending transactions will complete."
  confirmText="Yes, Pause"
  cancelText="Cancel"
  variant="warning"
  onConfirm={handlePause}
/>

// Level 2: Text confirmation (Withdraw All - more dangerous)
<ConfirmDialog
  title="Withdraw All Funds?"
  description="This will transfer all remaining balance to your wallet. Your Paymaster will no longer be able to sponsor transactions."
  confirmText="WITHDRAW"
  requiresTextInput="WITHDRAW" // User must type this
  variant="danger"
  onConfirm={handleWithdrawAll}
/>

// Level 3: Countdown confirmation (Delete - irreversible)
<ConfirmDialog
  title="Delete Paymaster?"
  description="This action cannot be undone. All data will be permanently lost."
  confirmText="Delete Forever"
  countdownSeconds={5} // Button disabled for 5s
  variant="destructive"
  onConfirm={handleDelete}
/>
```

### Pattern 4: Real-Time Transaction Feed

```tsx
// Show live updates as transactions happen
<TransactionFeed
  paymasterAddress={address}
  maxItems={10}
  showToastOnNew={true}
  animations={{
    enter: 'slide-in-from-top',
    exit: 'fade-out'
  }}
/>

// Each new transaction:
// 1. Slides in from top with highlight
// 2. Highlight fades after 3 seconds
// 3. Shows toast: "New transaction: 0x1234..."
```

### Pattern 5: Smart Form Defaults

```tsx
// Funding amount with smart suggestions
<FundingForm>
  <Label>Amount to Fund</Label>
  <Input placeholder="10" suffix="MNT" />
  
  {/* Smart calculator */}
  <Calculator>
    💡 10 MNT ≈ 500 transactions
  </Calculator>
  
  {/* Quick amount buttons */}
  <QuickAmounts>
    <Button variant="outline">1 MNT</Button>
    <Button variant="outline">5 MNT</Button>
    <Button variant="outline" active>10 MNT</Button> {/* Recommended */}
    <Button variant="outline">25 MNT</Button>
  </QuickAmounts>
  
  {/* Balance context */}
  <BalanceInfo>
    Current balance: 42.3 MNT
    After funding: 52.3 MNT
  </BalanceInfo>
</FundingForm>
```

---

## 🧩 Component Specifications

### StatCard Component

```
┌─────────────────────────────┐
│ 💰 Balance             [•••]│ ← Icon + Title + Dropdown menu
├─────────────────────────────┤
│                             │
│        45.23 MNT            │ ← Large, bold value
│                             │
│   📈 +2.1 MNT today         │ ← Trend indicator (green/red)
│                             │
│   Last updated: 2m ago      │ ← Timestamp (muted)
│                             │
│ [Add Funds]                 │ ← Quick action button
└─────────────────────────────┘

States:
• Normal: Default card background
• Warning: Amber border/glow when balance low
• Critical: Red border/glow when balance critical  
• Loading: Skeleton shimmer animation
• Hover: Subtle lift + glow effect
```

**Props Interface:**

```typescript
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  timestamp?: Date;
  status?: 'normal' | 'warning' | 'critical';
  action?: {
    label: string;
    onClick: () => void;
  };
  menu?: DropdownMenuItem[];
  loading?: boolean;
}
```

### TransactionRow Component

**Desktop View:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 0x789...def  │ 0xabc...123 │ transfer() │ $0.12 │ ✅ │ 2m  │
└─────────────────────────────────────────────────────────────────┘
   TX Hash        User         Function     Cost   Status Time
```

**Mobile View (Card):**

```
┌─────────────────────────┐
│ transfer()          ✅ │
│ 0x789...def            │
│ From: 0xabc...123      │
│ Cost: $0.12            │
│ 2 minutes ago          │
│ [View Details →]        │
└─────────────────────────┘
```

### GasChart Component

```
┌─────────────────────────────────────────────────────────────────┐
│  Gas Spent Over Time      [24h ▼] [7d] [30d]      [•••] │
├─────────────────────────────────────────────────────────────────┤
│                                             ╱╲  │
│                                            ╱  ╲ │
│                  ╱╲               ╱        │
│                 ╱  ╲    ╱╲       ╱     │
│     ╱╲         ╱    ╲  ╱  ╲     ╱      │
│    ╱  ╲   ╱╲  ╱      ╲╱    ╲   ╱       │
│ ──╱────╲─╱──╲╱────────────── ╲╱────────│
│ 00:00  06:00  12:00   18:00   24:00    │
├─────────────────────────────────────────────────────────────────┤
│ Hover Tooltip:                                                  │
│ • 12:00 PM                                                      │
│ • 23 transactions                                               │
│ • $2.34 gas cost                                                │
└─────────────────────────────────────────────────────────────────┘

Features:
• Time range: 24h, 7d, 30d, 90d, All
• Toggle: Cumulative vs. Daily view
• Compare: Overlay multiple Paymasters
• Export: PNG image, CSV data
• Animation: Data points animate on load
• Gradient: Area fill with brand color gradient
```

### AlertBanner Component

```
Info (Blue):
┌─────────────────────────────────────────────────────────────────┐
│ ℹ️  New feature: Batch transactions now available! [Learn More]  │
└─────────────────────────────────────────────────────────────────┘

Warning (Yellow):
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Balance below 10 MNT - Consider adding funds   [Add Funds]  │
└─────────────────────────────────────────────────────────────────┘

Error (Red):
┌─────────────────────────────────────────────────────────────────┐
│ 🛑  Paymaster paused - Transactions will fail      [Unpause]    │
└─────────────────────────────────────────────────────────────────┘

Success (Green):
┌─────────────────────────────────────────────────────────────────┐
│ 🎉  1,000 transactions milestone reached!           [View Stats] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Features

### WebSocket Integration

```tsx
// Subscribe to live transaction updates
const useTransactionFeed = (paymasterAddress: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/transactions/${paymasterAddress}`
    );
    
    ws.onmessage = (event) => {
      const tx = JSON.parse(event.data);
      
      // Add to feed with animation
      setTransactions(prev => [tx, ...prev].slice(0, 10));
      
      // Show toast notification
      toast.success(`New transaction: ${truncateHash(tx.hash)}`, {
        action: {
          label: 'View',
          onClick: () => openTransactionModal(tx)
        }
      });
    };
    
    ws.onerror = () => {
      toast.error('Live updates disconnected. Retrying...');
    };
    
    return () => ws.close();
  }, [paymasterAddress]);
  
  return transactions;
};
```

### Balance Auto-Refresh

```tsx
// Auto-refresh balance every 30 seconds
const { data: balance, isLoading } = useQuery({
  queryKey: ['paymaster-balance', address],
  queryFn: () => getPaymasterBalance(address),
  refetchInterval: 30_000, // 30 seconds
  staleTime: 10_000, // Consider fresh for 10s
});
```

### Optimistic Updates with Rollback

```tsx
const mutation = useMutation({
  mutationFn: fundPaymaster,
  
  // Optimistically update cache
  onMutate: async (amount) => {
    await queryClient.cancelQueries(['paymaster-balance', address]);
    const previous = queryClient.getQueryData(['paymaster-balance', address]);
    queryClient.setQueryData(['paymaster-balance', address], (old) => old + amount);
    return { previous };
  },
  
  // Rollback on error
  onError: (err, variables, context) => {
    queryClient.setQueryData(['paymaster-balance', address], context.previous);
    toast.error('Transaction failed. Balance restored.');
  },
  
  // Refetch on success
  onSuccess: () => {
    queryClient.invalidateQueries(['paymaster-balance', address]);
    toast.success('Funded successfully! 🎉');
  },
});
```

---

## 📱 Responsive Design Strategy

### Breakpoints

| Name | Width | Devices |
|------|-------|---------|
| **sm** | 640px | Mobile landscape |
| **md** | 768px | Tablets |
| **lg** | 1024px | Small laptops |
| **xl** | 1280px | Desktops |
| **2xl** | 1536px | Large screens |

### Layout Adaptations

#### Mobile (< 768px)
- Sidebar collapses to bottom navigation
- Cards stack vertically
- Tables convert to card lists
- Charts have horizontal scroll
- Modals are full-screen

#### Tablet (768px - 1024px)
- Sidebar collapses to icon-only
- 2-column grid for cards
- Tables remain horizontal
- Modals are centered overlays

#### Desktop (> 1024px)
- Full sidebar with labels
- 4-column stat cards
- Full table views
- Standard modal overlays

### Mobile Navigation

```
Mobile Bottom Nav:
┌─────────────────────────────────────────────┐
│                                              │
│   [📊]     [💰]      [📈]       [⚙️]        │
│   Home    Paymasters Analytics  Settings    │
│                                              │
└─────────────────────────────────────────────┘
```

### Mobile Dashboard Layout

```
┌─────────────────────────┐
│  ☰  Mantle Gasless  👤 │ ← Sticky header
├─────────────────────────┤
│                         │
│  My Paymasters          │
│  ┌───────────────────┐ │
│  │ Gaming Paymaster  │ │ ← Horizontal scroll
│  │ 42.3 MNT         │ │
│  │ 🟢 Active        │ │
│  └───────────────────┘ │
│                         │
│  Quick Stats            │
│  ┌─────┐ ┌─────┐      │
│  │ 234 │ │ $12 │      │ ← 2 columns
│  │ TXs │ │ Gas │      │
│  └─────┘ └─────┘      │
│                         │
│  Recent Activity        │
│  • Transfer | $0.12    │
│  • Mint NFT | $0.34    │ ← Simplified list
│  • Approve  | $0.08    │
│                         │
├─────────────────────────┤
│ 🏠 📊 📄 ⚙️           │ ← Bottom nav
└─────────────────────────┘
```

### Touch-Friendly Considerations

| Element | Minimum Size | Notes |
|---------|--------------|-------|
| **Buttons** | 44px height | Apple HIG recommendation |
| **Touch Targets** | 48px × 48px | Material Design recommendation |
| **Input Fields** | 48px height | Comfortable for thumb input |
| **Spacing** | 8px minimum | Between interactive elements |

---

## ✨ Animation & Micro-interactions

### Page Transitions

- **Page Enter**: Fade in + slight slide up (200ms)
- **Page Exit**: Fade out (150ms)
- **Layout Shift**: Spring animation for smooth content reflow

### Component Animations

| Component | Animation | Duration |
|-----------|-----------|----------|
| **Modal Open** | Scale up + fade in | 200ms |
| **Modal Close** | Scale down + fade out | 150ms |
| **Dropdown** | Slide down + fade in | 150ms |
| **Toast** | Slide in from right | 300ms |
| **Card Hover** | Subtle lift (translateY -2px) | 150ms |
| **Button Press** | Scale down to 0.98 | 100ms |
| **Skeleton** | Shimmer pulse | Infinite |

### Number Animations

- Stats counters use counting animation on mount
- Percentage changes animate between values
- Chart data points animate on hover

### Loading States

```
┌─────────────────────────────────────────────┐
│  ┌────────────────┐  ┌────────────────┐    │
│  │ ░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │    │  ← Skeleton cards
│  │ ░░░░░          │  │ ░░░░░          │    │
│  │ ░░░░░░░░       │  │ ░░░░░░░░       │    │
│  └────────────────┘  └────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │  ← Skeleton chart
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 🗃 State Management

### Global State (Zustand)

```
stores/
├── useAuthStore.ts       # Wallet connection, user data
├── usePaymasterStore.ts  # Paymasters list, selected paymaster
├── useUIStore.ts         # Modals, sidebar, theme
└── useNotificationStore.ts # Toasts, alerts
```

### State Structure

**Auth Store:**
- `address`: Connected wallet address
- `isConnected`: Connection status
- `chainId`: Current chain
- `connect()` / `disconnect()`

**Paymaster Store:**
- `paymasters`: List of user's paymasters
- `selectedPaymaster`: Currently viewed paymaster
- `fetchPaymasters()` / `createPaymaster()` / `updatePaymaster()`

**UI Store:**
- `sidebarOpen`: Sidebar visibility
- `theme`: 'light' | 'dark' | 'system'
- `modals`: Active modal states

### Data Fetching

- **Server Components**: Initial page data (SSR)
- **React Query / SWR**: Client-side caching and revalidation
- **Real-time**: WebSocket for live transaction updates (optional)

---

## ⚡ Performance Optimization

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| **LCP** | < 2.5s |
| **FID** | < 100ms |
| **CLS** | < 0.1 |

### Optimization Strategies

1. **Code Splitting**
   - Route-based splitting (automatic with App Router)
   - Dynamic imports for heavy components (charts, modals)

2. **Image Optimization**
   - Next.js Image component for automatic optimization
   - WebP/AVIF formats
   - Lazy loading below-fold images

3. **Font Optimization**
   - `next/font` for automatic font optimization
   - Font subsetting for faster load

4. **Caching Strategy**
   - Static pages cached at CDN edge
   - API responses cached with appropriate TTL
   - Client-side caching with React Query

5. **Bundle Size**
   - Tree-shaking unused code
   - Analyze bundle with `@next/bundle-analyzer`
   - Lazy load non-critical features

---

## ♿ Accessibility (a11y)

### Standards

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility

### Implementation

| Feature | Implementation |
|---------|----------------|
| **Focus Management** | Visible focus rings, logical tab order |
| **ARIA Labels** | All interactive elements have labels |
| **Color Contrast** | Minimum 4.5:1 ratio |
| **Motion** | Respect `prefers-reduced-motion` |
| **Announcements** | Live regions for dynamic content |
| **Alt Text** | All images have descriptive alt text |

### Testing

- Automated: axe-core, Lighthouse
- Manual: Keyboard-only navigation testing
- Screen reader: VoiceOver, NVDA testing

---

## � Success Metrics & KPIs

### Primary Success Indicators

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Time to First Paymaster** | < 5 minutes | Analytics: wallet_connected → paymaster_created |
| **Onboarding Completion Rate** | > 70% | Users who complete all 4 setup steps |
| **Daily Active Users** | Track growth | Unique wallet connections per day |
| **Transaction Success Rate** | > 98% | Successful vs failed relay transactions |
| **Page Load Time** | < 2 seconds | Core Web Vitals (LCP) |

### User Engagement Metrics

```tsx
// Track key events with analytics
import { analytics } from '@/lib/analytics';

// Onboarding funnel
analytics.track('wallet_connected', { address, chainId });
analytics.track('paymaster_created', { address, initialFunding });
analytics.track('paymaster_funded', { address, amount });
analytics.track('whitelist_configured', { paymasterAddress, contractsCount });
analytics.track('sdk_code_copied', { framework, page });

// Feature usage
analytics.track('transaction_viewed', { txHash });
analytics.track('analytics_exported', { format, dateRange });
analytics.track('spending_limit_set', { limitType, amount });

// Engagement
analytics.track('session_duration', { minutes });
analytics.track('pages_per_session', { count });
analytics.track('return_visit', { daysSinceLastVisit });
```

### Business Metrics

| Metric | Description | Goal |
|--------|-------------|------|
| **Total Paymasters** | Number of active Paymasters | Growth indicator |
| **Total Gas Sponsored** | MNT spent across all Paymasters | Platform value |
| **User Gas Savings** | $ saved by end users | Marketing metric |
| **Monthly Active Paymasters** | Paymasters with ≥1 tx/month | Retention metric |

### Quality Indicators

**You Know It's Good When:**

- ✅ Users create first Paymaster in < 5 minutes
- ✅ No support tickets asking "how do I...?"
- ✅ Users return daily to check metrics
- ✅ Net Promoter Score (NPS) > 50
- ✅ Code examples work on first try
- ✅ Low bounce rate on quickstart page
- ✅ High "Was this helpful?" votes

---

## ✅ UX Checklist

### Pre-Launch Checklist

#### Onboarding
- [ ] First-time user tour/welcome modal
- [ ] Progressive disclosure (don't overwhelm new users)
- [ ] Clear next steps visible at every stage
- [ ] Milestone celebrations (first Paymaster, first TX, etc.)
- [ ] Skip tour option available
- [ ] Contextual tooltips for technical terms

#### Performance
- [ ] Page load < 2 seconds (LCP target)
- [ ] Optimistic UI updates for all blockchain actions
- [ ] Skeleton loaders (no blank screens ever)
- [ ] Smooth animations (< 300ms)
- [ ] No layout shift during loading (CLS < 0.1)
- [ ] Lazy loading for below-fold content

#### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible (ARIA labels)
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Error messages are clear and actionable
- [ ] Focus indicators always visible
- [ ] Respects `prefers-reduced-motion`
- [ ] Form inputs have proper labels

#### Responsiveness
- [ ] Works on mobile (320px minimum)
- [ ] Touch-friendly targets (44px minimum)
- [ ] No horizontal scroll on any device
- [ ] Readable text size (16px minimum)
- [ ] Bottom navigation on mobile
- [ ] Tables convert to cards on mobile

#### Error Handling
- [ ] All errors show user-friendly messages
- [ ] Network errors have retry options
- [ ] Wallet errors explain what went wrong
- [ ] Form validation shows inline errors
- [ ] Failed transactions show clear reasons

#### Polish
- [ ] Consistent spacing throughout
- [ ] Loading states for every async action
- [ ] Empty states are helpful (not just "No data")
- [ ] Error states suggest solutions
- [ ] Success states celebrate appropriately
- [ ] Copy buttons work with feedback
- [ ] External links open in new tab
- [ ] All timestamps show relative time ("2m ago")

#### Security
- [ ] Dangerous actions require confirmation
- [ ] Critical actions require text input confirmation
- [ ] Session timeout after inactivity
- [ ] Wallet disconnect clears sensitive data
- [ ] No sensitive data in localStorage

#### Testing
- [ ] Tested in Chrome, Firefox, Safari, Edge
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] No console errors in production
- [ ] All links work (no 404s)
- [ ] All forms submit correctly
- [ ] Wallet connection works with MetaMask
- [ ] Wallet connection works with WalletConnect

---

## �🚀 Deployment Strategy

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | localhost:3000 | Local development |
| **Preview** | pr-*.vercel.app | PR previews |
| **Staging** | staging.mantle-relayer.xyz | Pre-production testing |
| **Production** | app.mantle-relayer.xyz | Live application |

### CI/CD Pipeline

```
Push to PR → Build → Lint → Type Check → Test → Preview Deploy
                                                      ↓
                                              [Review & Approve]
                                                      ↓
Merge to main → Build → Test → Deploy to Staging → Smoke Tests
                                                      ↓
                                              [Manual Approval]
                                                      ↓
                                            Deploy to Production
```

### Environment Variables

```
# Public
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_RELAYER_URL=https://api.mantle-relayer.xyz
NEXT_PUBLIC_FACTORY_ADDRESS=0x4F5f...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx

# Private (server-only)
DATABASE_URL=xxx
JWT_SECRET=xxx
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Next.js 14, Tailwind, TypeScript)
- [ ] Design system setup (shadcn/ui installation)
- [ ] Configure Wagmi + RainbowKit for wallet connection
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Set up routing structure (marketing + dashboard groups)
- [ ] Configure environment variables
- [ ] Set up Zustand stores (auth, paymaster, UI)
- [ ] Create base components (Button, Card, Input, Modal)

### Phase 2: Landing Page (Week 1-2)
- [ ] Hero section with animated gradient background
- [ ] Stats counter with number animation
- [ ] How it works section (3-step flow)
- [ ] Features bento grid
- [ ] Code preview with syntax highlighting + copy
- [ ] Use cases tabs section
- [ ] CTA section with gradient border
- [ ] Footer with links
- [ ] Mobile responsive testing

### Phase 3: Authentication & Onboarding (Week 2)
- [ ] Connect wallet modal (RainbowKit customized)
- [ ] Sign message authentication flow
- [ ] Network switch prompt
- [ ] First-time user welcome modal
- [ ] Onboarding checklist component
- [ ] Progress indicator
- [ ] Protected route middleware

### Phase 4: Dashboard Core (Week 2-3)
- [ ] Dashboard home with stat cards
- [ ] Transaction volume chart (Recharts)
- [ ] Recent activity feed
- [ ] Paymaster list view with cards
- [ ] Empty state for no paymasters
- [ ] Create paymaster modal (3-step wizard)
- [ ] Fund paymaster flow
- [ ] Basic paymaster detail page

### Phase 5: Paymaster Features (Week 3)
- [ ] Whitelist management UI
- [ ] Add contract modal with auto-detection
- [ ] Function selector component
- [ ] Spending limits configuration
- [ ] Progress bars for limit usage
- [ ] Transaction history table
- [ ] Transaction detail modal
- [ ] Pause/unpause functionality

### Phase 6: Analytics & Settings (Week 4)
- [ ] Analytics page with multiple charts
- [ ] Date range selector
- [ ] CSV export functionality
- [ ] Settings page layout
- [ ] Profile settings
- [ ] Notification preferences
- [ ] Low balance threshold config
- [ ] Danger zone (withdraw all, delete)

### Phase 7: Polish & Testing (Week 4)
- [ ] Loading skeletons throughout
- [ ] Error boundary implementation
- [ ] Toast notifications (Sonner)
- [ ] Optimistic UI updates
- [ ] Mobile responsive fixes
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Final QA and bug fixes

---

## � Visual Process Flows

### Create Paymaster Flow (Complete)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CREATE PAYMASTER FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

  USER ACTIONS                 SYSTEM RESPONSE               UI FEEDBACK
  ────────────                 ───────────────               ───────────

  Click "Create               Show step 1 modal            Modal opens with
  Paymaster" button  ───────► (Name & Description)   ────► smooth animation
        │                            │
        ▼                            ▼
  Enter name &                Validate inputs              Real-time
  description        ───────► (3+ chars for name)   ────► validation feedback
        │                            │
        ▼                            ▼
  Click "Next"                Show step 2                   Progress bar
                     ───────► (Funding amount)      ────► moves to 66%
        │                            │
        ▼                            ▼
  Enter funding               Check wallet balance          Warning if
  amount             ───────► vs. requested amount  ────► insufficient
        │                            │
        ▼                            ▼
  Click "Create &             Prepare transaction           Show confirmation
  Fund"              ───────► for signing            ────► summary
        │                            │
        ▼                            ▼
  Sign transaction            Deploy contract +             Show "Confirming..."
  in wallet          ───────► Fund in one tx         ────► with spinner
        │                            │
        ▼                            ▼
  Transaction                 Listen for receipt            Update to
  submitted          ───────► Wait for confirmation  ────► "Processing..."
        │                            │
        ▼                            ▼
  Tx confirmed                Update local state            🎉 Success modal!
  on-chain           ───────► Refresh Paymaster list ────► Confetti animation
        │                            │
        ▼                            ▼
  View new                    Navigate to detail            Start onboarding
  Paymaster          ───────► page automatically    ────► checklist
```

### Execute Gasless Transaction Flow (SDK to Backend)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GASLESS TRANSACTION FLOW (E2E)                       │
└─────────────────────────────────────────────────────────────────────────┘

 END USER               dAPP + SDK              RELAYER               CHAIN
 ────────               ──────────              ───────               ─────

 Click "Mint"          Build meta-tx
 in dApp      ───────► with SDK        
     │                      │
     ▼                      ▼
 Sign EIP-712          Validate &              POST to
 message      ───────► Serialize      ───────► /relay/execute
     │                      │                      │
     │                      │                      ▼
     │                      │              Verify signature
     │                      │              Check whitelist
     │                      │              Check Paymaster balance
     │                      │                      │
     │                      │                      ▼
     │                      │              Submit to chain ───────► Execute tx
     │                      │                      │                    │
     │                 Poll for                    │                    ▼
     │                 status     ◄────────  Return txHash        Confirm block
     │                      │                      │                    │
     ▼                      ▼                      ▼                    ▼
 See success           Update UI              Log transaction    State changed
 toast        ◄──────  with result   ◄──────  in database   ◄──────  on-chain

 TOTAL TIME: ~3-8 seconds (depending on network congestion)
```

---

## 📝 Document Summary

### Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 14 App Router | Best DX, RSC, excellent ecosystem |
| **Styling** | Tailwind + shadcn/ui | Fast development, consistent design |
| **State** | Zustand + React Query | Simple local state, smart server cache |
| **Web3** | Wagmi v2 + RainbowKit | Modern hooks, great wallet UX |
| **Charts** | Recharts | Flexible, responsive, well-documented |
| **Animations** | Framer Motion | Production-ready, performant |

### Design Principles Summary

1. **Speed**: Page loads < 2s, interactions feel instant
2. **Clarity**: Users always know what's happening and what to do next
3. **Trust**: Full transparency on gas costs, transaction status
4. **Delight**: Small celebrations make the experience memorable
5. **Accessibility**: Works for everyone, on every device

### Critical Success Factors

✅ **First Paymaster created in < 5 minutes**  
✅ **Zero "how do I...?" support tickets**  
✅ **> 70% onboarding completion rate**  
✅ **Daily active users return to dashboard**  
✅ **Code examples work first try**  

---

## 🔗 Related Documents

- [Documentation Site Design](./DOCUMENTATION_SITE_DESIGN.md) - Developer docs portal spec
- [Frontend Requirements](./FRONTEND_REQUIREMENTS.md) - Technical requirements
- [UI/UX Flows](./UI_UX_FLOWS.md) - Detailed interaction flows
- [API Reference](../DEVELOPER_GUIDE.md) - Backend API documentation
- [SDK README](../../sdk/README.md) - SDK integration guide

---

## 📜 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-14 | Initial document creation |
| 1.1.0 | 2025-01-14 | Added user personas, journey maps, interaction patterns |
| 1.2.0 | 2025-01-14 | Added success metrics, UX checklist, visual flows |

---

**Document Owner**: Frontend Team  
**Last Review**: January 14, 2025  
**Next Review**: Before Phase 2 completion
