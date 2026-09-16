const SHOP = "xk10qi-6m.myshopify.com";
const AGE_KEY = "nueva-age-ok";
const CART_KEY = "nueva-cart-v1";
let DATA = { PRODUCTS: [], FORMATS: [], SORTS: [] };
const $ = (s, e = document) => e.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
function path() { return location.pathname.replace(/\/+$/, "") || "/"; }
function catalogItems() {
  return DATA.PRODUCTS.flatMap((p) => p.variants.map((v) => ({ key: v.id, title: p.name + " " + v.strength, product: p, variant: v })));
}
function findProduct(slug) { return DATA.PRODUCTS.find((p) => p.slug === slug); }
function findVariant(id) {
  for (const p of DATA.PRODUCTS) {
    const v = p.variants.find((x) => x.id === id);
    if (v) return { product: p, variant: v };
  }
}
function formatOf(p) {
  if (p.form === "Capsules") return "capsule";
  if (p.form === "Sterile vial") return "reagent";
  return "vial";
}
function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } }
function saveCart(lines) { localStorage.setItem(CART_KEY, JSON.stringify(lines)); renderChrome(); }
function addToCart(id, qty) {
  const lines = loadCart();
  const hit = lines.find((l) => l.id === id);
  if (hit) hit.qty += qty; else lines.push({ id, qty });
  saveCart(lines); openCart();
}
function setQty(id, qty) {
  let lines = loadCart();
  if (qty <= 0) lines = lines.filter((l) => l.id !== id);
  else { const hit = lines.find((l) => l.id === id); if (hit) hit.qty = qty; }
  saveCart(lines);
}
function cartCount() { return loadCart().reduce((n, l) => n + l.qty, 0); }
function checkoutUrl(email) {
  const lines = loadCart(); if (!lines.length) return null;
  const parts = [];
  for (const l of lines) {
    const hit = findVariant(l.id);
    if (!hit || !hit.variant.shopifyVariantId) return null;
    parts.push(hit.variant.shopifyVariantId + ":" + l.qty);
  }
  let url = "https://" + SHOP + "/cart/" + parts.join(",");
  if (email && email.trim()) url += "?checkout[email]=" + encodeURIComponent(email.trim());
  return url;
}
function payMarks() {
  return `<div class="pay"><span>We accept</span><b>VISA</b><b>MC</b><b>AMEX</b><b>PayPal</b><b>DISC</b></div>`;
}
function icon(name) {
  const s = {
    menu: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 6h14M3 10h14M3 14h14"/></svg>',
    search: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>',
    bag: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M6 8V6a4 4 0 018 0v2M5 8h14l-1.2 10H6.2L5 8z"/></svg>',
    x: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l10 10M15 5L5 15"/></svg>'
  };
  return s[name] || "";
}
function chrome() {
  const n = cartCount();
  return `<div class="banner">Free Shipping on Orders Over $200 | Same-Day Dispatch Before 2PM ET</div>
  <header class="top"><div class="bar">
    <button class="icon" data-act="menu" aria-label="Open menu">${icon("menu")}</button>
    <a class="logo" href="/">nueva</a>
    <div style="display:flex">
      <button class="icon" data-act="search" aria-label="Search">${icon("search")}</button>
      <button class="icon" data-act="cart" aria-label="Open cart">${icon("bag")}${n ? `<span class="badge">${n}</span>` : ""}</button>
    </div>
  </div>
  <div class="search-drop" id="search-drop" hidden><input id="header-q" placeholder="Search products..."></div>
  </header>
  <div id="drawers"></div><div id="gate"></div>`;
}
function footer() {
  return `<footer><div class="foot">
    <div><a class="logo" href="/">nueva</a><p class="muted">Research Use Only</p><p><a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a></p></div>
    <div><h4>Products</h4><a href="/products">All Products</a><a href="/products?format=vial">Vials</a><a href="/products?format=capsule">Capsules</a></div>
    <div><h4>Company</h4><a href="/about">About</a><a href="/contact">Contact</a><a href="/wholesale">Wholesale</a><a href="/verify">Verify / COA</a></div>
    <div><h4>Legal</h4><a href="/legal">Research disclaimer</a><a href="/legal">Terms</a><a href="/legal">Privacy</a></div>
  </div>
  <p class="legal">© 2026 Nueva Research. All listed materials are sold strictly as laboratory research chemicals. Not evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.</p></footer>`;
}
function card(item) {
  return `<article class="card">
    <a href="/products/${item.product.slug}?v=${item.key}"><div class="photo"><img src="${item.variant.photo}" alt="${item.title}"></div></a>
    <div class="meta"><a href="/products/${item.product.slug}?v=${item.key}"><h3>${item.title}</h3><p>${money(item.variant.price)}</p></a>
    <button class="plus" data-add="${item.key}" aria-label="Add ${item.title}">+</button></div>
  </article>`;
}
function home() {
  const items = catalogItems();
  const featured = ["tirzepatide-10mg","tesamorelin-10mg","ghk-bpc-tb-70mg","nad-500mg"].map((k) => items.find((i) => i.key === k)).filter(Boolean);
  const heroes = featured.slice(0, 3);
  return `<section class="hero"><div>
    <h1>Research peptides, distilled to the essentials.</h1>
    <p class="lede">99%+ purity. Third-party tested. Delivered to your lab.</p>
    <a class="btn" href="/products">Shop peptides</a></div>
    <div class="stack">${heroes.map((h) => `<a href="/products/${h.product.slug}?v=${h.key}"><img src="${h.variant.photo}" alt="${h.title}"></a>`).join("")}</div>
  </section>
  <div class="stats"><div class="inner">
    <div><strong>99%+</strong><span>Purity</span></div>
    <div><strong>2–5 Day</strong><span>Delivery</span></div>
    <div><strong>USA</strong><span>Fulfilled</span></div>
  </div></div>
  <section class="wrap"><div class="section-head"><h2>Featured</h2><a href="/products">View all →</a></div>
  <div class="grid">${featured.map(card).join("")}</div></section>
  <section class="trust"><div class="inner">
    <div><h3>Independently tested</h3><p>Every lot is identity-checked by HPLC and mass spectrometry before it ships.</p></div>
    <div><h3>Ships from the US</h3><p>Same-day dispatch before 2PM ET. Tracked two-day air on qualifying orders.</p></div>
    <div><h3>Research use only</h3><p>Sold strictly as laboratory research chemicals. Not for human or veterinary use.</p></div>
  </div></section>`;
}
function productsPage() {
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").trim().toLowerCase();
  const format = params.get("format") || "all";
  const sort = params.get("sort") || "popular";
  let list = catalogItems().filter((item) => {
    if (format !== "all" && formatOf(item.product) !== format) return false;
    if (!q) return true;
    return (item.title + " " + (item.product.aliases || "") + " " + item.variant.sku).toLowerCase().includes(q);
  });
  list.sort((a,b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "za") return b.title.localeCompare(a.title);
    if (sort === "price-asc") return a.variant.price - b.variant.price;
    if (sort === "price-desc") return b.variant.price - a.variant.price;
    return Number(!!b.product.featured) - Number(!!a.product.featured);
  });
  return `<section class="wrap">
    <h1 style="font-size:clamp(40px,6vw,64px)">Products</h1>
    <p class="muted" style="margin-top:8px">Browse our selection of research-grade peptides.</p>
    <div class="searchrow"><label class="muted">Sort by: <select id="sort">${(DATA.SORTS||[]).map((s)=>`<option value="${s.id}" ${s.id===sort?"selected":""}>${s.name}</option>`).join("")}</select></label></div>
    <div class="tabs">${(DATA.FORMATS||[]).map((f)=>`<button data-format="${f.id}" class="${(f.id==="all"?format==="all":format===f.id)?"on":""}">${f.name}</button>`).join("")}</div>
    <div class="grid">${list.map(card).join("") || '<p class="muted">No products found.</p>'}</div>
  </section>`;
}
