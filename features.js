/* ShopNova v2 features */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };

/* ---- 1. WHITE SCREEN FIX ---- */
$$("section.reveal").forEach(s => s.classList.add("visible"));
window.initReveal = function () {
  const els = $$(".reveal:not(.visible)");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("visible")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }), { threshold: 0, rootMargin: "0px 0px 250px 0px" });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => e.classList.add("visible")), 2500);
};
document.addEventListener("error", e => {
  if (e.target.tagName === "IMG" && !e.target.dataset.fb) {
    e.target.dataset.fb = 1;
    e.target.src = "https://placehold.co/600x800/f4f5f6/999?text=ShopNova";
  }
}, true);

/* ---- 2. MORE WOMEN'S PRODUCTS ---- */
const W = [
[52,"Off-Shoulder Party Dress","dresses",1799,3299,4.6,1420,"1515886657613-9f3515b0c78f","Chic off-shoulder dress for parties and dinners."],
[53,"Casual Shirt Dress","dresses",1399,2499,4.5,1190,"1591369822096-ffd140ec948f","Easy belted shirt dress for work and weekends."],
[54,"Silk Blend Kurta Palazzo Set","ethnic",1599,2999,4.7,1980,"1487222477894-8943e31ef7b2","Kurta with palazzo and dupatta for festive days."],
[55,"Designer Chanderi Saree","ethnic",1899,3499,4.8,1330,"1610030469983-98e550d6193c","Lightweight chanderi saree with a soft golden border."],
[56,"Printed Casual Top","tops",599,1199,4.4,2760,"1594633312681-425c7b97ccd1","Breezy printed top that pairs with jeans or skirts."],
[57,"Formal Button-Up Shirt","tops",899,1699,4.5,1540,"1496217590455-aa63a8350eea","Crisp cotton shirt for office and everyday wear."],
[58,"Wide-Leg Trousers","bottoms",1199,2299,4.6,1680,"1445205170230-053b83016050","High-rise wide-leg trousers with a fluid drape."],
[59,"Comfort Stretch Leggings","bottoms",499,899,4.5,5120,"1483985988355-763728e1935b","Four-way stretch leggings for gym and daily use."],
[60,"Women's Denim Jacket","winter",1799,3199,4.6,870,"1618244972963-dbee1a7edc95","Classic denim jacket for easy layering."],
[61,"Hooded Sweatshirt","winter",1299,2299,4.7,2210,"1581044777550-4cfa60707c03","Soft fleece hoodie with a relaxed fit."],
[62,"Wool Blend Sweater","winter",1499,2699,4.6,940,"1434389677669-e08b4cac3105","Warm sweater with a smooth knit finish."],
[63,"Party Wear Evening Gown","dresses",2999,5999,4.8,610,"1566174053879-31528523f8ae","Floor-length gown for weddings and receptions."]
];
W.forEach(([id, name, subcat, price, old, rating, reviews, img, description]) => {
  if (products.some(p => p.id === id)) return;
  products.push({ id, name, category: "fashion", gender: "women", subcat, isNew: true, price, oldPrice: old,
    discount: Math.round((1 - price / old) * 100), rating, reviews,
    image: `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=800&q=90`, description });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 45);
  liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});
window.renderWomenProducts = function () {
  if (!womenProductsGrid) return;
  let l = products.filter(p => p.gender === "women" && ["fashion", "innerwear", "shoes"].includes(p.category));
  l = womenSub === "all"
    ? l.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 16)
    : l.filter(p => p.subcat === womenSub);
  womenProductsGrid.innerHTML = l.map((p, i) => productCard(p, i)).join("");
};

/* ---- 3. LIVE NUMBERS WITHOUT RE-RENDER (no flicker) ---- */
setInterval(() => {
  products.forEach(p => {
    liveViewerCounts[p.id] = Math.max(4, (liveViewerCounts[p.id] || 10) + Math.floor(Math.random() * 5) - 2);
    if ((liveStockLevels[p.id] || 0) > 2 && Math.random() < .12) liveStockLevels[p.id]--;
  });
  $$(".product-card").forEach(c => {
    const b = c.querySelector("[data-add-cart]"); if (!b) return;
    const id = +b.dataset.addCart;
    const v = c.querySelector(".live-viewers");
    if (v && v.lastChild) v.lastChild.textContent = ` ${liveViewerCounts[id]} people viewing this right now`;
    const s = c.querySelector(".stock-left");
    if (s && s.lastChild) s.lastChild.textContent = ` Only ${liveStockLevels[id]} left`;
  });
}, 12000);

