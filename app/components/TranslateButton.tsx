// app/components/TranslateButton.tsx
"use client";
import { useEffect, useState } from "react";

export default function TranslateButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { origin, hostname } = window.location;
      const isWeTrain =
        origin === "https://www.wetraineducation.com" ||
        origin === "https://www.wetraineducation.com/" ||
        hostname === "www.wetraineducation.com";
      setShow(isWeTrain);
    }
  }, []);

  const handleTranslate = () => {
    // Set lang attribute to Bengali and reload to prompt Chrome Translate
    document.documentElement.setAttribute("lang", "bn");
    window.location.reload();
  };

  if (!show) return null;

  return (
    <button
      onClick={handleTranslate}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "#fbbf24",
        color: "#1f2937",
        border: "none",
        borderRadius: 8,
        padding: "12px 20px",
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        cursor: "pointer",
      }}
      aria-label="Translate to Bengali"
    >
      Translate to Bengali
    </button>
  );
}
