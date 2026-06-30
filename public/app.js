/* ABENGOUROU-MARKET — frontend v2 */

// ============ DATA ============
const CATEGORIES = [
  ["immobilier","🏠","Immobilier"],
  ["vehicules","🚗","Véhicules & Motos"],
  ["telephones","📱","Téléphones"],
  ["informatique","💻","Informatique"],
  ["mode","👕","Mode & Beauté"],
  ["supermarche","🛒","Supermarché"],
  ["restaurants","🍽️","Restaurants"],
  ["agriculture","🌾","Agriculture"],
  ["services","👨‍🔧","Services"],
  ["scolaires","🎓","Scolaires"],
  ["sante","🏥","Santé"],
  ["evenements","🎉","Événements"],
  ["annonces","📢","Annonces"],
  ["actualites","📰","Actualités"],
  ["concours-ci","📚","Concours CI"],
  ["emploi","💼","Emploi"],
  ["transport","🚕","Transport"],
  ["braderie","🏷️","Braderie"],
  ["rencontres","❤️","Rencontres & Amitiés"],
];

const SHORTCUTS = [
  ["📚","Concours CI","concours-ci"],["💼","Emploi","emploi"],["🏠","Immobilier","immobilier"],
  ["🚕","Taxi","transport"],["🍽️","Livraison","restaurants"],["📢","Annonces","annonces"],
  ["❤️","Rencontres","rencontres"],["🏷️","Braderie","braderie"],
];

const BANNERS = [
  { bg: "linear-gradient(135deg,#F57C00 0%,#E65100 50%,#BF360C 100%)", title: "Bienvenue sur ABENGOUROU-MARKET", sub: "La plateforme numérique d'Abengourou · Acheter, Vendre, Découvrir", cta: "Découvrir les offres", cat: "" },
  { bg: "linear-gradient(135deg,#2E7D32 0%,#1B5E20 100%)", title: "🏡 Immobilier à Abengourou", sub: "Terrains, villas, studios — les meilleures offres au meilleur prix", cta: "Voir l'immobilier", cat: "immobilier" },
  { bg: "linear-gradient(135deg,#0277BD 0%,#01579B 100%)", title: "💼 Trouvez votre emploi ici", sub: "Des centaines d'offres d'emploi dans la région d'Abengourou", cta: "Voir les offres d'emploi", cat: "emploi" },
  { bg: "linear-gradient(135deg,#6A1B9A 0%,#4A148C 100%)", title: "🎓 Concours de la Fonction Publique", sub: "Toutes les informations sur les concours CI — INFAS, ENA, Police…", cta: "Voir les concours", cat: "concours-ci" },
  { bg: "linear-gradient(135deg,#C62828 0%,#B71C1C 100%)", title: "⚡ Offres Flash du Jour", sub: "Profitez des meilleures promotions — stocks limités !", cta: "Voir les offres flash", cat: "marchandises" },
];


let RENCONTRES_WA = "2250767202271";
let CAT_CONFIG = {}; // Config gratuit/payant par catégorie, chargée depuis les paramètres

const CONFIG_CATS = [
  ["concours-ci","📚","Concours CI"],
  ["emploi","💼","Emploi"],
  ["evenements","🎉","Événements"],
  ["annonces","📢","Annonces"],
  ["services","🔧","Services"],
  ["immobilier","🏠","Immobilier / Terrains"],
  ["marchandises","🛍️","Marchandises"],
  ["residences","🏡","Résidences"],
  ["transport","🚕","Transport"],
  ["rencontres","❤️","Rencontres & Amitiés"],
  ["braderie","🏷️","Braderie"],
  ["restaurants","🍽️","Restaurants"],
];

(async () => {
  try {
    const s = await (await fetch("/api/settings")).json();
    if (s.companyWhatsapp) RENCONTRES_WA = String(s.companyWhatsapp).replace(/\D/g, "");
    if (s.categoryConfig) CAT_CONFIG = s.categoryConfig;
  } catch {}
})();
const fmt = n => Number(n).toLocaleString("fr-FR") + " FCFA";

// Validation numéro Côte d'Ivoire : +225 suivi de 10 chiffres, ou local 0XXXXXXXXX
function isValidCIPhone(raw) {
  const d = (raw || "").replace(/\D/g, "");
  if (/^225\d{10}$/.test(d)) return true;   // 225XXXXXXXXXX (13 chiffres)
  if (/^225\d{8}$/.test(d)) return true;    // ancien format 225XXXXXXXX
  if (/^0\d{9}$/.test(d)) return true;      // 0XXXXXXXXX (10 chiffres local)
  if (/^\d{8}$/.test(d)) return true;       // 8 chiffres (ancien local)
  return false;
}

// Barre de progression simulée (style téléchargement)
function startProgress(fillId, color = "#F57C00") {
  const el = document.getElementById(fillId);
  if (!el) return { done: ()=>{} };
  el.style.width = "5%";
  el.style.background = color;
  let pct = 5;
  const iv = setInterval(() => {
    pct = Math.min(pct + Math.random() * 20, 88);
    const f = document.getElementById(fillId);
    if (f) f.style.width = pct + "%"; else clearInterval(iv);
  }, 180);
  return {
    done(success = true) {
      clearInterval(iv);
      const f = document.getElementById(fillId);
      if (f) { f.style.width = "100%"; f.style.background = success ? "#43a047" : "#c62828"; f.style.transition = "width .4s"; }
    }
  };
}

// ============ STATE ============
let CART = JSON.parse(localStorage.getItem("cart") || "[]");
let USER = JSON.parse(localStorage.getItem("user") || "null");
const saveCart = () => { localStorage.setItem("cart", JSON.stringify(CART)); updateCartCount(); };
const updateCartCount = () => {
  const n = CART.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = n;
  document.getElementById("cartCount").style.display = n > 0 ? "" : "none";
};

// ============ SIDEBAR ============
function renderSidebar(target) {
  target.innerHTML = `
    <div class="sidebar-logo"><img src="/img/logo.png" alt="logo" /></div>
    <div class="sidebar-head">NOS CATÉGORIES</div>
    <ul>${CATEGORIES.map(([s,i,n]) => `<li><a href="#" onclick="filterCat('${s}');return false;">${i} ${n}</a></li>`).join("")}</ul>`;
}

// Catégories "payantes" (détails cachés — payer pour voir)
const PAID_CATS = new Set(["emploi","concours-ci","recrutement"]);

// Modes d'affichage par catégorie
// 'info'      = informations + photo uniquement (pas de bouton d'action)
// 'whatsapp'  = bouton WhatsApp uniquement
// 'order'     = Commander (panier) + WhatsApp
// 'sante'     = page spéciale santé
// 'scolaires' = page spéciale avec sous-catégories
function catMode(cat) {
  if (["concours-ci","emploi","evenements"].includes(cat)) return "info";
  if (["annonces","services","immobilier"].includes(cat)) return "whatsapp";
  if (cat === "residences") return "reserve";
  if (cat === "sante") return "sante";
  if (cat === "scolaires") return "scolaires";
  return "order"; // marchandises, transport, braderie, restaurants…
}

async function filterCat(cat) {
  document.getElementById("mobileSidebar").classList.remove("show");
  if (cat === "rencontres") return showRencontresPage();
  if (cat === "sante") return showSantePage();
  if (cat === "scolaires") return showScolairesPage();

  const catInfo = CATEGORIES.find(c => c[0] === cat) || [cat, "🗂️", cat];
  const [slug, icon, label] = catInfo;
  const mode = catMode(slug);

  showPage("page-category");

  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">${icon}</span>
      <div>
        <h2>${label}</h2>
        <p>${mode === "info" ? "Informations officielles · Abengourou et Côte d'Ivoire" : "Toutes les annonces · Abengourou et Côte d'Ivoire"}</p>
      </div>
    </div>
    <div class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>
    </div>`;

  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}
  const products = all.filter(p => p.category === slug);

  if (!products.length) {
    wrap.querySelector(".section-block").innerHTML = `
      <div class="empty-state">
        <div class="empty-ico">${icon}</div>
        <p>Aucune annonce dans cette catégorie pour le moment.</p>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">0 résultat — revenez bientôt !</p>
      </div>`;
    return;
  }

  // Vérifier si la catégorie est payante
  const catCfg = CAT_CONFIG[slug] || { access: "free", price: 0 };
  const isCatPaid = catCfg.access === "paid" && Number(catCfg.price) > 0;

  let cardsHtml = "";
  let gridClass = "products-grid";

  if (isCatPaid) {
    gridClass = "products-grid";
    cardsHtml = products.map(p => lockedCard(p, Number(catCfg.price), slug)).join("");
  } else if (mode === "info") {
    gridClass = "info-cards-grid";
    cardsHtml = products.map(p => infoCard(p)).join("");
  } else if (mode === "whatsapp") {
    gridClass = "products-grid";
    cardsHtml = products.map(p => waOnlyCard(p)).join("");
  } else if (mode === "reserve") {
    gridClass = "products-grid";
    cardsHtml = products.map(p => reserveCard(p)).join("");
  } else {
    gridClass = "products-grid";
    cardsHtml = products.map(p => productCard({...p, name:p.title})).join("");
  }

  wrap.querySelector(".section-block").innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${products.length} annonce${products.length>1?"s":""} disponible${products.length>1?"s":""}</div>
    <div class="${gridClass}">
      ${cardsHtml}
    </div>`;
}

// ============ CAT NAV ============
function renderCatNav() {
  const el = document.getElementById("catNavLinks");
  if (!el) return;
  el.innerHTML = CATEGORIES.slice(0, 12).map(([s,i,n]) =>
    `<a href="#" onclick="filterCat('${s}');return false;">${i} ${n}</a>`
  ).join("");
}

// ============ CAROUSEL ============
let carIdx = 0, carTimer = null;
function renderCarousel() {
  const track = document.getElementById("carouselTrack");
  const dots = document.getElementById("carDots");
  if (!track) return;
  track.innerHTML = BANNERS.map((b, i) => `
    <div class="car-slide">
      <div class="car-slide-bg" style="background:${b.bg}"></div>
      <div class="car-slide-overlay" style="background:rgba(0,0,0,.18)"></div>
      <div class="car-slide-content">
        <h2>${b.title}</h2>
        <p>${b.sub}</p>
        <span class="car-cta" onclick="filterCat('${b.cat}')" style="cursor:pointer">${b.cta}</span>
      </div>
    </div>`).join("");
  dots.innerHTML = BANNERS.map((_, i) =>
    `<span class="car-dot${i===0?" active":""}" onclick="carGo(${i})"></span>`
  ).join("");
  carTimer = setInterval(() => carMove(1), 4500);
}
function carMove(dir) {
  carIdx = (carIdx + dir + BANNERS.length) % BANNERS.length;
  carGo(carIdx);
}
function carGo(idx) {
  carIdx = idx;
  const track = document.getElementById("carouselTrack");
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll(".car-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
}

// ============ COUNTDOWN FLASH ============
function startCountdown() {
  const el = document.getElementById("flashCountdown");
  if (!el) return;
  const end = new Date(); end.setHours(23, 59, 59, 0);
  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { el.textContent = "TERMINÉ"; return; }
    const h = String(Math.floor(diff/3600000)).padStart(2,"0");
    const m = String(Math.floor((diff%3600000)/60000)).padStart(2,"0");
    const s = String(Math.floor((diff%60000)/1000)).padStart(2,"0");
    el.textContent = `${h}:${m}:${s}`;
  }
  tick(); setInterval(tick, 1000);
}

// ============ INFO CARD (Concours / Emploi / Événements — lecture seule) ============
function infoCard(p) {
  const img = p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0" />` : `<div style="width:100%;height:100px;background:linear-gradient(135deg,#F57C00,#E65100);border-radius:var(--radius) var(--radius) 0 0;display:flex;align-items:center;justify-content:center;font-size:40px">${p.category==="concours-ci"?"📚":p.category==="emploi"?"💼":"🎉"}</div>`;
  const catLabel = CATEGORIES.find(c=>c[0]===p.category)?.[2] || p.category;
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,title:p.title,description:desc,image:p.image||null,category:p.category}).replace(/'/g,"&#39;");
  return `<div class="info-card" onclick='openInfoDetail(${pData})' style="cursor:pointer">
    ${img}
    <div class="info-card-body">
      <div class="info-card-cat">${catLabel}</div>
      <div class="info-card-title">${p.title}</div>
      ${desc ? `<div class="info-card-desc">${desc.slice(0,100)}${desc.length>100?"…":""}</div>` : ""}
    </div>
  </div>`;
}

function openInfoDetail(p) {
  const img = p.image ? `<img src="${p.image}" alt="${p.title}" style="width:100%;max-height:240px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px" />` : "";
  const catLabel = CATEGORIES.find(c=>c[0]===p.category)?.[2] || p.category;
  const catIcon = CATEGORIES.find(c=>c[0]===p.category)?.[1] || "📋";
  modalHTML(`
    <h2 style="font-size:16px;margin-bottom:4px">${catIcon} ${p.title} <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">${catLabel}</div>
    ${img}
    ${p.description ? `<div style="font-size:14px;line-height:1.8;color:var(--text);white-space:pre-line;background:#f9f9f9;padding:14px;border-radius:var(--radius)">${p.description}</div>` : ""}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    </div>`);
}

