const SHOP = "xk10qi-6m.myshopify.com";
let DATA = { PRODUCTS: [] };
const $ = (s, e = document) => e.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
function items() {
  return DATA.PRODUCTS.flatMap((p) => p.variants.map((v) => ({ ...v, product: p, title: p.name + " " + v.strength })));
}
function chrome() {
  return `<div class="banner">Free Shipping on Orders Over $200 | Same-Day Dispatch Before 2PM ET</div>
  <header class="top"><div class="bar">
    <a class="icon" href="/products" aria-label="Menu">☰</a>
    <a class="logo" href="/">nueva</a>
    <a class="icon" href="/checkout" aria-label="Cart">bag</a>
  </div></header>`;
}
function card(i) {
  return `<article class="card"><a href="/products/${i.product.slug}?v=${i.id}">
    <div class="photo"><img src="${i.photo}" alt="${i.title}"></div></a>
    <div class="meta"><a href="/products/${i.product.slug}?v=${i.id}"><h3>${i.title}</h3><p>${money(i.price)}</p></a>
    <a class="plus" href="https://${SHOP}/cart/${i.shopifyVariantId}:1" target="_blank" rel="noopener">+</a></div></article>`;
}
function home() {
  const all = items();
  const featured = ["tirzepatide-30mg","tesamorelin-10mg","ghk-bpc-tb-70mg","nad-500mg"].map((k) => all.find((i) => i.id === k)).filter(Boolean);
  const heroes = featured.slice(0, 3);
  const pos = ["top:0;left:18%;z-index:3","top:48px;left:0;z-index:2","top:96px;left:32%;z-index:1"];
  return `<section class="hero"><div>
    <h1>Research peptides, distilled to the essentials.</h1>
    <p class="lede">99%+ purity. Third-party tested. Delivered to your lab.</p>
    <a class="btn" href="/products">Shop peptides</a></div>
    <div class="stack">${heroes.map((h, i) => `<a href="/products/${h.product.slug}?v=${h.id}" style="${pos[i]}"><img src="${h.photo}" alt="${h.title}"></a>`).join("")}</div>
  </section>
  <div class="stats"><div class="inner">
    <div><strong>99%+</strong><span>Purity</span></div>
    <div><strong>2–5 Day</strong><span>Delivery</span></div>
    <div><strong>USA</strong><span>Fulfilled</span></div>
  </div></div>
  <section class="wrap"><div class="section-head"><h2>Featured peptides</h2><a href="/products">View all products →</a></div>
  <div class="grid">${featured.map(card).join("")}</div></section>
  <section class="trust"><div class="inner">
    <div><h3>Independently tested</h3><p>Every lot is identity-checked by HPLC and mass spectrometry before it ships.</p></div>
    <div><h3>Ships from the US</h3><p>Same-day dispatch before 2PM ET. Tracked two-day air on qualifying orders.</p></div>
    <div><h3>Research use only</h3><p>Sold strictly as laboratory research chemicals. Not for human or veterinary use.</p></div>
  </div></section>`;
}
function products() {
  return `<section class="wrap"><h1 style="font-size:clamp(40px,6vw,64px)">Products</h1>
    <div class="grid">${items().map(card).join("")}</div></section>`;
}
function pdp(slug) {
  const p = DATA.PRODUCTS.find((x) => x.slug === slug);
  if (!p) return `<section class="wrap"><h1>Not found</h1><a href="/products">Back</a></section>`;
  const id = new URLSearchParams(location.search).get("v");
  const v = p.variants.find((x) => x.id === id) || p.variants[0];
  const url = v.shopifyVariantId ? `https://${SHOP}/cart/${v.shopifyVariantId}:1` : "#";
  return `<section class="wrap"><a class="back" href="/products">← Back to Products</a>
    <div class="pdp"><div class="photo"><img src="${v.photo}" alt=""></div>
    <div><h1>${p.name} ${v.strength}</h1><p class="price">${money(v.price)}</p><p>${p.desc || ""}</p>
    <div class="sizes">${p.variants.map((o) => `<a class="btn ghost" href="/products/${p.slug}?v=${o.id}">${o.strength}</a>`).join("")}</div>
    <a class="btn" href="${url}" target="_blank" rel="noopener">Add to Cart</a>
    <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">Research use only. Payment via Shopify Checkout.</p>
    </div></div></section>`;
}
function footer() {
  return `<footer><div class="foot"><div><a class="logo" href="/">nueva</a><p class="muted">Research Use Only</p>
    <p><a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a></p></div>
    <div><h4>Products</h4><a href="/products">All Products</a></div>
    <div><h4>Legal</h4><a href="/legal">Research disclaimer</a></div></div>
    <p class="legal">© 2026 Nueva Research. All listed materials are sold strictly as laboratory research chemicals. Not evaluated by the FDA. Not for human or veterinary use.</p></footer>`;
}
function render() {
  const p = location.pathname.replace(/\/+$/, "") || "/";
  const host = $("#chrome");
  if (host) host.innerHTML = chrome();
  let html = home();
  if (p === "/products" || p === "/catalog") html = products();
  else if (p.startsWith("/products/")) html = pdp(p.split("/")[2]);
  else if (p === "/checkout") html = `<section class="wrap"><h1>Your cart</h1><p class="muted">Add items with + on a product, then checkout on Shopify.</p><a class="btn" href="/products">View Catalog</a></section>`;
  else if (p === "/legal" || p === "/about") html = `<section class="wrap"><h1>Research disclaimer</h1><p>Sold strictly as laboratory research chemicals. Not for human or veterinary use.</p></section>`;
  $("#app").innerHTML = html + footer();
  window.scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && a.getAttribute("href") && a.getAttribute("href").startsWith("/") && !a.target) {
    e.preventDefault();
    history.pushState({}, "", a.getAttribute("href"));
    render();
  }
});
window.addEventListener("popstate", render);
fetch("/js/catalog.json").then((r) => r.json()).then((d) => { DATA = d; render(); });
