const SHOP = "xk10qi-6m.myshopify.com";
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
function compareAt(price) { return Math.round(price * 1.182 * 100) / 100; }
function shipQty(qty) { return Math.max(2, qty * 2); }
function checkoutUrl(email) {
  const lines = loadCart(); if (!lines.length) return null;
  const parts = [];
  for (const l of lines) {
    const hit = findVariant(l.id);
    if (!hit || !hit.variant.shopifyVariantId) return null;
    parts.push(hit.variant.shopifyVariantId + ":" + l.qty);
  }
  const params = new URLSearchParams();
  params.set("discount", "BOGO");
  if (email && email.trim()) params.set("checkout[email]", email.trim());
  return "https://" + SHOP + "/cart/" + parts.join(",") + "?" + params.toString();
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
  return `<header class="top"><div class="amino-header">
    <button class="icon" data-act="menu" aria-label="Open menu">${icon("menu")}</button>
    <a class="logo amino-logo" href="/">nueva</a>
    <div style="display:flex;justify-content:flex-end">
      <a class="icon" href="/contact" aria-label="Account">${icon("search")}</a>
      <button class="icon" data-act="cart" aria-label="Open cart">${icon("bag")}${n ? `<span class="badge">${n}</span>` : ""}</button>
    </div>
  </div></header>
  <div id="drawers"></div>`;
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
    <a href="/products/${item.product.slug}?v=${item.key}"><div class="photo"><span class="amino-sale">-15%</span><span class="card-bogo">BOGO</span><img src="${item.variant.photo}" alt="${item.title}"></div></a>
    <div class="meta"><a href="/products/${item.product.slug}?v=${item.key}"><h3>${item.title}</h3><p>${money(item.variant.price)} <s class="was">${money(compareAt(item.variant.price))}</s></p><p class="bogo-mini">Buy 1 Get 1 Free</p></a>
    <button class="plus" data-add="${item.key}" aria-label="Add ${item.title}">+</button></div>
  </article>`;
}
function home() {
  const items = catalogItems();
  const keys = ["tirzepatide-10mg","tesamorelin-10mg","bpc-157-10mg","ghk-cu-50mg","nad-500mg","epitalon-50mg","tb-500-10mg","bpc-tb-20mg"];
  const featured = keys.map((k) => items.find((i) => i.key === k)).filter(Boolean);
  return `<section class="home-hero">
    <div class="home-hero-inner">
    <div class="home-hero-copy">
      <p class="home-kicker">● Limited-time deals</p>
      <h1>Buy More,<br>Get More <em>Free</em></h1>
      <div class="home-cta">
        <a class="home-cta-fill" href="/products">Shop the deals →</a>
        <a class="home-cta-ghost" href="/products">Shop all</a>
      </div>
      <p class="home-note">Free items added automatically at checkout</p>
    </div>
    <div class="home-hero-stage">
      <a class="hero-vial front" href="/products/tesamorelin?v=tesamorelin-10mg">
        <img src="/img/cut-tesa.png" alt="Tesamorelin 10mg"><span>Tesamorelin 10mg</span>
      </a>
      <a class="hero-vial back" href="/products/tirzepatide?v=tirzepatide-10mg">
        <img src="/img/cut-tirz-10.png" alt="Tirzepatide 10mg"><span>Tirzepatide 10mg</span>
      </a>
    </div>
    </div>
  </section>
  <div class="home-trust">
    <article><div><h3>99%+ Purity</h3><p>HPLC verified</p></div></article>
    <article><div><h3>U.S. Lab Tested</h3><p>Accredited labs</p></div></article>
    <article><div><h3>Same-Day Ship</h3><p>Before 2PM ET</p></div></article>
  </div>
  <section class="home-best">
    <div class="home-best-head"><p>Featured</p><h2>Best Sellers</h2></div>
    <div class="home-best-row">${featured.map((item)=>`<div class="home-best-card">${card(item)}</div>`).join("")}</div>
  </section>
  <section class="home-strip"><p>Buy 1 Get 1 Free on every vial</p><a href="/products">Shop the deals →</a></section>`;
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
