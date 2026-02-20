"use client";

const env =
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

const envLabelMap: Record<string, string> = {
  production: "PRODUCTION",
  preview: "PREVIEW",
  development: "DEVELOPMENT",
};

export function EnvironmentSticker() {
  if (!env || env === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <div
        style={{
          width: "min(320px, 70vw)", // responsive
          padding: "8px 0",
          background: "#facc15",
          color: "#1e293b",
          fontWeight: 700,
          fontSize: "clamp(10px, 1vw, 14px)",
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: 0.85,
          textAlign: "center",

          position: "absolute",
          top: 50,
          left: -90,
          transform: "rotate(-45deg)",
          transformOrigin: "center",
        }}
      >
        {envLabelMap[env] || env}
      </div>
    </div>
  );
}
