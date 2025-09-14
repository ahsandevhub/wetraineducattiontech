// app/components/ShowBengaliButton.tsx
"use client";
import { useEffect, useState } from "react";

export default function ShowBengaliButton() {
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
    document.documentElement.setAttribute("lang", "bn");
    window.location.reload();
  };

  if (!show) return null;

  return (
    <button
      onClick={handleTranslate}
      style={{
        marginTop: 12,
        background: "#fbbf24",
        color: "#1f2937",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        fontWeight: 600,
        fontSize: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        cursor: "pointer",
        display: "inline-block",
      }}
      aria-label="Show in Bengali"
    >
      Show in Bengali
    </button>
  );
}
