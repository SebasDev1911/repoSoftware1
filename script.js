(() => {
  'use strict';

  const PRODUCTS = [
    { id: 1, name: 'Noir Absolu', cat: 'hombre', price: 389000, color: '#1b1b1f', notes: 'Cuero, vetiver, pimienta negra', desc: 'Una fragancia intensa y nocturna con base de cuero y maderas ahumadas.' },
    { id: 2, name: 'Cedro Imperial', cat: 'hombre', price: 345000, color: '#3a2a1a', notes: 'Cedro, bergamota, ámbar', desc: 'Amaderada y fresca, pensada para el día a día en la oficina.' },
    { id: 3, name: 'Océano Sereno', cat: 'hombre', price: 312000, color: '#143a52', notes: 'Sal marina, salvia, musgo', desc: 'Acuática y limpia, con un fondo mineral que dura todo el día.' },
    { id: 4, name: 'Rosa Dorada', cat: 'mujer', price: 420000, color: '#7a2e45', notes: 'Rosa de Damasco, peonía, almizcle', desc: 'Floral y elegante, con un corazón de rosa y fondo cremoso.' },
    { id: 5, name: 'Jazmín de Seda', cat: 'mujer', price: 398000, color: '#c9b79a', notes: 'Jazmín, pera, sándalo', desc: 'Suave y luminosa. Ideal para ocasiones especiales.' },
    { id: 6, name: 'Flor de Noche', cat: 'mujer', price: 436000, color: '#3b1f5c', notes: 'Orquídea, vainilla, ciruela', desc: 'Dulce y misteriosa, con notas de vainilla oscura.' },
    { id: 7, name: 'Ámbar Eterno', cat: 'unisex', price: 465000, color: '#8a4b12', notes: 'Ámbar, incienso, cardamomo', desc: 'Cálida y especiada, una firma para cualquier persona.' },
    { id: 8, name: 'Bosque Blanco', cat: 'unisex', price: 372000, color: '#2d4a3a', notes: 'Pino, té blanco, iris', desc: 'Verde y fresca, con un acorde de té que se siente limpio.' },
    { id: 9, name: 'Oud Real', cat: 'unisex', price: 520000, color: '#2a0f12', notes: 'Oud, rosa, azafrán', desc: 'Nuestra fragancia más exclusiva, de concentración extra alta.' }
  ];
  const SIZES = { 50: 1, 100: 1.6 };
  const CAT_LABEL = { hombre: 'Para hombre', mujer: 'Para mujer', unisex: 'Unisex' };

  const $ = (s) => document.querySelector(s);
  const money = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  const priceFor = (p, size) => Math.round((p.price * SIZES[size]) / 1000) * 1000;

  // Storage seguro
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const state = {
    filter: 'todos', query: '', sort: 'default',
    favs: load('aurelle_favs', []),
    cart: load('aurelle_cart', []),
    modal: { id: null, size: 50 }
  };

  // Frasco SVG generado por color
  function bottle(color, uid) {
    return `<svg viewBox="0 0 120 200" role="img" aria-label="Frasco de perfume">
      <defs>
        <linearGradient id="g${uid}" x1="0" x2="1"><stop offset="0" stop-color="${color}"/><stop offset=".45" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="${color}"/></linearGradient>
        <linearGradient id="c${uid}" x1="0" x2="1"><stop offset="0" stop-color="#a98532"/><stop offset=".5" stop-color="#ecd89c"/><stop offset="1" stop-color="#a98532"/></linearGradient>
      </defs>
      <rect x="44" y="6" width="32" height="38" rx="3" fill="url(#c${uid})"/>
      <rect x="52" y="44" width="16" height="14" fill="#8c7430"/>
      <rect x="14" y="58" width="92" height="132" rx="10" fill="${color}" stroke="#c9a24a" stroke-width="1.5"/>
      <rect x="14" y="58" width="92" height="132" rx="10" fill="url(#g${uid})" opacity=".7"/>
      <rect x="30" y="100" width="60" height="44" rx="2" fill="none" stroke="#e8d29a" stroke-width=".8"/>
      <text x="60" y="126" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#e8d29a" letter-spacing="1">AURELLE</text>
    </svg>`;
  }

  const heartIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- Catálogo ----------
  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const matchCat = state.filter === 'todos' || (state.filter === 'favoritos' ? state.favs.includes(p.id) : p.cat === state.filter);
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    if (state.sort === 'asc') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }

  function renderGrid() {
    const list = visibleProducts();
    $('#grid').innerHTML = list.map((p) => `
      <article class="card">
        <button class="fav ${state.favs.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="${state.favs.includes(p.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${p.name}" aria-pressed="${state.favs.includes(p.id)}">${heartIcon}</button>
        <button class="card-art" data-open="${p.id}" aria-label="Ver detalle de ${p.name}">${bottle(p.color, 'k' + p.id)}</button>
        <div class="card-body">
          <span class="tag">${CAT_LABEL[p.cat]}</span>
          <h3>${p.name}</h3>
          <p class="notes">${p.notes}</p>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="add" data-add="${p.id}">Agregar</button>
          </div>
        </div>
      </article>`).join('');
    $('#empty').hidden = list.length > 0;
    $('#resultInfo').textContent = `${list.length} ${list.length === 1 ? 'fragancia' : 'fragancias'}`;
    $('#favCount').textContent = state.favs.length;
    $('#favCount').dataset.n = state.favs.length;
  }

  // ---------- Favoritos ----------
  function toggleFav(id) {
    const i = state.favs.indexOf(id);
    i >= 0 ? state.favs.splice(i, 1) : state.favs.push(id);
    save('aurelle_favs', state.favs);
    toast(i >= 0 ? 'Quitado de favoritos' : 'Guardado en favoritos');
    renderGrid();
    if (state.modal.id === id) updateModalFav();
  }

  // ---------- Carrito ----------
  function addToCart(id, size = 50) {
    const found = state.cart.find((i) => i.id === id && i.size === size);
    found ? found.qty++ : state.cart.push({ id, size, qty: 1 });
    persistCart();
    toast('Agregado al carrito');
  }

  function persistCart() {
    save('aurelle_cart', state.cart);
    renderCart();
  }

  function renderCart() {
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    $('#cartCount').textContent = count;
    $('#cartCount').dataset.n = count;
    const total = state.cart.reduce((s, i) => s + priceFor(PRODUCTS.find((p) => p.id === i.id), i.size) * i.qty, 0);
    $('#cartTotal').textContent = money(total);
    $('#cartList').innerHTML = state.cart.length
      ? state.cart.map((i, idx) => {
          const p = PRODUCTS.find((x) => x.id === i.id);
          return `<li class="cart-item">
            ${bottle(p.color, 'c' + idx)}
            <div>
              <h4>${p.name}</h4>
              <small>${i.size} ml · ${money(priceFor(p, i.size))}</small>
              <div class="qty">
                <button data-dec="${idx}" aria-label="Disminuir cantidad">−</button>
                <span>${i.qty}</span>
                <button data-inc="${idx}" aria-label="Aumentar cantidad">+</button>
              </div>
            </div>
            <button class="remove" data-rm="${idx}">Quitar</button>
          </li>`;
        }).join('')
      : '<li class="cart-empty">Tu carrito está vacío. Agrega una fragancia para empezar.</li>';
    $('#checkout').disabled = !state.cart.length;
  }

  function openDrawer() {
    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#overlay').hidden = false;
    $('#closeCart').focus();
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    $('#overlay').hidden = true;
    $('#cartBtn').focus();
  }

  // ---------- Modal ----------
  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    state.modal = { id, size: 50 };
    $('#mArt').innerHTML = bottle(p.color, 'm');
    $('#mCat').textContent = CAT_LABEL[p.cat];
    $('#mTitle').textContent = p.name;
    $('#mDesc').textContent = p.desc;
    $('#mNotes').textContent = 'Notas: ' + p.notes;
    renderModalSizes();
    updateModalFav();
    $('#modal').showModal();
  }
  function renderModalSizes() {
    const p = PRODUCTS.find((x) => x.id === state.modal.id);
    $('#mSizes').innerHTML = Object.keys(SIZES).map((s) =>
      `<button class="size" role="radio" aria-checked="${+s === state.modal.size}" data-size="${s}">${s} ml</button>`).join('');
    $('#mPrice').textContent = money(priceFor(p, state.modal.size));
  }
  function updateModalFav() {
    const on = state.favs.includes(state.modal.id);
    $('#mFav').textContent = on ? 'Quitar de favoritos' : 'Guardar en favoritos';
  }

  // ---------- Eventos ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.add) addToCart(+t.dataset.add);
    else if (t.dataset.fav) toggleFav(+t.dataset.fav);
    else if (t.dataset.open) openModal(+t.dataset.open);
    else if (t.dataset.inc) { state.cart[+t.dataset.inc].qty++; persistCart(); }
    else if (t.dataset.dec) {
      const i = state.cart[+t.dataset.dec];
      i.qty > 1 ? i.qty-- : state.cart.splice(+t.dataset.dec, 1);
      persistCart();
    }
    else if (t.dataset.rm) { state.cart.splice(+t.dataset.rm, 1); persistCart(); }
    else if (t.dataset.size) { state.modal.size = +t.dataset.size; renderModalSizes(); }
    else if (t.dataset.filter) {
      state.filter = t.dataset.filter;
      document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === t));
      renderGrid();
    }
  });

  $('#search').addEventListener('input', (e) => { state.query = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });

  $('#favToggle').addEventListener('click', () => {
    state.filter = 'favoritos';
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'favoritos'));
    renderGrid();
    $('#coleccion').scrollIntoView();
  });

  $('#cartBtn').addEventListener('click', openDrawer);
  $('#closeCart').addEventListener('click', closeDrawer);
  $('#overlay').addEventListener('click', closeDrawer);
  $('#clearCart').addEventListener('click', () => { state.cart = []; persistCart(); });
  $('#checkout').addEventListener('click', () => {
    toast('Pedido recibido. ¡Gracias por tu compra!');
    state.cart = []; persistCart(); closeDrawer();
  });

  $('#closeModal').addEventListener('click', () => $('#modal').close());
  $('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')) $('#modal').close(); });
  $('#mAdd').addEventListener('click', () => { addToCart(state.modal.id, state.modal.size); $('#modal').close(); });
  $('#mFav').addEventListener('click', () => toggleFav(state.modal.id));

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#drawer').classList.contains('open')) closeDrawer(); });

  // Menú móvil
  const menuBtn = $('#menuBtn'), nav = $('#nav');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });

  // Inicio
  $('#heroBottle').innerHTML = bottle('#1b1b1f', 'hero');
  renderGrid();
  renderCart();
})();
