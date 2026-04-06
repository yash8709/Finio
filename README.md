# Finio — Financial Intelligence Dashboard

> A dark-first glassmorphism finance dashboard with real-time insights, 
> role-based access control, and behavior-driven UI.

[![Live Demo](https://img.shields.io/badge/Live-Demo-10B981?style=for-the-badge)](https://finio-yash.vercel.app/)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)

## Preview

![Finio Dashboard Demo](./public/demo.gif)
![Finio Dashboard Static Preview](./public/preview.png)

> Toggle between **Admin** and **Viewer** roles, switch dark/light mode, 
> and explore 90 realistic Indian financial transactions.

🔗 **[Live Demo → https://finio-yash.vercel.app/](https://finio-yash.vercel.app/)**

## Features

| Feature | Description | Status |
|---|---|---|
| Financial Health Score | Computed 0–100 score across 4 dimensions with animated gauge | ✅ |
| Smart Behavior Banner | Context-aware dashboard banner based on real financial state | ✅ |
| Actionable Insights | AI-style interpreted cards with ₹ amounts and concrete advice | ✅ |
| Role-Based UI | Admin vs Viewer with animated transitions and access control | ✅ |
| Real-Time Filters | Search, category, date range, amount with live count updates | ✅ |
| Smart Filter Presets | One-click preset chips: High Expenses, Anomalies, Last 7 Days | ✅ |
| Spending Heatmap | Custom SVG 6-week activity grid (no Recharts) | ✅ |
| Anomaly Detection | Flags transactions > 2x category average automatically | ✅ |
| Dark / Light Mode | Full theme system via CSS variables, persisted to localStorage | ✅ |
| Responsive Layout | Mobile card list, tablet optimization, desktop full layout | ✅ |
| CSV Export | Download filtered transactions as CSV (Admin only) | ✅ |
| Indian Formatting | ₹ amounts in Indian number system throughout (₹1,42,900) | ✅ |

## Tech Stack

| Category | Technology | Why |
|---|---|---|
| Framework | React 19 + TypeScript 5 | Latest stable, concurrent features |
| Build Tool | Vite 6 | Sub-second HMR, ES module native |
| State Management | Zustand 5 | Minimal boilerplate vs Redux, selector-based re-renders |
| Charts | Recharts 2 | Composable, React-native SVG charts |
| Animations | Framer Motion 11 | Spring physics, layout animations, AnimatePresence |
| Styling | Tailwind CSS v4 | Utility-first, no runtime CSS-in-JS overhead |
| Date Handling | date-fns 3 | Tree-shakeable, no moment.js bloat |
| Icons | lucide-react | Consistent stroke-based icon system |
| Routing | react-router-dom v6 | Industry standard, nested routes |
| Mock Data | @faker-js/faker 8 | Realistic Indian merchant data generation |
| Fonts | Sora + JetBrains Mono | UI readability + financial number precision |

## Project Architecture

```text
src/
├── types/          # All TypeScript interfaces (Transaction, InsightData, etc.)
├── data/           # 90 mock transactions with Indian merchants
├── store/          # Zustand stores (transactions, UI state)
├── hooks/          # useFilteredTransactions, useInsights
├── utils/          # formatters, insights computation, health score
├── components/
│   ├── ui/         # GlassCard, Button, Drawer, NumberTicker, HealthScoreGauge
│   ├── charts/     # AreaChart, DonutChart, BarChart, SpendingHeatmap (custom SVG)
│   └── layout/     # Sidebar, Navbar, RootLayout
└── pages/          # Dashboard, Transactions, Insights
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yash8709/Finio.git
cd Finio

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

The app runs at `http://localhost:5173` by default.

## Design System

Finio uses a **dark-first glassmorphism** design language with a strictly defined token system:

### Color Tokens

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| Background | `#080D1A` | `#F0F4F8` | Page base |
| Glass Card | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.85)` | All cards |
| Accent Emerald | `#10B981` | `#059669` | Positive, income, CTAs |
| Accent Indigo | `#818CF8` | `#6366F1` | Secondary, income bars |
| Danger Rose | `#FB7185` | `#E11D48` | Expenses, negative values |
| Warning Amber | `#F59E0B` | `#D97706` | Alerts, anomalies |

### Typography

- **UI Font:** Sora — clean geometric sans for all interface text
- **Number Font:** JetBrains Mono — monospaced for all financial values, ensuring digit alignment across rows (tabular-nums)

### Glass Effect

Cards use `backdrop-filter: blur(20px)` with low-opacity white backgrounds and atmospheric glow blobs (indigo top-right, emerald bottom-left) to create depth without heavy shadows.

## Design Decisions

This section explains the *why* behind key architectural and product choices — not just what was built.

### Why Zustand over Redux?

Redux adds ~3 files of boilerplate per feature slice. Zustand achieves the same result with a single store function and built-in selector support. For a project of this scope, Redux's DevTools advantage doesn't justify the overhead. Zustand also supports React 19's concurrent rendering without additional configuration.

### Why a Custom SVG Heatmap instead of a Recharts component?

Recharts doesn't offer a calendar/heatmap chart out of the box. Using a third-party heatmap library would add a dependency for a single component. Building it in SVG demonstrates understanding of coordinate geometry, date-fns day mapping (`(getDay(date) + 6) % 7` to normalize Sunday=0 → Monday=0), and intensity level computation — skills that a charting library would otherwise hide.

### Why Glassmorphism for a Finance App?

Traditional finance dashboards are flat and grey — they communicate stability but not sophistication. Glassmorphism with a deep navy base (`#080D1A`) creates visual hierarchy through depth rather than just color contrast. The atmospheric glow blobs ensure the glass effect reads correctly at every scroll position without relying on a specific background image.

### Why Role-Based UI as a behavioral system (not just button hiding)?

Most RBAC implementations just toggle `display: none` on buttons. Finio treats role as a UI state that affects: banner visibility, FAB presence, row-level controls, export access, and a dismissible Viewer notification banner. This mirrors how real SaaS products handle permission tiers rather than just hiding individual elements.

### Why a Financial Health Score?

Raw numbers (income, expenses, savings) tell you *what* happened. A composite score tells you *how you're doing*. The score formula weights savings rate (40pts) most heavily — consistent with standard financial planning benchmarks — while penalizing spending volatility and category concentration. This transforms the dashboard from a data viewer into a decision-support tool.

### Why Behavior-Driven Banner instead of static alerts?

The banner reads actual computed state (overspending, anomaly detected, high savings) and generates contextual copy with real ₹ amounts. A static alert would be ignored after the first view. A dynamic one that changes based on your actual financial situation creates genuine utility — and demonstrates that UI can be a function of data, not just a wrapper around it.

### What I'd do with more time

- Replace faker.js mock data with a real backend (Supabase/PlanetScale)
- Add budget goal setting with progress tracking
- Implement transaction categorization using pattern matching
- Add month-over-month PDF report generation
- Build a proper onboarding flow for first-time users

## State Architecture

Data flows strictly in one direction:

```text
mockData.ts → RootLayout (init) → transactionStore
                                        ↓
                              useFilteredTransactions
                                        ↓
                              Transactions page (table)
                                        ↓
                              computeInsights() → useInsights
                                        ↓
                              Dashboard + Insights pages
```

### Store Design

Two Zustand stores keep concerns separated:

**`transactionStore`** — owns data and filter state
- transactions[], filters{}, isDrawerOpen
- Actions: add/edit/delete transactions, setFilter, resetFilters

**`uiStore`** — owns presentation state only
- role, isDarkMode, isSidebarExpanded, isViewerBannerDismissed
- Actions: setRole, toggleDarkMode, toggleSidebar

This separation means UI state changes never trigger transaction recomputation, and data changes never cause unnecessary UI re-renders.

## Assignment Context

Built for the **Frontend Developer Intern** role at **Zorvyn FinTech**.

**Developer:** Yash Silwadiya  
**User ID:** FIN-90210  
**Deadline:** April 6, 2026

### Requirements Coverage

| Requirement | Implementation |
|---|---|
| Dashboard Overview | Summary cards, AreaChart, DonutChart, Health Score |
| Transactions Section | Table + mobile cards, filtering, sorting, search, pagination |
| Role-Based UI | Admin/Viewer with behavioral differences, not just button hiding |
| Insights Section | Actionable cards, BarChart, anomaly detection, heatmap |
| State Management | Zustand (transactionStore + uiStore) |
| Responsive UI | Mobile (375px), Tablet (768px), Desktop (1440px) |
| Dark Mode | Full CSS variable system, localStorage persistence |
| CSV Export | Filtered transactions downloadable (Admin only) |
| Animations | Framer Motion throughout — page transitions, stagger, spring drawer |

---

<div align="center">

Built with 🖤 by **Yash Silwadiya**  
[LinkedIn](https://www.linkedin.com/in/yash-silwadiya) · [GitHub](https://github.com/yash8709) · [Email](mailto:yashsilwadiya@gmail.com)

*"Most dashboards visualize data. Finio interprets it."*

</div>
