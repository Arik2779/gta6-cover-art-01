// Fixed scenes for screenshots: ?shot=cover shows the cover alone at export size,
// ?shot=editor shows the editor with sample photos loaded in every panel.
// Params: photo (sample name), caption, layout, size, preset.
// window.__shotReady is set once painted, for the headless screenshot run.
export async function runShot(shot, query, state, loadImage, redraw, thumbFor) {
  const caption = query.get('caption') ?? 'SUNSET HEIST';
  const sub = query.get('sub') ?? 'ONE LAST SCORE · VICE CITY NIGHTS';
  state.layout = query.get('layout') ?? 'grid';
  state.preset = query.get('preset') ?? 'sunset';
  state.size = query.get('size') ?? 'square';
  state.caption = caption;
  state.sub = sub;
  document.getElementById('caption').value = caption;
  document.getElementById('sub').value = sub;
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('picked', b.dataset.layout === state.layout));
  document.querySelectorAll('#presets button').forEach((b) => b.classList.toggle('picked', b.dataset.preset === state.preset));
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('picked', b.dataset.size === state.size));

  const names = (query.get('photos') ?? 'pier,boulevard,pier').split(',');
  const crops = [
    { zoom: 1.0, dx: 0, dy: 0.14 },
    { zoom: 1.1, dx: 0.05, dy: 0 },
    { zoom: 1.0, dx: 0, dy: 0.12 },
  ];
  for (let i = 0; i < 3; i++) {
    state.photos[i] = await loadImage(`samples/${names[i % names.length]}.jpg`);
    state.crops[i] = { ...crops[i] };
    thumbFor(i);
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