// ============ WHATSAPP ONLY CARD (Annonces / Services / Immobilier) ============
function waOnlyCard(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const img = p.image ? `<img src="${p.image}" alt="${p.title||p.name}" loading="lazy" />` : `<span>${p.emoji||"📢"}</span>`;
  const name = p.name || p.title || "";
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,name,description:desc,image:p.image||null,whatsapp:wa,category:p.category||""}).replace(/'/g,"&#39;");
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par : ${name}`);
  return `<div class="pcard" onclick='openWaDetail(${pData})' style="cursor:pointer">
    <div class="pcard-img">${img}</div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      ${desc ? `<div class="pcard-stock" style="color:var(--muted);font-size:12px;margin-bottom:8px">${desc.slice(0,60)}${desc.length>60?"…":""}</div>` : ""}
      <div class="pcard-actions">
        ${wa ? `<button class="btn-wa" style="width:100%;border-radius:20px;padding:8px;font-size:13px;background:#25D366;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px" onclick="event.stopPropagation();window.open('https://wa.me/${wa}?text=${msg}','_blank')">💬 Contacter sur WhatsApp</button>` : `<span style="font-size:12px;color:var(--muted)">Aucun contact disponible</span>`}
      </div>
    </div>
  </div>`;
}

function openWaDetail(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const img = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px" />` : "";
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par : ${p.name}`);
  modalHTML(`
    <h2 style="font-size:17px;margin-bottom:4px">${p.name} <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${img}
    ${p.description ? `<div style="font-size:14px;line-height:1.7;color:var(--text);white-space:pre-line;margin-bottom:14px;background:#f9f9f9;padding:12px;border-radius:var(--radius)">${p.description}</div>` : ""}
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
      ${wa ? `<button class="btn btn-primary" style="background:#25D366;border-color:#25D366" onclick="window.open('https://wa.me/${wa}?text=${msg}','_blank')">💬 Contacter sur WhatsApp</button>` : ""}
    </div>`);
}

// ============ RESERVE CARD (Résidences — Réserver + WhatsApp) ============
function reserveCard(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const img = p.image ? `<img src="${p.image}" alt="${p.title||p.name}" loading="lazy" />` : `<span>🏡</span>`;
  const name = p.name || p.title || "";
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,name,description:desc,image:p.image||null,whatsapp:wa,category:p.category||""}).replace(/'/g,"&#39;");
  const msgReserve = encodeURIComponent(`Bonjour, je souhaite réserver : ${name}`);
  const msgContact = encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${name}`);
  return `<div class="pcard" onclick='openWaDetail(${pData})' style="cursor:pointer">
    <div class="pcard-img">${img}</div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      ${p.price > 0 ? `<div class="pcard-price">${fmt(p.price)}</div>` : ""}
      ${desc ? `<div class="pcard-stock" style="color:var(--muted);font-size:12px;margin-bottom:8px">${desc.slice(0,60)}${desc.length>60?"…":""}</div>` : ""}
      <div class="pcard-actions" style="display:flex;gap:6px;flex-direction:column">
        ${wa ? `<button class="btn-add" style="border-radius:20px;width:100%;font-size:13px" onclick="event.stopPropagation();window.open('https://wa.me/${wa}?text=${msgReserve}','_blank')">📅 Réserver</button>` : ""}
        ${wa ? `<button class="btn-wa" style="border-radius:20px;width:100%;font-size:13px" onclick="event.stopPropagation();window.open('https://wa.me/${wa}?text=${msgContact}','_blank')">💬 Contacter</button>` : ""}
      </div>
    </div>
  </div>`;
}

// ============ LOCKED CARD (catégorie payante — voir via WhatsApp admin) ============
function lockedCard(p, price, catSlug) {
  const img = p.image ? `<img src="${p.image}" alt="${p.title||p.name}" loading="lazy" style="filter:blur(3px)" />` : `<span>🔒</span>`;
  const name = p.title || p.name || "";
  const catInfo = CATEGORIES.find(c=>c[0]===catSlug);
  const catLabel = catInfo?.[2] || catSlug;
  const msg = encodeURIComponent(`Bonjour, je souhaite accéder à l'annonce "${name}" dans la catégorie ${catLabel}. Paiement : ${fmt(price)}.`);
  return `<div class="pcard locked-card">
    <div class="pcard-img locked-img">${img}<div class="lock-overlay">🔒</div></div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      <div class="locked-badge">Accès payant</div>
      <div class="locked-price">${fmt(price)}</div>
      <button class="btn-locked" onclick="window.open('https://wa.me/${RENCONTRES_WA}?text=${msg}','_blank')">
        💬 Obtenir l'accès — ${fmt(price)}
      </button>
    </div>
  </div>`;
}

// ============ PAID LISTING CARD (compatibilité admin) ============
function paidListingCard(p) { return infoCard(p); }
function openPaidListing(p) { openInfoDetail(p); }

