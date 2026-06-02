import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Upload, CheckCircle2, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFile, setSessionId } from "../lib/api";

const MODES = [
  { label: "Learning",      href: "/learn",  desc: "Get structured explanations from your material with page references." },
  { label: "Answer Finder", href: "/answer", desc: "Find the exact sentence and page number for any question you ask." },
  { label: "Test",          href: "/test",   desc: "Generate MCQ or short answer test papers from your content." },
  { label: "Quiz",          href: "/quiz",   desc: "Timed quiz with scoring, batches, and detailed answer review." },
];

export default function Home() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext)) {
      toast.error("Only PDF, DOCX and TXT files are supported.");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const data = await uploadFile(file);
      setSessionId(data.session_id);
      setResult(data);
      toast.success("Material indexed successfully.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "56px 52px", maxWidth: 920, margin: "0 auto", position: "relative" }}>
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 500, height: 280,
        background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 99, padding: "5px 14px",
            fontSize: 11.5, color: "#60a5fa", fontWeight: 500,
            letterSpacing: "0.02em", marginBottom: 24,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6" }} />
            AI-powered study assistant
          </div>

          <h1 style={{
            fontSize: 46, fontWeight: 700, color: "#e8edf5",
            lineHeight: 1.1, letterSpacing: "-0.04em",
            marginBottom: 16, maxWidth: 520,
          }}>
            Study smarter,<br />
            <span style={{
              background: "linear-gradient(90deg, #3b82f6, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>not harder.</span>
          </h1>

          <p style={{ color: "#8b96aa", fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
            Upload your study material and let Lumina help you learn, find answers,
            generate tests and quiz yourself — all from your own content.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 56 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && document.getElementById("file-input").click()}
            style={{
              border: `1.5px dashed ${dragging ? "#3b82f6" : "#1c2333"}`,
              borderRadius: 16,
              background: dragging ? "rgba(59,130,246,0.05)" : "#0d1117",
              padding: "44px 32px",
              textAlign: "center",
              cursor: uploading ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <input id="file-input" type="file" accept=".pdf,.docx,.txt"
              style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

            {uploading ? (
              <div>
                <div style={{
                  width: 36, height: 36,
                  border: "2px solid #1c2333",
                  borderTop: "2px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 14px",
                }} />
                <p style={{ color: "#8b96aa", fontSize: 14 }}>Indexing your material…</p>
                <p style={{ color: "#3d4d63", fontSize: 12, marginTop: 5 }}>Extracting text and building search index</p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 42, height: 42, border: "1px solid #1c2333",
                  borderRadius: 12, display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 14px", background: "#111720",
                }}>
                  <Upload size={18} color="#3d4d63" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 500, color: "#e8edf5", marginBottom: 6, letterSpacing: "-0.02em" }}>
                  {result ? "Upload another file" : "Drop your file here or click to browse"}
                </p>
                <p style={{ color: "#3d4d63", fontSize: 12 }}>PDF · DOCX · TXT · Max 50MB</p>
              </div>
            )}
          </div>

          {result && (
            <div style={{
              background: "#0d1117", border: "1px solid #1c2333",
              borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              animation: "fadeUp 0.4s ease",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <CheckCircle2 size={15} color="#34d399" strokeWidth={2} />
                  <span style={{ color: "#34d399", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.04em" }}>
                    INDEXED SUCCESSFULLY
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#8b96aa", marginBottom: 18, wordBreak: "break-all" }}>
                  {result.filename}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[
                    { label: "Pages",  value: result.pages_found },
                    { label: "Chunks", value: result.chunks_indexed },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: "#07090f", border: "1px solid #1c2333",
                      borderRadius: 10, padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: 10, color: "#3d4d63", letterSpacing: "0.08em", marginBottom: 5 }}>
                        {label.toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 26, color: "#60a5fa", letterSpacing: "-0.03em" }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ color: "#3d4d63", fontSize: 12 }}>Select a mode below to get started</p>
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 11.5, color: "#8b96aa", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 16 }}>
            WHAT YOU CAN DO
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MODES.map(({ label, href, desc }) => (
              <div
                key={href}
                onClick={() => result && router.push(href)}
                style={{
                  background: "#0d1117",
                  border: "1px solid #1c2333",
                  borderRadius: 14, padding: "22px 24px",
                  cursor: result ? "pointer" : "default",
                  transition: "all 0.2s",
                  opacity: result ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (!result) return;
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  e.currentTarget.style.background = "rgba(59,130,246,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1c2333";
                  e.currentTarget.style.background = "#0d1117";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.02em" }}>
                    {label}
                  </span>
                  {result && <ArrowUpRight size={14} color="#3d4d63" />}
                </div>
                <p style={{ color: "#8b96aa", fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
          {!result && (
            <p style={{ color: "#3d4d63", fontSize: 12.5, marginTop: 18, textAlign: "center" }}>
              Upload a file above to unlock all modes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}