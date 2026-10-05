/* ShopNova v15 — real photos via keyword search + nicer search animation + more products */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* =====================================================================
   1. REAL PHOTOS: fetch a real matching photo per product by keyword.
      LoremFlickr does a live keyword search against real photos and is
      far more reliable than guessing fixed photo IDs. "lock" pins one
      consistent photo per product so it doesn't change on reload.
   ===================================================================== */
function flickr(keywords, lock) { return `https://loremflickr.com/600/800/${encodeURIComponent(keywords)}?lock=${lock}`; }
function keywordsFor(p) {
  const n = p.name.toLowerCase();
  const map = [
    [/kurti|kurta/, "kurti,indian,fashion"], [/saree|sari/, "saree,indian,silk"],
    [/dress|gown|frock/, "dress,woman,fashion"], [/jean|denim|jegging/, "jeans,denim,fashion"],
    [/trouser|pant|palazzo|legging|culotte/, "pants,fashion,woman"], [/t-?shirt|tee|tshirt/, "tshirt,fashion"],
    [/shirt/, "shirt,fashion,men"], [/jacket|blazer|coat|hoodie|sweater|cardigan/, "jacket,fashion"],
    [/saree|lehenga/, "lehenga,indian,bridal"], [/heel|sandal|flat/, "heels,shoes,fashion"],
    [/sneaker|shoe|boot/, "sneakers,shoes"], [/bag|handbag|backpack|wallet/, "handbag,fashion"],
    [/watch/, "wristwatch,fashion"], [/sunglasses/, "sunglasses,fashion"],
    [/innerwear|brief|boxer|vest|bra|lingerie|nightwear|sleepwear/, "cotton,fabric,clothing"],
    [/headphone|earbud|speaker|neckband/, "headphones,audio,tech"], [/watch pro|smart ?watch/, "smartwatch,tech"],
    [/laptop/, "laptop,tech"], [/phone|smartphone/, "smartphone,tech"], [/tablet/, "tablet,tech"],
    [/keyboard|mouse|gaming chair|headset|monitor|controller/, "gaming,setup,tech"],
    [/sofa|chair|table|lamp|shelf|curtain|cushion|decor|organizer|rack/, "homedecor,interior"],
    [/skincare|serum|cream|face|lipstick|makeup|perfume|cosmetic/, "cosmetics,skincare"],
    [/book/, "books,reading"], [/toy|block|car|teddy/, "toy,kids"], [/kids|baby|boys|girls/, "kids,fashion"],
    [/bedsheet|towel|blender|kettle/, "home,kitchen"], [/trimmer|grooming/, "grooming,mens"]
  ];
  for (const [re, kw] of map) if (re.test(n)) return kw;
  return p.category === "fashion" ? (p.gender === "men" ? "mensfashion" : "womensfashion") : (p.category || "product");
}
let fixed = 0;
products.forEach(p => {
  if (p.id <= 43) return; /* the original 43 products already have real, working photos */
  p.image = flickr(keywordsFor(p), p.id);
  if (p.images) p.images = p.images.map((_, i) => flickr(keywordsFor(p), p.id * 10 + i));
  fixed++;
});
if (window.renderProducts) { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); if (window.renderKids) renderKids(); }
console.log(`ShopNova v15: ${fixed} product photos now use live keyword-matched images.`);

/* =====================================================================
   2. MORE PRODUCTS (more variety to show up across searches)
   ===================================================================== */
const MORE = [
"Patiala Salwar Suit Set|fashion|women|ethnic|1399|2599","Cotton Co-ord Jogger Set|fashion|women|bottoms|999|1799",
"Women's Formal Shirt|fashion|women|tops|699|1299","Women's Denim Shorts|fashion|women|bottoms|699|1299",
"Women's Puffer Long Coat|fashion|women|winter|2799|4999","Net Embroidered Saree|fashion|women|ethnic|1999|3799",
"Women's Sports Cap|fashion|women|accessories|299|599","Women's Hoop Earrings Set|fashion|women|accessories|399|799",
"Men's Formal Trousers|fashion|men|bottoms|1199|2199","Men's Printed Boxers (Pack of 5)|innerwear|men|x|799|1499",
"Men's Baseball Cap|fashion|men|accessories|349|699","Men's Canvas Belt|fashion|men|accessories|449|899",
"Men's Puffer Jacket Pro|fashion|men|winter|2499|4499","Men's Running Shorts|fashion|men|bottoms|599|1099",
"Wireless Earbuds Pro|electronics|men|x|1999|3999","4K Action Camera|electronics|men|x|6999|11999",
"Smart Fitness Ring|electronics|men|x|2999|5499","Portable Bluetooth Projector|electronics|men|x|5999|9999",
"Area Rug (5x7 ft)|home|women|x|2199|3999","Blackout Roller Blinds|home|women|x|1499|2699",
"Scented Candle Trio|home|women|x|699|1299","Ceramic Planter Set|home|women|x|599|1099",
"Matte Lip Gloss Set|beauty|women|face|399|799","Herbal Face Wash Combo|beauty|women|face|449|899",
"Hair Styling Cream|beauty|men|face|349|649","Kids Puzzle Game Set|kids|kids|x|499|999",
"Kids Cotton Nightwear Set|kids|kids|x|699|1299"
];
let n2 = 0;
MORE.forEach(row => {
  const [name, cat, gender, sub, price, old] = row.split("|"), id = 600 + n2++;
  if (products.some(p => p.id === id)) return;
  products.push({ id, name, category: cat, gender, subcat: sub, isNew: true, price: +price, oldPrice: +old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.2 + (id % 7) / 10).toFixed(1), reviews: 150 + (id * 67) % 4000,
    image: flickr(keywordsFor({ name, category: cat, gender }), id), description: `${name} from ShopNova. Great everyday quality with easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});
if (window.renderProducts) { renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts(); if (window.renderKids) renderKids(); }

/* =====================================================================
   3. NICER ANIMATED SEARCH TRANSITION
   ===================================================================== */
const loader = $("#searchLoader");
if (loader && !loader.dataset.v15) {
  loader.dataset.v15 = 1;
  loader.innerHTML = `<div class="sl-box"><div class="sl-orbit"><span></span><span></span><span></span><i class="fa-solid fa-bag-shopping"></i></div>
    <h3 id="slText">Searching...</h3><p id="slStep">Looking through our catalog</p><div class="sl-bar"><i></i></div><div class="sl-cards"><b></b><b></b><b></b><b></b></div></div>`;
  const STEPS = ["Looking through our catalog", "Matching your search", "Sorting the best results", "Almost there"];
  let stepTimer;
  const origShow = () => loader.classList.add("show");
  new MutationObserver(muts => {
    muts.forEach(m => {
      if (m.attributeName !== "class") return;
      if (loader.classList.contains("show")) {
        let i = 0; clearInterval(stepTimer);
        stepTimer = setInterval(() => { i = (i + 1) % STEPS.length; const el = $("#slStep"); if (el) el.textContent = STEPS[i]; }, 450);
      } else clearInterval(stepTimer);
    });
  }).observe(loader, { attributes: true });
}
/* smooth reveal of the search-results page once it's populated */
const _ps15 = window.performSearch;
if (_ps15) window.performSearch = function () {
  document.body.classList.add("sm-loading");
  _ps15();
  setTimeout(() => {
    document.body.classList.remove("sm-loading");
    const sec = $(".products-section"); if (sec) { sec.classList.remove("sm-in"); void sec.offsetWidth; sec.classList.add("sm-in"); }
  }, 1900);
};
})();