// ============ PRODUCT CARD ============
function productCard(p, isFlash = false) {
  const pct = isFlash ? Math.round((p.stock/p.stockInit)*100) : null;
  const red = (p.oldPrice && p.price) ? Math.round(((p.oldPrice-p.price)/p.oldPrice)*100) : 0;
  const img = p.image ? `<img src="${p.image}" alt="${p.name||p.title}" loading="lazy" />` : `<span>${p.emoji||"🛍️"}</span>`;
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const name = p.name || p.title || "";
  const pData = JSON.stringify({id:p.id,name,price:p.price,oldPrice:p.oldPrice||null,stock:p.stock||0,image:p.image||null,description:p.description||"",whatsapp:wa,emoji:p.emoji||"🛍️"}).replace(/'/g,"&#39;");
  return `<div class="pcard" onclick='openProductDetail(${pData})' style="cursor:pointer">
    <div class="pcard-img">
      ${img}
      ${red > 0 ? `<span class="pcard-badge">-${red}%</span>` : ""}
      <span class="pcard-wish">♡</span>
    </div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      <div class="pcard-price">${fmt(p.price)}</div>
      ${p.oldPrice ? `<div class="pcard-oldprice">${fmt(p.oldPrice)}</div>` : ""}
      ${isFlash && p.stock > 0 ? `<div class="stock-bar"><span style="width:${pct}%"></span></div><div class="pcard-stock">${p.stock} restants</div>` : (!isFlash && p.stock > 0 ? `<div class="pcard-stock">${p.stock} en stock</div>` : "")}
      <div class="pcard-actions">
        <button class="btn-add" onclick='event.stopPropagation();addCart(${JSON.stringify({id:p.id,name,price:p.price,emoji:p.emoji||"🛍️",whatsapp:wa})})'>+ Panier</button>
        ${wa ? `<button class="btn-wa" onclick="event.stopPropagation();window.open('https://wa.me/${wa}?text='+encodeURIComponent('Bonjour, article: ${name.replace(/'/g,"")}'))">W</button>` : ""}
      </div>
    </div>
  </div>`;
}

function openProductDetail(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const img = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px" />` : "";
  const desc = (p.description || "").trim();
  modalHTML(`
    <h2 style="font-size:17px;margin-bottom:4px">${p.name} <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${img}
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:22px;font-weight:700;color:var(--primary)">${fmt(p.price)}</span>
      ${p.oldPrice ? `<span style="font-size:14px;color:var(--muted);text-decoration:line-through">${fmt(p.oldPrice)}</span>` : ""}
      <span style="font-size:13px;color:var(--muted)">${p.stock > 0 ? p.stock+" en stock" : "Rupture de stock"}</span>
    </div>
    ${desc ? `<div style="font-size:14px;line-height:1.7;color:var(--text);white-space:pre-line;margin-bottom:14px;background:#f9f9f9;padding:12px;border-radius:var(--radius)">${desc}</div>` : ""}
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
      ${wa ? `<button class="btn btn-secondary" onclick="window.open('https://wa.me/${wa}?text='+encodeURIComponent('Bonjour, je suis intéressé par : ${p.name.replace(/'/g,"")}'))">💬 WhatsApp</button>` : ""}
      <button class="btn btn-primary" onclick='addCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,emoji:p.emoji||"🛍️",whatsapp:wa})});closeModal()'>+ Panier</button>
    </div>`);
}

// ============ RENCONTRES ============
const RENCONTRE_SOUS = { amitie: "💙 Amitié", serieux: "❤️ Relation sérieuse" };

function rencontreCard(p) {
  const sousLabel = RENCONTRE_SOUS[p.souscat] || "❤️ Rencontre";
  const sousCls   = p.souscat === "serieux" ? "rcat-serieux" : "rcat-amitie";
  const descShort = (p.descShort || "").slice(0, 130);
  const pData = JSON.stringify({id:p.id,displayName:p.displayName,age:p.age,profession:p.profession,ville:p.ville,quartier:p.quartier,souscat:p.souscat,prixAcces:p.prixAcces,descShort:p.descShort||""}).replace(/'/g,"&#39;");
  return `<div class="rcard" onclick='openRencontreDetail(${pData})'>
    <div class="rcard-heart">❤️</div>
    <div class="rcard-body">
      <div class="rcard-name">${p.displayName}</div>
      <div class="rcard-info">
        ${p.age ? `<span>🎂 ${p.age} ans</span>` : ""}
        ${p.profession ? `<span>💼 ${p.profession}</span>` : ""}
        ${p.ville ? `<span>📍 ${p.ville}${p.quartier ? ", "+p.quartier : ""}</span>` : ""}
      </div>
      <span class="rcard-badge ${sousCls}">${sousLabel}</span>
      ${descShort ? `<div class="rcard-desc">${descShort}${(p.descShort||"").length>130?"…":""}</div>` : ""}
      <div class="rcard-lock">🔒 Coordonnées masquées — accès sur paiement</div>
      <div class="rcard-price">${fmt(p.prixAcces)}</div>
      <button class="rcard-btn" onclick="event.stopPropagation();openRencontreDetail(${pData})">❤️ Voir le profil complet</button>
    </div>
  </div>`;
}

function openRencontreDetail(p) {
  const sousLabel = RENCONTRE_SOUS[p.souscat] || "❤️ Rencontre";
  modalHTML(`
    <h2>❤️ Profil Rencontres <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="background:linear-gradient(135deg,#fce4ec,#fff8f8);border-radius:var(--radius);padding:16px;margin-bottom:14px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">❤️</div>
      <div style="font-size:20px;font-weight:700;color:#c2185b">${p.displayName}</div>
      <div style="font-size:13px;color:#777;margin-top:4px">
        ${p.age ? p.age+" ans" : ""}${p.profession ? " · "+p.profession : ""}${p.ville ? " · "+p.ville : ""}
      </div>
      <span style="display:inline-block;margin-top:8px;background:#fce4ec;color:#c2185b;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600">${sousLabel}</span>
    </div>
    ${p.descShort ? `<div style="background:#f9f9f9;border-radius:var(--radius);padding:12px;font-size:13px;line-height:1.7;color:#555;margin-bottom:14px;white-space:pre-line">${p.descShort}${(p.descShort||"").length>=148?"…":""}</div>` : ""}
    <div style="background:#FFF3E0;border:1.5px solid #FFCC80;border-radius:var(--radius);padding:14px;margin-bottom:16px;font-size:13px;line-height:1.8">
      <strong>🔒 Coordonnées masquées</strong><br>
      Pour accéder au profil complet (photo, numéros, description complète) :<br>
      1. Ajoutez ce profil à votre panier<br>
      2. Effectuez le paiement (${fmt(p.prixAcces)})<br>
      3. L'administrateur vous accordera l'accès complet via WhatsApp
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
      <button class="btn btn-primary" style="background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick='addCart({id:${p.id},name:${JSON.stringify(p.displayName)},price:${p.prixAcces},emoji:"❤️",isRencontre:true});closeModal()'>
        ❤️ Accéder au profil — ${fmt(p.prixAcces)}
      </button>
    </div>`);
}

function openRencontreRegister() {
  modalHTML(`
    <h2>❤️ Créer un profil <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="background:#fce4ec;border-left:4px solid #c2185b;border-radius:0 var(--radius) var(--radius) 0;padding:10px 14px;font-size:12px;margin-bottom:14px;line-height:1.6">
      ✅ Réservé aux <strong>majeurs (18 ans et plus)</strong>. Votre profil sera vérifié et publié par l'administrateur. Votre identité réelle reste confidentielle.
    </div>
    <div class="form-row">
      <div class="form-group"><label>Nom *</label><input id="rcNom" placeholder="Votre nom" /></div>
      <div class="form-group"><label>Prénom *</label><input id="rcPrenom" placeholder="Votre prénom" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date de naissance *</label><input id="rcBirth" type="date" max="${new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split('T')[0]}" /></div>
      <div class="form-group"><label>Sexe *</label>
        <select id="rcSexe"><option value="">— Sélectionner —</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Profession</label><input id="rcProf" placeholder="Ex: Commerçant, Étudiant…" /></div>
      <div class="form-group"><label>Ville</label><input id="rcVille" placeholder="Ex: Abengourou" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Quartier</label><input id="rcQuartier" placeholder="Ex: Centre-ville" /></div>
      <div class="form-group"><label>Type de rencontre</label>
        <select id="rcSouscat"><option value="amitie">💙 Amitié</option><option value="serieux">❤️ Relation sérieuse</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>📞 N° Téléphone (CI uniquement) *</label><input id="rcPhone" placeholder="07 67 20 22 71" type="tel" /></div>
      <div class="form-group"><label>💬 N° WhatsApp (CI uniquement)</label><input id="rcWa" placeholder="07 67 20 22 71" type="tel" /></div>
    </div>
    <div class="form-group">
      <label>📷 Votre photo <small style="color:var(--muted)">(jamais visible publiquement — uniquement après paiement d'accès)</small></label>
      <input id="rcPhoto" type="file" accept="image/*,image/heic,image/heif" class="img-file-input" onchange="previewRcImg(this)" />
      <div id="rcPhotoPreview" style="display:none;margin-top:8px;display:flex;align-items:center;gap:10px">
        <img id="rcPhotoImg" style="width:72px;height:72px;object-fit:cover;border-radius:50%;border:3px solid #c2185b" />
        <button type="button" class="img-preview-remove" onclick="document.getElementById('rcPhoto').value='';document.getElementById('rcPhotoPreview').style.display='none'">✕ Supprimer</button>
      </div>
    </div>
    <div class="form-group">
      <label>Description <small style="color:var(--muted)">(décrivez-vous et le type de personne que vous recherchez)</small></label>
      <textarea id="rcDesc" rows="4" placeholder="Je suis une personne sérieuse…&#10;Je recherche quelqu'un qui…" style="width:100%;border:1px solid #ddd;border-radius:var(--radius);padding:10px;font-size:13px;font-family:inherit;resize:vertical;box-sizing:border-box"></textarea>
    </div>
    <div style="background:#fce4ec;border-radius:var(--radius);padding:12px;font-size:12px;margin-bottom:16px;line-height:1.8">
      <strong>📋 Règles à respecter :</strong><br>
      ✅ Respect obligatoire entre utilisateurs<br>
      ✅ Interdiction des contenus sexuels ou obscènes<br>
      ✅ Interdiction de la prostitution et des services d'escorte<br>
      ✅ Interdiction des arnaques et demandes d'argent<br>
      ✅ Réservé aux personnes majeures (18 ans et plus)<br>
      ✅ Vos infos personnelles restent protégées
    </div>
    <div id="rcProgressWrap" style="display:none" class="progress-wrap">
      <p>⏳ Envoi en cours…</p>
      <div class="progress-track"><div class="progress-fill" id="rcProgressFill"></div></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
      <button id="rcSubmitBtn" class="btn btn-primary" style="background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick="submitRencontreProfile()">
        ❤️ Envoyer mon profil
      </button>
    </div>`);
}

function previewRcImg(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("rcPhotoImg").src = ev.target.result;
    document.getElementById("rcPhotoPreview").style.display = "flex";
  };
  reader.readAsDataURL(input.files[0]);
}

async function submitRencontreProfile() {
  const nom = document.getElementById("rcNom").value.trim();
  const prenom = document.getElementById("rcPrenom").value.trim();
  const birthdate = document.getElementById("rcBirth").value;
  const sexe = document.getElementById("rcSexe").value;
  const phoneVal = document.getElementById("rcPhone").value.trim();
  const waVal = document.getElementById("rcWa").value.trim();
  if (!nom || !prenom || !birthdate || !sexe) return toast("Remplissez les champs obligatoires (nom, prénom, date, sexe)", "red");
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
  if (age < 18) return toast("Vous devez avoir au moins 18 ans", "red");
  if (!phoneVal) return toast("Le numéro de téléphone est obligatoire", "red");
  if (!isValidCIPhone(phoneVal)) return toast("Le téléphone doit être un numéro ivoirien (+225 XXXXXXXXXX)", "red");
  if (waVal && !isValidCIPhone(waVal)) return toast("Le numéro WhatsApp doit être un numéro ivoirien (+225 XXXXXXXXXX)", "red");

  const btn = document.getElementById("rcSubmitBtn");
  const pw = document.getElementById("rcProgressWrap");
  if (btn) { btn.disabled = true; btn.textContent = "Envoi…"; }
  if (pw) pw.style.display = "block";
  const bar = startProgress("rcProgressFill", "#c2185b");

  const photoFile = document.getElementById("rcPhoto").files[0];
  let photo = null;
  if (photoFile) photo = await compressImage(photoFile);

  const body = {
    nom, prenom, birthdate, sexe,
    profession: document.getElementById("rcProf").value.trim(),
    ville: document.getElementById("rcVille").value.trim(),
    quartier: document.getElementById("rcQuartier").value.trim(),
    whatsapp: waVal,
    phone: phoneVal,
    prixAcces: 500, // défini par l'administrateur lors de l'approbation
    description: document.getElementById("rcDesc").value.trim(),
    souscat: document.getElementById("rcSouscat").value,
    photo,
  };
  try {
    const r = await fetch("/api/rencontres", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const j = await r.json();
    bar.done(r.ok);
    await new Promise(res => setTimeout(res, 400));
    if (r.ok) {
      closeModal();
      toast("✓ Profil envoyé — en attente de validation par l'administrateur", "green");
    } else { toast(j.error || "Erreur lors de l'envoi", "red"); }
  } catch { bar.done(false); toast("Erreur réseau", "red"); }
  finally { if (btn) { btn.disabled = false; btn.textContent = "❤️ Envoyer mon profil"; } }
}

async function showRencontresPage() {
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">❤️</span>
      <div><h2>Rencontres & Amitiés</h2><p>Trouvez de nouvelles connaissances dans un cadre respectueux et sécurisé</p></div>
    </div>
    <div class="rencontre-rules">
      <h4>📋 Règles de la communauté</h4>
      ✅ Respect obligatoire entre utilisateurs &nbsp;·&nbsp; ✅ Interdiction des contenus obscènes<br>
      ✅ Interdiction de la prostitution &nbsp;·&nbsp; ✅ Interdiction des arnaques et demandes d'argent<br>
      ✅ Réservé aux personnes majeures (18 ans et plus) &nbsp;·&nbsp; ✅ Informations personnelles protégées
    </div>
    <div style="margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" style="background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick="openRencontreRegister()">❤️ Créer mon profil</button>
    </div>
    <div class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement des profils…</p></div>
    </div>`;
  let profiles = [];
  try { profiles = await (await fetch("/api/rencontres")).json(); } catch {}
  if (!profiles.length) {
    wrap.querySelector(".section-block").innerHTML = `<div class="empty-state"><div class="empty-ico">❤️</div><p>Aucun profil disponible pour le moment.</p><button class="btn btn-primary" style="margin-top:12px;background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick="openRencontreRegister()">❤️ Créer le premier profil</button></div>`;
    return;
  }
  const byAmitie = profiles.filter(p => p.souscat !== "serieux");
  const bySerieux = profiles.filter(p => p.souscat === "serieux");
  let html = `<div style="font-size:13px;color:var(--muted);margin-bottom:16px">${profiles.length} profil${profiles.length>1?"s":""} disponible${profiles.length>1?"s":""}</div>`;
  if (bySerieux.length) html += `<h3 style="margin-bottom:12px;color:#c2185b">❤️ Relation sérieuse</h3><div class="rencontre-grid">${bySerieux.map(rencontreCard).join("")}</div><br>`;
  if (byAmitie.length) html += `<h3 style="margin-bottom:12px;color:#1565c0">💙 Amitié</h3><div class="rencontre-grid">${byAmitie.map(rencontreCard).join("")}</div>`;
  wrap.querySelector(".section-block").innerHTML = html;
}

async function loadRencontresSection() {
  const el = document.getElementById("rencontresGrid");
  if (!el) return;
  let profiles = [];
  try { profiles = await (await fetch("/api/rencontres")).json(); } catch {}
  if (!profiles.length) {
    el.innerHTML = `<div class="tile-empty" style="grid-column:1/-1"><span>❤️</span><p>Aucun profil disponible pour le moment</p></div>`;
    return;
  }
  el.innerHTML = profiles.slice(0, 4).map(rencontreCard).join("");
}

// ============ PAGE 2 TABS : Concours / Actualités / Emploi ============
let _page2All = null;
async function switchPage2Tab(cat, btn) {
  document.querySelectorAll(".page2-tab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = document.getElementById("page2Content");
  if (!el) return;
  el.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>`;
  if (!_page2All) {
    try { _page2All = await (await fetch("/api/products")).json(); } catch { _page2All = []; }
  }
  const items = _page2All.filter(p => p.category === cat || (cat === "actualites" && p.category === "actualites") || (cat === "concours" && p.category === "concours-ci"));
  const icon = cat === "concours" ? "📚" : cat === "actualites" ? "📰" : "💼";
  const label = cat === "concours" ? "Concours CI" : cat === "actualites" ? "Actualités" : "Offres d'emploi";
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-ico">${icon}</div><p>Aucune ${label.toLowerCase()} pour le moment.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="info-cards-grid">${items.map(p => infoCard(p)).join("")}</div>`;
}

// ============ RENDER HOME ============
function renderHome() {
  renderSidebar(document.getElementById("desktopSidebar"));
  renderCatNav();
  renderCarousel();

  document.getElementById("shortcuts").innerHTML = SHORTCUTS.map(([i,n,cat]) =>
    `<a href="#" class="shortcut" onclick="filterCat('${cat}');return false;"><span class="ico">${i}</span><span>${n}</span></a>`
  ).join("");

  // Charger la page 2 (onglet Concours par défaut)
  switchPage2Tab("concours", document.querySelector(".page2-tab.active"));

  loadFlashSection();
  loadCatSection("realGrid", "immobilier", "🏠", "Aucun bien immobilier disponible.", "products-grid");
  loadTransportSection();
  loadCatSection("restoGrid", "restaurants", "🍽️", "Aucun restaurant disponible.", "products-grid");
  loadShop();
  loadRencontresSection();
}

// Offres flash = produits avec remise publiés (oldPrice > price)
async function loadFlashSection() {
  const el = document.getElementById("flashGrid");
  if (!el) return;
  let products = [];
  try {
    const all = await (await fetch("/api/products")).json();
    products = all.filter(p => p.oldPrice && Number(p.oldPrice) > Number(p.price) && !PAID_CATS.has(p.category));
  } catch {}
  if (!products.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">⚡</div><p>Aucune offre flash pour le moment.</p></div>`;
    return;
  }
  el.innerHTML = products.map(p => productCard({...p, name:p.title}, true)).join("");
}

// Charge une catégorie depuis l'API dans une grille
async function loadCatSection(gridId, category, icon, emptyMsg, gridClass) {
  const el = document.getElementById(gridId);
  if (!el) return;
  let products = [];
  try {
    const all = await (await fetch("/api/products")).json();
    products = all.filter(p => p.category === category);
  } catch {}
  if (!products.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">${icon}</div><p>${emptyMsg}</p></div>`;
    return;
  }
  el.className = gridClass;
  el.innerHTML = products.map(p => productCard({...p, name:p.title})).join("");
}

// Transport depuis l'API
async function loadTransportSection() {
  const el = document.getElementById("transportGrid");
  if (!el) return;
  let products = [];
  try {
    const all = await (await fetch("/api/products")).json();
    products = all.filter(p => p.category === "transport");
  } catch {}
  if (!products.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-ico">🚕</div><p>Aucune offre de transport pour le moment.</p></div>`;
    return;
  }
  el.innerHTML = products.map(p => {
    const wa = (p.whatsapp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Bonjour, je souhaite commander : ${p.title}`);
    return `<div class="transport-card">
      <div class="t-ico">${p.image ? `<img src="${p.image}" style="width:60px;height:60px;object-fit:cover;border-radius:50%">` : "🚕"}</div>
      <h4>${p.title}</h4>
      <p style="font-size:12px;color:var(--muted);margin-top:4px">${p.description||""}</p>
      ${p.price > 0 ? `<div style="font-weight:700;color:var(--primary);margin-top:8px">${fmt(p.price)}</div>` : ""}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-add" style="flex:1;border-radius:20px"
          onclick='addCart({id:${p.id},name:"${p.title.replace(/"/g,"&quot;")}",price:${p.price},emoji:"🚕",whatsapp:"${wa}"})'>🛒 Commander</button>
        ${wa ? `<button class="btn-wa" style="border-radius:20px;padding:8px 14px" onclick="window.open('https://wa.me/${wa}?text=${msg}','_blank')">W</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

// Actualités depuis l'API
async function loadNewsSection() {
  const el = document.getElementById("newsList");
  if (!el) return;
  let products = [];
  try {
    const all = await (await fetch("/api/products")).json();
    products = all.filter(p => p.category === "actualites");
  } catch {}
  if (!products.length) {
    el.innerHTML = `<li style="list-style:none;padding:20px;text-align:center;color:var(--muted)">📰 Aucune actualité pour le moment.</li>`;
    return;
  }
  el.innerHTML = products.map(p => `
    <li>
      <span class="news-cat">Actualité</span>
      <div class="news-txt"><h5>${p.title}</h5><span>${new Date(p.createdAt||Date.now()).toLocaleDateString("fr-FR")}</span></div>
    </li>`).join("");
}

// ============ LOAD SHOP (API) ============
async function loadShop() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;
  let products = [];
  try { products = await (await fetch("/api/products")).json(); } catch {}
  // Exclure les offres emploi/concours de la boutique principale
  const shopItems = products.filter(p => !PAID_CATS.has(p.category));
  if (!shopItems.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">🛍️</div><p>Aucun article en ligne pour le moment.</p></div>`;
    return;
  }
  grid.innerHTML = shopItems.map(p => productCard({ ...p, name: p.title }, false)).join("");
}

// ============ LOAD INFO SECTIONS (Emploi / Concours — affichage libre) ============
async function loadPaidSection(gridId, category, icon) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}
  const items = all.filter(p => p.category === category);
  if (!items.length) {
    grid.innerHTML = `<div class="tile-empty"><span>${icon}</span><p>0 offre disponible pour le moment</p></div>`;
    return;
  }
  grid.className = "info-cards-grid";
  grid.innerHTML = items.map(p => infoCard(p)).join("");
}

// ============ SEARCH ============
async function doSearch() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const cat = document.getElementById("searchCat").value;
  if (!q && !cat) return toast("Entrez un mot-clé ou choisissez une catégorie", "red");

  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  const label = cat ? (CATEGORIES.find(c=>c[0]===cat)?.[2]||cat) : `"${q}"`;
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">🔍</span>
      <div><h2>Résultats : ${label}</h2><p>Recherche en cours…</p></div>
    </div>
    <div class="section-block"><div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div></div>`;

  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}

  let results = all;
  if (cat) results = results.filter(p => p.category === cat);
  if (q) results = results.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.ownerName?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q)
  );

  if (!results.length) {
    wrap.querySelector(".section-block").innerHTML =
      `<div class="empty-state"><div class="empty-ico">🔍</div><p>Aucun résultat pour <strong>${label}</strong>.</p></div>`;
    return;
  }
  wrap.querySelector("p").textContent = `${results.length} résultat${results.length>1?"s":""}`;
  wrap.querySelector(".section-block").innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${results.length} résultat${results.length>1?"s":""}</div>
    <div class="products-grid">
      ${results.map(p => PAID_CATS.has(p.category) ? paidListingCard(p) : productCard({...p,name:p.title})).join("")}
    </div>`;
}
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.id === "searchInput") doSearch();
});

