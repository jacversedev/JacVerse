const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rt = (s) => { s = String(s == null ? "" : s); return /<[a-z!][\s\S]*>/i.test(s) ? s : esc(s).replace(/\n/g, "<br>"); };
const root = document.documentElement;
const MODE = { study: "Study", notes: "Notes", mcq: "MCQ", test: "Self Test", pyq: "PYQ" };
const SEC = { oneShot: ["📖", "One-Shot Revision", "One-Shot"], mcq: ["📝", "MCQ", "MCQ"], questionAnswer: ["📚", "Question Answer", "Q&A"], examFocus: ["🎯", "Exam Focus", "Exam Focus"], notes: ["📒", "Notes", "Notes"] };
const SOON = "Is section ka content jald aayega.";
let DB = { classes: [], updates: [], studyMaterial: [], pages: {} }, NODE = {}, DUPS = [], T = null;


/* ---------- Opening animation, theme, menu, toast ---------- */
let started = false;
function startSite() {
  if (started) return;
  started = true;
  $("splash").classList.add("hide");
  document.body.classList.add("ready");
}
Promise.all([new Promise((r) => setTimeout(r, 2000)), new Promise((r) => window.addEventListener("load", r))]).then(startSite);
setTimeout(startSite, 6000);
try { const s = localStorage.getItem("jv-theme"); if (s) root.dataset.theme = s; } catch (e) {}
function paintTheme() {
  const light = root.dataset.theme === "light";
  $("themeBtn").textContent = light ? "☀️" : "🌙";
  $("drawerTheme").textContent = light ? "☀️ Light Mode" : "🌙 Dark Mode";
}
function toggleTheme() {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("jv-theme", root.dataset.theme); } catch (e) {}
  paintTheme();
}
paintTheme();
$("themeBtn").onclick = toggleTheme;
$("drawerTheme").onclick = (e) => { e.preventDefault(); toggleTheme(); };
const menu = (open) => { $("drawer").classList.toggle("open", open); $("overlay").classList.toggle("show", open); };
$("menuBtn").onclick = () => menu(true);
$("overlay").onclick = () => menu(false);
$("drawer").onclick = () => menu(false);
let timer;
function toast(m) {
  $("toast").textContent = m;
  $("toast").classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => $("toast").classList.remove("show"), 1800);
}


/* ---------- Data: every Class, Subject, Book, Part, Chapter, PYQ has a unique id ---------- */
function indexDB() {
  NODE = {}; DUPS = [];
  const add = (d, type, parent) => {
    if (!d.id || NODE[d.id]) DUPS.push(d.id || "(id missing: " + (d.name || d.year || "?") + ")");
    NODE[d.id] = { d, type, parent };
  };
  const addCh = (h, parent) => { h.sections = h.sections || {}; add(h, "chapter", parent); };
  DB.classes.forEach((c) => {
    c.subjects = c.subjects || [];
    add(c, "class", null);
    c.subjects.forEach((s) => {
      s.books = s.books || []; s.pyq = s.pyq || [];
      add(s, "subject", c.id);
      s.pyq.forEach((p) => add(p, "pyq", s.id));
      s.books.forEach((b) => {
        b.parts = b.parts || []; b.chapters = b.chapters || [];
        add(b, "book", s.id);
        b.parts.forEach((p) => { p.chapters = p.chapters || []; add(p, "part", b.id); p.chapters.forEach((h) => addCh(h, p.id)); });
        b.chapters.forEach((h) => addCh(h, b.id));
      });
    });
  });
}
const up = (n, type) => { while (n && n.type !== type) n = n.parent && NODE[n.parent]; return n; };
const chaptersOf = (b) => (b.parts.length ? b.parts.reduce((a, p) => a.concat(p.chapters), []) : b.chapters);
const chCount = (s) => s.books.reduce((n, b) => n + chaptersOf(b).length, 0);
const secOf = (h, k) => (h.sections && h.sections[k]) || [];
const avail = (h) => Object.keys(SEC).filter((k) => secOf(h, k).length).map((k) => SEC[k][2]).join(" • ") || "Content jald aayega";
const listNode = (n) => { const b = up(n, "book"), s = NODE[b.parent]; return s.d.books.length === 1 ? s : b; };
function ansIndex(q) {
  const a = String(q.answer == null ? "" : q.answer).trim(), o = q.options || [];
  let k = o.findIndex((x) => String(x).trim() === a);
  if (k < 0 && /^[A-Da-d]$/.test(a)) k = "abcd".indexOf(a.toLowerCase());
  return k < 0 || k >= o.length ? -1 : k;
}


