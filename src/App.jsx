import { useState, useRef } from "react";

// ============================================================
// 동양화 물감 팔레트 (한자, 카테고리, 아이콘 포함)
// ============================================================
const PIG = [
  { name: "호분", hanja: "胡粉", hex: "#F5F0E8", lab: [95.2, 0.5, 6.8], cat: "기본", desc: "흰색 (조개분말)" },
  { name: "먹", hanja: "墨", hex: "#2A2A2A", lab: [17.5, 0, 0], cat: "기본", desc: "검정 (송연먹)" },
  { name: "주", hanja: "朱", hex: "#E8432A", lab: [49, 62, 50], cat: "적색", desc: "주홍 (진사)" },
  { name: "양홍", hanja: "洋紅", hex: "#D4245B", lab: [44, 64, 12], cat: "적색", desc: "선홍색" },
  { name: "감지", hanja: "紺脂", hex: "#6B3A6B", lab: [32, 25, -22], cat: "적색", desc: "진홍/감색" },
  { name: "황", hanja: "黃", hex: "#F0C430", lab: [81, 4, 74], cat: "황색", desc: "노란색 (석황)" },
  { name: "황토", hanja: "黃土", hex: "#C49A3C", lab: [66, 10, 52], cat: "황색", desc: "황토색" },
  { name: "대자", hanja: "代赭", hex: "#8B4513", lab: [38, 22, 35], cat: "갈색", desc: "갈색 (대자석)" },
  { name: "남", hanja: "藍", hex: "#2E5090", lab: [35, 5, -40], cat: "청색", desc: "남색 (쪽)" },
  { name: "본남", hanja: "本藍", hex: "#1B3A6B", lab: [26, 5, -35], cat: "청색", desc: "진남색" },
  { name: "군청", hanja: "群靑", hex: "#2040A0", lab: [30, 18, -52], cat: "청색", desc: "군청색" },
  { name: "백록", hanja: "白綠", hex: "#8FBC8F", lab: [73, -18, 14], cat: "녹색", desc: "연녹색 (공작석)" },
  { name: "녹청", hanja: "綠靑", hex: "#2E8B57", lab: [51, -35, 15], cat: "녹색", desc: "청록색" },
  { name: "농록", hanja: "濃綠", hex: "#1A5C3A", lab: [35, -30, 12], cat: "녹색", desc: "진녹색" },
  { name: "자", hanja: "紫", hex: "#7B3F8E", lab: [38, 35, -30], cat: "보라", desc: "보라색" },
];

const PRESETS = [
  { name: "일반 포수(종이)", ratio: 10, desc: "화선지·장지" },
  { name: "비단용", ratio: 8, desc: "비단·견" },
  { name: "연습용", ratio: 12, desc: "연습용 얇은 포수" },
  { name: "채색 바탕", ratio: 10, desc: "채색 전 밑포수" },
  { name: "마감 포수", ratio: 15, desc: "완성 후 보호용" },
];

const SEASONS = [
  { name: "봄·가을", factor: 1.0, desc: "표준" },
  { name: "여름", factor: 1.15, desc: "묽게 ×1.15" },
  { name: "겨울", factor: 0.85, desc: "진하게 ×0.85" },
];

const QUICKS = [5, 10, 15, 20, 30];

const STEPS = [
  "깨끗한 용기에 아교를 넣고 찬물을 부어 30분~1시간 불립니다.",
  "중탕(50~60°C)으로 아교를 완전히 녹입니다. 직접 가열 금물!",
  "백반을 소량의 따뜻한 물에 따로 녹여 준비합니다.",
  "녹인 아교 용액에 백반 용액을 천천히 섞어줍니다.",
  "거품을 걷어내고 체에 걸러 불순물을 제거합니다.",
  "포수붓으로 고르게 바릅니다. 2~3회, 완전 건조 후 덧바름.",
];

const PRESET_COLORS = [
  { name: "살구색", hex: "#FFDAB9" }, { name: "옥색", hex: "#5DC1B9" },
  { name: "치자색", hex: "#E6A817" }, { name: "송화색", hex: "#C9D64A" },
  { name: "적갈색", hex: "#8B3A2A" }, { name: "남색", hex: "#2E4A7A" },
  { name: "자주색", hex: "#8B2560" }, { name: "석록색", hex: "#3A8B5A" },
];

