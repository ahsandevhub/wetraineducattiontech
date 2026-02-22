// app/components/ShowBengaliButton.tsx
"use client";

import { useEffect, useState } from "react";

export default function ShowBengaliButton() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { origin, hostname, port } = window.location;
      const isWeTrain =
        origin === "https://www.wetraineducation.com" ||
        origin === "https://www.wetraineducation.com/" ||
        hostname === "www.wetraineducation.com" ||
        (hostname === "localhost" && port === "3001");
      console.log(
        "ShowBengaliButton: origin=",
        origin,
        "hostname=",
        hostname,
        "port=",
        port,
        "isWeTrain=",
        isWeTrain
      );
      setShow(isWeTrain);
    }
  }, []);

  // Hardcoded dictionary for demo translation
  const bnDict: Record<string, string> = {
    "Terms of Use": "ব্যবহারের শর্তাবলী",
    "Show in Bengali": "বাংলায় দেখান",
    "Refund Policy": "রিফান্ড নীতি",
    "Contact and Support": "যোগাযোগ ও সহায়তা",
    Home: "হোম",
    Services: "সেবা",
    Pricing: "মূল্য",
    "Terms and Conditions": "শর্তাবলী",
    "Get a Proposal": "প্রস্তাবনা পান",
    "By accessing or using our website, materials, or services, you agree to the terms below. If you do not agree, please do not use our website or any services.":
      "আমাদের ওয়েবসাইট, উপকরণ বা সেবা ব্যবহার করে আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন। সম্মত না হলে দয়া করে ব্যবহার করবেন না।",
    // Add more as needed
  };

  const translateAllTextNodes = async (root: Node) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node?.nodeValue?.trim();
      if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
        if (bnDict[text]) {
          node.nodeValue = bnDict[text];
        }
      }
    }
    console.log("Demo translation complete");
  };

  const handleTranslate = async () => {
    setLoading(true);
    console.log("Translate button clicked");
    document.documentElement.setAttribute("lang", "bn");
    await translateAllTextNodes(document.body);
    setLoading(false);
  };

  if (!show) return null;

  return (
    <button
      onClick={handleTranslate}
      disabled={loading}
      style={{
        marginTop: 12,
        background: loading ? "#fbbf24cc" : "#fbbf24",
        color: "#1f2937",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        fontWeight: 600,
        fontSize: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        cursor: loading ? "not-allowed" : "pointer",
        display: "inline-block",
        opacity: loading ? 0.7 : 1,
      }}
      aria-label="Show in Bengali"
    >
      {loading ? "Translating..." : "Show in Bengali"}
    </button>
  );
}