// ============ NAVIGATION ============
function showPage(id) {
  document.querySelectorAll(".page-view").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showHome() {
  showPage("page-home");
  // Recharger les sections dynamiques emploi/concours
  loadPaidSection("concoursGrid", "concours-ci", "📚");
  loadPaidSection("jobsGrid", "emploi", "💼");
  loadShop();
}
function showText(key) {
  const TEXTS = {
    apropos: { t:"À propos de nous", ico:"ℹ️", b:`ABENGOUROU-MARKET est une plateforme numérique conçue pour faciliter les échanges commerciaux, la diffusion d'informations et l'accès aux opportunités dans la ville d'Abengourou et partout en Côte d'Ivoire.

Notre mission est de rapprocher vendeurs, acheteurs, employeurs, chercheurs d'emploi, propriétaires immobiliers, prestataires de services et citoyens au sein d'une même plateforme moderne et accessible.

À travers ABENGOUROU-MARKET, vous pouvez :
• Acheter et vendre des produits
• Publier et consulter des offres d'emploi
• Suivre les actualités des concours
• Trouver des biens immobiliers
• Publier des petites annonces
• Découvrir les actualités et événements locaux
• Accéder à divers services de proximité

Notre ambition est de contribuer au développement économique et numérique de la région d'Abengourou.` },
    conditions: { t:"Conditions d'utilisation", ico:"📋", b:`En utilisant ABENGOUROU-MARKET, vous acceptez les présentes conditions d'utilisation.

Utilisation du service
Les utilisateurs s'engagent à fournir des informations exactes lors de leur inscription et de leurs publications.

Publications interdites
• Informations mensongères ou frauduleuses
• Contenus diffamatoires ou injurieux
• Produits ou services interdits par la loi

Responsabilité
ABENGOUROU-MARKET agit comme intermédiaire et ne peut être tenu responsable des transactions entre utilisateurs.

Suspension de compte
Tout compte ne respectant pas ces conditions pourra être suspendu sans préavis.` },
    conf: { t:"Politique de confidentialité", ico:"🔒", b:`ABENGOUROU-MARKET accorde une grande importance à la protection des données personnelles.

Données collectées : Nom, téléphone, informations des annonces publiées.

Utilisation : Créer et gérer votre compte, faciliter les échanges, améliorer nos services.

Protection : Mesures de sécurité contre tout accès non autorisé.

Partage : Nous ne vendons ni ne louons les données personnelles à des tiers.

Vos droits : Vous pouvez demander la modification ou suppression de vos données à tout moment.` },
    contact: { t:"Nous contacter", ico:"📞", b:`📍 Abengourou, Côte d'Ivoire
📞 Téléphone : +225 0767202271
📧 E-mail : contact@abengourou-market.com
🌐 Site web : ${window.location.origin}

Service client
Du lundi au samedi · 08h00 à 18h00

Pour toute question, suggestion ou réclamation, n'hésitez pas à nous contacter.` },
    pub: { t:"Faire de la publicité", ico:"📢", b:`Faites connaître votre activité à des milliers d'utilisateurs à Abengourou et dans toute la Côte d'Ivoire.

Nos offres publicitaires :
• Bannière en page d'accueil
• Mise en avant de vos articles
• Article sponsorisé

Contactez-nous pour les tarifs :
📧 contact@abengourou-market.com
📞 +225 0767202271` },
  };
  const T = TEXTS[key];
  document.getElementById("textBody").innerHTML = `
    <h2 style="display:flex;align-items:center;gap:10px;margin-bottom:16px">${T.ico} ${T.t}</h2>
    <div style="white-space:pre-line;font-size:14px;line-height:1.8;color:var(--text)">${T.b}</div>`;
  showPage("page-text");
}

// ============ CART ============
function addCart(p) {
  const ex = CART.find(i => String(i.id) === String(p.id));
  if (ex) ex.qty++;
  else CART.push({
    id: p.id, name: p.name, price: p.price, emoji: p.emoji || "📦", qty: 1,
    whatsapp: (p.whatsapp || "").replace(/\D/g, ""),
    isRencontre: p.isRencontre || false,
  });
  saveCart();
  toast("✓ Ajouté au panier", "green");
}

function openCart() {
  if (!CART.length) {
    modalHTML(`
      <h2>🛒 Mon panier <button class="modal-close" onclick="closeModal()">✕</button></h2>
      <div class="empty-state"><div class="empty-ico">🛒</div><p>Votre panier est vide.</p></div>
      <div class="btn-row"><button class="btn btn-primary" onclick="closeModal()">Continuer les achats</button></div>`);
    return;
  }
  const total = CART.reduce((s, i) => s + i.price * i.qty, 0);
  modalHTML(`
    <h2>🛒 Mon panier <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${CART.map((i, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${i.emoji} ${i.name}</strong>
          <small>${i.qty} × ${fmt(i.price)}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <strong>${fmt(i.price * i.qty)}</strong>
          <button class="btn btn-ghost btn-sm" onclick="removeItem(${idx})">✕</button>
        </div>
      </div>`).join("")}
    <hr class="modal-divider" />
    <div class="cart-total-bar"><span>Total</span><span>${fmt(total)}</span></div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Continuer</button>
      <button class="btn btn-primary" style="background:#25D366;border-color:#25D366" onclick="startCheckout()">💬 Commander sur WhatsApp →</button>
    </div>`);
}

function removeItem(i) { CART.splice(i, 1); saveCart(); openCart(); }

// ============ CHECKOUT — Direct WhatsApp ============
let CHECKOUT = {};
function startCheckout() {
  const waGroups = {};
  for (const item of CART) {
    const wa = item.isRencontre ? RENCONTRES_WA : (item.whatsapp || "");
    if (wa) {
      waGroups[wa] = waGroups[wa] || [];
      waGroups[wa].push(item);
    }
  }

  if (Object.keys(waGroups).length === 0) {
    toast("Aucun numéro WhatsApp disponible pour ces articles", "red");
    return;
  }

  const buildMsg = (items) => {
    const t = items.reduce((s,i) => s + i.price * i.qty, 0);
    const lines = items.map(i => `• ${i.qty}× ${i.name} — ${fmt(i.price * i.qty)}`).join("%0A");
    return `🛒 *Nouvelle commande ABENGOUROU-MARKET*%0A%0A📦 Articles :%0A${lines}%0A%0A💰 Total : ${fmt(t)}`;
  };

  // Enregistrer en base de données
  const total = CART.reduce((s, i) => s + i.price * i.qty, 0);
  try { fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ items: CART, total, delivery: "whatsapp", name: "", phone: "", payMethod: "" }) }); } catch {}

  // Ouvrir WhatsApp pour chaque vendeur
  for (const [wa, items] of Object.entries(waGroups)) {
    window.open(`https://wa.me/${wa}?text=${buildMsg(items)}`, "_blank");
  }

  CART = []; saveCart(); CHECKOUT = {};
  closeModal();
  toast("✓ Commande envoyée sur WhatsApp !", "green");
}

// ============ SANTÉ — Page spéciale ============
async function showSantePage() {
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">🏥</span>
      <div><h2>Santé</h2><p>Pharmacies de garde · Hôpitaux de proximité · Abengourou</p></div>
    </div>
    <div class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>
    </div>`;

  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}
  const items = all.filter(p => p.category === "sante");

  const pharmacies = items.filter(p => (p.title || "").toLowerCase().includes("pharmac") || (p.description || "").toLowerCase().includes("pharmac") || (p.title || "").toLowerCase().includes("garde"));
  const hopitaux = items.filter(p => !pharmacies.includes(p));

  const pharmacieHtml = pharmacies.length
    ? pharmacies.map(p => waOnlyCard({...p, name: p.title})).join("")
    : `<div class="sante-static-card">
        <div class="sante-icon">💊</div>
        <h4>Pharmacie Principale d'Abengourou</h4>
        <p>Centre-ville, Abengourou</p>
        <p style="font-size:12px;color:var(--muted)">Horaires de garde : 20h – 07h et week-ends</p>
      </div>`;

  const hopitalHtml = hopitaux.length
    ? hopitaux.map(p => waOnlyCard({...p, name: p.title})).join("")
    : `<div class="sante-static-card">
        <div class="sante-icon">🏥</div>
        <h4>Hôpital Général d'Abengourou (HGA)</h4>
        <p>Abengourou, Côte d'Ivoire</p>
        <p style="font-size:12px;color:var(--muted)">Urgences 24h/24 · 7j/7</p>
      </div>
      <div class="sante-static-card">
        <div class="sante-icon">🏥</div>
        <h4>Centre de Santé Urbain d'Abengourou</h4>
        <p>Centre-ville, Abengourou</p>
        <p style="font-size:12px;color:var(--muted)">Consultations · Soins de proximité</p>
      </div>`;

  wrap.querySelector(".section-block").innerHTML = `
    <div class="sante-section">
      <h3 class="sante-title">💊 Pharmacies de garde</h3>
      <div class="sante-grid">${pharmacieHtml}</div>
    </div>
    <div class="sante-section" style="margin-top:24px">
      <h3 class="sante-title">🏥 Hôpitaux de proximité</h3>
      <div class="sante-grid">${hopitalHtml}</div>
    </div>`;
}

// ============ SCOLAIRES — Page avec sous-catégories ============
async function showScolairesPage() {
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">🎓</span>
      <div><h2>Scolaires</h2><p>Collèges · Grandes Écoles · Cours particuliers · Abengourou</p></div>
    </div>
    <div class="scolaire-subcats">
      <button class="scolaire-btn active" onclick="showScolairesSub('college', this)">🏫 Collèges &amp; Lycées</button>
      <button class="scolaire-btn" onclick="showScolairesSub('grande-ecole', this)">🎓 Grandes Écoles</button>
      <button class="scolaire-btn" onclick="showScolairesSub('cours', this)">📖 Cours particuliers</button>
    </div>
    <div id="scolaireContent" class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>
    </div>`;

  showScolairesSub("college", document.querySelector(".scolaire-btn.active"));
}

