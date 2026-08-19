import type { Level } from "./types";

export const LEVELS: Level[] = [
  { n: 1, title: "Token", minXP: 0 },
  { n: 2, title: "Embedding", minXP: 120 },
  { n: 3, title: "Attention Head", minXP: 300 },
  { n: 4, title: "KV Cache", minXP: 600 },
  { n: 5, title: "Kernel Smith", minXP: 1000 },
  { n: 6, title: "Batch Scheduler", minXP: 1500 },
  { n: 7, title: "Quantizer", minXP: 2200 },
  { n: 8, title: "Tensor Parallelist", minXP: 3000 },
  { n: 9, title: "Speculative Decoder", minXP: 3900 },
  { n: 10, title: "Inference Engineer", minXP: 4800 },
];

export function levelForXP(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
}

export function nextLevel(xp: number): Level | null {
  return LEVELS.find((l) => l.minXP > xp) ?? null;
}
