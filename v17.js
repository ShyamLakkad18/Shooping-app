/* ShopNova v17 — the actual fix for broken/placeholder product photos */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- STEP 1: neutralize the old inline onerror="..." on every <img>.
   That old handler was overriding our better fallback logic and forcing
   the gray "ShopNova" placeholder to show even when a real photo was
   available. We strip it here, and keep stripping it on every new image
   the app renders from now on. ---- */
function stripOldHandler(img) { if (img.getAttribute("onerror")) { img.onerror = null; img.removeAttribute("onerror"); } }
function stripAll(root) { (root.querySelectorAll ? root.querySelectorAll("img") : []).forEach(stripOldHandler); }
stripAll(document);
new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType !== 1) return;
  if (n.tagName === "IMG") stripOldHandler(n); else stripAll(n);
}))).observe(document.body, { childList: true, subtree: true });

/* ---- STEP 2: ONE single, authoritative broken-image handler.
   1st failure  -> try Picsum (a different, very reliable real-photo service)
   2nd failure  -> show a plain neutral placeholder as the last resort ---- */
document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG") return;
  const stage = +(img.dataset.stage || 0);
  if (stage === 0) {
    img.dataset.stage = "1";
    const seed = (img.src.match(/lock=(\d+)/) || img.src.match(/\/photo-(\d+)/) || [0, Math.abs(hash(img.src)) % 9999])[1];
    img.src = `https://picsum.photos/seed/p${seed}/600/800`;
  } else if (stage === 1) {
    img.dataset.stage = "2";
    img.src = "https://placehold.co/600x800/f4f5f6/999?text=ShopNova";
  }
}, true);
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

/* ---- STEP 3: force every currently-visible image to retry right now,
   so products that are already stuck on the gray placeholder fix
   themselves immediately without needing a manual page reload. ---- */
$$("img").forEach(img => {
  if (img.src.includes("placehold.co") && img.alt) {
    const p = (window.products || []).find(x => x.name === img.alt);
    if (p && p.image && !p.image.includes("placehold.co")) { delete img.dataset.stage; img.src = p.image; }
  }
});
console.log("ShopNova v17: old onerror handler removed; photo fallback chain fixed.");
})();