/* ---- 4. SORT + WISHLIST VIEW ---- */
let sortBy = "def", wishOnly = false;
window.getFilteredProducts = function () {
  let l = products.filter(p =>
    (currentCategory === "all" || p.category === currentCategory) &&
    p.name.toLowerCase().includes(currentSearch.toLowerCase()) &&
    (!wishOnly || currentSearch || wishlist.includes(p.id)));
  const f = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price,
    rate: (a, b) => b.rating - a.rating, disc: (a, b) => b.discount - a.discount }[sortBy];
  return f ? l.sort(f) : l;
};
const _sc = setCategory;
window.setCategory = function (c) { wishOnly = false; _sc(c); };
const bar = document.createElement("div");
bar.className = "sort-bar";
bar.innerHTML = `<label>Sort by <select id="sortSelect"><option value="def">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="rate">Top Rated</option><option value="disc">Biggest Discount</option></select></label>`;
productGrid.before(bar);
$("#sortSelect").onchange = e => { sortBy = e.target.value; renderProducts(true); };
function showWishlist() {
  wishOnly = true; currentCategory = "all"; currentSearch = "";
  productTitle.textContent = "My Wishlist ❤️";
  renderProducts(true);
  $("#products").scrollIntoView({ behavior: "smooth" });
  closeSidebar();
}
$("#sidebarWishlist").onclick = showWishlist;
$("#logoBtn").addEventListener("click", () => { wishOnly = false; renderProducts(); });

/* ---- 5. RECENTLY VIEWED ---- */
let rv = load("shopnovaRecent", []);
const simCard = p => `<div class="sim-card" data-product="${p.id}"><img src="${p.image}" alt="" loading="lazy"><span>${p.name}</span><b>${formatPrice(p.price)}</b></div>`;
function renderRecent() {
  let s = $("#recentSection");
  if (!s) { s = document.createElement("section"); s.id = "recentSection"; s.className = "recent-section"; $(".features").before(s); }
  const items = rv.map(id => products.find(p => p.id === id)).filter(Boolean);
  s.style.display = items.length ? "block" : "none";
  s.innerHTML = `<h2>Recently Viewed</h2><div class="sim-row">${items.map(simCard).join("")}</div>`;
}
renderRecent();

/* ---- 6. PRODUCT MODAL UPGRADE ---- */
const REV = [["Aarti S.", 5, "Fabric quality is great and fits perfectly. Delivery was quick!"],
  ["Rohit M.", 4, "Value for money. Looks exactly like the photos."],
  ["Neha P.", 5, "Loved it. Will order again in another colour."]];