// ============================================================
// Color math
// ============================================================
function hexRgb(h) {
  h = h.replace("#", "");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2lab(r, g, b) {
  const lin = (t) => (t > 0.04045 ? Math.pow((t + 0.055) / 1.055, 2.4) : t / 12.92);
  let rr = lin(r / 255), gg = lin(g / 255), bb = lin(b / 255);
  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = rr * 0.2126 + gg * 0.7152 + bb * 0.0722;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function lab2rgb(L, a, b) {
  let y = (L + 16) / 116, x = a / 500 + y, z = y - b / 200;
  const f = (t) => { const c = t * t * t; return c > 0.008856 ? c : (t - 16 / 116) / 7.787; };
  x = f(x) * 0.95047; y = f(y); z = f(z) * 1.08883;
  const c = (t) => Math.max(0, Math.min(255, Math.round((t > 0.0031308 ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055 : 12.92 * t) * 255)));
  return [c(x * 3.2406 + y * -1.5372 + z * -0.4986), c(x * -0.9689 + y * 1.8758 + z * 0.0415), c(x * 0.0557 + y * -0.204 + z * 1.057)];
}
function rgb2hex(r, g, b) { return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join(""); }
function dist(a, b) { return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2); }
function luminance(hex) { const [r,g,b] = hexRgb(hex); return (0.299*r + 0.587*g + 0.114*b) / 255; }

function mixColor(targetHex) {
  const tLab = rgb2lab(...hexRgb(targetHex));
  let best = { d: Infinity, r: [], lab: null };
  const chk = (d, r, lab) => { if (d < best.d) best = { d, r, lab }; };
  for (let i = 0; i < PIG.length; i++) chk(dist(tLab, PIG[i].lab), [{ i, p: 100 }], PIG[i].lab);
  for (let i = 0; i < PIG.length; i++) for (let j = i + 1; j < PIG.length; j++) for (let r = 5; r <= 95; r += 5) {
    const rr = r / 100, ml = [0, 1, 2].map((k) => PIG[i].lab[k] * rr + PIG[j].lab[k] * (1 - rr));
    chk(dist(tLab, ml), [{ i, p: r }, { i: j, p: 100 - r }], ml);
  }
  for (let i = 0; i < PIG.length; i++) for (let j = i + 1; j < PIG.length; j++) for (let k = j + 1; k < PIG.length; k++)
    for (let r1 = 10; r1 <= 80; r1 += 10) for (let r2 = 10; r2 <= 80 - r1; r2 += 10) {
      const r3 = 100 - r1 - r2; if (r3 < 5) continue;
      const ml = [0, 1, 2].map((m) => PIG[i].lab[m] * r1 / 100 + PIG[j].lab[m] * r2 / 100 + PIG[k].lab[m] * r3 / 100);
      chk(dist(tLab, ml), [{ i, p: r1 }, { i: j, p: r2 }, { i: k, p: r3 }], ml);
    }
  const rRgb = lab2rgb(...best.lab);
  const recipe = best.r.map((x) => ({ name: PIG[x.i].name, hanja: PIG[x.i].hanja, hex: PIG[x.i].hex, ratio: x.p }));
  const accuracy = Math.max(0, Math.min(100, Math.round((1 - best.d / 100) * 100)));

  // Generate tips
  const tips = [];
  if (recipe.some(r => r.name === "먹")) tips.push("먹은 소량씩 넣으세요. 한번 진해지면 되돌리기 어렵습니다.");
  if (recipe.some(r => r.name === "호분" && r.ratio >= 50)) tips.push("호분 비율이 높으면 불투명해집니다. 투명감을 원하면 물로 희석하세요.");
  if (recipe.length >= 3) tips.push("3색 이상 혼합 시 탁해질 수 있어요. 단계적으로 섞어보세요.");
  if (accuracy < 70) tips.push("정확도가 낮습니다. 실제 혼색 시 미세 조정이 필요할 수 있어요.");

  return { recipe, resultHex: rgb2hex(...rRgb), accuracy, tips };
}

// ============================================================
// Image color extraction
// ============================================================
function extractColors(imgData, width, height, count = 12) {
  const pixels = [];
  const step = Math.max(1, Math.floor((width * height) / 5000));
  for (let i = 0; i < imgData.length; i += 4 * step) {
    pixels.push([imgData[i], imgData[i + 1], imgData[i + 2]]);
  }

  // K-means clustering
  let centers = [];
  for (let i = 0; i < count; i++) {
    centers.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  for (let iter = 0; iter < 15; iter++) {
    const clusters = Array.from({ length: count }, () => []);
    for (const px of pixels) {
      let minD = Infinity, minI = 0;
      for (let c = 0; c < count; c++) {
        const d = (px[0] - centers[c][0]) ** 2 + (px[1] - centers[c][1]) ** 2 + (px[2] - centers[c][2]) ** 2;
        if (d < minD) { minD = d; minI = c; }
      }
      clusters[minI].push(px);
    }
    for (let c = 0; c < count; c++) {
      if (clusters[c].length === 0) continue;
      centers[c] = [
        Math.round(clusters[c].reduce((s, p) => s + p[0], 0) / clusters[c].length),
        Math.round(clusters[c].reduce((s, p) => s + p[1], 0) / clusters[c].length),
        Math.round(clusters[c].reduce((s, p) => s + p[2], 0) / clusters[c].length),
      ];
    }
  }

  // Sort by frequency (cluster size) and remove near-duplicates
  const result = [];
  const seen = new Set();
  centers
    .map((c, i) => ({ hex: rgb2hex(c[0], c[1], c[2]), r: c[0], g: c[1], b: c[2] }))
    .sort((a, b) => luminance(b.hex) - luminance(a.hex))
    .forEach((c) => {
      const key = Math.round(c.r / 20) + "," + Math.round(c.g / 20) + "," + Math.round(c.b / 20);
      if (!seen.has(key)) { seen.add(key); result.push(c.hex); }
    });
  return result.slice(0, 10);
}

// ============================================================
// Theme
// ============================================================
const C = {
  bg: "#1a1612", sf: "#231f1a", cd: "#2c2621", el: "#362f29",
  t1: "#e8ddd0", t2: "#a89882", t3: "#776b5e",
  gold: "#c4a265", gd: "#8b7445", red: "#b85450", bd: "#3d352d",
};

// ============================================================
// Main Component
// ============================================================
export default function App() {
  const [tab, setTab] = useState(0);
  const [pr, setPr] = useState(0);
  const [sn, setSn] = useState(0);
  const [ga, setGa] = useState(10);
  const [cp, setCp] = useState([]);
  const [guide, setGuide] = useState(false);
  const [modal, setModal] = useState(false);
  const [cn, setCn] = useState("");
  const [cr, setCr] = useState("10");
  const [hex, setHex] = useState("#8B4513");
  const [mix, setMix] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recs, setRecs] = useState([]);
  const [memos, setMemos] = useState([]);
  const [mt, setMt] = useState("");
  const [imgColors, setImgColors] = useState([]);
  const [imgSrc, setImgSrc] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const allP = [...PRESETS, ...cp];
  const p = allP[pr] || PRESETS[0];
  const se = SEASONS[sn];
  const water = (ga * p.ratio * se.factor).toFixed(1);
  const alum = (ga * 0.03).toFixed(2);
  const ratio = (p.ratio * se.factor).toFixed(1);
  const now = () => new Date().toLocaleString("ko-KR");

  // Styles
  const chip = (active, hasIcon) => ({
    display: "inline-flex", alignItems: "center", gap: hasIcon ? 6 : 0,
    padding: "7px 12px", borderRadius: 20,
    border: `1px solid ${active ? C.gold : C.bd}`,
    background: active ? "rgba(196,162,101,0.15)" : C.sf,
    color: active ? C.gold : C.t2, fontSize: 12, cursor: "pointer",
    margin: "2px 3px 2px 0", fontFamily: "inherit", transition: "all 0.15s",
  });
  const btn = (pri, dan) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "8px 16px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer",
    border: `1px solid ${dan ? C.red : pri ? C.gold : C.bd}`,
    background: pri ? C.gd : C.el, color: dan ? C.red : pri ? "#fff" : C.t1,
    transition: "all 0.15s",
  });
  const card = { background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 14, padding: 16, marginBottom: 12 };
  const ctitle = { fontSize: 13, fontWeight: 500, color: C.gold, marginBottom: 12, letterSpacing: 1 };
  const inp = { width: "100%", padding: "10px 12px", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(139,115,85,0.2)`, borderRadius: 8, color: C.t1, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const ri = { background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 12, marginBottom: 8 };

  const doMix = (h) => {
    let v = h || hex;
    if (!v.startsWith("#")) v = "#" + v;
    v = v.replace(/[^#0-9a-fA-F]/g, "").slice(0, 7);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { setHex(v); setMix(mixColor(v)); }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const maxW = 200;
        const scale = maxW / img.width;
        canvas.width = maxW;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = extractColors(data, canvas.width, canvas.height);
        setImgColors(colors);
        setImgSrc(ev.target.result);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ===== SVG Icons (brush-stroke style) =====
  const BrushIcon = ({ children, size = 18 }) => (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, marginRight: 6, verticalAlign: "middle", opacity: 0.85 }}>{children}</span>
  );

  // 아교포수 icons
  const IconPreset = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M8 2v3M16 2v3" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 7h12c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2z" stroke={C.gold} strokeWidth="1.5"/>
        <path d="M7 12h4M7 16h8" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <circle cx="17" cy="12" r="1.2" fill={C.gold} opacity="0.4"/>
      </svg>
    </BrushIcon>
  );

  const IconSeason = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke={C.gold} strokeWidth="1.5"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
      </svg>
    </BrushIcon>
  );

  const IconScale = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 7l9-4 9 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 7c0 2 2 4 4.5 4S12 9 12 7" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
        <path d="M12 7c0 2 2 4 4.5 4S21 9 21 7" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
        <path d="M9 21h6" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </BrushIcon>
  );

  const IconResult = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={C.gold} strokeWidth="1.5"/>
        <path d="M8 8h8M8 12h5M8 16h6" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <circle cx="17" cy="16" r="1" fill={C.gold} opacity="0.6"/>
      </svg>
    </BrushIcon>
  );

  const IconGuide = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={C.gold} strokeWidth="1.5"/>
        <path d="M8 7h8M8 11h5" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
      </svg>
    </BrushIcon>
  );

  const IconRecord = () => (
    <BrushIcon size={16}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      </svg>
    </BrushIcon>
  );

  const IconWarning = () => (
    <BrushIcon size={14}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4M12 17h.01" stroke="#d4a0a0" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10.3 3.2L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z" stroke="#d4a0a0" strokeWidth="1.5"/>
      </svg>
    </BrushIcon>
  );

  const IconMemo = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </BrushIcon>
  );

  // ===== TAB 0: 아교포수 =====
  const T0 = () => (
    <>
      <div style={card}>
        <div style={ctitle}><IconPreset />프리셋 선택</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {allP.map((x, i) => (
            <button key={i} style={chip(pr === i, false)} onClick={() => setPr(i)}>
              <span>{x.name}</span>
              {i >= PRESETS.length && (
                <span onClick={(e) => { e.stopPropagation(); const n = cp.filter((_, ci) => ci !== i - PRESETS.length); setCp(n); if (pr >= PRESETS.length + n.length) setPr(0); }} style={{ marginLeft: 4, color: C.red, fontSize: 10 }}>✕</span>
              )}
            </button>
          ))}
        </div>
        {p.desc && <div style={{ fontSize: 11, color: C.t3, marginTop: 6, paddingLeft: 2 }}>{p.desc}</div>}
        <button style={{ ...btn(false, false), marginTop: 10, fontSize: 11 }} onClick={() => { setModal(true); setCn(""); setCr("10"); }}>+ 나만의 비율 추가</button>
      </div>

      <div style={card}>
        <div style={ctitle}><IconSeason />계절 보정</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {SEASONS.map((x, i) => (
            <button key={i} style={chip(sn === i, false)} onClick={() => setSn(i)}>
              <span>{x.name}</span>
              <span style={{ color: C.t3, fontSize: 10, marginLeft: 4 }}>{x.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={ctitle}><IconScale />아교 양</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
          {QUICKS.map((a) => (
            <button key={a} style={chip(ga === a, false)} onClick={() => setGa(a)}>{a}g</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="range" min={1} max={50} value={ga} onChange={(e) => setGa(+e.target.value)} style={{ flex: 1, accentColor: C.gold }} />
          <span style={{ fontSize: 16, color: C.gold, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{ga}g</span>
        </div>
      </div>

      <div style={card}>
        <div style={ctitle}><IconResult />계산 결과</div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>{p.name} · {se.name} · 아교 {ga}g</div>
        <div style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${C.gd}`, borderRadius: 12, padding: 14 }}>
          {[["아교", ga + "g", C.gold], ["물", water + "ml", "#6ba3d6"], ["백반 (3%)", alum + "g", "#d4c4a8"], ["적용 비율", "1 : " + ratio, C.t1]].map(([l, v, vc], i, a) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < a.length - 1 ? `1px solid rgba(139,115,85,0.15)` : "none" }}>
              <span style={{ color: C.t2, fontSize: 13 }}>{l}</span>
              <span style={{ fontWeight: 500, fontSize: 15, color: vc, letterSpacing: 0.5 }}>{v}</span>
            </div>
          ))}
        </div>
        <button style={{ ...btn(true, false), marginTop: 12, width: "100%" }} onClick={() => setRecs([...recs, { d: now(), t: `[아교포수] ${p.name}/${se.name} — 아교 ${ga}g, 물 ${water}ml, 백반 ${alum}g` }])}>
          <IconRecord />기록 저장
        </button>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setGuide(!guide)}>
          <span style={{ ...ctitle, margin: 0 }}><IconGuide />교반수 만드는 법</span>
          <span style={{ color: C.t3, transform: guide ? "rotate(180deg)" : "none", transition: "transform 0.3s", fontSize: 12 }}>▼</span>
        </div>
        {guide && (
          <div style={{ marginTop: 12 }}>
            {STEPS.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < 5 ? `1px solid rgba(139,115,85,0.12)` : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gd}, ${C.gold})`, color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.t2 }}>{x}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(184,84,80,0.1)", borderRadius: 8, fontSize: 11, color: "#d4a0a0", lineHeight: 1.6 }}>
              <IconWarning />아교는 반드시 중탕으로 녹이세요. 직접 가열하면 접착력이 떨어집니다.<br/>
              <IconWarning />남은 교반수는 냉장 보관, 2~3일 내 사용하세요.
            </div>
          </div>
        )}
      </div>
    </>
  );

  const IconImageExtract = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 16l5-5c1-1 2.5-1 3.5 0l5.5 5.5" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 13l2-2c.8-.8 2-.8 2.8 0L21 13" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill={C.gold} opacity="0.6"/>
      </svg>
    </BrushIcon>
  );

  const IconColorCode = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={C.gold} strokeWidth="1.5"/>
        <circle cx="12" cy="8" r="2.5" fill={C.gold} opacity="0.5"/>
        <circle cx="8" cy="14" r="2.5" fill={C.gold} opacity="0.35"/>
        <circle cx="16" cy="14" r="2.5" fill={C.gold} opacity="0.2"/>
      </svg>
    </BrushIcon>
  );

  const IconPresetColor = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12c0 2 .7 3 2 3h1.5c1.1 0 2 .9 2 2 0 .6-.2 1.1-.5 1.4-.5.5-.5 1.6.5 2.1.9.4 2.2.5 3.5.5 5 0 9-4 9-9S17 3 12 3z" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="10" r="1.5" fill="#D4245B" opacity="0.7"/>
        <circle cx="12" cy="7.5" r="1.5" fill="#F0C430" opacity="0.7"/>
        <circle cx="16" cy="10" r="1.5" fill="#2E8B57" opacity="0.7"/>
      </svg>
    </BrushIcon>
  );

  const IconMixResult = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 3v6.5c0 .3-.1.6-.3.8L4.2 15c-1.2 1.3-.3 3.5 1.5 3.5h12.6c1.8 0 2.7-2.2 1.5-3.5l-4.5-4.7c-.2-.2-.3-.5-.3-.8V3" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 3h8" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 14.5c2-1 4 1 6 0s4 1 6 0" stroke={C.gold} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      </svg>
    </BrushIcon>
  );

  const IconPalette = () => (
    <BrushIcon size={20}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M2 12c0 5 4.5 9 10 9 1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3c2.8 0 5.2-2.3 4.7-5.2C21.2 5 17 2 12 2 6.5 2 2 6.5 2 12z" stroke={C.gold} strokeWidth="1.5"/>
        <circle cx="8" cy="9" r="1.2" fill={C.gold} opacity="0.6"/>
        <circle cx="12" cy="7" r="1.2" fill={C.gold} opacity="0.45"/>
        <circle cx="16" cy="9" r="1.2" fill={C.gold} opacity="0.3"/>
      </svg>
    </BrushIcon>
  );

  const IconSave = () => (
    <BrushIcon size={16}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 21v-7H7v7M7 3v5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </BrushIcon>
  );

  const IconCamera = () => (
    <BrushIcon size={18}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </BrushIcon>
  );

  // ===== TAB 1: 컬러배합 =====
  const T1 = () => (
    <>
      {/* 이미지에서 색상 추출 */}
      <div style={card}>
        <div style={ctitle}><IconImageExtract />이미지에서 색상 추출</div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>이미지를 올리면 주요 색상을 자동으로 뽑아드려요</div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        <button style={{ ...btn(false, false), width: "100%", padding: "12px" }} onClick={() => fileRef.current?.click()}>
          <IconCamera />이미지 선택
        </button>

        {imgSrc && (
          <div style={{ marginTop: 12 }}>
            <img src={imgSrc} style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.bd}`, maxHeight: 180, objectFit: "cover" }} />
            {imgColors.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: C.t3, marginBottom: 6 }}>추출된 색상 (터치하면 배합 레시피를 볼 수 있어요)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {imgColors.map((c, i) => (
                    <div key={i} onClick={() => { setHex(c); setMix(mixColor(c)); }}
                      style={{ cursor: "pointer", textAlign: "center", transition: "transform 0.15s" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: c, border: `2px solid ${hex === c ? C.gold : C.bd}`, boxShadow: hex === c ? `0 0 0 2px ${C.gold}40` : "none" }} />
                      <div style={{ fontSize: 8, color: C.t3, marginTop: 3, fontFamily: "monospace" }}>{c.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 직접 입력 */}
      <div style={card}>
        <div style={ctitle}><IconColorCode />색상 코드로 검색</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.bd}`, background: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#333", flexShrink: 0, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }} />
          <input style={{ ...inp, flex: 1 }} value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#RRGGBB" maxLength={7} />
          <button style={{ ...btn(true, false), padding: "10px 16px" }} onClick={() => doMix()}>배합</button>
        </div>
      </div>

      {/* 프리셋 색상 */}
      <div style={card}>
        <div style={ctitle}><IconPresetColor />자주 쓰는 색상</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESET_COLORS.map((c, i) => (
            <div key={i} onClick={() => { setHex(c.hex); doMix(c.hex); }}
              style={{ cursor: "pointer", textAlign: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: c.hex, border: `2px solid ${hex === c.hex ? C.gold : C.bd}`, transition: "all 0.15s", boxShadow: hex === c.hex ? `0 0 0 2px ${C.gold}40` : "none" }} />
              <div style={{ fontSize: 9, color: C.t3, marginTop: 3 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 배합 결과 */}
      {mix && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ ...ctitle, margin: 0 }}><IconMixResult />배합 결과</span>
            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
              background: mix.accuracy >= 80 ? "rgba(76,175,80,0.15)" : mix.accuracy >= 50 ? "rgba(255,183,77,0.15)" : "rgba(229,115,115,0.15)",
              color: mix.accuracy >= 80 ? "#81c784" : mix.accuracy >= 50 ? "#ffb74d" : "#e57373",
              border: `1px solid ${mix.accuracy >= 80 ? "rgba(76,175,80,0.3)" : mix.accuracy >= 50 ? "rgba(255,183,77,0.3)" : "rgba(229,115,115,0.3)"}` }}>
              {mix.accuracy}% 일치
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 64, borderRadius: 10, background: hex, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 11, color: luminance(hex) > 0.5 ? "#333" : "#fff", textShadow: luminance(hex) > 0.5 ? "none" : "0 1px 3px rgba(0,0,0,0.5)", border: `1px solid ${C.bd}` }}>
              <span>목표색</span>
              <span style={{ fontSize: 9, opacity: 0.7, fontFamily: "monospace" }}>{hex}</span>
            </div>
            <div style={{ flex: 1, height: 64, borderRadius: 10, background: mix.resultHex, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 11, color: luminance(mix.resultHex) > 0.5 ? "#333" : "#fff", textShadow: luminance(mix.resultHex) > 0.5 ? "none" : "0 1px 3px rgba(0,0,0,0.5)", border: `1px solid ${C.bd}` }}>
              <span>배합 결과</span>
              <span style={{ fontSize: 9, opacity: 0.7, fontFamily: "monospace" }}>{mix.resultHex}</span>
            </div>
          </div>

          <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            {mix.recipe.map((r, i) => (
              <div key={i} style={{ flex: r.ratio, background: r.hex, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: luminance(r.hex) > 0.5 ? "#333" : "#fff", textShadow: luminance(r.hex) > 0.5 ? "none" : "0 1px 2px rgba(0,0,0,0.5)", minWidth: 28, fontWeight: 500 }}>
                {r.ratio}%
              </div>
            ))}
          </div>

          {mix.recipe.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < mix.recipe.length - 1 ? `1px solid rgba(139,115,85,0.12)` : "none" }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: r.hex, border: `1px solid ${C.bd}` }} />
              <span style={{ fontSize: 13, color: C.t1 }}>{r.name}</span>
              <span style={{ fontSize: 10, color: C.t3 }}>{r.hanja}</span>
              <span style={{ marginLeft: "auto", fontSize: 13, color: C.gold, fontWeight: 500 }}>{r.ratio}%</span>
            </div>
          ))}

          {mix.tips.length > 0 && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(196,162,101,0.08)", borderRadius: 8, border: `1px solid rgba(196,162,101,0.15)` }}>
              {mix.tips.map((t, i) => (
                <div key={i} style={{ fontSize: 11, color: C.t2, lineHeight: 1.6, padding: "2px 0" }}>{t}</div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{ ...btn(true, false), flex: 1 }} onClick={() => setRecipes([...recipes, { hex, ...mix }])}><IconSave />레시피 저장</button>
            <button style={{ ...btn(false, false), flex: 1 }} onClick={() => setRecs([...recs, { d: now(), t: `[배합] ${hex} → ${mix.recipe.map((x) => x.name + " " + x.ratio + "%").join("+")} (${mix.accuracy}%)` }])}>기록 저장</button>
          </div>
        </div>
      )}

      {/* 물감 팔레트 */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowPalette(!showPalette)}>
          <span style={{ ...ctitle, margin: 0 }}><IconPalette />동양화 물감 팔레트 ({PIG.length}종)</span>
          <span style={{ color: C.t3, transform: showPalette ? "rotate(180deg)" : "none", transition: "transform 0.3s", fontSize: 12 }}>▼</span>
        </div>
        {showPalette && (
          <div style={{ marginTop: 12 }}>
            {["기본", "적색", "황색", "갈색", "청색", "녹색", "보라"].map((cat) => {
              const items = PIG.filter((p) => p.cat === cat);
              if (!items.length) return null;
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: C.t3, marginBottom: 6, letterSpacing: 2 }}>{cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map((pg, i) => (
                      <div key={i} style={{ textAlign: "center", width: 52 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: pg.hex, border: `1px solid ${C.bd}`, margin: "0 auto" }} />
                        <div style={{ fontSize: 10, color: C.t2, marginTop: 3 }}>{pg.name}</div>
                        <div style={{ fontSize: 8, color: C.t3 }}>{pg.hanja}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 저장된 레시피 */}
      {recipes.length > 0 && (
        <div style={card}>
          <div style={ctitle}><IconSave />저장된 레시피</div>
          {recipes.map((r, i) => (
            <div key={i} style={{ ...ri, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: r.hex, border: `1px solid ${C.bd}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.t2 }}>{r.recipe.map((x) => x.name + " " + x.ratio + "%").join(" + ")}</div>
                <div style={{ fontSize: 9, color: C.t3, fontFamily: "monospace" }}>{r.hex}</div>
              </div>
              <button style={{ ...btn(false, true), padding: "5px 10px", fontSize: 11 }} onClick={() => setRecipes(recipes.filter((_, ri2) => ri2 !== i))}>삭제</button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ===== TAB 2: 기록 =====
  const T2 = () =>
    recs.length === 0
      ? <div style={{ textAlign: "center", padding: "40px 20px", color: C.t3 }}><div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={C.t3} strokeWidth="1.5"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke={C.t3} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></svg></div><div style={{ fontSize: 13 }}>아직 기록이 없습니다</div><div style={{ fontSize: 11, marginTop: 4 }}>계산이나 배합 후 기록을 저장해보세요</div></div>
      : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button style={btn(false, true)} onClick={() => { if (confirm("모든 기록을 삭제하시겠습니까?")) setRecs([]); }}>전체 삭제</button>
          </div>
          {[...recs].reverse().map((r, i) => (
            <div key={i} style={ri}>
              <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>{r.d}</div>
              <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{r.t}</div>
            </div>
          ))}
        </>
      );

  // ===== TAB 3: 메모 =====
  const T3 = () => (
    <>
      <div style={card}>
        <div style={ctitle}><IconMemo />새 메모</div>
        <textarea style={{ ...inp, minHeight: 100, resize: "vertical" }} value={mt} onChange={(e) => setMt(e.target.value)} placeholder="작업 노트를 자유롭게 적어보세요..." />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btn(true, false)} onClick={() => { if (!mt.trim()) return; setMemos([...memos, { d: now(), t: mt.trim() }]); setMt(""); }}>저장</button>
        </div>
      </div>
      {memos.length > 0
        ? [...memos].reverse().map((m, i) => {
            const idx = memos.length - 1 - i;
            return (
              <div key={i} style={ri}>
                <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>{m.d}</div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.t}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                  <button style={{ ...btn(false, true), padding: "5px 10px", fontSize: 11 }} onClick={() => setMemos(memos.filter((_, mi) => mi !== idx))}>삭제</button>
                </div>
              </div>
            );
          })
        : <div style={{ textAlign: "center", padding: "40px 20px", color: C.t3 }}><div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={C.t3} strokeWidth="1.5" strokeLinecap="round"/></svg></div><div style={{ fontSize: 13 }}>메모가 없습니다</div></div>
      }
    </>
  );

  const tabs = ["아교포수", "컬러배합", "기록", "메모"];
  const TabIcon = ({ index, active }) => {
    const clr = active ? C.gold : C.t3;
    const svgs = [
      // 아교포수 - 저울/물방울
      <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v18" stroke={clr} strokeWidth="1.5" strokeLinecap="round"/><path d="M3 7l9-4 9 4" stroke={clr} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 7c0 2 2 4 4.5 4S12 9 12 7" stroke={clr} strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/><path d="M12 7c0 2 2 4 4.5 4S21 9 21 7" stroke={clr} strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/><path d="M9 21h6" stroke={clr} strokeWidth="1.5" strokeLinecap="round"/></svg>,
      // 컬러배합 - 겹치는 원
      <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6" stroke={clr} strokeWidth="1.5" opacity="0.7"/><circle cx="14" cy="14" r="6" stroke={clr} strokeWidth="1.5" opacity="0.7"/></svg>,
      // 기록 - 문서
      <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={clr} strokeWidth="1.5"/><path d="M14 2v6h6" stroke={clr} strokeWidth="1.5" strokeLinecap="round"/><path d="M8 13h8M8 17h5" stroke={clr} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/></svg>,
      // 메모 - 펜
      <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke={clr} strokeWidth="1.5" strokeLinecap="round"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={clr} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    ];
    return svgs[index];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: C.bg, fontFamily: "'Noto Serif KR',Georgia,serif", color: C.t1, maxWidth: 480, margin: "0 auto", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", textAlign: "center", borderBottom: `1px solid ${C.bd}`, background: C.sf, flexShrink: 0, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}40, transparent)` }} />
        <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: 4, color: C.gold, margin: 0 }}>동양화 도구</h1>
        <p style={{ fontSize: 11, color: C.t3, marginTop: 3, letterSpacing: 1, margin: 0 }}>
          {["아교포수 계산기", "컬러배합", "사용 기록", "작업 메모"][tab]}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 14, paddingBottom: 84, WebkitOverflowScrolling: "touch" }}>
        {tab === 0 && T0()}
        {tab === 1 && T1()}
        {tab === 2 && T2()}
        {tab === 3 && T3()}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", background: C.sf, borderTop: `1px solid ${C.bd}`, flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        {tabs.map((name, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "10px 4px 8px", background: "none", border: "none",
            color: tab === i ? C.gold : C.t3, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
            borderTop: tab === i ? `2px solid ${C.gold}` : "2px solid transparent",
            transition: "all 0.15s",
          }}>
            <span style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><TabIcon index={i} active={tab === i} /></span>
            <span style={{ letterSpacing: 0.5 }}>{name}</span>
          </button>
        ))}
      </div>

      {/* Custom preset modal */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: C.cd, borderRadius: "18px 18px 0 0", padding: 22, paddingBottom: "calc(22px + env(safe-area-inset-bottom,0px))" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.bd, margin: "0 auto 16px" }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: C.gold, marginBottom: 18, textAlign: "center" }}>나만의 비율 추가</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.t2, marginBottom: 6 }}>이름</div>
              <input style={inp} value={cn} onChange={(e) => setCn(e.target.value)} placeholder="예: 두꺼운 종이용" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: C.t2, marginBottom: 6 }}>비율 (아교:물 = 1:?)</div>
              <input style={inp} type="number" min={1} max={50} value={cr} onChange={(e) => setCr(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btn(false, false), flex: 1, padding: "12px" }} onClick={() => setModal(false)}>취소</button>
              <button style={{ ...btn(true, false), flex: 1, padding: "12px" }} onClick={() => { if (!cn.trim() || !cr) return; setCp([...cp, { name: cn.trim(), ratio: +cr }]); setModal(false); }}>추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