async function showScolairesSub(sub, btn) {
  document.querySelectorAll(".scolaire-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const el = document.getElementById("scolaireContent");
  el.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>`;

  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}
  const items = all.filter(p => p.category === "scolaires" && (
    sub === "college" ? (p.title||"").toLowerCase().match(/coll[eè]ge|lyc[eé]e|secondaire|6e|terminale/) || !(p.title||"").toLowerCase().match(/grande.*[eé]cole|cours|formation|universit/) :
    sub === "grande-ecole" ? (p.title||"").toLowerCase().match(/grande.*[eé]cole|universit|[eé]cole.*sup|iut|inphb|ena|infas|bts/) :
    (p.title||"").toLowerCase().match(/cours|r[eé]p[eé]tition|soutien|tutorat|formation/)
  ));

  const subLabel = sub === "college" ? "Collèges & Lycées" : sub === "grande-ecole" ? "Grandes Écoles" : "Cours particuliers";
  const subIcon = sub === "college" ? "🏫" : sub === "grande-ecole" ? "🎓" : "📖";

  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-ico">${subIcon}</div><p>Aucune annonce pour <strong>${subLabel}</strong> pour le moment.</p></div>`;
    return;
  }
  el.innerHTML = `<div style="font-size:13px;color:var(--muted);margin-bottom:12px">${items.length} établissement${items.length>1?"s":""}</div><div class="products-grid">${items.map(p => waOnlyCard({...p, name:p.title})).join("")}</div>`;
}

// ============ ACCOUNT ============
function openAccount() {
  if (USER) {
    const initials = USER.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
    const actionBtn = USER.role === "admin"
      ? `<button class="btn btn-primary" onclick="closeModal();showAdmin()">🎛️ Tableau de bord Admin</button>`
      : USER.role === "vendeur"
        ? `<button class="btn btn-primary" onclick="closeModal();showVendeur()">🏪 Mon espace vendeur</button>`
        : "";
    modalHTML(`
      <h2>Mon compte <button class="modal-close" onclick="closeModal()">✕</button></h2>
      <div style="display:flex;align-items:center;gap:14px;padding:12px;background:#f9f9f9;border-radius:var(--radius);margin-bottom:16px">
        <div class="account-avatar">${initials}</div>
        <div><strong style="font-size:16px">${USER.name}</strong><br><span style="font-size:13px;color:var(--muted)">Compte : ${USER.role}</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${actionBtn}
        <button class="btn btn-ghost" onclick="logout()">🚪 Se déconnecter</button>
      </div>`);
    return;
  }
  modalHTML(`
    <h2>👤 Mon compte <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div class="tabs">
      <button class="active" onclick="accTab(this,'login')">Connexion</button>
      <button onclick="accTab(this,'register')">Inscription</button>
    </div>
    <div id="accBody"></div>`);
  accTab(document.querySelector(".tabs button"), "login");
}
function accTab(btn, which) {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const body = document.getElementById("accBody");
  if (which === "login") {
    body.innerHTML = `
      <div class="form-group"><label>Identifiant</label><input id="lgId" placeholder="Votre identifiant" autocomplete="username" /></div>
      <div class="form-group"><label>Mot de passe</label><input id="lgPwd" type="password" placeholder="••••••••" autocomplete="current-password" /></div>
      <div class="btn-row"><button class="btn btn-primary" onclick="doLogin()">Se connecter</button></div>
      <p style="font-size:12px;color:var(--muted);margin-top:10px;text-align:center">Espace réservé aux vendeurs et à l'administrateur.<br>Les clients commandent directement sans compte.</p>`;
  } else {
    body.innerHTML = `
      <div style="background:var(--primary-light);border-left:4px solid var(--primary);border-radius:0 var(--radius) var(--radius) 0;padding:10px 14px;font-size:13px;margin-bottom:14px">
        🏪 L'inscription est réservée aux <strong>vendeurs</strong>. Les clients peuvent commander librement sans compte.
      </div>
      <div class="form-group"><label>Nom complet</label><input id="rgName" placeholder="Jean Kouassi" /></div>
      <div class="form-group"><label>Téléphone</label><input id="rgPhone" placeholder="07 00 00 00 00" type="tel" /></div>
      <div class="form-group"><label>Identifiant</label><input id="rgId" placeholder="Choisissez un identifiant" /></div>
      <div class="form-group"><label>Mot de passe</label><input id="rgPwd" type="password" placeholder="••••••••" autocomplete="new-password" /></div>
      <div class="btn-row"><button class="btn btn-primary" onclick="doRegister()">Créer mon compte vendeur</button></div>`;
  }
}
async function doLogin() {
  const id = document.getElementById("lgId").value.trim(), pwd = document.getElementById("lgPwd").value;
  if (!id || !pwd) return toast("Remplissez tous les champs", "red");
  const r = await fetch("/api/login", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, pwd }) });
  if (!r.ok) return toast("Identifiants invalides", "red");
  const u = await r.json();
  if (u.role === "vendeur" && !u.approved) return toast("Compte en attente de validation admin", "red");
  USER = { ...u, id };
  localStorage.setItem("user", JSON.stringify(USER));
  closeModal(); toast(`Bienvenue ${u.name} !`, "green");
  if (u.role === "admin") showAdmin();
  else if (u.role === "vendeur") showVendeur();
}
async function doRegister() {
  const data = {
    id: document.getElementById("rgId").value.trim(),
    pwd: document.getElementById("rgPwd").value,
    name: document.getElementById("rgName").value.trim(),
    phone: document.getElementById("rgPhone").value.trim(),
    role: "vendeur",
  };
  if (!data.id || !data.pwd || !data.name) return toast("Remplissez tous les champs", "red");
  if (data.phone && !isValidCIPhone(data.phone)) return toast("Le numéro de téléphone doit être un numéro ivoirien (+225)", "red");

  // Barre de progression sur le bouton
  const btn = event.target;
  const origText = btn.textContent;
  btn.disabled = true;
  const pgWrap = document.createElement("div");
  pgWrap.className = "progress-wrap";
  pgWrap.innerHTML = `<p>⏳ Création du compte…</p><div class="progress-track"><div class="progress-fill" id="regProgressFill"></div></div>`;
  btn.parentNode.insertBefore(pgWrap, btn.nextSibling);
  const bar = startProgress("regProgressFill");

  const r = await fetch("/api/register", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) });
  const j = await r.json();
  bar.done(r.ok);
  await new Promise(res => setTimeout(res, 400));
  btn.disabled = false; btn.textContent = origText;
  if (!r.ok) return toast(j.error || "Erreur", "red");
  toast("Inscription envoyée — en attente de validation", "green");
  accTab(document.querySelectorAll(".tabs button")[0], "login");
}
function logout() { USER = null; localStorage.removeItem("user"); closeModal(); toast("Déconnecté"); showHome(); }

// ============ VENDEUR ============
function showVendeur() {
  if (!USER || USER.role !== "vendeur") return toast("Réservé aux vendeurs", "red");
  showPage("page-vendeur");
  const sel = document.getElementById("catSelect");
  if (sel) sel.innerHTML = CATEGORIES.map(([s,_,n]) => `<option value="${s}">${n}</option>`).join("");
  const banner = document.getElementById("subBanner");
  if (banner) {
    banner.innerHTML = USER.active
      ? `<div class="sub-active">✅ Compte actif — vos articles sont visibles sur la plateforme.</div>`
      : `<div class="sub-inactive">⏳ Compte en attente de validation par l'administrateur.</div>`;
  }
  const form = document.getElementById("productForm");
  if (form) {
    const submitBtn = form.querySelector("button[type=submit]");
    if (submitBtn) {
      submitBtn.disabled = !USER.active;
      submitBtn.title = USER.active ? "" : "En attente de validation par l'admin";
      submitBtn.style.opacity = USER.active ? "" : "0.5";
    }
  }
  loadMyProducts();
}

// ============ IMAGE PREVIEW ============
function previewImg(input) {
  const wrap = input.closest(".form-group").querySelector(".img-preview-wrap");
  const imgEl = input.closest(".form-group").querySelector(".img-preview");
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = ev => {
    imgEl.src = ev.target.result;
    wrap.style.display = "flex";
  };
  reader.readAsDataURL(input.files[0]);
}

function removeImgPreview(btn) {
  const group = btn.closest(".form-group");
  const input = group.querySelector(".img-file-input");
  const wrap = group.querySelector(".img-preview-wrap");
  const imgEl = group.querySelector(".img-preview");
  input.value = "";
  imgEl.src = "";
  wrap.style.display = "none";
}

function togglePaidHint(sel) { switchFormForCat(sel); }

function switchFormForCat(sel) {
  const form = sel.closest("form");
  if (!form) return;
  const isPaid = PAID_CATS.has(sel.value);
  const artSection = form.querySelector(".pf-article");
  const jobSection = form.querySelector(".pf-job");
  if (artSection) artSection.style.display = isPaid ? "none" : "";
  if (jobSection) jobSection.style.display = isPaid ? "" : "none";
}

