import { ImageResponse } from "next/og";
import { PHASES, QUESTS, QUESTS_BY_ID } from "@/data/curriculum";

export const alt = "InferQuest quest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = QUESTS_BY_ID.get(id);
  const phase = quest && PHASES.find((p) => p.id === quest.phaseId);
  const totalXP = quest?.tasks.reduce((s, t) => s + t.xp, 0) ?? 0;
  const verified = quest?.tasks.filter((t) => t.verifier).length ?? 0;

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
          background: "#fcfcfa",
          color: "#131313",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#ff4f00",
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
              color: "#c23c00",
            }}
          >
            {`${phase ? { foundations: "Foundations", inference: "Inference", training: "Training" }[phase.section] : ""} Phase ${phase?.number} · ${phase?.theme}`}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {quest?.title ?? "Quest"}
          </div>
          <div style={{ marginTop: 20, fontSize: 32, color: "#6f6f6a" }}>
            {quest?.tagline}
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 28, color: "#6f6f6a" }}>
          <div>{`${quest?.tasks.length ?? 0} tasks`}</div>
          <div>{`${totalXP} XP`}</div>
          {verified > 0 && <div>{`${verified} auto-verified`}</div>}
        </div>
      </div>
    ),
    { ...size },
  );
}
