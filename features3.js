/* ShopNova v3 */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };

/* ---------- 1. 57 NEW PRODUCTS ---------- */
const CAT = { f: "fashion", e: "electronics", s: "shoes", b: "beauty", h: "home", g: "gaming", k: "books", i: "innerwear" };
const P = {
  ms: ["1602810318383-e386cc2a3ccf", "1521572163474-6864f9cf17ab", "1489987707025-afc232f7ea0f", "1503341504253-dff4815485f1"],
  mb: ["1507679799987-c73779587ccf", "1617137968427-85924c800a22", "1551028719-00167b16eac5", "1552374196-c4e7ffc6e126"],
  sh: ["1549298916-b41d501d3772", "1560769629-975ec94e6a86", "1525966222134-fcfa99b8ae77", "1491553895911-0055eca6402d"],
  wa: ["1523275335684-37898b6baf30", "1522312346375-d1a52e2b99b3", "1572635196237-14b3f281503f"],
  wd: ["1595777457583-95e059d581b8", "1566174053879-31528523f8ae", "1515886657613-9f3515b0c78f", "1572804013309-59a88b7e92f1", "1583496661160-fb5886a13d77", "1610030469983-98e550d6193c"],
  wt: ["1581044777550-4cfa60707c03", "1541099649105-f69ad21f3246", "1434389677669-e08b4cac3105", "1554568218-0f1715e72254", "1483985988355-763728e1935b", "1496747611176-843222e1e57c"],
  bg: ["1584917865442-de89df76afd3", "1566150905458-1bf1fc113f0d", "1553062407-98eeb64c6a62"],
  el: ["1505740420928-5e560c06d30e", "1546868871-7041f2a55e12", "1608043152269-423dbba4e7e1", "1598327105666-5b89351aff97", "1583394838336-acd977736f90", "1517336714731-489689fd1ca8"],
  gm: ["1587829741301-dc798b83add3", "1605901309584-818e25960a8f", "1599669454699-248893623440", "1550745165-9bc0b252726f"],
  hm: ["1567538096630-e0c55bd6374c", "1503602642458-232111445657", "1532372320572-cda25653a26d", "1507473885765-e6ed057f782c", "1555041469-a586c61ea9bc", "1540518614846-7eded433c457"],
  bt: ["1556229010-6c3f2c9ca5f8", "1541643600914-78b084683601", "1596462502278-27bfdc403348", "1522335789203-aabd1fc54bc9", "1571781926291-c477ebfd024b"],
  bk: ["1544947950-fa07a98d237f", "1532012197267-da84d127e765", "1512820790803-83ca734da794", "1481627834876-b7833e8f5570"]
};
/* name|cat|gender|subcat|price|oldPrice|imagePool */
const DATA = [
"Oxford Formal Shirt|f|men|shirts|1299|2399|ms","Checked Flannel Shirt|f|men|shirts|1099|1999|ms","Linen Summer Shirt|f|men|shirts|1399|2599|ms",
"Polo T-Shirt|f|men|tshirts|699|1299|ms","Graphic Print T-Shirt|f|men|tshirts|599|1199|ms","Slim Fit Chinos|f|men|bottoms|1399|2599|mb",
"Stretch Denim Jeans|f|men|bottoms|1599|2999|mb","Cargo Joggers|f|men|bottoms|1199|2199|mb","Cotton Kurta Set|f|men|ethnic|1499|2799|mb",
"Nehru Jacket Set|f|men|ethnic|2499|4499|mb","Zip-Up Hoodie|f|men|winter|1499|2699|mb","Puffer Jacket|f|men|winter|2999|5499|mb",
"Formal Blazer|f|men|winter|3499|6499|mb","Leather Belt|f|men|accessories|599|1199|wa","Chronograph Watch|f|men|accessories|2199|4299|wa",
"Leather Formal Shoes|s|men|footwear|2499|4599|sh","Casual Loafers|s|men|footwear|1699|3199|sh","Sports Running Shoes|s|men|footwear|2299|4299|sh","Comfort Slides|s|men|footwear|499|999|sh",
"Bodycon Party Dress|f|women|dresses|1599|2999|wd","A-Line Midi Dress|f|women|dresses|1399|2599|wd","Designer Lehenga Choli|f|women|ethnic|3999|7999|wd",
"Georgette Printed Saree|f|women|ethnic|1499|2999|wd","Straight Fit Kurti|f|women|ethnic|799|1599|wd","Peplum Top|f|women|tops|699|1299|wt",
"Satin Cami Top|f|women|tops|599|1199|wt","Palazzo Pants|f|women|bottoms|799|1499|wt","Jogger Pants|f|women|bottoms|899|1699|wt",
"Puffer Vest|f|women|winter|1799|3199|wt","Faux Leather Jacket|f|women|winter|2499|4499|wt","Block Heel Sandals|s|women|footwear|1599|2999|sh",
"Ballet Flats|s|women|footwear|999|1899|sh","Women's Running Shoes|s|women|footwear|1999|3799|sh","Tote Handbag|f|women|accessories|1299|2499|bg",
"Pearl Necklace Set|f|women|accessories|699|1499|bg","Sling Bag|f|women|accessories|899|1699|bg","True Wireless Earbuds|e|men|x|1499|3499|el",
"Bluetooth Neckband|e|men|x|799|1799|el","Fitness Band|e|men|x|1999|3999|el","Power Bank 20000mAh|e|men|x|1299|2499|el",
"Portable SSD 1TB|e|men|x|5999|9999|el","Full HD Webcam|e|men|x|1499|2999|el","43-inch Smart LED TV|e|men|x|24999|39999|el",
"Wireless Gaming Mouse|g|men|x|999|1999|gm","XL Gaming Mousepad|g|men|x|499|999|gm","Cotton Bedsheet Set|h|women|x|999|1999|hm",
"Non-Stick Cookware Set|h|women|x|1999|3999|hm","Ceramic Dinner Set|h|women|x|1799|3299|hm","Wall Art Frame Set|h|women|x|899|1799|hm",
"Memory Foam Pillow|h|women|x|699|1399|hm","Matte Lipstick Set|b|women|x|499|999|bt","Vitamin C Face Serum|b|women|x|599|1199|bt",
"Professional Hair Dryer|b|women|x|1299|2499|bt","Men's Grooming Kit|b|men|x|999|1799|bt","Bestselling Fiction Novel|k|men|x|299|499|bk",
"Habits & Growth Book|k|women|x|349|599|bk","Women's Seamless Innerwear Pack|i|women|x|699|1399|wt"
];
const cnt = {};
DATA.forEach((row, n) => {
  const [name, c, gender, sub, price, old, pool] = row.split("|");
  const id = 100 + n, k = cnt[pool] = (cnt[pool] || 0);
  cnt[pool]++;
  const img = P[pool][k % P[pool].length];
  products.push({ id, name, category: CAT[c], gender, subcat: sub, isNew: true, price: +price, oldPrice: +old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.2 + ((id * 7) % 7) / 10).toFixed(1),
    reviews: 300 + (id * 137) % 4500,
    image: `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=800&q=90`,
    description: `Premium ${name.toLowerCase()} from ShopNova. Great quality, comfortable everyday use and best value with easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 45);
  liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});
const SUB = { 2: "winter", 24: "shirts", 25: "winter", 26: "tshirts", 27: "accessories", 36: "accessories", 37: "accessories",
  4: "accessories", 9: "footwear", 10: "footwear", 11: "footwear", 12: "footwear", 30: "footwear", 3: "accessories", 31: "accessories" };
Object.keys(SUB).forEach(id => { const p = products.find(x => x.id === +id); if (p) p.subcat = SUB[id]; });

/* ---------- 2. MEN'S CHIPS + RENDER ---------- */
let menSub = "all";
window.renderMenProducts = function () {
  if (!menProductsGrid) return;
  let l = products.filter(p => p.gender === "men" && ["fashion", "shoes", "innerwear"].includes(p.category));
  l = menSub === "all" ? l.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 16) : l.filter(p => p.subcat === menSub);
  menProductsGrid.innerHTML = l.map((p, i) => productCard(p, i)).join("");
};
const mc = document.createElement("div");
mc.className = "m-chips";
mc.innerHTML = [["all", "All"], ["shirts", "👔 Shirts"], ["tshirts", "👕 T-Shirts"], ["bottoms", "👖 Bottoms"], ["ethnic", "🧥 Ethnic"], ["winter", "🧣 Winterwear"], ["footwear", "👟 Footwear"], ["accessories", "⌚ Accessories"]]
  .map(([k, t], i) => `<button class="m-chip${i ? "" : " active"}" data-msub="${k}">${t}</button>`).join("");
menProductsGrid.before(mc);
const wc = $(".sub-chips");
if (wc) wc.insertAdjacentHTML("beforeend", `<button class="sub-chip" data-sub="footwear">👠 Footwear</button><button class="sub-chip" data-sub="accessories">👜 Accessories</button>`);
document.addEventListener("click", e => {
  const c = e.target.closest("[data-msub]"); if (!c) return;
  menSub = c.dataset.msub;
  $$(".m-chip").forEach(x => x.classList.toggle("active", x === c));
  renderMenProducts(); initReveal();
});

/* ---------- 3. FILTERS + LOAD MORE ---------- */
let maxP = 1e9, minR = 0, shown = 12, lastKey = "";
const sb = $(".sort-bar");
if (sb) sb.insertAdjacentHTML("beforeend", `<label>Price <select id="priceSel"><option value="1000000000">Any</option><option value="499">Under ₹499</option><option value="999">Under ₹999</option><option value="1999">Under ₹1,999</option><option value="4999">Under ₹4,999</option></select></label><label class="rt"><input type="checkbox" id="rate4"> 4★ &amp; up</label>`);
$("#priceSel") && ($("#priceSel").onchange = e => { maxP = +e.target.value; renderProducts(true); });
$("#rate4") && ($("#rate4").onchange = e => { minR = e.target.checked ? 4 : 0; renderProducts(true); });
const _g = window.getFilteredProducts;
window.getFilteredProducts = function () {
  const l = _g().filter(p => p.price <= maxP && p.rating >= minR && (!window.__extra || window.__extra(p)));
  const key = [currentCategory, currentSearch, maxP, minR, $("#sortSelect") ? $("#sortSelect").value : "", window.__fk || ""].join("|");
  if (key !== lastKey) { lastKey = key; shown = 12; }
  const lm = $("#loadMore");
  if (lm) { lm.style.display = l.length > shown ? "block" : "none"; lm.textContent = `Load more products (${l.length - shown} more)`; }
  return l.slice(0, shown);
};
const lm = document.createElement("button");
lm.id = "loadMore"; lm.className = "load-more";
productGrid.after(lm);
lm.onclick = () => { shown += 12; renderProducts(); };

/* ---------- 4. HOME SECTIONS: BUDGET + BEST SELLERS ---------- */
const bs = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 12);
const sec = document.createElement("section");
sec.className = "home-extra";
sec.innerHTML = `<h2>Shop by Budget</h2><div class="budget-row">${[[499, "Under ₹499", "#ff6b6b"], [999, "Under ₹999", "#f59e0b"], [1999, "Under ₹1,999", "#10b981"], [4999, "Under ₹4,999", "#6366f1"]]
  .map(([v, t, c]) => `<button class="budget" data-budget="${v}" style="background:${c}">${t}<i class="fa-solid fa-arrow-right"></i></button>`).join("")}</div>
  <h2 style="margin-top:34px">🏆 Best Sellers</h2><div class="sim-row">${bs.map(p => `<div class="sim-card"><img data-product="${p.id}" src="${p.image}" alt="" loading="lazy"><span data-product="${p.id}">${p.name}</span><b>${formatPrice(p.price)}</b><button class="mini-add" data-add-cart="${p.id}">Add to Cart</button></div>`).join("")}</div>`;
$("#categories").after(sec);
document.addEventListener("click", e => {
  const b = e.target.closest("[data-budget]"); if (!b) return;
  setCategory("all"); $("#priceSel").value = b.dataset.budget; maxP = +b.dataset.budget; renderProducts(true);
});

/* ---------- 5. COUPONS + FREE DELIVERY + TOTALS ---------- */
const COUPONS = window.__coupons = { NOVA10: { t: "pct", v: 10, min: 0 }, WELCOME200: { t: "flat", v: 200, min: 1000 }, FREESHIP: { t: "ship", min: 0 } };
let coupon = load("shopnovaCoupon", null);
function totals() {
  const sub = cart.reduce((a, i) => { const p = products.find(x => x.id === i.id); return a + (p ? p.price * i.quantity : 0); }, 0);
  let disc = 0; const c = COUPONS[coupon];
  if (c && sub >= c.min) disc = c.t === "pct" ? Math.round(sub * c.v / 100) : c.t === "flat" ? c.v : 0;
  const free = sub - disc >= 999 || (c && c.t === "ship");
  const ship = sub && !free ? 49 : 0;
  return { sub, disc, ship, total: sub - disc + ship };
}
const _rc = window.renderCart;
window.renderCart = function () {
  _rc();
  const f = $(".cart-footer"); if (!f) return;
  let b = $("#couponBox");
  if (!b) { b = document.createElement("div"); b.id = "couponBox"; f.prepend(b); }
  const t = totals(), left = Math.max(0, 999 - (t.sub - t.disc));
  b.innerHTML = `<div class="fs-bar"><small>${t.sub ? (left ? `Add ${formatPrice(left)} more for FREE delivery` : "🎉 FREE delivery unlocked!") : "Free delivery on orders above ₹999"}</small><div class="fs-track"><i style="width:${Math.min(100, (t.sub - t.disc) / 9.99)}%"></i></div></div>
  <div class="coupon-row"><input id="cpInput" placeholder="Coupon: NOVA10, WELCOME200" value="${coupon || ""}"><button id="cpBtn">${coupon ? "Remove" : "Apply"}</button></div>
  ${t.disc ? `<div class="cp-line">Coupon discount <b>-${formatPrice(t.disc)}</b></div>` : ""}${t.ship ? `<div class="cp-line">Delivery <b>${formatPrice(t.ship)}</b></div>` : ""}`;
  cartTotal.textContent = formatPrice(t.total);
};
document.addEventListener("click", e => {
  if (!e.target.closest("#cpBtn")) return;
  if (coupon) coupon = null;
  else {
    const v = $("#cpInput").value.trim().toUpperCase(), c = COUPONS[v];
    if (!c) return showToast("Invalid coupon code");
    if (totals().sub < c.min) return showToast(`Minimum order ${formatPrice(c.min)} required`);
    coupon = v; showToast(`Coupon ${v} applied 🎉`);
  }
  save("shopnovaCoupon", coupon); renderCart();
});
const _rr = window.renderCheckoutReview;
window.renderCheckoutReview = function () {
  _rr();
  const t = totals();
  if (!$(".pay-box")) $(".checkout-panel-actions").insertAdjacentHTML("beforebegin",
    `<div class="pay-box"><b>Payment Method</b>${["UPI", "Credit/Debit Card", "Cash on Delivery"].map((m, i) => `<label><input type="radio" name="pay" value="${m}" ${i ? "" : "checked"}> ${m}</label>`).join("")}</div>`);
  const fr = $(".checkout-free"); if (fr) fr.textContent = t.ship ? formatPrice(t.ship) : "FREE";
  const old = $("#ckDisc"); if (old) old.remove();
  if (t.disc) $(".checkout-summary-total").insertAdjacentHTML("beforebegin", `<div id="ckDisc"><span>Coupon (${coupon})</span><strong style="color:#008a55">-${formatPrice(t.disc)}</strong></div>`);
  checkoutGrandTotal.textContent = formatPrice(t.total);
};

/* ---------- 6. ORDERS + TRACKING ---------- */
let orders = load("shopnovaOrders", []), snap = null;
document.addEventListener("click", e => {
  if (!e.target.closest("#placeOrderBtn")) return;
  const pay = $("input[name=pay]:checked");
  snap = { items: cart.map(i => ({ ...i })), total: totals().total, pay: pay ? pay.value : "COD" };
  setTimeout(() => {
    if (!snap || !snap.items.length) return;
    orders.unshift({ id: $("#checkoutOrderId").textContent, ts: Date.now(), ...snap });
    save("shopnovaOrders", orders); coupon = null; save("shopnovaCoupon", null); renderCart(); snap = null;
  }, 0);
}, true);
const om = document.createElement("div");
om.className = "ord-overlay";
om.innerHTML = `<div class="ord-modal"><button class="modal-close" id="ordClose">✕</button><h3>My Orders</h3><div id="ordList"></div></div>`;
document.body.appendChild(om);
const STEPS = ["Placed", "Packed", "Shipped", "Delivered"];
function showOrders() {
  $("#ordList").innerHTML = orders.length ? orders.map((o, i) => {
    const s = Math.min(3, Math.floor((Date.now() - o.ts) / 20000));
    return `<div class="ord"><div class="ord-h"><b>${o.id}</b><span>${new Date(o.ts).toLocaleString("en-IN")}</span></div>
    ${o.items.map(it => { const p = products.find(x => x.id === it.id); return p ? `<div class="ord-i"><img src="${p.image}" alt=""><span>${p.name} × ${it.quantity}</span></div>` : ""; }).join("")}
    <div class="trk">${STEPS.map((n, k) => `<i class="${k <= s ? "on" : ""}"><em></em>${n}</i>`).join("")}</div>
    <div class="ord-f"><span><b>${formatPrice(o.total)}</b> · ${o.pay}</span><button data-reorder="${i}">Reorder</button></div></div>`;
  }).join("") : `<p class="ord-empty">No orders yet. Place a demo order to see it here.</p>`;
  om.classList.add("active");
}
setInterval(() => { if (om.classList.contains("active")) showOrders(); }, 10000);
$(".header-action.orders").onclick = showOrders;
$("#sidebarOrders").onclick = () => { closeSidebar(); showOrders(); };
om.onclick = e => {
  if (e.target === om || e.target.id === "ordClose") om.classList.remove("active");
  const r = e.target.closest("[data-reorder]");
  if (r) { orders[+r.dataset.reorder].items.forEach(it => { for (let k = 0; k < it.quantity; k++) addToCart(it.id); }); om.classList.remove("active"); openCart(); }
};

/* ---------- 7. DARK MODE ---------- */
const db = document.createElement("button");
db.className = "dark-btn"; db.title = "Dark mode"; db.textContent = "🌙";
$(".cart-button").before(db);
if (load("shopnovaDark", false)) document.documentElement.classList.add("dark");
db.onclick = () => save("shopnovaDark", document.documentElement.classList.toggle("dark"));

renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); renderCart(); initReveal();
})();
