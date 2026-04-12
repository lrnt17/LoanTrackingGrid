# LoanTrackingGrid PCF Control

## What does this project do?

This project is a custom **PowerApps Component Framework (PCF)** control that renders a loan tracking grid inside Canvas Apps or Model-driven Apps in Microsoft Power Platform.

The control displays a list of loan records in a styled grid with the following columns:
- **Borrower** — Name of the person borrowing the asset
- **Asset** — Name of the asset being loaned
- **Return Date** — Expected return date
- **Status** — Current loan status (Active, Overdue, etc.)
- **Action** — A "Return" button to mark a loan as returned

Each row is color-coded based on loan status:
- Green (`#E1F5EE`) — Active, not due yet
- Amber (`#FAEEDA`) — Due today or past due but not marked overdue
- Red (`#FCEBEB`) — Overdue

## What technologies does this project use?

| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | ^5.8.3 | Primary language |
| **React** | ^19.2.4 | UI rendering (bundled into control) |
| **React DOM** | ^19.2.4 | DOM rendering via `createRoot` API |
| **Fluent UI React** | ^8.29.0 | UI component library |
| **PowerApps Component Framework (PCF)** | — | Control hosting in Power Platform |
| **pcf-scripts** | ^1 | Build, lint, and test harness tooling |
| **ESLint** | ^9.25.1 | Linting with Power Apps rules |

## Dataset Fields

| Field | Type | Required |
|---|---|---|
| `BorrowerName` | SingleLine.Text | Yes |
| `AssetName` | SingleLine.Text | Yes |
| `ExpectedReturnDate` | DateAndTime.DateOnly | Yes |
| `Status` | SingleLine.Text | No |

## Common Commands

```powershell
npm run start:watch   # Run local test harness at localhost:8181
npm run build         # Build the control
npm run clean         # Clean build artifacts
npm run rebuild       # Clean + build
npm run lint          # Run ESLint
pac pcf push --publisher-prefix tracemis  # Deploy to Power Platform
```

## Decision Log

### 2026-04-05 — Bundle React instead of using platform-library
**Decision:** Remove `<platform-library name="React" version="16.8.6" />` from the manifest and bundle React 19 directly into the control.  
**Reason:** PCF platform-library only supports React 16. Using `createRoot` (React 18+ API) required bundling React 19 directly to avoid a runtime crash ("Cannot read properties of undefined").

### 2026-04-05 — Use React 18 `createRoot` API instead of `ReactDOM.render`
**Decision:** Replaced `import * as ReactDOM from "react-dom"` with `import { createRoot, Root } from "react-dom/client"`.  
**Reason:** `ReactDOM.render()` was removed in React 18+. The newer `createRoot` API is required when bundling React 19.

### 2026-04-05 — Use definite assignment assertions (`!`) on class properties
**Decision:** Properties `_container`, `_context`, `_notifyOutputChanged` use `!` instead of initializers.  
**Reason:** PCF controls initialize properties in `init()`, not in the constructor. TypeScript strict mode requires `!` to acknowledge this pattern.

### 2026-04-05 — Define `property-set` fields in the manifest
**Decision:** Added `BorrowerName`, `AssetName`, `ExpectedReturnDate`, `Status` as `property-set` nodes in the manifest.  
**Reason:** Without these definitions, the PCF test harness and Canvas Apps have no knowledge of what columns to provide, resulting in an empty dataset.