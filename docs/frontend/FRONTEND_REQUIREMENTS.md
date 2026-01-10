# Frontend Requirements & Specifications

**Project**: Mantle Gasless Relayer  
**Version**: 1.0.0  
**Date**: January 10, 2026  
**Audience**: Frontend Developer

---

## 📋 Executive Summary

This document outlines the complete frontend requirements for the Mantle Gasless Relayer platform. We're building **two main products**:

1. **Developer Dashboard** - Web app for developers to manage Paymasters, monitor usage, and configure settings
2. **Integration Documentation Site** - Interactive docs where developers can copy-paste code to integrate gasless transactions

**Key Goals:**
- Make it dead simple for developers to start sponsoring gas for their users
- Provide real-time monitoring and analytics
- Create copy-paste ready integration examples
- Ensure excellent UX for both technical and non-technical users

---

## 🎯 Product Overview

### What We're Building

**Mantle Gasless Relayer** enables dApp developers to sponsor gas fees for their users, removing the biggest barrier to blockchain adoption: needing tokens before using an app.

**User Journey:**
1. Developer signs up → Creates Paymaster
2. Developer funds Paymaster → Configures whitelists
3. Developer integrates SDK into their dApp
4. End users transact without gas fees 🎉

### Target Users

**Primary Users (Dashboard):**
- dApp developers (Web3 experience)
- Product managers (limited technical knowledge)
- DevOps engineers (monitoring & alerts)

**Secondary Users (Docs Site):**
- Frontend developers (React, Vue, etc.)
- Backend developers (Node.js)
- Smart contract developers

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                       │
│  Developer Dashboard │    Documentation Site                │
│  (Next.js)          │    (Docusaurus/Nextra)              │
│                      │                                       │
│  - Manage Paymasters │    - Interactive Examples            │
│  - Monitor Usage     │    - Copy-Paste Code                │
│  - Configure Rules   │    - API Reference                  │
│  - Analytics        │    - Video Tutorials                │
│                      │                                       │
└──────────┬───────────┴──────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
    ┌─────────────┐              ┌──────────────┐
    │  Relayer    │              │  SDK Package │
    │  Backend    │              │  (npm)       │
    │  (Railway)  │              └──────────────┘
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Smart      │
    │  Contracts  │
    │  (Mantle)   │
    └─────────────┘
```

---

## 🎨 Product 1: Developer Dashboard

### Purpose
Web application where developers manage their Paymasters, monitor transactions, and configure spending rules.

### Tech Stack Recommendations
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand or React Context
- **Charts**: Recharts or Chart.js
- **Web3**: ethers.js v6 + Wagmi v2
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel or Cloudflare Pages

### Pages & Features

#### 1. Landing Page (`/`)

**Purpose**: Marketing page explaining the platform

**Sections:**
- Hero with value proposition
- How it works (3-step process)
- Use cases (NFTs, Gaming, DeFi)
- Pricing (if applicable)
- CTA: "Get Started" → Sign up/Connect Wallet

**Design Notes:**
- Clean, modern, Web3-native aesthetic
- Animated stats (e.g., "10,000+ gasless transactions")
- Video demo or interactive playground
- Testimonials from beta users

---

#### 2. Authentication Flow

**Method**: Wallet-based authentication (Web3)

**Flow:**
```
1. User clicks "Connect Wallet"
2. MetaMask/WalletConnect popup
3. User signs message (no gas needed)
4. JWT token generated (backend)
5. User redirected to Dashboard
```

**Components Needed:**
```tsx
<ConnectWalletButton />
<WalletModal providers={['MetaMask', 'WalletConnect', 'Coinbase Wallet']} />
<AuthGuard> // Wraps protected pages
```

**Security:**
- Sign message for authentication (EIP-4361: Sign-In with Ethereum)
- Store JWT in httpOnly cookie
- Refresh token mechanism
- Session expiry: 24 hours

---

#### 3. Dashboard Home (`/dashboard`)

**Layout:**
```
┌────────────────────────────────────────────┐
│ Header: Logo | Paymasters Dropdown | Wallet│
├────────────────────────────────────────────┤
│ Sidebar        │  Main Content             │
│                │                            │
│ • Home         │  [QUICK STATS CARDS]      │
│ • Paymasters   │                            │
│ • Transactions │  [USAGE CHART]            │
│ • Analytics    │                            │
│ • Settings     │  [RECENT TRANSACTIONS]    │
│ • Docs         │                            │
│                │                            │
└────────────────────────────────────────────┘
```

**Quick Stats Cards:**
```tsx
<StatCard
  title="Balance"
  value="45.23 MNT"
  change="-2.1 MNT today"
  trend="down"
  alert={balance < 10}