/* ---------- Reusable templates ---------- */
const empty = (m) => `<div class="empty glass">${m}</div>`;
const notFound = () => empty("Page nahi mila.") + `<a class="btn" href="#/">Home</a>`;
const row = (href, title, ...subs) => `<a class="row glass" href="${href}"><b>${esc(title)}</b>${subs.filter(Boolean).map((s) => `<small>${esc(s)}</small>`).join("")}</a>`;
const card = (href, icon, name, small, i) => `<a class="card glass" style="--i:${i}" href="${href}"><b>${icon}</b><h3>${esc(name)}</h3>${small ? `<small>${esc(small)}</small>` : ""}</a>`;
const crumbs = (l) => `<div class="crumbs">` + l.map(([t, h], i) => (i < l.length - 1 ? `<a href="${h}">${esc(t)}</a><span>›</span>` : `<em>${esc(t)}</em>`)).join("") + `</div>`;
function trail(m, n) {
  const l = [["Home", "#/"], [MODE[m], `#/${m}`]], chain = [];
  for (let x = n; x; x = x.parent && NODE[x.parent]) chain.unshift(x);
  chain.forEach((x) => {
    if (x.type === "part") return;
    if (x.type === "book" && NODE[x.parent].d.books.length === 1) return;
    l.push([x.d.name || x.d.year, `#/${m}/${x.d.id}`]);
  });
  return l;
}
const imgs = (a, alt) => (a || []).map((s) => `<img loading="lazy" src="${esc(s)}" alt="${esc(alt || "")}">`).join("");
const block = (x) => { const o = typeof x === "string" ? { content: x } : x; return `<div class="q glass">${o.title ? `<h3 class="sec" style="margin-top:0">${esc(o.title)}</h3>` : ""}<div class="rt">${rt(o.content)}</div>${imgs(o.images, o.title)}</div>`; };
const qaCard = (x) => `<div class="q glass"><div class="qt">${rt(x.question)}</div><details><summary>View Answer ▼</summary><div class="rt">${rt(x.answer)}</div></details></div>`;
const mcqCard = (q, i, test) => `<div class="q glass" data-ans="${ansIndex(q)}" data-why="${esc(q.explanation || "")}">
  <div class="qt">${i}. ${rt(q.question)}</div>
  ${(q.options || []).map((o, k) => `<button class="opt" data-k="${k}"><i>${"ABCD"[k] || k + 1}</i><span>${rt(o)}</span></button>`).join("")}
  ${test ? "" : `<button class="btn check">Check Answer</button>`}<div class="why"></div></div>`;
function renderSection(k, h) {
  const a = secOf(h, k);
  if (!a.length) return empty(SOON);
  return k === "mcq" ? a.map((q, i) => mcqCard(q, i + 1)).join("") : k === "questionAnswer" || k === "examFocus" ? a.map(qaCard).join("") : a.map(block).join("");
}


