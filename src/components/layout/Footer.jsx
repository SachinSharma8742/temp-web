import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../App';

const FOOTER_LINKS = [
  { label: 'Refund Policy', href: '#' },
  { label: 'Terms and Conditions', href: '#' },
  { label: 'Contact us', href: '#' },
];

const Footer = () => {
  const canvasRef = useRef(null);
  const footerBarRef = useRef(null);
  const { theme } = useTheme();

  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, H;
    let animationFrameId;

    function resize() {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let textOff = 0; // Independent offset for the sky text
    let worldX = 0;
    const off = [0, 0, 0, 0, 0];
    const speeds = [0.10, 0.20, 0.34, 0.52, 0.82];
    const PLACE_PREVIEW_SPEED = 1;

    const PLACE_SPAN = 1900;
    const TRANSITION_SPAN = 460;

    function clamp01(v) {
      return Math.max(0, Math.min(1, v));
    }

    function lerp(a, b, m) {
      return a + (b - a) * m;
    }

    function mixColorChannels(c1, c2, m) {
      return [
        Math.round(lerp(c1[0], c2[0], m)),
        Math.round(lerp(c1[1], c2[1], m)),
        Math.round(lerp(c1[2], c2[2], m)),
      ];
    }

    function toRgb(color) {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    }

    function smoothstep(edge0, edge1, x) {
      const u = clamp01((x - edge0) / (edge1 - edge0));
      return u * u * (3 - 2 * u);
    }

    function mixColor(c1, c2, m) {
      return toRgb(mixColorChannels(c1, c2, m));
    }

    const placeThemes = [
      {
        id: 'mountains',
        label: 'Himalayan Pass',
        skyTop: [6, 8, 18],
        skyMid: [11, 14, 26],
        skyBottom: [20, 23, 35],
        road: [66, 69, 76],
        roadLine: [164, 158, 136],
        layers: [
          { base: 0.36, amp1: 0.07, f1: 1.3, p1: 0.4, amp2: 0.04, f2: 2.8, p2: 1.1, col: [19, 19, 21] },
          { base: 0.44, amp1: 0.06, f1: 1.7, p1: 1.0, amp2: 0.035, f2: 3.2, p2: 0.3, col: [25, 25, 25] },
          { base: 0.53, amp1: 0.055, f1: 1.9, p1: 2.1, amp2: 0.03, f2: 3.8, p2: 0.8, col: [31, 31, 34] },
          { base: 0.62, amp1: 0.05, f1: 2.1, p1: 0.7, amp2: 0.025, f2: 4.2, p2: 1.5, col: [37, 37, 40] },
          { base: 0.70, amp1: 0.045, f1: 2.5, p1: 1.8, amp2: 0.022, f2: 5.0, p2: 0.2, col: [44, 44, 48] },
        ],
      },
      {
        id: 'desert',
        label: 'Thar Dunes',
        skyTop: [19, 12, 9],
        skyMid: [35, 24, 16],
        skyBottom: [54, 38, 24],
        road: [84, 70, 52],
        roadLine: [186, 158, 108],
        layers: [
          { base: 0.34, amp1: 0.045, f1: 1.05, p1: 0.2, amp2: 0.018, f2: 2.1, p2: 0.6, col: [30, 24, 19] },
          { base: 0.43, amp1: 0.042, f1: 1.2, p1: 0.9, amp2: 0.018, f2: 2.3, p2: 0.2, col: [40, 32, 24] },
          { base: 0.52, amp1: 0.04, f1: 1.28, p1: 1.6, amp2: 0.016, f2: 2.6, p2: 0.9, col: [49, 39, 29] },
          { base: 0.61, amp1: 0.038, f1: 1.38, p1: 0.4, amp2: 0.014, f2: 2.8, p2: 1.2, col: [58, 46, 33] },
          { base: 0.70, amp1: 0.035, f1: 1.5, p1: 1.1, amp2: 0.012, f2: 3.2, p2: 0.3, col: [70, 55, 40] },
        ],
      },
      {
        id: 'coastal',
        label: 'Konkan Coast',
        skyTop: [7, 18, 30],
        skyMid: [14, 33, 50],
        skyBottom: [28, 52, 70],
        road: [64, 74, 82],
        roadLine: [172, 178, 168],
        layers: [
          { base: 0.35, amp1: 0.05, f1: 1.15, p1: 0.3, amp2: 0.02, f2: 2.2, p2: 1.4, col: [16, 26, 34] },
          { base: 0.43, amp1: 0.048, f1: 1.28, p1: 0.7, amp2: 0.02, f2: 2.5, p2: 0.2, col: [20, 33, 43] },
          { base: 0.52, amp1: 0.045, f1: 1.35, p1: 1.7, amp2: 0.018, f2: 2.8, p2: 0.9, col: [26, 40, 50] },
          { base: 0.61, amp1: 0.042, f1: 1.46, p1: 0.4, amp2: 0.016, f2: 3.1, p2: 1.1, col: [35, 50, 58] },
          { base: 0.70, amp1: 0.038, f1: 1.6, p1: 1.2, amp2: 0.014, f2: 3.5, p2: 0.1, col: [45, 62, 68] },
        ],
      },
      {
        id: 'jungle',
        label: 'Jungle Ghats',
        skyTop: [5, 16, 12],
        skyMid: [11, 27, 20],
        skyBottom: [20, 39, 28],
        road: [56, 64, 50],
        roadLine: [162, 166, 132],
        layers: [
          { base: 0.35, amp1: 0.06, f1: 1.22, p1: 0.4, amp2: 0.024, f2: 2.5, p2: 1.1, col: [15, 30, 20] },
          { base: 0.43, amp1: 0.056, f1: 1.36, p1: 0.8, amp2: 0.022, f2: 2.9, p2: 0.1, col: [19, 38, 24] },
          { base: 0.52, amp1: 0.052, f1: 1.48, p1: 1.8, amp2: 0.02, f2: 3.3, p2: 0.7, col: [24, 46, 28] },
          { base: 0.61, amp1: 0.048, f1: 1.6, p1: 0.5, amp2: 0.018, f2: 3.7, p2: 1.2, col: [30, 54, 34] },
          { base: 0.70, amp1: 0.044, f1: 1.74, p1: 1.2, amp2: 0.016, f2: 4.0, p2: 0.2, col: [36, 62, 40] },
        ],
      },
    ];

    function getThemeState(x) {
      const idx = Math.floor(x / PLACE_SPAN) % placeThemes.length;
      const next = (idx + 1) % placeThemes.length;
      const local = x % PLACE_SPAN;
      const raw = (local - (PLACE_SPAN - TRANSITION_SPAN)) / TRANSITION_SPAN;
      const blend = smoothstep(0, 1, raw);
      return { a: placeThemes[idx], b: placeThemes[next], blend };
    }

    function themeWeight(themeA, themeB, blend, id) {
      return (themeA.id === id ? 1 - blend : 0) + (themeB.id === id ? blend : 0);
    }

    function layerY(theme, layerIndex, x) {
      const l = theme.layers[layerIndex];
      const n1 = l.amp1 * Math.sin((x / 900) * Math.PI * l.f1 + l.p1);
      const n2 = l.amp2 * Math.sin((x / 900) * Math.PI * l.f2 + l.p2);
      return H * (l.base + n1 + n2);
    }

    function blendedLayerY(layerIndex, x, themeA, themeB, blend) {
      return lerp(layerY(themeA, layerIndex, x), layerY(themeB, layerIndex, x), blend);
    }

    /* ── SKY TYPOGRAPHY ── */
    function drawSkyTypography(offset) {
      const isLight = themeRef.current === 'light';
      const fontSize = H * 0.52;
      cx.save();
      cx.font = `italic 900 ${fontSize}px "Playfair Display", serif`;
      cx.textBaseline = "middle";

      const txt = "DESIGN YOUR INDIA  •  ";
      const txtWidth = cx.measureText(txt).width;

      // SUBTLE: Reduced opacity so it's a "texture" not a "distraction"
      const fillAlpha = isLight ? 0.05 : 0.04;
      const strokeAlpha = isLight ? 0.15 : 0.1;
      const baseCol = isLight ? "0, 0, 0" : "255, 255, 255"; 

      for (let i = -1; i < W / txtWidth + 1; i++) {
        const x = (i * txtWidth) - (offset % txtWidth);
        const y = H * 0.32;
        cx.fillStyle = `rgba(${baseCol}, ${fillAlpha})`;
        cx.fillText(txt, x, y);
        cx.strokeStyle = `rgba(${baseCol}, ${strokeAlpha})`;
        cx.lineWidth = 1;
        cx.strokeText(txt, x, y);
      }
      cx.restore();
    }

    /* ── hill ── */
    function drawHill(fn, col) {
      cx.fillStyle = col;
      cx.beginPath();
      cx.moveTo(0, fn(0));
      for (let x = 0; x <= W + 4; x += 3) cx.lineTo(x, fn(x));
      cx.lineTo(W, H); cx.lineTo(0, H);
      cx.closePath(); cx.fill();
    }

    /* ── tree branches ── */
    function branch(x, y, len, angle, depth, a) {
      if (depth === 0 || len < 1.5) return;
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;
      cx.save();
      cx.globalAlpha = a;
      cx.strokeStyle = '#444';
      cx.lineWidth = Math.max(0.4, depth * 0.42);
      cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(ex, ey); cx.stroke();
      cx.restore();
      const sp = 0.36 + depth * 0.04;
      branch(ex, ey, len * 0.67, angle - sp, depth - 1, a * 0.87);
      branch(ex, ey, len * 0.64, angle + sp * 0.9, depth - 1, a * 0.87);
    }

    function drawTree(wx, wy, sc, a, strokeCol = '#444') {
      cx.save();
      cx.globalAlpha = a;
      cx.strokeStyle = strokeCol;
      cx.lineWidth = sc * 1.8;
      cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(wx, wy); cx.lineTo(wx, wy - sc * 20); cx.stroke();
      cx.restore();
      branch(wx, wy - sc * 20, sc * 17, -Math.PI / 2, 7, a);
    }

    function drawPineTree(wx, wy, sc, a) {
      const h = 25 * sc;
      cx.save();
      cx.globalAlpha = a;
      cx.strokeStyle = '#2e3b32';
      cx.lineWidth = Math.max(1.5, 2.2 * sc);
      cx.lineCap = 'round';
      cx.lineJoin = 'round';

      cx.beginPath();
      cx.moveTo(wx, wy);
      cx.lineTo(wx, wy - h);
      cx.stroke();

      cx.lineWidth = Math.max(1.2, 1.6 * sc);
      const tiers = 8;
      for (let i = 1; i <= tiers; i++) {
        const ty = wy - h * 0.95 + (h * 0.85 * (i / tiers));
        const tw = 2 * sc + (i * 1.3 * sc);
        cx.beginPath();
        cx.moveTo(wx, ty - 2.5 * sc);
        cx.lineTo(wx - tw, ty + 0.5 * sc);
        cx.moveTo(wx, ty - 2.5 * sc);
        cx.lineTo(wx + tw, ty + 0.5 * sc);
        cx.stroke();
      }
      cx.restore();
    }

    function drawPalmTree(wx, wy, sc, a) {
      const h = 22 * sc;
      const bend = Math.sin((wx + t * 20) * 0.01) * (2.8 * sc);
      cx.save();
      cx.globalAlpha = a;
      cx.strokeStyle = '#3a4a42';
      cx.lineWidth = Math.max(1.3, 2 * sc);
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(wx, wy);
      cx.quadraticCurveTo(wx + bend * 0.5, wy - h * 0.45, wx + bend, wy - h);
      cx.stroke();

      const tx = wx + bend;
      const ty = wy - h;
      cx.strokeStyle = '#466957';
      cx.lineWidth = 1.1;
      cx.beginPath();
      cx.moveTo(tx, ty);
      cx.lineTo(tx - 10 * sc, ty - 4 * sc);
      cx.moveTo(tx, ty);
      cx.lineTo(tx + 11 * sc, ty - 3 * sc);
      cx.moveTo(tx, ty);
      cx.lineTo(tx - 8 * sc, ty + 2 * sc);
      cx.moveTo(tx, ty);
      cx.lineTo(tx + 9 * sc, ty + 2 * sc);
      cx.stroke();
      cx.restore();
    }

    function drawJungleTree(wx, wy, sc, a) {
      const h = 20 * sc;
      cx.save();
      cx.globalAlpha = a;
      cx.strokeStyle = '#35462f';
      cx.lineWidth = Math.max(1.4, 2.1 * sc);
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(wx, wy);
      cx.lineTo(wx, wy - h);
      cx.stroke();

      cx.fillStyle = 'rgba(35,74,40,0.42)';
      cx.beginPath();
      cx.arc(wx - 5 * sc, wy - h, 7.5 * sc, 0, Math.PI * 2);
      cx.arc(wx + 5 * sc, wy - h - 1, 8 * sc, 0, Math.PI * 2);
      cx.arc(wx, wy - h - 5, 8.5 * sc, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }

    const WORLD_W = 2200;
    const MIDGROUND_LAYER = 3;
    const ROAD_LAYER = 4;
    const FOREGROUND_EDGE_ZONE = 0.22;

    function projectLoopingProp(wx, layerIndex, themeA, themeB, blend, padding = 60, yOffset = 1) {
      const layerOff = off[layerIndex];
      const offMod = layerOff % WORLD_W;
      let sx = wx - offMod;
      if (sx < -padding) sx += WORLD_W;
      if (sx > W + padding) return null;

      const worldX = sx + offMod;
      return {
        sx,
        worldX,
        y: blendedLayerY(layerIndex, worldX, themeA, themeB, blend) + yOffset,
      };
    }

    function roadSurfaceYAtScreenX(screenX, themeA, themeB, blend) {
      const worldX = screenX + off[ROAD_LAYER];
      return blendedLayerY(ROAD_LAYER, worldX, themeA, themeB, blend) - H * 0.016;
    }

    function withRoadBackdropClip(themeA, themeB, blend, drawFn) {
      cx.save();
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.lineTo(W, 0);
      cx.lineTo(W, roadSurfaceYAtScreenX(W, themeA, themeB, blend) + H * 0.008);
      for (let x = W; x >= 0; x -= 4) {
        cx.lineTo(x, roadSurfaceYAtScreenX(x, themeA, themeB, blend) + H * 0.008);
      }
      cx.lineTo(0, roadSurfaceYAtScreenX(0, themeA, themeB, blend) + H * 0.008);
      cx.closePath();
      cx.clip();
      drawFn();
      cx.restore();
    }

    function isForegroundEdgeX(screenX) {
      return screenX <= W * FOREGROUND_EDGE_ZONE || screenX >= W * (1 - FOREGROUND_EDGE_ZONE);
    }

    const treeBands = {
      mountains: [
        { wx: 180, sc: 1.8, a: 0.72 },
        { wx: 750, sc: 1.6, a: 0.65 },
        { wx: 1300, sc: 1.7, a: 0.68 },
        { wx: 1880, sc: 1.6, a: 0.6 },
      ],
      desert: [
        { wx: 280, sc: 1.4, a: 0.42 },
        { wx: 990, sc: 1.5, a: 0.45 },
        { wx: 1620, sc: 1.4, a: 0.4 },
      ],
      coastal: [
        { wx: 240, sc: 1.7, a: 0.8 },
        { wx: 860, sc: 1.9, a: 0.84 },
        { wx: 1460, sc: 1.7, a: 0.78 },
      ],
      jungle: [
        { wx: 220, sc: 1.7, a: 0.8 },
        { wx: 690, sc: 1.9, a: 0.86 },
        { wx: 1280, sc: 1.8, a: 0.82 },
        { wx: 1820, sc: 1.9, a: 0.84 },
      ],
    };

    const foregroundTreeBands = {
      mountains: [
        { wx: 260, sc: 2.2, a: 0.92 },
        { wx: 1180, sc: 2.3, a: 0.94 },
      ],
      desert: [
        { wx: 540, sc: 1.8, a: 0.58 },
        { wx: 1500, sc: 1.9, a: 0.62 },
      ],
      coastal: [
        { wx: 410, sc: 2.5, a: 0.9 },
        { wx: 1460, sc: 2.4, a: 0.88 },
      ],
      jungle: [
        { wx: 330, sc: 2.6, a: 0.94 },
        { wx: 980, sc: 2.5, a: 0.92 },
        { wx: 1710, sc: 2.6, a: 0.93 },
      ],
    };
    function drawBiomeTree(biome, sx, sy, sc, a) {
      if (a <= 0.01) return;
      if (biome === 'coastal') drawPalmTree(sx, sy, sc, a);
      else if (biome === 'jungle') drawJungleTree(sx, sy, sc, a);
      else if (biome === 'mountains') drawPineTree(sx, sy, sc, a);
      else drawTree(sx, sy, sc, a, '#444');
    }

    function drawTreeBandSet(bands, layerIndex, themeA, themeB, blend, edgePad) {
      const depthScale = layerIndex === ROAD_LAYER ? 1 : 0.88;

      Object.entries(bands).forEach(([biome, band]) => {
        const biomeWeight = themeWeight(themeA, themeB, blend, biome);
        if (biomeWeight < 0.015) return;

        const fade = smoothstep(0, 1, biomeWeight);

        band.forEach(({ wx, sc, a }) => {
          const adjSc = sc * (H / 240) * depthScale;
          const point = projectLoopingProp(wx, layerIndex, themeA, themeB, blend, adjSc * edgePad);
          if (!point) return;

          if (layerIndex === ROAD_LAYER && !isForegroundEdgeX(point.sx)) return;

          const baseY = layerIndex === ROAD_LAYER ? point.y + H * 0.018 : point.y;
          drawBiomeTree(biome, point.sx, baseY, adjSc, a * fade);
        });
      });
    }

    function drawTrees(themeA, themeB, blend) {
      drawTreeBandSet(treeBands, MIDGROUND_LAYER, themeA, themeB, blend, 25);
    }

    function drawForegroundTrees(themeA, themeB, blend) {
      drawTreeBandSet(foregroundTreeBands, ROAD_LAYER, themeA, themeB, blend, 30);
    }

    const cabinLights = [
      { wx: 140, li: 1, tw: 0.0 },
      { wx: 510, li: 2, tw: 1.3 },
      { wx: 910, li: 1, tw: 2.1 },
      { wx: 1240, li: 2, tw: 0.7 },
      { wx: 1710, li: 1, tw: 2.8 },
      { wx: 2070, li: 2, tw: 1.9 },
    ];

    function drawCabinLights(themeA, themeB, blend) {
      cabinLights.forEach(({ wx, li, tw }) => {
        const point = projectLoopingProp(wx, li, themeA, themeB, blend, 20, -H * 0.008);
        if (!point) return;

        const sx = point.sx;
        const sy = point.y;
        const flicker = 0.15 + 0.1 * Math.sin(t * 4 + tw);

        cx.save();
        cx.fillStyle = `rgba(238, 196, 110, ${0.55 + flicker})`;
        cx.beginPath();
        cx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        cx.fill();

        const glow = cx.createRadialGradient(sx, sy, 0, sx, sy, 8);
        glow.addColorStop(0, `rgba(238, 196, 110, ${0.15 + flicker * 0.4})`);
        glow.addColorStop(1, 'rgba(238, 196, 110, 0)');
        cx.fillStyle = glow;
        cx.beginPath();
        cx.arc(sx, sy, 8, 0, Math.PI * 2);
        cx.fill();
        cx.restore();
      });
    }

    const fencePosts = [190, 360, 540, 860, 1110, 1450, 1760, 2010];

    function drawFencePosts(themeA, themeB, blend) {
      const dryW = clamp01(themeWeight(themeA, themeB, blend, 'desert') + themeWeight(themeA, themeB, blend, 'mountains') * 0.75);
      if (dryW < 0.08) return;

      fencePosts.forEach((wx, i) => {
        const point = projectLoopingProp(wx, ROAD_LAYER, themeA, themeB, blend, 30);
        if (!point) return;

        const sx = point.sx;
        const baseY = point.y;
        const h = (8 + (i % 3) * 4) * (H / 240);

        cx.save();
        cx.globalAlpha = dryW;
        cx.strokeStyle = 'rgb(55,55,60)';
        cx.lineWidth = 1;
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(sx, baseY);
        cx.lineTo(sx, baseY - h);
        if (i % 2 === 0) {
          cx.moveTo(sx - 3, baseY - h * 0.65);
          cx.lineTo(sx + 4, baseY - h * 0.65);
        }
        cx.stroke();
        cx.restore();
      });
    }

    const foregroundRocks = [
      { wx: 120, s: 1.2, a: 0.42 },
      { wx: 330, s: 0.9, a: 0.38 },
      { wx: 620, s: 1.4, a: 0.46 },
      { wx: 980, s: 1.1, a: 0.4 },
      { wx: 1370, s: 1.5, a: 0.48 },
      { wx: 1650, s: 0.95, a: 0.36 },
      { wx: 1960, s: 1.3, a: 0.43 },
      { wx: 2140, s: 1.0, a: 0.38 },
    ];

    const foregroundShrubs = [
      { wx: 250, s: 1.1, a: 0.35 },
      { wx: 470, s: 0.9, a: 0.32 },
      { wx: 780, s: 1.2, a: 0.38 },
      { wx: 1210, s: 0.85, a: 0.3 },
      { wx: 1540, s: 1.05, a: 0.34 },
      { wx: 1860, s: 1.15, a: 0.36 },
      { wx: 2080, s: 0.95, a: 0.3 },
    ];

    const coastalPalms = [
      { wx: 280, s: 1.0 },
      { wx: 740, s: 1.22 },
      { wx: 1280, s: 0.95 },
      { wx: 1810, s: 1.12 },
    ];

    const jungleClusters = [
      { wx: 210, s: 1.05 },
      { wx: 620, s: 1.18 },
      { wx: 990, s: 0.92 },
      { wx: 1450, s: 1.25 },
      { wx: 1920, s: 1.08 },
    ];

    const desertCacti = [
      { wx: 170, s: 0.95 },
      { wx: 540, s: 1.08 },
      { wx: 980, s: 0.88 },
      { wx: 1490, s: 1.15 },
      { wx: 2020, s: 0.92 },
    ];

    function drawForegroundProps(themeA, themeB, blend) {
      const dryW = clamp01(themeWeight(themeA, themeB, blend, 'desert') + themeWeight(themeA, themeB, blend, 'mountains') * 0.65);
      if (dryW < 0.05) return;

      foregroundRocks.forEach(({ wx, s, a }) => {
        const adjS = s * (H / 240);
        const point = projectLoopingProp(wx, ROAD_LAYER, themeA, themeB, blend, 40);
        if (!point) return;
        if (!isForegroundEdgeX(point.sx)) return;

        const sx = point.sx;
        const y = point.y + H * 0.018;
        const rw = 10 * adjS;
        const rh = 4 * adjS;
        const rockTone = Math.round(lerp(24, 34, a));
        cx.save();
        cx.globalAlpha = dryW;
        cx.fillStyle = `rgb(${rockTone},${rockTone},${rockTone + 4})`;
        cx.beginPath();
        cx.ellipse(sx, y - rh * 0.5, rw, rh, 0, 0, Math.PI * 2);
        cx.fill();
        cx.restore();
      });

      foregroundShrubs.forEach(({ wx, s, a }) => {
        const adjS = s * (H / 240);
        const point = projectLoopingProp(wx, ROAD_LAYER, themeA, themeB, blend, 40);
        if (!point) return;
        if (!isForegroundEdgeX(point.sx)) return;

        const sx = point.sx;
        const y = point.y + H * 0.018;
        const shrubTone = Math.round(lerp(42, 56, a));
        cx.save();
        cx.globalAlpha = dryW;
        cx.strokeStyle = `rgb(${shrubTone},${shrubTone},${shrubTone + 5})`;
        cx.lineWidth = Math.max(1, adjS * 1.1);
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(sx, y);
        cx.lineTo(sx - 3 * adjS, y - 4 * adjS);
        cx.moveTo(sx, y);
        cx.lineTo(sx + 3 * adjS, y - 3.5 * adjS);
        cx.moveTo(sx, y - 0.5 * adjS);
        cx.lineTo(sx, y - 5 * adjS);
        cx.stroke();
        cx.restore();
      });
    }

    function drawCoastalProps(themeA, themeB, blend) {
      const coastalW = themeWeight(themeA, themeB, blend, 'coastal');
      if (coastalW < 0.05) return;

      coastalPalms.forEach(({ wx, s }) => {
        const adjS = s * (H / 240) * 0.9;
        const point = projectLoopingProp(wx, MIDGROUND_LAYER, themeA, themeB, blend, 60);
        if (!point) return;

        const sx = point.sx;
        const baseY = point.y;
        const h = 26 * adjS;
        const lean = Math.sin((sx + t * 25) * 0.012) * (3.5 * adjS);

        cx.save();
        cx.globalAlpha = coastalW;
        cx.strokeStyle = 'rgb(34,44,40)';
        cx.lineWidth = Math.max(1.4, 2.2 * adjS);
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(sx, baseY);
        cx.quadraticCurveTo(sx + lean * 0.5, baseY - h * 0.45, sx + lean, baseY - h);
        cx.stroke();

        const tx = sx + lean;
        const ty = baseY - h;
        cx.strokeStyle = 'rgb(40,62,52)';
        cx.lineWidth = 1.2;
        cx.beginPath();
        cx.moveTo(tx, ty);
        cx.lineTo(tx - 11 * adjS, ty - 4 * adjS);
        cx.moveTo(tx, ty);
        cx.lineTo(tx + 12 * adjS, ty - 3 * adjS);
        cx.moveTo(tx, ty);
        cx.lineTo(tx - 8 * adjS, ty + 2 * adjS);
        cx.moveTo(tx, ty);
        cx.lineTo(tx + 9 * adjS, ty + 2 * adjS);
        cx.stroke();
        cx.restore();
      });

      const lighthouse = projectLoopingProp(1680, 2, themeA, themeB, blend, 40, -H * 0.06);
      if (lighthouse) {
        const lighthouseScale = H / 240;
        const lx = lighthouse.sx;
        const ly = lighthouse.y;
        const beamA = 0.08 * coastalW;
        const sweep = Math.sin(t * 0.9) * 20;

        cx.save();
        cx.globalAlpha = coastalW;
        cx.fillStyle = 'rgb(42,46,54)';
        cx.fillRect(lx - 3 * lighthouseScale, ly, 6 * lighthouseScale, 24 * lighthouseScale);
        cx.fillStyle = 'rgb(188,206,214)';
        cx.fillRect(lx - 1.5 * lighthouseScale, ly + 2 * lighthouseScale, 3 * lighthouseScale, 3 * lighthouseScale);

        cx.globalAlpha = 1;
        cx.fillStyle = `rgba(206,226,232,${beamA})`;
        cx.beginPath();
        cx.moveTo(lx, ly + 3 * lighthouseScale);
        cx.lineTo(lx + 65 * lighthouseScale, ly - 10 * lighthouseScale + sweep * 0.05);
        cx.lineTo(lx + 58 * lighthouseScale, ly + 16 * lighthouseScale + sweep * 0.05);
        cx.closePath();
        cx.fill();
        cx.restore();
      }
    }

    function drawJungleProps(themeA, themeB, blend) {
      const jungleW = themeWeight(themeA, themeB, blend, 'jungle');
      if (jungleW < 0.05) return;

      jungleClusters.forEach(({ wx, s }) => {
        const adjS = s * (H / 240) * 0.92;
        const point = projectLoopingProp(wx, MIDGROUND_LAYER, themeA, themeB, blend, 70);
        if (!point) return;

        const sx = point.sx;
        const baseY = point.y;
        const trunkH = 22 * adjS;

        cx.save();
        cx.globalAlpha = jungleW;
        cx.strokeStyle = 'rgb(34,39,30)';
        cx.lineWidth = Math.max(1.5, 2.3 * adjS);
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(sx, baseY);
        cx.lineTo(sx, baseY - trunkH);
        cx.stroke();

        cx.fillStyle = 'rgb(26,60,34)';
        cx.beginPath();
        cx.arc(sx - 6 * adjS, baseY - trunkH, 8 * adjS, 0, Math.PI * 2);
        cx.arc(sx + 6 * adjS, baseY - trunkH - 1 * adjS, 8.5 * adjS, 0, Math.PI * 2);
        cx.arc(sx, baseY - trunkH - 5 * adjS, 9 * adjS, 0, Math.PI * 2);
        cx.fill();

        cx.strokeStyle = 'rgb(44,74,42)';
        cx.lineWidth = 1;
        cx.beginPath();
        cx.moveTo(sx + 4 * adjS, baseY - trunkH + 3 * adjS);
        cx.lineTo(sx + 7 * adjS, baseY - trunkH + 10 * adjS);
        cx.moveTo(sx - 5 * adjS, baseY - trunkH + 1 * adjS);
        cx.lineTo(sx - 8 * adjS, baseY - trunkH + 8 * adjS);
        cx.stroke();
        cx.restore();
      });
    }

    function drawDesertProps(themeA, themeB, blend) {
      const desertW = themeWeight(themeA, themeB, blend, 'desert');
      if (desertW < 0.06) return;

      desertCacti.forEach(({ wx, s }) => {
        const adjS = s * (H / 240) * 0.92;
        const point = projectLoopingProp(wx, MIDGROUND_LAYER, themeA, themeB, blend, 60);
        if (!point) return;

        const sx = point.sx;
        const baseY = point.y;
        const h = 18 * adjS;
        cx.save();
        cx.globalAlpha = desertW;
        cx.strokeStyle = 'rgb(60,74,52)';
        cx.lineWidth = Math.max(1.4, 2 * adjS);
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(sx, baseY);
        cx.lineTo(sx, baseY - h);
        cx.moveTo(sx, baseY - h * 0.55);
        cx.lineTo(sx - 5 * adjS, baseY - h * 0.42);
        cx.moveTo(sx, baseY - h * 0.58);
        cx.lineTo(sx + 5.5 * adjS, baseY - h * 0.48);
        cx.stroke();
        cx.restore();
      });
    }

    function drawFogBands() {
      const drift1 = Math.sin(t * 0.22) * W * 0.015;
      const drift2 = Math.cos(t * 0.18) * W * 0.02;

      const g1 = cx.createLinearGradient(-W * 0.2 + drift1, H * 0.54, W * 1.2 + drift1, H * 0.66);
      g1.addColorStop(0, 'rgba(145,145,158,0)');
      g1.addColorStop(0.35, 'rgba(145,145,158,0.05)');
      g1.addColorStop(0.65, 'rgba(145,145,158,0.06)');
      g1.addColorStop(1, 'rgba(145,145,158,0)');

      const g2 = cx.createLinearGradient(-W * 0.3 + drift2, H * 0.62, W * 1.1 + drift2, H * 0.76);
      g2.addColorStop(0, 'rgba(170,170,182,0)');
      g2.addColorStop(0.5, 'rgba(170,170,182,0.045)');
      g2.addColorStop(1, 'rgba(170,170,182,0)');

      cx.fillStyle = g1;
      cx.fillRect(0, H * 0.5, W, H * 0.2);
      cx.fillStyle = g2;
      cx.fillRect(0, H * 0.58, W, H * 0.24);
    }

    function drawRoad(jeepWorldX, terrainOff, themeA, themeB, blend) {
      cx.save();
      cx.lineCap = 'round';
      cx.lineJoin = 'round';
      const jeepScreenX = JEEP_X_FRAC * W;

      cx.strokeStyle = mixColor(themeA.road, themeB.road, blend);
      cx.lineWidth = Math.max(2.2, H * 0.015);
      cx.beginPath();
      for (let x = 0; x <= W + 3; x += 3) {
        const worldX = jeepWorldX + (x - jeepScreenX);
        const y = blendedLayerY(4, worldX, themeA, themeB, blend) - H * 0.016;
        if (x === 0) cx.moveTo(x, y);
        else cx.lineTo(x, y);
      }
      cx.stroke();

      cx.strokeStyle = mixColor(themeA.roadLine, themeB.roadLine, blend);
      cx.lineWidth = Math.max(0.8, H * 0.003);
      cx.setLineDash([10, 14]);
      cx.lineDashOffset = terrainOff;
      cx.beginPath();
      for (let x = 0; x <= W + 3; x += 3) {
        const worldX = jeepWorldX + (x - jeepScreenX);
        const y = blendedLayerY(4, worldX, themeA, themeB, blend) - H * 0.016;
        if (x === 0) cx.moveTo(x, y);
        else cx.lineTo(x, y);
      }
      cx.stroke();
      cx.setLineDash([]);
      cx.restore();
    }

    function drawPlaceLabel(themeA, themeB, blend) {
      cx.save();
      cx.textBaseline = 'top';
      cx.font = `600 ${Math.max(11, H * 0.033)}px "Inter", sans-serif`;
      cx.letterSpacing = '2px';

      const alphaA = clamp01(1 - blend * 1.15);
      const alphaB = clamp01((blend - 0.05) * 1.2);

      cx.fillStyle = `rgba(212, 191, 145, ${0.8 * alphaA})`;
      cx.fillText(themeA.label.toUpperCase(), 18, 16);

      cx.fillStyle = `rgba(212, 191, 145, ${0.8 * alphaB})`;
      cx.fillText(themeB.label.toUpperCase(), 18, 16);
      cx.restore();
    }

    function drawThemeOverlays(themeA, themeB, blend) {
      const coastalW = themeWeight(themeA, themeB, blend, 'coastal');
      const jungleW = themeWeight(themeA, themeB, blend, 'jungle');

      if (coastalW > 0.01) {
        cx.save();
        const coastG = cx.createLinearGradient(0, H * 0.44, 0, H * 0.62);
        coastG.addColorStop(0, `rgba(66,122,156,${0.04 * coastalW})`);
        coastG.addColorStop(1, `rgba(36,92,126,${0.14 * coastalW})`);
        cx.fillStyle = coastG;
        cx.fillRect(0, H * 0.44, W, H * 0.19);

        cx.strokeStyle = `rgba(178,216,225,${0.22 * coastalW})`;
        cx.lineWidth = 1;
        cx.beginPath();
        for (let x = 0; x <= W + 8; x += 8) {
          const y = H * 0.56 + Math.sin((x + t * 90) * 0.02) * 1.2;
          if (x === 0) cx.moveTo(x, y);
          else cx.lineTo(x, y);
        }
        cx.stroke();
        cx.restore();
      }

      if (jungleW > 0.01) {
        const fireflies = 16;
        cx.save();
        for (let i = 0; i < fireflies; i++) {
          const fx = ((i * 137) % 997) / 997;
          const fy = 0.44 + ((((i * 211) % 761) / 761) * 0.3);
          const phase = i * 0.71;
          const x = fx * W;
          const y = fy * H + Math.sin(t * 1.4 + phase) * 5;
          const a = (0.18 + 0.4 * (0.5 + 0.5 * Math.sin(t * 3.2 + phase))) * jungleW;
          cx.fillStyle = `rgba(170,210,116,${a})`;
          cx.beginPath();
          cx.arc(x, y, 1.2, 0, Math.PI * 2);
          cx.fill();
        }
        cx.restore();
      }
    }

    const bats = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random(),
      y: 0.09 + Math.random() * 0.16,
      sp: 0.00008 + Math.random() * 0.0001,
      ph: Math.random() * Math.PI * 2,
      sc: 0.9 + Math.random() * 0.5,
      dir: i % 2 === 0 ? 1 : -1,
    }));

    function drawBats() {
      bats.forEach(b => {
        b.x += b.sp * b.dir;
        if (b.x > 1.08) b.x = -0.08;
        if (b.x < -0.08) b.x = 1.08;

        const bx = b.x * W;
        const by = b.y * H + Math.sin(t * 1.6 + b.ph) * 3;
        const flap = Math.sin(t * 10 + b.ph) * 2.5 * b.sc;

        cx.save();
        cx.strokeStyle = 'rgba(90,90,100,0.35)';
        cx.lineWidth = 1.1;
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(bx - 4 * b.sc, by + flap * 0.25);
        cx.quadraticCurveTo(bx - 1.5 * b.sc, by - flap, bx, by);
        cx.quadraticCurveTo(bx + 1.5 * b.sc, by - flap, bx + 4 * b.sc, by + flap * 0.25);
        cx.stroke();
        cx.restore();
      });
    }

    const shootingStar = {
      active: false,
      timer: 4 + Math.random() * 6,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
    };

    function updateAndDrawShootingStar(dt) {
      if (!shootingStar.active) {
        shootingStar.timer -= dt;
        if (shootingStar.timer <= 0) {
          shootingStar.active = true;
          shootingStar.x = W * (0.75 + Math.random() * 0.22);
          shootingStar.y = H * (0.08 + Math.random() * 0.16);
          shootingStar.vx = -(H * 0.55 + Math.random() * H * 0.2) * dt;
          shootingStar.vy = (H * 0.14 + Math.random() * H * 0.08) * dt;
          shootingStar.life = 0;
          shootingStar.maxLife = 0.7 + Math.random() * 0.4;
        }
        return;
      }

      shootingStar.life += dt;
      if (shootingStar.life >= shootingStar.maxLife) {
        shootingStar.active = false;
        shootingStar.timer = 8 + Math.random() * 9;
        return;
      }

      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;

      const k = 1 - shootingStar.life / shootingStar.maxLife;
      cx.save();
      cx.strokeStyle = `rgba(230,220,186,${0.6 * k})`;
      cx.lineWidth = 1.2;
      cx.beginPath();
      cx.moveTo(shootingStar.x, shootingStar.y);
      cx.lineTo(shootingStar.x + 26, shootingStar.y - 7);
      cx.stroke();
      cx.fillStyle = `rgba(238,230,200,${0.65 * k})`;
      cx.beginPath();
      cx.arc(shootingStar.x, shootingStar.y, 1.4, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }

    /* ── stars ── */
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random(), y: Math.random() * 0.45,
      r: 0.3 + Math.random() * 0.8,
      p: Math.random() * Math.PI * 2,
    }));

    function drawStars() {
      if (themeRef.current === 'light') return; // Hide stars in light mode for a 'daylight' feel
      stars.forEach(s => {
        const a = 0.15 + 0.1 * Math.sin(t * 1.1 + s.p);
        cx.fillStyle = `rgba(198,169,107,${a})`;
        cx.beginPath(); cx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); cx.fill();
      });
    }

    /* ── YOUR JEEP IMAGE ── */
    const JEEP_X_FRAC = 0.42;
    let jeepY = 0, jeepVY = 0, jeepAngle = 0;

    const jeepImg = new Image();
    // THE EXACT IMAGE YOU PROVIDED
    jeepImg.src = `${import.meta.env.BASE_URL}jeep-svgrepo-com.svg`;

    const dustParticles = [];

    function jeepPoint(jx, jy, angle, localX, localY) {
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      return {
        x: jx + localX * ca - localY * sa,
        y: jy + localX * sa + localY * ca,
      };
    }

    function emitDust(jx, jy, angle, dustWeight) {
      const s = H * 0.15;
      const rear = jeepPoint(jx, jy, angle, -s * 0.70, -s * 0.20);
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      const upX = Math.sin(angle);
      const upY = -Math.cos(angle);

      const spawnCount = dustWeight > 0.5 ? 2 : 1;
      for (let i = 0; i < spawnCount; i++) {
        const jitter = (Math.random() - 0.5) * s * 0.08;
        const baseBack = (0.14 + Math.random() * 0.2) + dustWeight * 0.22;
        const baseUp = (0.06 + Math.random() * 0.12) - dustWeight * 0.03;

        const p = {
          x: rear.x + upX * jitter,
          y: rear.y + upY * jitter,
          vx: -dirX * baseBack + upX * baseUp,
          vy: -dirY * baseBack + upY * baseUp,
          r: 1 + Math.random() * 2.2,
          life: 0,
          maxLife: 20 + Math.random() * 18,
        };
        dustParticles.push(p);
      }

      while (dustParticles.length > 120) dustParticles.shift();
    }

    function updateAndDrawDust() {
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const p = dustParticles[i];
        p.life += 1;
        if (p.life >= p.maxLife) {
          dustParticles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.99;

        const k = 1 - p.life / p.maxLife;
        const dustWarm = p.warm ?? 0.5;
        const r = Math.round(lerp(118, 156, dustWarm));
        const g = Math.round(lerp(124, 136, dustWarm));
        const b = Math.round(lerp(138, 104, dustWarm));
        const a = lerp(0.08, 0.18, dustWarm) * k;
        cx.fillStyle = `rgba(${r},${g},${b},${a})`;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r * (0.8 + (1 - k) * 0.55), 0, Math.PI * 2);
        cx.fill();
      }
    }

    function drawHeadlights(jx, jy, angle) {
      const s = H * 0.15;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      const nx = -dirY;
      const ny = dirX;

      const front = jeepPoint(jx, jy, angle, s * 0.78, -s * 0.43);
      const sx = front.x;
      const sy = front.y;
      const len = s * 1.8;
      const spread = s * 0.52;

      cx.save();
      const g = cx.createLinearGradient(sx, sy, sx + dirX * len, sy + dirY * len);
      g.addColorStop(0, 'rgba(230,214,170,0.2)');
      g.addColorStop(1, 'rgba(230,214,170,0)');
      cx.fillStyle = g;

      cx.beginPath();
      cx.moveTo(sx + nx * 2, sy + ny * 2);
      cx.lineTo(sx + dirX * len + nx * spread, sy + dirY * len + ny * spread);
      cx.lineTo(sx + dirX * len - nx * spread, sy + dirY * len - ny * spread);
      cx.closePath();
      cx.fill();

      cx.fillStyle = 'rgba(235,220,176,0.35)';
      cx.beginPath();
      cx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }

    function drawJeep(jx, jy, angle) {
      const s = H * 0.15; // Size relative to footer height
      cx.save();
      cx.translate(jx, jy);
      cx.rotate(angle);
      cx.scale(-1, 1);

      // Shadow
      cx.fillStyle = 'rgba(0,0,0,0.4)';
      cx.beginPath(); cx.ellipse(0, s * 0.1, s * 0.75, s * 0.1, 0, 0, Math.PI * 2); cx.fill();

      if (jeepImg.complete && jeepImg.naturalWidth > 0) {
        const imgW = s * 1.6;
        const ratio = jeepImg.naturalHeight / jeepImg.naturalWidth;
        const imgH = imgW * ratio;
        cx.drawImage(jeepImg, -imgW * 0.5, -imgH * 0.84, imgW, imgH);
      }

      cx.restore();
    }

    /* ── main loop ── */
    function loop() {
      cx.clearRect(0, 0, W, H);
      const dt = 0.016;
      t += dt;
      textOff += 0.5; // Speed of background text
      worldX += speeds[4] * PLACE_PREVIEW_SPEED;

      const { a: themeA, b: themeB, blend } = getThemeState(worldX);
      const dustWeight = themeWeight(themeA, themeB, blend, 'desert');

      const isLight = themeRef.current === 'light';

      // Sky Background
      if (!isLight) {
        // Only draw the sky gradient in dark mode (night sky)
        const skyG = cx.createLinearGradient(0, 0, 0, H);
        skyG.addColorStop(0, mixColor(themeA.skyTop, themeB.skyTop, blend));
        skyG.addColorStop(0.55, mixColor(themeA.skyMid, themeB.skyMid, blend));
        skyG.addColorStop(1, mixColor(themeA.skyBottom, themeB.skyBottom, blend));
        cx.fillStyle = skyG;
        cx.fillRect(0, 0, W, H);
      } else {
        // In light mode, sky is transparent to show the theme bg
        // Optional subtle gradient for depth
        const skyG = cx.createLinearGradient(0, 0, 0, H);
        skyG.addColorStop(0, 'rgba(232, 220, 203, 0)');
        skyG.addColorStop(1, 'rgba(247, 244, 239, 0.3)');
        cx.fillStyle = skyG;
        cx.fillRect(0, 0, W, H);
      }

      drawStars();
      drawBats();
      if (!isLight) updateAndDrawShootingStar(dt); // No shooting stars in broad daylight
      drawThemeOverlays(themeA, themeB, blend);

      // Draw Typography in the Sky (Behind Hills)
      drawSkyTypography(textOff);

      for (let i = 0; i < 5; i++) off[i] += speeds[i];
      for (let i = 0; i < 5; i++) {
        const layerColor = mixColorChannels(themeA.layers[i].col, themeB.layers[i].col, blend);
        const col = toRgb(layerColor);
        drawHill(
          x => blendedLayerY(i, x + off[i], themeA, themeB, blend),
          col
        );
        if (i === 4 && footerBarRef.current) {
          footerBarRef.current.style.setProperty('--footer-land-rgb', layerColor.join(', '));
        }
      }

      // Jeep Position (calculate before drawRoad so road aligns with earth)
      const jx = JEEP_X_FRAC * W;
      const jeepWorldX = jx + off[4];

      withRoadBackdropClip(themeA, themeB, blend, () => {
        drawCabinLights(themeA, themeB, blend);
        drawDesertProps(themeA, themeB, blend);
        drawCoastalProps(themeA, themeB, blend);
        drawTrees(themeA, themeB, blend);
        drawJungleProps(themeA, themeB, blend);
        drawFencePosts(themeA, themeB, blend);
      });
      drawRoad(jeepWorldX, off[4], themeA, themeB, blend);
      drawFogBands();
      const spread = 45;
      const frontFn = x => blendedLayerY(4, x + off[4], themeA, themeB, blend);
      const y1 = frontFn(jx - spread);
      const y2 = frontFn(jx + spread);
      const targetY = (y1 + y2) / 2 + 3;
      const targetA = Math.atan2(y2 - y1, spread * 2);

      jeepVY += (targetY - jeepY) * 0.12;
      jeepVY *= 0.82;
      jeepY += jeepVY;
      jeepAngle += (targetA - jeepAngle) * 0.15;

      emitDust(jx, jeepY, jeepAngle, dustWeight);
      for (let i = 0; i < dustParticles.length; i++) dustParticles[i].warm = dustWeight;
      updateAndDrawDust();
      drawHeadlights(jx, jeepY, jeepAngle);
      drawJeep(jx, jeepY, jeepAngle);
      drawForegroundProps(themeA, themeB, blend);
      drawForegroundTrees(themeA, themeB, blend);
      animationFrameId = requestAnimationFrame(loop);
    }

    jeepY = H * 0.7;
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const footerBarStyle = {
    background:
      'linear-gradient(180deg, rgba(var(--footer-land-rgb, 44, 44, 48), 0.08) 0%, rgba(var(--footer-land-rgb, 44, 44, 48), 0.82) 34%, rgba(var(--footer-land-rgb, 44, 44, 48), 0.98) 100%)',
    color: 'rgba(247,244,239,0.5)',
  };

  return (
    <footer className="relative transition-colors duration-400" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div
        className="relative h-[220px] w-full overflow-hidden sm:h-[240px] md:h-[280px] lg:h-[300px]"
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full block" />
        {/* Sky-top fade: blends canvas sky into the section above */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-20 sm:h-24"
          style={{ background: 'linear-gradient(to bottom, var(--bg-base), transparent)' }}
        />
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div
            ref={footerBarRef}
            className="w-full px-5 pb-4 pt-3 transition-colors duration-400 sm:px-6 sm:pb-5 sm:pt-3.5 md:px-12 md:py-6"
            style={footerBarStyle}
          >
            <div className="flex flex-col items-center gap-2.5 md:flex-row md:justify-between md:gap-6">
              <nav
                aria-label="Footer"
                className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center sm:gap-x-5 md:w-auto md:justify-start md:gap-x-8 md:gap-y-2 md:text-left"
              >
                {FOOTER_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="whitespace-nowrap text-[8px] uppercase tracking-[0.14em] transition-colors hover:text-[#c6a96b] sm:text-[9px] sm:tracking-[0.16em] md:text-[10px] md:tracking-[0.3em]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <span className="whitespace-nowrap text-[8px] uppercase tracking-[0.18em] sm:text-[9px] sm:tracking-[0.2em] md:text-[10px] md:tracking-[0.3em]">
                  &copy; {new Date().getFullYear()} Design Your India
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