const _open = openProductModal;
window.openProductModal = function (id) {
  _open(id);
  const p = products.find(x => x.id === id), d = $(".modal-details");
  if (!p || !d) return;
  const btn = $("button.primary-btn[data-add-cart]", d);
  const acc = /Bag|Watch|Wallet|Sunglasses|Backpack|Handbag/.test(p.name);
  const sizes = p.category === "shoes" ? ["6", "7", "8", "9", "10"]
    : (["fashion", "innerwear"].includes(p.category) && !acc) ? ["XS", "S", "M", "L", "XL"] : null;
  let h = "";
  if (sizes) h += `<div class="m-block"><b>Select Size</b><div class="size-row">${sizes.map((s, i) => `<button class="size-chip${i === 2 ? " active" : ""}">${s}</button>`).join("")}</div></div>`;
  h += `<div class="m-block"><b>Check Delivery</b><div class="pin-row"><input id="pinInput" maxlength="6" inputmode="numeric" placeholder="Enter pincode"><button id="pinBtn">Check</button></div><small id="pinMsg"></small></div>`;
  h += `<div class="trust-row"><span>🚚 Free Delivery</span><span>↩️ 7-Day Returns</span><span>🔒 Secure Payment</span></div>`;
  if (btn) {
    btn.insertAdjacentHTML("beforebegin", h);
    btn.insertAdjacentHTML("afterend", `<button class="buy-now" data-buy="${id}">⚡ Buy Now</button>`);
  }
  const sim = products.filter(x => x.category === p.category && x.id !== id).slice(0, 6);
  $("#modalContent").insertAdjacentHTML("beforeend",
    `<div class="m-extra"><h4>Customer Reviews</h4>${REV.map(r => `<div class="review"><b>${r[0]}</b> <span class="stars">${stars(r[1])}</span><p>${r[2]}</p></div>`).join("")}</div>` +
    `<div class="m-extra"><h4>You may also like</h4><div class="sim-row">${sim.map(simCard).join("")}</div></div>`);
  $(".product-modal").scrollTop = 0;
  rv = [id, ...rv.filter(x => x !== id)].slice(0, 8);
  save("shopnovaRecent", rv); renderRecent();
};
document.addEventListener("click", e => {
  const t = e.target, sz = t.closest(".size-chip");
  if (sz) { $$(".size-chip").forEach(c => c.classList.toggle("active", c === sz)); return; }
  if (t.closest("#pinBtn")) {
    const v = $("#pinInput").value.trim(), m = $("#pinMsg");
    if (!/^\d{6}$/.test(v)) { m.textContent = "Enter a valid 6-digit pincode"; m.style.color = "#e53935"; return; }
    const dt = new Date(Date.now() + 4 * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    m.textContent = `✅ Delivery by ${dt} · Free`; m.style.color = "#008a55"; return;
  }
  const buy = t.closest("[data-buy]");
  if (buy) { addToCart(+buy.dataset.buy); closeProductModal(); openCheckoutModal(); }
});

/* ---- 7. CART SAVINGS ---- */
const _rc = renderCart;
window.renderCart = function () {
  _rc();
  const f = $(".cart-footer"); if (!f) return;
  let n = $("#saveNote");
  if (!n) { n = document.createElement("div"); n.id = "saveNote"; f.prepend(n); }
  const sv = cart.reduce((a, i) => { const p = products.find(x => x.id === i.id); return a + (p ? (p.oldPrice - p.price) * i.quantity : 0); }, 0);
  n.style.display = sv ? "block" : "none";
  n.textContent = `🎉 You're saving ${formatPrice(sv)} on this order!`;
};
renderCart();

/* ---- 8. SEARCH SUGGESTIONS ---- */
const box = document.createElement("div");
box.className = "suggest";
$(".search-box").appendChild(box);
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 2) { box.style.display = "none"; return; }
  const m = products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  box.innerHTML = m.map(p => `<div class="sg" data-sg="${p.name}"><img src="${p.image}" alt=""><span>${p.name}</span><b>${formatPrice(p.price)}</b></div>`).join("") || `<div class="sg-empty">No matches found</div>`;
  box.style.display = "block";
});
box.onclick = e => {
  const s = e.target.closest("[data-sg]"); if (!s) return;
  searchInput.value = s.dataset.sg; box.style.display = "none"; performSearch();
};
document.addEventListener("click", e => { if (!e.target.closest(".search-box")) box.style.display = "none"; });

/* ---- 9. MOBILE BOTTOM NAV ---- */
const nav = document.createElement("nav");
nav.className = "bottom-nav";
nav.innerHTML = `<button data-go="top">🏠<span>Home</span></button><button data-go="cat">🗂️<span>Categories</span></button><button data-go="wish">❤️<span>Wishlist</span></button><button data-go="cart">🛒<span>Cart</span></button><button data-go="acc">👤<span>Account</span></button>`;
document.body.appendChild(nav);
nav.onclick = e => {
  const g = e.target.closest("[data-go]"); if (!g) return;
  ({ top: () => scrollTo({ top: 0, behavior: "smooth" }),
     cat: () => $("#categories").scrollIntoView({ behavior: "smooth" }),
     wish: showWishlist, cart: () => $("#cartBtn").click(), acc: () => $("#accountBtn").click() })[g.dataset.go]();
};
})();
