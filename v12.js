/* ShopNova v12 */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const money = n => formatPrice(n);
const hasBackend = typeof firebase !== "undefined" && typeof firebaseConfig !== "undefined" && !firebaseConfig.apiKey.includes("PASTE");
function modal(t) {
  const o = document.createElement("div"); o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal"><button class="modal-close">✕</button><h3>${t}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o); return o;
}

/* ================= NEW PRODUCTS: Home (for Him / for Her) + more Men/Women ================= */
const HM = ["1567538096630-e0c55bd6374c", "1540518614846-7eded433c457", "1555041469-a586c61ea9bc", "1513694203232-719a280e022f", "1598300042247-d088f8ab3a91", "1517487881594-2787fef5ebf7", "1604709177225-055f99402ea3", "1631889993959-41b4e9c6e3c5"];
const MF = ["1490114538077-0a7f8cb49891", "1552374196-c4e7ffc6e126", "1507003211169-0a1dd7228f2d", "1520975916090-3105956dac38"];
const WF = ["1483985988355-763728e1935b", "1496747611176-843222e1e57c", "1515372039744-b8f02a3ae446", "1529139574466-a303027c1d8b"];
const H = [
["Scented Candle Gift Set","women",899,1699],["Marble Coasters (Set of 4)","women",599,1099],["Wall Clock Minimalist","men",799,1499],
["Men's Study Desk Organizer","men",699,1299],["Her Vanity Mirror with Lights","women",1499,2799],["Men's Bar Tool Set","men",1199,2199],
["Indoor Plant Pot Set","women",699,1299],["Men's Recliner Cushion","men",999,1799],["Diffuser & Essential Oils","women",899,1599],
["Men's Tool Kit (45-pc)","men",1499,2699],["Photo Frame Collage Set","women",699,1299],["Men's BBQ Grill Set","men",1999,3599],
["Her Jewellery Organizer Box","women",799,1499],["Men's Shoe Rack (5-tier)","men",1299,2399],["Scented Reed Diffuser","women",499,899],
["Men's Wall-Mount Bottle Opener","men",399,699]
];
H.forEach((row, n) => {
  const [name, g, price, old] = row, id = 400 + n;
  if (products.some(p => p.id === id)) return;
  const pool = g === "men" ? HM : HM;
  products.push({ id, name, category: "home", gender: g, subcat: "x", isNew: true, price, oldPrice: old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.2 + (id % 6) / 10).toFixed(1), reviews: 200 + (id * 83) % 3000,
    image: `https://images.unsplash.com/photo-${pool[n % pool.length]}?auto=format&fit=crop&w=600&q=80`,
    description: `${name} — a thoughtful home addition from ShopNova, built to last with easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});
["Men's Casual Sneaker Jacket Combo|f|men|x|1999|3699","Men's Cotton Track Pants|f|men|x|799|1499","Men's Formal Tie Set|f|men|x|499|899",
 "Women's Printed Co-ord Set|f|women|x|1299|2399","Women's Embroidered Dupatta|f|women|x|599|1099","Women's Quilted Sling Bag|f|women|x|999|1899"]
  .forEach((row, n) => {
    const [name, c, g, s, price, old] = row.split("|"), id = 420 + n;
    if (products.some(p => p.id === id)) return;
    const pool = g === "men" ? MF : WF;
    products.push({ id, name, category: "fashion", gender: g, subcat: s, isNew: true, price: +price, oldPrice: +old,
      discount: Math.round((1 - price / old) * 100), rating: +(4.3 + (id % 5) / 10).toFixed(1), reviews: 150 + (id * 97) % 3000,
      image: `https://images.unsplash.com/photo-${pool[n % pool.length]}?auto=format&fit=crop&w=600&q=80`,
      description: `${name} from ShopNova. Comfortable everyday quality with easy 7-day returns.` });
    liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
  });
renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts();

/* ================= 1. MULTI-IMAGE GALLERY (distinct angles for popular items) ================= */
const GALLERY = {
  1: ["1595777457583-95e059d581b8", "1566174053879-31528523f8ae", "1515886657613-9f3515b0c78f"],
  5: ["1505740420928-5e560c06d30e", "1546868871-7041f2a55e12", "1583394838336-acd977736f90"],
  9: ["1542291026-7eec264c27ff", "1549298916-b41d501d3772", "1560769629-975ec94e6a86"],
  13: ["1556229010-6c3f2c9ca5f8", "1571781926291-c477ebfd024b", "1522335789203-aabd1fc54bc9"]
};
Object.keys(GALLERY).forEach(id => { const p = products.find(x => x.id === +id); if (p) p.images = GALLERY[id].map(i => `https://images.unsplash.com/photo-${i}?auto=format&fit=crop&w=700&q=85`); });

