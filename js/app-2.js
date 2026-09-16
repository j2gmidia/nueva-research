function pdp(slug) {
  const p = findProduct(slug);
  if (!p) return `<section class="wrap"><h1>Not found</h1><a href="/products">Back to Products</a></section>`;
  const vId = new URLSearchParams(location.search).get("v") || p.variants[0].id;
  const v = p.variants.find((x) => x.id === vId) || p.variants[0];
  const related = catalogItems().filter((i) => i.product.category === p.category && i.product.slug !== p.slug).slice(0,4);
  return `<section class="wrap"><a class="back" href="/products">← Back to Products</a>
    <div class="pdp"><div class="photo"><img src="${v.photo}" alt="${p.name}"></div>
    <div><h1>${p.name} ${v.strength}</h1><p class="price">${money(v.price)}</p><p>${p.desc || ""}</p>
      ${p.variants.length > 1 ? `<div class="sizes">${p.variants.map((opt)=>`<button data-size="${opt.id}" class="${opt.id===v.id?"on":""}">${opt.strength}</button>`).join("")}</div>` : ""}
      <div class="qty"><div class="step"><button data-q="-">−</button><span id="qty">1</span><button data-q="+">+</button></div>
      <button class="btn" id="add-pdp" data-id="${v.id}">Add to Cart</button></div>
      <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">Research use only. Payment via Shopify Checkout.</p>
    </div></div>
    ${related.length ? `<h2 style="margin-top:64px">You Might Also Like</h2><div class="grid" style="margin-top:24px">${related.map(card).join("")}</div>` : ""}
  </section>`;
}
function simple(title, html) { return `<section class="wrap"><h1>${title}</h1><div style="max-width:640px;margin-top:24px;line-height:1.7">${html}</div></section>`; }
function checkoutPage() {
  const lines = loadCart();
  if (!lines.length) return `<section class="wrap" style="max-width:640px"><h1>Your cart</h1><div class="empty"><p>Your cart is empty</p><p class="muted">Add your favorite items to your cart.</p><a class="btn" href="/products" style="margin-top:24px">View Catalog</a></div></section>`;
  const rows = lines.map((l) => {
    const hit = findVariant(l.id); if (!hit) return "";
    return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} ${hit.variant.strength}</strong><p class="muted">Qty ${l.qty}</p></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
  }).join("");
  const total = lines.reduce((n, l) => { const hit = findVariant(l.id); return n + (hit ? hit.variant.price * l.qty : 0); }, 0);
  const url = checkoutUrl();
  return `<section class="wrap" style="max-width:640px"><h1>Your cart</h1>${rows}
    <p style="text-align:right;font-size:18px;margin-top:24px">Subtotal ${money(total)}</p>
    ${url ? `<a class="btn" style="width:100%;margin-top:24px" href="${url}" target="_blank" rel="noopener">Checkout</a>` : `<p class="muted">Shopify variants are not linked.</p>`}
    <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">Secure checkout on Shopify. Research use only.</p></section>`;
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
function renderGate() {
  if (!$("#gate")) return;
  if (sessionStorage.getItem(AGE_KEY) === "1") { $("#gate").innerHTML = ""; return; }
  $("#gate").innerHTML = `<div class="gate"><div class="panel">
    <div class="brand">nueva</div>
    <p class="sub">Research use only</p>
    <h2>Researcher verification</h2>
    <p class="muted" style="margin-top:16px;line-height:1.6">Nueva Research supplies peptides exclusively to qualified researchers and laboratories for in-vitro use.</p>
    <label><input type="checkbox" id="g1"> I confirm I am a qualified researcher purchasing for laboratory research only — not for human or veterinary use.</label>
    <label><input type="checkbox" id="g2"> I confirm I am 21 years of age or older.</label>
    <button class="btn" id="g-enter" disabled style="width:100%;margin-top:24px">Enter site →</button>
    <p class="muted" style="text-align:center;font-size:12px;margin-top:20px">Not evaluated by the FDA.</p>
  </div></div>`;
}
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
    body = lines.map((l) => {
      const hit = findVariant(l.id); if (!hit) return "";
      return `<div class="line"><img src="${hit.variant.photo}" alt=""><div style="flex:1"><strong>${hit.product.name} ${hit.variant.strength}</strong>
        <div class="step" style="margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px;height:32px">
          <button data-qty="${l.id}" data-n="${l.qty-1}">−</button><span style="padding:0 8px">${l.qty}</span><button data-qty="${l.id}" data-n="${l.qty+1}">+</button>
        </div></div><div>${money(hit.variant.price * l.qty)}</div></div>`;
    }).join("");
    const url = checkoutUrl();
    body += url ? `<a class="btn" style="width:100%;margin-top:16px" href="${url}" target="_blank" rel="noopener">Checkout</a>` : `<p class="muted">Shopify not linked.</p>`;
  }
  $("#drawers").innerHTML = `<div class="drawer-bg" data-close></div><aside class="drawer right">
    <header><span>Your cart</span><button data-close>${icon("x")}</button></header>
    <div class="body">${body}</div></aside>`;
}
function render() {
  renderChrome();
  $("#app").innerHTML = pageHTML() + footer();
  renderGate();
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
  if (qbtn) { const el = $("#qty"); let n = Number(el.textContent); el.textContent = qbtn.dataset.q === "+" ? n + 1 : Math.max(1, n - 1); }
  if (e.target.id === "add-pdp") addToCart(e.target.dataset.id, Number($("#qty").textContent || 1));
  const qty = e.target.closest("[data-qty]");
  if (qty) { setQty(qty.dataset.qty, Number(qty.dataset.n)); openCart(); }
  if (e.target.id === "g-enter") { sessionStorage.setItem(AGE_KEY, "1"); renderGate(); }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sort") { const p = new URLSearchParams(location.search); if (e.target.value === "popular") p.delete("sort"); else p.set("sort", e.target.value); go("/products" + (p.toString() ? "?" + p : "")); }
  if (e.target.id === "g1" || e.target.id === "g2") { const b = $("#g-enter"); if (b) b.disabled = !($("#g1") && $("#g1").checked && $("#g2") && $("#g2").checked); }
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
fetch("/js/catalog.json").then((r) => r.json()).then((d) => { DATA = d; render(); });
