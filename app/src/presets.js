// Colour grades, export sizes and panel layouts for the Vice Panel cover maker.
// Every grade is an original palette: warm sunset, neon night, palm noir, pastel vice.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

export const PRESETS = {
  sunset: {
    name: 'Sunset',
    skyTop: '#2b1055', skyMid: '#ff7a3c', skyLow: '#e0218a',
    gradeTop: 'rgba(255,122,60,0)', gradeBottom: 'rgba(224,33,138,0.55)',
    band: 'rgba(20,6,32,0.88)', bandEdge: '#ff7a3c', title: '#ffffff', titleStroke: '#3d0a4d', sub: '#ffd166',
  },
  neon: {
    name: 'Neon Nights',
    skyTop: '#04122e', skyMid: '#00e5ff', skyLow: '#ff2fb3',
    gradeTop: 'rgba(0,229,255,0)', gradeBottom: 'rgba(255,47,179,0.55)',
    band: 'rgba(4,10,28,0.9)', bandEdge: '#00e5ff', title: '#eaffff', titleStroke: '#12002e', sub: '#00e5ff',
  },
  noir: {
    name: 'Palm Noir',
    skyTop: '#03161a', skyMid: '#0aff9d', skyLow: '#0b3d5c',
    gradeTop: 'rgba(10,255,157,0)', gradeBottom: 'rgba(4,40,60,0.62)',
    band: 'rgba(2,18,20,0.9)', bandEdge: '#0aff9d', title: '#f2fff8', titleStroke: '#012a1c', sub: '#0aff9d',
  },
  pastel: {
    name: 'Pastel Vice',
    skyTop: '#3d1c5c', skyMid: '#ffb3d9', skyLow: '#ff9a5c',
    gradeTop: 'rgba(255,179,217,0)', gradeBottom: 'rgba(255,120,90,0.5)',
    band: 'rgba(46,16,60,0.85)', bandEdge: '#ffb3d9', title: '#fff5fb', titleStroke: '#4d1040', sub: '#ffe9a8',
  },
};

/** Panel rectangles for a layout, as fractions of the cover (x, y, w, h). */
export function layoutPanels(layout, wide) {
  if (layout === 'strip') {
    return [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ];
  }
  if (layout === 'split') {
    return [
      { x: 0, y: 0, w: 0.58, h: 1 },
      { x: 0.58, y: 0, w: 0.42, h: 0.5 },
      { x: 0.58, y: 0.5, w: 0.42, h: 0.5 },
    ];
  }
  // Sunset Grid: hero across the top, two panels below. On a wide cover the hero is shorter.
  const heroH = wide ? 0.56 : 0.62;
  return [
    { x: 0, y: 0, w: 1, h: heroH },
    { x: 0, y: heroH, w: 0.5, h: 1 - heroH },
    { x: 0.5, y: heroH, w: 0.5, h: 1 - heroH },
  ];
}