/>

<StatCard
  title="Transactions (24h)"
  value="1,234"
  change="+12% vs yesterday"
  trend="up"
/>

<StatCard
  title="Gas Sponsored"
  value="$123.45"
  change="$45.67 this week"
  trend="neutral"
/>

<StatCard
  title="Active Users"
  value="567"
  change="+23 new today"
  trend="up"
/>
```

**Usage Chart:**
- Line chart showing gas spent over time
- Selectable time range: 24h, 7d, 30d, All
- Hover tooltips with exact values
- Export data as CSV

**Recent Transactions Table:**
```tsx
<TransactionTable
  columns={['TX Hash', 'User', 'Function', 'Gas Cost', 'Status', 'Time']}
  maxRows={10}
  linkToAll="/dashboard/transactions"
/>
```

---

#### 4. Paymasters Page (`/dashboard/paymasters`)

**Purpose**: List and manage all Paymasters owned by user

**Layout:**
```
┌─────────────────────────────────────┐
│ My Paymasters          [+ New]     │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Paymaster #1                    ││
│ │ 0x1234...5678                   ││
│ │                                 ││
│ │ Balance: 45.23 MNT    🟢 Active ││
│ │ Txs (24h): 234        Gas: $12  ││
│ │                                 ││
│ │ [View Details] [Fund] [Pause]   ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Paymaster #2                    ││
│ │ ...                             ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Create new Paymaster (button triggers wallet transaction)
- Card view with key metrics per Paymaster
- Quick actions: Fund, Pause, View Details
- Status indicators: Active, Paused, Low Balance (warning)
- Search and filter

**"Create Paymaster" Flow:**
```
1. Click "+ New Paymaster"
2. Modal appears:
   - Name your Paymaster (optional)
   - Initial funding amount
   - Select template (Gaming, NFT, DeFi) [optional]
3. Click "Create"
4. Wallet popup (user signs transaction)
5. Wait for confirmation
6. Success! Show Paymaster address
7. Prompt: "Would you like to fund it now?"
```

---

#### 5. Paymaster Details (`/dashboard/paymasters/[address]`)

**Purpose**: Deep dive into single Paymaster with full configuration

**Tabs:**

**Tab 1: Overview**
```tsx
<PaymasterOverview>
  <Section title="Information">
    - Address (copy button)
    - Owner
    - Created date
    - Status (Active/Paused)
    - Balance (with alert if low)
    - Quick action: Fund, Pause, Withdraw
  </Section>

  <Section title="Analytics (30 days)">
    <Chart type="line" data={gasSpentOverTime} />
    - Total transactions
    - Total gas sponsored
    - Average gas per transaction
    - Unique users
    - Most used contract
  </Section>

  <Section title="Recent Activity">
    <TransactionTable maxRows={20} />
  </Section>
</PaymasterOverview>
```

**Tab 2: Whitelists**
```tsx
<WhitelistManager>
  <Section title="Whitelisted Contracts">
    <ContractList
      items={whitelistedContracts}
      actions={['Remove', 'View Functions']}
    />
    <Button>+ Add Contract</Button>
  </Section>

  <Section title="Whitelisted Functions">
    <FunctionList
      grouped={byContract}
      actions={['Remove']}
    />
    <Button>+ Add Function</Button>
  </Section>

  <AddContractModal>
    <Input label="Contract Address" validation={isAddress} />
    <Input label="Contract Name" optional />
    <Checkbox label="Whitelist all functions" />
    <FunctionSelector if={!whitelistAll} />
    <Button>Add to Whitelist</Button>
  </AddContractModal>
</WhitelistManager>
```

