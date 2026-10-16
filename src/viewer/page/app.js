// Viewer page: asks the guard to score every chunk, then draws one bar per chunk.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const detail = document.getElementById("detail");
const verdict = document.getElementById("verdict");
const totals = document.getElementById("totals");
const area = document.getElementById("text");

let chunks = [];
let bars = [];

function colourFor(safety) {
  const red = [192, 57, 43];
  const amber = [217, 164, 65];
  const green = [79, 138, 91];
  const [from, to, part] =
    safety < 0.5 ? [red, amber, safety / 0.5] : [amber, green, (safety - 0.5) / 0.5];
  const mix = from.map((value, at) => Math.round(value + (to[at] - value) * part));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

function draw() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  if (chunks.length === 0) {
    return;
  }

  const pad = { left: 46, right: 46, top: 18, bottom: 28 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const slot = plotW / chunks.length;
  const slowest = Math.max(...chunks.map((chunk) => chunk.ms), 1);

  ctx.strokeStyle = "#e3e0d5";
  ctx.fillStyle = "#73726c";
  ctx.font = "11px system-ui, sans-serif";
  ctx.lineWidth = 1;
  for (const mark of [0, 0.5, 1]) {
    const y = pad.top + plotH - mark * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(mark.toFixed(1), pad.left - 8, y + 4);
  }

  bars = chunks.map((chunk, at) => {
    const x = pad.left + at * slot + slot * 0.15;
    const w = Math.max(2, slot * 0.7);
    const h = Math.max(2, chunk.safety * plotH);
    const y = pad.top + plotH - h;
    ctx.fillStyle = colourFor(chunk.safety);
    ctx.fillRect(x, y, w, h);
    return { x, y, w, h, chunk };
  });

  ctx.strokeStyle = "#1f1e1d";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  chunks.forEach((chunk, at) => {
    const x = pad.left + at * slot + slot / 2;
    const y = pad.top + plotH - (chunk.ms / slowest) * plotH;
    if (at === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = "#73726c";
  ctx.textAlign = "left";
  ctx.fillText(`${slowest} ms`, width - pad.right + 6, pad.top + 4);
  ctx.textAlign = "center";
  ctx.fillText("chunk", width / 2, height - 8);
}

async function scan() {
  verdict.textContent = "scanning";
  verdict.className = "verdict";
  const answer = await fetch("/scan", { method: "POST", body: area.value });
  const found = await answer.json();
  chunks = found.chunks;
  verdict.textContent = found.allowed ? "PASS" : "REJECTED";
  verdict.className = `verdict ${found.allowed ? "pass" : "reject"}`;
  const reds = chunks.filter((chunk) => !chunk.allowed).length;
  totals.textContent = `${found.chars} chars · ${chunks.length} chunks · ${reds} flagged · ${found.ms} ms total`;
  draw();
}

canvas.addEventListener("mousemove", (event) => {
  const box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  const hit = bars.find((bar) => x >= bar.x && x <= bar.x + bar.w && y >= bar.y - 6);
  detail.textContent = hit
    ? `#${hit.chunk.at}  from ${hit.chunk.from}  ${hit.chunk.chars} chars  score ${hit.chunk.safety.toFixed(4)}  ${hit.chunk.ms} ms  "${hit.chunk.start}"`
    : "hover a bar";
});

document.getElementById("scan").addEventListener("click", scan);
window.addEventListener("resize", draw);
draw();
