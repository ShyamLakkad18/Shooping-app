/* ShopNova v7 */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const money = n => formatPrice(n), esc = s => String(s).replace(/</g, "&lt;");
function modal(t) {
  const o = document.createElement("div");
  o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal"><button class="modal-close">✕</button><h3>${t}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o);
  return o;
}

/* ---- speed: smaller images ---- */
products.forEach(p => { p.image = p.image.replace("w=800", "w=600").replace("q=90", "q=80"); });

/* ---- KIDS & TOYS ---- */
const KP = ["1503919545889-aef636e10ad4", "1519238263530-99bdd11df2ea", "1522771930-78848d9293e8", "1515488042361-ee00e0ddd4e4", "1596461404969-9ae70f2830c1", "1558060370-d644479cb6e7"];
"Boys Graphic T-Shirt|499|999,Girls Party Frock|999|1899,Kids Denim Dungarees|899|1699,Boys Shorts (Pack of 3)|699|1299,Girls Leggings (Pack of 3)|599|1099,Kids Winter Hoodie|799|1499,Kids Sports Shoes|999|1899,Kids Sandals|499|999,School Backpack|699|1399,Kids Raincoat|599|1199,Kids Ethnic Kurta Set|899|1699,Baby Romper Set (Pack of 3)|699|1299,Building Blocks 500 pcs|799|1599,Remote Control Car|999|1999,Soft Teddy Bear|499|999,Art & Craft Kit|399|799"
  .split(",").forEach((s, i) => {
    const [name, pr, o] = s.split("|"), id = 300 + i;
    if (products.some(p => p.id === id)) return;
    products.push({ id, name, category: "kids", gender: "kids", subcat: "x", isNew: true, price: +pr, oldPrice: +o, discount: Math.round((1 - pr / o) * 100),
      rating: +(4.3 + (id % 5) / 10).toFixed(1), reviews: 150 + (id * 97) % 3000,
      image: `https://images.unsplash.com/photo-${KP[i % 6]}?auto=format&fit=crop&w=600&q=80`, description: `${name} for kids. Soft, safe and made to last, with easy 7-day returns.` });
    liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
  });
const _cn = window.categoryName;
window.categoryName = c => c === "kids" ? "Kids & Toys" : _cn(c);
const ks = document.createElement("section");
ks.className = "gender-fashion reveal visible"; ks.id = "kids";
ks.innerHTML = `<div class="gender-section-heading"><div><span class="section-label">LITTLE ONES</span><h2>Kids &amp; Toys</h2><p>Clothes, shoes and toys they will love.</p></div><button class="view-all" data-category="kids">View All</button></div><div class="product-grid gender-product-grid" id="kidsProductGrid"></div>`;
$("#women").after(ks);
window.renderKids = () => { $("#kidsProductGrid").innerHTML = products.filter(p => p.category === "kids").slice(0, 8).map((p, i) => productCard(p, i)).join(""); };
const _rw = window.renderWomenProducts;
window.renderWomenProducts = function () { _rw(); renderKids(); };
$(".nav-bar a[href='#women']").insertAdjacentHTML("afterend", '<a href="#kids">Kids</a>');
$(".nav-bar .menu-btn").insertAdjacentHTML("afterend", '<a href="#" id="navFlash">⚡ Flash Sale</a><a href="#" id="navGift">🎁 Gift Cards</a>');
$(".filters").insertAdjacentHTML("beforeend", '<button class="filter-btn" data-category="kids">Kids</button>');
$(".cat-rail") && $(".cat-rail").insertAdjacentHTML("beforeend", '<button data-category="kids"><span>🧸</span>Kids</button>');
searchCategory.insertAdjacentHTML("beforeend", '<option value="kids">Kids</option>');
$(".sidebar-content [data-category='innerwear']").insertAdjacentHTML("afterend", '<button data-category="kids">Kids &amp; Toys</button>');

