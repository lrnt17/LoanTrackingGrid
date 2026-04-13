import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";

interface LoanRecord {
  id: string;
  borrowerName: string;
  assetName: string;
  expectedReturnDate: string;
  status: string;
}

const getRowBackground = (status: string, returnDate: string): string => {
  if (status === "Overdue") return "#FCEBEB";
  if (!returnDate) return "#E1F5EE";
  const today = new Date();
  const due = new Date(returnDate);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return "#FAEEDA";
  return "#E1F5EE";
};

const getBadgeStyle = (status: string, returnDate: string): React.CSSProperties => {
  let bg = "#0F6E56";
  if (status === "Overdue") bg = "#A32D2D";
  else if (returnDate) {
    const days = Math.ceil(
      (new Date(returnDate).getTime() - new Date().getTime()) / 86400000
    );
    if (days <= 0) bg = "#854F0B";
  }
  return {
    background: bg,
    color: "#fff",
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 500,
    display: "inline-block",
  };
};

const headerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
  padding: "10px 14px",
  background: "#1F5C8B",
  borderRadius: "6px 6px 0 0",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 500,
};

const rowStyle = (status: string, returnDate: string): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
  padding: "10px 14px",
  background: getRowBackground(status, returnDate),
  borderBottom: "1px solid #e0e0e0",
  fontSize: "13px",
  alignItems: "center",
});

const btnStyle: React.CSSProperties = {
  background: "#1F5C8B",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "4px 10px",
  fontSize: "12px",
  cursor: "pointer",
};

export class LoanTrackingGrid
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private _container!: HTMLDivElement;
  private _context!: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged!: () => void;
  private _root: Root | null = null;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._container = container;
    this._notifyOutputChanged = notifyOutputChanged;
    this._context = context;
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    const dataset = context.parameters.sampleDataSet;

    if (dataset.loading) {
      if (!this._root) {
        this._root = createRoot(this._container);
      }
      this._root.render(
        React.createElement(
          "div",
          { style: { padding: "16px", color: "#595959", fontFamily: "Segoe UI, sans-serif" } },
          "Loading loans..."
        )
      );
      return;
    }

    if (dataset.sortedRecordIds.length === 0) {
      if (!this._root) {
        this._root = createRoot(this._container);
      }
      this._root.render(
        React.createElement(
          "div",
          { style: { padding: "16px", color: "#595959", fontFamily: "Segoe UI, sans-serif" } },
          "No active loans found."
        )
      );
      return;
    }

    const records: LoanRecord[] = dataset.sortedRecordIds.map((id) => {
      const record = dataset.records[id];
      return {
        id,
        borrowerName: record.getFormattedValue("BorrowerName") || "",
        assetName: record.getFormattedValue("AssetName") || "",
        expectedReturnDate: record.getFormattedValue("ExpectedReturnDate") || "",
        status: record.getFormattedValue("Status") || "Active",
      };
    });

    const element = React.createElement(
      "div",
      { style: { fontFamily: "Segoe UI, sans-serif", width: "100%" } },
      // Header
      React.createElement(
        "div",
        { style: headerStyle },
        React.createElement("span", null, "Borrower"),
        React.createElement("span", null, "Asset"),
        React.createElement("span", null, "Return date"),
        React.createElement("span", null, "Status"),
        React.createElement("span", null, "Action")
      ),
      // Rows
      ...records.map((r) =>
        React.createElement(
          "div",
          { key: r.id, style: rowStyle(r.status, r.expectedReturnDate) },
          React.createElement(
            "span",
            { style: { fontWeight: 500, color: "#1A1A1A" } },
            r.borrowerName
          ),
          React.createElement("span", { style: { color: "#1A1A1A" } }, r.assetName),
          React.createElement(
            "span",
            { style: { color: "#595959" } },
            r.expectedReturnDate
              ? new Date(r.expectedReturnDate).toLocaleDateString()
              : "—"
          ),
          React.createElement(
            "span",
            { style: getBadgeStyle(r.status, r.expectedReturnDate) },
            r.status
          ),
          React.createElement(
            "button",
            { style: btnStyle, onClick: () => this._notifyOutputChanged() },
            "Return"
          )
        )
      )
    );

    if (!this._root) {
      this._root = createRoot(this._container);
    }
    this._root.render(element);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    if (this._root) {
      this._root.unmount();
      this._root = null;
    }
  }
}