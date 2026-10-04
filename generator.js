// JacVerse generator: database.json -> asli HTML pages (generated/) + sitemap.xml
// GitHub Actions ise apne aap chalata hai. Tumhe kuch nahi karna.
const fs = require("fs"), path = require("path");
const OUT = "_site";
const db = JSON.parse(fs.readFileSync("database.json", "utf8"));
const SITE = ((db.site && db.site.url) || "https://jacversedev.github.io/JacVerse/").replace(/\/*$/, "/");
const G = SITE + "generated/";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rt = (s) => { s = String(s == null ? "" : s); return /<[a-z!][\s\S]*>/i.test(s) ? s : esc(s).replace(/\n/g, "<br>"); };
const abs = (p) => (/^(https?:)?\/\//.test(p) ? p : SITE + String(p).replace(/^\/+/, ""));
const SEC = { oneShot: ["one-shot", "One-Shot Revision"], mcq: ["mcq", "MCQ"], questionAnswer: ["question-answer", "Question Answer"], examFocus: ["exam-focus", "Exam Focus"], notes: ["notes", "Notes"] };
const sec = (h, k) => (h.sections && h.sections[k]) || [];
const have = (h) => Object.keys(SEC).filter((k) => sec(h, k).length);
const chaptersOf = (b) => ((b.parts || []).length ? b.parts.reduce((a, p) => a.concat(p.chapters || []), []) : b.chapters || []);
const urls = [SITE];


function ansIndex(q) {
  const a = String(q.answer == null ? "" : q.answer).trim(), o = q.options || [];
  let k = o.findIndex((x) => String(x).trim() === a);
  if (k < 0 && /^[A-Da-d]$/.test(a)) k = "abcd".indexOf(a.toLowerCase());
  return k < 0 || k >= o.length ? -1 : k;
}


fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const f of fs.readdirSync(".")) {
  if (f.startsWith(".") || f.endsWith(".md") || ["_site", "node_modules", "generator.js", "build.js", "build.yml"].includes(f)) continue;
  fs.cpSync(f, path.join(OUT, f), { recursive: true });
}


function page(rel, title, desc, crumbs, body) {
  const url = G + rel, dir = path.join(OUT, "generated", rel);
  fs.mkdirSync(dir, { recursive: true });
  const trail = crumbs.map(([t, h], i) => (i < crumbs.length - 1 ? `<a href="${h}">${esc(t)}</a><span>›</span>` : `<em>${esc(t)}</em>`)).join("");
  fs.writeFileSync(path.join(dir, "index.html"), `<!DOCTYPE html>
<html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}assets/logos/logo.webp">
<link rel="icon" href="${SITE}assets/logos/logo-s.webp">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="${SITE}style.css">
<script>try{var t=localStorage.getItem("jv-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head><body>
<header><div class="bar" style="justify-content:center"><a class="brand" href="${SITE}"><img src="${SITE}assets/logos/logo-s.webp" alt="" width="36" height="36">Jac<em>Verse</em></a></div></header>
<main class="pg"><div class="crumbs">${trail}</div>${body}</main>
</body></html>`);
  urls.push(url);
}


const row = (href, t, sub) => `<a class="row glass" href="${href}"><b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</a>`;
const block = (x) => { const o = typeof x === "string" ? { content: x } : x; return `<div class="q glass">${o.title ? `<h2 class="sec">${esc(o.title)}</h2>` : ""}<div class="rt">${rt(o.content)}</div>${(o.images || []).map((s) => `<img loading="lazy" src="${esc(abs(s))}" alt="${esc(o.title || "")}">`).join("")}</div>`; };
const qa = (x) => `<div class="q glass"><div class="qt">${rt(x.question)}</div><div class="rt">${rt(x.answer)}</div></div>`;
const mcq = (q, i) => { const a = ansIndex(q); return `<div class="q glass"><div class="qt">${i + 1}. ${rt(q.question)}</div><ol type="A">${(q.options || []).map((o) => `<li>${rt(o)}</li>`).join("")}</ol>${a >= 0 ? `<details><summary>Answer dekho</summary><div class="rt"><b>Sahi jawab: ${"ABCD"[a]}</b>${q.explanation ? `<p>${rt(q.explanation)}</p>` : ""}</div></details>` : ""}</div>`; };
const BODY = { oneShot: (h) => sec(h, "oneShot").map(block).join(""), notes: (h) => sec(h, "notes").map(block).join(""), mcq: (h) => sec(h, "mcq").map(mcq).join(""), questionAnswer: (h) => sec(h, "questionAnswer").map(qa).join(""), examFocus: (h) => sec(h, "examFocus").map(qa).join("") };
const APP = (h, k) => "#/" + (k === "notes" ? `notes/${h.id}` : k === "mcq" ? `mcq/${h.id}` : `study/${h.id}/${k}`);


const classRows = [];
db.classes.forEach((c) => {
  const subRows = [];
  (c.subjects || []).forEach((s) => {
    const sRel = `${c.id}/${s.id}/`, groups = [];
    const base = [["JacVerse", SITE], ["Study", G], [c.name, `${G}${c.id}/`], [s.name, G + sRel]];
    (s.books || []).forEach((b) => {
      const rows = [];
      chaptersOf(b).forEach((h) => {
        const ks = have(h);
        if (!ks.length) return;
        const hRel = `${sRel}${h.id}/`;
        ks.forEach((k) => page(`${hRel}${SEC[k][0]}/`, `${h.name} ${SEC[k][1]} | ${c.name} ${s.name} | JAC Board | JacVerse`,
          `${h.name} ka ${SEC[k][1]}: ${c.name} ${s.name} (${b.name}), JAC Board. Free study material JacVerse par.`,
          base.concat([[h.name, G + hRel], [SEC[k][1]]]),
          `<h1 class="pt">${esc(h.name)}: ${SEC[k][1]}</h1><p class="muted">${esc(c.name)} • ${esc(s.name)} • ${esc(b.name)} • JAC Board</p>${BODY[k](h)}<a class="btn" href="${SITE}${APP(h, k)}">App mein practice karo</a>`));
        page(hRel, `${h.name} | ${c.name} ${s.name} | JAC Board | JacVerse`,
          `${h.name} (${c.name} ${s.name}, ${b.name}): ${ks.map((k) => SEC[k][1]).join(", ")}. Free study material JacVerse par.`,
          base.concat([[h.name]]),
          `<h1 class="pt">${esc(h.name)}</h1><p class="muted">${esc(c.name)} • ${esc(s.name)} • ${esc(b.name)}</p>${h.desc ? `<p class="note">${esc(h.desc)}</p>` : ""}${ks.map((k) => row(`${G}${hRel}${SEC[k][0]}/`, SEC[k][1])).join("")}`);
        rows.push(row(G + hRel, h.name, h.desc));
      });
      if (rows.length) groups.push(`<h2 class="sec">${esc(b.name)}</h2>` + rows.join(""));
    });
    const papers = (s.pyq || []).filter((p) => (p.images || []).length);
    if (papers.length) {
      papers.forEach((p) => page(`${sRel}pyq/${p.id}/`, `${s.name} ${p.year} PYQ Question Paper | ${c.name} | JAC Board | JacVerse`,
        `${c.name} ${s.name} ${p.year} ka JAC Board question paper (PYQ). Free, JacVerse par.`, base.concat([["PYQ", `${G}${sRel}pyq/`], [String(p.year)]]),
        `<h1 class="pt">${esc(s.name)} ${esc(p.year)}: Question Paper</h1>${p.images.map((im, i) => `<img class="paper" loading="lazy" src="${esc(abs(im))}" alt="${esc(c.name + " " + s.name + " " + p.year + " question paper page " + (i + 1))}">`).join("")}<a class="btn" href="${SITE}#/pyq/${p.id}">App mein kholo</a>`));
      page(`${sRel}pyq/`, `${s.name} PYQ | ${c.name} | JAC Board | JacVerse`, `${c.name} ${s.name} ke pichhle saal ke JAC Board question papers (PYQ).`,
        base.concat([["PYQ"]]), `<h1 class="pt">${esc(s.name)}: PYQ</h1>${papers.map((p) => row(`${G}${sRel}pyq/${p.id}/`, String(p.year), `${p.images.length} pages`)).join("")}`);
      groups.push(`<h2 class="sec">PYQ</h2>` + row(`${G}${sRel}pyq/`, "Question papers", `${papers.length} papers`));
    }
    if (groups.length) {
      page(sRel, `${s.name} | ${c.name} | JAC Board | JacVerse`, `${c.name} ${s.name} ke chapters: notes, MCQ, question answer aur PYQ. JAC Board ke liye free.`,
        base, `<h1 class="pt">${esc(c.name)}: ${esc(s.name)}</h1>${groups.join("")}`);
      subRows.push(row(G + sRel, s.name));
    }
  });
  if (subRows.length) {
    page(`${c.id}/`, `${c.name} | JAC Board Study Material | JacVerse`, `${c.name} JAC Board ke subjects aur chapters: free notes, MCQ, PYQ aur question answer.`,
      [["JacVerse", SITE], ["Study", G], [c.name]], `<h1 class="pt">${esc(c.name)}</h1>${subRows.join("")}`);
    classRows.push(row(`${G}${c.id}/`, c.name));
  }
});
if (classRows.length) page("", "JAC Board Class 9 & 10 Study Material | JacVerse", "JAC Board Class 9 aur 10 ke free notes, MCQ, PYQ aur question answer, JacVerse par.",
  [["JacVerse", SITE], ["Study"]], `<h1 class="pt">Study Material</h1>${classRows.join("")}`);


const day = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc><lastmod>${day}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log(urls.length + " pages ready");