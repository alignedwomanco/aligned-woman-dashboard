import React, { useState } from "react";
import WorkbookList from "./WorkbookList";
import WorkbookForm from "./WorkbookForm";

export default function WorkbookManagement() {
  const [view, setView] = useState("list"); // "list" | "new" | "edit"
  const [editingWorkbook, setEditingWorkbook] = useState(null);

  if (view === "new") {
    return (
      <WorkbookForm
        workbook={null}
        onBack={() => { setView("list"); setEditingWorkbook(null); }}
      />
    );
  }

  if (view === "edit" && editingWorkbook) {
    return (
      <WorkbookForm
        workbook={editingWorkbook}
        onBack={() => { setView("list"); setEditingWorkbook(null); }}
      />
    );
  }

  return (
    <WorkbookList
      onNew={() => setView("new")}
      onEdit={(wb) => { setEditingWorkbook(wb); setView("edit"); }}
    />
  );
}