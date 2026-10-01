/* ShopNova v4 */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const splash = $("#splash"), gate = $("#gate");

/* ---- welcome -> login -> home ---- */
document.body.classList.add("gated");
function openHome() {
  document.body.classList.remove("gated");
  document.body.classList.add("ready");
  gate.classList.remove("show");
  try { sessionStorage.setItem("shopnovaGate", "1"); } catch (e) {}
  setTimeout(() => gate.remove(), 800);
}
setTimeout(() => {
  splash.classList.add("hide");
  setTimeout(() => splash.remove(), 900);
  let seen = false;
  try { seen = localStorage.getItem("shopnovaUser") || sessionStorage.getItem("shopnovaGate"); } catch (e) {}
  seen ? openHome() : gate.classList.add("show");
}, 2700);

$$(".g-tab").forEach(t => t.onclick = () => {
  $$(".g-tab").forEach(x => x.classList.toggle("active", x === t));
  $$(".g-form").forEach(f => f.classList.toggle("active", f.dataset.f === t.dataset.t));
  $(".g-err").textContent = "";
});
$$(".g-form").forEach(f => f.onsubmit = e => {
  e.preventDefault();
  const v = $$("input", f).map(i => i.value.trim()), err = $(".g-err");
  if (v.some(x => !x)) { err.textContent = "Please fill in all fields"; return; }
  if (f.dataset.f === "up" && v[2].length < 4) { err.textContent = "Password must be at least 4 characters"; return; }
  const name = f.dataset.f === "up" ? v[0] : (v[0].includes("@") ? v[0].split("@")[0] : v[0]);
  setLoggedInUser(name);
  openHome();
  setTimeout(() => showToast(`Welcome, ${name}! 🎉`), 900);
});
$("#gGuest").onclick = openHome;

/* ---- new front hero + category rail ---- */
const pick = [1, 5, 9].map(id => products.find(p => p.id === id)).filter(Boolean);
const front = document.createElement("section");
front.className = "front-hero";
front.innerHTML = `
<div class="fh-bg"><i></i><i></i><i></i></div>
<div class="fh-inner">
  <div class="fh-text">
    <span class="fh-pill"><i class="fa-solid fa-fire"></i> Mega Sale is LIVE · Up to 50% OFF</span>
    <h1>Find everything you love, at <span class="grad">unbeatable prices</span></h1>
    <p>Fashion, electronics, home &amp; beauty for the whole family. Free delivery above ₹999.</p>
    <form class="fh-search" id="fhForm">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="fhInput" type="search" autocomplete="off" placeholder="Search for products...">
      <select id="fhCat"><option value="all">All</option><option value="fashion">Fashion</option><option value="electronics">Electronics</option><option value="shoes">Shoes</option><option value="beauty">Beauty</option><option value="home">Home</option><option value="gaming">Gaming</option><option value="books">Books</option></select>
      <button type="submit">Search</button>
    </form>
    <div class="fh-trend"><b>Trending:</b>${["Dress", "Sneakers", "Headphones", "Saree", "Watch", "Jacket"].map(t => `<button type="button" data-q="${t}">${t}</button>`).join("")}</div>
    <div class="fh-stats"><div><strong>100+</strong><span>Products</span></div><div><strong>4.7★</strong><span>Avg rating</span></div><div><strong>50%</strong><span>Max OFF</span></div></div>
  </div>
  <div class="fh-visual">${pick.map((p, i) => `<div class="fh-card c${i + 1}" data-product="${p.id}"><img src="${p.image}" alt="${p.name}"><span>${formatPrice(p.price)}</span></div>`).join("")}</div>
</div>`;
const rail = document.createElement("section");
rail.className = "cat-rail";
rail.innerHTML = [["all", "🛍️", "All"], ["fashion", "👗", "Fashion"], ["electronics", "💻", "Electronics"], ["shoes", "👟", "Shoes"], ["beauty", "💄", "Beauty"], ["home", "🛋️", "Home"], ["gaming", "🎮", "Gaming"], ["books", "📚", "Books"], ["innerwear", "🩱", "Innerwear"]]
  .map(([k, e, t]) => `<button data-category="${k}"><span>${e}</span>${t}</button>`).join("");
$("#heroAd").before(front, rail);

function go(q, c) {
  searchInput.value = q; searchCategory.value = c || "all";
  performSearch();
}
$("#fhForm").onsubmit = e => { e.preventDefault(); go($("#fhInput").value.trim(), $("#fhCat").value); };
$$(".fh-trend button").forEach(b => b.onclick = () => { $("#fhInput").value = b.dataset.q; go(b.dataset.q, "all"); });

/* ---- typing placeholder animation ---- */
function typer(inp, words) {
  let w = 0, c = 0, del = false;
  (function tick() {
    let wait = del ? 35 : 85;
    if (document.activeElement !== inp && !inp.value) {
      const t = words[w];
      c += del ? -1 : 1;
      inp.placeholder = "Search for " + t.slice(0, c) + (c ? "|" : "");
      if (!del && c === t.length) { del = true; wait = 1300; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
    }
    setTimeout(tick, wait);
  })();
}
const W = ["dresses", "sneakers", "headphones", "sarees", "smart watches", "handbags", "laptops"];
typer(searchInput, W); typer($("#fhInput"), W);
})();
