/* ShopNova v6: more products in every section + search loading page */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);

/* ---------- 1. PRODUCTS FOR EVERY SECTION ---------- */
const CAT = { f: "fashion", e: "electronics", s: "shoes", b: "beauty", h: "home", g: "gaming", k: "books", i: "innerwear" };
const P = {
  ms: ["1602810318383-e386cc2a3ccf", "1521572163474-6864f9cf17ab", "1489987707025-afc232f7ea0f", "1503341504253-dff4815485f1"],
  wt: ["1581044777550-4cfa60707c03", "1541099649105-f69ad21f3246", "1434389677669-e08b4cac3105", "1554568218-0f1715e72254", "1483985988355-763728e1935b", "1496747611176-843222e1e57c"],
  sh: ["1549298916-b41d501d3772", "1560769629-975ec94e6a86", "1525966222134-fcfa99b8ae77", "1491553895911-0055eca6402d"],
  el: ["1505740420928-5e560c06d30e", "1546868871-7041f2a55e12", "1608043152269-423dbba4e7e1", "1598327105666-5b89351aff97", "1583394838336-acd977736f90", "1517336714731-489689fd1ca8"],
  gm: ["1587829741301-dc798b83add3", "1605901309584-818e25960a8f", "1599669454699-248893623440", "1550745165-9bc0b252726f"],
  hm: ["1567538096630-e0c55bd6374c", "1503602642458-232111445657", "1532372320572-cda25653a26d", "1507473885765-e6ed057f782c", "1555041469-a586c61ea9bc", "1540518614846-7eded433c457"],
  bt: ["1556229010-6c3f2c9ca5f8", "1541643600914-78b084683601", "1596462502278-27bfdc403348", "1522335789203-aabd1fc54bc9", "1571781926291-c477ebfd024b"],
  bk: ["1544947950-fa07a98d237f", "1532012197267-da84d127e765", "1512820790803-83ca734da794", "1481627834876-b7833e8f5570"]
};
/* name|cat|gender|subcat|price|oldPrice|imagePool */
const DATA = [
"Ergonomic Gaming Chair|g|men|x|8999|15999|gm","Pro Wireless Gaming Headset|g|men|x|2499|4499|gm","24-inch 144Hz Gaming Monitor|g|men|x|11999|17999|gm",
"TKL Mechanical Keyboard|g|men|x|2799|4999|gm","Racing Wheel & Pedals|g|men|x|5999|10999|gm","USB Streaming Microphone|g|men|x|1899|3499|gm",
"RGB LED Desk Light Strip|g|men|x|699|1399|gm","Laptop Cooling Pad|g|men|x|899|1799|gm","Console Charging Dock|g|men|x|1299|2399|gm",
"The Startup Playbook|k|men|x|349|599|bk","Mindful Mornings Journal|k|women|x|299|499|bk","Cooking Made Easy|k|women|x|449|799|bk",
"World History Illustrated|k|men|x|549|899|bk","Kids Story Collection|k|women|x|399|699|bk","Python for Beginners|k|men|x|499|899|bk",
"Personal Finance 101|k|men|x|379|649|bk","Yoga & Wellness Guide|k|women|x|329|599|bk","Sketching for Beginners|k|women|x|299|549|bk","Business English Mastery|k|men|x|349|599|bk",
"Sunscreen SPF 50 Gel|b|women|x|399|799|bt","Aloe Vera Face Gel|b|women|x|249|499|bt","Argan Hair Oil|b|women|x|449|899|bt","Compact Powder|b|women|x|349|699|bt",
"Kajal & Eyeliner Set|b|women|x|299|599|bt","Perfume Body Mist Combo|b|women|x|599|1299|bt","Beard Trimmer Pro|b|men|x|1299|2499|bt","Men's Face Wash Combo|b|men|x|349|699|bt",
"Men's Cotton Briefs (Pack of 5)|i|men|x|699|1299|ms","Men's Sleepwear Set|i|men|x|999|1799|ms","Men's Lounge Shorts (Pack of 2)|i|men|x|599|1099|ms",
"Women's Cotton Briefs (Pack of 3)|i|women|x|449|899|wt","Women's Nightwear Set|i|women|x|899|1699|wt","Women's Camisole (Pack of 2)|i|women|x|549|999|wt",
"Table Lamp Set|h|women|x|1099|1999|hm","Bath Towel Set (4 pcs)|h|women|x|899|1799|hm","Blackout Curtains Pair|h|women|x|1199|2299|hm",
"Floating Wall Shelf Set|h|women|x|799|1599|hm","Storage Organizer Box Set|h|women|x|699|1399|hm","Electric Kettle 1.5L|h|women|x|799|1599|hm",
"Wireless Charger Pad|e|men|x|899|1799|el","Bluetooth Soundbar|e|men|x|3499|6499|el","Smart Home Camera|e|men|x|1999|3999|el","Wi-Fi Router AC1200|e|men|x|1499|2799|el",
"Trekking Boots|s|men|footwear|2999|5499|sh","Women's Wedge Sandals|s|women|footwear|1399|2599|sh","Canvas Sneakers|s|men|footwear|1299|2399|sh","Party Wear Heels|s|women|footwear|1899|3499|sh"
];
const cnt = {};
DATA.forEach((row, n) => {
  const [name, c, gender, sub, price, old, pool] = row.split("|");
  const id = 200 + n;
  if (products.some(p => p.id === id)) return;
  const k = cnt[pool] = (cnt[pool] || 0);
  cnt[pool]++;
  products.push({ id, name, category: CAT[c], gender, subcat: sub, isNew: true, price: +price, oldPrice: +old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.2 + ((id * 5) % 7) / 10).toFixed(1), reviews: 200 + (id * 151) % 4000,
    image: `https://images.unsplash.com/photo-${P[pool][k % P[pool].length]}?auto=format&fit=crop&w=800&q=90`,
    description: `${name} from ShopNova. Reliable quality, great value and easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 45);
  liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});

/* ---------- 2. SEARCH LOADING PAGE ---------- */
const ld = document.createElement("div");
ld.id = "searchLoader";
ld.innerHTML = `<div class="sl-box"><div class="sl-ring"><i class="fa-solid fa-bag-shopping"></i></div><h3 id="slText">Searching...</h3><p>Finding the best deals for you</p><div class="sl-bar"><i></i></div><div class="sl-cards"><b></b><b></b><b></b><b></b></div></div>`;
document.body.appendChild(ld);
const _ps = window.performSearch;
let busy = false;
function runSearch() {
  if (busy) return;
  busy = true;
  const q = searchInput.value.trim().replace(/</g, "&lt;");
  $("#slText").innerHTML = q ? `Searching for <em>“${q}”</em>` : "Loading products...";
  const sg = $(".suggest"); if (sg) sg.style.display = "none";
  ld.classList.add("show");
  setTimeout(() => {
    _ps();
    if (currentSearch) {
      const n = products.filter(p => (currentCategory === "all" || p.category === currentCategory) && p.name.toLowerCase().includes(currentSearch.toLowerCase())).length;
      if (productTitle) productTitle.textContent += ` (${n} found)`;
    }
    setTimeout(() => { ld.classList.remove("show"); busy = false; }, 450);
  }, 1400);
}
window.performSearch = runSearch;
document.addEventListener("click", e => {
  if (e.target.closest("#searchBtn")) { e.stopPropagation(); e.preventDefault(); runSearch(); }
}, true);
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target === searchInput) { e.stopPropagation(); e.preventDefault(); runSearch(); }
}, true);

renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts();
})();
