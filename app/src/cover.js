// Draws the multi-panel Vice Panel cover onto a canvas.
// state: { layout, preset, caption, sub, band, grain, photos[3], crops[3]{zoom,dx,dy} }
// photos hold HTMLImageElements (or null); crops zoom 1..2.5 and shift -0.5..0.5 of the panel.
import { PRESETS, layoutPanels } from './presets.js';

const GUTTER = 0.008; // white gutter between panels, as a fraction of the short side

function coverFitRect(img, rect, crop) {
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = base * (crop?.zoom ?? 1);
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const cx = rect.x + rect.w / 2 + (crop?.dx ?? 0) * rect.w * 0.4;
  const cy = rect.y + rect.h / 2 + (crop?.dy ?? 0) * rect.h * 0.4;
  return { x: cx - pw / 2, y: cy - ph / 2, w: pw, h: ph };
}

function paintSunsetSky(ctx, w, h, preset) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, preset.skyTop);
  sky.addColorStop(0.55, preset.skyMid);
  sky.addColorStop(1, preset.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Low sun disc with a soft halo, drawn behind the panels' lower edge.
  const sx = w * 0.72, sy = h * 0.42, sr = Math.min(w, h) * 0.16;
  const halo = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.1);
  halo.addColorStop(0, 'rgba(255,240,180,0.9)');
  halo.addColorStop(0.35, 'rgba(255,160,80,0.45)');
  halo.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  // Palm fronds: a few dark arcs fanning from the top corners, purely decorative.
  ctx.strokeStyle = 'rgba(20,6,32,0.85)';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.lineCap = 'round';
  for (const [ox, oy, dir] of [[0, 0, 1], [w, 0, -1]]) {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(ox, oy + i * h * 0.02);
      ctx.quadraticCurveTo(ox + dir * w * 0.16, oy + h * (0.05 + i * 0.025), ox + dir * w * (0.24 + i * 0.03), oy + h * (0.16 + i * 0.02));
      ctx.stroke();
    }
  }
}

function paintGrain(ctx, w, h) {
  // Deterministic speckles (seeded by index, not Math.random) so exports are stable.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 900; i++) {
    const x = ((i * 7919) % 1000) / 1000 * w;
    const y = ((i * 104729) % 1000) / 1000 * h;
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function paintTitleBand(ctx, w, h, state, preset) {
  const text = state.caption.trim().toUpperCase();
  const sub = (state.sub || '').trim().toUpperCase();
  const bandH = h * (text ? 0.17 : 0.09);
  const by = h - bandH;
  ctx.fillStyle = preset.band;
  ctx.fillRect(0, by, w, bandH);
  ctx.fillStyle = preset.bandEdge;
  ctx.fillRect(0, by, w, Math.max(4, h * 0.006));
  if (!text) return;
  let size = bandH * 0.52;
  ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  while (ctx.measureText(text).width > w * 0.92 && size > 14) {
    size -= 2;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const ty = by + bandH * (sub ? 0.38 : 0.52);
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = preset.titleStroke;
  ctx.strokeText(text, w / 2, ty);
  ctx.fillStyle = preset.title;
  ctx.fillText(text, w / 2, ty);
  if (sub) {
    let ss = bandH * 0.17;
    const subWidth = (s) => {
      ctx.font = `700 ${s}px "Arial Narrow", sans-serif`;
      return [...sub].reduce((a, c) => a + ctx.measureText(c).width, 0) + s * 0.28 * (sub.length - 1);
    };
    while (subWidth(ss) > w * 0.88 && ss > 9) ss -= 1;
    ctx.font = `700 ${ss}px "Arial Narrow", sans-serif`;
    ctx.fillStyle = preset.sub;
    // Letterspaced sub-caption, drawn letter by letter so spacing is exact.
    const chars = [...sub];
    const widths = chars.map((c) => ctx.measureText(c).width);
    const gap = ss * 0.28;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let x = w / 2 - total / 2;
    const sy = by + bandH * 0.78;
    for (let i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], x + widths[i] / 2, sy);
      x += widths[i] + gap;
    }
  }
  ctx.textBaseline = 'alphabetic';
}

/** Draws the whole cover for `state` onto `canvas` at the canvas's own pixel size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const preset = PRESETS[state.preset] ?? PRESETS.sunset;
  const short = Math.min(w, h);
  const gutter = Math.max(3, short * GUTTER);
  paintSunsetSky(ctx, w, h, preset);

  const panels = layoutPanels(state.layout, w > h);
  panels.forEach((p, i) => {
    const rect = { x: p.x * w + gutter / 2, y: p.y * h + gutter / 2, w: p.w * w - gutter, h: p.h * h - gutter };
    const photo = state.photos[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.fillStyle = '#14061f';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (photo) {
      const r = coverFitRect(photo, rect, state.crops[i]);
      ctx.drawImage(photo, r.x, r.y, r.w, r.h);
    } else {
      ctx.fillStyle = 'rgba(20,6,32,0.55)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `700 ${Math.max(13, rect.h * 0.055)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`PANEL ${i + 1} — ADD A PHOTO`, rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    // Sunset / neon grade wash over the photo, stronger toward the bottom.
    const grade = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    grade.addColorStop(0, preset.gradeTop);
    grade.addColorStop(1, preset.gradeBottom);
    ctx.fillStyle = grade;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, short * 0.003);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  if (state.grain) paintGrain(ctx, w, h);
  if (state.band) paintTitleBand(ctx, w, h, state, preset);
}
