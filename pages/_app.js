import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            background: "#111720",
            color: "#e8edf5",
            border: "1px solid #1c2333",
            borderRadius: 10,
          },
          success: { iconTheme: { primary: "#3b82f6", secondary: "#07090f" } },
        }}
      />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh", background: "#07090f" }}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}