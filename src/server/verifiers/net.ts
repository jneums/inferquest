import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(ip: string): boolean {
  const low = ip.toLowerCase();
  return (
    low === "::1" ||
    low === "::" ||
    low.startsWith("fe80") ||
    low.startsWith("fc") ||
    low.startsWith("fd") ||
    low.startsWith("::ffff:") // v4-mapped — reject rather than re-parse
  );
}

/**
 * SSRF guard for user-supplied URLs the server will fetch: require http(s),
 * resolve the hostname, and refuse anything that lands in private space.
 * Returns a normalized URL object or throws with a user-facing message.
 */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Not a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("URL must be http(s).");
  }
  // Dev/test escape hatch — never set this in production.
  if (process.env.INFERQUEST_ALLOW_PRIVATE_URLS === "1") return url;
  const host = url.hostname;
  const literal = isIP(host);
  if (literal === 4 && isPrivateIPv4(host)) {
    throw new Error("URL resolves to a private address — it must be publicly reachable.");
  }
  if (literal === 6 && isPrivateIPv6(host.replace(/^\[|\]$/g, ""))) {
    throw new Error("URL resolves to a private address — it must be publicly reachable.");
  }
  if (!literal) {
    let addresses;
    try {
      addresses = await lookup(host, { all: true });
    } catch {
      throw new Error(`Could not resolve ${host}.`);
    }
    for (const { address, family } of addresses) {
      if (family === 4 && isPrivateIPv4(address)) {
        throw new Error("URL resolves to a private address — it must be publicly reachable.");
      }
      if (family === 6 && isPrivateIPv6(address)) {
        throw new Error("URL resolves to a private address — it must be publicly reachable.");
      }
    }
  }
  return url;
}

/** fetch with a hard timeout; returns the Response or throws a friendly error. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 15_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal, redirect: "follow" });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new Error(`Request to ${new URL(url).hostname} timed out after ${timeoutMs / 1000}s.`);
    }
    throw new Error(`Could not reach ${new URL(url).hostname}: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    clearTimeout(timer);
  }
}

export interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}
