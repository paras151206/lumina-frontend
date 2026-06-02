import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Zap, CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { generateQuiz, getSessionId } from "../lib/api";

const TOTAL_OPTIONS = [10, 20, 30, 40, 50, 60];
const BATCH_OPTIONS = [5, 10, 15, 20];

const AccentBtn = ({ onClick, disabled, full, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: full ? "100%" : "auto",
    padding: "12px 24px",
    background: disabled ? "#0d1117" : "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: disabled ? "#3d4d63" : "#fff",
    border: "none", borderRadius: 10,
    cursor: disabled ? "default" : "pointer",
    fontSize: 14, fontFamily: "'Inter',sans-serif", fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all 0.15s",
    boxShadow: disabled ? "none" : "0 0 20px rgba(59,130,246,0.3)",
    outline: disabled ? "1px solid #1c2333" : "none",
  }}>{children}</button>
);

const GlowBg = () => (
  <div style={{
    position: "absolute", top: 0, left: "30%",
    width: 400, height: 200,
    background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />
);

const AnswerRow = ({ a }) => (
  <div style={{
    background: "#0d1117",
    border: `1px solid ${a.correct ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
    borderRadius: 10, padding: 14, marginBottom: 8,
  }}>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
      {a.correct
        ? <CheckCircle2 size={14} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
        : <XCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />}
      <span style={{ fontSize: 13.5, fontWeight: 500, color: "#e8edf5" }}>{a.question.question}</span>
    </div>
    <div style={{ fontSize: 12, color: "#8b96aa", paddingLeft: 24 }}>
      Your answer:{" "}
      <strong style={{ color: a.correct ? "#34d399" : "#f87171" }}>
        {a.selected || "(skipped)"}
      </strong>
      {!a.correct && <span style={{ color: "#34d399" }}> · Correct: {a.question.correct}</span>}
    </div>
    {a.question.explanation && (
      <div style={{ paddingLeft: 24, marginTop: 5, fontSize: 11.5, color: "#3d4d63", fontStyle: "italic" }}>
        {a.question.explanation}
      </div>
    )}
  </div>
);

export default function QuizPage() {
  const router = useRouter();
  const [totalQ, setTotalQ]             = useState(20);
  const [batchSize, setBatchSize]       = useState(10);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [batchIndex, setBatchIndex]     = useState(0);
  const [currentQ, setCurrentQ]         = useState(0);
  const [selected, setSelected]         = useState(null);
  const [batchAnswers, setBatchAnswers] = useState([]);
  const [allAnswers, setAllAnswers]     = useState([]);
  const [timeLeft, setTimeLeft]         = useState(30);
  const [batchDone, setBatchDone]       = useState(false);
  const [quizDone, setQuizDone]         = useState(false);
  const timerRef = useRef(null);

  const totalBatches = Math.ceil(allQuestions.length / batchSize);
  const batchStart   = batchIndex * batchSize;
  const batchQ       = allQuestions.slice(batchStart, batchStart + batchSize);
  const q            = batchQ[currentQ];
  const overallScore = allAnswers.filter((a) => a.correct).length;
  const scoreColor   = (s, t) => s / t === 1 ? "#60a5fa" : s / t >= 0.6 ? "#34d399" : "#f87171";

  const startQuiz = async () => {
    if (!getSessionId()) { toast.error("Upload your material first."); router.push("/"); return; }
    setLoading(true); setError("");
    try {
      const data = await generateQuiz(totalQ);
      if (!data.questions || data.questions.length === 0) {
        setError("No questions generated. Try uploading a larger file."); return;
      }
      setAllQuestions(data.questions); setBatchIndex(0); setCurrentQ(0);
      setBatchAnswers([]); setAllAnswers([]);
      setSelected(null); setBatchDone(false); setQuizDone(false); setTimeLeft(30);
    } catch (err) {
      const msg = err.response?.data?.detail || "Quiz generation failed.";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const resetAll = () => {
    setAllQuestions([]); setBatchIndex(0); setCurrentQ(0);
    setBatchAnswers([]); setAllAnswers([]);
    setSelected(null); setBatchDone(false); setQuizDone(false); setError("");
  };

  useEffect(() => {
    if (!batchQ.length || batchDone || quizDone) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleNext(null); return 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, batchQ.length, batchDone, quizDone]);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(opt);
  };

  const handleNext = (forced = undefined) => {
    const ans = forced !== undefined ? forced : selected;
    const isCorrect = ans !== null && ans?.charAt(0) === q?.correct;
    const entry = { question: q, selected: ans, correct: isCorrect };
    const newBatch = [...batchAnswers, entry];
    setBatchAnswers(newBatch);
    if (currentQ + 1 >= batchQ.length) {
      setBatchDone(true);
      setAllAnswers((prev) => [...prev, ...newBatch]);
    } else {
      setCurrentQ((c) => c + 1); setSelected(null); setTimeLeft(30);
    }
  };

  const handleNextBatch = () => {
    if (batchStart + batchSize >= allQuestions.length) { setQuizDone(true); return; }
    setBatchIndex((b) => b + 1); setCurrentQ(0);
    setBatchAnswers([]); setSelected(null); setBatchDone(false); setTimeLeft(30);
  };

  const batchScore = batchAnswers.filter((a) => a.correct).length;
  const pageWrap   = { padding: "56px 52px", maxWidth: 720, margin: "0 auto", position: "relative" };

  if (quizDone) return (
    <div style={pageWrap}>
      <GlowBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
          QUIZ COMPLETE
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 28 }}>
          Final results
        </h1>
        <div style={{
          background: "#0d1117", border: "1px solid #1c2333",
          borderRadius: 16, padding: 32, marginBottom: 24,
          display: "flex", alignItems: "center", gap: 28,
        }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1,
              color: scoreColor(overallScore, allAnswers.length) }}>
            {overallScore}<span style={{ fontSize: 30, color: "#3d4d63" }}>/{allAnswers.length}</span>
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, color: "#e8edf5", marginBottom: 6, letterSpacing: "-0.02em" }}>
              {overallScore === allAnswers.length ? "Perfect score. 🏆"
                : overallScore >= allAnswers.length * 0.8 ? "Excellent work."
                : overallScore >= allAnswers.length * 0.6 ? "Good effort. Keep studying."
                : "Keep practicing. You'll get there."}
            </p>
            <p style={{ fontSize: 13, color: "#8b96aa" }}>
              {Math.round((overallScore / allAnswers.length) * 100)}% accuracy across {totalBatches} {totalBatches === 1 ? "batch" : "batches"}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(totalBatches, 5)}, 1fr)`, gap: 8, marginBottom: 24 }}>
          {Array.from({ length: totalBatches }).map((_, bi) => {
            const start = bi * batchSize;
            const bA = allAnswers.slice(start, Math.min(start + batchSize, allAnswers.length));
            const bS = bA.filter((a) => a.correct).length;
            return (
              <div key={bi} style={{ background: "#0d1117", border: "1px solid #1c2333", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#3d4d63", letterSpacing: "0.08em", marginBottom: 6 }}>BATCH {bi + 1}</p>
                <p style={{ fontSize: 20, fontWeight: 600, color: scoreColor(bS, bA.length), letterSpacing: "-0.03em" }}>
                  {bS}/{bA.length}
                </p>
              </div>
            );
          })}
        </div>
        <AccentBtn onClick={resetAll} full>Start New Quiz</AccentBtn>
      </div>
    </div>
  );

  if (batchDone) {
    const isLast = batchStart + batchSize >= allQuestions.length;
    return (
      <div style={pageWrap}>
        <GlowBg />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
            BATCH {batchIndex + 1} OF {totalBatches} COMPLETE
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 24 }}>
            Batch results
          </h1>
          <div style={{
            background: "#0d1117", border: "1px solid #1c2333",
            borderRadius: 16, padding: 28, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 28,
          }}>
            <div style={{ fontSize: 60, fontWeight: 700, color: scoreColor(batchScore, batchQ.length),
                lineHeight: 1, letterSpacing: "-0.04em" }}>
              {batchScore}<span style={{ fontSize: 26, color: "#3d4d63" }}>/{batchQ.length}</span>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#e8edf5", marginBottom: 5, letterSpacing: "-0.02em" }}>
                {batchScore === batchQ.length ? "Perfect batch! 🔥"
                  : batchScore >= batchQ.length / 2 ? "Good work. Keep going."
                  : "Rough batch — you'll do better."}
              </p>
              <p style={{ fontSize: 12.5, color: "#8b96aa" }}>
                Overall: {allAnswers.filter((a) => a.correct).length} / {allAnswers.length} correct
              </p>
              {!isLast && (
                <p style={{ fontSize: 12, color: "#3d4d63", marginTop: 3 }}>
                  {allQuestions.length - (batchStart + batchSize)} questions remaining
                </p>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            {batchAnswers.map((a, i) => <AnswerRow key={i} a={a} />)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!isLast
              ? <AccentBtn onClick={handleNextBatch}>Next Batch <ChevronRight size={15} /></AccentBtn>
              : <AccentBtn onClick={() => setQuizDone(true)}>See Final Results →</AccentBtn>}
            <button onClick={resetAll} style={{
              padding: "12px 20px", background: "#0d1117", color: "#8b96aa",
              border: "none", outline: "1px solid #1c2333", borderRadius: 10,
              cursor: "pointer", fontSize: 13.5, fontFamily: "'Inter',sans-serif", fontWeight: 500,
            }}>Quit</button>
          </div>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) return (
    <div style={pageWrap}>
      <GlowBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11.5, color: "#3b82f6", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
          QUIZ MODE
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#e8edf5", letterSpacing: "-0.04em", marginBottom: 8 }}>
          Test your knowledge
        </h1>
        <p style={{ color: "#8b96aa", fontSize: 14, marginBottom: 44 }}>
          Choose how many questions and your batch size. 30 seconds per question.
        </p>

        {error && (
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, padding: "14px 18px", marginBottom: 24,
          }}>
            <AlertCircle size={15} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 500, color: "#f87171", fontSize: 13 }}>Failed to generate quiz</p>
              <p style={{ color: "#8b96aa", fontSize: 12, marginTop: 2 }}>{error}</p>
            </div>
          </div>
        )}

        <div style={{ background: "#0d1117", border: "1px solid #1c2333", borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
              TOTAL QUESTIONS
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TOTAL_OPTIONS.map((n) => (
                <button key={n} onClick={() => setTotalQ(n)} style={{
                  padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontFamily: "'Inter',sans-serif", fontWeight: n === totalQ ? 500 : 400, fontSize: 14,
                  background: n === totalQ ? "rgba(59,130,246,0.12)" : "#111720",
                  color: n === totalQ ? "#60a5fa" : "#3d4d63",
                  outline: `1px solid ${n === totalQ ? "rgba(59,130,246,0.4)" : "#1c2333"}`,
                  transition: "all 0.15s",
                }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 12 }}>
              BATCH SIZE — answer {batchSize} questions, then see results
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BATCH_OPTIONS.filter((b) => b <= totalQ).map((n) => (
                <button key={n} onClick={() => setBatchSize(n)} style={{
                  padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontFamily: "'Inter',sans-serif", fontWeight: n === batchSize ? 500 : 400, fontSize: 14,
                  background: n === batchSize ? "rgba(59,130,246,0.12)" : "#111720",
                  color: n === batchSize ? "#60a5fa" : "#3d4d63",
                  outline: `1px solid ${n === batchSize ? "rgba(59,130,246,0.4)" : "#1c2333"}`,
                  transition: "all 0.15s",
                }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{
            background: "#07090f", border: "1px solid #1c2333",
            borderRadius: 10, padding: "16px 20px", marginBottom: 24,
            display: "flex", gap: 32,
          }}>
            {[
              { label: "Total Questions", value: totalQ },
              { label: "Batch Size",      value: batchSize },
              { label: "Total Batches",   value: Math.ceil(totalQ / batchSize) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 10, color: "#3d4d63", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 5 }}>
                  {label.toUpperCase()}
                </p>
                <p style={{ fontSize: 24, fontWeight: 600, color: "#60a5fa", letterSpacing: "-0.03em" }}>{value}</p>
              </div>
            ))}
          </div>

          <AccentBtn onClick={startQuiz} disabled={loading} full>
            <Zap size={16} strokeWidth={1.8} />
            {loading ? "Generating questions…" : "Start Quiz"}
          </AccentBtn>
          {loading && (
            <p style={{ color: "#3d4d63", fontSize: 12, marginTop: 10, textAlign: "center" }}>
              Generating {totalQ} questions — this may take 20–40 seconds…
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageWrap}>
      <GlowBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 12.5, color: "#8b96aa" }}>
            Batch <strong style={{ color: "#e8edf5" }}>{batchIndex + 1}</strong>/{totalBatches}
            {" · "}Q <strong style={{ color: "#e8edf5" }}>{currentQ + 1}</strong>/{batchQ.length}
            {" · "}
            <strong style={{ color: "#60a5fa" }}>
              {allAnswers.filter((a) => a.correct).length + batchAnswers.filter((a) => a.correct).length}
            </strong> correct so far
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em",
            color: timeLeft <= 10 ? "#f87171" : "#60a5fa",
          }}>
            <Clock size={14} strokeWidth={1.8} />
            {timeLeft}s
          </div>
        </div>

        <div style={{ height: 2, background: "#1c2333", borderRadius: 2, marginBottom: 30 }}>
          <div style={{
            height: "100%", borderRadius: 2, transition: "width 0.4s ease",
            width: `${(currentQ / batchQ.length) * 100}%`,
            background: "linear-gradient(90deg, #2563eb, #60a5fa)",
          }} />
        </div>

        <div style={{ background: "#0d1117", border: "1px solid #1c2333", borderRadius: 14, padding: 28, marginBottom: 16 }}>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, marginBottom: 24,
              color: "#e8edf5", letterSpacing: "-0.02em" }}>
            {q?.question}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q?.options?.map((opt, j) => {
              const letter       = opt.charAt(0);
              const isSelected   = selected === opt;
              const isCorrectOpt = selected !== null && letter === q.correct;
              const isWrong      = isSelected && letter !== q.correct;

              let bg = "#111720", border = "#1c2333", color = "#8b96aa";
              if (selected !== null) {
                if (isCorrectOpt) { bg = "rgba(52,211,153,0.08)"; border = "rgba(52,211,153,0.25)"; color = "#34d399"; }
                else if (isWrong) { bg = "rgba(248,113,113,0.08)"; border = "rgba(248,113,113,0.25)"; color = "#f87171"; }
              }
              if (isSelected && !isWrong) { bg = "rgba(52,211,153,0.08)"; border = "rgba(52,211,153,0.25)"; color = "#34d399"; }

              return (
                <button key={j} onClick={() => handleAnswer(opt)} style={{
                  padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${border}`, background: bg, color,
                  fontSize: 14, textAlign: "left",
                  cursor: selected === null ? "pointer" : "default",
                  fontFamily: "'Inter',sans-serif", transition: "all 0.15s",
                  fontWeight: isSelected || isCorrectOpt ? 500 : 400,
                  letterSpacing: "-0.01em",
                }}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {selected !== null && (
          <AccentBtn onClick={() => handleNext()}>
            {currentQ + 1 === batchQ.length ? "Finish Batch →" : "Next Question →"}
          </AccentBtn>
        )}
      </div>
    </div>
  );
}