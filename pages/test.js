import { useState } from "react";
import { useRouter } from "next/router";
import { FileText, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { generateTest, getSessionId } from "../lib/api";

const glowBg = (
  <div style={{
    position: "absolute", top: 0, left: "30%",
    width: 400, height: 200,
    background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />
);

export default function TestPage() {
  const router = useRouter();
  const [topic, setTopic]       = useState("");
  const [numQ, setNumQ]         = useState(5);
  const [style, setStyle]       = useState("mixed");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [revealed, setRevealed] = useState({});

  const handleGenerate = async () => {
    if (!getSessionId()) { toast.error("Upload your material first."); router.push("/"); return; }
    setLoading(true); setResult(null); setRevealed({});
    try { setResult(await generateTest(topic, numQ, style)); }
    catch (err) { toast.error(err.response?.data?.detail || "Test generation failed."); }
    finally { setLoading(false); }
  };

  const sel = {
    padding: "11px 14px", borderRadius: 10,
    border: "1px solid #1c2333", background: "#0d1117",
    fontSize: 13, fontFamily: "'Inter',sans-serif",
    color: "#e8edf5", outline: "none",
  };

  return (
    <div style={{ padding: "56px 52px", maxWidth: 860, margin: "0 auto", position: "relative" }}>
      {glowBg}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
          TEST GENERATOR
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 8 }}>
          Generate a test
        </h1>
        <p style={{ color: "#8b96aa", fontSize: 14, marginBottom: 40 }}>
          Auto-generate MCQ or short answer questions from your uploaded material.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 7 }}>TOPIC (optional)</p>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Leave blank to use full material"
              onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "#1c2333"}
              style={{ ...sel, width: "100%" }}
            />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 7 }}>QUESTIONS</p>
            <select value={numQ} onChange={(e) => setNumQ(Number(e.target.value))} style={sel}>
              {[3, 5, 10, 15].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 7 }}>STYLE</p>
            <select value={style} onChange={(e) => setStyle(e.target.value)} style={sel}>
              <option value="mixed">Mixed</option>
              <option value="mcq">MCQ only</option>
              <option value="short">Short answer</option>
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} style={{
          padding: "11px 24px", borderRadius: 10, border: "none",
          background: loading ? "#0d1117" : "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: loading ? "#3d4d63" : "#fff",
          cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13.5, fontFamily: "'Inter',sans-serif", fontWeight: 500,
          marginBottom: 40, transition: "all 0.15s",
          boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.3)",
          outline: loading ? "1px solid #1c2333" : "none",
        }}>
          <FileText size={14} strokeWidth={1.8} />
          {loading ? "Generating…" : "Generate Test Paper"}
        </button>

        {result && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500 }}>
                {result.num_questions} QUESTIONS GENERATED
              </p>
              <span style={{
                fontSize: 10.5, background: "rgba(59,130,246,0.1)", color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.25)", padding: "3px 10px",
                borderRadius: 99, fontWeight: 500, letterSpacing: "0.06em",
              }}>
                {result.style?.toUpperCase()}
              </span>
            </div>

            {result.questions.map((q, i) => (
              <div key={i} style={{
                background: "#0d1117", border: "1px solid #1c2333",
                borderRadius: 12, padding: 22, marginBottom: 10,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{
                    minWidth: 24, height: 24,
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    color: "#fff", borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11.5, fontWeight: 600, flexShrink: 0,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#e8edf5", lineHeight: 1.65, margin: 0 }}>
                    {q.question}
                  </p>
                </div>

                {q.options && (
                  <div style={{ marginLeft: 38, marginBottom: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{
                        padding: "8px 12px", borderRadius: 7, fontSize: 13, color: "#8b96aa",
                        background: revealed[i] && opt.startsWith(q.answer?.charAt(0)) ? "rgba(52,211,153,0.08)" : "#111720",
                        border: `1px solid ${revealed[i] && opt.startsWith(q.answer?.charAt(0)) ? "rgba(52,211,153,0.25)" : "#1c2333"}`,
                      }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 38 }}>
                  <button onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "#3b82f6", background: "none",
                    border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", padding: 0,
                  }}>
                    {revealed[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {revealed[i] ? "Hide answer" : "Reveal answer"}
                  </button>
                  {q.location && <span style={{ fontSize: 11, color: "#3d4d63" }}>· {q.location}</span>}
                </div>

                {revealed[i] && (
                  <div style={{
                    marginTop: 10, marginLeft: 38, padding: "10px 14px",
                    background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)",
                    borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <CheckCircle2 size={14} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#34d399" }}>{q.answer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}