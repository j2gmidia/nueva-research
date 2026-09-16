const SHOP = "xk10qi-6m.myshopify.com";
const CART_KEY = "nueva-cart-v1";
const COA_IDS = new Set([
  "tirzepatide-10mg","tirzepatide-30mg","tirzepatide-60mg","tirzepatide-100mg",
  "bpc-157-10mg","tb-500-10mg","bpc-tb-20mg","klow-80mg","ghk-bpc-tb-70mg",
  "ghk-cu-50mg","ghk-cu-100mg","epitalon-50mg","pinealon-10mg","semax-10mg",
  "selank-10mg","tesamorelin-10mg","nad-100mg","nad-500mg"
]);
let DATA = { PRODUCTS: [], FORMATS: [], SORTS: [] };
const $ = (s, e = document) => e.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
function path() { return location.pathname.replace(/\/+$/, "") || "/"; }
function variantCoa(id) { return COA_IDS.has(id) ? "/coa/" + id + ".pdf" : ""; }
function variantCoaImg(id) { return COA_IDS.has(id) ? "/img/coa/" + id + ".jpg" : ""; }
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
  return `<header class="top"><div class="promo-ticker" role="status"><div class="promo-track">${Array.from({length:8}).map(()=>`<p><span>Buy 1 — Get 1 Free</span><span class="promo-dot">•</span><span>Free shipping on orders $250+</span><span class="promo-dot">•</span></p>`).join("")}</div></div>
  <div class="amino-header">
    <button class="icon" data-act="menu" aria-label="Open menu">${icon("menu")}</button>
    <a class="amino-logo" href="/" aria-label="Nueva home"><img src="/img/nueva-mark.svg?v=2" alt="NUEVA"></a>
    <div style="display:flex;justify-content:flex-end">
      <a class="icon" href="/contact" aria-label="Account">${icon("search")}</a>
      <button class="icon" data-act="cart" aria-label="Open cart">${icon("bag")}${n ? `<span class="badge">${n}</span>` : ""}</button>
    </div>
  </div></header>
  <div id="drawers"></div>`;
}
function footer() {
  return `<footer><div class="foot">
    <div><a href="/"><img src="/img/nueva-mark.svg?v=2" alt="NUEVA" class="foot-logo"></a><p><a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a></p></div>
    <div><h4>Products</h4><a href="/products">All Products</a><a href="/products?format=vial">Vials</a><a href="/products?format=capsule">Capsules</a></div>
    <div><h4>Company</h4><a href="/about">About</a><a href="/contact">Contact</a><a href="/wholesale">Wholesale</a><a href="/verify">Verify / COA</a></div>
    <div><h4>Legal</h4><a href="/legal">Research disclaimer</a><a href="/legal">Terms</a><a href="/legal">Privacy</a></div>
  </div>
  <p class="legal">© 2026 Nueva Research. All listed materials are sold strictly as laboratory research chemicals. Not evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.</p></footer>`;
}
function card(item) {
  return `<article class="card">
    <a href="/products/${item.product.slug}?v=${item.key}"><div class="photo"><span class="amino-sale">-15%</span><span class="card-bogo">BOGO</span><img src="${item.variant.photo}" alt="${item.title}"></div></a>
    <div class="meta"><a href="/products/${item.product.slug}?v=${item.key}"><h3 class="card-name">${item.product.name}<span class="card-strength">${item.variant.strength}</span></h3><p class="card-price"><strong>${money(item.variant.price)}</strong><s>${money(compareAt(item.variant.price))}</s></p><span class="bogo-mini">Buy 1 Get 1 Free</span></a>
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
      <p class="home-kicker"><span class="pulse-dot"></span> Limited-time deals</p>
      <h1>Buy More,<br>Get More <em>Free</em></h1>
      <div class="home-cta">
        <a class="home-cta-fill" href="/products">Shop the deals →</a>
        <a class="home-cta-ghost" href="/products">Shop all</a>
      </div>
    </div>
    <div class="home-hero-stage">
      <div class="hero-floor" aria-hidden="true"></div>
      <a class="hero-vial b" href="/products/tirzepatide?v=tirzepatide-10mg">
        <img src="/img/cut-tirz-10.png" alt="Tirzepatide 10mg"><span>Tirzepatide</span>
      </a>
      <a class="hero-vial a" href="/products/tesamorelin?v=tesamorelin-10mg">
        <img src="/img/cut-tesa.png" alt="Tesamorelin 10mg"><span>Tesamorelin</span>
      </a>
    </div>
    </div>
  </section>
  <p class="home-note">Free items added automatically at checkout</p>
  <div class="home-trust-wrap"><div class="home-trust">
    <article><span class="home-trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 3h6l1 4H8z"/><path d="M8 7h8v10a4 4 0 01-8 0V7z"/></svg></span><div><h3>99%+ Purity</h3><p>HPLC verified</p></div></article>
    <article><span class="home-trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5C7.5 20.5 4 17 4 12V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg></span><div><h3>U.S. Lab Tested</h3><p>Third-party COA</p></div></article>
    <article><span class="home-trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg></span><div><h3>Same-Day Ship</h3><p>Before 2PM ET</p></div></article>
  </div></div>
  <section class="home-best">
    <div class="home-best-head"><p>Featured</p><h2>Best Sellers</h2></div>
    <div class="home-best-row">${featured.map((item)=>`<div class="home-best-card">${card(item)}</div>`).join("")}</div>
  </section>
  <section class="nfc-band">
    <div class="nfc-copy">
      <p class="nfc-kicker">Lot Documentation & COA Access</p>
      <h2>NFC-Verified.</h2>
      <p class="nfc-lead">Tap the vial. Verify the lot. View available documentation.</p>
      <ul class="nfc-list">
        <li><a href="/verify"><span class="nfc-ico">✓</span> Verify Authenticity</a></li>
        <li><a href="/verify"><span class="nfc-ico">≡</span> View COA</a></li>
        <li><a href="/verify"><span class="nfc-ico">☰</span> Batch Transparency</a></li>
      </ul>
    </div>
    <div class="nfc-photo"><img src="/img/nfc-verified.jpg" alt="NFC verification with vial and authenticated documentation on phone"><span class="nfc-pulse"></span></div>
  </section>
  <section class="home-cats">
    <h2>Shop by category</h2>
    <div class="home-cat-grid">
      <a class="home-cat" href="/products?cat=metabolic">Metabolic</a>
      <a class="home-cat" href="/products?cat=recovery">Recovery & tissue</a>
      <a class="home-cat" href="/products?cat=longevity">Longevity & neuro</a>
      <a class="home-cat" href="/products?cat=secretagogue">Secretagogues</a>
      <a class="home-cat" href="/products?cat=immuno">Immunopeptides</a>
      <a class="home-cat" href="/products?cat=reagents">Lab reagents</a>
    </div>
  </section>
  <section class="home-strip">
    <div class="home-strip-inner">
      <div>
        <p class="home-strip-kicker"><span class="pulse-dot"></span> Limited-time offer</p>
        <h2>Buy 1, get 1 free.</h2>
        <p class="home-strip-sub">On every vial. The extra unit is added automatically at checkout.</p>
      </div>
      <a class="home-strip-cta" href="/products">Shop the deals →</a>
    </div>
  </section>`;
}
function productsPage() {
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").trim().toLowerCase();
  const format = params.get("format") || "all";
  const cat = params.get("cat") || "";
  const sort = params.get("sort") || "popular";
  let list = catalogItems().filter((item) => {
    if (format !== "all" && formatOf(item.product) !== format) return false;
    if (cat && item.product.category !== cat) return false;
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
