// Wires Vice Panel: photo slots with per-panel crop, layout / preset / size picks,
// caption editing, live preview and PNG export. A `?shot=` query sets up a fixed
// scene for a screenshot instead (./shots.js). Photos never leave the machine.
import { drawCover } from './cover.js';
import { SIZES } from './presets.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subInput = document.getElementById('sub');
const status = document.getElementById('status');
const slotsEl = document.getElementById('slots');

const state = {
  layout: 'grid',
  preset: 'sunset',
  size: 'square',
  caption: captionInput.value,
  sub: subInput.value,
  band: true,
  grain: true,
  photos: [null, null, null],
  crops: [
    { zoom: 1, dx: 0, dy: 0 },
    { zoom: 1, dx: 0, dy: 0 },
    { zoom: 1, dx: 0, dy: 0 },
  ],
};

const SAMPLES = ['pier.jpg', 'boulevard.jpg'];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
}

function thumbFor(i) {
  const slot = slotsEl.children[i];
  const thumb = slot.querySelector('.thumb');
  const photo = state.photos[i];
  thumb.src = photo ? photo.src : '';
  thumb.alt = photo ? `Panel ${i + 1} photo` : `Panel ${i + 1} empty`;
}

function buildSlots() {
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.innerHTML = `
      <div class="slot-head">
        <img class="thumb" alt="Panel ${i + 1} empty">
        <strong>Panel ${i + 1}</strong>
        <span class="spacer"></span>
        <button type="button" class="mini fill-all" title="Use this photo in every panel">Fill all</button>
        <button type="button" class="mini sample" title="Load a sample photo">Sample</button>
      </div>
      <label>Photo <input type="file" accept="image/*"></label>
      <div class="sliders">
        <span>Zoom</span><input type="range" class="zoom" min="1" max="2.5" step="0.05" value="1">
        <span>Left ↔ Right</span><input type="range" class="dx" min="-0.5" max="0.5" step="0.02" value="0">
        <span>Up ↕ Down</span><input type="range" class="dy" min="-0.5" max="0.5" step="0.02" value="0">
      </div>`;
    const file = slot.querySelector('input[type=file]');
    file.addEventListener('change', async () => {
      const f = file.files[0];
      if (!f) return;
      state.photos[i] = await loadImage(URL.createObjectURL(f));
      thumbFor(i);
      redraw();
    });
    slot.querySelector('.sample').addEventListener('click', async () => {
      state.photos[i] = await loadImage(`samples/${SAMPLES[i % SAMPLES.length]}`);
      thumbFor(i);
      redraw();
    });
    slot.querySelector('.fill-all').addEventListener('click', () => {
      if (!state.photos[i]) { status.textContent = `Panel ${i + 1} has no photo yet — add one first.`; return; }
      state.photos = [state.photos[i], state.photos[i], state.photos[i]];
      state.crops = state.crops.map((c) => ({ ...c }));
      for (let j = 0; j < 3; j++) thumbFor(j);
      status.textContent = `Panel ${i + 1}'s photo now fills all three panels.`;
      redraw();
    });
    slot.querySelector('.zoom').addEventListener('input', (e) => { state.crops[i].zoom = Number(e.target.value); redraw(); });
    slot.querySelector('.dx').addEventListener('input', (e) => { state.crops[i].dx = Number(e.target.value); redraw(); });
    slot.querySelector('.dy').addEventListener('input', (e) => { state.crops[i].dy = Number(e.target.value); redraw(); });
    slotsEl.appendChild(slot);
  }
}

function wirePicker(id, key, onPick) {
  document.getElementById(id).addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-' + key + ']');
    if (!btn) return;
    document.querySelectorAll(`#${id} button`).forEach((b) => b.classList.remove('picked'));
    btn.classList.add('picked');
    onPick(btn.dataset[key]);
  });
}

wirePicker('layouts', 'layout', (v) => { state.layout = v; redraw(); });
wirePicker('presets', 'preset', (v) => { state.preset = v; redraw(); });
wirePicker('sizes', 'size', (v) => { state.size = v; redraw(); });

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subInput.addEventListener('input', () => { state.sub = subInput.value; redraw(); });
document.getElementById('band').addEventListener('change', (e) => { state.band = e.target.checked; redraw(); });
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });

document.getElementById('export').addEventListener('click', () => {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-panel-${state.size}-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved vice-panel-${state.size}-${size.w}x${size.h}.png`;
  }, 'image/png');
});

buildSlots();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, loadImage, redraw, thumbFor);
} else {
  redraw();
}
