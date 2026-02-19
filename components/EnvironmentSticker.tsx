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
        top: 140,
        left: -20,
        zIndex: 9999,

        width: "40vw", // auto scales with screen
        textAlign: "center",
        padding: "8px 0",

        background: "#facc15",
        color: "#1e293b",
        fontWeight: 700,
        fontSize: "clamp(10px, 1vw, 14px)",

        letterSpacing: 2,
        textTransform: "uppercase",
        pointerEvents: "none",
        opacity: 0.85,

        transformOrigin: "top left",
        transform: "rotate(-45deg) translate(-30%, 0%)",
      }}
    >
      {envLabelMap[env] || env}
    </div>
  );
}
