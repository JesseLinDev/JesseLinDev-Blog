import { initWasm, Resvg } from "@resvg/resvg-wasm";
// @ts-ignore — handled by Vite wasm import
import resvgWasm from "./resvg.wasm?module";

// Define color schemes for different sections
const SECTION_COLORS: Record<string, { accent: string; darkBg: string; text: string; meta: string; }> = {
  writing: {
    accent: "#f97316", // orange-500
    darkBg: "#0a0a0a",
    text: "#ffffff",
    meta: "#a3a3a3",
  },
  thought: {
    accent: "#ef4444", // red-500
    darkBg: "#0a0a0a", 
    text: "#ffffff",
    meta: "#a3a3a3",
  },
};

let wasmInitPromise: Promise<void> | null = null;

async function ensureWasm() {
  if (!wasmInitPromise) {
    wasmInitPromise = initWasm(resvgWasm).catch((e) => {
      if (!/already initialized/i.test(e?.message)) throw e;
    });
  }
  return wasmInitPromise;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const avgCharWidth = fontSize * 0.52;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSvg(title: string, section: string): string {
  const colors = SECTION_COLORS[section] || SECTION_COLORS.thought;
  const len = title.length;
  const fontSize = len > 40 ? 48 : len > 25 ? 56 : 64;
  const lineHeight = fontSize * 1.15;
  const lines = wrapText(title.toLowerCase(), fontSize, 1000);
  const titleBlockHeight = lines.length * lineHeight;
  const titleY = (630 - titleBlockHeight) / 2 + fontSize * 0.8;

  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="60" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${colors.darkBg}"/>
  <circle cx="72" cy="60" r="6" fill="${colors.accent}"/>
  <text x="90" y="68" fill="${colors.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${escapeXml(section)}</text>
  <text x="60" y="${titleY}" fill="${colors.text}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
  <text x="60" y="580" fill="${colors.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
  <rect x="1020" y="577" width="120" height="6" rx="3" fill="${colors.accent}"/>
</svg>`;
}

export async function renderOgImage(
  title: string,
  section: string,
  _baseUrl: string,
): Promise<Uint8Array> {
  if (!title || !section) {
    throw new Error('Missing required parameters for OG image generation');
  }

  try {
    await ensureWasm();
    
    const svg = buildSvg(title, section);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        loadSystemFonts: true, // Use system fonts
        defaultFontFamily: 'Inter',
        defaultFontSize: 52,
      },
    });
    
    const pngBuffer = resvg.render().asPng();
    
    if (!pngBuffer || pngBuffer.byteLength === 0) {
      throw new Error('OG image rendering produced empty result');
    }
    
    return pngBuffer;
  } catch (e) {
    console.error('Error generating OG image for:', title, section, e);
    throw e;
  }
}