

# CompoundMax – Automated Yield Farming dApp

## Overview
A DeFi web application that helps users automate yield farming by deploying smart contract handlers that auto-compound rewards. Revenue comes from a 7% performance fee on yield earned.

---

## Phase 1: Foundation & Layout

### Dark Theme & Design System
- Set up dark color scheme (charcoal background, bright blue accents, green/amber/red status colors)
- Configure all CSS variables for the dark-first design
- Monospace styling for blockchain addresses

### Shared Navbar & Layout
- CompoundMax logo + branding on the left
- Center navigation links: Dashboard, Docs, About
- Right side: Network Selector dropdown (Ethereum, Arbitrum, Polygon, Base), Connect Wallet button, Settings gear
- Wallet button shows truncated address when connected with copy icon and dropdown (Switch account, Disconnect, View on Etherscan)
- Mobile-responsive hamburger menu
- Install **wagmi** and **viem** for wallet connection and contract interactions

### Routing
- `/` → Dashboard
- `/deploy` → Deploy Handler
- `/monitor/:address` → Monitor Handler
- `*` → 404 page

---

## Phase 2: Dashboard Page (/)

### Handler Cards Grid
- Grid of cards showing each deployed handler: name, vault address (truncated), status indicator (Active/Paused/Error), key metrics (total compounds, yield earned, last compound time), and action buttons (Monitor, Settings)
- Cards are clickable → navigate to Monitor page

### Empty State
- Friendly message: "No handlers deployed yet" with a prominent "Deploy New Handler" call-to-action

### Summary Stats Footer
- All-time gross yield, fees paid, net yield, average compound interval across all handlers

### Data Source
- Read handler list from localStorage (`compoundmax_handlers`)
- Display network indicator per handler

---

## Phase 3: Deploy Handler Page (/deploy)

### Step 1: Configuration Form
- Handler Name text input (2-50 chars, required)
- Vault/LP Address input with paste icon and Ethereum address validation
- Compound Token selector (dropdown with common tokens + custom address input)
- Reward Token selector (same pattern)
- Reinvestment Threshold slider + numeric input ($10–$10,000 range) with tooltip explanation

### Step 2: Review & Confirm
- Read-only summary card of all entered values
- Gas estimate box (gas limit, gas price, USD estimate)
- Fee disclaimer: "CompoundMax charges 7% performance fee on yield"
- Deploy button only enabled when all fields valid + wallet connected

### Deployment Flow
- Loading spinner during transaction
- Show transaction hash with block explorer link
- On success → save handler to localStorage → redirect to Monitor page
- On failure → error message with retry option
- Calls SDK's `deployAutoCompoundHandler()` under the hood

---

## Phase 4: Monitor Handler Page (/monitor/:address)

### Header Bar
- Back button, handler name, Settings / Manual Trigger / Pause-Resume buttons

### Metrics Cards (3-card grid)
1. **Yield Earned** – large dollar amount, gross/fee/net breakdown
2. **Stats** – total compounds, days active, all-time events count
3. **Compound Interval** – average interval, next estimated compound

### Reward Accumulation
- Progress bar showing reward % toward threshold (e.g., "164% of threshold")
- Current balance vs. threshold display
- Status text about auto-compound readiness

### Event Log Table
- Filterable table: Timestamp, Event Type, Amount, Transaction Link
- Event types: Compound ✅, Threshold Reached, Manual Trigger
- Expandable rows with full details (block number, gas used)
- Filters: event type dropdown, date range
- Export as CSV button
- Load more pagination

### Compound History Chart
- Line chart (using Recharts) showing compounds per day over last 30 days
- Hover tooltips with exact values
- Week-over-week trend indicator

### Real-Time Updates
- Auto-refresh every 10-30 seconds
- SDK event subscriptions for live compound notifications
- Toast notifications for new compound events

---

## Phase 5: Settings Modal

### Tab 1: Basic Settings
- Edit handler name (updates localStorage)
- Enable/disable auto-compound toggle
- Adjust reinvestment threshold (slider + input)
- Save with loading state and success checkmark

### Tab 2: Advanced Settings
- Read-only fee display (7% on realized yield)
- Max gas price cap toggle + input
- Executor whitelist management (add/remove addresses)

### Tab 3: Ownership
- Current owner display
- Transfer ownership input with confirmation modal and warning
- Danger zone: Delete Handler with double confirmation

---

## Technical Notes
- **Wallet integration**: wagmi hooks for connect, disconnect, network switching, contract reads/writes
- **SDK integration**: Import `deployAutoCompoundHandler`, `SubscriptionBuilder`, `createEventDecoder` from `@somnia-react/autonomous-sdk` — UI calls these at appropriate moments
- **State management**: React hooks + localStorage (no Redux needed)
- **Loading states**: Skeleton loaders for cards/metrics, spinners for transactions
- **Error handling**: Toast notifications, inline form errors, error banners for critical issues
- **Responsive**: Mobile-first, cards stack vertically, table scrolls horizontally, navbar collapses

