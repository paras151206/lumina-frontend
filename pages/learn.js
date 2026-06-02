import { useState } from "react";
import { useRouter } from "next/router";
import { BookOpen, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { learnTopic, getSessionId } from "../lib/api";

const DEPTHS = [
  { value: "simple",   label: "Simple",   desc: "Quick overview" },
  { value: "normal",   label: "Normal",   desc: "Balanced" },
  { value: "detailed", label: "Detailed", desc: "In-depth" },
];

const glowBg = (
  <div style={{
    position: "absolute", top: 0, left: "30%",
    width: 400, height: 200,
    background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />
);

export default function LearnPage() {
  const router = useRouter();
  const [topic, setTopic]     = useState("");
  const [depth, setDepth]     = useState("normal");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleLearn = async () => {
    if (!getSessionId()) { toast.error("Upload your material first."); router.push("/"); return; }
    if (!topic.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await learnTopic(topic, depth)); }
    catch (err) { toast.error(err.response?.data?.detail || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "56px 52px", maxWidth: 860, margin: "0 auto", position: "relative" }}>
      {glowBg}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
          LEARNING MODE
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 8 }}>
          Explain anything
        </h1>
        <p style={{ color: "#8b96aa", fontSize: 14, marginBottom: 40 }}>
          Ask about any topic and get a clear explanation sourced from your material.
        </p>

        <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 8 }}>
          TOPIC
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLearn()}
          onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "#1c2333"}
          placeholder="e.g. Newton's laws of motion"
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 10,
            border: "1px solid #1c2333", background: "#0d1117",
            fontSize: 14, fontFamily: "'Inter',sans-serif",
            outline: "none", color: "#e8edf5", transition: "border 0.15s",
            marginBottom: 16,
          }}
        />

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 36, flexWrap: "wrap" }}>
          {DEPTHS.map((d) => (
            <button key={d.value} onClick={() => setDepth(d.value)} style={{
              padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Inter',sans-serif", fontSize: 13, transition: "all 0.15s",
              background: depth === d.value ? "rgba(59,130,246,0.12)" : "#0d1117",
              color: depth === d.value ? "#60a5fa" : "#3d4d63",
              outline: `1px solid ${depth === d.value ? "rgba(59,130,246,0.4)" : "#1c2333"}`,
              fontWeight: depth === d.value ? 500 : 400,
            }}>
              {d.label}
              <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>— {d.desc}</span>
            </button>
          ))}

          <button onClick={handleLearn} disabled={loading || !topic.trim()} style={{
            marginLeft: "auto", padding: "10px 22px", borderRadius: 10, border: "none",
            background: loading || !topic.trim() ? "#0d1117" : "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: loading || !topic.trim() ? "#3d4d63" : "#fff",
            cursor: loading || !topic.trim() ? "default" : "pointer",
            fontSize: 13.5, fontFamily: "'Inter',sans-serif", fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
            boxShadow: loading || !topic.trim() ? "none" : "0 0 20px rgba(59,130,246,0.3)",
            outline: loading || !topic.trim() ? "1px solid #1c2333" : "none",
          }}>
            <BookOpen size={14} strokeWidth={1.8} />
            {loading ? "Generating…" : "Explain Topic"}
          </button>
        </div>

        {result && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ background: "#0d1117", border: "1px solid #1c2333", borderRadius: 14, padding: 28, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 18 }}>
                EXPLANATION — {result.topic?.toUpperCase()}
              </p>
              <div className="prose"><ReactMarkdown>{result.explanation}</ReactMarkdown></div>
            </div>

            {result.sources?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 10 }}>
                  SOURCED FROM {result.sources.length} PASSAGES
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.sources.map((src, i) => (
                    <div key={i} style={{
                      background: "#0d1117", border: "1px solid #1c2333",
                      borderRadius: 8, padding: "10px 14px",
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}>
                      <ChevronRight size={12} color="#3b82f6" style={{ marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 11, color: "#3b82f6", marginBottom: 3 }}>{src.location}</p>
                        <p style={{ fontSize: 12.5, color: "#8b96aa", lineHeight: 1.6 }}>{src.preview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}