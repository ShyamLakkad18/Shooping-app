/* ShopNova v13 — women's clothing + face care expansion */
(function () {
"use strict";

const KURTI = ["1583496661160-fb5886a13d77", "1610030469983-98e550d6193c", "1583391733956-6c78276477e2", "1585487000160-6ebcfceb0d03"];
const DRESS = ["1595777457583-95e059d581b8", "1572804013309-59a88b7e92f1", "1515886657613-9f3515b0c78f", "1566174053879-31528523f8ae", "1515372039744-b8f02a3ae446"];
const PANTS = ["1541099649105-f69ad21f3246", "1509631179647-0177331693ae", "1483985988355-763728e1935b", "1584370848010-d7fe6bc767ec"];
const TSHIRT = ["1521572163474-6864f9cf17ab", "1581044777550-4cfa60707c03", "1503341504253-dff4815485f1", "1529139574466-a303027c1d8b"];
const FACE = ["1556228720-195a672e8a03", "1571781926291-c477ebfd024b", "1522335789203-aabd1fc54bc9", "1598440947619-2c35bc8df9da", "1608248597279-f99d160bfcbc", "1522338242992-e1a54906a8da"];

/* name | subcat | pool | price | oldPrice */
const DATA = [
/* ---- Kurtis ---- */
"Printed Rayon Straight Kurti|ethnic|KURTI|699|1399","Chikankari Embroidered Kurti|ethnic|KURTI|999|1899",
"Cotton A-Line Kurti|ethnic|KURTI|799|1499","Festive Silk Blend Kurti|ethnic|KURTI|1299|2399",
"Printed Kurti with Palazzo Set|ethnic|KURTI|1499|2799","Short Casual Kurti|ethnic|KURTI|599|1099",
/* ---- Dresses ---- */
"Floral Fit & Flare Dress|dresses|DRESS|1199|2299","Polka Dot Midi Dress|dresses|DRESS|1099|1999",
"Office Wear Sheath Dress|dresses|DRESS|1399|2599","Boho Maxi Summer Dress|dresses|DRESS|1599|2999",
"Ruffle Sleeve Mini Dress|dresses|DRESS|999|1899","Denim Shirt Dress|dresses|DRESS|1299|2399",
/* ---- Pants / Bottoms ---- */
"Formal Straight Fit Trousers|bottoms|PANTS|999|1799","Flared Palazzo Pants|bottoms|PANTS|799|1499",
"Skinny Fit Jeggings|bottoms|PANTS|699|1299","High-Rise Mom Jeans|bottoms|PANTS|1399|2599",
"Culottes Pants|bottoms|PANTS|899|1699",
/* ---- T-Shirts ---- */
"Basic Round Neck T-Shirt|tops|TSHIRT|399|799","Oversized Graphic T-Shirt|tops|TSHIRT|599|1099",
"Striped Cotton T-Shirt|tops|TSHIRT|499|949","Long Sleeve Henley Tee|tops|TSHIRT|649|1199",
"Crop T-Shirt (Pack of 2)|tops|TSHIRT|699|1299"
];
let n = 0;
DATA.forEach(row => {
  const [name, sub, poolName, price, old] = row.split("|"), id = 500 + n++, pool = { KURTI, DRESS, PANTS, TSHIRT }[poolName];
  if (products.some(p => p.id === id)) return;
  products.push({ id, name, category: "fashion", gender: "women", subcat: sub, isNew: true, price: +price, oldPrice: +old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.2 + (id % 7) / 10).toFixed(1), reviews: 200 + (id * 71) % 4000,
    image: `https://images.unsplash.com/photo-${pool[id % pool.length]}?auto=format&fit=crop&w=600&q=80`,
    description: `${name} — soft, breathable fabric with a flattering everyday fit. Easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});

/* ---- Face / skincare products ---- */
const FACE_DATA = [
"Vitamin C Face Wash|399|799","Niacinamide Face Serum|599|1199","Hydrating Face Moisturizer|449|899",
"Charcoal Clay Face Mask|349|699","Daily Sunscreen SPF 50|399|799","Rose Water Face Toner|249|499",
"Under Eye Cream|499|999","Anti-Acne Spot Gel|299|599","Brightening Face Pack|349|699","Lip Balm (Pack of 3)|199|399"
];
FACE_DATA.forEach((row, i) => {
  const [name, price, old] = row.split("|"), id = 540 + i;
  if (products.some(p => p.id === id)) return;
  products.push({ id, name, category: "beauty", gender: "women", subcat: "face", isNew: true, price: +price, oldPrice: +old,
    discount: Math.round((1 - price / old) * 100), rating: +(4.3 + (id % 6) / 10).toFixed(1), reviews: 300 + (id * 59) % 4500,
    image: `https://images.unsplash.com/photo-${FACE[i % FACE.length]}?auto=format&fit=crop&w=600&q=80`,
    description: `${name} — dermatologically mild formula for everyday use. Easy 7-day returns.` });
  liveViewerCounts[id] = 6 + Math.floor(Math.random() * 40); liveStockLevels[id] = 8 + Math.floor(Math.random() * 22);
});

/* add a "Face Care" chip next to the existing women sub-category chips */
const wc = document.querySelector(".sub-chips");
if (wc && !wc.querySelector('[data-sub="face"]')) wc.insertAdjacentHTML("beforeend", '<button class="sub-chip" data-sub="face">🧴 Face Care</button>');

/* make sure face-care items show up when that chip (or Beauty category) is used */
const _rw13 = window.renderWomenProducts;
if (_rw13) window.renderWomenProducts = function () {
  if (typeof womenSub !== "undefined" && womenSub === "face") {
    const list = products.filter(p => p.gender === "women" && p.subcat === "face");
    document.getElementById("womenProductGrid").innerHTML = list.map((p, i) => productCard(p, i)).join("");
    return;
  }
  _rw13();
};

renderProducts(); renderDeals(); renderMenProducts(); renderWomenProducts();
})();
