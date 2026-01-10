# Frontend Developer Onboarding - Mantle Gasless Relayer

**Quick Start Guide for Frontend Team**

---

## 🎯 What We're Building

We're building **two web products** that enable dApp developers to sponsor gas fees for their users:

1. **Developer Dashboard** - Web app to manage Paymasters and monitor usage
2. **Documentation Site** - Interactive docs where developers learn and copy code

**Think**: Stripe Dashboard + Stripe Docs, but for gasless blockchain transactions.

---

## 📦 Your Mission

Build the frontend that makes it **dead simple** for developers to:
1. Sign up → Create Paymaster → Fund it (< 5 minutes)
2. Configure which contracts/functions users can interact with
3. Monitor transactions and costs in real-time
4. Copy-paste code to integrate gasless transactions into their apps

---

## 🏗️ Tech Stack (Recommended)

### Dashboard
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: ethers.js v6 + Wagmi v2
- **Charts**: Recharts
- **Deploy**: Vercel

### Documentation Site
- **Framework**: Docusaurus v3 or Nextra
- **Features**: Interactive code examples, playground
- **Search**: Algolia DocSearch
- **Deploy**: Vercel

---

## 📋 Priority Features

### Phase 1 (MVP - Week 1-3)

**Dashboard:**
```
✅ High Priority:
- [ ] Landing page
- [ ] Wallet connect (MetaMask)
- [ ] Create Paymaster flow
- [ ] Paymaster list view
- [ ] Fund Paymaster
- [ ] Basic transaction history
- [ ] Paymaster detail page
```

**Docs:**
```
✅ High Priority:
- [ ] Site structure
- [ ] Quickstart (5-minute guide)
- [ ] SDK installation
- [ ] Basic API reference
- [ ] 3 copy-paste examples
```

### Phase 2 (Enhancement - Week 4-6)

**Dashboard:**
```
🔄 Medium Priority:
- [ ] Analytics with charts
- [ ] Whitelist management UI
- [ ] Real-time updates (WebSocket)
- [ ] Export data (CSV)
- [ ] Email notifications
```

**Docs:**
```
🔄 Medium Priority:
- [ ] Interactive code editor
- [ ] Framework guides (React, Vue, Next.js)
- [ ] Video tutorials
- [ ] Live playground
```

---

## 🎨 Design Reference

### Dashboard Pages

```
1. Landing (/)
   └─ Hero + CTA → Dashboard

2. Dashboard Home (/dashboard)
   ├─ Quick stats cards
   ├─ Usage chart
   └─ Recent transactions

3. Paymasters (/dashboard/paymasters)
   ├─ List all Paymasters
   └─ [+ Create New] button

4. Paymaster Detail (/dashboard/paymasters/[address])
   ├─ Tab: Overview (stats, chart)
   ├─ Tab: Whitelists (contracts, functions)
   ├─ Tab: Spending Limits
   └─ Tab: Settings

5. Transactions (/dashboard/transactions)
   ├─ Filterable table
   └─ Transaction detail modal

6. Analytics (/dashboard/analytics)
   ├─ Cost trends
   ├─ User engagement
   └─ Insights

7. Settings (/dashboard/settings)
   ├─ Profile
   ├─ API Keys
   └─ Notifications
```

### Key UI Components

```tsx
// Core Components
<ConnectWalletButton />
<PaymasterCard address balance status />
<TransactionTable data pagination />
<GasChart data timeRange />
<StatCard title value trend />
<WhitelistManager contracts functions />

// Layout
<DashboardLayout>
  <Sidebar />
  <Header />
  <Main />
</DashboardLayout>
```

---

## 💻 Code Examples (For Docs)

### Every Code Block Must Have:

1. **Copy button** (one-click copy)
2. **Language syntax highlighting**
3. **Line numbers**
4. **Ability to customize** (user can edit values)
5. **"Try it out" button** (if applicable)

### Example Structure:

```tsx
<CodeBlock
  language="typescript"
  title="Execute Gasless Transaction"
  copyable
  editable
  highlightLines={[8, 9, 10]}
>
{`
import { MantleGaslessSDK } from '@mantle-relayer/sdk';

const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'
});

// This is the magic ✨
const result = await paymaster.executeGasless(...);
console.log('TX Hash:', result.txHash);
`}
</CodeBlock>
```

### Must-Have Doc Pages:

