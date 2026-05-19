#!/usr/bin/env node
/**
 * Sarvam Saarika streaming smoke test, v2.
 *
 * v1 used api-subscription-key as a header → all 403s. Browsers can't send
 * custom WS headers, so many streaming APIs accept the key as a query param
 * instead. This script tries the same endpoints with the key in the URL.
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
  console.error("No SARVAM_API_KEY found");
  process.exit(1);
}

const BASES = [
  "wss://api.sarvam.ai/speech-to-text-streaming",
  "wss://api.sarvam.ai/speech-to-text/streaming",
  "wss://api.sarvam.ai/v1/speech-to-text-streaming",
  "wss://api.sarvam.ai/v1/speech-to-text/realtime",
];

// Build candidate URLs with the key in various query param shapes.
const CANDIDATES = [];
for (const base of BASES) {
  CANDIDATES.push(`${base}?api-subscription-key=${KEY}`);
  CANDIDATES.push(`${base}?subscription-key=${KEY}`);
  CANDIDATES.push(`${base}?token=${KEY}`);
  CANDIDATES.push(`${base}?api_subscription_key=${KEY}`);
}

const tryOne = (url) =>
  new Promise((res) => {
    const start = Date.now();
    let opened = false;
    let messages = [];
    let closed = null;
    let errored = null;

    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      return res({
        url,
        opened: false,
        ms: 0,
        closeCode: null,
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
    }, 3000);

    ws.on("open", () => {
      opened = true;
    });
    ws.on("message", (d) => {
      const s = d.toString();
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

console.log("Sarvam Saarika streaming smoke test v2 (query param auth)\n");

let foundOpen = false;
for (const url of CANDIDATES) {
  const masked = url.replace(KEY, KEY.slice(0, 8) + "...");
  process.stdout.write(`${masked} ... `);
  const r = await tryOne(url);
  if (r.opened && r.closeCode === null) {
    console.log("✓ OPEN");
    foundOpen = true;
    break;
  } else if (r.opened) {
    console.log(`opened but closed ${r.closeCode}`);
  } else if (r.error) {
    const e = r.error.replace(/\d{3}/, (m) => `[${m}]`);
    console.log(`✗ ${e}`);
  } else if (r.closeCode !== null) {
    console.log(`closed ${r.closeCode}`);
  } else {
    console.log("timeout");
  }
}

if (foundOpen) process.exit(0);
process.exit(2);
