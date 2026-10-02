const $ = (id) => document.getElementById(id);
const root = document.documentElement;


/* 1. Opening Animation Fix */
function startSite() {
  const splash = $("splash");
  if (splash) splash.classList.add("hide");
  document.body.classList.add("ready");
}


if (document.readyState === "complete") {
  setTimeout(startSite, 1000);
} else {
  window.addEventListener("load", () => setTimeout(startSite, 1500));
}


/* 2. Theme Switcher */
try { 
  const s = localStorage.getItem("jv-theme"); 
  if (s) root.dataset.theme = s; 
} catch (e) {}


function paintTheme() {
  const light = root.dataset.theme === "light";
  if ($("themeBtn")) $("themeBtn").textContent = light ? "☀️" : "🌙";
  if ($("drawerTheme")) $("drawerTheme").textContent = light ? "☀️ Light Mode" : "🌙 Dark Mode";
}


function toggleTheme() {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("jv-theme", root.dataset.theme); } catch (e) {}
  paintTheme();
}


paintTheme();


if ($("themeBtn")) $("themeBtn").onclick = toggleTheme;
if ($("drawerTheme")) $("drawerTheme").onclick = (e) => { e.preventDefault(); toggleTheme(); };


/* 3. Side Menu Drawer Fix */
const menu = (open) => {
  if ($("drawer")) $("drawer").classList.toggle("open", open);
  if ($("overlay")) $("overlay").classList.toggle("show", open);
};


if ($("menuBtn")) $("menuBtn").onclick = () => menu(true);
if ($("overlay")) $("overlay").onclick = () => menu(false);


/* 4. Under Construction Toast Message */
let timer;
function soon(e) {
  e.preventDefault();
  if ($("toast")) {
    $("toast").classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => $("toast").classList.remove("show"), 1800);
  }
}


function bindSoon(scope) {
  scope.querySelectorAll("[data-soon]").forEach((el) => el.addEventListener("click", soon));
}
bindSoon(document);


/* 5. Safe Fetch Database JSON */
let index = [];
fetch("database.json")
  .then((r) => {
    if (!r.ok) throw new Error("JSON file missing");
    return r.json();
  })
  .then((db) => {
    if (db && db.classes) {
      db.classes.forEach((c) => {
        const label = document.querySelector(`[data-sub="${c.id}"]`);
        if (label) label.textContent = `${c.subjects.length} subjects`;
        index.push(c.name);
        c.subjects.forEach((s) => {
          index.push(`${c.name} ${s.name}`);
          (s.books || []).forEach((b) => index.push(`${c.name} ${s.name} ${b}`));
        });
      });
    }
  })
  .catch((err) => console.log("Database file fetch skipped or missing."));


/* 6. Live Search */
if ($("q")) {
  $("q").addEventListener("input", (e) => {
    const words = e.target.value.toLowerCase().split(/\s+/).filter(Boolean);
    const box = $("results");
    if (!box) return;
    box.innerHTML = "";
    if (!words.length) return;


    index
      .filter((t) => words.every((w) => t.toLowerCase().includes(w)))
      .slice(0, 6)
      .forEach((t) => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = t;
        a.addEventListener("click", (ev) => { soon(ev); box.innerHTML = ""; });
        box.appendChild(a);
      });
  });
}