```
/docs/quickstart          - 5-minute start (MOST IMPORTANT)
/docs/sdk-reference       - Full API docs
/docs/guides/react        - React integration
/docs/guides/nextjs       - Next.js integration
/docs/examples/nft        - NFT minting example
/docs/examples/token      - Token transfer example
/playground               - Interactive editor
```

---

## 🔗 Backend Integration

### API Endpoints (Already Built)

```bash
# Health Check
GET /health

# Relay Transaction
POST /api/v1/relay
Body: { paymasterAddress, metaTx }

# Validate Transaction
POST /api/v1/validate
Body: { paymasterAddress, metaTx }

# Get Paymaster Info
GET /api/v1/paymaster/:address

# Get User Nonce
GET /api/v1/paymaster/:address/nonce/:userAddress

# Get Transaction Status
GET /api/v1/transaction/:txHash
```

**Backend URL (after deployment):**
```
Testnet: https://your-app.railway.app
Mainnet: TBD
```

### SDK (Already Built)

```bash
npm install @mantle-relayer/sdk ethers
```

```tsx
import { MantleGaslessSDK } from '@mantle-relayer/sdk';

// Use in Dashboard to call backend
const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: process.env.NEXT_PUBLIC_RELAYER_URL,
  factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS
});

// Get Paymaster info
const paymaster = sdk.getPaymaster(address);
const info = await paymaster.getInfo();
const balance = await paymaster.getBalance();
const nonce = await paymaster.getUserNonce(userAddress);

// Execute gasless transaction
const result = await paymaster.executeGasless(
  signer,
  targetContract,
  'functionSignature',
  [args]
);
```

---

## 🎨 Design Guidelines

### Colors

```css
/* Status Colors */
--success: #10B981;   /* Green */
--warning: #F59E0B;   /* Amber */
--error: #EF4444;     /* Red */
--info: #3B82F6;      /* Blue */

/* Brand */
--primary: #8B5CF6;   /* Purple */
--secondary: #EC4899; /* Pink */
```

### Typography

```css
/* Headings */
h1: font-size: 2.5rem; font-weight: 700;
h2: font-size: 2rem; font-weight: 600;
h3: font-size: 1.5rem; font-weight: 600;

/* Body */
body: font-size: 1rem; font-weight: 400;
small: font-size: 0.875rem;
```

### Spacing

```css
/* Use 4px base unit */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

---

## 📱 Responsive Design

### Breakpoints

```tsx
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large Desktop
};
```

### Mobile Priorities

```
Dashboard:
- Sidebar → Bottom navigation
- Cards stack vertically
- Tables → Swipeable cards
- Charts → Simplified view

Docs:
- Collapsible sidebar
- Sticky TOC becomes dropdown
- Code blocks scrollable horizontally
```

---

## 🔐 Authentication

### Wallet-Based Auth (Web3)

```tsx
// User Flow:
1. Click "Connect Wallet"
2. MetaMask popup
3. User signs message (no gas)
4. Backend generates JWT
5. Store JWT in httpOnly cookie
6. Redirect to dashboard

// Implementation:
import { useConnect, useSignMessage } from 'wagmi';

const { signMessageAsync } = useSignMessage();

const handleAuth = async () => {
  // Sign message for authentication
  const message = `Sign in to Mantle Gasless Relayer\nTimestamp: ${Date.now()}`;
  const signature = await signMessageAsync({ message });
  
  // Send to backend
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ message, signature, address })
  });
  
  const { token } = await response.json();
  // Token stored in httpOnly cookie by backend
  router.push('/dashboard');
};
```

---

## 📊 Real-Time Updates

### WebSocket for Live Transactions

```tsx
// In Dashboard, show real-time transaction feed

import { useEffect, useState } from 'react';

