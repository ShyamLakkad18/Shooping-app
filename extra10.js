/* ShopNova v10 — realism features */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };

/* ---- 1. GST / tax-inclusive pricing everywhere ---- */
function gstLine(total) {
  const taxable = total / 1.18, gst = total - taxable;
  return `<div class="gst-line">Inclusive of GST: ${formatPrice(Math.round(gst))} (18%) on taxable value ${formatPrice(Math.round(taxable))}</div>`;
}
$$(".modal-price, .price").forEach(() => {}); /* no-op placeholder to keep structure consistent */
const _rr2 = window.renderCheckoutReview;
if (_rr2) window.renderCheckoutReview = function () {
  _rr2();
  const old = $("#gstBox"); if (old) old.remove();
  const t = $("#checkoutGrandTotal"); if (!t) return;
  const val = +((t.textContent || "0").replace(/[^0-9]/g, "")) || 0;
  t.closest(".checkout-summary").insertAdjacentHTML("beforeend", `<div id="gstBox">${gstLine(val)}</div>`);
};
const _opm = window.openProductModal;
window.openProductModal = function (id) {
  _opm(id);
  const mp = $(".modal-price"); if (mp && !$(".gst-line", mp.parentNode)) mp.insertAdjacentHTML("afterend", gstLine(products.find(p => p.id === id) ? products.find(p => p.id === id).price : 0));
  const cat = $(".product-category", $(".modal-details")); if (cat) cat.insertAdjacentHTML("afterend", `<div class="sold-by">Sold by <b>ShopNova Retail</b> · 4.6★ Seller Rating</div>`);
};

/* ---- 2. Pincode serviceability (checkout + modal check) ---- */
function serviceable(pin) {
  if (!/^\d{6}$/.test(pin)) return null;
  const sum = [...pin].reduce((a, d) => a + (+d), 0);
  return sum % 11 !== 0; /* deterministic "fake but consistent" demo rule */
}
document.addEventListener("click", e => {
  if (!e.target.closest("#toStep2")) return;
  const pin = ($("#checkoutPincode") || {}).value || "";
  const ok = serviceable(pin.trim());
  if (ok === false) { e.stopImmediatePropagation(); e.preventDefault(); showToast("Sorry, we don't deliver to this pincode yet"); }
}, true);

/* ---- 3. Verified purchase tag + brand/seller line in reviews ---- */
let raf = 0;
function decorate() {
  $$(".review:not([data-vd])").forEach(r => {
    r.dataset.vd = 1;
    if (r.querySelector("b") && !r.querySelector(".verified-tag") && /^[A-Z][a-z]+ [A-Z]\.$/.test((r.querySelector("b").textContent || "").trim())) {
      r.querySelector("b").insertAdjacentHTML("afterend", ' <span class="verified-tag">✅ Verified Purchase</span>');
    }
  });
}
new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; decorate(); }); }).observe(document.body, { childList: true, subtree: true });

/* ---- 4. Notifications: order placed + back-in-stock (uses existing Notify Me list) ---- */
let notifAsked = load("shopnovaNotifAsked", false);
function askNotif() {
  if (notifAsked || !("Notification" in window) || Notification.permission !== "default") return;
  notifAsked = true; save("shopnovaNotifAsked", true);
  const b = document.createElement("div");
  b.className = "notif-ask";
  b.innerHTML = `<span>🔔 Get notified about your orders and restocks?</span><button id="notifYes">Allow</button><button id="notifNo">Not now</button>`;
  document.body.appendChild(b);
  b.onclick = e => { if (e.target.id === "notifYes") Notification.requestPermission(); b.remove(); };
  setTimeout(() => b.remove(), 12000);
}
setTimeout(askNotif, 8000);
function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") { try { new Notification(title, { body, icon: "icon.svg" }); } catch (e) {} }
}
document.addEventListener("click", e => { if (e.target.closest("#placeOrderBtn")) setTimeout(() => notify("Order placed! 🎉", "We'll keep you posted on delivery."), 300); });
document.addEventListener("click", e => { if (e.target.closest("[data-notify]")) notify("You're on the list 🔔", "We'll notify you when this item is back in stock."); });

/* ---- 5. Abandoned cart nudge ---- */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const last = +load("shopnovaCartTs", 0);
  if (cart && cart.length && Date.now() - last > 120000 && Date.now() - last < 3600000) showToast("🛒 You still have items waiting in your cart");
});
const _ac = window.addToCart;
if (_ac) window.addToCart = function (id) { _ac(id); save("shopnovaCartTs", Date.now()); };

/* ---- 6. Offline / online banner ---- */
const ob = document.createElement("div"); ob.className = "offline-bar"; ob.textContent = "⚠️ You're offline — showing cached content";
document.body.appendChild(ob);
function netState() { ob.classList.toggle("show", !navigator.onLine); }
window.addEventListener("online", netState); window.addEventListener("offline", netState); netState();

/* ---- 7. Analytics (GA4) ---- */
if (typeof GA_MEASUREMENT_ID !== "undefined" && !GA_MEASUREMENT_ID.includes("PASTE")) {
  const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date()); gtag("config", GA_MEASUREMENT_ID);
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-add-cart]"); if (a) gtag("event", "add_to_cart", { item_id: a.dataset.addCart });
    if (e.target.closest("#placeOrderBtn")) gtag("event", "purchase", { value: (($("#checkoutGrandTotal") || {}).textContent || "").replace(/[^0-9]/g, "") });
  });
}

/* ---- 8. Shareable product links (#p-ID) + dynamic title for better previews ---- */
const _opm2 = window.openProductModal;
window.openProductModal = function (id) {
  _opm2(id);
  history.replaceState(null, "", "#p-" + id);
  const p = products.find(x => x.id === id);
  if (p) document.title = p.name + " - ShopNova";
  const actions = $(".modal-details .trust-row") || $(".modal-details");
  if (actions && !$(".share-btn", actions.parentNode)) actions.insertAdjacentHTML("afterend", `<button class="share-btn" data-share="${id}">🔗 Copy Share Link</button>`);
};
const _cpm = window.closeProductModal;
if (_cpm) window.closeProductModal = function () { _cpm(); history.replaceState(null, "", location.pathname); document.title = "ShopNova - Modern Online Shopping"; };
document.addEventListener("click", e => {
  const s = e.target.closest("[data-share]"); if (!s) return;
  const url = location.origin + location.pathname + "#p-" + s.dataset.share;
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => showToast("Link copied 🔗")).catch(() => showToast(url));
});
function openFromHash() {
  const m = location.hash.match(/^#p-(\d+)$/);
  if (m && products.some(p => p.id === +m[1])) setTimeout(() => openProductModal(+m[1]), 600);
}
window.addEventListener("load", openFromHash);
if (document.readyState === "complete") openFromHash();
})();
