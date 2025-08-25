// Utilidades
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Año dinámico
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menú móvil
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

// Buscar (hero) -> redirige a catálogo con query
const searchForm = $("#searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#q").value.trim();
    const url = new URL(location.origin + "/catalogo.html");
    if (q) url.searchParams.set("q", q);
    location.href = url.toString();
  });
}

// Newsletter simple con validación
const newsletterForm = $("#newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const msg = $("#newsMsg");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      msg.textContent = "Ingresa un correo válido.";
      msg.classList.add("error");
      return;
    }
    msg.classList.remove("error");
    msg.textContent = "¡Gracias por suscribirte! Se aplicará 10% en tu primera compra.";
    newsletterForm.reset();
  });
}

// Contacto validación mínima
const contactForm = $("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("#nombre").value.trim();
    const correo = $("#correo").value.trim();
    const mensaje = $("#mensaje").value.trim();
    const acepto = $("#acepto").checked;
    const msg = $("#contactMsg");
    if (!nombre || !/^\S+@\S+\.\S+$/.test(correo) || !mensaje || !acepto) {
      msg.textContent = "Completa todos los campos correctamente.";
      msg.classList.add("error");
      return;
    }
    msg.classList.remove("error");
    msg.textContent = "¡Mensaje enviado! Te responderemos pronto.";
    contactForm.reset();
  });
}

// Carrito (demo usando localStorage)
const CART_KEY_COUNT = "aurea-cart-count";
const CART_KEY_ITEMS = "aurea-cart-items";

// Obtiene los items actuales del carrito
const getCartItems = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY_ITEMS) || "[]"); }
  catch { return []; }
};
const setCartItems = items => localStorage.setItem(CART_KEY_ITEMS, JSON.stringify(items));

// Botones "Añadir"
$$(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-id");
    const title = btn.getAttribute("data-title");
    const author = btn.getAttribute("data-author");
    const price = Number(btn.getAttribute("data-price"));
    const thumb = btn.getAttribute("data-thumb");

    let items = getCartItems();
    let idx = items.findIndex(it => it.id === id);

    if (idx >= 0) {
      items[idx].qty += 1;
    } else {
      items.push({ id, title, author, price, thumb, qty: 1 });
    }
    setCartItems(items);

    // Actualiza contador
    const n = items.reduce((a, it) => a + it.qty, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) cartCount.textContent = n;

    btn.textContent = "Añadido ✓";
    setTimeout(() => (btn.textContent = "Añadir"), 1200);
  });
});

// Filtros de catálogo (búsqueda y categoría)
const filterInput = $("#filterInput");
const categorySelect = $("#categorySelect");
const catalogGrid = $("#catalogGrid");

function applyFilters() {
  if (!catalogGrid) return;
  const q = (filterInput?.value || "").toLowerCase();
  const cat = (categorySelect?.value || "").toLowerCase();
  $$(".card", catalogGrid).forEach(card => {
    const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
    const meta = card.querySelector(".card__meta")?.textContent.toLowerCase() || "";
    const c = (card.getAttribute("data-category") || "").toLowerCase();
    const matchQ = !q || title.includes(q) || meta.includes(q);
    const matchC = !cat || c === cat;
    card.style.display = matchQ && matchC ? "" : "none";
  });
}
if (filterInput) filterInput.addEventListener("input", applyFilters);
if (categorySelect) categorySelect.addEventListener("change", applyFilters);

if (location.pathname.endsWith("catalogo.html")) {
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  const c = params.get("c");
  if (q && filterInput) { filterInput.value = q; }
  if (c && categorySelect) { categorySelect.value = c; }
  applyFilters();
}
