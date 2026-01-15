# Mantle Gasless Relayer - Frontend Application Build Prompts

**Document Purpose**: Step-by-step AI prompts for building the complete frontend application  
**Format**: Instructions only, no code implementations  
**Build Philosophy**: Component-based, real-time updates, max 600 lines per file  

---

## 📋 Table of Contents

1. [Project Setup Prompts](#phase-1-project-setup)
2. [Design System Prompts](#phase-2-design-system)
3. [Layout Components Prompts](#phase-3-layout-components)
4. [Landing Page Prompts](#phase-4-landing-page)
5. [Authentication Prompts](#phase-5-authentication)
6. [Dashboard Core Prompts](#phase-6-dashboard-core)
7. [Paymaster Management Prompts](#phase-7-paymaster-management)
8. [Analytics Prompts](#phase-8-analytics)
9. [Settings Prompts](#phase-9-settings)
10. [Real-Time Features Prompts](#phase-10-real-time-features)
11. [Polish & Optimization Prompts](#phase-11-polish--optimization)

---

## 🎨 Color Palette Reference

Use these colors consistently throughout all prompts:

| Name | Hex Value | Usage |
|------|-----------|-------|
| **Primary** | `#6366F1` (Indigo) | CTAs, links, focus states |
| **Primary Light** | `#818CF8` | Hover states, accents |
| **Secondary** | `#0EA5E9` (Sky) | Secondary buttons, highlights |
| **Success** | `#22C55E` (Green) | Success states, active status |
| **Warning** | `#F59E0B` (Amber) | Low balance, warnings |
| **Error** | `#EF4444` (Red) | Errors, failed transactions |
| **Background** | `#09090B` | Page background (dark) |
| **Card** | `#18181B` | Card surfaces |
| **Border** | `#27272A` | Dividers, borders |
| **Text Primary** | `#FAFAFA` | Main text |
| **Text Muted** | `#A1A1AA` | Secondary text |

---

## Phase 1: Project Setup

### Prompt 1.1 - Initialize Next.js Project

```
Create a new Next.js 14 project with the App Router for a Web3 developer dashboard 
called "Mantle Gasless Relayer". 

Requirements:
- Use TypeScript in strict mode
- Use the App Router (not Pages Router)
- Configure for dark mode as default
- Set up path aliases with @ symbol pointing to the root
- Include ESLint with strict rules
- Include Prettier for code formatting
- Create a proper folder structure separating concerns

The project should be production-ready from the start with proper 
TypeScript configuration and linting.
```

### Prompt 1.2 - Install Core Dependencies

```
Install and configure the following dependencies for the Mantle Gasless Relayer 
frontend project:

Styling:
- TailwindCSS version 4 with dark mode support
- Configure custom colors using the provided color palette
- Set up the Inter font for sans-serif and JetBrains Mono for monospace

State Management:
- Zustand for global state management
- React Query (TanStack Query) for server state and caching

Forms & Validation:
- React Hook Form for performant form handling
- Zod for schema validation

Utilities:
- date-fns for date formatting
- clsx and tailwind-merge for className utilities

Create a utility function called "cn" that merges Tailwind classes properly.
```

### Prompt 1.3 - Install shadcn/ui

```
Set up shadcn/ui component library for the project with the following configuration:

Style: Default (we will customize)
Base color: Zinc (dark theme)
CSS variables: Yes

Install these initial components:
- Button (all variants: default, secondary, outline, ghost, destructive, link)
- Card
- Input
- Label
- Dialog (Modal)
- Dropdown Menu
- Tooltip
- Badge
- Separator
- Skeleton
- Toast (using Sonner)
- Tabs
- Table
- Select
- Checkbox
- Switch
- Progress
- Alert
- Avatar

Configure the components to use our custom color palette with Indigo as primary.
```

### Prompt 1.4 - Install Web3 Dependencies

```
Install and configure Web3 dependencies for wallet connection and blockchain 
interaction:

Packages needed:
- Wagmi version 2 for React hooks
- Viem for Ethereum interactions
- RainbowKit for wallet connection UI

Configuration requirements:
- Set up for Mantle Sepolia testnet (Chain ID: 5003)
- Configure these wallets: MetaMask, Rainbow, WalletConnect, Coinbase Wallet
- Create a Web3 provider wrapper component
- Set up the chain configuration with proper RPC endpoints

RPC URL: https://rpc.sepolia.mantle.xyz
Block Explorer: https://sepolia.mantlescan.xyz

The provider should wrap the entire application and be ready for wallet 
connection from any page.
```

### Prompt 1.5 - Set Up Project Folder Structure

```
Create the complete folder structure for the Mantle Gasless Relayer frontend:

app/
├── (marketing)/          - Public pages (landing, pricing, about)
├── (dashboard)/          - Protected dashboard pages
├── (auth)/               - Authentication pages
├── api/                  - API routes for backend communication
├── layout.tsx            - Root layout with providers
└── globals.css           - Global styles and CSS variables

components/
├── ui/                   - shadcn/ui components
├── layout/               - Header, Sidebar, Footer
├── landing/              - Landing page sections
├── dashboard/            - Dashboard-specific components
├── paymaster/            - Paymaster management components
├── charts/               - Chart components
├── web3/                 - Wallet connection components
└── shared/               - Reusable components

hooks/                    - Custom React hooks
stores/                   - Zustand stores
lib/                      - Utility functions
types/                    - TypeScript type definitions
config/                   - App configuration
public/                   - Static assets (images, icons)

Each folder should have an index.ts file for clean exports.
```

---

## Phase 2: Design System

### Prompt 2.1 - Configure Global CSS Variables

```
Set up the global CSS variables for the design system in globals.css:

Define CSS variables for:
- All colors from the color palette (primary, secondary, success, warning, error)
- Background colors (background, card, popover)
- Text colors (foreground, muted-foreground)
- Border colors and radius values
- Spacing scale (based on 4px increments)
- Shadow definitions optimized for dark mode

Configure Tailwind to use these CSS variables so we can easily theme the app.

Set dark mode as the default with a class-based toggle for light mode.
The design should feel premium and modern, similar to Vercel or Linear.
```

### Prompt 2.2 - Typography Configuration

```
Configure the typography system for the application:

Font families:
- Sans-serif: Inter (for body text and UI)
- Monospace: JetBrains Mono (for code and addresses)

Type scale with proper line heights:
- Display: 48px (for hero headlines)
- H1: 36px (page titles)
- H2: 30px (section titles)
- H3: 24px (card titles)
- H4: 20px (subsections)
- Body Large: 18px (lead paragraphs)
- Body: 16px (default)
- Body Small: 14px (secondary text)
- Caption: 12px (labels, badges)

Create typography utility classes that can be applied consistently.
All text should be optimized for readability on dark backgrounds.
```

### Prompt 2.3 - Create Base Component Variants

```
Customize the shadcn/ui components to match our design system:

Button variants:
- Primary: Indigo background with white text, glow effect on hover
- Secondary: Transparent with indigo border
- Ghost: Transparent, subtle hover background
- Destructive: Red background for dangerous actions
- All buttons should have smooth transitions and scale slightly on click

Card variants:
- Default: Dark card background with subtle border
- Interactive: Adds hover lift effect and border glow
- Highlighted: Has a gradient border (indigo to sky)
- Stat: Designed for metric display with icon support

Input styling:
- Dark background with subtle border
- Focus state with indigo ring
- Error state with red ring and message

All components should support loading states with proper skeletons.
```

### Prompt 2.4 - Create Icon System

```
Set up the icon system using Lucide React icons:

Install Lucide React and configure tree-shaking for optimal bundle size.

Create an Icon component wrapper that:
- Accepts a size prop (sm, md, lg, xl)
- Accepts a color prop that maps to our color palette
- Has consistent sizing across the app

Identify and document the icons we'll need:
- Navigation: Home, Wallet, BarChart, Settings, Menu, X
- Actions: Plus, Copy, ExternalLink, Download, Refresh
- Status: Check, X, AlertTriangle, Info, Loader
- Paymaster: Fuel, Shield, Lock, Unlock, DollarSign
- Analytics: TrendingUp, TrendingDown, Activity, PieChart

Create a constants file mapping icon names to their components.
```

---

## Phase 3: Layout Components

### Prompt 3.1 - Create Marketing Layout Header

```
Create the header component for marketing pages (landing, pricing, about):

Structure:
- Fixed/sticky position at the top
- Blur backdrop effect when scrolling
- Logo on the left (text logo "Mantle Relayer" with accent color)
- Navigation links in the center: Features, Pricing, Docs
- Connect Wallet button on the right (primary style)

Behavior:
- Header becomes more opaque as user scrolls down
- Smooth transition for the backdrop blur
- Mobile: Hamburger menu that opens a slide-out navigation

The header should feel lightweight but provide clear navigation.
Height should be 64px on desktop, 56px on mobile.
```

### Prompt 3.2 - Create Dashboard Sidebar

```
Create the sidebar navigation for the dashboard pages:

Structure:
- Fixed position on the left side
- Width: 240px on desktop, collapsible to 64px (icons only)
- Logo at the top
- Main navigation section with icons and labels
- Secondary section at bottom for Docs and Support
- User section at very bottom showing wallet address and disconnect

Navigation items:
1. Dashboard (home icon) - /dashboard
2. Paymasters (wallet icon) - /paymasters
3. Analytics (chart icon) - /analytics
4. Settings (gear icon) - /settings

Each item should:
- Show active state with indigo highlight
- Have hover effect with subtle background
- Display tooltip when sidebar is collapsed

Mobile: Convert to bottom tab navigation with 4 main items.
```

### Prompt 3.3 - Create Dashboard Layout Wrapper

```
Create the dashboard layout component that wraps all protected pages:

Structure:
- Sidebar on the left (collapsible)
- Main content area that adjusts width based on sidebar state
- Top bar within content area showing:
  - Page breadcrumbs
  - Notification bell icon
  - User wallet address with avatar

Features:
- Persist sidebar collapse state in localStorage
- Animate the content area width transition smoothly
- Include a slot for page actions (buttons that appear in the top bar)
- Handle loading states with page-level skeleton

The layout should prevent layout shift when navigating between pages.
Content area should have max-width of 1400px and be centered.
```

### Prompt 3.4 - Create Footer Component

```
Create the footer component for marketing pages:

Structure (4 columns on desktop):
Column 1: Logo and brief tagline "Gasless transactions on Mantle"
Column 2: Product links (Features, Pricing, Changelog, Status)
Column 3: Resources (Documentation, SDK Reference, Tutorials, GitHub)
Column 4: Company (About, Blog, Careers, Contact)

Bottom section:
- Copyright text on the left
- Social links on the right (Twitter/X, GitHub, Discord)
- Privacy and Terms links

Styling:
- Subtle top border separating from content
- Muted text colors for links
- Links brighten on hover
- Padding: 64px top, 32px bottom

Mobile: Stack columns vertically with accordion for each section.
```

---

## Phase 4: Landing Page

### Prompt 4.1 - Create Hero Section

```
Create the hero section for the landing page:

Layout:
- Full viewport height minus header (100vh - 64px)
- Centered content with max-width 1000px
- Animated gradient mesh background (indigo to sky, subtle animation)

Content hierarchy:
1. Badge at top: "Built for Mantle" with chain icon
2. Main headline: "Let Your Users Transact Without Gas"
   - Display size font, bold
   - Key words can have gradient text effect
3. Subheadline: Two lines explaining the value proposition
   - Body Large size, muted color
4. CTA buttons row:
   - Primary: "Get Started Free" (links to dashboard)
   - Secondary: "View Documentation" (outline style)
5. Below CTAs: Small trust text "Free on testnet • No credit card required"

Animation:
- Content fades in and slides up on page load
- Stagger the animations (badge, headline, subheadline, buttons)
- Background gradient slowly shifts colors
```

### Prompt 4.2 - Create Stats Counter Section

```
Create a stats counter section below the hero:

Layout:
- Three stat cards in a row (horizontal on desktop, stack on mobile)
- Subtle card background with no visible border
- Centered within the page

Stats to display:
1. "10,000+" - Transactions Sponsored
2. "500+" - Developers Building  
3. "$50,000+" - Gas Saved for Users

Animation:
- Numbers should animate/count up when they scroll into view
- Use intersection observer to trigger the animation
- Count animation should take about 2 seconds
- Only animate once (don't re-animate on scroll back)

Each stat card should have:
- Large number (H2 size) in white
- Label below in muted color
- Optional small trend indicator
```

### Prompt 4.3 - Create "How It Works" Section

```
Create the "How It Works" section showing the 3-step process:

Section header:
- "How It Works" as H2 title
- Subtitle: "Get started in under 5 minutes"

Three steps in horizontal layout:
Step 1: Create Paymaster
- Icon: Plus or Wallet icon in indigo circle
- Title: "Create Paymaster"
- Description: "Deploy your gas-sponsoring contract with one click"

Step 2: Fund & Configure
- Icon: DollarSign icon
- Title: "Fund & Configure"  
- Description: "Add MNT and whitelist the contracts users can interact with"

Step 3: Integrate SDK
- Icon: Code icon
- Title: "Integrate SDK"
- Description: "Copy-paste our SDK into your dApp and go live"

Visual connections:
- Animated dashed line or arrow connecting the steps
- Steps should highlight sequentially on scroll
- Each step card elevates slightly on hover

Mobile: Stack vertically with connecting line down the left side.
```

### Prompt 4.4 - Create Features Bento Grid

```
Create a bento grid section showcasing key features:

Section header:
- "Built for Developers" as H2
- Subtitle: "Everything you need to offer gasless transactions"

Grid layout (2x3 on desktop, 1 column on mobile):

Feature 1 (large, spans 2 columns):
- Title: "Complete Cost Control"
- Description: Set per-transaction, daily, and monthly spending limits
- Visual: Mini progress bar illustration

Feature 2:
- Title: "Secure by Design"  
- Description: EIP-712 signatures, whitelist contracts, pause anytime
- Visual: Shield icon

Feature 3:
- Title: "Real-time Analytics"
- Description: Track every transaction, monitor costs, see unique users
- Visual: Mini chart illustration

Feature 4:
- Title: "Lightning Fast"
- Description: Sub-second relay times optimized for Mantle L2
- Visual: Zap/lightning icon

Feature 5:
- Title: "TypeScript SDK"
- Description: Fully typed, well-documented, works with any framework
- Visual: TypeScript logo or code brackets

Feature 6:
- Title: "Low Balance Alerts"
- Description: Get notified before your Paymaster runs out of funds
- Visual: Bell icon

Cards should have hover effects (lift + subtle glow).
```

### Prompt 4.5 - Create Code Preview Section

```
Create a code preview section showing how easy integration is:

Section header:
- "Integrate in Minutes" as H2
- Subtitle: "Simple API, powerful results"

Layout:
- Left side: Text content explaining the simplicity
- Right side: Code block with syntax highlighting

Left content:
- List of benefits with check icons:
  - "Works with any React framework"
  - "Full TypeScript support"
  - "Handles all complexity for you"
  - "Users sign, we relay"
- CTA button: "View Full Documentation"

Code block requirements:
- Dark background (darker than page background)
- Syntax highlighting using appropriate colors
- Line numbers on the left
- Copy button in top right corner
- Language label showing "TypeScript"
- Show 10-15 lines of example code
- Code should show the basic SDK usage flow

Copy button behavior:
- Shows "Copy" initially with copy icon
- Changes to "Copied!" with check icon for 2 seconds after click
- Toast notification confirming copy
```

### Prompt 4.6 - Create Use Cases Tabs Section

```
Create a tabbed section showing different use cases:

Section header:
- "Power Any Use Case" as H2
- Subtitle: "See how teams are using gasless transactions"

Tab navigation (horizontal):
- Gaming
- NFTs
- DeFi
- Social

Each tab content should include:
- Icon representing the use case
- Short quote or testimonial style text
- 3-4 bullet points of example use cases
- Optional: Small logo of a project using it (placeholder)

Gaming tab content:
- "Perfect for in-game transactions"
- Examples: Item purchases, achievement minting, player trades

NFTs tab content:
- "Seamless NFT minting experience"
- Examples: Free mints, gasless transfers, lazy minting

DeFi tab content:
- "Onboard users to DeFi easily"
- Examples: First-time deposits, token approvals, small trades

Social tab content:
- "Frictionless social interactions"
- Examples: Posting, tipping, following, NFT gifts

Tab transition should be smooth with fade animation.
Active tab should have indigo underline indicator.
```

### Prompt 4.7 - Create Final CTA Section

```
Create the final call-to-action section before the footer:

Layout:
- Full-width section with gradient background
- Or: Card with gradient border (indigo to sky)
- Centered content

Content:
- Headline: "Ready to Go Gasless?"
- Subtext: "Start sponsoring transactions for your users today. Free on testnet."
- Primary CTA button: "Get Started Free" (large size)
- Trust text below: "No credit card required • Deploy in minutes"

Visual effects:
- Subtle animated gradient in background
- Button should have glow effect
- Consider adding floating decorative elements (small icons or dots)

This section should create urgency and make the next step crystal clear.
Plenty of whitespace around the CTA to draw focus.
```

---

## Phase 5: Authentication

### Prompt 5.1 - Create Connect Wallet Modal

```
Create the wallet connection modal using RainbowKit as base:

Trigger: "Connect Wallet" button anywhere in the app

Modal content:
- Title: "Connect Your Wallet"
- List of wallet options with icons:
  - MetaMask
  - Rainbow
  - WalletConnect (shows QR code flow)
  - Coinbase Wallet
- Divider line
- Help link: "New to wallets? Learn more →"

Customization on top of RainbowKit:
- Match our dark theme and color palette
- Rounded corners matching our design system
- Smooth open/close animations
- Loading state while connecting

After successful connection:
- Close modal
- Show success toast: "Wallet connected!"
- If on marketing page, redirect to dashboard
- Store connection state for persistence
```

### Prompt 5.2 - Create Sign Message Authentication

```
Create the signature-based authentication flow:

When user connects wallet for first time:
1. Show a "Verify Ownership" step
2. Explain: "Sign this message to verify you own this wallet. This is free."
3. Generate a sign-in message with:
   - App name: "Mantle Gasless Relayer"
   - Nonce: Random string for security
   - Timestamp: Current ISO timestamp
   - Statement: "Sign in to access your dashboard"

User flow:
1. User clicks "Sign to Continue"
2. Wallet popup appears with message to sign
3. Show loading state: "Waiting for signature..."
4. On success: Store JWT or session token
5. Redirect to dashboard

Error handling:
- User rejects: Show message "Signature required to continue" with retry button
- Timeout: Show "Request timed out" with retry option
- Any error: Show generic error with support link

This is NOT a transaction - make that clear to users (no gas).
```

### Prompt 5.3 - Create Network Switch Prompt

```
Create a network switch component for when user is on wrong network:

Detection:
- Check connected chain ID on wallet connection
- Required: Mantle Sepolia (Chain ID: 5003)
- Show prompt if any other network detected

Prompt UI (can be modal or banner):
- Warning icon in amber/yellow
- Title: "Wrong Network Detected"
- Current network name displayed
- Required network: "Mantle Sepolia"
- Single button: "Switch to Mantle Sepolia"

Switch flow:
1. User clicks switch button
2. Call wallet method to switch/add chain
3. If chain not in wallet, add it automatically
4. Show success when switched
5. If user has no MNT, show link to faucet

Chain configuration to add:
- Chain ID: 5003
- Chain Name: Mantle Sepolia
- RPC URL: https://rpc.sepolia.mantle.xyz
- Currency: MNT
- Explorer: https://sepolia.mantlescan.xyz

The prompt should be non-dismissible until correct network is selected.
```

### Prompt 5.4 - Create Auth State Management

```
Create the authentication state management using Zustand:

Store name: useAuthStore

State to track:
- isConnected: boolean
- isAuthenticated: boolean (connected + signed message)
- address: string or null
- chainId: number or null
- isCorrectNetwork: boolean
- isLoading: boolean

Actions:
- connect(): Trigger wallet connection
- disconnect(): Clear all auth state and disconnect wallet
- signIn(): Trigger message signing flow
- signOut(): Clear authentication but keep wallet connected

Persistence:
- Store address in localStorage for reconnection
- On app load, try to reconnect to previous wallet
- Validate stored session is still valid

Integration:
- Create a useAuth hook that combines store with wagmi hooks
- Expose helper functions like isReady (connected + correct network + authenticated)
- Handle wallet events (account change, network change, disconnect)

All dashboard pages should redirect to login if not authenticated.
```

---

## Phase 6: Dashboard Core

### Prompt 6.1 - Create Dashboard Home Page

```
Create the main dashboard home page at /dashboard:

Page structure:
1. Page header with title "Dashboard" and optional action button
2. Welcome message: "Welcome back, 0x1a2b...3c4d"
3. Stats overview row (4 cards)
4. Main chart section
5. Recent activity section

Stats cards (in a row):
- Total Balance: Sum of all Paymaster balances in MNT
- Active Paymasters: Count of non-paused Paymasters
- Total Transactions: All-time transaction count with trend
- This Month Spending: Gas spent in current month in USD equivalent

Chart section:
- Transaction volume over last 30 days
- Area chart with gradient fill
- Tooltip showing exact values on hover
- Toggle for different time ranges (7d, 30d, 90d)

Recent activity section:
- Title: "Recent Activity" with "View All" link
- Show last 5-10 transactions across all Paymasters
- Each row: status icon, type, amount, time ago

All data should load with skeleton states first.
Include empty states if user has no data yet.
```

### Prompt 6.2 - Create Stat Card Component

```
Create a reusable StatCard component for metrics display:

Props it should accept:
- title: string (label for the metric)
- value: string or number (the main value to display)
- icon: React node (icon component)
- trend: object with value and direction (up/down/neutral)
- loading: boolean
- onClick: optional function for interactive cards

Visual design:
- Card background with subtle border
- Icon in top left with colored circular background
- Large value text in white (H3 size)
- Title in muted text below value
- Trend indicator in bottom right (arrow + percentage)
  - Green with up arrow for positive
  - Red with down arrow for negative
  - Gray for neutral

Hover state:
- Subtle lift effect
- Border glow if interactive

Loading state:
- Show skeleton for value and trend
- Keep icon and title visible

The component should be used consistently across dashboard and analytics.
```

### Prompt 6.3 - Create Transaction Volume Chart

```
Create a chart component for displaying transaction volume over time:

Chart type: Area chart with gradient fill

Props:
- data: Array of { date, count, gasUsed } objects
- timeRange: '7d' | '30d' | '90d'
- loading: boolean

Features:
- Smooth curved line (not jagged)
- Gradient fill from primary color to transparent
- X-axis: Dates (formatted based on range)
- Y-axis: Transaction count
- Grid lines: Subtle, horizontal only
- Tooltip on hover showing:
  - Date
  - Transaction count
  - Gas used in MNT

Time range selector:
- Three buttons/tabs above chart: 7D, 30D, 90D
- Active state with primary color
- Smooth transition when changing ranges

Responsive:
- Maintain aspect ratio on resize
- Fewer x-axis labels on mobile
- Touch-friendly tooltip on mobile

Empty state: "No transactions yet" with illustration.
```

### Prompt 6.4 - Create Recent Activity Feed

```
Create a recent activity feed component for the dashboard:

Structure:
- Section header: "Recent Activity" with "View All →" link
- List of transaction items
- "Load More" button if there are more items

Each transaction item shows:
- Status icon (green check for success, red X for failed)
- Transaction type (Transfer, Approve, Mint, etc.)
- Truncated user address (who initiated)
- Gas cost in MNT
- Relative time (2m ago, 1h ago, etc.)

Item interactions:
- Entire row is clickable
- Opens transaction detail modal on click
- Hover shows subtle background highlight

Real-time updates:
- New transactions should appear at top with animation
- Slide down animation for new items
- Optional: Subtle pulse on the new item

Empty state:
- "No transactions yet"
- Subtext: "Transactions will appear here once users start using your Paymaster"
- Link to documentation on integration

Loading state: Show 5 skeleton rows.
```

### Prompt 6.5 - Create Onboarding Checklist Component

```
Create an onboarding checklist for new users:

Display condition:
- Show only if user has not completed all onboarding steps
- Can be dismissed/minimized
- Remember dismissal in localStorage

Checklist items:
1. Connect Wallet - ✅ (always complete if they see this)
2. Create Paymaster - Check if they have at least one
3. Fund Paymaster - Check if any Paymaster has balance > 0
4. Configure Whitelist - Check if any contract is whitelisted
5. Integrate SDK - Manual checkbox (link to docs)

Visual design:
- Card with gradient border to draw attention
- Progress indicator showing X of 5 complete
- Each item shows:
  - Checkbox (filled if complete)
  - Step title
  - Brief description
  - Action button for incomplete steps

Behavior:
- Click on incomplete step scrolls/navigates to relevant section
- Celebration animation when all steps complete
- Option to "Dismiss" or "Minimize to icon"

After all complete: Show "You're all set! 🎉" then auto-dismiss after delay.
```

---

## Phase 7: Paymaster Management

### Prompt 7.1 - Create Paymaster List Page

```
Create the Paymasters list page at /paymasters:

Page header:
- Title: "Paymasters"
- Primary action button: "+ New Paymaster"

Toolbar:
- Search input: "Search paymasters..."
- Filter dropdown: All, Active, Paused, Low Balance
- Sort dropdown: Recent, Name, Balance, Transactions

List layout:
- Cards in a grid (2 columns on desktop, 1 on mobile)
- Or: List view with rows

Each Paymaster card shows:
- Status indicator (green dot for active, yellow for low balance, gray for paused)
- Paymaster name (user-defined or "Unnamed Paymaster")
- Truncated address with copy button
- Quick stats: Balance, Transactions, Users
- Action buttons: View Details, Quick Actions menu

Quick actions menu:
- Fund
- Pause/Resume
- View on Explorer
- Copy Address

Empty state (no Paymasters):
- Illustration of a Paymaster concept
- Title: "No Paymasters Yet"
- Description: "Create your first Paymaster to start sponsoring gas"
- CTA: "Create First Paymaster"

Loading: Show 4-6 skeleton cards.
```

### Prompt 7.2 - Create New Paymaster Modal (Multi-Step)

```
Create a multi-step modal for creating a new Paymaster:

Step indicator at top showing progress (Step 1 of 3)

Step 1: Basic Information
- Input: Paymaster name (optional, placeholder: "My Paymaster")
- Textarea: Description (optional)
- Helper text explaining what a Paymaster does
- Buttons: Cancel, Next

Step 2: Initial Funding
- Input: Amount in MNT
- Quick amount buttons: 1 MNT, 5 MNT, 10 MNT, 25 MNT
- Calculator showing: "X MNT ≈ ~Y transactions"
- Show user's wallet balance
- Warning if amount exceeds balance
- Buttons: Back, Next

Step 3: Review & Confirm
- Summary of all entered information
- Estimated gas cost for deployment
- Total cost: Deployment gas + Initial funding
- Checkbox: "I understand this will require a wallet transaction"
- Buttons: Back, Create Paymaster

Transaction flow:
- User clicks "Create Paymaster"
- Show loading state: "Waiting for wallet..."
- After signing: "Deploying Paymaster..."
- On success: Close modal, show confetti, navigate to new Paymaster

Error handling:
- User rejects: Stay on step 3 with option to retry
- Transaction fails: Show error message with reason
```

### Prompt 7.3 - Create Paymaster Detail Page

```
Create the Paymaster detail page at /paymasters/[id]:

Page header:
- Back link: "← Back to Paymasters"
- Paymaster name with edit icon
- Address with copy button and explorer link
- Status badge (Active/Paused)
- Action buttons: Fund, Pause/Resume, Settings

Stats overview (4 cards in row):
- Balance: Current MNT with Fund button
- Transactions: Total count with trend
- Unique Users: Count
- Gas Spent: Total MNT spent on gas

Tab navigation:
- Overview (default)
- Whitelist
- Spending Limits
- Transactions
- Settings

Overview tab content:
- Transaction volume chart (last 7 days)
- Spending limits status (progress bars)
- Recent transactions (last 5)
- Quick links to other tabs

The page should load data in parallel where possible.
Show skeleton states for each section independently.
Handle not-found state if Paymaster ID doesn't exist.
```

### Prompt 7.4 - Create Whitelist Management Tab

```
Create the Whitelist tab for managing allowed contracts:

Header:
- Title: "Whitelisted Contracts"
- Add button: "+ Add Contract"
- Help tooltip explaining whitelisting

Empty state:
- Icon: Shield with question mark
- Title: "No Contracts Whitelisted"
- Description: "Add contracts to control which transactions are sponsored"
- CTA: "Add First Contract"
- Warning: "Without whitelisted contracts, all transactions will be rejected"

Contract list:
Each contract card shows:
- Contract type badge (ERC-20, ERC-721, Custom)
- Contract name (if detected) or "Unknown Contract"
- Contract address with copy and explorer links
- Whitelisted functions as tags/chips
- Edit and Remove buttons

Function display:
- Show as chips/tags: transfer(), approve(), mint()
- If all functions allowed, show "All Functions" badge
- Expandable to see full function signatures

Remove confirmation:
- Show warning dialog
- Explain impact: "Transactions to this contract will be rejected"
- Require confirmation click
```

### Prompt 7.5 - Create Add Contract Modal

```
Create the modal for adding a contract to the whitelist:

Step 1: Enter Address
- Input field for contract address
- Paste button for convenience
- Validate it's a proper address format
- On valid address, auto-fetch contract info

Contract detection:
- Show loading while fetching
- Display detected info:
  - Contract type (ERC-20, ERC-721, ERC-1155, Custom)
  - Token name and symbol if applicable
  - Verified status on explorer
- If not detected: "Unknown Contract" with warning

Step 2: Select Functions
- Toggle: "Allow all functions" (less secure warning)
- Or: Select specific functions from list
- Show function signatures: transfer(address,uint256)
- Checkbox for each function
- Group common functions at top

Function recommendations:
- For ERC-20: Recommend transfer, approve
- For ERC-721: Recommend transferFrom, safeTransferFrom
- Show security tips for each selection

Submit:
- Show summary of what's being whitelisted
- This is an on-chain transaction (requires wallet signature)
- Show gas estimate
- Loading state during transaction
- Success: Close modal, refresh whitelist, show toast
```

### Prompt 7.6 - Create Spending Limits Tab

```
Create the Spending Limits tab for configuring cost controls:

Introduction:
- Brief explanation of why limits matter
- Link to documentation for advanced configuration

Limit types (each in its own card):

1. Per-Transaction Limit
- Current value or "Not Set"
- Input to set/change limit in MNT
- Recommendation text: "Recommended: 0.05 MNT for most use cases"
- Save button

2. Daily Limit
- Current value with progress bar showing usage
- Format: "45 / 100 MNT used today (45%)"
- Input to set/change limit
- Reset time shown (resets at midnight UTC)

3. Monthly Limit
- Current value with progress bar
- Format: "800 / 2000 MNT used this month"
- Input to set/change limit
- Shows days remaining in billing period

4. Global Limit (optional/advanced)
- Total lifetime spending cap
- Progress toward cap
- Warning when approaching limit

Each limit card should:
- Show warning styling when > 80% used
- Show error styling when limit reached
- Have Edit and Remove buttons
- Changes require on-chain transaction

Alerts section:
- Configure notification thresholds
- "Alert me when daily limit reaches 80%"
- Email and/or in-app notification toggles
```

### Prompt 7.7 - Create Fund Paymaster Modal

```
Create a modal for adding funds to an existing Paymaster:

Modal header:
- Title: "Fund Paymaster"
- Paymaster name and address

Current state:
- Show current balance prominently
- Show balance status (healthy, low, critical)

Amount input:
- Large input field for MNT amount
- Quick amount buttons: +1, +5, +10, +25 MNT
- "Max" button to use entire wallet balance
- Show wallet balance for reference

Calculator/estimation:
- "This will enable approximately X more transactions"
- Based on average gas cost from history
- If new Paymaster, use network average

Cost summary:
- Amount to deposit: X MNT
- Network fee: ~Y MNT
- Total from wallet: X + Y MNT

Action buttons:
- Cancel
- Fund Paymaster (primary)

Transaction flow:
- Click Fund → Wallet popup
- Loading: "Confirming deposit..."
- Success: Show new balance, close modal
- Confetti animation if first funding

Show inline error if user doesn't have enough balance.
```

### Prompt 7.8 - Create Transaction History Tab

```
Create the Transactions tab showing history for a Paymaster:

Toolbar:
- Search by transaction hash or user address
- Filter by status: All, Success, Failed
- Date range picker
- Export CSV button

Table columns:
- Status (icon)
- Transaction Hash (truncated with copy)
- User Address (truncated)
- Target Contract (name or truncated address)
- Function Called
- Gas Used (in MNT)
- Timestamp (relative, hover for absolute)

Table features:
- Sortable columns (click header to sort)
- Pagination: 25 rows per page
- Row click opens detail modal
- Select rows for bulk export

Transaction detail modal (on row click):
- Full transaction hash with copy and explorer link
- All transaction details in organized sections
- Raw call data (expandable)
- Timeline if we have relay timestamps

Empty state:
- "No transactions yet"
- Explanation that transactions appear after SDK integration
- Link to integration documentation

Loading: Table skeleton with 10 rows.
```

---

## Phase 8: Analytics

### Prompt 8.1 - Create Global Analytics Page

```
Create the Analytics page at /analytics:

Page header:
- Title: "Analytics"
- Time range selector: Last 7 days, 30 days, 90 days, Custom
- Export button (CSV download)

Top stats row (4 cards):
- Total Transactions (with trend)
- Success Rate (percentage with trend)
- Failed Transactions (count)
- Average Gas per Transaction

Main chart section:
- Large area chart showing transaction volume
- Toggle to show: Volume, Gas Spent, or both overlaid
- Clearly labeled axes and legend

Secondary charts row (2 charts):
1. Pie/Donut chart: Gas usage by Paymaster
   - Shows distribution across user's Paymasters
   - Hover shows exact values
   
2. Bar chart: Top Contracts
   - Horizontal bars
   - Shows which contracts get most transactions
   - Top 5 contracts

Insights section:
- Auto-generated insights based on data:
  - "Your users saved $X in gas this week"
  - "Transaction volume is up Y% from last week"
  - "Most active contract: TokenContract"

Data should refresh automatically every 60 seconds.
Show last updated timestamp.
```

### Prompt 8.2 - Create Date Range Picker Component

```
Create a date range picker for analytics filtering:

Default state:
- Shows currently selected range as button text
- Example: "Last 7 days" or "Jan 1 - Jan 7, 2026"

Preset options (quick select):
- Today
- Yesterday
- Last 7 days
- Last 30 days
- Last 90 days
- This month
- Last month
- Custom range

Custom range picker:
- Opens calendar view
- Select start date, then end date
- Shows selected range highlighted
- Clear button to reset
- Apply button to confirm

Behavior:
- Clicking preset immediately applies it
- Custom range requires Apply click
- Calendar should not allow future dates
- Maximum range: 1 year

Display:
- Dropdown or popover style
- Calendar uses our design system colors
- Selected dates highlighted in primary color
- Today's date has subtle indicator
```

### Prompt 8.3 - Create Export Functionality

```
Create the CSV export feature for analytics data:

Export button behavior:
- Click opens dropdown with options:
  - Export Transactions (CSV)
  - Export Summary (CSV)
  - Export Raw Data (JSON)

Export Transactions CSV includes:
- Transaction hash
- Timestamp
- Paymaster address
- User address
- Target contract
- Function called
- Gas used (in MNT)
- Gas used (in USD equivalent)
- Status

Export Summary CSV includes:
- Date
- Total transactions
- Successful transactions
- Failed transactions
- Total gas spent
- Unique users

File naming:
- Include date range in filename
- Example: "mantle-relayer-transactions-2026-01-01-to-2026-01-07.csv"

Progress indication:
- For large exports, show progress
- "Preparing export... X%"
- Download triggers automatically when ready

Error handling:
- If export fails, show error toast
- Offer retry option
```

---

## Phase 9: Settings

### Prompt 9.1 - Create Settings Page Layout

```
Create the Settings page at /settings with sub-navigation:

Page layout:
- Left sidebar with settings categories
- Main content area for current settings section

Settings categories (sidebar):
1. Profile - Basic account settings
2. Notifications - Alert preferences
3. Appearance - Theme settings
4. Danger Zone - Account deletion, withdrawal

URL structure:
- /settings → redirects to /settings/profile
- /settings/profile
- /settings/notifications
- /settings/appearance
- /settings/danger

Mobile:
- Categories become top tabs or dropdown
- Content takes full width

Each settings section should:
- Have a clear title and description
- Save changes immediately (no global save button)
- Show success toast on save
- Handle errors gracefully
```

### Prompt 9.2 - Create Profile Settings Section

```
Create the Profile settings section:

Connected Wallet:
- Display current connected address (full)
- Copy button
- Disconnect button (with confirmation)
- "Connected via MetaMask" indicator

Account Information:
- Display: First connected date
- Display: Total Paymasters created
- Display: Total transactions sponsored

Session:
- Current session info
- "Sign Out" button (clears auth but can reconnect)
- Session timeout setting (optional)

Linked Accounts (future feature placeholder):
- Email address input (optional)
- Explain benefits: password recovery, notifications
- Connect button (disabled with "Coming Soon" badge)

Note: Since this is wallet-based auth, profile options are limited.
Most "settings" are Paymaster-specific, not account-specific.
```

### Prompt 9.3 - Create Notifications Settings Section

```
Create the Notifications settings section:

Notification Channels:
- In-App Notifications: Toggle (default: on)
- Email Notifications: Toggle (requires email, disabled if no email)
- Browser Push: Toggle with permission request flow

Notification Types (each with toggles):

Balance Alerts:
- Low balance warning (when Paymaster < X MNT)
- Input for threshold (default: 10 MNT)
- Critical balance (< 1 MNT) - always on

Transaction Alerts:
- Failed transaction notifications
- Spike in failed transactions
- Toggle for real-time vs. daily digest

Spending Alerts:
- Daily limit approaching (80%)
- Daily limit reached
- Monthly limit approaching (80%)

System Notifications:
- New feature announcements
- Maintenance notifications
- Security alerts (always on, cannot disable)

Save behavior:
- Each toggle saves immediately
- Show "Saved" feedback
- Group related settings in cards
```

### Prompt 9.4 - Create Appearance Settings Section

```
Create the Appearance settings section:

Theme Selection:
- Three options: Light, Dark, System
- Visual preview of each option
- Radio button or card selection
- Currently: Dark only (Light coming soon badge)

Accent Color (optional future feature):
- Color palette selection
- Preview of UI with selected color
- Note: This is a nice-to-have, can skip initially

Compact Mode (optional):
- Toggle for denser UI
- Reduces padding and spacing
- Good for power users with lots of data

Sidebar:
- Default state: Expanded or Collapsed
- Remember preference

Animations:
- Toggle to reduce animations
- Respects system prefers-reduced-motion
- Affects all transitions and animations

Data Display:
- Date format preference: US (MM/DD/YYYY) or International (DD/MM/YYYY)
- Time format: 12-hour or 24-hour
- Currency display: MNT only, or with USD equivalent
```

### Prompt 9.5 - Create Danger Zone Section

```
Create the Danger Zone settings section:

Visual distinction:
- Red/destructive color accents
- Warning banner at top
- Clear separation from other settings

Withdraw All Funds:
- Title: "Withdraw All Paymaster Funds"
- Description: "Transfer all MNT from all Paymasters back to your wallet"
- Warning: "Your Paymasters will no longer be able to sponsor transactions"
- Input: Destination address (pre-filled with connected wallet)
- Confirmation: Type "WITHDRAW ALL" to enable button
- Button: "Withdraw All Funds" (destructive style)

Pause All Paymasters:
- Title: "Pause All Paymasters"
- Description: "Immediately stop all Paymasters from sponsoring transactions"
- Use case: "Use this if you suspect abuse"
- Button: "Pause All" with confirmation dialog

Delete Account (if applicable):
- Title: "Delete Account"
- Description: "Remove all data associated with this wallet"
- Note: "This doesn't affect on-chain Paymasters"
- Requires withdrawal first
- Confirmation: Type wallet address to confirm

All actions require:
- Explicit confirmation
- Wallet transaction for on-chain actions
- Clear success/failure feedback
```

---

## Phase 10: Real-Time Features

### Prompt 10.1 - Set Up WebSocket Connection

```
Create a WebSocket connection manager for real-time updates:

Connection setup:
- Connect to backend WebSocket endpoint
- Authenticate using the same JWT/session as REST API
- Auto-reconnect on disconnect with exponential backoff
- Connection status indicator somewhere in UI

Events to subscribe to:
- New transactions for user's Paymasters
- Balance changes
- Spending limit alerts
- System notifications

State management:
- Create a Zustand store for WebSocket state
- Track: isConnected, lastMessage, connectionAttempts
- Queue messages if disconnected, send on reconnect

Hook for components:
- useWebSocket hook that components can use
- Subscribe to specific event types
- Automatically unsubscribe on unmount

Fallback:
- If WebSocket unavailable, poll REST API every 30 seconds
- User shouldn't notice the difference
- Log WebSocket errors for debugging
```

### Prompt 10.2 - Create Real-Time Transaction Feed

```
Create a real-time transaction feed component:

Location: Dashboard home and Paymaster detail pages

Visual design:
- Card or panel showing live transactions
- Header: "Live Activity" with pulsing dot indicator
- List of recent transactions

Real-time behavior:
- New transactions slide in from top
- Smooth animation (slide down existing items)
- New item has subtle highlight that fades
- Optional: Sound effect toggle for new transactions

Item display:
- Transaction type icon (color-coded by success/fail)
- Truncated user address
- Gas amount
- "Just now" / "1m ago" timestamp
- Click to expand or open detail modal

Performance:
- Keep only last 20-50 items in memory
- Older items can be fetched on demand
- Virtualize list if showing many items

Empty state:
- "Waiting for transactions..."
- Explain that transactions will appear here
- Animated waiting indicator
```

### Prompt 10.3 - Create Balance Auto-Refresh

```
Implement automatic balance refresh across the application:

Refresh triggers:
- On page focus (user returns to tab)
- After any funding transaction
- Every 60 seconds while page is active
- On WebSocket balance_changed event

What to refresh:
- All Paymaster balances
- Wallet balance (for funding modals)
- Stats that depend on balance

Visual feedback:
- Subtle loading indicator during refresh (not full skeleton)
- Number animation when value changes
- Timestamp showing "Updated 30s ago"

Optimization:
- Don't refresh if tab is not visible
- Batch multiple refresh requests
- Cache with short TTL (30 seconds)

Manual refresh:
- Add refresh button/icon near balances
- Click triggers immediate refresh
- Show loading state on button
```

### Prompt 10.4 - Implement Optimistic Updates

```
Implement optimistic UI updates for better perceived performance:

Where to apply:
- Creating Paymaster: Show in list immediately
- Funding Paymaster: Update balance immediately
- Adding to whitelist: Show contract immediately
- Any toggle/switch actions

Pattern:
1. User takes action
2. Update UI immediately (optimistic state)
3. Send request to blockchain/backend
4. On success: Keep the update
5. On failure: Revert UI and show error

Visual indicators:
- Optimistic items have subtle "pending" state
- Could show a small clock or spinner
- Slightly reduced opacity until confirmed

Error handling:
- If transaction fails, revert to previous state
- Show toast explaining what happened
- Provide retry option

Implementation in Zustand:
- Store has both "confirmed" and "pending" states
- Selectors merge them for display
- Clear pending state on confirmation or error

This makes the app feel instant even with blockchain transactions.
```

### Prompt 10.5 - Create Toast Notification System

```
Set up the toast notification system using Sonner:

Toast types:
- Success: Green accent, checkmark icon
- Error: Red accent, X icon  
- Warning: Amber accent, warning icon
- Info: Blue accent, info icon
- Loading: Shows spinner, can update to success/error

Usage patterns:
- Transaction submitted: Loading toast
- Transaction confirmed: Update to success toast
- Transaction failed: Update to error toast
- Copy to clipboard: Brief success toast
- Form errors: Error toast with message

Configuration:
- Position: Bottom right on desktop, bottom center on mobile
- Duration: 4 seconds for info, 6 for errors, indefinite for loading
- Max visible: 3 toasts at once
- Dismissible: Click X or swipe

Custom toast for transactions:
- Shows transaction hash (truncated)
- "View on Explorer" link
- Updates in place as status changes

Create a useToast hook or utility function:
- Easy to call from anywhere
- Consistent formatting
- Handles the loading → success/error pattern
```

---

## Phase 11: Polish & Optimization

### Prompt 11.1 - Implement Loading Skeletons

```
Create consistent loading skeleton components:

Philosophy:
- Never show blank screens
- Skeleton should match final layout shape
- Subtle animation (shimmer or pulse)

Skeleton components needed:
- SkeletonCard: For Paymaster cards, stat cards
- SkeletonTable: For transaction history tables
- SkeletonChart: For chart areas
- SkeletonText: For text content (different line widths)
- SkeletonAvatar: For user avatars/icons

Implementation:
- Use shadcn/ui Skeleton as base
- Create composed skeletons for common patterns
- Animate with subtle pulse or shimmer effect

Page-level skeletons:
- Dashboard: 4 stat cards + chart + activity list
- Paymaster List: 4-6 cards in grid
- Paymaster Detail: Stats + chart + content area
- Analytics: Stats + multiple charts

Skeleton should:
- Match exact dimensions of real content
- Prevent layout shift when content loads
- Be fast to render (no complex calculations)
```

### Prompt 11.2 - Create Error Boundary Components

```
Implement error boundaries throughout the application:

Global error boundary:
- Catches any unhandled errors
- Shows friendly error page
- "Something went wrong" message
- Retry button that reloads the page
- Link to support/help

Section-level error boundaries:
- Wrap each major section (chart, table, card)
- Failed section shows error state, rest of page works
- "Failed to load transactions" with retry button
- Doesn't crash entire page

Error state component:
- Icon: Warning or error icon
- Title: What failed to load
- Message: Brief explanation
- Actions: Retry, Report Issue

Error tracking:
- Log errors to console in development
- Note: Production error tracking (Sentry) can be added later

Network error handling:
- Detect offline state
- Show offline banner
- Queue actions to retry when online
- Don't show error for expected offline behavior
```

### Prompt 11.3 - Implement Empty States

```
Create meaningful empty states for all list/data views:

Empty state component props:
- icon: Visual icon
- title: What's empty
- description: Why and what to do
- action: Optional CTA button
- helpLink: Optional link to docs

Empty states needed:

No Paymasters:
- Icon: Wallet or plus icon
- Title: "No Paymasters Yet"
- Description: "Create your first Paymaster to start sponsoring gas"
- Action: "Create Paymaster" button

No Transactions:
- Icon: Activity icon
- Title: "No Transactions Yet"
- Description: "Transactions will appear here after SDK integration"
- Action: "View Integration Guide"

No Whitelisted Contracts:
- Icon: Shield icon
- Title: "No Contracts Whitelisted"
- Description: "Add contracts to control which transactions are sponsored"
- Action: "Add Contract"

No Analytics Data:
- Icon: Chart icon
- Title: "No Data Yet"
- Description: "Analytics will populate as transactions are processed"
- Help: "Make sure your SDK is integrated correctly"

Empty Search Results:
- Icon: Search icon
- Title: "No Results Found"
- Description: "Try adjusting your search or filters"
- Action: "Clear Filters"
```

### Prompt 11.4 - Add Micro-Animations

```
Add subtle animations throughout the application for polish:

Page transitions:
- Fade in content on navigation
- Slide up animation for main content
- Duration: 200-300ms
- Easing: ease-out

Button interactions:
- Scale down slightly on press (0.98)
- Scale up slightly on hover (1.02)
- Smooth color transitions

Card hover effects:
- Lift effect (translateY: -2px)
- Subtle shadow increase
- Border glow for interactive cards

Loading states:
- Skeleton shimmer animation
- Spinner rotation
- Pulse for waiting states

Success celebrations:
- Confetti for major achievements
- Checkmark draw animation
- Number count-up animation

List animations:
- Stagger children on initial load
- Slide in new items
- Fade out removed items

Performance:
- Use CSS transforms (not position changes)
- Use will-change sparingly
- Respect prefers-reduced-motion
- Keep animations under 300ms
```

### Prompt 11.5 - Optimize Performance

```
Implement performance optimizations:

Code splitting:
- Dynamic imports for heavy components
- Lazy load chart library
- Lazy load modal contents

Image optimization:
- Use Next.js Image component
- Proper sizing and formats
- Lazy load below-fold images

Bundle optimization:
- Tree shake unused code
- Check bundle size regularly
- Split vendor chunks appropriately

Data fetching:
- Use React Query for caching
- Stale-while-revalidate pattern
- Prefetch on hover for navigation

Rendering:
- Memoize expensive computations
- Use React.memo for list items
- Virtualize long lists (if > 100 items)

Core Web Vitals targets:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

Monitoring:
- Add Web Vitals tracking
- Monitor in development
- Set up alerts for regressions
```

### Prompt 11.6 - Accessibility Audit

```
Ensure the application meets accessibility standards:

Keyboard navigation:
- All interactive elements are focusable
- Logical tab order throughout
- Focus visible indicators (not just outline, our styled focus ring)
- Escape key closes modals
- Enter/Space activates buttons

Screen reader support:
- All images have alt text
- Icons have aria-labels
- Form inputs have labels
- Error messages are announced
- Loading states are announced

Color and contrast:
- Text meets WCAG AA contrast (4.5:1)
- Don't rely on color alone for information
- Focus states are visible
- Error states have icons, not just red color

Interactive elements:
- Buttons have minimum 44x44px touch target
- Links are distinguishable
- Form validation is clear

ARIA usage:
- Use semantic HTML first
- ARIA attributes where needed
- Live regions for dynamic content
- Proper roles for custom components

Testing checklist:
- Navigate entire app with keyboard only
- Test with screen reader (VoiceOver, NVDA)
- Check with browser accessibility tools
- Validate color contrast ratios
```

### Prompt 11.7 - Mobile Responsiveness Polish

```
Final mobile responsiveness review and fixes:

Breakpoints:
- Mobile: 0 - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

Mobile-specific changes:
- Sidebar → Bottom tab navigation
- Tables → Card lists
- Multi-column → Single column
- Hover effects → Tap effects

Touch interactions:
- All tap targets minimum 44px
- Swipe to dismiss modals
- Pull to refresh on lists (optional)
- No hover-dependent features

Typography on mobile:
- Body text minimum 16px (prevents zoom)
- Adequate line height for readability
- Truncate long addresses appropriately

Forms on mobile:
- Full-width inputs
- Appropriate keyboard types (numeric for amounts)
- Large enough touch targets
- Visible labels (not just placeholders)

Testing checklist:
- Test on actual devices (not just emulator)
- Test both iOS Safari and Android Chrome
- Check landscape orientation
- Test with slow network conditions
- Verify modals don't break viewport
```

---

## 🚀 Final Launch Checklist

### Prompt Final.1 - Pre-Launch Review

```
Conduct final pre-launch review:

Functionality:
- [ ] All pages load without errors
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] Network switching works
- [ ] Can create Paymaster end-to-end
- [ ] Can fund Paymaster
- [ ] Can whitelist contracts
- [ ] Analytics display correctly
- [ ] Settings save properly

Visual:
- [ ] Consistent spacing throughout
- [ ] All text is readable
- [ ] Loading states everywhere
- [ ] Empty states are helpful
- [ ] Error states are clear
- [ ] Responsive on all screen sizes

Performance:
- [ ] Page load < 3 seconds
- [ ] No console errors
- [ ] No layout shift
- [ ] Animations are smooth

Security:
- [ ] No sensitive data in localStorage
- [ ] Proper error handling (no stack traces)
- [ ] Dangerous actions require confirmation
- [ ] Session management works

Documentation:
- [ ] README is up to date
- [ ] Environment variables documented
- [ ] Deployment process documented
```

---

## 📝 Notes for AI Implementation

### General Guidelines

1. **File Size**: Keep each file under 600 lines. Split large components into smaller sub-components.

2. **Component Organization**: 
   - One component per file
   - Related components in same folder
   - Index file for clean exports

3. **Naming Conventions**:
   - Components: PascalCase
   - Files: kebab-case or PascalCase matching component
   - Hooks: camelCase starting with "use"
   - Stores: camelCase ending with "Store"

4. **State Management Priority**:
   - Local state first (useState)
   - Server state with React Query
   - Global state with Zustand only when truly needed

5. **Error Handling**: Always implement loading, error, and empty states.

6. **TypeScript**: Use strict types, avoid `any`, create proper interfaces.

7. **Accessibility**: Consider a11y from the start, not as an afterthought.

### Smart Contract Integration Notes

- RelayerHub Contract: `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737`
- PaymasterFactory Contract: `0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4`
- Network: Mantle Sepolia (Chain ID: 5003)

### Backend API Notes

- Base URL: Configure in environment
- Auth: JWT in Authorization header
- Main endpoints:
  - GET /paymasters - List user's Paymasters
  - POST /paymasters - Create Paymaster
  - GET /paymasters/:id - Get Paymaster details
  - POST /relay/execute - Execute gasless transaction
  - GET /analytics - Get analytics data

---

**End of Frontend Application Build Prompts**

*Document Version: 1.0.0*
*Created: January 14, 2025*
