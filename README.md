# LoanTrackingGrid PCF Control

A custom **PowerApps Component Framework (PCF)** control that renders a loan tracking grid with color-coded status rows inside Canvas Apps or Model-driven Apps.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Running Locally](#running-locally)
- [Manifest & Dataset Fields](#manifest--dataset-fields)
- [Deploying to Power Platform](#deploying-to-power-platform)
- [Using the Control in Canvas Apps](#using-the-control-in-canvas-apps)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Architecture Notes](#architecture-notes)

---

## What It Does

The control renders a styled grid with the following columns:

| Column | Description |
|---|---|
| **Borrower** | Name of the person borrowing the asset |
| **Asset** | Name of the asset being loaned |
| **Return Date** | Expected return date |
| **Status** | Current loan status (e.g. Active, Overdue) |
| **Action** | A "Return" button to mark the loan as returned |

Row colors are driven by loan status:

| Color | Hex | Condition |
|---|---|---|
| 🟢 Green | `#E1F5EE` | Active — not due yet |
| 🟡 Amber | `#FAEEDA` | Due today or past due, not yet marked Overdue |
| 🔴 Red | `#FCEBEB` | Status is explicitly `"Overdue"` |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Tools

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 18.x LTS or higher | https://nodejs.org |
| **npm** | Comes with Node.js | — |
| **Power Platform CLI (`pac`)** | Latest | https://aka.ms/PowerAppsCLI |
| **TypeScript** | Installed via npm | — |

### Required Accounts / Access

- A **Microsoft Power Platform environment** (Developer or Sandbox)
- A **Power Platform publisher** with prefix `tracemis` (or update the prefix in the deploy command)
- Maker access to Canvas Apps or Model-driven Apps in that environment

### Check Your Setup

```powershell
node --version       # Should be v18+
npm --version        # Should be 9+
pac --version        # Confirms Power Platform CLI is installed
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | ^5.8.3 | Primary language |
| **React** | ^19.2.4 | UI rendering (bundled into control) |
| **React DOM** | ^19.2.4 | DOM rendering via `createRoot` API |
| **Fluent UI React** | ^8.29.0 | UI component library (available for use) |
| **PowerApps Component Framework** | — | Control hosting in Power Platform |
| **pcf-scripts** | ^1 | Build, lint, and test harness tooling |
| **ESLint** | ^9.25.1 | Linting with Power Apps rules |

> **Important:** React is **bundled directly** into the control (not loaded from the platform). This is required because the PCF platform library only supports React 16, which lacks the `createRoot` API used in React 18+.

---

## Project Structure

```
trace-pcf-testing/
├── LoanTrackingGrid/
│   ├── index.ts                    # Main control class + React rendering logic
│   ├── ControlManifest.Input.xml   # PCF manifest: fields, dataset, resources
│   └── generated/
│       └── ManifestTypes.d.ts      # Auto-generated TypeScript types from manifest
├── out/                            # Build output (gitignored)
├── obj/                            # Intermediate build files (gitignored)
├── package.json                    # npm dependencies and scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── pcfconfig.json                  # PCF output directory config
├── eslint.config.mjs               # ESLint configuration
├── CLAUDE.md                       # Project overview and decision log
└── README.md                       # This file
```

### Key Files Explained

**`LoanTrackingGrid/index.ts`**  
Contains the PCF control class `LoanTrackingGrid` implementing `ComponentFramework.StandardControl`. Handles `init()`, `updateView()`, `getOutputs()`, and `destroy()` lifecycle methods. Renders the React grid UI.

**`LoanTrackingGrid/ControlManifest.Input.xml`**  
Defines the control's identity (`namespace`, `constructor`, `version`), the dataset with its column bindings (`property-set`), and resource references. This file is what Power Platform reads.

**`tsconfig.json`**  
Configured for `ES2020` target with strict mode enabled and PCF type definitions included via `"types": ["powerapps-component-framework"]`.

---

## Local Development Setup

### 1. Clone the Repository

```powershell
git clone <your-repo-url>
cd trace-pcf-testing
```

### 2. Install Dependencies

```powershell
npm install
```

This installs React 19, Fluent UI, pcf-scripts, TypeScript, and all dev dependencies.

### 3. Authenticate with Power Platform CLI

```powershell
pac auth create --url https://yourorg.crm.dynamics.com
```

Confirm it works:
```powershell
pac org who
```

---

## Running Locally

The PCF test harness lets you preview and test the control in a browser without deploying.

```powershell
npm run start:watch
```

This will:
1. Compile the TypeScript
2. Bundle the control
3. Open `http://localhost:8181` in your browser
4. Watch for file changes and auto-rebuild

### Adding Test Data in the Harness

Once the browser opens:
1. You'll see a **Data** panel on the left side
2. Click **"+ Add record"** to add sample rows
3. Fill in the fields:
   - `BorrowerName`: e.g. `John Doe`
   - `AssetName`: e.g. `HP Laptop`
   - `ExpectedReturnDate`: e.g. `2026-04-20`
   - `Status`: e.g. `Active` or `Overdue`
4. The grid renders immediately with your test data

### Debugging

Open browser DevTools (`F12`) → **Console** tab to see React errors or control logs.

---

## Manifest & Dataset Fields

The control manifest (`ControlManifest.Input.xml`) defines what data columns each record must expose:

| Property-Set Name | Display Name | Type | Required |
|---|---|---|---|
| `BorrowerName` | Borrower Name | `SingleLine.Text` | Yes |
| `AssetName` | Asset Name | `SingleLine.Text` | Yes |
| `ExpectedReturnDate` | Return Date | `DateAndTime.DateOnly` | Yes |
| `Status` | Status | `SingleLine.Text` | No (defaults to `"Active"`) |

### Control Identity

| Property | Value |
|---|---|
| Namespace | `tracemis` |
| Constructor | `LoanTrackingGrid` |
| Version | `0.0.1` |
| Control Type | `standard` |

---

## Deploying to Power Platform

### 1. Build the Control

```powershell
npm run build
```

Ensure the build completes with no errors before deploying.

### 2. Push to Your Environment

```powershell
pac pcf push --publisher-prefix tracemis
```

This compiles and uploads the control to your currently authenticated Power Platform environment.

### 3. Verify in Power Apps

Go to [make.powerapps.com](https://make.powerapps.com) → your environment → **Solutions** → find the solution containing `tracemis_LoanTrackingGrid`.

---

## Using the Control in Canvas Apps

### Adding the Control

1. Open your Canvas App in **Edit mode**
2. Go to **Insert** → **Get more components**
3. Find and import **LoanTrackingGrid** from your solution
4. Insert it onto your screen

### Binding Data

1. Select the component on the canvas
2. In the **Properties panel** (right side), locate the dataset property
3. Set **Items** to your data source — e.g. a Collection or Dataverse table:
   ```
   colLoans
   ```
4. Map each field to the corresponding column in your data source:
   - **BorrowerName** → your borrower name column
   - **AssetName** → your asset name column
   - **ExpectedReturnDate** → your return date column
   - **Status** → your status column (optional)

### Example Collection for Testing

Paste this into your Canvas App's `OnStart` or a button's `OnSelect`:

```powerquery
ClearCollect(
    colLoans,
    {
        BorrowerName: "Alice Reyes",
        AssetName: "Dell XPS 15",
        ExpectedReturnDate: DateValue("2026-04-10"),
        Status: "Overdue"
    },
    {
        BorrowerName: "Bob Cruz",
        AssetName: "iPad Pro",
        ExpectedReturnDate: DateValue("2026-04-20"),
        Status: "Active"
    },
    {
        BorrowerName: "Carol Santos",
        AssetName: "Canon Camera",
        ExpectedReturnDate: DateValue("2026-04-05"),
        Status: "Active"
    }
)
```

Then set the component's **Items** to `colLoans`.

---

## Common Commands

```powershell
# Install dependencies
npm install

# Run local test harness (hot reload)
npm run start:watch

# Build the control
npm run build

# Clean build artifacts
npm run clean

# Clean + build (full rebuild)
npm run rebuild

# Run ESLint
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Deploy to Power Platform
pac pcf push --publisher-prefix tracemis

# Refresh TypeScript types from manifest
npm run refreshTypes
```

---

## Troubleshooting

### "Error loading control" in test harness

**Check browser console (F12) for details.** Common causes:

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'S')` | React version conflict — platform-library reference present | Remove `<platform-library>` from manifest |
| `Could not find/invoke constructor` | Class name mismatch | Ensure exported class name matches `constructor` in manifest |
| Empty grid, no error | Missing property-sets in manifest | Add `<property-set>` nodes to manifest's `<data-set>` |
| Build fails with `TS2531` | Null-check on `_root` | Use `if (!this._root)` guard before calling `.render()` |

### Control is Empty in Canvas App

1. Ensure the **Items** property is bound to a data source
2. Confirm the data source has records (`CountRows(yourSource)`)
3. Check field mappings in the component properties panel
4. Try closing and reopening the Canvas App editor after deploying a new version

### Build Errors

```powershell
# Full clean rebuild
npm run clean
npm run build
```

---

## Architecture Notes

### PCF Lifecycle

The control implements four lifecycle methods:

```
init()         → Called once. Store container, context, notifyOutputChanged.
updateView()   → Called when data or context changes. Re-render React UI here.
getOutputs()   → Return output property values back to the host app.
destroy()      → Cleanup. Unmount React root and release resources.
```

### React Rendering Pattern

The control uses a persistent `Root` instance to avoid recreating the React root on every `updateView` call:

```typescript
if (!this._root) {
  this._root = createRoot(this._container);
}
this._root.render(element);
```

Cleanup in `destroy()`:
```typescript
this._root.unmount();
this._root = null;
```

### TypeScript Strict Mode

Class properties assigned in `init()` (not the constructor) use the **definite assignment assertion** (`!`) to satisfy TypeScript strict mode:

```typescript
private _container!: HTMLDivElement;
private _notifyOutputChanged!: () => void;
```

### Why React is Bundled (Not Platform Library)

PCF's `<platform-library name="React" version="16.8.6" />` loads React 16 from the platform at runtime. However, this control uses `createRoot` from `react-dom/client`, which was introduced in React 18. Declaring the platform library causes a conflict — the platform injects React 16 while the bundle expects React 19.

**Solution:** Remove `<platform-library>` from the manifest and let Webpack bundle React 19 directly into `bundle.js`.