/* ---------- Views ---------- */
const home = () => `<section class="hero glass"><img class="mark" src="assets/logos/logo-s.webp" alt="JacVerse" width="112" height="112">
  <small class="eyebrow">JAC BOARD • CLASS 9 &amp; 10</small><p class="tag">Learn • Practice • Success</p>
  <p class="desc">Notes, MCQ, PYQ aur Self Test, sab ek hi jagah. Free, tez, aur seedha tumhare phone par.</p>
  <a class="cta" href="#/study">Study shuru karo</a></section>
  <section class="grid">` +
  DB.classes.map((c, i) => card(`#/study/${c.id}`, c.icon, c.name, `${c.subjects.length} subjects`, i)).join("") +
  card("#/notes", "📝", "Notes", "Class → Subject → Chapter", 2) + card("#/mcq", "❓", "MCQ", "Chapter-wise practice", 3) + `</section>`;


const classPicker = (m) => crumbs([["Home", "#/"], [MODE[m]]]) + `<h2>${MODE[m]}: Class chuno</h2><section class="grid">` +
  DB.classes.map((c, i) => card(`#/${m}/${c.id}`, c.icon, c.name, `${c.subjects.length} subjects`, i)).join("") + `</section>`;


function chapterList(m, n, b) {
  let k = 0;
  const line = (h) => row(`#/${m}/${h.id}`, `${++k}. ${h.name}`, h.desc, avail(h));
  const body = b.parts.length ? b.parts.map((p) => `<h3 class="sec">${esc(p.name)}</h3>` + p.chapters.map(line).join("")).join("") : b.chapters.map(line).join("");
  return crumbs(trail(m, n)) + `<h2>${esc(n.d.name)}</h2>` + (b.desc && n.type === "book" ? `<p class="muted">${esc(b.desc)}</p>` : "") + (body || empty("Is book ke chapters jald aayenge."));
}
function pyqSubject(n) {
  const list = n.d.pyq.slice().sort((a, b) => String(b.year).localeCompare(String(a.year)));
  return crumbs(trail("pyq", n)) + `<h2>${esc(n.d.name)}: PYQ</h2>` +
    (list.length ? list.map((p) => row(`#/pyq/${p.id}`, `${p.year}`, `${(p.images || []).length} pages`)).join("") : empty("PYQ jald aayenge."));
}
const pyqPaper = (n) => crumbs(trail("pyq", n)) + `<h2>${esc(NODE[n.parent].d.name)} ${esc(n.d.year)}</h2>` +
  ((n.d.images || []).length ? n.d.images.map((s, i) => `<img class="paper" loading="lazy" src="${esc(s)}" alt="${esc(NODE[n.parent].d.name)} ${esc(n.d.year)} question paper page ${i + 1}">`).join("") : empty(SOON));


function navView(m, n) {
  const d = n.d;
  if (n.type === "class") return crumbs(trail(m, n)) + `<h2>${esc(d.name)}: Subject chuno</h2><section class="grid">` +
    d.subjects.map((s, i) => card(`#/${m}/${s.id}`, s.icon || "📚", s.name,
      m === "pyq" ? `${s.pyq.length} papers` : s.books.length > 1 ? `${s.books.length} books` : `${chCount(s)} chapters`, i)).join("") + `</section>`;
  if (n.type === "subject") {
    if (m === "pyq") return pyqSubject(n);
    if (d.books.length === 1) return chapterList(m, n, d.books[0]);
    return crumbs(trail(m, n)) + `<h2>${esc(d.name)}: Book chuno</h2>` + (d.books.length
      ? `<section class="grid">` + d.books.map((b, i) => card(`#/${m}/${b.id}`, b.icon || "📘", b.name, b.desc || `${chaptersOf(b).length} chapters`, i)).join("") + `</section>`
      : empty("Books jald aayengi."));
  }
  return n.type === "book" && m !== "pyq" ? chapterList(m, n, d) : notFound();
}