**Tab 3: Spending Limits**
```tsx
<SpendingLimits>
  <LimitCard
    title="Per Transaction"
    current="0.01 MNT"
    limit="0.05 MNT"
    progress={20}
    editable
  />
  
  <LimitCard
    title="Daily Limit"
    current="5.2 MNT"
    limit="10 MNT"
    progress={52}
    editable
  />
  
  <LimitCard
    title="Monthly Limit"
    current="45 MNT"
    limit="100 MNT"
    progress={45}
    editable
  />

  <Alert type="info">
    Limits help protect against abuse and unexpected costs.
  </Alert>
</SpendingLimits>
```

**Tab 4: Settings**
```tsx
<PaymasterSettings>
  <Section title="General">
    - Name (editable)
    - Description (editable)
    - Notification email (editable)
  </Section>

  <Section title="Notifications">
    <Toggle label="Low balance alert" />
    <Input label="Alert threshold" value="10 MNT" if={enabled} />
    
    <Toggle label="Daily summary email" />
    <Toggle label="Unusual activity alerts" />
  </Section>

  <Section title="Danger Zone">
    <Button variant="danger" icon={PauseIcon}>
      Pause Paymaster
    </Button>
    <Text muted>Pausing prevents new transactions</Text>
    
    <Button variant="danger" icon={WithdrawIcon}>
      Withdraw All Funds
    </Button>
    <Text muted>Transfer remaining balance to your wallet</Text>
  </Section>
</PaymasterSettings>
```

---

#### 6. Transactions Page (`/dashboard/transactions`)

**Purpose**: View all transactions across all Paymasters

**Features:**
```tsx
<TransactionHistory>
  <Filters>
    <Select label="Paymaster" options={['All', ...paymasters]} />
    <Select label="Status" options={['All', 'Success', 'Failed', 'Pending']} />
    <DateRange label="Date Range" />
    <Input label="Search" placeholder="TX hash, user address, or function" />
  </Filters>

  <TransactionTable
    columns={[
      'TX Hash',
      'Paymaster',
      'User',
      'Contract',
      'Function',
      'Gas Cost',
      'Status',
      'Timestamp'
    ]}
    pagination
    exportCSV
    clickableRows // Opens transaction detail modal
  />
</TransactionHistory>
```

**Transaction Detail Modal:**
```tsx
<TransactionModal txHash={hash}>
  <Section title="Overview">
    - Status (with icon)
    - TX Hash (link to explorer)
    - Block number
    - Timestamp
    - Gas used / Gas limit
    - Gas price
    - Total cost (in MNT and USD)
  </Section>

  <Section title="Participants">
    - User address (link to explorer)
    - Paymaster address
    - Target contract (link to explorer)
    - Relayer address
  </Section>

  <Section title="Transaction Data">
    - Function signature
    - Decoded input data
    - Raw input data (collapsible)
  </Section>

  <Section title="Signature">
    - EIP-712 domain
    - Signature (v, r, s)
    - Signer verification status
  </Section>
</TransactionModal>
```

---

#### 7. Analytics Page (`/dashboard/analytics`)

**Purpose**: Deep analytics and insights

**Sections:**

**Usage Trends:**
```tsx
<Chart type="area" title="Gas Sponsored Over Time">
  - Multiple time ranges
  - Compare different Paymasters
  - Forecast future costs (ML prediction)
</Chart>

<Chart type="bar" title="Transactions by Contract">
  - Bar chart of most used contracts
  - Clickable bars → filter transactions
</Chart>

<Chart type="pie" title="Gas Distribution">
  - Pie chart showing gas by function type
  - Hover shows percentage and cost
</Chart>
```

**User Analytics:**
```tsx
<Section title="User Engagement">
  <Metric label="Total Unique Users" value={1234} />
  <Metric label="Returning Users" value="67%" />
  <Metric label="Avg Transactions/User" value={4.2} />
  
  <Chart type="line" title="Daily Active Users">
    - 30-day trend
  </Chart>
</Section>
```

**Cost Analysis:**
```tsx
<Section title="Cost Breakdown">
  <Metric label="Total Spent (All Time)" value="$1,234.56" />
  <Metric label="This Month" value="$123.45" />
  <Metric label="Avg Daily Cost" value="$4.12" />
  <Metric label="Projected Monthly" value="$123.60" />
  
  <Table title="Cost by Contract">
    - Contract name
    - Total transactions
    - Total gas cost
    - Avg cost per tx
    - % of total spend
  </Table>
</Section>
```

