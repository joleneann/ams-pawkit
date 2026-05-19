#!/usr/bin/env node
/**
 * Sarvam Saarika streaming smoke test.
 *
 * Reads SARVAM_API_KEY from apps/dashboard/.env.local, then tries
 * a handful of candidate WebSocket endpoint paths. For each: opens
 * the WebSocket with the api-subscription-key header, waits ~4 sec
 * for an open + any handshake message + close code, reports the result.
 *
 * Outcomes interpreted:
 *   - Open + no immediate close  → streaming is reachable on this path
 *   - 401 / 403 close code       → key valid but missing scope; ticket Sarvam
 *   - 404 / DNS error            → wrong path; try next candidate
 *   - 4xx with message           → server-reported reason (printed verbatim)
 *
 * Run: node scripts/sarvam-saarika-smoke.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import WebSocket from "ws";

const envText = readFileSync(
  resolve(".", "apps", "dashboard", ".env.local"),
  "utf8"
);
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const KEY = env.SARVAM_API_KEY;
if (!KEY) {
  console.error("No SARVAM_API_KEY found in apps/dashboard/.env.local");
  process.exit(1);
}

// Candidate endpoint paths. Sarvam's docs reference these patterns; try in
// order until one accepts the connection.
const CANDIDATES = [
  "wss://api.sarvam.ai/speech-to-text-streaming",
  "wss://api.sarvam.ai/speech-to-text/streaming",
  "wss://api.sarvam.ai/v1/speech-to-text-streaming",
  "wss://api.sarvam.ai/v1/speech-to-text/streaming",
  "wss://api.sarvam.ai/speech-to-text/realtime",
];

const tryOne = (url) =>
  new Promise((res) => {
    const start = Date.now();
    let opened = false;
    let messages = [];
    let closed = null;
    let errored = null;

    let ws;
    try {
      ws = new WebSocket(url, {
        headers: { "api-subscription-key": KEY },
      });
    } catch (e) {
      return res({
        url,
        opened: false,
        ms: 0,
        closeCode: null,
        closeReason: null,
        messages: [],
        error: `constructor: ${e.message}`,
      });
    }

    const timer = setTimeout(() => {
      try {
        ws.terminate();
      } catch {}
      res({
        url,
        opened,
        ms: Date.now() - start,
        closeCode: closed?.code ?? null,
        closeReason: closed?.reason ?? null,
        messages,
        error: errored,
      });
    }, 4000);

    ws.on("open", () => {
      opened = true;
    });

    ws.on("message", (data) => {
      const s = data.toString();
      messages.push(s.length > 200 ? `${s.slice(0, 200)}...` : s);
    });

    ws.on("close", (code, reason) => {
      closed = { code, reason: reason?.toString() ?? "" };
      clearTimeout(timer);
      res({
        url,
        opened,
        ms: Date.now() - start,
        closeCode: code,
        closeReason: reason?.toString() ?? "",
        messages,
        error: errored,
      });
    });

    ws.on("error", (e) => {
      errored = e.message;
    });
  });

console.log("Sarvam Saarika streaming smoke test\n");
console.log(`Key: ${KEY.slice(0, 12)}... (${KEY.length} chars)\n`);

for (const url of CANDIDATES) {
  process.stdout.write(`Trying ${url} ... `);
  const r = await tryOne(url);
  if (r.opened && r.closeCode === null) {
    console.log("\n  ✓ OPEN, no close in 4s — streaming reachable here.");
    if (r.messages.length) {
      console.log(`  ↳ Got ${r.messages.length} message(s):`);
      r.messages.forEach((m, i) => console.log(`     [${i + 1}] ${m}`));
    }
    process.exit(0);
  }
  if (r.opened && r.closeCode !== null) {
    console.log(`\n  ⚠ Opened but closed: ${r.closeCode} ${r.closeReason || "(no reason)"}`);
    if (r.messages.length) r.messages.forEach((m) => console.log(`     msg: ${m}`));
  } else if (r.error) {
    console.log(`\n  ✗ Error: ${r.error}`);
  } else if (r.closeCode !== null) {
    console.log(`\n  ✗ Closed before open: ${r.closeCode} ${r.closeReason || "(no reason)"}`);
  } else {
    console.log("\n  ✗ Did not connect (timeout).");
  }
}

console.log("\nNone of the candidate paths accepted the connection.");
console.log(
  "Likely cause: streaming endpoint moved or not enabled on this key.\n" +
    "Next step: check Sarvam dashboard for the current streaming URL,\n" +
    "or raise a support ticket asking them to enable Saarika streaming."
);
process.exit(2);
