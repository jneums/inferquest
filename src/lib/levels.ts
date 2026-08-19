import type { Level } from "./types";

export const LEVELS: Level[] = [
  { n: 1, title: "Token", minXP: 0 },
  { n: 2, title: "Embedding", minXP: 300 },
  { n: 3, title: "Attention Head", minXP: 900 },
  { n: 4, title: "KV Cache", minXP: 1800 },
  { n: 5, title: "Sampler", minXP: 2900 },
  { n: 6, title: "Kernel Smith", minXP: 4300 },
  { n: 7, title: "Batch Scheduler", minXP: 5900 },
  { n: 8, title: "Quantizer", minXP: 7600 },
  { n: 9, title: "Tensor Parallelist", minXP: 9500 },
  { n: 10, title: "Speculative Decoder", minXP: 11500 },
  { n: 11, title: "Goodput Guardian", minXP: 13500 },
  { n: 12, title: "Inference Engineer", minXP: 15000 },
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