/* ---- OUT OF STOCK + NOTIFY ME ---- */
const oos = id => id % 11 === 0 && id < 1000;
function toNotify(b, id) { b.removeAttribute("data-add-cart"); b.dataset.notify = id; b.innerHTML = "🔔 Notify Me"; }
function decorate() {
  $$("img:not([decoding])").forEach(i => i.decoding = "async");
  $$(".product-card:not([data-o])").forEach(c => {
    c.dataset.o = 1;
    const a = $("[data-add-cart]", c); if (!a || !oos(+a.dataset.addCart)) return;
    toNotify(a, a.dataset.addCart); c.classList.add("oos");
    const sl = $(".stock-left", c); if (sl) sl.remove();
    $(".product-image", c).insertAdjacentHTML("beforeend", '<span class="oos-tag">Out of Stock</span>');
  });
  $$(".mini-add[data-add-cart]").forEach(b => { if (oos(+b.dataset.addCart)) toNotify(b, b.dataset.addCart); });
}
let raf = 0;
new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; decorate(); }); }).observe(document.body, { childList: true, subtree: true });
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add-cart]");
  if (b && oos(+b.dataset.addCart)) { e.stopPropagation(); e.preventDefault(); showToast("Out of stock. Tap 🔔 Notify Me"); }
}, true);
document.addEventListener("click", e => {
  const n = e.target.closest("[data-notify]"); if (!n) return;
  const L = load("shopnovaNotify", []), id = +n.dataset.notify;
  if (!L.includes(id)) { L.push(id); save("shopnovaNotify", L); }
  n.textContent = "✅ We'll notify you"; showToast("We'll notify you when it's back 🔔");
});

/* ---- MODAL: size guide, Q&A, out of stock ---- */
const sg = modal("📏 Size Guide");
const tbl = (h, r) => `<div class="cmp-wrap"><table class="sgt"><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr>${r.map(x => `<tr>${x.map(y => `<td>${y}</td>`).join("")}</tr>`).join("")}</table></div>`;
const SG_C = tbl(["Size", "Chest (in)", "Waist (in)", "Length (in)"], [["S", "36", "30", "26"], ["M", "38", "32", "27"], ["L", "40", "34", "28"], ["XL", "42", "36", "29"]]) + "<p class='ord-empty'>Between sizes? Pick the larger one.</p>";
const SG_S = tbl(["UK", "EU", "Foot length (cm)"], [["6", "39", "24.5"], ["7", "40", "25.4"], ["8", "42", "26.2"], ["9", "43", "27.1"]]) + "<p class='ord-empty'>Measure your foot from heel to toe.</p>";
const _o = window.openProductModal;
window.openProductModal = function (id) {
  _o(id);
  const p = products.find(x => x.id === id); if (!p) return;
  const sr = $(".size-row");
  if (sr) sr.insertAdjacentHTML("afterend", `<button class="lnk" data-sg="${p.category === "shoes" ? 1 : 0}">📏 Size Guide</button>`);
  const qa = load("shopnovaQA", {})[id] || [];
  $("#modalContent").insertAdjacentHTML("beforeend", `<div class="m-extra"><h4>Questions &amp; Answers</h4>
    <div class="review"><b>Q: Is this true to size?</b><p>A: Yes. Take one size up if you are between sizes.</p></div>
    <div class="review"><b>Q: Is Cash on Delivery available?</b><p>A: Yes, COD is available on all orders.</p></div>
    ${qa.map(q => `<div class="review"><b>Q: ${q}</b><p>A: Answer pending. Our team will reply soon.</p></div>`).join("")}
    <div class="rv-form"><input id="qaIn" placeholder="Ask a question about this product..."><button id="qaSend" data-pid="${id}">Ask Question</button></div></div>`);
  if (oos(id)) {
    const b = $("button.primary-btn[data-add-cart]"); if (b) toNotify(b, id);
    const by = $(".buy-now"); if (by) by.remove();
    const ms = $(".modal-stock"); if (ms) { ms.textContent = "Out of Stock"; ms.style.color = "#e53935"; }
  }
};
document.addEventListener("click", e => {
  const g = e.target.closest("[data-sg]");
  if (g) { sg.body.innerHTML = g.dataset.sg === "1" ? SG_S : SG_C; sg.classList.add("active"); }
  const q = e.target.closest("#qaSend");
  if (q) {
    const t = esc($("#qaIn").value.trim()); if (!t) return showToast("Type your question first");
    const all = load("shopnovaQA", {}), id = +q.dataset.pid;
    (all[id] = all[id] || []).push(t); save("shopnovaQA", all); showToast("Question sent ✅"); openProductModal(id);
  }
});