/* ================= 2. CHAT SUPPORT WIDGET ================= */
const FAQ2 = [[/deliver|ship/i, "Most orders arrive in 3-5 working days. Free delivery above ₹999, otherwise ₹49."],
  [/return|refund/i, "You can return items within 7 days from My Orders > Return / Refund. Refunds take 3-5 days."],
  [/cancel/i, "Open My Orders and tap Cancel Order — available before the order ships."],
  [/coupon|discount|offer/i, "Try NOVA10, WELCOME200 or FREESHIP in your cart, or spin the Spin & Win wheel 🎁."],
  [/size/i, "Open any product and tap 📏 Size Guide for the measurement chart."],
  [/track/i, "Open \"Returns & Orders\" in the header to see live order tracking."],
  [/pay|payment|cod/i, "We accept UPI, Cards and Cash on Delivery."],
  [/stock|available/i, "If an item shows \"Notify Me\", tap it and we'll alert you when it's back in stock."],
  [/.*/, "I'm a simple demo assistant 🙂 Try asking about delivery, returns, coupons, sizing or order tracking — or open the full Help Center for more."]];
const cw = document.createElement("div"); cw.className = "chat-wrap";
cw.innerHTML = `<div class="chat-box"><div class="chat-head"><b>🛍️ ShopNova Assistant</b><button id="chatClose">✕</button></div><div class="chat-body" id="chatBody"><div class="chat-msg bot">Hi! Ask me about delivery, returns, coupons or sizing.</div></div><form class="chat-in" id="chatForm"><input id="chatInput" placeholder="Type a message..."><button type="submit">➤</button></form></div><button class="chat-fab" id="chatFab">💬</button>`;
document.body.appendChild(cw);
$("#chatFab").onclick = () => { cw.classList.toggle("open"); };
$("#chatClose").onclick = () => cw.classList.remove("open");
$("#chatForm").onsubmit = e => {
  e.preventDefault();
  const v = $("#chatInput").value.trim(); if (!v) return;
  const body = $("#chatBody");
  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${v.replace(/</g, "&lt;")}</div>`);
  $("#chatInput").value = "";
  const reply = (FAQ2.find(f => f[0].test(v)) || FAQ2[FAQ2.length - 1])[1];
  setTimeout(() => { body.insertAdjacentHTML("beforeend", `<div class="chat-msg bot">${reply}</div>`); body.scrollTop = body.scrollHeight; }, 500);
  body.scrollTop = body.scrollHeight;
};

/* ================= 3. ORDER INVOICE (printable) ================= */
const im = modal("🧾 Invoice");
function showInvoice(order) {
  const taxable = Math.round((order.total || 0) / 1.18), gst = (order.total || 0) - taxable;
  im.body.innerHTML = `<div class="inv-doc"><div class="inv-top"><div><b>ShopNova Retail</b><br><small>GSTIN: DEMO1234ABC1Z5</small></div><div class="inv-right"><b>INVOICE</b><br><small>${order.orderId || order.id}</small></div></div>
  <hr><p><b>Date:</b> ${new Date(order.ts || Date.now()).toLocaleDateString("en-IN")} &nbsp; <b>Payment:</b> ${order.pay || "—"}</p>
  <table class="sgt" style="width:100%"><tr><th style="text-align:left">Item</th><th>Qty</th><th>Amount</th></tr>
  ${(order.items || []).map(it => { const p = products.find(x => x.id === it.id); return `<tr><td style="text-align:left">${it.name || (p && p.name) || "Item"}</td><td>${it.quantity}</td><td>${p ? money(p.price * it.quantity) : ""}</td></tr>`; }).join("")}</table>
  <div class="inv-tot"><div>Taxable value <span>${money(taxable)}</span></div><div>GST (18%) <span>${money(gst)}</span></div><div class="inv-grand">Total <span>${money(order.total || 0)}</span></div></div>
  <p class="ord-empty">Thank you for shopping with ShopNova!</p></div><button class="checkout-next-btn" id="invPrint">🖨️ Print / Save as PDF</button>`;
  im.classList.add("active");
}
$("#invPrint") || document.addEventListener("click", e => { if (e.target.id === "invPrint") window.print(); });
document.addEventListener("click", e => {
  const o = e.target.closest(".ord"); if (!o) return;
  if (e.target.closest("select, button:not(.inv-trigger)")) return;
  const idTxt = $(".ord-h b", o); if (!idTxt) return;
  const list = load("shopnovaOrders", []), found = list.find(x => x.id === idTxt.textContent.trim());
  if (found) showInvoice(found);
});

/* ================= 4. REFERRAL WALLET ================= */
let wallet = load("shopnovaWallet", 0);
function addWallet(n) { wallet += n; save("shopnovaWallet", wallet); }
if (!load("shopnovaWalletWelcome", false)) { addWallet(0); save("shopnovaWalletWelcome", true); }
const _rc12 = window.renderCart;
if (_rc12) window.renderCart = function () {
  _rc12();
  const f = $(".cart-footer"); if (!f || wallet <= 0) return;
  if ($("#walletBox")) return;
  f.prepend(`<div id="walletBox" class="wallet-box">💰 Wallet balance: <b>${money(wallet)}</b> <button id="useWallet">Use in this order</button></div>`.trim());
  const box = $("#walletBox"); if (box) f.prepend(box);
};
document.addEventListener("click", e => {
  if (e.target.id !== "useWallet") return;
  const use = Math.min(wallet, 500);
  wallet -= use; save("shopnovaWallet", wallet);
  showToast(`${money(use)} applied from wallet 💰`); renderCart();
});

/* ================= 5. PRODUCT PREVIEW ANIMATION (simulated — not a real video file) ================= */
const _opm12 = window.openProductModal;
window.openProductModal = function (id) {
  _opm12(id);
  const mi = $(".modal-image"); if (!mi || $(".preview-btn", mi)) return;
  mi.insertAdjacentHTML("beforeend", '<button class="preview-btn" title="Simulated 360 preview, not an actual video">▶ Preview</button>');
};
document.addEventListener("click", e => {
  const b = e.target.closest(".preview-btn"); if (!b) return;
  const mi = b.closest(".modal-image");
  mi.classList.toggle("previewing");
  b.textContent = mi.classList.contains("previewing") ? "⏸ Stop" : "▶ Preview";
});

/* ================= 6. LIVE "RECENTLY SOLD" TICKER ================= */
const tk = document.createElement("div"); tk.className = "sold-ticker";
document.body.appendChild(tk);
function tickerText() {
  const p = products[Math.floor(Math.random() * products.length)];
  const names = ["Aman", "Priya", "Rohit", "Sneha", "Vikram", "Anjali", "Karan", "Divya"];
  const cities = ["Mumbai", "Delhi", "Pune", "Ahmedabad", "Chennai", "Surat"];
  return `🛒 ${names[Math.floor(Math.random() * 8)]} from ${cities[Math.floor(Math.random() * 6)]} just bought ${p.name}`;
}
function pushTicker() {
  const el = document.createElement("span"); el.textContent = tickerText();
  tk.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}
setInterval(pushTicker, 4500); pushTicker();

/* ================= 7. THIRD LANGUAGE: GUJARATI ================= */
const GU = { "Today's Deals": "આજની ડીલ્સ", "Best Sellers": "બેસ્ટ સેલર", "Categories": "શ્રેણીઓ", "Men": "પુરુષ", "Women": "સ્ત્રી",
  "Fashion": "ફેશન", "Add to Cart": "કાર્ટમાં ઉમેરો", "Your Cart": "તમારો કાર્ટ", "Popular Products": "લોકપ્રિય ઉત્પાદનો",
  "Search": "શોધો", "Cart": "કાર્ટ", "Wishlist": "વિશલિસ્ટ", "Sign In": "સાઇન ઇન", "Buy Now": "હમણાં ખરીદો" };
const lbtn = $(".language");
if (lbtn) {
  lbtn.replaceWith(lbtn.cloneNode(true));
  const nl = $(".language");
  nl.onclick = () => {
    const cur = load("shopnovaLang", "en"), next = { en: "hi", hi: "gu", gu: "en" }[cur] || "en";
    save("shopnovaLang", next);
    const s = $("small", nl); if (s) s.textContent = { en: "EN", hi: "हिं", gu: "ગુજ" }[next];
    if (next === "gu") {
      document.querySelectorAll("*").forEach(() => {});
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) { const t = n.nodeValue.trim(); if (GU[t]) n.nodeValue = n.nodeValue.replace(t, GU[t]); }
      showToast("ભાષા: ગુજરાતી");
    } else location.reload();
  };
}

/* ================= 8. SAVED CARDS (demo only — last 4 digits, never full PAN) ================= */
const cm2 = modal("💳 Saved Cards (Demo)");
function cardsUI() {
  const cards = load("shopnovaCards", []);
  cm2.body.innerHTML = `<p class="ord-empty">Demo only — we never ask for or store a full card number, CVV or OTP.</p>
  ${cards.map((c, i) => `<div class="addr"><div>💳 ${c.brand} •••• ${c.last4}<br>${c.name}</div><button data-delcard="${i}">Remove</button></div>`).join("")}
  <div class="pf-form"><input id="cdName" placeholder="Name on card"><select id="cdBrand"><option>Visa</option><option>Mastercard</option><option>RuPay</option></select><input id="cdLast4" maxlength="4" placeholder="Last 4 digits only"><button id="cdSave">Save Card (demo)</button></div>`;
  cm2.classList.add("active");
}
cm2.body.addEventListener("click", e => {
  if (e.target.closest("[data-delcard]")) { const c = load("shopnovaCards", []); c.splice(+e.target.dataset.delcard, 1); save("shopnovaCards", c); cardsUI(); }
  if (e.target.id === "cdSave") {
    const name = $("#cdName").value.trim(), last4 = $("#cdLast4").value.trim();
    if (!name || !/^\d{4}$/.test(last4)) return showToast("Enter a name and exactly 4 digits");
    const c = load("shopnovaCards", []); c.push({ name, brand: $("#cdBrand").value, last4 }); save("shopnovaCards", c); cardsUI();
  }
});
const sh12 = $("#sidebarHelp");
if (sh12) sh12.insertAdjacentHTML("afterend", '<button id="sbCards">💳 Saved Cards</button><button id="sbLoyalty">⭐ Loyalty Points</button>');
const cardsBtn = $("#sbCards"); if (cardsBtn) cardsBtn.onclick = () => { closeSidebar(); cardsUI(); };

/* ================= 9. LOYALTY POINTS ================= */
let points = load("shopnovaPoints", 0);
function earnPoints(total) { points += Math.floor(total / 10); save("shopnovaPoints", points); }
document.addEventListener("click", e => {
  if (!e.target.closest("#placeOrderBtn")) return;
  const totalTxt = ($("#checkoutGrandTotal") || {}).textContent || "0";
  setTimeout(() => earnPoints(+totalTxt.replace(/[^0-9]/g, "")), 400);
});
const lm2 = modal("⭐ Loyalty Points");
function loyaltyUI() {
  lm2.body.innerHTML = `<p class="ord-empty">You earn 1 point for every ₹10 spent. 100 points = ₹50 off.</p><h2 style="text-align:center">${points} pts</h2>
  <button class="checkout-next-btn" id="redeemPts" ${points < 100 ? "disabled style='opacity:.5'" : ""}>Redeem 100 pts for ₹50 wallet credit</button>`;
  lm2.classList.add("active");
}
const loyBtn = $("#sbLoyalty"); if (loyBtn) loyBtn.onclick = () => { closeSidebar(); loyaltyUI(); };
lm2.body.addEventListener("click", e => {
  if (e.target.id !== "redeemPts" || points < 100) return;
  points -= 100; save("shopnovaPoints", points); addWallet(50); showToast("₹50 added to your wallet 💰"); loyaltyUI();
});

/* ================= 10. GOOGLE SOCIAL LOGIN ================= */
if (hasBackend) {
  const gForm = $('.g-form[data-f="in"]');
  if (gForm && !$(".google-btn", gForm.parentNode)) {
    gForm.insertAdjacentHTML("afterend", '<button type="button" class="google-btn">🔵 Continue with Google</button>');
    $(".google-btn").onclick = () => {
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(err => showToast(err.message || "Google sign-in failed"));
    };
  }
}
})();
