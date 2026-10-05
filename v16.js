/* ShopNova v16 — image bug fix + automatic real-photo fallback */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* THE BUG: v15 used encodeURIComponent() on the whole keyword string, which
   turned "kurti,indian,fashion" into "kurti%2Cindian%2Cfashion" — LoremFlickr
   could not read that as 3 keywords, so it failed to return a photo.
   THE FIX: keywords here are plain lowercase words, safe to use directly. */
function flickr(keywords, lock) { return `https://loremflickr.com/600/800/${keywords}?lock=${lock}`; }

function keywordsFor(p) {
  const n = p.name.toLowerCase();
  const map = [
    [/kurti|kurta/, "kurti,indian,fashion"], [/saree|sari/, "saree,indian,silk"],
    [/lehenga/, "lehenga,indian,bridal"], [/dress|gown|frock/, "dress,woman,fashion"],
    [/jean|denim|jegging/, "jeans,denim,fashion"], [/trouser|pant|palazzo|legging|culotte|short/, "pants,fashion"],
    [/t-?shirt|tee|tshirt/, "tshirt,fashion"], [/shirt/, "shirt,fashion"],
    [/jacket|blazer|coat|hoodie|sweater|cardigan/, "jacket,fashion"],
    [/heel|sandal|flat/, "heels,shoes,fashion"], [/sneaker|shoe|boot/, "sneakers,shoes"],
    [/bag|handbag|backpack|wallet/, "handbag,fashion"], [/watch/, "wristwatch,fashion"],
    [/sunglasses/, "sunglasses,fashion"], [/cap|belt|earring/, "fashion,accessory"],
    [/innerwear|brief|boxer|vest|bra|lingerie|nightwear|sleepwear/, "cotton,fabric,clothing"],
    [/headphone|earbud|speaker|neckband/, "headphones,audio,tech"], [/smart ?watch|fitness ?ring|fitness ?band/, "smartwatch,tech"],
    [/laptop/, "laptop,tech"], [/phone|smartphone/, "smartphone,tech"], [/tablet/, "tablet,tech"],
    [/camera/, "camera,tech"], [/projector/, "projector,tech"],
    [/keyboard|mouse|gaming chair|headset|monitor|controller/, "gaming,setup,tech"],
    [/sofa|chair|table|lamp|shelf|curtain|cushion|decor|organizer|rack|rug|blind/, "homedecor,interior"],
    [/skincare|serum|cream|face|lipstick|makeup|perfume|cosmetic|gloss/, "cosmetics,skincare"],
    [/book/, "books,reading"], [/toy|block|car|teddy|puzzle/, "toy,kids"], [/kids|baby|boys|girls/, "kids,fashion"],
    [/bedsheet|towel|blender|kettle/, "home,kitchen"], [/trimmer|grooming/, "grooming,mens"]
  ];
  for (const [re, kw] of map) if (re.test(n)) return kw;
  return p.category === "fashion" ? (p.gender === "men" ? "mensfashion" : "womensfashion") : (p.category || "product");
}

let fixed = 0;
products.forEach(p => {
  if (p.id <= 43) return; /* original 43 already have real, working photos */
  p.image = flickr(keywordsFor(p), p.id);
  if (p.images) p.images = p.images.map((_, i) => flickr(keywordsFor(p), p.id * 10 + i));
  fixed++;
});
if (window.renderProducts) { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); if (window.renderKids) renderKids(); }
console.log(`ShopNova v16: fixed the URL bug and refreshed ${fixed} product photos.`);

/* ---- automatic fallback: if a photo still fails to load for any reason
   (e.g. loremflickr briefly unreachable), swap to a different, equally
   real photo service so the box is never empty/broken ---- */
document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG") return;
  if (img.dataset.fb2) return; /* already tried the fallback once */
  if (!/loremflickr\.com/.test(img.src)) return;
  img.dataset.fb2 = "1";
  const seed = (img.src.match(/lock=(\d+)/) || [0, Math.floor(Math.random() * 999)])[1];
  img.src = `https://picsum.photos/seed/${seed}/600/800`;
}, true);
})();