const TransactionFeed = ({ paymasterAddress }) => {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/transactions`);
    
    ws.onmessage = (event) => {
      const tx = JSON.parse(event.data);
      if (tx.paymasterAddress === paymasterAddress) {
        setTransactions(prev => [tx, ...prev].slice(0, 10));
        // Show toast notification
        toast.success(`New transaction: ${tx.txHash.slice(0, 10)}...`);
      }
    };
    
    return () => ws.close();
  }, [paymasterAddress]);
  
  return (
    <div>
      {transactions.map(tx => (
        <TransactionRow key={tx.txHash} {...tx} />
      ))}
    </div>
  );
};
```

---

## 🎯 Success Metrics

### What We're Tracking

```
Dashboard:
- Time to first Paymaster creation: < 5 minutes
- Page load time: < 2 seconds
- Error rate: < 1%
- Daily active users

Docs:
- Time to complete quickstart: < 5 minutes
- Code copy events
- Playground usage
- Search queries (what are people looking for?)
```

### Analytics Setup

```tsx
// Use Google Analytics or Mixpanel
import { analytics } from '@/lib/analytics';

// Track key events
analytics.track('paymaster_created', {
  address: paymasterAddress,
  initialFunding: amount
});

analytics.track('code_copied', {
  page: '/docs/quickstart',
  codeBlock: 'first-transaction'
});

analytics.track('transaction_executed', {
  paymasterAddress,
  gasSponsored: cost
});
```

---

## 🚀 Deployment

### Environment Variables

```bash
# .env.local (Dashboard)
NEXT_PUBLIC_RELAYER_URL=https://relayer.mantle-gasless.xyz
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_FACTORY_ADDRESS=0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.mantlescan.xyz

NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://app.mantle-gasless.xyz

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Deploy Commands

```bash
# Dashboard
cd apps/dashboard
npm run build
vercel deploy

# Docs
cd apps/docs
npm run build
vercel deploy
```

---

## 📦 What You Get From Us

### Already Built:

✅ **Backend API** (Railway deployed)
- All REST endpoints working
- WebSocket for real-time updates
- Full error handling

✅ **Smart Contracts** (Deployed on Mantle Sepolia)
- RelayerHub: `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737`
- PaymasterFactory: `0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4`

✅ **SDK** (`@mantle-relayer/sdk`)
- Published to npm
- Full TypeScript support
- All methods documented

✅ **Documentation**
- API reference
- Integration guides
- Code examples

### What We Need From You:

📋 **Dashboard**: Fully functional web app
📚 **Docs Site**: Interactive documentation
🎨 **Design System**: Consistent UI/UX
📱 **Mobile Support**: Responsive design
🧪 **Testing**: Works in all browsers
⚡ **Performance**: Fast load times

---

## 🤝 Communication

### Daily Standup (Async)

**In Slack/Discord:**
```
🌅 Morning:
- What I'm working on today
- Any blockers

🌆 Evening:
- What I completed
- What I'll do tomorrow
- Questions for the team
```

### Weekly Demo (Friday)

**Show:**
- New features working
- Challenges faced
- Decisions made
- Next week's plan

### Questions?

**Ask in team channel:**
- Technical questions about backend/SDK
- Clarification on requirements
- Design decisions
- Timeline concerns

**Response time:** < 4 hours during work hours

---

## 📚 Resources

### Documentation

- [Full Requirements](./FRONTEND_REQUIREMENTS.md) - Complete spec (this is comprehensive!)
- [SDK Docs](./sdk/README.md) - How to use SDK
- [Backend API](./backend/README.md) - API reference
- [Smart Contract Docs](./smart-contract/README.md) - Contract details

### Example Code

```
/sdk/examples/
├── basic-usage.ts         - Simple gasless transaction
├── react-integration.tsx  - React hooks example
└── paymaster-management.ts - Admin operations
```

### Design References

**Similar Products (for inspiration):**
- [Stripe Dashboard](https://dashboard.stripe.com) - Clean, intuitive
- [Vercel Dashboard](https://vercel.com/dashboard) - Great developer UX
- [Etherscan](https://etherscan.io) - Blockchain data display
- [Docusaurus](https://docusaurus.io) - Great documentation UX

### Figma Files

*[To be provided by design team]*

---

## ✅ Acceptance Criteria

### Before Launch:

**Dashboard:**
- [ ] User can connect wallet
- [ ] User can create Paymaster (< 5 mins)
- [ ] User can fund Paymaster
- [ ] User can view transactions
- [ ] User can configure whitelists
- [ ] Charts show real data
- [ ] Real-time updates work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Tested in Chrome, Firefox, Safari

**Docs:**
- [ ] Quickstart works (tested!)
- [ ] All code examples copy-pasteable
- [ ] Code examples actually work
- [ ] Search works
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] All links work
- [ ] No broken images

---

## 🎉 Let's Build!

You have everything you need to start building. The backend and SDK are ready, smart contracts are deployed, and we're here to support you.

**Next Steps:**
1. Read [FRONTEND_REQUIREMENTS.md](./FRONTEND_REQUIREMENTS.md) (full spec)
2. Set up your development environment
3. Create repository structure
4. Start with dashboard landing page
5. Deploy early, deploy often!

**Questions?** Drop them in the team channel. Let's build something amazing! 🚀

---

**Document Version**: 1.0  
**Last Updated**: January 10, 2026  
**Point of Contact**: [Your Name/Team]