**Alerts & Insights:**
```tsx
<InsightCards>
  <Insight type="warning">
    Your daily spending increased 45% this week.
    Consider reviewing your whitelist.
  </Insight>

  <Insight type="info">
    Contract 0x1234...5678 accounts for 60% of your gas.
    This is normal for NFT minting.
  </Insight>

  <Insight type="success">
    You've saved your users $456 in gas fees this month! 🎉
  </Insight>
</InsightCards>
```

---

#### 8. Settings Page (`/dashboard/settings`)

**Purpose**: Account and global settings

**Tabs:**

**Profile:**
```tsx
<ProfileSettings>
  - Wallet address (non-editable, with copy button)
  - Display name
  - Email for notifications
  - Avatar (upload)
  - Timezone
</ProfileSettings>
```

**API Keys:**
```tsx
<APIKeyManager>
  <APIKeyList
    keys={existingKeys}
    showActions={['Regenerate', 'Delete']}
  />
  <Button>+ Generate New API Key</Button>
  
  <Alert type="info">
    Use API keys to programmatically interact with the relayer.
    <Link>View API Documentation →</Link>
  </Alert>
</APIKeyManager>
```

**Notifications:**
```tsx
<NotificationSettings>
  <ToggleGroup label="Email Notifications">
    <Toggle label="Low balance alerts" />
    <Toggle label="Transaction failures" />
    <Toggle label="Daily summaries" />
    <Toggle label="Weekly reports" />
    <Toggle label="Security alerts" />
  </ToggleGroup>

  <ToggleGroup label="In-App Notifications">
    <Toggle label="Real-time transaction updates" />
    <Toggle label="System announcements" />
  </ToggleGroup>
</NotificationSettings>
```

**Billing (Future):**
```tsx
<BillingSettings>
  - Current plan
  - Usage this month
  - Upgrade options
  - Payment method
  - Billing history
</BillingSettings>
```

---

### 🎨 UI/UX Guidelines for Dashboard

#### Design Principles

1. **Clarity First**: Show key metrics immediately
2. **Progressive Disclosure**: Hide complexity until needed
3. **Fast Actions**: Common tasks in 1-2 clicks
4. **Error Prevention**: Confirm dangerous actions
5. **Real-time Updates**: WebSocket for live transaction feed

#### Color System

```tsx
// Status Colors
success: '#10B981'  // Green
warning: '#F59E0B'  // Amber
error: '#EF4444'    // Red
info: '#3B82F6'     // Blue

// Semantic Colors
paused: '#6B7280'   // Gray
active: '#10B981'   // Green
lowBalance: '#F59E0B' // Amber

// Chart Colors
primary: '#8B5CF6'  // Purple
secondary: '#EC4899' // Pink
tertiary: '#14B8A6'  // Teal
```

#### Component Library

**Use shadcn/ui for:**
- Buttons
- Forms (Input, Select, Checkbox)
- Modals (Dialog)
- Dropdowns
- Cards
- Tables
- Tabs
- Toast notifications
- Tooltips

**Custom Components Needed:**
```tsx
<WalletButton />
<PaymasterCard />
<TransactionRow />
<GasChart />
<StatCard />
<ContractBadge />
<StatusIndicator />
<CopyButton />
<ExplorerLink />
```

#### Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Considerations:**
- Collapsible sidebar → bottom nav
- Stack cards vertically
- Simplified charts
- Swipeable transaction cards

---

## 📚 Product 2: Documentation Site

### Purpose
Interactive documentation where developers learn about the platform and copy code to integrate into their apps.

### Tech Stack Recommendations
- **Framework**: Docusaurus v3 or Nextra (Next.js based)
- **Styling**: Custom theme with dark mode
- **Code Highlighting**: Shiki with copy buttons
- **Search**: Algolia DocSearch
- **Deployment**: Vercel or Cloudflare Pages

### Site Structure