function chapterView(m, n, sec) {
  const h = n.d, head = (x) => crumbs(trail(m, n).concat(x ? [[x]] : [])) + `<h2>${esc(h.name)}</h2>`;
  if (m === "pyq") return notFound();
  if (m === "notes") return head() + renderSection("notes", h);
  if (m === "mcq") return head() + renderSection("mcq", h);
  if (m === "test") {
    const qs = secOf(h, "mcq").filter((q) => ansIndex(q) >= 0);
    if (!qs.length) return head() + empty("Is chapter mein abhi test ke liye MCQ nahi hain.");
    T = { n, qs, i: -1, log: [] };
    return testHtml();
  }
  if (SEC[sec]) return head(SEC[sec][1]) + `<h3 class="sec">${SEC[sec][0]} ${SEC[sec][1]}</h3>` + renderSection(sec, h);
  return head() + (h.desc ? `<p class="note">${esc(h.desc)}</p>` : "") + `<section class="grid">` +
    Object.keys(SEC).map((k, i) => card(`#/study/${h.id}/${k}`, SEC[k][0], SEC[k][1], secOf(h, k).length ? "Available" : "Jald aayega", i)).join("") + `</section>`;
}


function testHtml() {
  const { n, qs } = T, top = crumbs(trail("test", n)), back = `#/test/${listNode(n).d.id}`;
  if (T.i < 0) return top + `<h2>Self Test</h2><div class="q glass"><h3 class="sec" style="margin-top:0">Test Instructions</h3>
    <p class="note">Total questions: ${qs.length}<br>Har question mein ek hi sahi option hai.<br>Option chuno aur Next dabao. Aakhri question ke baad Submit dabane par score dikhega.</p></div>
    <button class="btn" id="start">Start Test</button>`;
  if (T.i < qs.length) return top + `<p class="muted">Question ${T.i + 1} / ${qs.length}</p><div class="bar2"><span style="width:${(T.i / qs.length) * 100}%"></span></div>` +
    mcqCard(qs[T.i], T.i + 1, true) + `<button class="btn" id="next">${T.i + 1 < qs.length ? "Next" : "Submit"}</button>`;
  const right = T.log.filter((l) => l.ok).length, pct = Math.round((right / qs.length) * 100);
  return top + `<h2>Score</h2><div class="hero glass score"><h1>${right} / ${qs.length}</h1><p class="desc">${pct}% sahi</p></div>
    <div class="stats"><div class="glass"><b>${qs.length}</b><small>Total</small></div><div class="glass"><b>${right}</b><small>Correct</small></div><div class="glass"><b>${qs.length - right}</b><small>Incorrect</small></div></div>
    <h3 class="sec">Question Review</h3>` +
    T.log.map((l, i) => `<div class="q glass"><div class="qt">${i + 1}. ${rt(l.q)}</div><div class="${l.ok ? "ok" : "bad"}">Tumhara jawab: ${rt(l.you)}</div>${l.ok ? "" : `<div class="ok">Sahi jawab: ${rt(l.right)}</div>`}</div>`).join("") +
    `<button class="btn" id="retry">Retry Test</button><a class="btn" href="${back}">Back to Chapters</a>`;
}
const testView = () => { $("app").innerHTML = testHtml(); window.scrollTo(0, 0); };


const updatesView = () => crumbs([["Home", "#/"], ["Updates"]]) + `<h2>Updates</h2>` + (DB.updates.length
  ? DB.updates.map((u) => `<div class="q glass">${u.image ? `<img loading="lazy" src="${esc(u.image)}" alt="${esc(u.title)}">` : ""}<p class="muted">${esc(u.date)}</p><p class="qt">${esc(u.title)}</p>${u.link ? `<a class="btn" href="${esc(u.link)}" target="_blank" rel="noopener">Official link kholo</a>` : ""}</div>`).join("")
  : empty("Abhi koi update nahi hai."));


