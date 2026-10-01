/* ShopNova v5 */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const money = n => formatPrice(n);
let lang = load("shopnovaLang", "en");
function modal(title) {
  const o = document.createElement("div");
  o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal"><button class="modal-close">✕</button><h3>${title}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o);
  return o;
}

/* 1. FLY TO CART */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add-cart]"); if (!b) return;
  const img = (b.closest(".product-card,.sim-card,.modal-product,.cmp-wrap") || document).querySelector("img");
  const t = $(".cart-icon"); if (!img || !t) return;
  const r = img.getBoundingClientRect(), c = t.getBoundingClientRect(), s = Math.min(150, r.width);
  const f = document.createElement("img");
  f.src = img.src; f.className = "fly";
  f.style.cssText = `left:${r.left}px;top:${r.top}px;width:${s}px;height:${s}px`;
  document.body.appendChild(f);
  f.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${c.left - r.left}px,${c.top - r.top}px) scale(.1)`, opacity: .3 }],
    { duration: 800, easing: "cubic-bezier(.5,0,.8,.4)" }).onfinish = () => f.remove();
});

/* 2. COMPARE */
let cmp = load("shopnovaCmp", []);
const cbar = document.createElement("div"); cbar.className = "cmp-bar"; document.body.appendChild(cbar);
const cm = modal("⚖️ Compare Products");
function cmpUI() {
  $$(".cmp-btn").forEach(b => b.classList.toggle("on", cmp.includes(+b.dataset.cmp)));
  cbar.style.display = cmp.length ? "flex" : "none";
  cbar.innerHTML = `<span>⚖️ ${cmp.length}/3 selected</span><button id="cmpGo">Compare Now</button><button id="cmpClr">Clear</button>`;
}
function toggleCmp(id) {
  if (cmp.includes(id)) cmp = cmp.filter(x => x !== id);
  else { if (cmp.length >= 3) return showToast("You can compare up to 3 products"); cmp.push(id); }
  save("shopnovaCmp", cmp); cmpUI();
}
cbar.onclick = e => {
  if (e.target.id === "cmpClr") { cmp = []; save("shopnovaCmp", cmp); cmpUI(); }
  if (e.target.id === "cmpGo") {
    if (cmp.length < 2) return showToast("Select at least 2 products");
    const L = cmp.map(id => products.find(p => p.id === id)).filter(Boolean);
    const row = (t, f) => `<tr><th>${t}</th>${L.map(p => `<td>${f(p)}</td>`).join("")}</tr>`;
    cm.body.innerHTML = `<div class="cmp-wrap"><table>${row("", p => `<img src="${p.image}" alt=""><b>${p.name}</b>`)}${row("Price", p => money(p.price))}${row("MRP", p => `<s>${money(p.oldPrice)}</s>`)}${row("Discount", p => p.discount + "% OFF")}${row("Rating", p => p.rating + " ★")}${row("Reviews", p => p.reviews)}${row("Category", p => categoryName(p.category))}${row("", p => `<button class="mini-add" data-add-cart="${p.id}">Add to Cart</button>`)}</table></div>`;
    cm.classList.add("active");
  }
};
function decorate() {
  $$(".product-card:not([data-d])").forEach(c => {
    c.dataset.d = 1;
    const a = c.querySelector("[data-add-cart]"), im = c.querySelector(".product-image"); if (!a || !im) return;
    const id = +a.dataset.addCart, b = document.createElement("button");
    b.className = "cmp-btn"; b.dataset.cmp = id; b.title = "Compare"; b.textContent = "⚖️";
    b.onclick = e => { e.stopPropagation(); toggleCmp(id); };
    b.classList.toggle("on", cmp.includes(id)); im.appendChild(b);
  });
}

/* 3. HINDI / ENGLISH */
const HI = { "Today's Deals": "आज के ऑफ़र", "Best Sellers": "बेस्ट सेलर", "Categories": "श्रेणियां", "Men": "पुरुष", "Women": "महिला", "Fashion": "फ़ैशन",
  "Electronics": "इलेक्ट्रॉनिक्स", "Home": "होम", "Beauty": "ब्यूटी", "Gaming": "गेमिंग", "Innerwear": "इनरवियर", "Shop by Category": "श्रेणी के अनुसार खरीदें",
  "Add to Cart": "कार्ट में डालें", "Quick View": "झलक देखें", "Your Cart": "आपका कार्ट", "Proceed to Checkout": "चेकआउट करें", "Subtotal:": "कुल:",
  "Popular Products": "लोकप्रिय प्रोडक्ट", "Men's Fashion": "पुरुषों का फ़ैशन", "Women's Fashion": "महिलाओं का फ़ैशन", "Shop by Budget": "बजट के अनुसार खरीदें",
  "Recently Viewed": "हाल में देखे गए", "Fast Delivery": "तेज़ डिलीवरी", "Secure Shopping": "सुरक्षित खरीदारी", "Easy Returns": "आसान रिटर्न", "24/7 Support": "24/7 सहायता",
  "Sort by": "क्रम", "Search": "खोजें", "Trending:": "ट्रेंडिंग:", "Cart": "कार्ट", "Returns": "रिटर्न", "Shop Now": "अभी खरीदें", "View All": "सभी देखें",
  "Continue as Guest": "गेस्ट के रूप में जारी रखें", "Sign In": "साइन इन", "Create Account": "खाता बनाएं", "Customer Service": "ग्राहक सेवा", "Wishlist": "विशलिस्ट",
  "Buy Now": "अभी खरीदें", "Products": "प्रोडक्ट", "Get Offers": "ऑफ़र पाएं", "Our Collection": "हमारा कलेक्शन", "Shipping Address": "डिलीवरी पता", "Review Your Order": "ऑर्डर देखें" };
const orig = new WeakMap();
function tr(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), ns = [];
  while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n => {
    const t = n.nodeValue.trim();
    if (lang === "hi") { if (HI[t]) { if (!orig.has(n)) orig.set(n, n.nodeValue); n.nodeValue = n.nodeValue.replace(t, HI[t]); } }
    else if (orig.has(n)) { n.nodeValue = orig.get(n); orig.delete(n); }
  });
}
const lb = $(".language");
function langUI() { const s = $("small", lb); if (s) s.textContent = lang === "hi" ? "हिं" : "EN"; }
if (lb) lb.onclick = () => { lang = lang === "hi" ? "en" : "hi"; save("shopnovaLang", lang); langUI(); tr(document.body); showToast(lang === "hi" ? "भाषा: हिन्दी" : "Language: English"); };
let raf = 0;
new MutationObserver(ms => {
  if (lang === "hi") ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && tr(n)));
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; decorate(); });
}).observe(document.body, { childList: true, subtree: true });

/* 4. GALLERY + ZOOM + REVIEWS */
const _o = window.openProductModal;
window.openProductModal = function (id) {
  _o(id);
  const p = products.find(x => x.id === id), mi = $(".modal-image"); if (!p || !mi) return;
  const im = $("img", mi), imgs = p.images || [p.image, p.image, p.image], pos = ["center", "top", "bottom"];
  mi.insertAdjacentHTML("beforeend", `<div class="thumbs">${imgs.map((s, i) => `<img src="${s}" data-pos="${pos[i % 3]}" class="${i ? "" : "on"}" alt="">`).join("")}</div>`);
  mi.onmousemove = e => { const r = mi.getBoundingClientRect(); im.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; im.style.transform = "scale(2)"; };
  mi.onmouseleave = () => { im.style.transform = ""; };
  $(".thumbs", mi).onclick = e => {
    const t = e.target.closest("img"); if (!t) return;
    im.src = t.src; im.style.objectPosition = t.dataset.pos;
    $$(".thumbs img", mi).forEach(x => x.classList.toggle("on", x === t));
  };
  const mine = load("shopnovaReviews", {})[id] || [];
  $("#modalContent").insertAdjacentHTML("beforeend", `<div class="m-extra"><h4>Write a Review</h4>${mine.map(r => `<div class="review"><b>${r.n}</b> <span class="stars">${stars(r.s)}</span><p>${r.t}</p></div>`).join("")}
    <div class="rv-form"><div class="rv-stars" data-s="5">${[1, 2, 3, 4, 5].map(n => `<button data-star="${n}" class="on">★</button>`).join("")}</div><textarea id="rvText" placeholder="Share your experience..."></textarea><button id="rvSend" data-pid="${id}">Submit Review</button></div></div>`);
  if (lang === "hi") tr($("#modalContent"));
};
document.addEventListener("click", e => {
  const st = e.target.closest("[data-star]");
  if (st) { const box = st.parentNode; box.dataset.s = st.dataset.star; $$("button", box).forEach(b => b.classList.toggle("on", +b.dataset.star <= +st.dataset.star)); return; }
  const sd = e.target.closest("#rvSend"); if (!sd) return;
  const t = $("#rvText").value.trim().replace(/</g, "&lt;");
  if (!t) return showToast("Please write something first");
  const all = load("shopnovaReviews", {}), id = +sd.dataset.pid;
  (all[id] = all[id] || []).unshift({ n: localStorage.getItem("shopnovaUser") || "You", s: +$(".rv-stars").dataset.s, t });
  save("shopnovaReviews", all); showToast("Thanks for your review ⭐"); openProductModal(id);
});

/* 5. SPIN & WIN */
const wm = modal("🎁 Spin & Win");
const PR = [["NOVA10", "10% OFF"], ["FREESHIP", "Free Ship"], ["", "😅"], ["WELCOME200", "₹200 OFF"], ["NOVA10", "10% OFF"], ["FREESHIP", "Free Ship"]];
wm.body.innerHTML = `<div class="wheel-wrap"><div class="pointer">▼</div><div class="wheel" id="wheel">${PR.map((p, i) => `<span style="transform:rotate(${i * 60 + 30}deg) translateY(-88px)">${p[1]}</span>`).join("")}</div></div><button id="spinGo" class="spin-btn">SPIN NOW</button><p id="spinRes"></p>`;
let rot = 0;
function spin() {
  const day = new Date().toDateString(), res = $("#spinRes");
  if (load("shopnovaSpin", "") === day) { res.textContent = "You already spun today. Come back tomorrow! 🙂"; return; }
  save("shopnovaSpin", day);
  const i = Math.floor(Math.random() * 6);
  rot = rot - (rot % 360) + 360 * 5 + (360 - (i * 60 + 30));
  $("#wheel").style.transform = `rotate(${rot}deg)`;
  res.textContent = "Spinning...";
  setTimeout(() => {
    res.innerHTML = PR[i][0] ? `🎉 You won <b>${PR[i][1]}</b>!<br>Coupon code: <b class="code">${PR[i][0]}</b><br><small>Apply it in your cart.</small>` : "Better luck next time! 😅";
  }, 4600);
}
wm.body.addEventListener("click", e => { if (e.target.id === "spinGo") spin(); });
const fab = document.createElement("button"); fab.className = "spin-fab"; fab.textContent = "🎁"; fab.title = "Spin & Win";
fab.onclick = () => wm.classList.add("active"); document.body.appendChild(fab);

/* 6. PROFILE + SAVED ADDRESSES */
const pm = modal("👤 My Profile");
let addrs = load("shopnovaAddrs", []);
function profile() {
  const u = localStorage.getItem("shopnovaUser") || "Guest";
  pm.body.innerHTML = `<p class="pf-hi">Hello, <b>${u}</b></p><h4>Saved Addresses</h4>${addrs.map((a, i) => `<div class="addr"><div><b>${a.n}</b> · ${a.p}<br>${a.a}, ${a.c} - ${a.z}</div><button data-deladdr="${i}">Delete</button></div>`).join("") || "<p class='ord-empty'>No saved addresses yet</p>"}
  <h4>Add New Address</h4><div class="pf-form"><input id="pfN" placeholder="Full name"><input id="pfP" placeholder="Phone"><input id="pfA" placeholder="Address"><input id="pfC" placeholder="City"><input id="pfZ" placeholder="Pincode"><button id="pfSave">Save Address</button></div>`;
  pm.classList.add("active");
}
pm.body.addEventListener("click", e => {
  const d = e.target.closest("[data-deladdr]");
  if (d) { addrs.splice(+d.dataset.deladdr, 1); save("shopnovaAddrs", addrs); profile(); }
  if (e.target.id === "pfSave") {
    const a = { n: $("#pfN").value.trim(), p: $("#pfP").value.trim(), a: $("#pfA").value.trim(), c: $("#pfC").value.trim(), z: $("#pfZ").value.trim() };
    if (Object.values(a).some(x => !x)) return showToast("Please fill all address fields");
    addrs.push(a); save("shopnovaAddrs", addrs); profile();
  }
});
const _oc = window.openCheckoutModal;
window.openCheckoutModal = function () {
  _oc();
  const h = $('[data-panel="1"] h3'); if (!h) return;
  let s = $("#addrSel");
  if (!s) {
    s = document.createElement("select"); s.id = "addrSel"; s.className = "addr-sel"; h.after(s);
    s.onchange = () => { const a = addrs[+s.value]; if (!a) return; $("#checkoutName").value = a.n; $("#checkoutPhone").value = a.p; $("#checkoutAddress").value = a.a; $("#checkoutCity").value = a.c; $("#checkoutPincode").value = a.z; };
  }
  s.innerHTML = `<option value="">${addrs.length ? "Use a saved address" : "No saved addresses (add in My Profile)"}</option>` + addrs.map((a, i) => `<option value="${i}">${a.n}, ${a.c} - ${a.z}</option>`).join("");
};
document.addEventListener("click", e => {
  if (!e.target.closest("#toStep2")) return;
  const a = { n: $("#checkoutName").value.trim(), p: $("#checkoutPhone").value.trim(), a: $("#checkoutAddress").value.trim(), c: $("#checkoutCity").value.trim(), z: $("#checkoutPincode").value.trim() };
  if (Object.values(a).every(Boolean) && !addrs.some(x => x.a === a.a && x.z === a.z)) { addrs.push(a); save("shopnovaAddrs", addrs); }
}, true);

/* 7. VOICE SEARCH */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function mic(form, inp) {
  if (!form || !inp) return;
  const ref = form.querySelector("#searchBtn, button[type=submit]"), b = document.createElement("button");
  b.type = "button"; b.className = "mic-btn"; b.innerHTML = '<i class="fa-solid fa-microphone"></i>'; b.title = "Voice search";
  b.onclick = () => {
    if (!SR) return showToast("Voice search is not supported in this browser");
    const r = new SR(); r.lang = lang === "hi" ? "hi-IN" : "en-IN"; b.classList.add("on");
    r.onresult = e => { const q = e.results[0][0].transcript; inp.value = q; searchInput.value = q; searchCategory.value = "all"; performSearch(); };
    r.onend = () => b.classList.remove("on"); r.onerror = () => showToast("Could not hear you, try again");
    r.start();
  };
  form.insertBefore(b, ref);
}
mic($(".search-box"), searchInput); mic($("#fhForm"), $("#fhInput"));

/* 8. ADMIN PANEL */
const am = modal("🛠️ Admin Panel");
let custom = load("shopnovaAdmin", []);
function addP(p) {
  if (products.some(x => x.id === p.id)) return;
  products.push(p); liveViewerCounts[p.id] = 10 + Math.floor(Math.random() * 30); liveStockLevels[p.id] = 10 + Math.floor(Math.random() * 20);
}
custom.forEach(addP);
function rerender() { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); }
let adminOk = false;
function admin() {
  if (!adminOk) { if (prompt("Admin PIN (demo PIN: 1234)") !== "1234") return showToast("Wrong PIN"); adminOk = true; }
  am.body.innerHTML = `<div class="pf-form"><input id="adN" placeholder="Product name"><select id="adC">${["fashion", "electronics", "shoes", "beauty", "home", "gaming", "books", "innerwear"].map(c => `<option>${c}</option>`).join("")}</select><select id="adG"><option>men</option><option>women</option></select><input id="adP" type="number" placeholder="Price ₹"><input id="adO" type="number" placeholder="MRP ₹ (optional)"><input id="adI" placeholder="Image URL"><input id="adF" type="file" accept="image/*"><button id="adSave">Add Product</button></div><h4>Your Products (${custom.length})</h4>${custom.map((p, i) => `<div class="addr"><div><b>${p.name}</b> · ${money(p.price)}</div><button data-delp="${i}">Delete</button></div>`).join("")}`;
  am.classList.add("active");
}
function readImg(f, cb) {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / im.width), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", .8)); }; im.src = r.result; };
  r.readAsDataURL(f);
}
am.body.addEventListener("click", e => {
  const d = e.target.closest("[data-delp]");
  if (d) { const p = custom.splice(+d.dataset.delp, 1)[0]; products.splice(products.findIndex(x => x.id === p.id), 1); save("shopnovaAdmin", custom); rerender(); admin(); return; }
  if (e.target.id !== "adSave") return;
  const name = $("#adN").value.trim(), price = +$("#adP").value, f = $("#adF").files[0];
  if (!name || price <= 0) return showToast("Enter product name and price");
  const fin = img => {
    if (!img) return showToast("Add an image URL or choose a file");
    const old = +$("#adO").value > price ? +$("#adO").value : Math.round(price * 1.5);
    const p = { id: 1000 + Math.floor(Math.random() * 1e6), name, category: $("#adC").value, gender: $("#adG").value, subcat: "x", isNew: true, price, oldPrice: old,
      discount: Math.round((1 - price / old) * 100), rating: 4.5, reviews: 10, image: img, description: `${name} — added from the ShopNova admin panel.` };
    custom.push(p); addP(p); save("shopnovaAdmin", custom); rerender(); showToast("Product added ✅"); admin();
  };
  f ? readImg(f, fin) : fin($("#adI").value.trim());
});

/* 9. SIDEBAR LINKS */
const sh = $("#sidebarHelp");
if (sh) {
  sh.insertAdjacentHTML("afterend", '<button id="sbProfile">👤 My Profile</button><button id="sbSpin">🎁 Spin &amp; Win</button><button id="sbAdmin">🛠️ Admin Panel</button>');
  $("#sbProfile").onclick = () => { closeSidebar(); profile(); };
  $("#sbSpin").onclick = () => { closeSidebar(); wm.classList.add("active"); };
  $("#sbAdmin").onclick = () => { closeSidebar(); admin(); };
}

/* 10. SIDEBAR-STYLE FILTERS: brand, colour, size */
const BR = ["Nova Basics", "UrbanEdge", "StyleHub", "TechPro", "HomeNest", "GlowUp"];
const COL = [["Black", "#111"], ["White", "#f5f5f5"], ["Blue", "#2563eb"], ["Red", "#dc2626"], ["Green", "#16a34a"], ["Pink", "#ec4899"], ["Brown", "#92400e"]];
const SZ = ["S", "M", "L", "XL", "6", "7", "8", "9"];
function attrs(p) {
  if (p.brand) return p;
  p.brand = BR[p.id % 6];
  p.color = (COL.find(c => p.name.toLowerCase().includes(c[0].toLowerCase())) || COL[(p.id * 3) % 7])[0];
  const base = p.category === "shoes" ? SZ.slice(4) : ["fashion", "innerwear"].includes(p.category) ? SZ.slice(0, 4) : [];
  p.sizes = base.filter((_, i) => (p.id + i) % 4 !== 0);
  return p;
}
const fb = new Set(), fc = new Set(), fs = new Set();
window.__extra = p => { attrs(p); return (!fb.size || fb.has(p.brand)) && (!fc.size || fc.has(p.color)) && (!fs.size || p.sizes.some(s => fs.has(s))); };
const bar = $(".sort-bar");
if (bar) {
  bar.insertAdjacentHTML("afterbegin", '<button id="fltToggle" class="flt-toggle">🎛️ Filters</button>');
  const panel = document.createElement("div"); panel.className = "flt-panel";
  const grp = (t, a, k) => `<div><b>${t}</b><div class="flt-row">${a.map(x => k === "c" ? `<button class="sw" data-f="c" data-v="${x[0]}" title="${x[0]}" style="background:${x[1]}"></button>` : `<button class="chip5" data-f="${k}" data-v="${x}">${x}</button>`).join("")}</div></div>`;
  panel.innerHTML = grp("Brand", BR, "b") + grp("Colour", COL, "c") + grp("Size", SZ, "s") + '<button id="fltClr" class="chip5">Clear all</button>';
  bar.after(panel);
  $("#fltToggle").onclick = () => panel.classList.toggle("open");
  panel.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.id === "fltClr") { fb.clear(); fc.clear(); fs.clear(); $$(".flt-panel .on").forEach(x => x.classList.remove("on")); }
    else { const s = { b: fb, c: fc, s: fs }[b.dataset.f]; s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); b.classList.toggle("on"); }
    window.__fk = [...fb, ...fc, ...fs].join();
    renderProducts(true);
  };
}

/* 11. PWA */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});

langUI(); if (lang === "hi") tr(document.body);
decorate(); cmpUI(); rerender();
})();