```
docs.mantle-gasless.xyz/
├── /
│   └── Landing page
├── /docs
│   ├── /introduction
│   │   ├── what-is-gasless
│   │   ├── how-it-works
│   │   ├── use-cases
│   │   └── pricing
│   ├── /getting-started
│   │   ├── quickstart (5 minutes)
│   │   ├── deploy-paymaster
│   │   ├── fund-and-configure
│   │   └── first-transaction
│   ├── /sdk-reference
│   │   ├── installation
│   │   ├── initialization
│   │   ├── api-reference
│   │   └── typescript-types
│   ├── /integration-guides
│   │   ├── react
│   │   ├── nextjs
│   │   ├── vue
│   │   ├── angular
│   │   ├── vanilla-js
│   │   └── nodejs-backend
│   ├── /examples
│   │   ├── erc20-transfers
│   │   ├── nft-minting
│   │   ├── defi-swaps
│   │   ├── gaming-actions
│   │   └── social-media
│   ├── /advanced
│   │   ├── custom-validation
│   │   ├── spending-limits
│   │   ├── multi-paymaster
│   │   └── error-handling
│   └── /api
│       ├── rest-api
│       ├── websocket
│       └── webhooks
├── /playground
│   └── Interactive code editor
├── /blog
│   └── Tutorials & announcements
└── /support
    └── FAQ, troubleshooting
```

### Key Features

#### 1. Interactive Code Examples

**Every code block should be:**
- ✅ **Executable in browser** (using iframe sandbox)
- ✅ **Copy-pasteable** with one click
- ✅ **Customizable** (user can edit values)
- ✅ **Multi-language** (TypeScript, JavaScript, Python SDK future)

**Example:**

```tsx
// In the docs MDX file:
<CodePlayground
  title="Your First Gasless Transaction"
  language="typescript"
  editable={true}
  runnable={true}
  defaultCode={`
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// Connect to Mantle
const provider = new ethers.BrowserProvider(window.ethereum);
const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'
});

// Get user's signer
const signer = await provider.getSigner();

// Execute gasless transaction
const paymaster = sdk.getPaymaster('YOUR_PAYMASTER_ADDRESS');
const result = await paymaster.executeGasless(
  signer,
  'TOKEN_CONTRACT_ADDRESS',
  'transfer(address,uint256)',
  [recipientAddress, ethers.parseEther('100')]
);

console.log('Success!', result.txHash);
`}
/>
```

**Implementation:**
- Use CodeSandbox API or custom iframe
- Highlight variables that need replacement
- Show output/console logs
- Provide "Open in CodeSandbox" button

#### 2. Copy-Paste Ready Components

Create a library of ready-to-use React components:

```tsx
// In docs: /examples/react-components

<ComponentShowcase
  component="GaslessTransferButton"
  preview={<GaslessTransferButton />}
  code={`
import { useState } from 'react';
import { useGaslessSDK } from '@mantle-relayer/sdk-react';
import { ethers } from 'ethers';