// ============ IMAGE COMPRESSION ============
async function compressImage(file, maxW = 900, quality = 0.78) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const image = new Image();
      image.onload = () => {
        let w = image.width, h = image.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(image, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ============ PRODUCT FORM SUBMIT ============
document.addEventListener("submit", async e => {
  if (e.target.id !== "productForm" && e.target.id !== "adminProductForm") return;
  e.preventDefault();
  const f = e.target;
  const submitBtn = f.querySelector("button[type=submit]");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Publication en cours…"; }

  const file = f.image && f.image.files[0];
  let img = null;
  if (file) img = await compressImage(file);

  const cat = f.category.value;
  const isPaid = PAID_CATS.has(cat);

  // Pour les offres emploi/concours, enrichir la description avec les champs spécifiques
  let desc = f.description ? f.description.value : "";
  if (isPaid) {
    const employer = f.employer ? f.employer.value : "";
    const loc      = f.jobLocation ? f.jobLocation.value : "";
    const ctype    = f.contractType ? f.contractType.value : "";
    const salary   = f.salary ? f.salary.value : "";
    const deadline = f.deadline ? f.deadline.value : "";
    const extras = [
      employer  ? `🏢 Entreprise : ${employer}` : "",
      loc       ? `📍 Lieu : ${loc}` : "",
      ctype     ? `📄 Contrat : ${ctype}` : "",
      salary    ? `💰 Salaire : ${salary}` : "",
      deadline  ? `⏰ Date limite : ${new Date(deadline).toLocaleDateString("fr-FR")}` : "",
    ].filter(Boolean).join("\n");
    desc = (extras ? extras + "\n\n" : "") + desc;
  }

  // Récupérer price/stock/whatsapp selon la section ACTIVE uniquement
  const activeSection = isPaid ? f.querySelector(".pf-job") : f.querySelector(".pf-article");
  const price = Number(activeSection?.querySelector("input[name='price']")?.value || 0);
  const stock = isPaid ? 9999 : (Number(activeSection?.querySelector("input[name='stock']")?.value) || 0);
  const whatsapp = activeSection?.querySelector("input[name='whatsapp']")?.value || "";
  const oldPrice = isPaid ? null : (Number(f.querySelector(".pf-article input[name='oldPrice']")?.value) || null);
  const personalPhone = isPaid ? "" : (f.querySelector(".pf-article input[name='personalPhone']")?.value || "");

  const body = {
    ownerId: USER.id, ownerName: USER.name, ownerRole: USER.role,
    title: f.title.value, category: cat,
    price, oldPrice, stock, whatsapp, personalPhone,
    image: img, description: desc,
  };

  try {
    const r = await fetch("/api/products", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    if (r.ok) {
      f.reset();
      f.querySelectorAll(".img-preview-wrap").forEach(w => { w.style.display = "none"; });
      f.querySelectorAll(".img-preview").forEach(i => { i.src = ""; });
      f.querySelectorAll(".pf-job").forEach(s => { s.style.display = "none"; });
      f.querySelectorAll(".pf-article").forEach(s => { s.style.display = ""; });
      if (USER.role === "admin") { toast("✓ Publié immédiatement !", "green"); adminTab("products"); }
      else { toast("Article envoyé — en attente de validation", "green"); loadMyProducts(); }
    } else { toast("Erreur lors de la publication", "red"); }
  } catch { toast("Erreur réseau", "red"); }
  finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || "Publier l'article"; }
  }
});

async function loadMyProducts() {
  const el = document.getElementById("myProducts");
  if (!el) return;
  const mine = await (await fetch("/api/products/mine/" + encodeURIComponent(USER.id))).json();
  if (!mine.length) { el.innerHTML = `<div class="empty-state"><div class="empty-ico">📦</div><p>Aucun article publié.</p></div>`; return; }
  el.innerHTML = mine.map(p => {
    const badge = p.blocked
      ? `<span class="status-badge status-block">🚫 Bloqué</span>`
      : p.approved
        ? `<span class="status-badge status-ok">✓ Validé</span>`
        : `<span class="status-badge status-wait">⏳ En attente</span>`;
    return `<div class="my-product-item">
      <div><strong>${p.title}</strong><br><small>${fmt(p.price)} · Stock: ${p.stock}/${p.stockInit||p.stock}</small></div>
      ${badge}
    </div>`;
  }).join("");
}

// ============ ADMIN ============
function showAdmin() {
  if (!USER || USER.role !== "admin") return toast("Réservé à l'administrateur", "red");
  showPage("page-admin");
  adminTab("vendors");
}

function productFormFields() {
  const cats = CATEGORIES.map(([s, _, n]) => `<option value="${s}">${n}</option>`).join("");
  return `
    <div class="form-row">
      <div class="form-group"><label>Titre</label><input name="title" required placeholder="Ex: iPhone 14 Pro  /  Comptable Sénior" /></div>
      <div class="form-group"><label>Catégorie</label><select name="category" required onchange="switchFormForCat(this)">${cats}</select></div>
    </div>

    <!-- SECTION : Article standard -->
    <div class="pf-section pf-article">
      <div class="form-row">
        <div class="form-group"><label>Prix de vente (FCFA)</label><input name="price" type="number" placeholder="0" /></div>
        <div class="form-group"><label>Ancien prix (optionnel)</label><input name="oldPrice" type="number" placeholder="0" /></div>
        <div class="form-group"><label>Stock disponible</label><input name="stock" type="number" placeholder="1" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>N° WhatsApp vendeur</label><input name="whatsapp" placeholder="2250700000000" /></div>
        <div class="form-group"><label>N° SMS commande</label><input name="personalPhone" placeholder="2250700000000" /></div>
      </div>
    </div>

    <!-- SECTION : Offre Emploi / Concours -->
    <div class="pf-section pf-job" style="display:none">
      <div class="paid-hint">
        <span>🔒 Offre payante — le client paie pour accéder aux détails complets. Remplissez tous les champs ci-dessous.</span>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Entreprise / Organisme *</label><input name="employer" placeholder="Ex: PME Abengourou / Ministère de la Santé" /></div>
        <div class="form-group"><label>Lieu / Ville *</label><input name="jobLocation" placeholder="Ex: Abengourou, Côte d'Ivoire" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Type de contrat</label>
          <select name="contractType">
            <option value="">— Sélectionner —</option>
            <option>CDI</option><option>CDD</option><option>Stage</option>
            <option>Freelance</option><option>Concours d'entrée</option><option>Autres</option>
          </select>
        </div>
        <div class="form-group"><label>Salaire / Dotation</label><input name="salary" placeholder="Ex: 200 000 FCFA/mois" /></div>
        <div class="form-group"><label>Date limite (optionnel)</label><input name="deadline" type="date" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Prix d'accès aux détails (FCFA) *</label><input name="price" type="number" placeholder="Ex: 500" /></div>
        <div class="form-group"><label>N° WhatsApp contact</label><input name="whatsapp" placeholder="2250700000000" /></div>
      </div>
      <!-- champs cachés non utilisés pour emploi -->
      <input type="hidden" name="oldPrice" value="" />
      <input type="hidden" name="stock" value="9999" />
      <input type="hidden" name="personalPhone" value="" />
    </div>

    <div class="form-group" style="margin-top:8px">
      <label>📷 Image (JPG, PNG, WebP, HEIC…)</label>
      <input name="image" type="file" accept="image/*,image/heic,image/heif" class="img-file-input" onchange="previewImg(this)" />
      <div class="img-preview-wrap" style="display:none">
        <img class="img-preview" alt="Aperçu" />
        <button type="button" class="img-preview-remove" onclick="removeImgPreview(this)">✕ Supprimer</button>
      </div>
    </div>
    <div class="form-group">
      <label>Description / Détails complets <small style="color:var(--muted)">(confidentiel pour emploi/concours)</small></label>
      <textarea name="description" rows="4" placeholder="Décrivez l'offre — profil requis, missions, conditions, comment postuler…"></textarea>
    </div>`;
}

async function adminTab(which) {
  document.querySelectorAll(".admin-tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === which));
  const c = document.getElementById("adminContent");
  c.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div></div>`;

  if (which === "vendors") {
    const list = await (await fetch("/api/vendors")).json();
    const active = list.filter(v => v.active).length;
    const pending = list.filter(v => !v.approved).length;
    c.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card"><div class="stat-num">${list.length}</div><div class="stat-lbl">Total vendeurs</div></div>
        <div class="stat-card green"><div class="stat-num">${active}</div><div class="stat-lbl">Actifs</div></div>
        <div class="stat-card dark"><div class="stat-num">${pending}</div><div class="stat-lbl">En attente</div></div>
      </div>
      ${list.length === 0
        ? `<div class="empty-state"><div class="empty-ico">👥</div><p>Aucun vendeur inscrit.</p></div>`
        : list.map(v => {
            const statusBadge = v.active
              ? `<span class="status-badge status-ok">✅ Actif</span>`
              : `<span class="status-badge status-wait">⏳ En attente</span>`;
            return `<div class="admin-row">
              <div class="admin-row-head">
                <div>
                  <div class="admin-row-name">${v.name}</div>
                  <div class="admin-row-sub">ID: ${v.id} · 📞 ${v.phone || "—"}</div>
                </div>
                ${statusBadge}
              </div>
              <div class="admin-row-actions">
                ${!v.approved ? `<button class="btn btn-secondary btn-sm" onclick="approveVendor('${v.id}')">✓ Approuver</button>` : ""}
                <button class="btn btn-ghost btn-sm" onclick="deleteVendor('${v.id}')">🗑 Supprimer</button>
              </div>
            </div>`;
          }).join("")}`;

  } else if (which === "products") {
    const all = await (await fetch("/api/products/all")).json();
    const pending = all.filter(p => !p.approved && !p.blocked).length;
    c.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card"><div class="stat-num">${all.length}</div><div class="stat-lbl">Total articles</div></div>
        <div class="stat-card green"><div class="stat-num">${all.filter(p=>p.approved&&!p.blocked).length}</div><div class="stat-lbl">Approuvés</div></div>
        <div class="stat-card dark"><div class="stat-num">${pending}</div><div class="stat-lbl">En attente</div></div>
      </div>
      ${all.length === 0
        ? `<div class="empty-state"><div class="empty-ico">📦</div><p>Aucun article.</p></div>`
        : all.map(p => {
            const st = p.blocked
              ? `<span class="status-badge status-block">🚫 Bloqué</span>`
              : p.approved
                ? `<span class="status-badge status-ok">✓ Validé</span>`
                : `<span class="status-badge status-wait">⏳ En attente</span>`;
            const img = p.image ? `<img src="${p.image}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0" />` : `<div style="width:44px;height:44px;background:#f5f5f5;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:22px">🛍️</div>`;
            return `<div class="admin-row" id="admin-prod-${p.id}">
              <div class="admin-row-head">
                <div style="display:flex;gap:10px;align-items:center">
                  ${img}
                  <div>
                    <div class="admin-row-name">${p.title}</div>
                    <div class="admin-row-sub">${fmt(p.price)} · Stock: ${p.stock}/${p.stockInit||p.stock} · Par: ${p.ownerName} (${p.ownerRole})</div>
                  </div>
                </div>
                ${st}
              </div>
              <div class="admin-row-actions">
                ${!p.approved ? `<button class="btn btn-secondary btn-sm" onclick="approveProduct(${p.id})">✓ Approuver</button>` : ""}
                ${!p.blocked ? `<button class="btn btn-ghost btn-sm" onclick="blockProduct(${p.id})">🚫 Bloquer</button>` : `<button class="btn btn-secondary btn-sm" onclick="approveProduct(${p.id})">↩ Débloquer</button>`}
                <button class="btn btn-secondary btn-sm" onclick="adminEditProductPanel(${p.id})">✏️ Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️ Supprimer</button>
              </div>
              <div id="admin-edit-panel-${p.id}" style="display:none;margin-top:12px;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:14px"></div>
            </div>`;
          }).join("")}`;

  } else if (which === "addproduct") {
    c.innerHTML = `
      <div style="background:var(--primary-light);border-left:4px solid var(--primary);border-radius:0 var(--radius) var(--radius) 0;padding:10px 14px;font-size:13px;margin-bottom:16px">
        ℹ️ Les articles ajoutés depuis ce tableau de bord sont <strong>publiés immédiatement</strong> (compte administrateur).
      </div>
      <form id="adminProductForm" class="product-form">
        ${productFormFields()}
        <button type="submit" data-label="Publier l'article" class="btn btn-primary btn-lg" style="margin-top:4px">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Publier l'article
        </button>
      </form>`;

  } else if (which === "orders") {
    const orders = await (await fetch("/api/orders")).json();
    const rev = [...orders].reverse();
    const total = orders.reduce((s, o) => s + (o.total || 0), 0);
    c.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card"><div class="stat-num">${orders.length}</div><div class="stat-lbl">Total commandes</div></div>
        <div class="stat-card green"><div class="stat-num">${fmt(total)}</div><div class="stat-lbl">Valeur totale</div></div>
      </div>
      ${orders.length > 0 ? `<div style="margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-danger btn-sm" onclick="adminClearOrders()">🗑️ Effacer toutes les commandes</button>
      </div>` : ""}
      ${rev.length === 0
        ? `<div class="empty-state"><div class="empty-ico">📋</div><p>Aucune commande reçue.</p></div>`
        : rev.map(o => `
          <div class="order-card" id="order-card-${o.id}">
            <div class="order-head">
              <div>
                <span class="order-num">${o.orderNo || o.id}</span>
                <span class="delivery-badge ${o.delivery==="agence"?"delivery-agence":"delivery-home"}" style="margin-left:8px">${o.delivery==="agence"?"🏢 Retrait":"🚚 Livraison"}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="order-meta">${new Date(o.createdAt).toLocaleString("fr-FR")}</div>
                <button class="btn btn-secondary btn-sm" onclick="adminEditOrderPanel(${o.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="adminDeleteOrder(${o.id})">🗑️</button>
              </div>
            </div>
            <div class="order-meta" style="margin-top:6px">👤 ${o.name} · 📞 ${o.phone}</div>
            <div class="order-items">📦 ${(o.items||[]).map(i => `${i.qty}× ${i.name}`).join(" · ")}</div>
            <div class="order-total">💰 Total : ${fmt(o.total)} · 💳 ${o.payMethod||"—"} ${o.payNum?"("+o.payNum+")":""}</div>
            <div id="order-edit-panel-${o.id}" style="display:none;margin-top:10px;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:12px"></div>
          </div>`).join("")}`;

  } else if (which === "rencontres") {
    const all = await (await fetch("/api/rencontres/all")).json();
    const pending = all.filter(p => !p.approved).length;
    c.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card"><div class="stat-num">${all.length}</div><div class="stat-lbl">Total profils</div></div>
        <div class="stat-card green"><div class="stat-num">${all.filter(p=>p.approved).length}</div><div class="stat-lbl">Approuvés</div></div>
        <div class="stat-card dark"><div class="stat-num">${pending}</div><div class="stat-lbl">En attente</div></div>
      </div>
      ${!all.length ? `<div class="empty-state"><div class="empty-ico">❤️</div><p>Aucun profil reçu.</p></div>`
        : all.map(p => {
          const st = p.approved
            ? `<span class="status-badge status-ok">✓ Approuvé</span>`
            : `<span class="status-badge status-wait">⏳ En attente</span>`;
          const photoHtml = p.photo
            ? `<img src="${p.photo}" style="width:44px;height:44px;object-fit:cover;border-radius:50%;border:2px solid #c2185b;flex-shrink:0" />`
            : `<div style="width:44px;height:44px;background:#fce4ec;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">❤️</div>`;
          const sousLabel = RENCONTRE_SOUS[p.souscat] || p.souscat;
          return `<div class="admin-row">
            <div class="admin-row-head">
              <div style="display:flex;gap:10px;align-items:center">
                ${photoHtml}
                <div>
                  <div class="admin-row-name">${p.nom} ${p.prenom} — ${p.age} ans — ${p.sexe}</div>
                  <div class="admin-row-sub">${sousLabel} · ${p.profession||"—"} · ${p.ville||"—"} ${p.quartier||""}</div>
                  <div class="admin-row-sub" style="color:#c2185b">WA: ${p.whatsapp||"—"} · Tél: ${p.phone||"—"} · Accès: ${fmt(p.prixAcces)}</div>
                  ${p.description ? `<div class="admin-row-sub" style="margin-top:4px;font-style:italic;color:#666">${p.description.slice(0,120)}${p.description.length>120?"…":""}</div>` : ""}
                </div>
              </div>
              ${st}
            </div>
            <div class="admin-row-actions">
              ${!p.approved ? `<button class="btn btn-secondary btn-sm" onclick="askApproveRencontre(${p.id},${p.prixAcces||500},'${p.souscat||"amitie"}')">✓ Approuver &amp; définir le prix</button>` : ""}
              <button class="btn btn-danger btn-sm" onclick="deleteRencontre(${p.id})">Supprimer</button>
            </div>
          </div>`;
        }).join("")}`;

  } else if (which === "data") {
    const [stats, dbSize] = await Promise.all([
      fetch("/api/admin/db-stats").then(r => r.json()).catch(() => ({})),
      fetch("/api/admin/db-size").then(r => r.json()).catch(() => null),
    ]);
    const tableLabels = { users:"👥 Utilisateurs", products:"📦 Articles", orders:"🛒 Commandes", settings:"⚙️ Paramètres", rencontres:"❤️ Rencontres" };

    // Bandeau alerte espace BD
    let dbAlertHtml = "";
    if (dbSize && !dbSize.error) {
      const pct = dbSize.pct;
      const bar  = Math.min(pct, 100).toFixed(1);
      const used = dbSize.sizeMB < 1 ? `${(dbSize.sizeMB * 1024).toFixed(0)} Ko` : `${dbSize.sizeMB.toFixed(1)} Mo`;
      const limit = `${dbSize.limitMB} Mo`;
      const barColor = pct >= 90 ? "#c62828" : pct >= 75 ? "#e65100" : "#2e7d32";
      const bgColor  = pct >= 90 ? "#ffebee" : pct >= 75 ? "#fff3e0" : "#e8f5e9";
      const border   = pct >= 90 ? "#ef9a9a" : pct >= 75 ? "#ffcc80" : "#a5d6a7";
      const icon     = pct >= 90 ? "🚨" : pct >= 75 ? "⚠️" : "✅";
      const msg      = pct >= 90
        ? `<strong>ALERTE — Base de données presque pleine !</strong> Exportez vos données en JSON immédiatement avant que la base ne soit coupée.`
        : pct >= 75
        ? `<strong>Attention :</strong> La base de données est aux ¾ de sa capacité. Pensez à exporter régulièrement.`
        : `Base de données en bonne santé.`;
      dbAlertHtml = `
        <div style="background:${bgColor};border:1.5px solid ${border};border-radius:var(--radius);padding:14px 16px;margin-bottom:18px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="font-size:22px">${icon}</span>
            <div style="flex:1">
              <div style="font-size:14px;color:${barColor}">${msg}</div>
              <div style="font-size:12px;color:#555;margin-top:3px">Utilisé : <strong>${used}</strong> sur <strong>${limit}</strong> (${pct.toFixed(1)}%)</div>
            </div>
          </div>
          <div style="background:#ddd;border-radius:6px;height:10px;overflow:hidden">
            <div style="width:${bar}%;background:${barColor};height:100%;border-radius:6px;transition:width .6s"></div>
          </div>
          ${pct >= 90 ? `<div style="margin-top:10px"><a href="/api/admin/export/json" class="btn btn-danger btn-sm" download>⬇️ Exporter JSON maintenant</a></div>` : ""}
        </div>`;
    }

    c.innerHTML = `
      <div class="db-panel">
        <h3 class="db-title">🗄️ Gestion de la Base de Données</h3>
        <p class="db-subtitle">Exportez, sauvegardez ou restaurez toutes les données du marketplace.</p>

        ${dbAlertHtml}

        <!-- STATS -->
        <div class="db-stats-grid">
          ${Object.entries(stats).map(([t,n]) => `
            <div class="db-stat-card">
              <div class="db-stat-icon">${(tableLabels[t]||t).split(" ")[0]}</div>
              <div class="db-stat-body">
                <div class="db-stat-num">${n}</div>
                <div class="db-stat-lbl">${(tableLabels[t]||t).replace(/^.\s/,"")}</div>
              </div>
            </div>`).join("")}
        </div>

        <!-- EXPORT -->
        <div class="db-section">
          <div class="db-section-title">📤 Exporter les données</div>
          <p class="db-section-desc">Téléchargez une sauvegarde complète de toutes les tables.</p>
          <div class="db-actions">
            <a href="/api/admin/export/excel" class="btn btn-primary db-btn" download>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              📊 Exporter en Excel (.xlsx)
            </a>
            <a href="/api/admin/export/json" class="btn btn-secondary db-btn" download>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              💾 Exporter en JSON (backup)
            </a>
          </div>
          <div class="db-info-box">
            <strong>Excel :</strong> 1 feuille par table (utilisateurs, articles, commandes, rencontres, paramètres) — idéal pour consulter dans Excel / LibreOffice.<br/>
            <strong>JSON :</strong> Sauvegarde complète à réimporter plus tard ou migrer vers un autre serveur.
          </div>
        </div>

        <!-- EXPORT ZIP -->
        <div class="db-section">
          <div class="db-section-title">📦 Télécharger le projet (déploiement)</div>
          <p class="db-section-desc">Téléchargez un fichier ZIP contenant tous les fichiers du projet pour le déployer sur un autre serveur.</p>
          <div class="db-actions">
            <a href="/api/admin/export/zip" class="btn btn-primary db-btn" download>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              📦 Télécharger le ZIP de déploiement
            </a>
          </div>
        </div>

        <!-- IMPORT -->
        <div class="db-section">
          <div class="db-section-title">📥 Importer des données (JSON ou Excel)</div>
          <p class="db-section-desc">Restaurez une sauvegarde JSON ou Excel. Les entrées existantes sont mises à jour, les nouvelles sont ajoutées.</p>
          <div class="db-import-area" id="dbImportArea" onclick="document.getElementById('dbFileInput').click()">
            <div class="db-import-icon">📂</div>
            <div class="db-import-text">Cliquez pour choisir un fichier JSON ou Excel</div>
            <div class="db-import-hint">Formats acceptés : .json · .xlsx — glissez-déposez ou cliquez</div>
            <input type="file" id="dbFileInput" accept=".json,.xlsx" style="display:none" onchange="importDbFile(this)" />
          </div>
          <div id="dbImportResult"></div>
        </div>

        <div class="db-warn-box">
          ⚠️ <strong>Important :</strong> L'import fonctionne par UPSERT (insertion ou mise à jour). Il ne supprime jamais de données existantes. Utilisez uniquement des fichiers générés par ce système.
        </div>
      </div>`;

    // Drag & drop
    const area = document.getElementById("dbImportArea");
    area.addEventListener("dragover", e => { e.preventDefault(); area.classList.add("drag-over"); });
    area.addEventListener("dragleave", () => area.classList.remove("drag-over"));
    area.addEventListener("drop", e => { e.preventDefault(); area.classList.remove("drag-over"); const f = e.dataTransfer.files[0]; if(f) importDbFileObj(f); });

  } else if (which === "settings") {
    const s = await (await fetch("/api/settings")).json();
    const sm = s.sms || {};
    c.innerHTML = `
      <div class="sms-settings-wrap">
        <!-- SECTION 0: Configuration des catégories -->
        <div class="settings-section">
          <div class="settings-section-title">🗂️ Configuration des catégories (Accès gratuit / payant)</div>
          <p class="form-hint" style="margin-bottom:14px">Choisissez si chaque catégorie est accessible gratuitement ou si un paiement est requis. Si payant, entrez le prix en FCFA.</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${CONFIG_CATS.map(([slug, icon, label]) => {
              const cfg = (s.categoryConfig || {})[slug] || { access: "free", price: 0 };
              return `<div class="cat-cfg-row">
                <span class="cat-cfg-label">${icon} ${label}</span>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                  <select class="cat-cfg-select" id="catCfg_${slug}" onchange="toggleCatPrice('${slug}')">
                    <option value="free" ${cfg.access==="free"?"selected":""}>🟢 Gratuit</option>
                    <option value="paid" ${cfg.access==="paid"?"selected":""}>🔴 Payant</option>
                  </select>
                  <input class="cat-cfg-price" id="catPrice_${slug}" type="number"
                    value="${cfg.price||0}" placeholder="Prix FCFA" min="0" step="100"
                    style="width:110px;${cfg.access!=="paid"?"display:none":""}" />
                </div>
              </div>`;
            }).join("")}
          </div>
        </div>

        <!-- SECTION 1: Entreprise -->
        <div class="settings-section">
          <div class="settings-section-title">🏢 Informations de l'entreprise</div>
          <div class="form-row">
            <div class="form-group">
              <label>Nom de l'entreprise</label>
              <input id="setCompany" value="${s.companyName || ""}" placeholder="ABENGOUROU-MARKET.CI" />
              <div class="form-hint">Apparaît dans l'en-tête des SMS envoyés aux vendeurs.</div>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label>📞 Téléphone de contact</label>
              <input id="setPhone" value="${s.companyPhone || "+225 0767202271"}" placeholder="+225 0767202271" />
              <div class="form-hint">Affiché dans le footer et la page Contact.</div>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label>💬 WhatsApp Administrateur</label>
              <input id="setWhatsapp" value="${s.companyWhatsapp || "2250767202271"}" placeholder="2250767202271" type="tel" />
              <div class="form-hint">Les commandes Rencontres &amp; Amitiés sont envoyées sur ce numéro WhatsApp.</div>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label>📧 E-mail de contact</label>
              <input id="setEmail" value="${s.companyEmail || "contact@abengourou-market.com"}" placeholder="contact@abengourou-market.com" type="email" />
            </div>
            <div class="form-group" style="margin-top:12px">
              <label>🌐 Site web (URL)</label>
              <input id="setWebsite" value="${s.companyWebsite || window.location.origin}" placeholder="${window.location.origin}" />
              <div class="form-hint">Lien affiché automatiquement depuis l'URL du serveur.</div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: API SMS -->
        <div class="settings-section">
          <div class="settings-section-title">📱 Configuration API SMS</div>

          <!-- Toggle -->
          <div class="sms-toggle-row">
            <label class="toggle-switch">
              <input type="checkbox" id="smsEnabled" ${sm.enabled ? "checked" : ""} onchange="toggleSmsFields()" />
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-label">
              Activer l'envoi de SMS
              <small>Notifier automatiquement les vendeurs lors d'une nouvelle commande</small>
            </div>
          </div>

          <div id="smsFieldsWrap" style="${sm.enabled ? "" : "opacity:.45;pointer-events:none"}">
            <!-- Placeholders help -->
            <div class="sms-placeholder-help">
              <h5>📌 Placeholders disponibles dans l'URL et le corps :</h5>
              <div class="placeholder-tags">
                <span class="ph-tag">{to}</span>
                <span class="ph-tag">{message}</span>
                <span class="ph-tag">{from}</span>
              </div>
              <div style="font-size:12px;color:#0277BD;margin-top:8px">
                <strong>{to}</strong> = numéro du destinataire &nbsp;·&nbsp; <strong>{message}</strong> = texte du SMS &nbsp;·&nbsp; <strong>{from}</strong> = expéditeur / nom entreprise
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Expéditeur (Sender ID)</label>
                <input id="smsSender" value="${sm.sender || ""}" placeholder="ABGMARKET" />
                <div class="form-hint">Nom affiché comme expéditeur du SMS</div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label>URL de l'API SMS</label>
              <input id="smsUrl" value="${(sm.url || "").replace(/"/g, "&quot;")}" placeholder="https://api.votre-sms.com/send?to={to}&msg={message}" />
              <div class="form-hint">Exemple Infobip : https://api.infobip.com/sms/2/text/single</div>
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label>Clé API (Authorization Bearer)</label>
              <input id="smsApiKey" type="password" value="${sm.apiKey || ""}" placeholder="VOTRE_CLE_API_SMS" />
              <div class="form-hint">Ajoutée automatiquement en en-tête : Authorization: Bearer {clé}</div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Save + Test -->
        <div class="settings-section">
          <div class="settings-section-title">💾 Enregistrer & Tester</div>
          <button class="btn btn-primary" style="min-width:200px" onclick="saveSettings()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Enregistrer les paramètres
          </button>
          <hr class="modal-divider" style="margin:16px 0" />
          <div class="sms-test-row">
            <div class="form-group">
              <label>Numéro de test (format international)</label>
              <input id="smsTestNum" placeholder="Ex : 2250700000000" type="tel" />
            </div>
            <button class="btn btn-secondary" onclick="testSMS()" style="height:42px;white-space:nowrap;align-self:flex-end">
              📤 Envoyer un SMS test
            </button>
          </div>
          <div id="settingsMsg"></div>
        </div>
      </div>`;
  }
}

function toggleSmsFields() {
  const enabled = document.getElementById("smsEnabled").checked;
  const wrap = document.getElementById("smsFieldsWrap");
  if (wrap) { wrap.style.opacity = enabled ? "1" : ".45"; wrap.style.pointerEvents = enabled ? "" : "none"; }
}

async function importDbFileObj(file) {
  const res = document.getElementById("dbImportResult");
  if (!file) return;
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
  const endpoint = isExcel ? "/api/admin/import/excel" : "/api/admin/import/json";
  res.innerHTML = `<div class="db-import-progress">⏳ Import ${isExcel ? "Excel" : "JSON"} en cours…</div>`;
  const fd = new FormData();
  fd.append("file", file);
  try {
    const r = await fetch(endpoint, { method: "POST", body: fd });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    const lignes = Object.entries(d.imported || {}).map(([t,n]) => `<li><strong>${t}</strong> : ${n} entrée(s) traitée(s)</li>`).join("");
    res.innerHTML = `<div class="db-import-ok">✅ Import ${isExcel ? "Excel" : "JSON"} réussi !<ul>${lignes}</ul></div>`;
    toast("Import terminé ✓", "green");
  } catch (e) {
    res.innerHTML = `<div class="db-import-err">❌ Erreur : ${e.message}</div>`;
    toast("Erreur lors de l'import", "red");
  }
}
function importDbFile(input) { if (input.files[0]) importDbFileObj(input.files[0]); }

function askApproveRencontre(id, prixCurrent, souscat) {
  modalHTML(`
    <h2>✓ Approuver le profil <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Définissez le prix d'accès et le type de rencontre avant de publier ce profil.</p>
    <div class="form-group">
      <label>💰 Prix d'accès au profil (FCFA)</label>
      <input id="apPrix" type="number" min="0" step="100" value="${prixCurrent||500}" placeholder="500" />
    </div>
    <div class="form-group">
      <label>Type de rencontre</label>
      <select id="apSouscat">
        <option value="amitie" ${souscat==="amitie"?"selected":""}>💙 Amitié</option>
        <option value="serieux" ${souscat==="serieux"?"selected":""}>❤️ Relation sérieuse</option>
      </select>
    </div>
    <div id="apProgressWrap" style="display:none" class="progress-wrap">
      <p>⏳ Approbation en cours…</p>
      <div class="progress-track"><div class="progress-fill" id="apProgressFill" style="background:#c2185b"></div></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
      <button id="apBtn" class="btn btn-secondary" onclick="approveRencontre(${id})">✓ Confirmer &amp; publier</button>
    </div>`);
}
async function approveRencontre(id) {
  const prixAcces = Number(document.getElementById("apPrix")?.value) || 500;
  const souscat = document.getElementById("apSouscat")?.value || "amitie";
  const btn = document.getElementById("apBtn");
  const pw = document.getElementById("apProgressWrap");
  if (btn) btn.disabled = true;
  if (pw) pw.style.display = "block";
  const bar = startProgress("apProgressFill", "#c2185b");
  try {
    const r = await fetch("/api/rencontres/approve", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, prixAcces, souscat})});
    bar.done(r.ok);
    await new Promise(res => setTimeout(res, 400));
    if (r.ok) { closeModal(); toast("Profil approuvé et publié ✓","green"); adminTab("rencontres"); }
    else { toast("Erreur lors de l'approbation","red"); if (btn) btn.disabled = false; }
  } catch { bar.done(false); toast("Erreur réseau","red"); if (btn) btn.disabled = false; }
}
async function deleteRencontre(id) { if(!confirm("Supprimer ce profil ?"))return; await fetch("/api/rencontres/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Profil supprimé"); adminTab("rencontres"); }
async function approveVendor(id) { await fetch("/api/vendors/approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Compte vendeur approuvé ✓","green"); adminTab("vendors"); }
async function deleteVendor(id) { if(!confirm("Supprimer ce compte vendeur ?"))return; await fetch("/api/vendors/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Vendeur supprimé",""); adminTab("vendors"); }
async function approveProduct(id) { await fetch("/api/products/approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Article validé ✓","green"); adminTab("products"); }
async function blockProduct(id) { await fetch("/api/products/block",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Article bloqué"); adminTab("products"); }
async function deleteProduct(id) { if(!confirm("Supprimer définitivement cet article ?"))return; await fetch("/api/products/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); toast("Article supprimé"); adminTab("products"); }

// ─── Modifier un article (admin) ──────────────────────────────────────────────
async function adminEditProductPanel(id) {
  const panel = document.getElementById("admin-edit-panel-" + id);
  if (!panel) return;
  if (panel.style.display !== "none") { panel.style.display = "none"; return; }
  panel.innerHTML = "<em style='color:#999;font-size:13px'>Chargement…</em>";
  panel.style.display = "block";
  const all = await (await fetch("/api/products/all")).json();
  const p = all.find(x => x.id === id);
  if (!p) { panel.innerHTML = "<em>Article introuvable.</em>"; return; }
  const cats = CATEGORIES.map(([s,,n]) => `<option value="${s}" ${p.category===s?"selected":""}>${n}</option>`).join("");
  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:10px;color:var(--primary)">✏️ Modifier l'article #${id}</div>
    <div class="form-row">
      <div class="form-group"><label>Titre</label><input id="ep-title-${id}" value="${(p.title||"").replace(/"/g,"&quot;")}" /></div>
      <div class="form-group"><label>Catégorie</label><select id="ep-cat-${id}">${cats}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Prix (FCFA)</label><input id="ep-price-${id}" type="number" value="${p.price||0}" /></div>
      <div class="form-group"><label>Ancien prix</label><input id="ep-oldprice-${id}" type="number" value="${p.oldPrice||""}" /></div>
      <div class="form-group"><label>Stock disponible</label><input id="ep-stock-${id}" type="number" value="${p.stock||0}" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>N° WhatsApp</label><input id="ep-wa-${id}" value="${p.whatsapp||""}" /></div>
      <div class="form-group"><label>N° SMS commande</label><input id="ep-phone-${id}" value="${p.personalPhone||""}" /></div>
    </div>
    <div class="form-group"><label>Description</label><textarea id="ep-desc-${id}" rows="3" style="width:100%;border:1px solid #ddd;border-radius:6px;padding:8px;font-size:14px">${p.description||""}</textarea></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-primary btn-sm" onclick="adminSaveProduct(${id})">💾 Enregistrer</button>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('admin-edit-panel-${id}').style.display='none'">Annuler</button>
    </div>
  `;
}