/* ---- ORDERS: cancel / return ---- */
const S = load("shopnovaOrderStatus", {});
function decOrders() {
  $$("#ordList .ord").forEach(o => {
    if (o.dataset.x) return; o.dataset.x = 1;
    const id = $(".ord-h b", o).textContent, st = S[id], step = $$(".trk i.on", o).length, f = $(".ord-f", o);
    if (st) return f.insertAdjacentHTML("beforebegin", `<div class="ord-badge">${st}</div>`);
    if (step <= 2) f.insertAdjacentHTML("beforeend", `<button class="ord-x" data-oid="${id}" data-act="Cancelled">Cancel Order</button>`);
    else if (step === 4) f.insertAdjacentHTML("beforeend", `<button class="ord-x" data-oid="${id}" data-act="Return requested">Return / Refund</button>`);
  });
}
if ($("#ordList")) new MutationObserver(decOrders).observe($("#ordList"), { childList: true });
document.addEventListener("click", e => {
  const b = e.target.closest(".ord-x"); if (!b) return;
  if (b.dataset.act === "Cancelled" ? !confirm("Cancel this order?") : prompt("Reason for return? (size issue, damaged, other)") === null) return;
  S[b.dataset.oid] = b.dataset.act; save("shopnovaOrderStatus", S);
  const o = b.closest(".ord"); b.remove(); o.dataset.x = ""; decOrders();
  showToast(b.dataset.act === "Cancelled" ? "Order cancelled. Refund in 3-5 days" : "Return requested ✅");
});

/* ---- HELP CENTER / FAQ ---- */
const FAQ = [["How long does delivery take?", "Most orders arrive in 3-5 working days across India. Delivery is free above ₹999, otherwise ₹49."],
  ["How do returns and refunds work?", "You can return most items within 7 days of delivery from My Orders > Return / Refund. Refunds arrive in 3-5 days."],
  ["Can I cancel my order?", "Yes, before it is shipped. Open My Orders and tap Cancel Order."],
  ["Which payment methods are accepted?", "UPI, cards and Cash on Delivery (demo checkout)."],
  ["How do I track my order?", "Open Returns & Orders in the header to see live tracking."],
  ["How do coupons work?", "Enter a code in the cart. Try NOVA10, WELCOME200 or FREESHIP. Spin & Win gives you more."],
  ["How do I use a gift card?", "Buy one from Gift Cards, then enter its code as a coupon in your cart."],
  ["How do I pick the right size?", "Open any product and tap Size Guide."],
  ["What if an item is out of stock?", "Tap Notify Me and we will alert you when it is back."],
  ["Is my data safe?", "This is a demo site. Data stays in your own browser only."]];
const hm = modal("💬 Help Center");
hm.body.innerHTML = `<input id="hlpQ" class="hlp-q" placeholder="Search help topics..."><div id="hlpList">${FAQ.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}</div>
  <h4>Still need help?</h4><div class="rv-form"><textarea id="hlpMsg" placeholder="Write your message..."></textarea><button id="hlpSend">Send Message</button></div><p class="ord-empty">📞 1800-000-000 · ✉️ help@shopnova.demo</p>`;
function help(q) { $("#hlpQ").value = q || ""; filt(); hm.classList.add("active"); }
function filt() { const v = $("#hlpQ").value.toLowerCase(); $$("#hlpList details").forEach(d => d.style.display = d.textContent.toLowerCase().includes(v) ? "" : "none"); }
$("#hlpQ").oninput = filt;
hm.body.addEventListener("click", e => { if (e.target.id === "hlpSend") { if (!$("#hlpMsg").value.trim()) return showToast("Write a message first"); $("#hlpMsg").value = ""; showToast("Message sent ✅ We'll reply soon"); } });
const sh = $("#sidebarHelp"); if (sh) sh.onclick = () => { closeSidebar(); help(); };
$$(".footer-column a").forEach(a => { if (/Help|FAQ|Contact|Shipping|Returns/.test(a.textContent)) a.onclick = e => { e.preventDefault(); help(/Shipping|Returns/.test(a.textContent) ? a.textContent.trim() : ""); }; });