export function GaslessTransferButton() {
  const sdk = useGaslessSDK();
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymaster = sdk.getPaymaster(process.env.PAYMASTER_ADDRESS);
      
      const result = await paymaster.executeGasless(
        signer,
        process.env.TOKEN_ADDRESS,
        'transfer(address,uint256)',
        [recipientAddress, ethers.parseEther('10')]
      );
      
      alert(\`Success! TX: \${result.txHash}\`);
    } catch (error) {
      alert(\`Error: \${error.message}\`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleTransfer} disabled={loading}>
      {loading ? 'Sending...' : 'Send Tokens (No Gas!)'}
    </button>
  );
}
`}
  installDeps={['@mantle-relayer/sdk', '@mantle-relayer/sdk-react', 'ethers']}
/>
```

#### 3. Framework-Specific Guides

**For each framework, provide:**

**Next.js Guide Structure:**
```markdown
# Integration with Next.js

## Installation
[Step-by-step with copy-paste commands]

## Setup Provider
[Code for app/providers.tsx]

## Create Hook
[Code for hooks/useGasless.ts]

## Use in Component
[Code for app/transfer/page.tsx]

## Environment Variables
[.env.local template]

## Deploy to Vercel
[One-click deploy button]
```

**One-Click Deploy Templates:**
```tsx
<DeployButton
  platform="vercel"
  repoUrl="https://github.com/mantle-gasless/next-starter"
  envVars={['PAYMASTER_ADDRESS', 'RELAYER_URL']}
>
  Deploy to Vercel
</DeployButton>
```

#### 4. Live Playground

**Embedded CodeSandbox:**
```
/playground
  - Left: Code editor (Monaco Editor)
  - Right: Live preview
  - Bottom: Console output
  - Top: Template selector (React, Vue, Vanilla)
```

**Features:**
- Pre-configured with SDK installed
- Connected to testnet Paymaster
- Fake transactions for demo (or real testnet)
- Share playground links
- Fork to personal sandbox

---

### 📝 Documentation Content Strategy

#### Writing Style

**Voice & Tone:**
- Friendly but professional
- Technical but accessible
- Encouraging (celebrate wins!)
- Honest about limitations

**Structure Every Doc Page:**
1. **What**: Brief description
2. **Why**: Use case / benefit
3. **How**: Step-by-step implementation
4. **Reference**: API details
5. **Next Steps**: Links to related docs

**Example Template:**
```markdown
# Page Title

> **Quick Summary**: One sentence describing what this page teaches.

## What You'll Learn

- Bullet point 1
- Bullet point 2
- Bullet point 3

## Prerequisites

- Requirement 1
- Requirement 2

## Step 1: [Action Verb]

Explanation...

```tsx
// Copy-paste ready code
```

**Expected Output:**
```
[Show what success looks like]
```

## Step 2: [Next Action]

...

## Troubleshooting

### Error: "..."
**Solution**: ...

### Error: "..."
**Solution**: ...

## Complete Example

[Full working example with all steps combined]

## Next Steps

- [Link to related guide]
- [Link to API reference]
- [Link to examples]
```

#### Must-Have Documentation

**Quickstart (Most Important):**
- 5-minute guide from zero to gasless transaction
- Video walkthrough (< 3 minutes)
- Codesandbox embed
- No external dependencies
- Works on testnet with provided Paymaster

**API Reference:**
- Auto-generated from TypeDoc
- Manual examples for each method
- Try-it-out functionality
- Error codes table
- Rate limits

**Migration Guides:**
- From ethers.js v5 → v6
- From other meta-transaction solutions
- From gasful to gasless

**Troubleshooting:**
- Common errors with solutions
- Debug checklist
- Community forum link
- Support contact

---

### 🎮 Interactive Elements

#### 1. Try It Out Buttons

```tsx
<TryItOut
  title="Check Paymaster Balance"
  description="Enter a Paymaster address to see its current balance"
  inputs={[
    { name: 'address', type: 'address', required: true }
  ]}
  action={async (inputs) => {
    const balance = await sdk.getPaymaster(inputs.address).getBalance();
    return { balance: ethers.formatEther(balance) };
  }}
  renderResult={(result) => (
    <div>Balance: {result.balance} MNT</div>
  )}
/>
```

#### 2. Parameter Builders

```tsx
<FunctionBuilder
  contract="ERC20"
  function="transfer"
  onBuild={(calldata) => {
    // Show generated code with this calldata
  }}
/>

// User fills form:
// - Recipient: [input]
// - Amount: [input]
// → Generates code they can copy
```

#### 3. Gas Savings Calculator

```tsx
<GasSavingsCalculator>
  <Input label="Expected transactions per month" />
  <Input label="Average gas per transaction (gwei)" />
  <Select label="Your use case" options={['NFT', 'DeFi', 'Gaming']} />
  
  <Result>
    You'll save users: $XXX per month
    Your cost: $YYY per month
    Net value: $ZZZ per month
  </Result>
</GasSavingsCalculator>
```

---

## 🔗 Integration Between Products

### Dashboard → Docs Links

**In Dashboard, provide contextual help:**
```tsx
<HelpButton
  docsUrl="/docs/paymasters/whitelisting"
  tooltip="Learn about whitelisting"
/>
```

**Quick Start Guide in Dashboard:**
- After creating Paymaster, show modal:
  ```
  "Paymaster Created! 🎉
   
   Next steps:
   1. Fund your Paymaster [Button]
   2. Whitelist contracts [Button]
   3. Integrate SDK [Link to docs]
   
   Or watch our 5-minute tutorial [Video]"
  ```

### Docs → Dashboard Links

**In documentation:**
```tsx
<CTABox>
  Already have a Paymaster?
  <Button href="/dashboard">Go to Dashboard →</Button>
  
  Need to create one?
  <Button href="/dashboard/paymasters/new">Create Paymaster →</Button>
</CTABox>
```

---

## 🎯 Success Metrics & KPIs

### Dashboard Metrics

**Engagement:**
- Daily/Monthly Active Users
- Time to first Paymaster creation
- Average session duration
- Feature adoption rates

**Performance:**
- Page load time < 2s
- Time to interactive < 3s
- Error rate < 1%

**Conversion:**
- Sign-up to first Paymaster: Target < 5 minutes
- First Paymaster to first transaction: Target < 10 minutes

### Documentation Metrics

**Usage:**
- Page views (which docs are most popular?)
- Search queries (what are people looking for?)
- Code copy events (what examples work best?)
- Playground usage

**Effectiveness:**
- Time on page (are they reading or bouncing?)
- Scroll depth (do they reach the code?)
- External clicks (do they follow next steps?)

**Feedback:**
- "Was this helpful?" votes
- Comments/questions
- GitHub issues/PRs for docs

---

## 🚀 Development Phases

### Phase 1: MVP (Weeks 1-3)

**Dashboard:**
- [ ] Landing page
- [ ] Wallet authentication
- [ ] Create Paymaster
- [ ] View Paymasters list
- [ ] Paymaster detail page (basic)
- [ ] Fund Paymaster
- [ ] Basic transaction list
- [ ] Deploy to Vercel

**Docs:**
- [ ] Site structure (Docusaurus)
- [ ] Quickstart guide
- [ ] SDK installation docs
- [ ] Basic API reference
- [ ] 3 example use cases
- [ ] Deploy to Vercel

### Phase 2: Enhancement (Weeks 4-6)

**Dashboard:**
- [ ] Analytics page with charts
- [ ] Whitelist management UI
- [ ] Spending limits configuration
- [ ] Real-time transaction feed (WebSocket)
- [ ] Export data (CSV)
- [ ] Email notifications

**Docs:**
- [ ] Interactive code examples
- [ ] Framework-specific guides (React, Next.js, Vue)
- [ ] Video tutorials
- [ ] Playground
- [ ] Troubleshooting guide
- [ ] Migration guides

### Phase 3: Advanced (Weeks 7-8)

**Dashboard:**
- [ ] Advanced analytics
- [ ] API key management
- [ ] Webhook configuration
- [ ] Team management (multi-user)
- [ ] Billing integration
- [ ] Mobile responsiveness improvements

**Docs:**
- [ ] Auto-generated API docs
- [ ] More examples (10+ use cases)
- [ ] Community showcase
- [ ] Blog/tutorials
- [ ] Search (Algolia)
- [ ] Localization (if needed)

---

## 📦 Deliverables for Frontend Developer

### Repository Structure

```
mantle-gasless-frontend/
├── apps/
│   ├── dashboard/          # Next.js app
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── public/
│   └── docs/              # Docusaurus site
│       ├── docs/
│       ├── src/
│       └── static/
├── packages/
│   ├── ui/                # Shared components
│   ├── config/            # Shared config
│   └── types/             # Shared types
├── package.json           # Monorepo root
└── turbo.json            # Turborepo config
```

### Design Assets Needed

**From Design Team:**
- [ ] Logo (SVG)
- [ ] Color palette
- [ ] Typography scale
- [ ] Component designs (Figma)
- [ ] Icons (custom if any)
- [ ] Illustrations for empty states
- [ ] Marketing images

**From This Team:**
- [ ] Technical architecture diagram
- [ ] User flow diagrams
- [ ] Data models
- [ ] API documentation
- [ ] Integration examples

### Environment Variables

```bash
# Dashboard
NEXT_PUBLIC_RELAYER_URL=https://relayer.mantle-gasless.xyz
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_FACTORY_ADDRESS=0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.mantlescan.xyz

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://app.mantle-gasless.xyz

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=xxx

# Docs
ALGOLIA_APP_ID=xxx
ALGOLIA_API_KEY=xxx
ALGOLIA_INDEX_NAME=mantle-docs
```

---

## 📞 Communication & Handoff

### What Frontend Dev Needs From You

1. **API Documentation**: OpenAPI spec for backend
2. **SDK Build**: Published npm package
3. **Test Credentials**: Testnet Paymaster addresses
4. **Design Mockups**: At least wireframes
5. **Content**: Documentation copy
6. **Examples**: Working code examples

### What You Need From Frontend Dev

1. **Progress Updates**: Weekly standups
2. **Technical Questions**: Slack/Discord channel
3. **Feedback**: What's unclear in specs
4. **Timeline**: Realistic estimates
5. **Demos**: Show work as it's built

### Review Process

**Weekly Reviews:**
- Monday: Planning & priorities
- Wednesday: Mid-week check-in
- Friday: Demo & feedback

**Code Reviews:**
- All PRs reviewed within 24 hours
- Focus on UX and integration correctness
- Don't nitpick style (use Prettier)

---

## ✅ Acceptance Criteria

### Dashboard Must-Haves

- [ ] User can connect wallet
- [ ] User can create and fund Paymaster
- [ ] User can view transaction history
- [ ] User can configure whitelists
- [ ] Dashboard updates in real-time
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)
- [ ] Fast (<2s load time)

### Documentation Must-Haves

- [ ] Quickstart works in < 5 minutes
- [ ] All code examples are copy-pasteable
- [ ] Code examples actually work
- [ ] Search functionality works
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] Fast (<1s page load)

### Both Products

- [ ] No console errors
- [ ] Analytics tracking implemented
- [ ] SEO optimized (meta tags, sitemaps)
- [ ] Error tracking (Sentry)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] Deployed to production URLs

---

## 🎨 Brand Guidelines

### Voice

**We are:**
- Innovative but trustworthy
- Technical but approachable
- Excited but not hype-y
- Helpful, never condescending

**We are NOT:**
- Corporate/stuffy
- Overly casual (no "fam", "WAGMI")
- Buzzword-heavy
- Gatekeeping

### Writing Style

**Do:**
- Use "you" (second person)
- Active voice
- Short sentences
- Concrete examples
- Celebrate wins ("Great job!")

**Don't:**
- Use jargon without explaining
- Assume prior knowledge
- Write walls of text
- Use passive voice

### Tone Examples

**Error Messages:**
❌ "Transaction failed"
✅ "Transaction couldn't be processed. This usually means the Paymaster balance is too low. [Add funds]"

**Success Messages:**
❌ "Transaction completed"
✅ "Success! Your user just saved $2.34 in gas fees 🎉"

**Empty States:**
❌ "No data available"
✅ "No transactions yet. Once users start interacting gaslessly, they'll appear here."

---

## 🔒 Security Considerations

### Dashboard Security

**Must Implement:**
- [ ] HTTPS only
- [ ] CSP headers
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Secure cookie flags
- [ ] Session timeout
- [ ] Audit logging

**Wallet Security:**
- Never ask for private keys
- Only sign messages, not transactions (for auth)
- Clear warnings before any transaction
- Display transaction details before signing

### Documentation Security

**Considerations:**
- All example private keys are fake/testnet only
- Warning messages about mainnet usage
- Security best practices page
- Responsible disclosure policy

---

## 📊 Appendix: Component Specifications

### PaymasterCard Component

```tsx
interface PaymasterCardProps {
  address: string;
  name?: string;
  balance: bigint;
  status: 'active' | 'paused' | 'low-balance';
  transactions24h: number;
  gasSpent24h: bigint;
  onView: () => void;
  onFund: () => void;
  onPause: () => void;
}

<PaymasterCard
  address="0x1234...5678"
  name="My Gaming Paymaster"
  balance={45230000000000000000n} // 45.23 MNT
  status="active"
  transactions24h={234}
  gasSpent24h={1230000000000000000n} // 1.23 MNT
  onView={() => router.push(`/dashboard/paymasters/${address}`)}
  onFund={() => setFundModalOpen(true)}
  onPause={async () => {
    await paymaster.pause();
    toast.success('Paymaster paused');
  }}
/>
```

### TransactionRow Component

```tsx
interface TransactionRowProps {
  txHash: string;
  user: string;
  contract: string;
  functionName: string;
  gasCost: bigint;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: Date;
  onClick: () => void;
}
```

### GasChart Component

```tsx
interface GasChartProps {
  data: Array<{
    timestamp: Date;
    gasCost: number;
    txCount: number;
  }>;
  timeRange: '24h' | '7d' | '30d' | 'all';
  onTimeRangeChange: (range: TimeRange) => void;
}
```

---

**This specification is complete and ready for implementation!** 🚀

Share this document with your frontend developer, and they'll have everything needed to build both products. Update as you get feedback or requirements change.
