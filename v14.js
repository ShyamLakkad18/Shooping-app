/* ShopNova v14 — image fix + dedicated search results page */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* =====================================================================
   1. IMAGE FIX — remap every product added by earlier patches (id > 43)
      to photos that are already confirmed working on this site (the
      original 43 products). This guarantees nothing shows broken/blank.
   ===================================================================== */
const POOL = {
  women: ["1595777457583-95e059d581b8", "1566174053879-31528523f8ae", "1539109136881-3be0616acf4b", "1584917865442-de89df76afd3", "1566150905458-1bf1fc113f0d", "1628971021877-37187fde57f4", "1543163521-1bf539c55dd2"],
  men: ["1602810318383-e386cc2a3ccf", "1521572163474-6864f9cf17ab", "1551028719-00167b16eac5", "1524805444758-089113d48a6d", "1627123424574-724758594e93", "1511499767150-a48a237f0083", "1553062407-98eeb64c6a62"],
  shoes: ["1542291026-7eec264c27ff", "1495555961986-6d4c1ecb7be3", "1608231387042-66d1773070a5", "1460353581641-37baddab0fa2"],
  electronics: ["1505740420928-5e560c06d30e", "1546868871-7041f2a55e12", "1496181133206-80ce9b88a853", "1608043152269-423dbba4e7e1", "1598327105666-5b89351aff97", "1544244015-0df4b3ffc6b0"],
  beauty: ["1556229010-6c3f2c9ca5f8", "1541643600914-78b084683601", "1596462502278-27bfdc403348"],
  home: ["1507473885765-e6ed057f782c", "1503602642458-232111445657", "1532372320572-cda25653a26d", "1567538096630-e0c55bd6374c", "1585515320310-259814833e62"],
  gaming: ["1587829741301-dc798b83add3", "1605901309584-818e25960a8f", "1599669454699-248893623440"],
  books: ["1544947950-fa07a98d237f", "1532012197267-da84d127e765"],
  innerwear: ["1628971021877-37187fde57f4", "1521572163474-6864f9cf17ab"],
  kids: ["1595777457583-95e059d581b8", "1521572163474-6864f9cf17ab"]
};
function poolFor(p) {
  if (p.category === "fashion" || p.category === "shoes") return p.gender === "men" ? (p.category === "shoes" ? POOL.shoes : POOL.men) : (p.category === "shoes" ? POOL.shoes : POOL.women);
  return POOL[p.category] || POOL.women;
}
let fixed = 0;
products.forEach(p => {
  if (p.id <= 43 || p.__imgFixed) return; /* keep the original, already-working 43 products untouched */
  const pool = poolFor(p), idx = p.id % pool.length;
  p.image = `https://images.unsplash.com/photo-${pool[idx]}?auto=format&fit=crop&w=600&q=80`;
  if (p.images) delete p.images; /* drop any gallery that referenced unverified photos */
  p.__imgFixed = true; fixed++;
});
if (window.renderProducts) { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); if (window.renderKids) renderKids(); }
console.log(`ShopNova v14: re-mapped ${fixed} product photos to confirmed-working images.`);

/* =====================================================================
   2. DEDICATED SEARCH RESULTS PAGE
   ===================================================================== */
document.body.classList.remove("search-mode");
const head = $(".products-heading");
if (head && !$("#clearSearchBtn", head)) {
  head.insertAdjacentHTML("beforeend", '<button id="clearSearchBtn" class="clear-search-btn">✕ Clear Search / Back to Home</button>');
}
function enterSearchMode() { document.body.classList.add("search-mode"); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); }
function exitSearchMode() {
  document.body.classList.remove("search-mode");
  if (searchInput) searchInput.value = "";
  currentSearch = ""; currentCategory = "all";
  if (productTitle) productTitle.textContent = "Popular Products";
  if (window.renderProducts) renderProducts(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("click", e => { if (e.target.id === "clearSearchBtn") exitSearchMode(); });

const _ps14 = window.performSearch;
if (_ps14) window.performSearch = function () {
  const q = (searchInput && searchInput.value.trim()) || "";
  if (q) enterSearchMode(); else exitSearchMode();
  _ps14();
};
const logo = $("#logoBtn");
if (logo) logo.addEventListener("click", () => document.body.classList.remove("search-mode"), true);
})();
