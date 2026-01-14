# Mantle Gasless Relayer - Documentation Site Build Prompts

**Document Purpose**: Step-by-step AI prompts for building the developer documentation site  
**Format**: Instructions only, no code implementations  
**Build Philosophy**: Component-based, real-time updates, max 600 lines per file  
**Target Framework**: Next.js with MDX (Nextra or custom)

---

## 📋 Table of Contents

1. [Project Setup Prompts](#phase-1-project-setup)
2. [Design System Prompts](#phase-2-design-system)
3. [Layout Components Prompts](#phase-3-layout-components)
4. [Content Structure Prompts](#phase-4-content-structure)
5. [Interactive Components Prompts](#phase-5-interactive-components)
6. [Code Block Features Prompts](#phase-6-code-block-features)
7. [API Reference Prompts](#phase-7-api-reference)
8. [Search & Navigation Prompts](#phase-8-search--navigation)
9. [Interactive Playground Prompts](#phase-9-interactive-playground)
10. [Polish & Optimization Prompts](#phase-10-polish--optimization)

---

## 🎨 Color Palette Reference

Use the same colors as the main application for consistency:

| Name | Hex Value | Usage |
|------|-----------|-------|
| **Primary** | `#6366F1` (Indigo) | Links, highlights, focus |
| **Primary Light** | `#818CF8` | Hover states |
| **Secondary** | `#0EA5E9` (Sky) | Secondary accents |
| **Success** | `#22C55E` (Green) | Success examples, tips |
| **Warning** | `#F59E0B` (Amber) | Warnings, important notes |
| **Error** | `#EF4444` (Red) | Error examples, danger |
| **Background** | `#09090B` | Page background |
| **Card** | `#18181B` | Code blocks, callouts |
| **Border** | `#27272A` | Borders, dividers |
| **Text Primary** | `#FAFAFA` | Main text |
| **Text Muted** | `#A1A1AA` | Secondary text |
| **Code Background** | `#0D0D0F` | Code block background |

---

## Phase 1: Project Setup

### Prompt 1.1 - Initialize Documentation Project

```
Create a new Next.js 14 documentation site for the Mantle Gasless Relayer project.

Decision: Use Nextra 3.0 (Next.js-based documentation framework) OR build custom 
MDX setup. Nextra is recommended for faster setup with excellent features.

If using Nextra:
- Use the "docs" theme
- Configure for dark mode default
- Set up path aliases with @ symbol
- Configure TypeScript in strict mode

If custom setup:
- Set up next-mdx-remote for MDX rendering
- Configure MDX plugins (remark-gfm, rehype-slug, etc.)
- Create MDX component mapping

Project should be:
- Separate from main app but can share design system
- Optimized for SEO
- Fast to load and navigate
- Easy to maintain and update content

Domain consideration: docs.mantlerelayer.com or mantlerelayer.com/docs
```

### Prompt 1.2 - Install Documentation Dependencies

```
Install and configure dependencies for the documentation site:

Core:
- Next.js 14 (if not using Nextra)
- Nextra and nextra-theme-docs (if using Nextra)
- TypeScript

Styling:
- TailwindCSS v4 with same configuration as main app
- Same design tokens and CSS variables for consistency
- Inter font and JetBrains Mono

Code Features:
- Shiki or Prism for syntax highlighting
- Support for TypeScript, JavaScript, Solidity, Bash, JSON
- Line highlighting capability
- Copy button functionality

MDX Plugins:
- remark-gfm (GitHub Flavored Markdown)
- rehype-slug (heading IDs)
- rehype-autolink-headings (clickable headings)
- remark-toc (table of contents generation)

Search:
- Flexsearch for local search
- Or: Algolia DocSearch integration (if available)

Create utility functions shared with main app where applicable.
```

### Prompt 1.3 - Set Up Folder Structure

```
Create the documentation site folder structure:

For Nextra-based setup:
docs-site/
├── pages/
│   ├── _app.tsx                 - App wrapper
│   ├── _meta.json               - Navigation configuration
│   ├── index.mdx                - Home/Introduction
│   ├── getting-started/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   ├── quickstart.mdx
│   │   └── installation.mdx
│   ├── guides/
│   │   ├── _meta.json
│   │   ├── create-paymaster.mdx
│   │   ├── fund-paymaster.mdx
│   │   ├── whitelist-contracts.mdx
│   │   └── sdk-integration.mdx
│   ├── api-reference/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   ├── endpoints.mdx
│   │   └── errors.mdx
│   ├── sdk/
│   │   ├── _meta.json
│   │   ├── installation.mdx
│   │   ├── client.mdx
│   │   ├── signer.mdx
│   │   └── examples.mdx
│   └── contracts/
│       ├── _meta.json
│       ├── overview.mdx
│       ├── relayer-hub.mdx
│       ├── paymaster-factory.mdx
│       └── paymaster.mdx
├── components/
│   ├── CodeBlock.tsx
│   ├── Callout.tsx
│   ├── Card.tsx
│   ├── Tabs.tsx
│   ├── ApiEndpoint.tsx
│   └── Playground.tsx
├── theme.config.tsx             - Nextra theme configuration
├── public/
└── styles/

Each folder should have _meta.json defining page order and labels.
```

---

## Phase 2: Design System

### Prompt 2.1 - Configure Documentation Theme

```
Configure the documentation theme to match the main application aesthetic:

Base theme: Dark mode as default with light mode option

Color scheme:
- Background: Same dark as main app (#09090B)
- Sidebar background: Slightly lighter (#0F0F11)
- Code blocks: Darker than background (#0D0D0F)
- Text: High contrast white (#FAFAFA)
- Links: Primary indigo color
- Headings: White with gradient option for H1

Typography:
- Body: Inter, 16px, 1.75 line height for readability
- Headings: Inter Semi-Bold
- Code inline: JetBrains Mono, slightly smaller
- Code blocks: JetBrains Mono, 14px

Spacing:
- Content max-width: 800px for readability
- Comfortable margins between sections
- Adequate padding in code blocks

The docs should feel like a natural extension of the main app, not a separate product.
```

### Prompt 2.2 - Create Documentation-Specific Components

```
Create custom MDX components for documentation:

Components needed:

1. CodeBlock (enhanced)
   - Syntax highlighting
   - Line numbers (toggleable)
   - Line highlighting
   - Filename display
   - Copy button with feedback
   - Language label

2. Callout
   - Types: note, tip, warning, danger, info
   - Icon for each type
   - Collapsible option
   - Styled border left accent

3. Card/CardGrid
   - For feature highlights
   - Icon, title, description
   - Optional link
   - Grid layout for multiple cards

4. Tabs
   - For multiple code examples (React, Vue, etc.)
   - For different versions/methods
   - Persistent selection (localStorage)
   - Smooth transitions

5. Steps
   - Numbered step-by-step instructions
   - Visual connector between steps
   - Collapsible steps for long content

6. ApiEndpoint
   - Method badge (GET, POST, etc.)
   - Endpoint path with parameters
   - Request/response examples
   - Try it button (optional)

Map these components to MDX for easy usage in content files.
```

### Prompt 2.3 - Code Block Syntax Highlighting

```
Set up syntax highlighting for code blocks:

Languages to support:
- TypeScript (primary)
- JavaScript
- Solidity
- Bash/Shell
- JSON
- YAML
- Markdown

Color scheme (for dark mode):
- Keywords: Indigo (#818CF8)
- Strings: Green (#4ADE80)
- Comments: Muted gray (#6B7280)
- Functions: Sky blue (#38BDF8)
- Variables: White (#FAFAFA)
- Numbers: Amber (#FCD34D)
- Operators: Muted (#A1A1AA)

Features:
- Line numbers on left (optional, off by default)
- Highlight specific lines (with different background)
- Highlight specific words/phrases
- Diff syntax (green for added, red for removed)
- Terminal prompt styling for bash

The highlighting should be consistent with popular IDEs/editors.
```

---

## Phase 3: Layout Components

### Prompt 3.1 - Create Documentation Header

```
Create the documentation site header:

Structure:
- Logo on left: "Mantle Relayer" + "Docs" badge
- Search bar in center (click or Cmd+K to focus)
- Right side: Theme toggle, GitHub link, Main App link

Logo behavior:
- Click logo goes to docs home
- Distinct from main app header but related

Search bar:
- Shows placeholder: "Search documentation..."
- Displays keyboard shortcut hint (⌘K or Ctrl+K)
- Opens search modal on click

GitHub link:
- Icon link to the repository
- Opens in new tab

Main app link:
- "Go to Dashboard →" or "Open App →"
- Links to main application

Mobile:
- Hamburger menu for navigation
- Search becomes icon that opens modal
- Logo stays visible
```

### Prompt 3.2 - Create Documentation Sidebar

```
Create the documentation sidebar navigation:

Structure:
- Sticky position, scrollable if content exceeds viewport
- Grouped sections with collapsible categories
- Active page highlighting

Sections and hierarchy:

Getting Started (expanded by default)
├── Introduction
├── Quick Start
├── Installation
└── Core Concepts

Guides
├── Create Paymaster
├── Fund Paymaster
├── Whitelist Contracts
├── Spending Limits
├── SDK Integration
└── Best Practices

API Reference
├── Overview
├── Authentication
├── Endpoints
├── Errors
└── Rate Limits

SDK
├── Installation
├── Client
├── Signer
├── Builder
└── Examples

Smart Contracts
├── Architecture
├── RelayerHub
├── PaymasterFactory
└── Paymaster

Resources
├── FAQ
├── Troubleshooting
├── Changelog
└── Support

Visual design:
- Category headers slightly larger/bolder
- Child items indented
- Active item has primary color indicator
- Hover shows subtle background
```

### Prompt 3.3 - Create Table of Contents Component

```
Create a right-side table of contents for page navigation:

Position:
- Fixed on right side (desktop only)
- Shows headings from current page

Content:
- Automatically extract H2 and H3 headings
- Show as indented list
- H2 as main items, H3 indented under parent

Active state:
- Highlight current section based on scroll position
- Use intersection observer
- Smooth indicator transition

Behavior:
- Click heading scrolls to that section
- Smooth scroll animation
- Update URL hash without page jump

Visual design:
- Smaller text than main content
- Muted color, active item in primary color
- Thin left border, active item has thicker border
- Title: "On this page"

Mobile:
- Hide table of contents
- Or: Show as collapsible at top of page
```

### Prompt 3.4 - Create Previous/Next Navigation

```
Create bottom navigation for moving between pages:

Position:
- Full width at bottom of content
- Above footer

Structure:
- Two cards side by side
- Left card: Previous page
- Right card: Next page

Each card shows:
- Direction label: "Previous" or "Next"
- Page title
- Arrow icon pointing direction

Behavior:
- Click navigates to that page
- Keyboard: ← and → arrows navigate (optional)
- Determine prev/next from sidebar structure

Visual design:
- Subtle background cards
- Hover effect (lift, border glow)
- Arrow animates on hover
- Full clickable area

Edge cases:
- First page: Hide previous card or show grayed out
- Last page: Hide next card or show "Back to home"
- Single page section: Still show what makes sense
```

### Prompt 3.5 - Create Feedback Component

```
Create a feedback component for each documentation page:

Position:
- After main content, before prev/next navigation

Question:
- "Was this page helpful?"

Options:
- Two buttons: Thumbs up / Thumbs down
- Or: Yes / No text buttons

On click:
- Show thank you message
- If negative, optionally show feedback form
- Record feedback (can start with localStorage, add backend later)

Feedback form (on negative):
- Text area: "What can we improve?"
- Optional email field
- Submit button
- Cancel/skip option

Visual design:
- Subtle, doesn't draw too much attention
- Thank you state replaces the question
- Form appears with smooth animation

This helps identify which docs need improvement.
```

---

## Phase 4: Content Structure

### Prompt 4.1 - Create Homepage/Introduction

```
Create the documentation homepage (index.mdx):

Hero section:
- Title: "Mantle Gasless Relayer Documentation"
- Subtitle: "Learn how to enable gasless transactions for your users"
- Two CTA cards: "Quick Start →" and "API Reference →"

Quick overview:
- Brief explanation of what Mantle Gasless Relayer does
- Key benefits in 3-4 bullet points
- Visual diagram (simple flow showing User → dApp → Relayer → Chain)

Feature cards grid:
- "Create Paymaster" - Deploy gas-sponsoring contracts
- "Control Costs" - Set spending limits and whitelists
- "Integrate SDK" - Add gasless transactions to any dApp
- "Monitor Usage" - Real-time analytics and alerts

Getting started path:
- Numbered steps linking to guides:
  1. Read the Quick Start guide
  2. Create your first Paymaster
  3. Integrate the SDK
  4. Monitor your dashboard

Community/support section:
- GitHub repository link
- Discord community link (if available)
- Support contact

Contract addresses info box:
- Show current deployment addresses
- Indicate these are testnet addresses
```

### Prompt 4.2 - Create Quick Start Guide

```
Create the Quick Start guide (getting-started/quickstart.mdx):

Estimated time:
- Show "5 minutes" badge at top

Prerequisites section:
- Wallet with testnet MNT
- Node.js 18+ (for SDK)
- Link to faucet for testnet MNT

Step 1: Connect to Dashboard
- Brief instruction to connect wallet
- Note about Mantle Sepolia network
- Screenshot or illustration placeholder

Step 2: Create a Paymaster
- Navigate to Paymasters page
- Click "Create Paymaster"
- Choose name and initial funding
- Confirm transaction
- Show expected result

Step 3: Configure Whitelist
- Navigate to Whitelist tab
- Add your contract address
- Select functions to allow
- Save (on-chain transaction)

Step 4: Integrate SDK
- Install package command
- Basic initialization code
- Simple transaction example
- Note: Link to full SDK documentation

Step 5: Test Your Integration
- How to verify it's working
- Check dashboard for transaction
- Common issues and solutions

What's next section:
- Links to deeper guides
- Suggest reading: Spending Limits, Security Best Practices
```

### Prompt 4.3 - Create Guide Templates

```
Create a template/structure for all guide pages:

Standard guide structure:

1. Title and Introduction
   - Clear page title
   - One paragraph explaining what this guide covers
   - Prerequisites if any

2. Concept Explanation
   - Brief explanation of the concept
   - Why it matters
   - Visual diagram if helpful

3. Step-by-Step Instructions
   - Numbered steps
   - Each step has:
     - What to do (action)
     - Where to do it (location)
     - Expected result
   - Screenshots for UI actions
   - Code examples for SDK actions

4. Code Examples
   - Full working examples
   - Multiple framework tabs if applicable
   - Copy button on all code blocks

5. Common Patterns
   - Typical use cases
   - Best practices

6. Troubleshooting
   - Common issues and solutions
   - Error messages and meanings

7. Related Resources
   - Links to related guides
   - API reference links
   - FAQ relevant items

Apply this structure consistently to all guide pages.
```

### Prompt 4.4 - Create SDK Documentation Structure

```
Create the SDK documentation pages:

SDK Overview page:
- What the SDK does
- Installation instructions
- Basic example
- Link to GitHub repo

SDK Installation page:
- Package managers: npm, yarn, pnpm
- Required peer dependencies
- Version requirements
- Import instructions

SDK Client page:
- Creating a client instance
- Configuration options
- Available methods
- Code examples for each method

SDK Signer page:
- EIP-712 signing explained
- How to sign transactions
- Wallet integration examples
- Multiple wallet types (ethers, viem)

SDK Builder page:
- Transaction builder pattern
- Chaining methods
- Validation
- Building and sending

SDK Examples page:
- Basic gasless transfer
- ERC-20 token transfer
- NFT minting
- Batch transactions
- React hook integration
- Error handling patterns

Each page should have:
- TypeScript type definitions shown
- Complete, copy-pasteable examples
- Links between related SDK pages
```

### Prompt 4.5 - Create Smart Contract Documentation

```
Create the smart contract documentation pages:

Architecture Overview page:
- System diagram showing all contracts
- How contracts interact
- Role of each contract
- Deployment addresses

RelayerHub page:
- Purpose: Central hub for relaying transactions
- Key functions:
  - execute() - Execute gasless transactions
  - registerPaymaster() - Register new Paymasters
- Events emitted
- Access control explanation
- Example interactions

PaymasterFactory page:
- Purpose: Factory for deploying Paymaster contracts
- Key functions:
  - createPaymaster() - Deploy new Paymaster
  - getPaymasters() - Get user's Paymasters
- Events emitted
- Deployment cost estimate

Paymaster page:
- Purpose: Individual gas sponsor contract
- Key functions:
  - fund() - Add funds
  - withdraw() - Remove funds
  - addWhitelist() - Add allowed contract
  - removeWhitelist() - Remove contract
  - pause()/unpause() - Emergency control
  - setSpendingLimit() - Cost controls
- Storage explanation
- Security considerations

For each contract:
- Function signatures with parameters
- Solidity code snippets
- Events with indexed fields
- Example transactions
- Link to verified contract on explorer
```

---

## Phase 5: Interactive Components

### Prompt 5.1 - Create Copy Button Component

```
Create a copy button component for code blocks:

Appearance:
- Small icon button
- Position: Top right corner of code block
- Icon: Copy icon (clipboard)
- Subtle, doesn't distract from code

States:
- Default: Copy icon with "Copy" tooltip
- Hover: Slightly more visible
- Clicked: Check icon with "Copied!" tooltip
- Return to default after 2 seconds

Functionality:
- Click copies entire code block content
- Strip any line numbers from copied content
- Strip any diff markers (+ and -)
- Show toast notification confirming copy

Accessibility:
- Keyboard accessible
- Proper aria labels
- Focus ring visible

The copy button should work seamlessly on all code blocks throughout the docs.
```

### Prompt 5.2 - Create Callout/Admonition Component

```
Create callout components for important information:

Types and their appearance:

NOTE (Info)
- Icon: Info circle
- Color: Blue accent
- Use: General information, tips
- Title: "Note" (customizable)

TIP
- Icon: Lightbulb
- Color: Green accent
- Use: Best practices, helpful hints
- Title: "Tip"

WARNING
- Icon: Warning triangle
- Color: Amber/Yellow accent
- Use: Important considerations, gotchas
- Title: "Warning"

DANGER/CAUTION
- Icon: Alert circle or X
- Color: Red accent
- Use: Security concerns, breaking changes
- Title: "Danger" or "Caution"

IMPORTANT
- Icon: Star or exclamation
- Color: Purple accent
- Use: Critical information
- Title: "Important"

Structure:
- Colored left border (4px)
- Subtle background matching the type
- Icon and title in header row
- Content below with proper formatting

MDX usage should be simple like:
<Callout type="warning">Content here</Callout>
```

### Prompt 5.3 - Create Tabs Component

```
Create a tabs component for multiple content variants:

Use cases:
- Different programming languages
- Different package managers (npm, yarn, pnpm)
- Different frameworks (React, Vue, Vanilla)
- Different versions

Structure:
- Tab buttons in a row at top
- Content area below
- Only show active tab content

Persistence:
- Remember tab selection in localStorage
- Key by tab group name
- Default to first tab if no preference

Grouped tabs:
- Multiple tab groups with same options should sync
- Selecting "yarn" in one place selects it everywhere
- Only sync within same category (don't mix languages with package managers)

Animation:
- Smooth transition between tabs
- Fade or slide effect
- No layout shift

Visual design:
- Tab buttons with subtle background
- Active tab has primary color indicator (underline or background)
- Hover effect on inactive tabs
- Content area matches code block styling

MDX usage should be intuitive:
<Tabs items={['npm', 'yarn', 'pnpm']}>
  <Tab>npm install ...</Tab>
  <Tab>yarn add ...</Tab>
  <Tab>pnpm add ...</Tab>
</Tabs>
```

### Prompt 5.4 - Create Steps Component

```
Create a steps component for sequential instructions:

Visual design:
- Numbered circles on left side
- Vertical line connecting the numbers
- Content area to the right of numbers
- Each step has title and content

Step structure:
- Number indicator (1, 2, 3, etc.)
- Step title (short, action-oriented)
- Step content (can include paragraphs, code, images)
- Optional: Expected result callout

Completed state (optional):
- Allow marking steps as "completed"
- Checkbox or filled number
- Good for interactive tutorials

Collapsible (optional):
- Long content can be collapsed
- Show title with expand icon
- Useful for advanced substeps

Mobile:
- Works well on small screens
- Numbers stay aligned
- Content doesn't overflow

MDX usage:
<Steps>
  <Step title="Connect your wallet">
    Content for step 1...
  </Step>
  <Step title="Create a Paymaster">
    Content for step 2...
  </Step>
</Steps>
```

### Prompt 5.5 - Create Card Grid Component

```
Create a card grid component for feature/link highlights:

Card component:
- Icon or emoji at top
- Title
- Short description
- Optional: Link (makes entire card clickable)

Visual design:
- Subtle border or background
- Hover effect (lift, glow) if clickable
- Icon in primary or custom color
- Adequate padding

Grid layout:
- 2 columns on desktop
- 1 column on mobile
- Equal height cards in same row
- Consistent gap between cards

Card variations:
- Default: Bordered card with all elements
- Simple: Just title and description
- Large: Bigger icon, more prominent

Link behavior:
- If href provided, entire card is clickable
- External links show indicator
- Internal links use Next.js navigation

MDX usage:
<Cards>
  <Card
    icon="🚀"
    title="Quick Start"
    href="/getting-started/quickstart"
  >
    Get up and running in 5 minutes
  </Card>
</Cards>
```

---

## Phase 6: Code Block Features

### Prompt 6.1 - Create Enhanced Code Block

```
Create an enhanced code block component with all features:

Basic features:
- Syntax highlighting (Shiki or Prism)
- Copy button (top right)
- Language label (top left)
- Proper scrolling for long lines

Advanced features:
- Filename display (when provided)
- Line numbers (opt-in)
- Line highlighting (specific lines highlighted)
- Word highlighting (specific words highlighted)
- Diff mode (show additions/removals)

Line highlighting:
- Accept line numbers: {1,3-5,10}
- Different background for highlighted lines
- Line numbers still visible

Word highlighting:
- Accept word patterns
- Highlight matching text inline
- Use subtle background color

Diff mode:
- Lines starting with + show in green
- Lines starting with - show in red
- Neutral lines normal
- +/- symbols styled differently

Filename display:
- Shows above code content
- File icon based on extension
- Full path or just filename

Props/attributes for MDX:
- language: string
- filename: string (optional)
- showLineNumbers: boolean
- highlightLines: string (e.g., "1,3-5")
- diff: boolean
```

### Prompt 6.2 - Create Terminal/Shell Block

```
Create a specialized component for terminal commands:

Visual distinction:
- Different styling from code blocks
- Show terminal prompt symbol ($)
- Optional: Show output separately

Features:
- Prompt indicator ($ for bash)
- Copy button copies command only (not prompt)
- Output section styled differently
- Multiple commands support

Command variations:
- Single command: $ npm install
- Multiple commands: Show sequentially
- Command with output: Command, then gray output

Interactive elements:
- One-click copy for common commands
- Clear indication of what's copyable

Styling:
- Slightly different background or border
- Monospace font throughout
- Prompt in muted color
- Command in bright color
- Output in muted color

MDX usage:
<Terminal>
  npm install @mantle-relayer/sdk
</Terminal>

<Terminal output>
  <Command>npm run build</Command>
  <Output>Build successful! Created dist/index.js</Output>
</Terminal>
```

### Prompt 6.3 - Create Live Code Preview (Optional)

```
Create a live code preview component for interactive examples:

Note: This is an advanced feature, can be Phase 2

Purpose:
- Show code and preview side by side
- Users can edit code and see result
- Good for SDK demonstration

Structure:
- Left panel: Editable code editor
- Right panel: Output/result preview
- Toolbar: Reset, Copy, Open in CodeSandbox

Code editing:
- Basic syntax highlighting in editor
- Auto-save while typing
- Reset button to restore original
- Size constrained (not full IDE)

Preview:
- For UI components: Render output
- For SDK: Show returned data
- For errors: Show error message nicely

Limitations to communicate:
- Can't make real blockchain transactions
- Uses mock data for preview
- "Try on testnet" link for real testing

Simpler alternative:
- Just show code with "Run on CodeSandbox" button
- Opens pre-configured sandbox with the example
- Less complex to implement
```

---

## Phase 7: API Reference

### Prompt 7.1 - Create API Reference Overview

```
Create the API Reference overview page:

Introduction:
- What the API is for
- Base URL configuration
- Versioning information

Authentication section:
- How to authenticate requests
- Header format: Authorization: Bearer <token>
- Token generation process
- Link to auth guide

Request format:
- JSON request bodies
- Required headers
- Content-Type requirements

Response format:
- Standard response structure
- Success response example
- Error response example
- HTTP status codes used

Rate limiting:
- Current rate limits
- Headers that show limit status
- What happens when exceeded

Errors overview:
- Error response format
- Common error codes table
- How to handle errors

Quick links:
- Cards linking to each endpoint group
- Most used endpoints highlighted
```

### Prompt 7.2 - Create API Endpoint Component

```
Create a component for displaying API endpoints:

Structure for each endpoint:

Header:
- Method badge (GET, POST, PUT, DELETE with colors)
- Endpoint path with parameters highlighted
- Brief description

Authentication:
- Required auth badge or public badge
- Link to auth docs if needed

Parameters table:
- Name, Type, Required, Description
- For path parameters, query parameters, body parameters
- Show defaults where applicable

Request example:
- Tab component for different languages (cURL, JavaScript, Python)
- Complete, copy-pasteable examples
- Uses realistic test data

Response example:
- Success response (200, 201)
- Error responses (400, 401, 404, etc.)
- JSON formatted with syntax highlighting

Try it section (optional):
- Form to fill in parameters
- Execute button
- Shows real response
- Only for safe endpoints (GET)

The component should be reusable for all endpoints.
```

### Prompt 7.3 - Create API Endpoints Documentation

```
Document all API endpoints:

Relay Endpoints:

POST /relay/execute
- Execute a gasless transaction
- Requires: Paymaster address, signed meta-transaction
- Returns: Transaction hash and status

POST /relay/estimate
- Estimate gas for a transaction
- Does not execute, just estimates
- Returns: Estimated gas amount

GET /relay/status/:txHash
- Check transaction status
- Returns: Status, confirmations, receipt

Paymaster Endpoints:

GET /paymasters
- List all Paymasters for authenticated user
- Query params: page, limit, status
- Returns: Paginated list

GET /paymasters/:address
- Get single Paymaster details
- Returns: Full Paymaster object

GET /paymasters/:address/transactions
- Get transaction history
- Query params: page, limit, startDate, endDate
- Returns: Paginated transactions

GET /paymasters/:address/analytics
- Get analytics for Paymaster
- Query params: period (7d, 30d, 90d)
- Returns: Analytics object

Analytics Endpoints:

GET /analytics
- Get global analytics for user
- Returns: Aggregated stats

GET /analytics/export
- Export analytics data
- Query params: format (csv, json), dateRange
- Returns: File download

For each endpoint, use the ApiEndpoint component created earlier.
```

### Prompt 7.4 - Create Error Codes Reference

```
Create a comprehensive error codes reference page:

Introduction:
- How errors are structured
- Where to find error details in response

Error response format:
- Show JSON structure
- Explain each field (code, message, details)

Error codes table organized by category:

Authentication Errors (1xxx):
- 1001: Invalid or expired token
- 1002: Missing authorization header
- 1003: Insufficient permissions

Validation Errors (2xxx):
- 2001: Invalid address format
- 2002: Invalid signature
- 2003: Missing required field
- 2004: Value out of range

Paymaster Errors (3xxx):
- 3001: Paymaster not found
- 3002: Paymaster is paused
- 3003: Insufficient Paymaster balance
- 3004: Contract not whitelisted
- 3005: Function not whitelisted
- 3006: Spending limit exceeded

Transaction Errors (4xxx):
- 4001: Transaction failed
- 4002: Transaction reverted
- 4003: Gas estimation failed
- 4004: Nonce too low

Rate Limit Errors (5xxx):
- 5001: Rate limit exceeded

For each error:
- Error code
- HTTP status
- Description
- Possible causes
- How to fix
```

---

## Phase 8: Search & Navigation

### Prompt 8.1 - Create Search Modal

```
Create a search modal for documentation:

Trigger:
- Click search bar in header
- Keyboard shortcut: Cmd/Ctrl + K
- Show hint in search bar about shortcut

Modal appearance:
- Centered modal with overlay
- Search input at top
- Results below as user types

Search input:
- Large, prominent input field
- Auto-focus when modal opens
- Clear button (X)
- Placeholder: "Search documentation..."

Search behavior:
- Search as you type (debounced)
- Search through: Titles, headings, content
- Prioritize: Title matches > Heading matches > Content matches
- Show loading state while searching

Results display:
- Group by section (Getting Started, Guides, API, etc.)
- Show page title
- Show matched excerpt with highlight
- Show breadcrumb path

Keyboard navigation:
- Arrow keys to move between results
- Enter to select
- Escape to close
- Tab to move to actions

No results state:
- Helpful message
- Suggest checking spelling
- Link to support if still can't find
```

### Prompt 8.2 - Create Breadcrumb Navigation

```
Create breadcrumb navigation for documentation pages:

Position:
- Above page title
- Below header

Structure:
- Home/Docs → Section → Page
- Each level clickable
- Current page not clickable (just text)

Visual design:
- Smaller text (14px)
- Muted color
- Separator: / or > between levels
- Hover state on clickable items

Mobile:
- May truncate middle levels on small screens
- Or collapse to show just current section

Example breadcrumbs:
- Docs > Getting Started > Quick Start
- Docs > API Reference > Endpoints > relay/execute
- Docs > SDK > Client

Build from page path:
- Parse current URL
- Map to readable titles
- Generate links automatically
```

### Prompt 8.3 - Create Mobile Navigation

```
Create mobile-friendly navigation:

Hamburger menu:
- Icon in header (left side)
- Opens slide-out drawer from left

Drawer content:
- Search bar at top
- Full sidebar navigation
- Collapsible sections
- Close button

Behavior:
- Swipe right to close
- Tap outside to close
- Navigate closes drawer
- Body scroll locks when open

Search on mobile:
- Full-screen search overlay
- Or: Search at top of drawer
- Results in full screen for easier tapping

Bottom navigation (optional):
- Quick links at bottom
- Previous/Next page
- Table of contents

Touch targets:
- All items minimum 44px height
- Adequate spacing between items
- Easy to tap with thumb
```

---

## Phase 9: Interactive Playground

### Prompt 9.1 - Create SDK Playground

```
Create an interactive playground for testing SDK:

Purpose:
- Let developers try SDK without setup
- Pre-configured with testnet
- Safe to experiment

Location:
- Separate page: /playground
- Or embedded in SDK docs

Layout:
- Left: Code editor
- Right: Output/result panel
- Top: Controls (Run, Reset, Examples dropdown)

Code editor:
- Syntax highlighting
- Basic autocomplete (optional)
- Pre-filled with starter code
- Can reset to original

Pre-built examples dropdown:
- Basic transfer
- ERC-20 transfer
- NFT mint
- Custom transaction

Output panel:
- Show console output
- Show transaction result
- Show any errors nicely formatted

Limitations:
- Uses testnet only
- User must connect wallet
- Some operations may need testnet MNT

Safety:
- Only works with testnet
- Clear warnings about real transactions
- No mainnet option in playground
```

### Prompt 9.2 - Create Contract Address Display

```
Create a component for displaying contract addresses:

Purpose:
- Show current contract addresses
- Easy to copy
- Link to explorer

Structure:
- Contract name
- Address (full or truncated)
- Copy button
- Explorer link

Network indicator:
- Show which network (Mainnet, Testnet)
- Different styling per network
- Warning for testnet addresses

Display options:
- Inline: For within text
- Card: For standalone display
- Table: For listing multiple addresses

Current addresses to display:
- RelayerHub: 0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737
- PaymasterFactory: 0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
- Network: Mantle Sepolia (Chain ID: 5003)

MDX usage:
<ContractAddress
  name="RelayerHub"
  address="0xA5dd..."
  network="sepolia"
/>
```

---

## Phase 10: Polish & Optimization

### Prompt 10.1 - Implement SEO Optimization

```
Implement SEO for the documentation site:

Page titles:
- Format: "Page Title | Mantle Relayer Docs"
- Unique for each page
- Descriptive and clear

Meta descriptions:
- Custom for each page
- 150-160 characters
- Include relevant keywords

Open Graph tags:
- og:title, og:description, og:image
- Twitter card tags
- Custom OG image for docs

URL structure:
- Clean, readable URLs
- Consistent hierarchy
- No unnecessary parameters

Sitemap:
- Generate sitemap.xml automatically
- Include all documentation pages
- Submit to search engines

Structured data:
- Add FAQ schema where applicable
- Documentation schema if available
- Breadcrumb schema

Robots.txt:
- Allow all documentation pages
- Block any private/draft pages
```

### Prompt 10.2 - Create 404 and Error Pages

```
Create custom error pages for documentation:

404 Page:
- Clear message: "Page not found"
- Helpful suggestions:
  - Check URL for typos
  - Search for what you're looking for
  - Browse documentation home
- Search bar prominently displayed
- Links to popular pages

Search suggestions on 404:
- If URL contains recognizable terms
- Suggest related pages
- "Did you mean...?" section

500 Error page:
- Clear message: "Something went wrong"
- Suggest refreshing
- Link to status page if available
- Contact support link

Offline page (if using service worker):
- "You appear to be offline"
- Show cached pages if available
- List of recently visited pages
```

### Prompt 10.3 - Implement Analytics Tracking

```
Add analytics to documentation site:

Events to track:

Page views:
- All page visits
- Track time on page
- Track scroll depth

Search:
- Search queries
- Results clicked
- No results queries (for improvement)

Copy events:
- Code block copied
- Address copied
- Track which examples are copied most

Navigation:
- Sidebar clicks
- Breadcrumb clicks
- Previous/Next navigation

Feedback:
- Helpful/not helpful votes
- Feedback form submissions

External links:
- GitHub clicks
- Dashboard links
- External resource clicks

Implementation:
- Use privacy-friendly analytics (Plausible, Fathom, or self-hosted)
- Or: Google Analytics with appropriate consent
- Ensure GDPR compliance if needed

Dashboard:
- Most viewed pages
- Search queries
- User flow analysis
- Identify problem areas
```

### Prompt 10.4 - Performance Optimization

```
Optimize documentation site performance:

Static generation:
- Pre-render all MDX pages at build time
- No server-side rendering needed
- Fast TTFB for all pages

Code splitting:
- Lazy load heavy components
- Playground loads on demand
- Search loads on activation

Asset optimization:
- Compress images
- Use modern formats (WebP, AVIF)
- Lazy load images below fold

Font optimization:
- Subset fonts to needed characters
- Font-display: swap
- Preload critical fonts

Caching:
- Long cache for static assets
- Proper cache headers
- Service worker for offline (optional)

Bundle size:
- Analyze bundle regularly
- Remove unused dependencies
- Tree shake properly

Target metrics:
- Lighthouse score: 95+
- LCP: < 1.5s
- TTI: < 3s

Test across:
- Different network speeds
- Different devices
- Different regions
```

### Prompt 10.5 - Accessibility Audit

```
Ensure documentation meets accessibility standards:

Content structure:
- Proper heading hierarchy (h1 → h2 → h3)
- No skipped heading levels
- Meaningful link text (not "click here")

Keyboard navigation:
- All interactive elements focusable
- Logical tab order
- Skip to content link
- Search accessible via keyboard

Screen readers:
- All images have alt text
- Code blocks announced properly
- Tables have proper headers
- Live regions for dynamic content

Color and contrast:
- Text meets WCAG AA (4.5:1)
- Code syntax colors are distinguishable
- Don't rely on color alone
- Focus indicators visible

Interactive elements:
- Buttons have accessible names
- Links describe destination
- Form inputs have labels
- Errors announced

Testing:
- Test with VoiceOver (Mac)
- Test with NVDA (Windows)
- Test keyboard-only navigation
- Use accessibility browser extensions
```

### Prompt 10.6 - Versioning Setup (Optional)

```
Set up version selector for documentation:

Note: This can be Phase 2, only needed when breaking changes occur

Version selector:
- Dropdown in header or sidebar
- Shows: v1.0, v1.1, v2.0, etc.
- "Latest" option
- Mark deprecated versions

URL structure:
- /docs/v1/getting-started
- /docs/v2/getting-started
- Or: Use subdomain (v1.docs.example.com)

Content management:
- Separate content folders per version
- Shared components across versions
- Clear process for new versions

Version banner:
- When viewing old version, show banner
- "You're viewing docs for v1. See latest →"
- Prominent but not annoying

Migration guides:
- For each major version change
- Breaking changes highlighted
- Step-by-step upgrade instructions
```

---

## 🚀 Final Launch Checklist

### Prompt Final.1 - Pre-Launch Review

```
Conduct final pre-launch review for documentation:

Content:
- [ ] All pages have content (no empty placeholders)
- [ ] Code examples are tested and work
- [ ] Links are valid (no 404s)
- [ ] Images load correctly
- [ ] Contract addresses are current
- [ ] Dates and versions are accurate

Navigation:
- [ ] Sidebar reflects actual content
- [ ] All pages accessible from navigation
- [ ] Search returns relevant results
- [ ] Previous/Next navigation works

Design:
- [ ] Consistent styling throughout
- [ ] Code blocks readable
- [ ] Dark mode looks correct
- [ ] Mobile layout works

Functionality:
- [ ] Copy buttons work
- [ ] Tabs switch correctly
- [ ] External links open in new tab
- [ ] Search works properly

SEO:
- [ ] All pages have meta titles
- [ ] Meta descriptions present
- [ ] Sitemap generated
- [ ] Open Graph tags set

Performance:
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Images optimized

Accessibility:
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast adequate
```

---

## 📝 Notes for AI Implementation

### Content Guidelines

1. **Voice and Tone**:
   - Professional but friendly
   - Direct and concise
   - Developer-to-developer language
   - Avoid jargon unless explaining it

2. **Code Examples**:
   - Always complete and runnable
   - Use realistic variable names
   - Include necessary imports
   - Add comments for complex parts

3. **Structure**:
   - Start with what user will achieve
   - Lead with most common use case
   - Put advanced options at end
   - Link liberally to related topics

### Technical Guidelines

1. **File Organization**:
   - One component per file
   - Max 600 lines per file
   - Group related components
   - Clear naming conventions

2. **MDX Best Practices**:
   - Keep MDX files focused on content
   - Logic in components, not MDX
   - Consistent frontmatter structure
   - Use imports sparingly

3. **Performance**:
   - Static generation for all content
   - Lazy load heavy components
   - Optimize images at build time
   - Cache aggressively

### Contract and Backend Integration

When documentation references:
- Contract addresses: Pull from environment or config
- API endpoints: Document actual backend endpoints
- SDK methods: Match actual SDK implementation

Backend base URL for API docs: Configure in environment
Contract addresses: Use from smart-contract deployment

---

**End of Documentation Site Build Prompts**

*Document Version: 1.0.0*
*Created: January 14, 2025*
