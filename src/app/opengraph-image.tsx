import { ImageResponse } from "next/og";
import { PHASES } from "@/data/curriculum";
import { TOTAL_TASKS, VERIFIED_TASKS } from "@/lib/seo";

export const alt = "InferQuest — Become an Inference Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0d0a",
          color: "#e8f0e3",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#6ee787",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 600 }}>InferQuest</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: "#ffb454",
            }}
          >
            The verified path into LLM serving
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Become an inference engineer.
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 28, color: "#7d8a76" }}>
          <div>{`${PHASES.length} phases`}</div>
          <div>{`${TOTAL_TASKS} tasks`}</div>
          <div>{`${VERIFIED_TASKS} auto-verified milestones`}</div>
          <div>Free & open</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
