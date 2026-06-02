import { useState } from "react";
import { useRouter } from "next/router";
import { Search, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { findAnswer, getSessionId } from "../lib/api";

const glowBg = (
  <div style={{
    position: "absolute", top: 0, left: "30%",
    width: 400, height: 200,
    background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />
);

export default function AnswerPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [expanded, setExpanded] = useState(null);

  const handleSubmit = async () => {
    if (!getSessionId()) { toast.error("Upload your material first."); router.push("/"); return; }
    if (!question.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await findAnswer(question)); }
    catch (err) { toast.error(err.response?.data?.detail || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "56px 52px", maxWidth: 860, margin: "0 auto", position: "relative" }}>
      {glowBg}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
          ANSWER FINDER
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 8 }}>
          Find exact answers
        </h1>
        <p style={{ color: "#8b96aa", fontSize: 14, marginBottom: 40 }}>
          Get the exact sentence, page number and paragraph from your material.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "#1c2333"}
            placeholder="e.g. What is the definition of photosynthesis?"
            style={{
              flex: 1, padding: "13px 16px", borderRadius: 10,
              border: "1px solid #1c2333", background: "#0d1117",
              fontSize: 14, fontFamily: "'Inter',sans-serif",
              outline: "none", color: "#e8edf5", transition: "border 0.15s",
            }}
          />
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: "13px 22px", borderRadius: 10, border: "none",
            background: loading ? "#0d1117" : "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: loading ? "#3d4d63" : "#fff",
            cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13.5, fontFamily: "'Inter',sans-serif", fontWeight: 500,
            transition: "all 0.15s",
            boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.3)",
            outline: loading ? "1px solid #1c2333" : "none",
          }}>
            <Search size={14} strokeWidth={1.8} />
            {loading ? "Searching…" : "Find Answer"}
          </button>
        </div>

        {result && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {result.best_match && (
              <div style={{
                background: "#0d1117",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 14, padding: 24, marginBottom: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <MapPin size={12} color="#3b82f6" />
                  <span style={{ color: "#3b82f6", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em" }}>
                    BEST MATCH — {result.best_match.location}
                  </span>
                </div>
                <blockquote style={{
                  borderLeft: "2px solid #3b82f6", paddingLeft: 16,
                  margin: 0, fontSize: 15.5, color: "#e8edf5",
                  lineHeight: 1.8, fontStyle: "italic",
                }}>
                  "{result.best_match.sentence}"
                </blockquote>
                <p style={{ marginTop: 10, fontSize: 11, color: "#3d4d63" }}>{result.best_match.source_file}</p>
              </div>
            )}

            <div style={{ background: "#0d1117", border: "1px solid #1c2333", borderRadius: 14, padding: 24, marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 16 }}>ANSWER</p>
              <div className="prose" style={{ fontSize: 14 }}>
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </div>
            </div>

            {result.sources?.length > 1 && (
              <div>
                <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 10 }}>
                  ALL MATCHING PASSAGES ({result.sources.length})
                </p>
                {result.sources.map((src, i) => (
                  <div key={i} style={{
                    background: "#0d1117", border: "1px solid #1c2333",
                    borderRadius: 10, marginBottom: 6, overflow: "hidden",
                  }}>
                    <button onClick={() => setExpanded(expanded === i ? null : i)} style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", padding: "11px 16px",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "'Inter',sans-serif",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12.5, color: "#e8edf5" }}>{src.location}</span>
                        <span style={{
                          fontSize: 10, background: "#111720", border: "1px solid #1c2333",
                          padding: "2px 8px", borderRadius: 99, color: "#8b96aa",
                        }}>{src.relevance_score}</span>
                      </div>
                      {expanded === i ? <ChevronUp size={13} color="#3d4d63" /> : <ChevronDown size={13} color="#3d4d63" />}
                    </button>
                    {expanded === i && (
                      <div style={{
                        padding: "0 16px 14px", color: "#8b96aa",
                        fontSize: 13, lineHeight: 1.75,
                        borderTop: "1px solid #1c2333", paddingTop: 12,
                      }}>
                        {src.sentence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}