async function adminSaveProduct(id) {
  const body = {
    id,
    title: document.getElementById("ep-title-"+id)?.value||"",
    category: document.getElementById("ep-cat-"+id)?.value||"",
    price: document.getElementById("ep-price-"+id)?.value||0,
    oldPrice: document.getElementById("ep-oldprice-"+id)?.value||null,
    stock: document.getElementById("ep-stock-"+id)?.value||0,
    whatsapp: document.getElementById("ep-wa-"+id)?.value||"",
    personalPhone: document.getElementById("ep-phone-"+id)?.value||"",
    description: document.getElementById("ep-desc-"+id)?.value||"",
  };
  const r = await fetch("/api/products/update", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if (r.ok) { toast("Article modifié ✓","green"); adminTab("products"); }
  else toast("Erreur lors de la modification","red");
}

// ─── Commandes — supprimer / effacer / modifier ───────────────────────────────
async function adminDeleteOrder(id) {
  if (!confirm("Supprimer cette commande définitivement ?")) return;
  const r = await fetch("/api/orders/delete", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
  if (r.ok) {
    const card = document.getElementById("order-card-" + id);
    if (card) card.remove();
    toast("Commande supprimée","");
  } else toast("Erreur","red");
}

async function adminClearOrders() {
  if (!confirm("Supprimer TOUTES les commandes ? Cette action est irréversible.")) return;
  const r = await fetch("/api/orders/clear", {method:"POST"});
  if (r.ok) { toast("Toutes les commandes ont été supprimées",""); adminTab("orders"); }
  else toast("Erreur","red");
}

function adminEditOrderPanel(id) {
  const panel = document.getElementById("order-edit-panel-" + id);
  if (!panel) return;
  if (panel.style.display !== "none") { panel.style.display = "none"; return; }
  const card = panel.closest(".order-card");
  const nameTxt = card.querySelector(".order-meta")?.textContent||"";
  const totalTxt = card.querySelector(".order-total")?.textContent||"";
  const delivBadge = card.querySelector(".delivery-badge")?.textContent||"";
  const isHome = delivBadge.includes("Livraison");
  panel.style.display = "block";
  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px;color:var(--primary)">✏️ Modifier la commande</div>
    <div class="form-row">
      <div class="form-group"><label>Nom client</label><input id="oe-name-${id}" placeholder="Nom" /></div>
      <div class="form-group"><label>Téléphone</label><input id="oe-phone-${id}" placeholder="225..." /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Livraison</label>
        <select id="oe-delivery-${id}">
          <option value="agence" ${!isHome?"selected":""}>🏢 Retrait agence</option>
          <option value="domicile" ${isHome?"selected":""}>🚚 Livraison domicile</option>
        </select>
      </div>
      <div class="form-group"><label>Total (FCFA)</label><input id="oe-total-${id}" type="number" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Moyen de paiement</label><input id="oe-pm-${id}" placeholder="Wave, MTN..." /></div>
      <div class="form-group"><label>N° de paiement</label><input id="oe-pn-${id}" placeholder="0700000000" /></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn btn-primary btn-sm" onclick="adminSaveOrder(${id})">💾 Enregistrer</button>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('order-edit-panel-${id}').style.display='none'">Annuler</button>
    </div>
  `;
}

async function adminSaveOrder(id) {
  const body = {
    id,
    name: document.getElementById("oe-name-"+id)?.value||"",
    phone: document.getElementById("oe-phone-"+id)?.value||"",
    delivery: document.getElementById("oe-delivery-"+id)?.value||"agence",
    total: document.getElementById("oe-total-"+id)?.value||0,
    payMethod: document.getElementById("oe-pm-"+id)?.value||"",
    payNum: document.getElementById("oe-pn-"+id)?.value||"",
  };
  const r = await fetch("/api/orders/update", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if (r.ok) { toast("Commande mise à jour ✓","green"); adminTab("orders"); }
  else toast("Erreur","red");
}

function toggleCatPrice(slug) {
  const sel = document.getElementById(`catCfg_${slug}`);
  const inp = document.getElementById(`catPrice_${slug}`);
  if (inp) inp.style.display = sel?.value === "paid" ? "" : "none";
}

async function saveSettings() {
  const waRaw = document.getElementById("setWhatsapp")?.value || "";
  // Collecte config catégories
  const categoryConfig = {};
  for (const [slug] of CONFIG_CATS) {
    const sel = document.getElementById(`catCfg_${slug}`);
    const inp = document.getElementById(`catPrice_${slug}`);
    if (sel) categoryConfig[slug] = { access: sel.value, price: inp ? Number(inp.value)||0 : 0 };
  }
  const body = {
    companyName:      document.getElementById("setCompany")?.value,
    companyPhone:     document.getElementById("setPhone")?.value,
    companyEmail:     document.getElementById("setEmail")?.value,
    companyWebsite:   document.getElementById("setWebsite")?.value,
    companyWhatsapp:  waRaw.replace(/\D/g, ""),
    categoryConfig,
    sms: {
      enabled: document.getElementById("smsEnabled").checked,
      url: document.getElementById("smsUrl").value,
      apiKey: document.getElementById("smsApiKey").value,
      sender: document.getElementById("smsSender").value,
    },
  };
  await fetch("/api/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
  // Mettre à jour le WhatsApp admin en mémoire
  if (body.companyWhatsapp) RENCONTRES_WA = body.companyWhatsapp;
  // Mettre à jour le footer dynamiquement
  if (body.companyPhone) { const el = document.getElementById("footerPhone"); if(el) el.textContent = body.companyPhone; const eh = document.getElementById("headerPhone"); if(eh) eh.textContent = body.companyPhone; }
  if (body.companyEmail) { const el = document.getElementById("footerEmail"); if(el) el.textContent = body.companyEmail; }
  const msg = document.getElementById("settingsMsg");
  if (msg) { msg.className = "sms-result ok"; msg.textContent = "✓ Paramètres enregistrés avec succès."; }
  toast("Paramètres enregistrés ✓","green");
}

async function testSMS() {
  const to = document.getElementById("smsTestNum").value.trim();
  if (!to) return toast("Entrez un numéro de test","red");
  const btn = event.target; btn.disabled = true; btn.textContent = "Envoi en cours…";
  const r = await (await fetch("/api/settings/sms-test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to})})).json();
  btn.disabled = false; btn.textContent = "📤 Envoyer un SMS test";
  const msg = document.getElementById("settingsMsg");
  if (msg) {
    msg.className = r.ok ? "sms-result ok" : "sms-result err";
    msg.textContent = r.ok ? `✓ SMS envoyé avec succès (statut HTTP ${r.status || "200"})` : `✗ Échec : ${r.error || r.body || "Configuration incomplète — vérifiez l'URL et les en-têtes."}`;
  }
}

// ============ UTILS ============
function modalHTML(html) { document.getElementById("modalBody").innerHTML = html; document.getElementById("modal").classList.add("show"); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function toast(m, type) {
  const t = document.createElement("div");
  t.className = "toast" + (type==="green"?" green":type==="red"?" red":"");
  t.textContent = m;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// ============ MENU BUTTONS ============
function setupMenuButtons() {
  const openMenu = () => {
    const p = document.getElementById("mobileSidebarPanel");
    renderSidebar(p);
    document.getElementById("mobileSidebar").classList.add("show");
  };
  const b1 = document.getElementById("menuBtn");
  const b2 = document.getElementById("menuBtn2");
  if (b1) b1.onclick = openMenu;
  if (b2) b2.onclick = openMenu;
}

// ============ INIT ============
document.getElementById("yr").textContent = new Date().getFullYear();
renderHome();
updateCartCount();
setupMenuButtons();
