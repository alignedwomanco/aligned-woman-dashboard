import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function PdfTest() {
  const [libResults, setLibResults] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [pdfStatus, setPdfStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [jsPDFAvailable, setJsPDFAvailable] = useState(false);
  const [uploadAvailable, setUploadAvailable] = useState(false);

  useEffect(() => {
    runLibraryTests();
    runApiTests();
  }, []);

  const runLibraryTests = async () => {
    const results = [];

    // jsPDF
    try {
      const mod = await import("jspdf");
      const cls = mod.default || mod.jsPDF;
      results.push(`jsPDF: Available (default export type: ${typeof cls})`);
      setJsPDFAvailable(true);
    } catch (e) {
      results.push(`jsPDF: Not available - ${e.message}`);
    }

    // html2canvas
    try {
      const mod = await import("html2canvas");
      results.push(`html2canvas: Available (default export type: ${typeof mod.default})`);
    } catch (e) {
      results.push(`html2canvas: Not available - ${e.message}`);
    }

    // pdfmake — not installed, mark as not available
    results.push(`pdfmake: Not available - not installed`);

    // @react-pdf/renderer — not installed, mark as not available
    results.push(`@react-pdf/renderer: Not available - not installed`);

    setLibResults(results);
  };

  const runApiTests = () => {
    const results = [];

    // base44.files
    results.push(`typeof base44.files: ${typeof base44.files}`);
    if (base44.files && typeof base44.files === "object") {
      results.push(`Object.keys(base44.files): ${JSON.stringify(Object.keys(base44.files))}`);
      results.push(`typeof base44.files.upload: ${typeof base44.files?.upload}`);
      if (typeof base44.files.upload !== "undefined") setUploadAvailable(true);
    } else {
      results.push(`base44.files is not an object`);
    }

    // base44.storage
    results.push(`typeof base44.storage: ${typeof base44.storage}`);
    if (base44.storage && typeof base44.storage === "object") {
      results.push(`Object.keys(base44.storage): ${JSON.stringify(Object.keys(base44.storage))}`);
    }

    // base44.integrations.Core (UploadFile)
    results.push(`typeof base44.integrations: ${typeof base44.integrations}`);
    if (base44.integrations && typeof base44.integrations === "object") {
      results.push(`Object.keys(base44.integrations): ${JSON.stringify(Object.keys(base44.integrations))}`);
      if (base44.integrations.Core) {
        results.push(`Object.keys(base44.integrations.Core): ${JSON.stringify(Object.keys(base44.integrations.Core))}`);
      }
    }

    // base44.utils
    results.push(`typeof base44.utils: ${typeof base44.utils}`);
    if (base44.utils && typeof base44.utils === "object") {
      results.push(`Object.keys(base44.utils): ${JSON.stringify(Object.keys(base44.utils))}`);
    }

    // Top-level base44 keys
    results.push(`Object.keys(base44): ${JSON.stringify(Object.keys(base44))}`);

    setApiResults(results);
  };

  const generateTestPdf = async () => {
    setPdfStatus("Generating...");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.text("Hello World", 10, 10);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "test.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPdfStatus("SUCCESS: PDF generated and download triggered.");
    } catch (e) {
      setPdfStatus(`ERROR: ${e.message}`);
    }
  };

  const testUpload = async () => {
    setUploadStatus("Uploading...");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.text("Hello World", 10, 10);
      const blob = doc.output("blob");
      const file = new File([blob], "test.pdf", { type: "application/pdf" });
      const result = await base44.files.upload(file);
      setUploadStatus(`SUCCESS: ${JSON.stringify(result)}`);
    } catch (e) {
      setUploadStatus(`ERROR: ${e.message}`);
    }
  };

  const testIntegrationsUpload = async () => {
    setUploadStatus("Uploading via integrations.Core.UploadFile...");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.text("Hello World", 10, 10);
      const blob = doc.output("blob");
      const file = new File([blob], "test.pdf", { type: "application/pdf" });
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadStatus(`SUCCESS via integrations.Core.UploadFile: ${JSON.stringify(result)}`);
    } catch (e) {
      setUploadStatus(`ERROR via integrations.Core.UploadFile: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: "monospace", fontSize: 14, lineHeight: 1.8, maxWidth: 900 }}>
      <h1 style={{ fontFamily: "sans-serif", marginBottom: 24 }}>PDF Generation Test</h1>

      <h2 style={{ fontFamily: "sans-serif" }}>TEST 1: Library Availability</h2>
      {libResults.length === 0 ? (
        <p>Running...</p>
      ) : (
        libResults.map((r, i) => <p key={i} style={{ margin: "2px 0" }}>{r}</p>)
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontFamily: "sans-serif" }}>TEST 2: File Upload API</h2>
      {apiResults.length === 0 ? (
        <p>Running...</p>
      ) : (
        apiResults.map((r, i) => <p key={i} style={{ margin: "2px 0" }}>{r}</p>)
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontFamily: "sans-serif" }}>TEST 3: Generate PDF (jsPDF)</h2>
      <button onClick={generateTestPdf} style={{ padding: "8px 16px", marginBottom: 8, cursor: "pointer" }}>
        Generate Test PDF
      </button>
      {pdfStatus && <p style={{ margin: "4px 0" }}>{pdfStatus}</p>}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontFamily: "sans-serif" }}>TEST 4: Upload PDF</h2>
      <button onClick={testUpload} style={{ padding: "8px 16px", marginRight: 12, cursor: "pointer" }}>
        Test Upload (base44.files.upload)
      </button>
      <button onClick={testIntegrationsUpload} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Test Upload (integrations.Core.UploadFile)
      </button>
      {uploadStatus && <p style={{ margin: "8px 0" }}>{uploadStatus}</p>}
    </div>
  );
}