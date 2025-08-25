// --- Config / helpers ---
const CART_KEY_COUNT = "aurea-cart-count";
const CART_KEY_ITEMS = "aurea-cart-items"; // [{id,title,author,price,thumb,qty}]
const format = n => n.toLocaleString("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 });

const getCount = () => Number(localStorage.getItem(CART_KEY_COUNT) || 0);
const setCount = n => { localStorage.setItem(CART_KEY_COUNT, String(n)); const c=document.getElementById("cartCount"); if(c) c.textContent=n; };
const getItems = () => { try { return JSON.parse(localStorage.getItem(CART_KEY_ITEMS) || "[]"); } catch { return []; } };
const setItems = items => localStorage.setItem(CART_KEY_ITEMS, JSON.stringify(items));

const seedIfEmpty = () => {
    // Si no hay items, pero usuario llega desde demo, sembramos 1 ejemplo
    if (!getItems().length && getCount() > 0) {
        setItems([
            {id:"1984", title:"1984", author:"George Orwell", price:49900, thumb:"img/1984.png", qty:1}
        ]);
    }
};

// --- Render ---
const els = {
    empty: document.getElementById("emptyState"),
    wrap: document.getElementById("cartWrap"),
    list: document.getElementById("cartList"),
    subtotal: document.getElementById("subtotal"),
    discount: document.getElementById("discount"),
    shipping: document.getElementById("shipping"),
    total: document.getElementById("total"),
    coupon: document.getElementById("coupon"),
    couponMsg: document.getElementById("couponMsg"),
    applyCoupon: document.getElementById("applyCoupon"),
    btnClear: document.getElementById("btnClear"),
    btnCheckout: document.getElementById("btnCheckout"),
};

let couponApplied = null; // {code, amount}

function calcTotals(items){
    const subtotal = items.reduce((a,i)=> a + i.price * i.qty, 0);
    const shipping = items.length ? 9900 : 0; // tarifa plana demo
    const discount = couponApplied?.amount || 0;
    const total = Math.max(subtotal + shipping - discount, 0);
    return { subtotal, shipping, discount, total };
}

function render(){
    const items = getItems();

    if (!els.empty || !els.wrap || !els.list || !els.subtotal || !els.discount || !els.shipping || !els.total) return;

    if (!items.length){
        els.empty.style.display = "";
        els.wrap.style.display = "none";
        setCount(0);
        return;
    }
    els.empty.style.display = "none";
    els.wrap.style.display = "grid";

    // lista
    els.list.innerHTML = "";
    items.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = "card";
        row.style.display = "grid";
        row.style.gridTemplateColumns = "92px 1fr auto";
        row.style.alignItems = "center";
        row.style.gap = "14px";
        row.innerHTML = `
            <img src="${it.thumb}" alt="Portada de ${it.title}" style="width:92px;height:92px;object-fit:cover;border-radius:12px">
            <div style="display:grid;gap:6px;padding:10px 0">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:start">
                    <div>
                        <strong>${it.title}</strong>
                        <div class="muted">${it.author ?? ""}</div>
                    </div>
                    <button class="btn btn--ghost" data-action="remove" data-idx="${idx}" aria-label="Eliminar ${it.title}">Eliminar</button>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                    <div class="input" style="display:inline-flex;align-items:center;gap:8px;width:auto">
                        <button class="btn btn--ghost" data-action="dec" data-idx="${idx}" aria-label="Disminuir">−</button>
                        <span aria-live="polite" style="min-width:24px;text-align:center">${it.qty}</span>
                        <button class="btn btn--ghost" data-action="inc" data-idx="${idx}" aria-label="Aumentar">+</button>
                    </div>
                    <span class="muted">× ${format(it.price)}</span>
                </div>
            </div>
            <div style="padding-right:12px;text-align:right"><strong>${format(it.price * it.qty)}</strong></div>
        `;
        els.list.appendChild(row);
    });

    // totales
    const t = calcTotals(items);
    els.subtotal.textContent = format(t.subtotal);
    els.discount.textContent = t.discount ? "−" + format(t.discount) : format(0);
    els.shipping.textContent = t.shipping ? format(t.shipping) : "Gratis";
    els.total.textContent = format(t.total);

    // contador global
    const count = items.reduce((a,i)=>a+i.qty,0);
    setCount(count);
}

// --- Interacciones ---
if (els.list) {
    els.list.addEventListener("click", (e)=>{
        const btn = e.target.closest("button");
        if (!btn) return;
        const idx = Number(btn.dataset.idx);
        const items = getItems();
        if (isNaN(idx) || !items[idx]) return;

        switch (btn.dataset.action){
            case "inc":
                items[idx].qty++;
                setItems(items); render(); break;
            case "dec":
                items[idx].qty = Math.max(1, items[idx].qty - 1);
                setItems(items); render(); break;
            case "remove":
                items.splice(idx,1);
                setItems(items); render(); break;
        }
    });
}

if (els.btnClear) {
    els.btnClear.addEventListener("click", ()=>{
        setItems([]); render();
    });
}

if (els.applyCoupon) {
    els.applyCoupon.addEventListener("click", ()=>{
        const code = (els.coupon.value || "").trim().toUpperCase();
        els.couponMsg.textContent = "";
        els.couponMsg.classList.remove("error");
        if (!code) return;

        // Demo: BIENVENIDA10 = $10.000, ENVIOGRATIS = quita envío
        if (code === "BIENVENIDA10"){
            couponApplied = { code, amount: 10000 };
            els.couponMsg.textContent = "Cupón aplicado: −$10.000 en tu compra 🎉";
        } else if (code === "ENVIOGRATIS"){
            // Simulamos quitando el costo de envío restándolo como descuento.
            const items = getItems();
            const { shipping } = calcTotals(items);
            couponApplied = { code, amount: shipping };
            els.couponMsg.textContent = "Cupón aplicado: envío gratis 🚚";
        } else {
            couponApplied = null;
            els.couponMsg.textContent = "Cupón no válido.";
            els.couponMsg.classList.add("error");
            setTimeout(()=> els.couponMsg.classList.remove("error"), 1200);
        }
        render();
    });
}

if (els.btnCheckout) {
    els.btnCheckout.addEventListener("click", ()=>{
        alert("Demo: aquí iría el flujo de pago/checkout.");
    });
}

// init
seedIfEmpty();
render();