import Link from "next/link";
import { useRouter } from "next/router";
import { BookOpen, Search, FileText, Zap, Upload, Trash2 } from "lucide-react";
import { clearSession, getSessionId } from "../lib/api";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/",       label: "Upload",        icon: Upload   },
  { href: "/learn",  label: "Learning",      icon: BookOpen },
  { href: "/answer", label: "Answer Finder", icon: Search   },
  { href: "/test",   label: "Test",          icon: FileText },
  { href: "/quiz",   label: "Quiz",          icon: Zap      },
];

export default function Sidebar() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => { setHasSession(!!getSessionId()); }, [router.pathname]);

  const handleClear = () => { clearSession(); router.push("/"); };

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#07090f",
      borderRight: "1px solid #1c2333",
      display: "flex",
      flexDirection: "column",
      padding: "32px 0",
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
    }}>
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#e8edf5",
          letterSpacing: "-0.03em",
          marginBottom: 4,
        }}>
          Lumina
        </div>
        <div style={{ fontSize: 10, color: "#3d4d63", letterSpacing: "0.1em" }}>
          AI STUDY ASSISTANT
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 24px",
              color: active ? "#60a5fa" : "#3d4d63",
              background: active ? "rgba(59,130,246,0.08)" : "transparent",
              borderLeft: `2px solid ${active ? "#3b82f6" : "transparent"}`,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: active ? 500 : 400,
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
            }}>
              <Icon size={15} strokeWidth={active ? 2 : 1.5} color={active ? "#3b82f6" : "#3d4d63"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {hasSession && (
        <div style={{ padding: "0 16px 28px" }}>
          <div style={{
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#3b82f6",
                boxShadow: "0 0 8px rgba(59,130,246,0.8)",
                animation: "glow-pulse 2s ease-in-out infinite",
              }} />
              <span style={{ color: "#3b82f6", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}>
                MATERIAL LOADED
              </span>
            </div>
            <div style={{ color: "#3d4d63", fontSize: 11 }}>Session active</div>
          </div>
          <button onClick={handleClear} style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "#3d4d63", background: "none", border: "none",
            fontSize: 12, cursor: "pointer", padding: "4px 0",
            fontFamily: "'Inter', sans-serif", transition: "color 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#8b96aa"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#3d4d63"}
          >
            <Trash2 size={11} /> Clear & upload new
          </button>
        </div>
      )}
    </aside>
  );
}