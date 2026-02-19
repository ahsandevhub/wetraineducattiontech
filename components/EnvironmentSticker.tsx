"use client";

const env =
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

const envLabelMap: Record<string, string> = {
  production: "PRODUCTION",
  preview: "PREVIEW",
  development: "DEVELOPMENT",
};

export function EnvironmentSticker() {
  // Only show for non-production environments
  if (!env || env === "production") return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 40,
        left: -42,
        zIndex: 9999,
        background: "#facc15", // yellow-400
        color: "#1e293b", // slate-800
        padding: "8px 48px",
        fontWeight: 700,
        fontSize: 14,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transform: "rotate(-45deg)",
        pointerEvents: "none",
        textTransform: "uppercase",
        letterSpacing: 2,
        opacity: 0.8,
      }}
    >
      {envLabelMap[env] || env}
    </div>
  );
}