/* ---- GIFT CARDS + REFERRAL ---- */
const C = window.__coupons || {};
const regC = () => { load("shopnovaGifts", []).forEach(g => { C[g.code] = { t: "flat", v: g.amt, min: g.amt }; }); C.FRIEND100 = { t: "flat", v: 100, min: 500 }; };
regC();
const gm = modal("🎁 Gift Cards & Refer & Earn");
let amt = 1000;
function gift() {
  const u = localStorage.getItem("shopnovaUser") || "guest", gs = load("shopnovaGifts", []);
  const ref = "NOVA" + (([...u].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0) % 9000 + 1000);
  gm.body.innerHTML = `<h4>Send a Gift Card</h4><div class="flt-row">${[500, 1000, 2000, 5000].map(a => `<button class="chip5 gc-amt${a === amt ? " on" : ""}" data-a="${a}">₹${a}</button>`).join("")}</div>
    <div class="pf-form" style="margin-top:12px"><input id="gcTo" placeholder="Recipient name"><input id="gcMsg" placeholder="Message (optional)"><button id="gcBuy">Buy Gift Card (demo)</button></div>
    ${gs.map(g => `<div class="addr"><div>🎟️ <b class="code">${g.code}</b> · ${money(g.amt)}<br>For ${esc(g.to)}</div><span>Use in cart</span></div>`).join("")}
    <h4>Refer &amp; Earn</h4><p class="ord-empty" style="padding:6px 0">Give ₹100, get ₹100. Your code:</p><div class="addr"><b class="code">${ref}</b><button id="refCopy" data-c="${ref}" style="background:#dcfce7;color:#166534">Copy</button></div>
    <p class="ord-empty" style="padding:6px 0">Friends can use coupon <b>FRIEND100</b> in cart (orders above ₹500).</p>`;
  gm.classList.add("active");
}
gm.body.addEventListener("click", e => {
  const a = e.target.closest(".gc-amt"); if (a) { amt = +a.dataset.a; gift(); return; }
  if (e.target.id === "gcBuy") {
    const to = $("#gcTo").value.trim(); if (!to) return showToast("Enter the recipient's name");
    const code = "GC-" + Math.random().toString(36).slice(2, 8).toUpperCase(), gs = load("shopnovaGifts", []);
    gs.unshift({ code, amt, to, msg: $("#gcMsg").value.trim() }); save("shopnovaGifts", gs); regC(); showToast(`Gift card ${code} created 🎉`); gift();
  }
  if (e.target.id === "refCopy") { try { navigator.clipboard.writeText(e.target.dataset.c); } catch (x) {} showToast("Referral code copied"); }
});

/* ---- FLASH SALE PAGE ---- */
const fp = document.createElement("div");
fp.id = "flashPage";
fp.innerHTML = `<div class="fl-head"><button id="flClose">✕</button><h2>⚡ Flash Sale</h2><p>Grab it before it's gone!</p><div class="fl-time">Ends in <b id="flT">--:--:--</b></div></div><div class="fl-grid" id="flGrid"></div>`;
document.body.appendChild(fp);
let ft;
function flash() {
  const top = products.filter(p => !oos(p.id)).sort((a, b) => b.discount - a.discount || b.reviews - a.reviews).slice(0, 16);
  $("#flGrid").innerHTML = top.map(p => { const sold = 40 + (p.id * 13) % 55; return `<div class="fl-card"><img data-product="${p.id}" src="${p.image}" alt=""><span class="fl-off">${p.discount}% OFF</span><div class="fl-b"><span data-product="${p.id}">${p.name}</span><div><b>${money(p.price)}</b> <s>${money(p.oldPrice)}</s></div><div class="fl-bar"><i style="width:${sold}%"></i></div><small>${sold}% claimed</small><button class="mini-add" data-add-cart="${p.id}">Add to Cart</button></div></div>`; }).join("");
  fp.classList.add("show"); document.body.classList.add("gated");
  clearInterval(ft);
  const f = () => { const n = new Date(), e = new Date(n); e.setHours(Math.ceil((n.getHours() + 1) / 3) * 3, 0, 0, 0); const s = Math.max(0, Math.floor((e - n) / 1000)); $("#flT").textContent = [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, "0")).join(":"); };
  f(); ft = setInterval(f, 1000);
}
$("#flClose").onclick = () => { fp.classList.remove("show"); document.body.classList.remove("gated"); clearInterval(ft); };
$("#navFlash").onclick = e => { e.preventDefault(); flash(); };
$("#navGift").onclick = e => { e.preventDefault(); gift(); };

renderKids(); renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); decorate();
})();
