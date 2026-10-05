/* ShopNova v10 — brand new home page */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const old = $(".front-hero");
if (!old) return;

const trend = [5, 1, 19, 28, 9, 13].map(id => products.find(p => p.id === id)).filter(Boolean);
const cats = [["fashion", "👗", "Fashion", "#ff6b6b"], ["electronics", "💻", "Electronics", "#4facfe"],
  ["shoes", "👟", "Shoes", "#8b5cf6"], ["beauty", "💄", "Beauty", "#fb7185"],
  ["home", "🛋️", "Home", "#10b981"], ["gaming", "🎮", "Gaming", "#f59e0b"], ["kids", "🧸", "Kids", "#f472b6"]];
const testimonials = [["Priya S.", "Loved the quality and the delivery was super fast. My go-to store now!", "Mumbai"],
  ["Rohan K.", "Great prices and the app feels so smooth on my phone.", "Bengaluru"],
  ["Ayesha M.", "Return process was easy when a size didn't fit. Highly recommend.", "Hyderabad"]];

const html = `
<section class="h2-hero">
  <div class="h2-hero-grid">
    <div class="h2-main">
      <span class="h2-badge"><i class="fa-solid fa-sparkles"></i> New season, new you</span>
      <h1>Everything you need,<br><span class="h2-grad">nothing you don't.</span></h1>
      <p>Fashion, tech, home &amp; beauty — handpicked and delivered fast, at prices that make sense.</p>
      <form class="h2-search" id="h2Form">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="h2Input" type="search" autocomplete="off" placeholder="Search for anything...">
        <button type="submit">Search</button>
      </form>
      <div class="h2-cta-row">
        <button class="h2-cta" data-category="all">Start Shopping <i class="fa-solid fa-arrow-right"></i></button>
        <div class="h2-trust"><i class="fa-solid fa-shield-halved"></i> Secure checkout &nbsp;·&nbsp; <i class="fa-solid fa-truck-fast"></i> Free delivery over ₹999</div>
      </div>
    </div>
    <div class="h2-card"><div class="h2-card-top"><span>🔥 Today's pick</span><b>${trend[0] ? trend[0].discount : 50}% OFF</b></div>
      ${trend[0] ? `<img src="${trend[0].image}" alt="${trend[0].name}"><div class="h2-card-info"><b>${trend[0].name}</b><span>${formatPrice(trend[0].price)} <s>${formatPrice(trend[0].oldPrice)}</s></span></div>` : ""}
    </div>
  </div>
</section>

<section class="h2-cats">
  ${cats.map(([k, e, t, c]) => `<button data-category="${k}" style="--c:${c}"><span>${e}</span>${t}</button>`).join("")}
</section>

<section class="h2-trend">
  <div class="h2-sec-head"><h2>🔥 Trending Right Now</h2><button class="h2-view" data-category="all">View all <i class="fa-solid fa-arrow-right"></i></button></div>
  <div class="h2-trend-row">
    ${trend.map(p => `<div class="h2-t-card" data-product="${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="h2-t-off">${p.discount}% OFF</span><b>${p.name}</b><span>${formatPrice(p.price)}</span></div>`).join("")}
  </div>
</section>

<section class="h2-banners">
  <div class="h2-banner b1" data-category="fashion"><span>UP TO 50% OFF</span><h3>Fashion Edit</h3><em>Shop now →</em></div>
  <div class="h2-banner b2" data-category="electronics"><span>LATEST TECH</span><h3>Electronics</h3><em>Shop now →</em></div>
  <div class="h2-banner b3" data-category="home"><span>REFRESH YOUR SPACE</span><h3>Home &amp; Living</h3><em>Shop now →</em></div>
</section>

<section class="h2-testi">
  <h2>Loved by shoppers across India</h2>
  <div class="h2-testi-row">${testimonials.map(([n, t, c]) => `<div class="h2-t"><div class="h2-t-stars">★★★★★</div><p>"${t}"</p><b>${n}</b><span>${c}</span></div>`).join("")}</div>
</section>

<section class="h2-strip">
  <div><i class="fa-solid fa-truck-fast"></i><b>Free Delivery</b><span>On orders above ₹999</span></div>
  <div><i class="fa-solid fa-rotate-left"></i><b>7-Day Returns</b><span>No questions asked</span></div>
  <div><i class="fa-solid fa-shield-halved"></i><b>Secure Payments</b><span>UPI, Cards &amp; COD</span></div>
  <div><i class="fa-solid fa-headset"></i><b>24/7 Support</b><span>We're here to help</span></div>
</section>
`;
old.outerHTML = html;

function go(q) { searchInput.value = q; searchCategory.value = "all"; performSearch(); }
const f = $("#h2Form");
if (f) f.addEventListener("submit", e => { e.preventDefault(); go($("#h2Input").value.trim()); });

/* simple typing placeholder, matches v4's style but self-contained */
(function typer(inp, words) {
  if (!inp) return;
  let w = 0, c = 0, del = false;
  (function tick() {
    let wait = del ? 35 : 85;
    if (document.activeElement !== inp && !inp.value) {
      const t = words[w]; c += del ? -1 : 1;
      inp.placeholder = "Search for " + t.slice(0, c) + (c ? "|" : "");
      if (!del && c === t.length) { del = true; wait = 1300; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
    }
    setTimeout(tick, wait);
  })();
})($("#h2Input"), ["dresses", "sneakers", "headphones", "sarees", "smart watches", "kids toys"]);
})();
