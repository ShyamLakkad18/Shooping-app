/* ShopNova v11 — premium home page polish */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hero = $(".h2-hero");
if (!hero) return;

/* 1. floating ambient blobs that drift with the mouse (desktop) / idle float (mobile) */
const blobs = document.createElement("div");
blobs.className = "h3-blobs";
blobs.innerHTML = "<i></i><i></i><i></i>";
hero.prepend(blobs);
let mx = 0, my = 0;
hero.addEventListener("mousemove", e => {
  const r = hero.getBoundingClientRect();
  mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
  $$(".h3-blobs i").forEach((b, i) => { b.style.transform = `translate(${mx * (20 + i * 10)}px, ${my * (20 + i * 10)}px)`; });
});

/* 2. animated stat counters */
const stats = document.createElement("div");
stats.className = "h3-stats";
stats.innerHTML = [["250", "+", "Products"], ["50", "K+", "Happy Customers"], ["4.7", "★", "Average Rating"], ["24", "/7", "Always Open"]]
  .map(([n, s, l]) => `<div><b data-to="${n}" data-suf="${s}">0${s}</b><span>${l}</span></div>`).join("");
hero.after(stats);
function countUp(el) {
  const to = +el.dataset.to, suf = el.dataset.suf, dur = 1200, t0 = performance.now();
  function tick(t) { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
}
new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); o.unobserve(e.target); } }), { threshold: .6 })
  .__proto__ && $$(".h3-stats b").forEach(b => new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { countUp(b); o.disconnect(); } }, { threshold: .6 }).observe(b));

/* 3. "Shop the Look" style gallery */
const looks = [[1, "Everyday Elegance", "fashion"], [9, "Street Style", "shoes"], [13, "Glow Essentials", "beauty"], [17, "Cosy Living", "home"]];
const sl = document.createElement("section");
sl.className = "h3-looks";
sl.innerHTML = `<div class="h2-sec-head"><h2>✨ Shop the Look</h2></div><div class="h3-looks-row">${looks.map(([id, t, cat]) => {
  const p = products.find(x => x.id === id); if (!p) return "";
  return `<div class="h3-look" data-category="${cat}"><img src="${p.image}" alt="${t}" loading="lazy"><div class="h3-look-ov"><b>${t}</b><em>Shop the look →</em></div></div>`;
}).join("")}</div>`;
const trendSec = $(".h2-trend");
if (trendSec) trendSec.after(sl);

/* 4. testimonial avatars (emoji circles) + star glow */
$$(".h2-t").forEach((t, i) => {
  const b = t.querySelector("b");
  if (b && !t.querySelector(".h3-avatar")) b.insertAdjacentHTML("beforebegin", `<div class="h3-avatar">${["🙂","😊","🤗"][i % 3]}</div>`);
});

/* 5. subtle entrance animation on scroll for banners/cards */
$$(".h2-banner, .h3-look, .h2-t-card").forEach(el => el.classList.add("h3-pop"));
new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("h3-in"); o.unobserve(e.target); } }), { threshold: .15, rootMargin: "0px 0px -40px 0px" })
  && $$(".h3-pop").forEach(el => { const io = new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { el.classList.add("h3-in"); o.disconnect(); } }, { threshold: .15 }); io.observe(el); });
})();