const materialView = () => crumbs([["Home", "#/"], ["Study Material"]]) + `<h2>Study Material</h2>` + (DB.studyMaterial.length
  ? DB.studyMaterial.map((p) => `<div class="q glass">${p.image ? `<img loading="lazy" src="${esc(p.image)}" alt="${esc(p.title)}">` : ""}${p.type ? `<span class="pill">${esc(p.type)}</span>` : ""}${p.affiliate ? `<span class="pill">Affiliate link</span>` : ""}
    <p class="qt">${esc(p.title)}</p><div class="rt">${rt(p.description)}</div>${p.link ? `<a class="btn" href="${esc(p.link)}" target="_blank" rel="${p.affiliate ? "sponsored " : ""}noopener">Dekho</a>` : ""}</div>`).join("")
  : empty("Study material jald aayega."));


const pageView = (k) => {
  const p = DB.pages[k];
  return p ? crumbs([["Home", "#/"], [p.title]]) + `<h2>${esc(p.title)}</h2>` + (p.body && p.body.length ? p.body.map(block).join("") : empty(SOON)) : notFound();
};


/* ---------- Router: #/mode/id/section, id = Class, Subject, Book or Chapter ---------- */
function view(a, b, c) {
  if (!a) return home();
  if (a === "updates") return updatesView();
  if (a === "material") return materialView();
  if (a === "page") return pageView(b);
  if (!MODE[a]) return notFound();
  if (!b) return classPicker(a);
  const n = NODE[b];
  if (!n) return notFound();
  if (n.type === "chapter") return chapterView(a, n, c);
  if (n.type === "pyq") return a === "pyq" ? pyqPaper(n) : notFound();
  return navView(a, n);
}
function route() {
  if (!DB.classes.length) return;
  const p = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  T = null;
  $("app").innerHTML = (DUPS.length ? empty("⚠️ Duplicate ya missing ID: " + esc(DUPS.join(", "))) : "") + view(p[0], p[1], p[2]);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);


/* ---------- MCQ and test clicks ---------- */
document.addEventListener("click", (ev) => {
  const t = ev.target, o = t.closest(".opt");
  if (o) {
    const q = o.closest(".q");
    if (q.dataset.done) return;
    q.querySelectorAll(".opt").forEach((b) => b.classList.remove("sel"));
    o.classList.add("sel");
    q.dataset.sel = o.dataset.k;
  } else if (t.classList.contains("check")) {
    const q = t.closest(".q");
    if (q.dataset.sel === undefined) return toast("Pehle ek option chuno");
    q.dataset.done = 1;
    const ans = +q.dataset.ans, k = +q.dataset.sel, opts = q.querySelectorAll(".opt");
    if (ans >= 0) { opts[ans].classList.add("right"); if (k !== ans) opts[k].classList.add("wrong"); }
    q.querySelector(".why").innerHTML = (ans < 0 ? "" : k === ans ? "✅ Sahi jawab! " : "❌ Galat jawab. ") + rt(q.dataset.why);
    t.remove();
  } else if (t.id === "start") { T.i = 0; testView(); }
  else if (t.id === "retry") { T.i = 0; T.log = []; testView(); }
  else if (t.id === "next") {
    const q = document.querySelector(".q");
    if (q.dataset.sel === undefined) return toast("Pehle ek option chuno");
    const cur = T.qs[T.i], k = +q.dataset.sel, a = ansIndex(cur);
    T.log.push({ q: cur.question, you: cur.options[k], right: cur.options[a], ok: k === a });
    T.i++;
    testView();
  }
});


/* ---------- Start ---------- */
function setup(data) {
  DB = data;
  DB.classes = DB.classes || [];
  DB.updates = DB.updates || [];
  DB.studyMaterial = DB.studyMaterial || [];
  DB.pages = DB.pages || {};
  indexDB();
  route();
}
fetch("database.json")
  .then((r) => r.json())
  .then(setup)
  .catch((e) => ($("app").innerHTML = empty("database.json load nahi hua. Agar tumne abhi content daala hai, to kahin comma ya quote galat ho sakta hai.<br><small>" + esc(e.message) + "</small>")));