/* ShopNova v9 — legal pages */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function modal(t) {
  const o = document.createElement("div"); o.className = "ord-overlay";
  o.innerHTML = `<div class="ord-modal legal-modal"><button class="modal-close">✕</button><h3>${t}</h3><div class="mb"></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", e => { if (e.target === o || e.target.classList.contains("modal-close")) o.classList.remove("active"); });
  o.body = $(".mb", o); return o;
}
const PAGES = {
  privacy: ["Privacy Policy", `<p>We collect only the information needed to run your account and orders: your name, email, address and order history.</p>
    <p>We never sell your personal data to third parties. Payment details are handled directly by our payment partner and are not stored on our servers.</p>
    <p>You can request deletion of your account and data at any time from the Help Center.</p><p><small>Last updated: 2026</small></p>`],
  terms: ["Terms &amp; Conditions", `<p>By using ShopNova you agree to shop responsibly and provide accurate delivery information.</p>
    <p>Prices and offers may change without notice. We reserve the right to cancel orders in case of pricing errors or stock issues.</p>
    <p>All product images are for illustration; actual products may vary slightly.</p><p><small>Last updated: 2026</small></p>`],
  shipping: ["Shipping Policy", `<p>Orders are typically delivered within 3-5 working days across India.</p>
    <p>Delivery is FREE on orders above ₹999. Orders below that amount carry a flat ₹49 delivery charge.</p>
    <p>You can track your order any time from "Returns &amp; Orders" in the header.</p>`],
  returns: ["Returns &amp; Refunds", `<p>Most items can be returned within 7 days of delivery, unused and in original packaging.</p>
    <p>To start a return, open "My Orders" and tap "Return / Refund" on the relevant order, or contact the Help Center.</p>
    <p>Refunds are processed within 3-5 business days to the original payment method (or as store credit for COD orders).</p>`],
  about: ["About ShopNova", `<p>ShopNova is a modern online store for fashion, electronics, home, beauty and more — built to make everyday shopping simple and affordable.</p>`]
};
const lm = modal("");
function openLegal(key) { const p = PAGES[key]; if (!p) return; $(".ord-modal h3", lm).innerHTML = p[0]; lm.body.innerHTML = p[1]; lm.classList.add("active"); }
$$(".footer-column a, .footer-bottom span").forEach(a => {
  const t = a.textContent.trim();
  const map = { "Privacy": "privacy", "Terms": "terms", "Shipping": "shipping", "Returns": "returns", "About ShopNova": "about" };
  if (map[t]) { a.href = "#"; a.addEventListener("click", e => { e.preventDefault(); openLegal(map[t]); }); }
});
})();
