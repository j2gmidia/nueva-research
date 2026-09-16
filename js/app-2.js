function pdp(slug) {
  const p = findProduct(slug);
  if (!p) return `<section class="wrap"><h1>Not found</h1><a href="/products">Back to Products</a></section>`;
  const vId = new URLSearchParams(location.search).get("v") || p.variants[0].id;
  const v = p.variants.find((x) => x.id === vId) || p.variants[0];
  const dose = (v.strength || "").replace(/\s+/g, "");
  const strength = p.variants.length > 1
    ? p.variants.map((opt)=>`<button type="button" data-size="${opt.id}" class="strength ${opt.id===v.id?"on":""}">${opt.strength.replace(/\s+/g,"")} <span class="bogo-pill">BOGO</span></button>`).join("")
    : `<button type="button" class="strength on">Standard <span class="bogo-pill">BOGO</span></button>`;
  return `<main class="amino-pdp">
    <div class="amino-gallery">
      <div class="amino-well"><span class="amino-sale">-15%</span><img src="${v.photo}" alt="${p.name} ${v.strength}"></div>
      <div class="amino-thumbs">
        <button type="button" class="on"><img src="${v.photo}" alt=""></button>
        <button type="button" data-coa><img src="/img/coa-sheet.jpg" alt="COA"></button>
      </div>
    </div>
    <div class="amino-buy">
      <div class="amino-buy-head"><p class="amino-kicker">Research Peptide</p></div>
      <h1 class="amino-title">${p.name} (${dose})</h1>
      <div class="amino-verified">Research Grade · Third-Party Verified</div>
      <div class="amino-chips"><span>CAS: ${p.cas || "—"}</span><span>${p.formula || ""}</span><span class="pure">≥${Math.floor(v.purity || 99)}% Pure</span></div>
      <p class="amino-short">${p.name} Research Kit.</p>
      <div class="bogo-banner"><strong>Buy 1 Get 1 FREE!</strong><p>Every vial you order automatically ships with a second vial FREE.</p></div>
      <form class="add-to-cart-form" id="add-to-cart-form">
        <div class="amino-field"><p>Select Strength</p><div class="amino-strength">${strength}</div></div>
        <p class="amino-price">${money(v.price)}<small>per vial</small><s class="was">${money(compareAt(v.price))}</s></p>
        <p class="bogo-copy">Buy 1, get 1 free — every vial you order automatically ships with a second vial FREE.</p>
        <div class="amino-field"><p>Quantity</p>
          <div class="amino-qty"><button type="button" class="qty-btn" data-q="-">-</button><span id="qty">1</span><button type="button" class="qty-btn" data-q="+">+</button></div>
        </div>
        <div class="amino-total"><div><strong>We'll ship you 2 vials</strong><span>You pay for 1 — 1 ships free</span><em class="amino-save">You save ${money(v.price)}</em></div><div class="amino-total-price">${money(v.price)}<small>TOTAL</small></div></div>
        <button type="submit" class="amino-atc" id="add-pdp" data-id="${v.id}" data-price="${v.price}">Add to Cart</button>
      </form>
    </div>
  </main>
  <div id="coa-modal" class="modal-overlay" style="display:none"><div class="modal-content"><div class="modal-header"><h2>Certificate of Analysis (COA)</h2><button class="close-modal" type="button">&times;</button></div><div class="modal-body"><img src="/img/coa-sheet.jpg" class="coa-image" alt="COA"></div></div></div>`;
}
function simple(title, html) { return `<section class="wrap"><h1>${title}</h1><div style="max-width:640px;margin-top:24px;line-height:1.7">${html}</div></section>`; }
function checkoutPage() {
  const lines = loadCart();
  if (!lines.length) return `<section class="wrap" style="max-width:640px;text-align:center"><h1>Your cart is empty</h1><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" style="margin-top:24px">View Catalog</a></section>`;
  const rows = lines.map((l) => {
    const hit = findVariant(l.id); if (!hit) return "";
    return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} (${hit.variant.strength})</strong>
      <div class="step" style="margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px;height:28px">
        <button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span style="padding:0 8px">${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button>
      </div></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
  }).join("");
  const total = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
  const url = checkoutUrl();
  return `<section class="check wrap">
    <div>
      <p class="logo">nueva</p>
      <h1>Checkout</h1>
      <p class="muted">Payment is completed on Shopify Checkout. Card data never touches this site.</p>
      <h3>Contact</h3>
      <input id="ck-email" type="email" placeholder="Email">
      <h3>Delivery</h3>
      <div class="two"><input placeholder="First name"><input placeholder="Last name"></div>
      <input value="United States" placeholder="Country / region">
      <p class="muted">Address, shipping method and tax are collected on the next step.</p>
      <h3>Shipping method</h3>
      <div class="ship">Standard · 2–5 business days <span class="muted">Calculated next</span></div>
      <h3>Payment</h3>
      ${payMarks()}
      ${url ? `<button class="btn" id="pay-now" style="width:100%;margin-top:20px">Pay now</button>` : `<p class="muted">Shopify variants are not linked.</p>`}
      <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">Secure checkout on Shopify. Research use only.</p>
    </div>
    <aside class="summary">
      <h3>Order summary</h3>
      ${rows}
      <div class="sum"><span class="muted">Subtotal</span><span>${money(total)}</span></div>
      <div class="sum"><span class="muted">Shipping</span><span class="muted">Calculated next</span></div>
      <div class="sum total"><span>Total</span><span>${money(total)} USD</span></div>
    </aside>
  </section>`;
}
function pageHTML() {
  const p = path();
  if (p === "/") return home();
  if (p === "/products" || p === "/catalog") return productsPage();
  if (p.startsWith("/products/")) return pdp(p.split("/")[2]);
  if (p === "/checkout") return checkoutPage();
  if (p === "/about") return simple("About", "<p>Nueva Research supplies research-grade peptides with HPLC/MS lot documentation. USA fulfilled. Research use only.</p>");
  if (p === "/contact") return simple("Contact", '<p>Email <a href="mailto:support@nuevaresearch.com">support@nuevaresearch.com</a>.</p>');
  if (p === "/wholesale") return simple("Wholesale", "<p>For laboratory procurement and volume fills, email support@nuevaresearch.com.</p>");
  if (p === "/verify") return simple("Verify / COA", "<p>Match the lot code on the vial to the COA listed on each product page.</p>");
  if (p === "/legal") return simple("Research disclaimer", "<p>All materials are sold strictly as laboratory research chemicals. Not for human or veterinary use.</p>");
  return simple("Page not found", '<p><a href="/">Go home</a></p>');
}
function renderChrome() { const host = $("#chrome"); if (host) host.innerHTML = chrome(); }
function openMenu() {
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer left">
    <header><span class="logo">nueva</span><button data-close>${icon("x")}</button></header>
    <div class="body"><p><a href="/products">Products</a></p><p><a href="/about">About</a></p><p><a href="/verify">COAs</a></p><p><a href="/wholesale">Wholesale</a></p><p><a href="/contact">Contact</a></p></div>
  </aside>`;
}
function openCart() {
  const lines = loadCart();
  let body = "";
  if (!lines.length) body = `<div class="empty"><p><strong>Your cart is empty</strong></p><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" data-close>View Catalog</a></div>`;
  else {
    const total = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
    body = lines.map((l) => {
      const hit = findVariant(l.id); if (!hit) return "";
      return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} (${hit.variant.strength})</strong>
        <div class="step" style="margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px;height:32px">
          <button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span style="padding:0 8px">${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button>
        </div></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
    }).join("");
    const url = checkoutUrl();
    body += `<div class="sum" style="margin-top:16px"><span class="muted">Subtotal</span><strong>${money(total)}</strong></div>`;
    body += url ? `<a class="btn" style="width:100%;margin-top:16px" href="${url}">Checkout</a>` : `<p class="muted">Shopify not linked.</p>`;
    body += `<a class="btn ghost" style="width:100%;margin-top:8px" href="/checkout" data-close>Review order</a>`;
    body += payMarks();
  }
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer right">
    <header><span>Your cart</span><button data-close>${icon("x")}</button></header>
    <div class="body">${body}</div></aside>`;
}
function render() {
  renderChrome();
  $("#app").innerHTML = pageHTML() + footer();
  window.scrollTo(0, 0);
}
function go(href) { const url = new URL(href, location.origin); history.pushState({}, "", url.pathname + url.search); render(); }
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && a.getAttribute("href") && a.getAttribute("href").startsWith("/") && !a.target) { e.preventDefault(); go(a.getAttribute("href")); }
  const add = e.target.closest("[data-add]");
  if (add) { e.preventDefault(); addToCart(add.dataset.add, 1); }
  const act = e.target.closest("[data-act]");
  if (act) {
    if (act.dataset.act === "menu") openMenu();
    if (act.dataset.act === "cart") openCart();
    if (act.dataset.act === "search") { const d = $("#search-drop"); d.hidden = !d.hidden; if (!d.hidden) $("#header-q").focus(); }
  }
  if (e.target.closest("[data-close]")) $("#drawers").innerHTML = "";
  const fmt = e.target.closest("[data-format]");
  if (fmt) { const p = new URLSearchParams(location.search); if (fmt.dataset.format === "all") p.delete("format"); else p.set("format", fmt.dataset.format); go("/products" + (p.toString() ? "?" + p : "")); }
  const size = e.target.closest("[data-size]");
  if (size) go("/products/" + path().split("/")[2] + "?v=" + size.dataset.size);
  const qbtn = e.target.closest("[data-q]");
  if (qbtn) {
    const el = $("#quantity") || $("#qty");
    let n = Number(el.value || el.textContent);
    n = qbtn.dataset.q === "+" ? n + 1 : Math.max(1, n - 1);
    if (el.value !== undefined) el.value = n; else el.textContent = n;
    const btn = $("#add-pdp");
    if (btn) btn.textContent = "Add to Cart - " + money(Number(btn.dataset.price) * n);
  }
  if (e.target.id === "add-pdp") {
    e.preventDefault();
    addToCart(e.target.dataset.id, Number(($("#quantity") || $("#qty")).value || $("#qty") && $("#qty").textContent || 1));
  }
  const qty = e.target.closest("[data-qty]");
  if (qty) { setQty(qty.dataset.qty, Number(qty.dataset.n)); if (path() === "/checkout") render(); else openCart(); }
  if (e.target.id === "pay-now") {
    const email = ($("#ck-email") && $("#ck-email").value) || "";
    const url = checkoutUrl(email);
    if (url) (window.top || window).location.assign(url);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sort") { const p = new URLSearchParams(location.search); if (e.target.value === "popular") p.delete("sort"); else p.set("sort", e.target.value); go("/products" + (p.toString() ? "?" + p : "")); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.target.id === "q" || e.target.id === "header-q")) {
    e.preventDefault();
    const p = new URLSearchParams(location.search);
    const v = e.target.value.trim();
    if (v) p.set("q", v); else p.delete("q");
    go("/products" + (p.toString() ? "?" + p : ""));
  }
});
window.addEventListener("popstate", render);
document.addEventListener("submit", (e) => {
  if (e.target.id === "add-to-cart-form") {
    e.preventDefault();
    const btn = $("#add-pdp");
    const el = $("#qty") || $("#quantity");
    const n = Number((el && (el.value || el.textContent)) || 1);
    if (btn) addToCart(btn.dataset.id, n);
  }
});
document.addEventListener("click", (e2) => {
  if (e2.target.closest("[data-coa]")) { const m = $("#coa-modal"); if (m) m.style.display = "flex"; }
  if (e2.target.classList && (e2.target.classList.contains("close-modal") || e2.target.id === "coa-modal")) {
    const m = $("#coa-modal"); if (m) m.style.display = "none";
  }
});
fetch("/js/catalog.json").then((r) => r.json()).then((d) => { DATA = d; render(); });
