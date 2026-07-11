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
  ["sante","🏥","Appel Santé"],
  ["evenements","🎉","Événements"],
  ["cabine-en-ligne","IMG:/img/cabine-en-ligne.png","Cabine en Ligne"],
  ["actualites","📰","Actualités"],
  ["concours-ci","📚","Concours CI"],
  ["emploi","💼","Emploi"],
  ["transport","🚕","Transport"],
  ["braderie","🏷️","Braderie"],
  ["rencontres","❤️","Rencontres & Amitiés"],
  ["pronostics","🎯","Pronostics"],
];

const SHORTCUTS = [
  ["IMG:/img/cabine-en-ligne.png","Cabine en Ligne","cabine-en-ligne"],["💼","Emploi","emploi"],["🏠","Immobilier","immobilier"],
  ["🚕","Taxi","transport"],["🍽️","Livraison","restaurants"],["📚","Concours","concours-ci"],
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
let CABINE_PAYMENT_LINK = "https://pay.wave.com/m/M_ci_CRgdcq5dsx3B/c/ci/";
const RENCONTRES_WAVE_LINK = "https://pay.wave.com/m/M_ci_CRgdcq5dsx3B/c/ci/?amount=505";

// Catégories standard (peuvent être gratuites ou payantes)
const CONFIG_CATS = [
  ["immobilier","🏠","Immobilier / Terrains"],
  ["marchandises","🛍️","Marchandises"],
  ["residences","🏡","Résidences"],
  ["transport","🚕","Transport"],
  ["rencontres","❤️","Rencontres & Amitiés"],
  ["braderie","🏷️","Braderie"],
  ["restaurants","🍽️","Restaurants"],
  ["vehicules","🚗","Véhicules & Motos"],
  ["telephones","📱","Téléphones"],
  ["informatique","💻","Informatique"],
  ["mode","👕","Mode & Beauté"],
  ["supermarche","🛒","Supermarché"],
  ["agriculture","🌾","Agriculture"],
  ["scolaires","🎓","Scolaires"],
  ["sante","🏥","Appel Santé"],
  ["pronostics","🎯","Pronostics"],
];

// Services (toujours en contact WhatsApp direct — pas de prix)
const CONFIG_SERVICE_CATS = [
  ["emploi","💼","Emploi"],
  ["concours-ci","📚","Concours CI"],
  ["services","🔧","Services / Réparations / Travaux"],
  ["evenements","🎉","Événements"],
  ["actualites","📰","Actualités"],
];

(async () => {
  try {
    const s = await (await fetch("/api/settings")).json();
    if (s.companyWhatsapp) RENCONTRES_WA = String(s.companyWhatsapp).replace(/\D/g, "");
    if (s.categoryConfig) CAT_CONFIG = s.categoryConfig;
    if (s.cabinePaymentLink) CABINE_PAYMENT_LINK = s.cabinePaymentLink;
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
  const regularCats = CATEGORIES.filter(([s]) => !SIDEBAR_SERVICE_SLUGS.has(s));
  const serviceCats = CATEGORIES.filter(([s]) => SIDEBAR_SERVICE_SLUGS.has(s));
  const renderIco = (i) => i.startsWith("IMG:") ? `<img src="${i.slice(4)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;vertical-align:middle;margin-right:2px" />` : i;
  target.innerHTML = `
    <div class="sidebar-logo"><img src="/img/logo.png" alt="logo" /></div>
    <div class="sidebar-head">NOS CATÉGORIES</div>
    <ul>${regularCats.map(([s,i,n]) => `<li><a href="#" onclick="filterCat('${s}');return false;">${renderIco(i)} ${n}</a></li>`).join("")}</ul>
    <div class="sidebar-head sidebar-head-services">🛠️ SERVICES</div>
    <ul>${serviceCats.map(([s,i,n]) => `<li><a href="#" onclick="filterCat('${s}');return false;">${renderIco(i)} ${n}</a></li>`).join("")}</ul>`;
}

// Catégories "payantes" (détails cachés — payer pour voir)
const PAID_CATS = new Set([]); // désactivé — toutes les catégories sont en contact direct

// Catégories "services" — formulaire simple : titre, détails, WhatsApp, expiration (sans prix)
const FORM_SERVICE_CATS = new Set(["emploi","concours-ci","services","evenements","actualites"]);

// Slugs services pour la sidebar (section séparée)
const SIDEBAR_SERVICE_SLUGS = new Set(["emploi","concours-ci","cabine-en-ligne","services","evenements","actualites"]);

// Modes d'affichage par catégorie
// 'info'      = informations + photo uniquement (pas de bouton d'action)
// 'whatsapp'  = bouton WhatsApp uniquement
// 'order'     = Commander (panier) + WhatsApp
// 'sante'     = page spéciale santé
// 'scolaires' = page spéciale avec sous-catégories
function catMode(cat) {
  if (["services","immobilier","emploi","concours-ci","evenements","actualites"].includes(cat)) return "whatsapp";
  if (cat === "residences") return "reserve";
  if (cat === "sante") return "sante";
  if (cat === "scolaires") return "scolaires";
  if (cat === "pronostics") return "pronostics";
  return "order"; // marchandises, transport, braderie, restaurants…
}

// ============ PAGINATION ============
function renderPagination(page, pages, total, cat, cityFilter) {
  if (!pages || pages <= 1) return "";
  const cf = cityFilter || "";
  const btn = (p, label, active = false) =>
    `<button onclick="filterCat('${cat}',${p},'${cf}')" style="padding:7px 13px;border:1.5px solid var(--primary);border-radius:20px;background:${active ? "var(--primary)" : "#fff"};color:${active ? "#fff" : "var(--primary)"};font-size:13px;font-weight:600;cursor:pointer;transition:all .15s">${label}</button>`;

  let html = "";
  if (page > 1) html += btn(page - 1, "← Précédent");

  const start = Math.max(1, page - 2);
  const end   = Math.min(pages, page + 2);

  if (start > 1) html += btn(1, "1");
  if (start > 2) html += `<span style="padding:7px 4px;color:var(--muted)">…</span>`;

  for (let i = start; i <= end; i++) html += btn(i, String(i), i === page);

  if (end < pages - 1) html += `<span style="padding:7px 4px;color:var(--muted)">…</span>`;
  if (end < pages)     html += btn(pages, String(pages));

  if (page < pages) html += btn(page + 1, "Suivant →");

  return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
      ${html}
    </div>
    <div style="text-align:center;font-size:12px;color:var(--muted);margin-top:8px">Page ${page} sur ${pages} · ${total} annonce${total > 1 ? "s" : ""}</div>`;
}

async function filterCat(cat, page = 1, cityFilter = SELECTED_CITY) {
  document.getElementById("mobileSidebar").classList.remove("show");
  if (cat === "cabine-en-ligne") return showCabineEnLignePage();
  if (cat === "rencontres") return showRencontresPage();
  if (cat === "sante") return showSantePage();
  if (cat === "scolaires") return showScolairesPage();
  if (cat === "pronostics") return showPronosticsPage();

  const catInfo = CATEGORIES.find(c => c[0] === cat) || [cat, "🗂️", cat];
  const [slug, icon, label] = catInfo;
  const mode = catMode(slug);

  showPage("page-category");

  const cf = cityFilter || "";
  const citySelectHtml = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px;padding:10px 14px;background:#f8f9fa;border-radius:var(--radius);border:1px solid var(--border)">
      <span style="font-size:13px;font-weight:600;color:var(--muted)">📍 Filtrer par ville :</span>
      <select onchange="filterCat('${cat}',1,this.value)" style="padding:6px 12px;border:2px solid var(--primary);border-radius:20px;font-size:13px;cursor:pointer;outline:none;background:#fff">
        <option value="" ${cf === "" ? "selected" : ""}>Toutes les villes</option>
        ${CI_CITIES.map(c => `<option value="${c}" ${cf === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      ${cf ? `<span style="font-size:12px;background:var(--primary);color:#fff;border-radius:20px;padding:4px 10px;font-weight:600">📍 ${cf} <span onclick="filterCat('${cat}',1,'')" style="cursor:pointer;margin-left:4px">✕</span></span>` : ""}
    </div>`;

  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">${icon}</span>
      <div>
        <h2>${label}</h2>
        <p>${mode === "info" ? "Informations officielles · Côte d'Ivoire" : "Toutes les annonces · Côte d'Ivoire"}</p>
      </div>
    </div>
    ${citySelectHtml}
    <div class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>
    </div>`;

  let data = { products: [], total: 0, page: 1, pages: 1 };
  try {
    const params = new URLSearchParams({ category: slug, page, limit: 30 });
    if (cf) params.set("city", cf);
    data = await (await fetch(`/api/products?${params}`)).json();
  } catch {}

  const products = Array.isArray(data) ? data : (data.products || []);
  const total    = data.total  || products.length;
  const curPage  = data.page   || 1;
  const pages    = data.pages  || 1;

  if (!products.length) {
    wrap.querySelector(".section-block").innerHTML = `
      <div class="empty-state">
        <div class="empty-ico">${icon}</div>
        <p>Aucune annonce${cf ? ` à <strong>${cf}</strong>` : ""} dans cette catégorie pour le moment.</p>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">0 résultat — revenez bientôt !</p>
      </div>`;
    return;
  }

  const catCfg   = CAT_CONFIG[slug] || { access: "free", price: 0 };
  const isCatPaid = catCfg.access === "paid" && Number(catCfg.price) > 0;
  let cardsHtml = "", gridClass = "products-grid";

  if (isCatPaid) {
    cardsHtml = products.map(p => lockedCard(p, Number(catCfg.price), slug)).join("");
  } else if (mode === "info") {
    gridClass = "info-cards-grid";
    cardsHtml = products.map(p => infoCard(p)).join("");
  } else if (mode === "whatsapp") {
    cardsHtml = products.map(p => waOnlyCard(p)).join("");
  } else if (mode === "reserve") {
    cardsHtml = products.map(p => reserveCard(p)).join("");
  } else {
    cardsHtml = products.map(p => productCard({...p, name: p.title})).join("");
  }

  wrap.querySelector(".section-block").innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${total} annonce${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}</div>
    <div class="${gridClass}">${cardsHtml}</div>
    ${renderPagination(curPage, pages, total, cat, cf)}`;
}

// ============ CAT NAV ============
function renderCatNav() {
  const el = document.getElementById("catNavLinks");
  if (!el) return;
  el.innerHTML = CATEGORIES.slice(0, 12).map(([s,i,n]) => {
    const icoHtml = i.startsWith("IMG:")
      ? `<img src="${i.slice(4)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;vertical-align:middle" />`
      : i;
    return `<a href="#" onclick="filterCat('${s}');return false;">${icoHtml} ${n}</a>`;
  }).join("");
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
  const img = p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:200px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0" />` : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#F57C00,#E65100);border-radius:var(--radius) var(--radius) 0 0;display:flex;align-items:center;justify-content:center;font-size:40px">${p.category==="concours-ci"?"📚":p.category==="emploi"?"💼":"🎉"}</div>`;
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
  const imgSrc = p.image || null;
  const imgAlt = (p.title||"").replace(/"/g,"&quot;");
  const img = imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" class="modal-img-zoom" onclick="openLightbox('${imgSrc.replace(/'/g,"\\'")}','${imgAlt.replace(/'/g,"\\'")}');event.stopPropagation()" style="width:100%;max-height:240px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px;display:block" title="Cliquer pour agrandir 🔍" />` : "";
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
  const name = p.name || p.title || "";
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,name,description:desc,image:p.image||null,whatsapp:wa,category:p.category||""}).replace(/'/g,"&#39;");
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par : ${name}`);
  const imgSrc = p.image || null;
  const nameSafe = name.replace(/'/g,"\\'");
  const imgEl = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" loading="lazy" class="modal-img-zoom" onclick="event.stopPropagation();openLightbox('${imgSrc.replace(/'/g,"\\'")}','${nameSafe}')" title="Cliquer pour agrandir 🔍" />`
    : `<span>${p.emoji||"📢"}</span>`;
  return `<div class="pcard" onclick='openWaDetail(${pData})' style="cursor:pointer">
    <div class="pcard-img">${imgEl}</div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      ${desc ? `<div class="pcard-stock" style="color:var(--muted);font-size:12px;margin-bottom:8px">${desc.slice(0,60)}${desc.length>60?"…":""}</div>` : ""}
      <div class="pcard-actions">
        ${wa ? `<button class="btn-wa" style="width:100%;border-radius:20px;padding:8px;font-size:13px;background:#25D366;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px" onclick="event.stopPropagation();waOpen('${wa}','${msg}','${name.replace(/'/g,"")}')">📲 Commander / Payer</button>` : `<span style="font-size:12px;color:var(--muted)">Aucun contact disponible</span>`}
      </div>
    </div>
  </div>`;
}

function openWaDetail(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const imgSrc = p.image || null;
  const imgAlt = (p.name||"").replace(/"/g,"&quot;");
  const img = imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" class="modal-img-zoom" onclick="openLightbox('${imgSrc.replace(/'/g,"\\'")}','${imgAlt.replace(/'/g,"\\'")}');event.stopPropagation()" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px;display:block" title="Cliquer pour agrandir 🔍" />` : "";
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par : ${p.name}`);
  modalHTML(`
    <h2 style="font-size:17px;margin-bottom:4px">${p.name} <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${img}
    ${p.description ? `<div style="font-size:14px;line-height:1.7;color:var(--text);white-space:pre-line;margin-bottom:14px;background:#f9f9f9;padding:12px;border-radius:var(--radius)">${p.description}</div>` : ""}
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
      ${wa ? `<button class="btn btn-primary" style="background:#25D366;border-color:#25D366" onclick="waOpen('${wa}','${msg}','${(p.name||'').replace(/'/g,'')}')">📲 Commander / Payer</button>` : ""}
    </div>`);
}

// ============ RESERVE CARD (Résidences — Réserver + WhatsApp) ============
function reserveCard(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const name = p.name || p.title || "";
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,name,description:desc,image:p.image||null,whatsapp:wa,category:p.category||""}).replace(/'/g,"&#39;");
  const msgReserve = encodeURIComponent(`Bonjour, je souhaite réserver : ${name}`);
  const msgContact = encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${name}`);
  const imgSrc = p.image || null;
  const nameSafe = name.replace(/'/g,"\\'");
  const imgEl = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" loading="lazy" class="modal-img-zoom" onclick="event.stopPropagation();openLightbox('${imgSrc.replace(/'/g,"\\'")}','${nameSafe}')" title="Cliquer pour agrandir 🔍" />`
    : `<span>🏡</span>`;
  return `<div class="pcard" onclick='openWaDetail(${pData})' style="cursor:pointer">
    <div class="pcard-img">${imgEl}</div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      ${p.price > 0 ? `<div class="pcard-price">${fmt(p.price)}</div>` : ""}
      ${desc ? `<div class="pcard-stock" style="color:var(--muted);font-size:12px;margin-bottom:8px">${desc.slice(0,60)}${desc.length>60?"…":""}</div>` : ""}
      <div class="pcard-actions" style="display:flex;gap:6px;flex-direction:column">
        ${wa ? `<button class="btn-add" style="border-radius:20px;width:100%;font-size:13px" onclick="event.stopPropagation();waOpen('${wa}','${msgReserve}','${name.replace(/'/g,"")}')">📅 Réserver</button>` : ""}
        ${wa ? `<button class="btn-wa" style="border-radius:20px;width:100%;font-size:13px" onclick="event.stopPropagation();waOpen('${wa}','${msgContact}','${name.replace(/'/g,"")}')">💬 Contacter</button>` : ""}
      </div>
    </div>
  </div>`;
}

// ============ LOCKED CARD (catégorie payante — voir via WhatsApp) ============
function lockedCard(p, price, catSlug) {
  const img = p.image ? `<img src="${p.image}" alt="${p.title||p.name}" loading="lazy" style="filter:blur(3px)" />` : `<span>🔒</span>`;
  const name = p.title || p.name || "";
  const catInfo = CATEGORIES.find(c=>c[0]===catSlug);
  const catLabel = catInfo?.[2] || catSlug;
  const contactWA = ((p.whatsapp||"").replace(/\D/g,"")) || RENCONTRES_WA;
  const msg = encodeURIComponent(`Bonjour, je souhaite accéder à l'annonce "${name}" dans la catégorie ${catLabel}. Paiement : ${fmt(price)}.`);
  return `<div class="pcard locked-card">
    <div class="pcard-img locked-img">${img}<div class="lock-overlay">🔒</div></div>
    <div class="pcard-body">
      <div class="pcard-name">${name}</div>
      <div class="locked-badge">Accès payant</div>
      <div class="locked-price">${fmt(price)}</div>
      <button class="btn-locked" onclick="waOpen('${contactWA}','${msg}','${name.replace(/'/g,"")}')">
        💬 Obtenir l'accès — ${fmt(price)}
      </button>
    </div>
  </div>`;
}

// ============ PAID LISTING CARD (compatibilité admin) ============
function paidListingCard(p) { return infoCard(p); }
function openPaidListing(p) { openInfoDetail(p); }

// ============ WHATSAPP WRAPPER — ouvre WhatsApp puis envoie SMS au vendeur après 5 s ============
function waOpen(wa, encodedText, productName) {
  window.open("https://wa.me/" + wa + "?text=" + encodedText, "_blank");
  if (wa) {
    const payload = JSON.stringify({ vendorPhone: wa, productName: productName || "" });
    // sendBeacon fonctionne même quand le navigateur passe en arrière-plan (mobile)
    // fetch est utilisé en fallback sur les navigateurs qui ne supportent pas sendBeacon
    setTimeout(() => {
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/notify-vendor", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/notify-vendor", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload }).catch(() => {});
        }
      } catch (_) {}
    }, 5000); // SMS envoyé 5 secondes après la redirection WhatsApp
  }
}

// ============ WHATSAPP ORDER HELPER ============
function orderViaWhatsapp(wa, name) {
  if (!wa) return toast("Aucun contact WhatsApp pour ce produit", "red");
  waOpen(wa, encodeURIComponent("Bonjour, je suis intéressé par : " + name), name);
}

// ============ LIGHTBOX IMAGE ============
(function() {
  const lb = document.createElement("div");
  lb.className = "lightbox-back";
  lb.innerHTML = '<span class="lightbox-close" onclick="closeLightbox()">✕</span><img id="lbImg" src="" alt="" />';
  lb.addEventListener("click", function(e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") { closeLightbox(); closePIM(); } });
  document.body.appendChild(lb);

  // Backdrop modal fiche produit
  const pim = document.createElement("div");
  pim.className = "pim-backdrop";
  pim.id = "pimBackdrop";
  pim.innerHTML = '<div class="pim-sheet" id="pimSheet"></div>';
  pim.addEventListener("click", function(e) { if (e.target === pim) closePIM(); });
  document.body.appendChild(pim);
})();

function openLightbox(src, alt) {
  const lb = document.querySelector(".lightbox-back");
  if (!lb) return;
  lb.querySelector("#lbImg").src = src;
  lb.querySelector("#lbImg").alt = alt || "";
  lb.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  const lb = document.querySelector(".lightbox-back");
  if (lb) lb.classList.remove("show");
  document.body.style.overflow = "";
}

// ============ MODAL FICHE PRODUIT (clic image) ============
function openProductImageModal(p) {
  const ALL_CATS = [...CONFIG_CATS, ...CONFIG_SERVICE_CATS];
  const catInfo  = ALL_CATS.find(c => c[0] === (p.category || ""));
  const catEmoji = catInfo ? catInfo[1] : "🛍️";
  const catLabel = catInfo ? catInfo[2] : (p.category || "");
  const wa       = (p.whatsapp || "").replace(/\D/g, "");
  const name     = p.name || p.title || "";
  const nameSafe = name.replace(/'/g, "\\'");
  const desc     = (p.description || "").trim();
  const imgSrc   = p.image || null;
  const red      = (p.oldPrice && p.price) ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

  const imgHtml = imgSrc
    ? `<img class="pim-img" src="${imgSrc}" alt="${name}" onclick="openLightbox('${imgSrc.replace(/'/g,"\\'")}','${nameSafe}')" title="Cliquer pour agrandir 🔍" />`
    : `<div class="pim-img-placeholder">${p.emoji || "🛍️"}</div>`;

  const stockHtml = p.stock > 0
    ? `<span class="pim-badge ok">✅ ${p.stock} en stock</span>`
    : `<span class="pim-badge out">❌ Rupture de stock</span>`;

  const sheet = document.getElementById("pimSheet");
  sheet.innerHTML = `
    ${imgHtml}
    <div class="pim-body">
      <div class="pim-cat">${catEmoji} ${catLabel}</div>
      <div class="pim-name">${name}</div>
      <div class="pim-prices">
        ${p.price > 0 ? `<span class="pim-price">${fmt(p.price)}</span>` : ""}
        ${p.oldPrice  ? `<span class="pim-oldprice">${fmt(p.oldPrice)}</span>` : ""}
        ${red > 0     ? `<span class="pim-badge ok">-${red}%</span>` : ""}
        ${stockHtml}
      </div>
      ${desc ? `<div class="pim-desc">${desc}</div>` : ""}
      <div style="margin-top:10px;padding:8px 10px;background:#f0f4ff;border-radius:8px;font-size:12px;color:#1565c0;text-align:center">
        🌐 <a href="${window.location.origin}" target="_blank" style="color:#1565c0;font-weight:600;text-decoration:none">${window.location.hostname}</a>
      </div>
    </div>
    <div class="pim-actions">
      <button class="btn btn-ghost" onclick="closePIM()">✕ Fermer</button>
      <button class="btn btn-ghost" onclick="closePIM();renderHome()">🏠 Accueil</button>
      ${wa ? `<button class="btn btn-primary" style="background:#25D366;border-color:#25D366;flex:2" onclick="waOpen('${wa}',encodeURIComponent('Bonjour, je suis intéressé par : ${nameSafe}'),'${nameSafe}')">💬 Commander sur WhatsApp</button>` : ""}
    </div>`;

  document.getElementById("pimBackdrop").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closePIM() {
  const bd = document.getElementById("pimBackdrop");
  if (bd) bd.classList.remove("show");
  document.body.style.overflow = "";
}

// ============ PRODUCT CARD ============
function isNewProduct(createdAt) {
  if (!createdAt) return false;
  return (Date.now() - new Date(createdAt).getTime()) < 24 * 60 * 60 * 1000;
}

function productCard(p, isFlash = false) {
  const pct = isFlash ? Math.round((p.stock/p.stockInit)*100) : null;
  const red = (p.oldPrice && p.price) ? Math.round(((p.oldPrice-p.price)/p.oldPrice)*100) : 0;
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const name = (p.name || p.title || "").replace(/"/g,"&quot;");
  const pData = JSON.stringify({
    id:p.id, name:p.name||p.title||"", price:p.price, oldPrice:p.oldPrice||null,
    stock:p.stock||0, image:p.image||null, description:p.description||"",
    whatsapp:wa, emoji:p.emoji||"🛍️", category:p.category||""
  }).replace(/'/g,"&#39;");
  const imgSrc = p.image || null;
  const imgEl = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" loading="lazy" class="modal-img-zoom"
        onclick="event.stopPropagation();openProductImageModal(${pData})"
        title="Voir la fiche produit 🔍" style="cursor:pointer" />`
    : `<span>${p.emoji||"🛍️"}</span>`;
  const newBadge = isNewProduct(p.createdAt) ? `<span class="pcard-badge-new">NEW</span>` : "";
  return `<div class="pcard" onclick='openProductImageModal(${pData})' style="cursor:pointer">
    <div class="pcard-img">
      ${imgEl}
      ${red > 0 ? `<span class="pcard-badge">-${red}%</span>` : ""}
      ${newBadge}
      <span class="pcard-wish">♡</span>
    </div>
    <div class="pcard-body">
      <div class="pcard-name">${p.name||p.title||""}</div>
      ${p.price > 0 ? `<div class="pcard-price">${fmt(p.price)}</div>` : ""}
      ${p.oldPrice ? `<div class="pcard-oldprice">${fmt(p.oldPrice)}</div>` : ""}
      ${isFlash && p.stock > 0 ? `<div class="stock-bar"><span style="width:${pct}%"></span></div><div class="pcard-stock">${p.stock} restants</div>` : (!isFlash && p.stock > 0 ? `<div class="pcard-stock">${p.stock} en stock</div>` : "")}
      <div class="pcard-actions">
        <button class="btn-add" onclick='event.stopPropagation();orderViaWhatsapp("${wa}","${name}")'>📲 Commander</button>
      </div>
    </div>
  </div>`;
}

function openProductDetail(p) {
  const wa = (p.whatsapp || "").replace(/\D/g, "");
  const imgSrc = p.image || null;
  const imgAlt = (p.name||"").replace(/"/g,"&quot;");
  const img = imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" class="modal-img-zoom" onclick="openLightbox('${imgSrc.replace(/'/g,"\\'")}','${imgAlt.replace(/'/g,"\\'")}');event.stopPropagation()" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--radius);margin-bottom:14px;display:block" title="Cliquer pour agrandir 🔍" />` : "";
  const desc = (p.description || "").trim();
  const nameSafe = (p.name||"").replace(/'/g,"");
  modalHTML(`
    <h2 style="font-size:17px;margin-bottom:4px">${p.name} <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${img}
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
      ${p.price > 0 ? `<span style="font-size:22px;font-weight:700;color:var(--primary)">${fmt(p.price)}</span>` : ""}
      ${p.oldPrice ? `<span style="font-size:14px;color:var(--muted);text-decoration:line-through">${fmt(p.oldPrice)}</span>` : ""}
      ${p.stock > 0 ? `<span style="font-size:13px;color:var(--muted)">${p.stock} en stock</span>` : `<span style="font-size:13px;color:#c62828">Rupture de stock</span>`}
    </div>
    ${desc ? `<div style="font-size:14px;line-height:1.7;color:var(--text);white-space:pre-line;margin-bottom:14px;background:#f9f9f9;padding:12px;border-radius:var(--radius)">${desc}</div>` : ""}
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
      ${wa ? `<button class="btn btn-primary" style="background:#25D366;border-color:#25D366" onclick="waOpen('${wa}',encodeURIComponent('Bonjour, je suis intéressé par : ${nameSafe}'),'${nameSafe}')">💬 Commander sur WhatsApp</button>` : `<span style="font-size:13px;color:var(--muted)">Aucun contact disponible</span>`}
    </div>`);
}

// ============ RENCONTRES ============
const RENCONTRE_SOUS = { amitie: "💙 Amitié", serieux: "❤️ Relation sérieuse" };

function rencontreAvatar(sexe) {
  const isFemme = (sexe||"").toLowerCase().startsWith("f");
  const bg = isFemme
    ? "linear-gradient(135deg,#f8bbd0,#e91e8c)"
    : "linear-gradient(135deg,#bbdefb,#1565c0)";
  const svgBody = isFemme ? `
    <circle cx="50" cy="50" r="50" fill="url(#bg)"/>
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8bbd0"/><stop offset="100%" stop-color="#e91e8c"/></linearGradient></defs>
    <!-- visage -->
    <circle cx="50" cy="34" r="18" fill="#FFCC99"/>
    <!-- cheveux longs -->
    <ellipse cx="50" cy="20" rx="20" ry="14" fill="#4e342e"/>
    <rect x="30" y="20" width="6" height="28" rx="3" fill="#4e342e"/>
    <rect x="64" y="20" width="6" height="28" rx="3" fill="#4e342e"/>
    <!-- yeux -->
    <circle cx="43" cy="33" r="3" fill="#fff"/><circle cx="43" cy="33" r="1.5" fill="#333"/>
    <circle cx="57" cy="33" r="3" fill="#fff"/><circle cx="57" cy="33" r="1.5" fill="#333"/>
    <!-- joues -->
    <circle cx="38" cy="38" r="4" fill="#f48fb1" opacity="0.5"/>
    <circle cx="62" cy="38" r="4" fill="#f48fb1" opacity="0.5"/>
    <!-- bouche -->
    <path d="M44 41 Q50 46 56 41" stroke="#c2185b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- corps robe -->
    <path d="M28 100 Q30 68 50 65 Q70 68 72 100Z" fill="#e91e8c"/>
  ` : `
    <circle cx="50" cy="50" r="50" fill="url(#bg)"/>
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#bbdefb"/><stop offset="100%" stop-color="#1565c0"/></linearGradient></defs>
    <!-- visage -->
    <circle cx="50" cy="34" r="18" fill="#FFCC99"/>
    <!-- cheveux courts -->
    <ellipse cx="50" cy="18" rx="18" ry="10" fill="#3e2723"/>
    <rect x="32" y="16" width="36" height="10" rx="5" fill="#3e2723"/>
    <!-- yeux -->
    <circle cx="43" cy="33" r="3" fill="#fff"/><circle cx="43" cy="33" r="1.5" fill="#333"/>
    <circle cx="57" cy="33" r="3" fill="#fff"/><circle cx="57" cy="33" r="1.5" fill="#333"/>
    <!-- sourcils -->
    <path d="M40 28 Q43 26 46 28" stroke="#3e2723" stroke-width="1.5" fill="none"/>
    <path d="M54 28 Q57 26 60 28" stroke="#3e2723" stroke-width="1.5" fill="none"/>
    <!-- bouche -->
    <path d="M45 41 Q50 45 55 41" stroke="#bf360c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- corps chemise -->
    <path d="M30 100 Q32 66 50 63 Q68 66 70 100Z" fill="#1565c0"/>
    <rect x="46" y="63" width="8" height="20" fill="#e3f2fd"/>
  `;
  return `<div class="rcard-avatar" style="background:${bg}">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">${svgBody}</svg>
  </div>`;
}

function rencontreCard(p) {
  const sousLabel = RENCONTRE_SOUS[p.souscat] || "❤️ Rencontre";
  const sousCls   = p.souscat === "serieux" ? "rcat-serieux" : "rcat-amitie";
  const descShort = (p.descShort || "").slice(0, 130);
  const pData = JSON.stringify({id:p.id,displayName:p.displayName,age:p.age,profession:p.profession,ville:p.ville,quartier:p.quartier,souscat:p.souscat,prixAcces:p.prixAcces,descShort:p.descShort||"",sexe:p.sexe||""}).replace(/'/g,"&#39;");
  return `<div class="rcard" onclick='openRencontreDetail(${pData})'>
    ${rencontreAvatar(p.sexe)}
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
  const avatarHtml = rencontreAvatar(p.sexe || "");
  modalHTML(`
    <h2>❤️ Profil Rencontres <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="background:linear-gradient(135deg,#fce4ec,#fff8f8);border-radius:var(--radius);padding:16px;margin-bottom:14px;text-align:center">
      <div style="width:90px;height:90px;border-radius:50%;overflow:hidden;margin:0 auto 10px;box-shadow:0 4px 16px rgba(194,24,91,.25)">${avatarHtml}</div>
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
      <button class="btn btn-primary" style="background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick="closeModal();payerRencontre(${JSON.stringify(p).replace(/"/g,'&quot;')})">
        🌊 Payer &amp; Accéder au profil — ${fmt(p.prixAcces)}
      </button>
    </div>`);
}

function payerRencontre(p) {
  const name = (p.displayName || "").replace(/'/g, "\\'");
  modalHTML(`
    <h2>🌊 Paiement Wave <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="background:#e3f2fd;border:1.5px solid #90caf9;border-radius:var(--radius);padding:14px;margin-bottom:16px;font-size:13px;line-height:1.8">
      <strong>Veuillez payer Buzz des Influents avec Wave en cliquant sur ce lien</strong><br>
      Montant : <strong style="color:#1DA1F2">505 FCFA</strong><br>
      Profil : <strong>${p.displayName}</strong>
    </div>
    <a href="${RENCONTRES_WAVE_LINK}" target="_blank" rel="noopener"
       style="display:block;text-align:center;background:#1DA1F2;color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:var(--radius);text-decoration:none;margin-bottom:16px"
       onclick="">
      🌊 Payer 505 FCFA avec Wave
    </a>
    <div style="font-size:12px;color:var(--muted);margin-bottom:16px;text-align:center">
      Une fois le paiement effectué, cliquez sur le bouton ci-dessous.
    </div>
    <button class="btn btn-primary" style="width:100%;background:linear-gradient(135deg,#43a047,#388e3c)"
      onclick="closeModal();confirmPaiementRencontre('${name}')">
      ✅ J'ai payé — Contacter l'administrateur
    </button>
    <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="closeModal()">Annuler</button>
  `);
}

function confirmPaiementRencontre(displayName) {
  modalHTML(`
    <h2>⚠️ Avant de continuer <button class="modal-close" onclick="closeModal()">✕</button></h2>
    <div style="background:#fff8e1;border:1.5px solid #ffca28;border-radius:var(--radius);padding:16px;margin-bottom:16px;font-size:14px;line-height:1.9;color:#555">
      ✅ <strong>Rassurez-vous d'avoir fait le paiement via Wave.</strong><br>
      📸 <strong>Rassurez-vous d'avoir une preuve de votre paiement</strong> (capture d'écran du reçu Wave).<br><br>
      Car vous êtes à la <strong>dernière étape</strong> :<br>
      Discutez avec l'administrateur et <strong>envoyez-lui les preuves de votre paiement</strong> pour qu'il vous mette en contact avec le profil souhaité.
    </div>
    <button class="btn btn-primary" style="width:100%;background:#25D366;border-color:#25D366;font-size:15px"
      onclick="closeModal();waOpen('${RENCONTRES_WA}',encodeURIComponent('Bonjour, j\\'ai payé 505 FCFA via Wave pour accéder au profil ${displayName}. Voici ma preuve de paiement.'),'${displayName}')">
      💬 Ouvrir WhatsApp de l'administrateur
    </button>
    <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="closeModal()">Retour</button>
  `);
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
        <select id="rcSexe"><option value="">— Sélectionner —</option><option value="M">M (Homme)</option><option value="F">F (Femme)</option></select>
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
      <div id="rcPhotoPreview" style="display:none;margin-top:8px;align-items:center;gap:10px">
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
  try { if (photoFile) photo = await compressImage(photoFile); } catch {}

  const body = {
    nom, prenom, birthdate, sexe,
    profession: document.getElementById("rcProf").value.trim(),
    ville: document.getElementById("rcVille").value.trim(),
    quartier: document.getElementById("rcQuartier").value.trim(),
    whatsapp: waVal,
    phone: phoneVal,
    prixAcces: 500,
    description: document.getElementById("rcDesc").value.trim(),
    souscat: document.getElementById("rcSouscat").value,
    photo,
  };
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    const r = await fetch("/api/rencontres", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(tid);
    const j = await r.json();
    bar.done(r.ok);
    await new Promise(res => setTimeout(res, 400));
    if (r.ok) {
      closeModal();
      toast("✓ Profil envoyé — en attente de validation par l'administrateur", "green");
    } else { toast(j.error || "Erreur lors de l'envoi", "red"); }
  } catch(err) {
    bar.done(false);
    toast(err.name === "AbortError" ? "Délai dépassé — vérifiez votre connexion et réessayez" : "Erreur réseau — réessayez", "red");
  }
  finally { if (btn) { btn.disabled = false; btn.textContent = "❤️ Envoyer mon profil"; } if (pw) pw.style.display = "none"; }
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

// ============ PRONOSTICS PAGE ============
async function showPronosticsPage() {
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">🎯</span>
      <div><h2>Pronostics</h2><p>Pronostics sportifs et jeux virtuels · Abengourou</p></div>
    </div>
    <div class="section-block">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>
    </div>`;

  let all = [];
  try { all = await (await fetch("/api/products")).json(); } catch {}
  const products = all.filter(p => p.category === "pronostics");

  if (!products.length) {
    wrap.querySelector(".section-block").innerHTML = `
      <div class="empty-state">
        <div class="empty-ico">🎯</div>
        <p>Aucun pronostic disponible pour le moment.</p>
      </div>`;
    return;
  }

  const cardsHtml = products.map(p => {
    if (Number(p.price) > 0) {
      return lockedCard(p, Number(p.price), "pronostics");
    }
    return pronosticFreeCard(p);
  }).join("");

  wrap.querySelector(".section-block").innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${products.length} pronostic${products.length>1?"s":""} disponible${products.length>1?"s":""}</div>
    <div class="info-cards-grid">${cardsHtml}</div>`;
}

function pronosticFreeCard(p) {
  const desc = (p.description || "").trim();
  const pData = JSON.stringify({id:p.id,title:p.title,description:desc,image:p.image||null,category:"pronostics"}).replace(/'/g,"&#39;");
  return `<div class="info-card" onclick='openInfoDetail(${pData})' style="cursor:pointer">
    <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:16px;border-radius:var(--radius) var(--radius) 0 0;color:#fff;text-align:center;font-size:36px">🎯</div>
    <div class="info-card-body">
      <div class="info-card-cat" style="color:#1a237e">🎯 Pronostic Gratuit</div>
      <div class="info-card-title">${p.title}</div>
      ${desc ? `<div class="info-card-desc" style="white-space:pre-line">${desc.slice(0,220)}${desc.length>220?"…":""}</div>` : ""}
    </div>
  </div>`;
}

// ============ CABINE EN LIGNE ============
const CABINE_OPERATEURS = [
  { val:"ORANGE",      label:"Orange CI",     ico:"🟠", bg:"#FF6B00", color:"#fff", border:"#c85000" },
  { val:"MTN",         label:"MTN CI",        ico:"🟡", bg:"#FFC107", color:"#1a1a1a", border:"#e6a800" },
  { val:"MOOV",        label:"Moov Africa",   ico:"🔵", bg:"#1565C0", color:"#fff", border:"#0d47a1" },
  { val:"WAVE",        label:"Wave",          ico:"🌊", bg:"#1DA1F2", color:"#fff", border:"#0d8de0" },
];
const CABINE_SERVICES = [
  { val:"APPEL",         label:"Crédit Appel",  ico:"📞", bg:"#2e7d32", color:"#fff" },
  { val:"INTERNET",      label:"Forfait Internet", ico:"🌐", bg:"#1565C0", color:"#fff" },
  { val:"UNITÉS",        label:"Unités / Recharge", ico:"📶", bg:"#6a1b9a", color:"#fff" },
  { val:"MOBILE MONEY",  label:"Mobile Money",  ico:"💰", bg:"#e65100", color:"#fff" },
];
let _cabineOp = "", _cabineSvc = "";

function showCabineEnLignePage() {
  document.getElementById("mobileSidebar").classList.remove("show");
  _cabineOp = ""; _cabineSvc = "";
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon"><img src="/img/cabine-en-ligne.png" style="width:56px;height:56px;object-fit:contain;border-radius:12px" /></span>
      <div>
        <h2>Cabine en Ligne</h2>
        <p>Recharge · Crédit Appel · Internet · Mobile Money</p>
      </div>
    </div>
    <div class="section-block" style="max-width:520px;margin:0 auto">
      <div style="display:flex;flex-direction:column;gap:22px;padding:8px 0">

        <!-- ÉTAPE 1: OPÉRATEUR -->
        <div class="form-group">
          <label style="font-weight:700;font-size:15px;margin-bottom:12px;display:block">
            <span style="display:inline-flex;align-items:center;justify-content:center;background:var(--primary);color:#fff;border-radius:50%;width:24px;height:24px;font-size:13px;margin-right:6px">1</span>
            CHOIX DE L'OPÉRATEUR
          </label>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
            ${CABINE_OPERATEURS.map(o => `
              <button class="cabine-op-btn" data-op="${o.val}"
                onclick="selectCabineOp('${o.val}')"
                style="background:${o.bg};color:${o.color};border:3px solid transparent;border-radius:14px;padding:14px 8px;font-size:14px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:7px;transition:all .18s;box-shadow:0 2px 8px rgba(0,0,0,.12)">
                <span style="font-size:32px;line-height:1">${o.ico}</span>
                <span style="font-size:13px">${o.label}</span>
              </button>`).join("")}
          </div>
          <div id="cabineOpMsg" style="display:none;margin-top:8px;font-size:13px;color:#2e7d32;font-weight:600;padding:6px 10px;background:#e8f5e9;border-radius:8px"></div>
        </div>

        <!-- ÉTAPE 2: NUMÉRO -->
        <div class="form-group">
          <label style="font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px">
            <span style="display:inline-flex;align-items:center;justify-content:center;background:var(--primary);color:#fff;border-radius:50%;width:24px;height:24px;font-size:13px">2</span>
            NUMÉRO À RECHARGER
          </label>
          <input id="cabineNumero" type="tel" placeholder="Ex : 07 07 00 00 00"
            style="width:100%;padding:13px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:16px;margin-top:10px;box-sizing:border-box;letter-spacing:1px" />
          <div style="font-size:12px;color:var(--muted);margin-top:4px">📍 Numéro CI — ex : 0707000000 ou 0505000000</div>
        </div>

        <!-- ÉTAPE 3: SERVICE -->
        <div class="form-group">
          <label style="font-weight:700;font-size:15px;margin-bottom:12px;display:block">
            <span style="display:inline-flex;align-items:center;justify-content:center;background:var(--primary);color:#fff;border-radius:50%;width:24px;height:24px;font-size:13px;margin-right:6px">3</span>
            TYPE DE SERVICE
          </label>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
            ${CABINE_SERVICES.map(sv => `
              <button class="cabine-svc-btn" data-svc="${sv.val}" data-bg="${sv.bg}" data-color="${sv.color}"
                onclick="selectCabineSvc('${sv.val}')"
                style="background:#f8f8f8;color:#333;border:2px solid #e0e0e0;border-radius:12px;padding:12px 8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .18s">
                <span style="font-size:26px;line-height:1">${sv.ico}</span>
                <span style="text-align:center;line-height:1.3">${sv.label}</span>
              </button>`).join("")}
          </div>
          <div id="cabineSvcMsg" style="display:none;margin-top:8px;font-size:13px;color:#2e7d32;font-weight:600;padding:6px 10px;background:#e8f5e9;border-radius:8px"></div>
        </div>

        <!-- BOUTON PAYER -->
        <button class="btn btn-primary btn-lg"
          style="background:linear-gradient(135deg,#1a237e,#0d47a1);font-size:17px;font-weight:700;padding:18px;letter-spacing:1px;border-radius:var(--radius);border:none;cursor:pointer;color:#fff;margin-top:4px;width:100%"
          onclick="cabinePayer()">
          💳 PAYER MAINTENANT
        </button>
        <div style="font-size:12px;color:var(--muted);text-align:center;margin-top:-10px">
          🔒 Paiement sécurisé · L'administrateur est notifié automatiquement
        </div>
      </div>
    </div>`;
}

function selectCabineOp(val) {
  _cabineOp = val;
  const op = CABINE_OPERATEURS.find(o => o.val === val);
  document.querySelectorAll(".cabine-op-btn").forEach(b => {
    const sel = b.dataset.op === val;
    b.style.outline = sel ? "3px solid #fff" : "none";
    b.style.boxShadow = sel ? `0 0 0 4px ${op.border},0 4px 16px rgba(0,0,0,.18)` : "0 2px 8px rgba(0,0,0,.12)";
    b.style.transform = sel ? "scale(1.05)" : "scale(1)";
  });
  const el = document.getElementById("cabineOpMsg");
  if (el && op) { el.style.display = "block"; el.textContent = `✓ ${op.ico} ${op.label} sélectionné`; }
}

function selectCabineSvc(val) {
  _cabineSvc = val;
  const sv = CABINE_SERVICES.find(s => s.val === val);
  document.querySelectorAll(".cabine-svc-btn").forEach(b => {
    const sel = b.dataset.svc === val;
    b.style.background = sel ? b.dataset.bg : "#f8f8f8";
    b.style.color      = sel ? b.dataset.color : "#333";
    b.style.border     = sel ? `2px solid ${b.dataset.bg}` : "2px solid #e0e0e0";
    b.style.transform  = sel ? "scale(1.05)" : "scale(1)";
    b.style.boxShadow  = sel ? `0 4px 12px rgba(0,0,0,.18)` : "none";
  });
  const el = document.getElementById("cabineSvcMsg");
  if (el && sv) { el.style.display = "block"; el.textContent = `✓ ${sv.ico} ${sv.label} sélectionné`; }
}

function cabinePayer() {
  if (!_cabineOp) return toast("Choisissez un opérateur", "red");
  const num = (document.getElementById("cabineNumero")?.value || "").trim();
  if (!num) return toast("Entrez le numéro à recharger", "red");
  if (!_cabineSvc) return toast("Choisissez un type de service", "red");

  const op  = _cabineOp;
  const svc = _cabineSvc;
  const opInfo  = CABINE_OPERATEURS.find(o => o.val === op) || {};
  const svcInfo = CABINE_SERVICES.find(s => s.val === svc) || {};
  const waMsg = encodeURIComponent(
    `🎟 Commande Cabine en Ligne\n` +
    `${opInfo.ico || "📱"} Opérateur : ${op}\n` +
    `☎️ Numéro : ${num}\n` +
    `⚙️ Service : ${svc}\n\n` +
    `Merci de traiter cette commande.`
  );
  const smsText = `Cabine : ${svc} ${op} → ${num}`;

  // 1. Ouvrir le lien de paiement immédiatement
  window.open(CABINE_PAYMENT_LINK, "_blank");

  // 2. Envoyer SMS admin (fire-and-forget)
  if (RENCONTRES_WA) {
    fetch("/api/notify-vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorPhone: RENCONTRES_WA, productName: smsText })
    }).catch(() => {});
  }

  // 3. Afficher modale de confirmation → bouton WhatsApp admin
  modalHTML(`
    <h2 style="font-size:17px;color:#1a237e;margin-bottom:6px">
      ✅ Paiement initié
      <button class="modal-close" onclick="closeModal()">✕</button>
    </h2>
    <div style="background:#e8f5e9;border-left:4px solid #2e7d32;border-radius:0 var(--radius) var(--radius) 0;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.8">
      <strong>Récapitulatif de la commande :</strong><br>
      ${opInfo.ico || "📱"} Opérateur : <strong>${op}</strong><br>
      ☎️ Numéro : <strong>${num}</strong><br>
      ⚙️ Service : <strong>${svc}</strong>
    </div>
    <p style="font-size:13px;color:var(--text);margin-bottom:16px;line-height:1.6">
      Le lien de paiement a été ouvert. Une fois le paiement effectué, confirmez votre commande à l'administrateur via WhatsApp.
    </p>
    <div class="btn-row" style="flex-direction:column;gap:10px">
      <button class="btn btn-primary" style="background:#25D366;border-color:#25D366;font-size:15px;padding:14px"
        onclick="closeModal();window.open('https://wa.me/${RENCONTRES_WA}?text=${waMsg}','_blank')">
        💬 Confirmer sur WhatsApp
      </button>
      <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    </div>
    <div style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px">
      📱 Un SMS a été envoyé automatiquement à l'administrateur
    </div>`);
}

// ============ PAGE 2 TABS : Concours / Actualités / Emploi ============
let _page2All   = null;
let _page2Items = [];  // items filtrés pour l'onglet actif + ville
let _page2Step  = 0;   // 0=2 items  |  1+=quartiles
let _page2Cat   = "";  // cat active

async function switchPage2Tab(cat, btn) {
  document.querySelectorAll(".page2-tab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = document.getElementById("page2Content");
  if (!el) return;
  el.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>`;
  try { _page2All = await (await fetch("/api/products" + getCityParam())).json(); } catch { _page2All = []; }
  const dbCat = cat === "concours" ? "concours-ci" : cat;
  const allItems = Array.isArray(_page2All) ? _page2All : (_page2All.products || []);
  _page2Items = allItems.filter(p => p.category === dbCat);
  _page2Cat   = cat;
  _page2Step  = 0;
  renderPage2Tab();
}

function renderPage2Tab() {
  const el    = document.getElementById("page2Content");
  if (!el) return;
  const cat   = _page2Cat;
  const items = _page2Items;
  const N     = items.length;
  const icon  = cat === "concours" ? "📚" : cat === "actualites" ? "📰" : "💼";
  const label = cat === "concours" ? "Concours CI" : cat === "actualites" ? "Actualités" : "Offres d'emploi";
  const city  = SELECTED_CITY || "";

  if (!N) {
    el.innerHTML = `<div class="empty-state"><div class="empty-ico">${icon}</div><p>Aucune annonce dans <strong>${label}</strong>${city ? ` à <strong>${city}</strong>` : ""} pour le moment.</p></div>`;
    return;
  }

  const catQ = Math.ceil(N / 4);
  let shownItems;
  if (_page2Step === 0) {
    shownItems = items.slice(0, 2);
  } else if (N < 5) {
    shownItems = items;
  } else {
    shownItems = items.slice(0, Math.min(_page2Step * catQ, N));
  }
  const isDone = shownItems.length >= N;

  let moreBtn = "";
  if (!isDone) {
    const nextStep  = _page2Step + 1;
    const nextCount = N < 5 ? N : Math.min(nextStep * catQ, N);
    const qLabel    = N < 5 ? "" : ` <span style="opacity:.75;font-size:11px">(${nextStep}/4)</span>`;
    moreBtn = `<div style="text-align:center;margin-top:18px">
      <button onclick="_page2Step++;renderPage2Tab()" style="padding:11px 32px;border-radius:26px;background:var(--primary);color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 3px 10px rgba(230,81,0,.3);transition:transform .1s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
        🔽 Voir plus — ${nextCount} annonce${nextCount > 1 ? "s" : ""}${qLabel}
      </button>
    </div>`;
  } else if (_page2Step > 0) {
    moreBtn = `<div style="text-align:center;margin-top:14px;padding:10px 16px;background:#f1f8e9;border-radius:10px;font-size:13px;color:#388e3c;font-weight:600">✅ Toutes les <strong>${N}</strong> annonces affichées</div>`;
  }

  const cityTag = city ? `📍 ${city} · ` : "";
  el.innerHTML = `
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${cityTag}${shownItems.length} / ${N} annonce${N > 1 ? "s" : ""}</div>
    <div class="products-grid">${shownItems.map(p => waOnlyCard({...p, name:p.title})).join("")}</div>
    ${moreBtn}`;
}

// ============ RENDER HOME ============
function renderHome() {
  renderSidebar(document.getElementById("desktopSidebar"));
  renderCatNav();
  renderCarousel();

  document.getElementById("shortcuts").innerHTML = SHORTCUTS.map(([i,n,cat]) => {
    const icoHtml = i.startsWith("IMG:")
      ? `<img src="${i.slice(4)}" style="width:36px;height:36px;object-fit:contain;border-radius:6px" />`
      : i;
    return `<a href="#" class="shortcut" onclick="filterCat('${cat}');return false;"><span class="ico">${icoHtml}</span><span>${n}</span></a>`;
  }).join("");

  renderCityBanner();
  switchPage2Tab("concours", document.querySelector(".page2-tab.active"));

  loadFlashSection();
  loadCatSection("realGrid", "immobilier", "🏠", "Aucun bien immobilier disponible.", "products-grid");
  loadTransportSection();
  loadCatSection("restoGrid", "restaurants", "🍽️", "Aucun restaurant disponible.", "products-grid");
  loadShop();
  loadServicesSection();
  loadRencontresSection();
}

function showHome() {
  _page2All = null;
  showPage("page-home");
  renderCityBanner();
  if (!SELECTED_CITY) {
    setTimeout(() => showCityModal(), 400);
  }
  switchPage2Tab("concours", document.querySelector(".page2-tab.active"));
  loadShop();
}

// Offres flash = produits avec remise publiés (oldPrice > price)
let _flashAll  = [];
let _flashShown = 4;

async function loadFlashSection() {
  _flashAll  = [];
  _flashShown = 4;
  const el = document.getElementById("flashGrid");
  if (!el) return;
  try {
    const all = await (await fetch("/api/products" + getCityParam())).json();
    _flashAll = (Array.isArray(all) ? all : (all.products||[])).filter(p => p.oldPrice && Number(p.oldPrice) > Number(p.price) && !PAID_CATS.has(p.category));
  } catch {}
  renderFlashSection();
}

function renderFlashSection() {
  const el = document.getElementById("flashGrid");
  if (!el) return;
  const products = _flashAll;
  if (!products.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-ico">⚡</div><p>Aucune offre flash pour le moment.</p></div>`;
    return;
  }
  // Quand toutes les villes : affichage progressif +4
  if (!SELECTED_CITY) {
    const visible = products.slice(0, _flashShown);
    const isDone  = _flashShown >= products.length;
    const moreBtn = isDone ? "" : `
      <div style="text-align:center;margin-top:18px;grid-column:1/-1">
        <button onclick="_flashShown+=4;renderFlashSection()" style="padding:11px 32px;border-radius:26px;background:var(--primary);color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 3px 10px rgba(230,81,0,.3);transition:transform .1s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
          🔽 Voir plus — ${Math.min(_flashShown + 4, products.length)} offre${products.length > 1 ? "s" : ""}
        </button>
      </div>`;
    el.innerHTML = visible.map(p => productCard({...p, name:p.title}, true)).join("") + moreBtn;
  } else {
    // Ville sélectionnée : tout afficher
    el.innerHTML = products.map(p => productCard({...p, name:p.title}, true)).join("");
  }
}

// Charge une catégorie depuis l'API dans une grille
async function loadCatSection(gridId, category, icon, emptyMsg, gridClass) {
  const el = document.getElementById(gridId);
  if (!el) return;
  let products = [];
  try {
    const all = await (await fetch("/api/products" + getCityParam())).json();
    products = (Array.isArray(all) ? all : (all.products||[])).filter(p => p.category === category);
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
    const all = await (await fetch("/api/products" + getCityParam())).json();
    products = (Array.isArray(all) ? all : (all.products||[])).filter(p => p.category === "transport");
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
        ${wa ? `<button class="btn-wa" style="border-radius:20px;padding:8px 14px" onclick="waOpen('${wa}','${msg}','${(p.title||'').replace(/'/g,'')}')">W</button>` : ""}
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
    const all = await (await fetch("/api/products" + getCityParam())).json();
    products = (Array.isArray(all) ? all : (all.products||[])).filter(p => p.category === "actualites");
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

// ============ LOAD SHOP (API) — vue progressive par quartiles + ville ============
const SHOP_EXCLUDED = new Set(["rencontres","sante","scolaires","pronostics","transport","immobilier","restaurants","actualites","concours-ci","emploi","recrutement","cabine-en-ligne"]);

let _shopAll  = null; // cache produits filtrés par ville
let _shopStep = 0;   // 0=vue initiale 2/cat  |  1=Q1  2=Q2  3=Q3  4=tout
let _catSteps = {};  // étape d'expansion par catégorie dans la vue initiale

async function loadShop() {
  _shopAll  = null;
  _shopStep = 0;
  _catSteps = {};
  const grid = document.getElementById("shopGrid");
  if (!grid) return;
  grid.style.display = "block";
  grid.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div><p>Chargement…</p></div>`;
  try {
    const raw = await (await fetch("/api/products" + getCityParam())).json();
    const all = Array.isArray(raw) ? raw : (raw.products || []);
    _shopAll = all.filter(p => !SHOP_EXCLUDED.has(p.category) && !PAID_CATS.has(p.category));
  } catch { _shopAll = []; }
  renderShop();
}

function renderShop() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;
  const products = _shopAll || [];
  const total    = products.length;
  const city     = SELECTED_CITY || "";
  const cityTag  = city ? `📍 ${city}` : "🌍 Côte d'Ivoire";

  // ── Vide ──────────────────────────────────────────────────────────────
  if (!total) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-ico">🛍️</div>
        <p>Aucun article${city ? ` à <strong>${city}</strong>` : ""} pour le moment.</p>
        ${city ? `<button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="setCity('')">Voir toutes les villes</button>` : ""}
      </div>`;
    return;
  }

  const quarter = Math.ceil(total / 4);

  // ── Étape 0 : 2 articles par catégorie avec voir plus progressif ──────
  if (_shopStep === 0) {
    const byCat = {};
    for (const p of products) {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    }
    const catCount = Object.keys(byCat).length;

    const blocks = Object.entries(byCat).map(([slug, items]) => {
      const [, icon, label] = CATEGORIES.find(c => c[0] === slug) || [slug, "🛍️", slug];
      const N    = items.length;
      const catQ = Math.ceil(N / 4);
      const step = _catSteps[slug] || 0;

      // Articles affichés : 2 au départ, puis 1/4 par clic
      let shownItems;
      if (step === 0) {
        shownItems = items.slice(0, 2);
      } else if (N < 5) {
        shownItems = items; // < 5 produits → tout afficher dès le 1er clic
      } else {
        shownItems = items.slice(0, Math.min(step * catQ, N));
      }
      const isDone = shownItems.length >= N;

      let moreBtn = "";
      if (!isDone) {
        const nextStep  = step + 1;
        const nextCount = N < 5 ? N : Math.min(nextStep * catQ, N);
        const qLabel    = N < 5 ? "" : ` <span style="opacity:.75;font-size:11px">(${nextStep}/4)</span>`;
        moreBtn = `<div style="text-align:center;padding:8px 0 4px">
          <button onclick="_catSteps['${slug}']=(_catSteps['${slug}']||0)+1;renderShop()" style="padding:9px 24px;border-radius:24px;background:var(--primary);color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 3px 10px rgba(230,81,0,.3);transition:transform .1s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
            🔽 Voir plus — ${nextCount} article${nextCount > 1 ? "s" : ""}${qLabel}
          </button>
        </div>`;
      } else if (step > 0) {
        moreBtn = `<div style="text-align:center;padding:6px;font-size:12px;color:#388e3c;font-weight:600">✅ Tous les ${N} articles affichés</div>`;
      }

      return `<div class="shop-cat-block">
        <div class="shop-cat-header">
          <span class="shop-cat-icon">${icon}</span>
          <div>
            <h3>${label}</h3>
            <small style="color:var(--muted)">${N} article${N > 1 ? "s" : ""} · ${cityTag}</small>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="filterCat('${slug}','1','${city}')">Voir tout →</button>
        </div>
        <div class="products-grid shop-cat-grid">${shownItems.map(p => productCard({...p, name: p.title}, false)).join("")}</div>
        ${moreBtn}
      </div>`;
    }).join("");

    grid.innerHTML = `
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px">
        ${cityTag} · <strong>${catCount}</strong> catégorie${catCount > 1 ? "s" : ""} · <strong>${total}</strong> article${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}
      </div>
      ${blocks}`;
    return;
  }

  // ── Étapes 1-4 : quartiles ─────────────────────────────────────────────
  const shown   = Math.min(_shopStep * quarter, total);
  const visible = products.slice(0, shown);
  const isDone  = shown >= total;

  let moreBtn = "";
  if (!isDone) {
    const nextStep  = _shopStep + 1;
    const nextShown = Math.min(nextStep * quarter, total);
    const qLabel    = `${nextStep}/4`;
    moreBtn = `
      <div style="text-align:center;margin-top:24px">
        <button onclick="_shopStep++;renderShop()" style="padding:13px 36px;border-radius:30px;background:var(--primary);color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(230,81,0,.35);transition:transform .1s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
          🔽 Voir plus — ${nextShown} article${nextShown > 1 ? "s" : ""} <span style="opacity:.75;font-size:12px">(${qLabel})</span>
        </button>
      </div>`;
  } else {
    moreBtn = `
      <div style="text-align:center;margin-top:18px;padding:12px 16px;background:#f1f8e9;border-radius:12px;font-size:13px;color:#388e3c;font-weight:600">
        ✅ Tous les <strong>${total}</strong> articles affichés · ${cityTag}
      </div>`;
  }

  grid.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
      <span style="font-size:13px;color:var(--muted)">${cityTag} · <strong>${shown}</strong> / ${total} article${total > 1 ? "s" : ""}</span>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="_shopStep=0;renderShop()" style="font-size:12px">← Vue catégories</button>
        ${city ? `<button class="btn btn-ghost btn-sm" onclick="setCity('')" style="font-size:12px">🌍 Toutes villes</button>` : ""}
      </div>
    </div>
    <div class="products-grid">${visible.map(p => productCard({...p, name: p.title})).join("")}</div>
    ${moreBtn}`;
}

// ============ SECTION SERVICES ============
const SERVICE_CATS = ["services","evenements"];
let _servicesAll   = [];
let _servicesShown = 4;

async function loadServicesSection() {
  _servicesAll   = [];
  _servicesShown = 4;
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  let all = [];
  try {
    const raw = await (await fetch("/api/products" + getCityParam())).json();
    all = Array.isArray(raw) ? raw : (raw.products || []);
  } catch {}
  _servicesAll = all.filter(p => SERVICE_CATS.includes(p.category));
  renderServicesSection();
}

function renderServicesSection() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  const items = _servicesAll;
  grid.style.display = "block";
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-ico">📋</div><p>Aucun service disponible pour le moment.</p></div>`;
    return;
  }

  // Quand toutes les villes : liste plate progressive +4
  if (!SELECTED_CITY) {
    const visible = items.slice(0, _servicesShown);
    const isDone  = _servicesShown >= items.length;
    const moreBtn = isDone ? "" : `
      <div style="text-align:center;margin-top:18px">
        <button onclick="_servicesShown+=4;renderServicesSection()" style="padding:11px 32px;border-radius:26px;background:#1565c0;color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 3px 10px rgba(21,101,192,.3);transition:transform .1s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
          🔽 Voir plus — ${Math.min(_servicesShown + 4, items.length)} service${items.length > 1 ? "s" : ""}
        </button>
      </div>`;
    grid.innerHTML = `<div class="products-grid shop-cat-grid">${visible.map(p => waOnlyCard({...p, name:p.title})).join("")}</div>${moreBtn}`;
    return;
  }

  // Ville sélectionnée : regroupement par catégorie (comportement actuel)
  const byCat = {};
  for (const p of items) { if (!byCat[p.category]) byCat[p.category] = []; byCat[p.category].push(p); }
  grid.innerHTML = Object.entries(byCat).map(([slug, catItems]) => {
    const catInfo = CATEGORIES.find(c => c[0] === slug) || [slug, "📋", slug];
    const [, icon, label] = catInfo;
    const cards = catItems.slice(0,4).map(p => waOnlyCard({...p, name: p.title})).join("");
    const more = catItems.length > 4 ? catItems.length - 4 : 0;
    return `<div class="shop-cat-block">
      <div class="shop-cat-header" style="background:linear-gradient(135deg,#1565c0,#283593)">
        <span class="shop-cat-icon">${icon}</span>
        <div><h3>${label}</h3><small style="color:rgba(255,255,255,.8)">${catItems.length} service${catItems.length>1?"s":""}</small></div>
        <button class="btn btn-ghost btn-sm" onclick="filterCat('${slug}')">Voir tout →</button>
      </div>
      <div class="products-grid shop-cat-grid">${cards}</div>
      ${more > 0 ? `<div style="text-align:center;padding:8px"><button class="btn btn-ghost btn-sm" onclick="filterCat('${slug}')">+ ${more} autre${more>1?"s":""}</button></div>` : ""}
    </div>`;
  }).join("");
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

let _liveTimer = null;
function liveSearchPreview(val) {
  clearTimeout(_liveTimer);
  if (val.trim().length < 2) return;
  _liveTimer = setTimeout(() => doSearch(), 500);
}

// ============ NAVIGATION ============
function showPage(id) {
  document.querySelectorAll(".page-view").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
const CI_CITIES = [
  "Abengourou","Abidjan","Yamoussoukro","Bouaké","Daloa","San-Pédro",
  "Korhogo","Man","Gagnoa","Divo","Aboisso","Bondoukou","Dimbokro",
  "Agboville","Adzopé","Bingerville","Grand-Bassam","Sassandra",
  "Soubré","Sinfra","Séguéla","Odienné","Ferkessédougou","Lakota",
  "Issia","Touba","Vavoua","Katiola","Daoukro","Tiassalé",
  "Anyama","Abobo","Yopougon","Cocody","Plateau","Marcory","Treichville",
  "Grand-Lahou","Jacqueville","Dabou","Guitry","Sikensi","Taabo"
];

// ============ VILLE SÉLECTIONNÉE (accueil) ============
let SELECTED_CITY = localStorage.getItem("abg_city") || "";

function getCityParam() {
  return SELECTED_CITY ? `?city=${encodeURIComponent(SELECTED_CITY)}` : "";
}

function setCity(c) {
  SELECTED_CITY = c;
  if (c) localStorage.setItem("abg_city", c);
  else localStorage.removeItem("abg_city");
  closeModal();
  renderCityBanner();
  renderHome();
}

function renderCityBanner() {
  const el = document.getElementById("cityBanner");
  if (!el) return;
  const cityOpts = CI_CITIES.map(c =>
    `<option value="${c}" ${SELECTED_CITY === c ? "selected" : ""}>${c}</option>`
  ).join("");
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 16px;margin:10px 0;background:linear-gradient(135deg,#e65100,#f57c00);border-radius:12px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15)">
      <span style="font-size:18px">📍</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;opacity:.85;font-weight:500">Vous consultez les annonces de :</div>
        <div style="font-weight:700;font-size:15px">${SELECTED_CITY || "Toutes les villes"}</div>
      </div>
      <select onchange="setCity(this.value)" style="padding:7px 12px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;outline:none;background:#fff;color:#e65100;min-width:160px">
        <option value="">🌍 Toutes les villes</option>
        ${cityOpts}
      </select>
    </div>`;
}

function showCityModal() {
  const cityOpts = CI_CITIES.map(c =>
    `<button onclick="setCity('${c}')" style="padding:10px 16px;border:2px solid ${SELECTED_CITY===c?"var(--primary)":"#e0e0e0"};background:${SELECTED_CITY===c?"var(--primary)":"#fff"};color:${SELECTED_CITY===c?"#fff":"#333"};border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;text-align:left">
      📍 ${c}
    </button>`
  ).join("");
  openModal(`
    <div style="padding:4px 0">
      <h3 style="margin:0 0 6px;color:var(--primary);font-size:18px">📍 Choisissez votre ville</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 16px">Sélectionnez votre ville pour voir les annonces près de chez vous.</p>
      <button onclick="setCity('')" style="width:100%;padding:12px;border:2px dashed #ccc;background:#f9f9f9;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px;color:#555">🌍 Voir toutes les villes de Côte d'Ivoire</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;max-height:340px;overflow-y:auto;padding-right:4px">
        ${cityOpts}
      </div>
    </div>`);
}

async function showSantePage() {
  showPage("page-category");
  const wrap = document.getElementById("catPageContent");
  wrap.innerHTML = `
    <div class="cat-page-header">
      <span class="cat-page-icon">🏥</span>
      <div><h2>Appel Santé CI</h2><p>Pharmacies · Hôpitaux · Cliniques · Côte d'Ivoire</p></div>
    </div>
    <div class="sante-search-box">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="santeCity" list="santeCityList" placeholder="Entrez une ville (ex: Abengourou, Abidjan…)" style="flex:1;min-width:200px;padding:10px 14px;border:2px solid var(--primary);border-radius:var(--radius);font-size:14px;outline:none" />
        <datalist id="santeCityList">${CI_CITIES.map(c=>`<option value="${c}">`).join("")}</datalist>
        <button class="btn btn-primary" onclick="searchSanteCity()" style="white-space:nowrap">🔍 Rechercher</button>
      </div>
      <div class="city-chips">
        ${CI_CITIES.slice(0,10).map(c=>`<button class="city-chip" onclick="document.getElementById('santeCity').value='${c}';searchSanteCity()">${c}</button>`).join("")}
      </div>
    </div>
    <div id="santeResults" style="margin-top:8px">
      <div class="loading-placeholder"><div class="spinner"></div><p>Chargement d'Abengourou…</p></div>
    </div>`;
  // Charger Abengourou automatiquement
  const cityInput = document.getElementById("santeCity");
  if (cityInput) cityInput.value = "Abengourou";
  searchSanteCity();
}

async function searchSanteCity() {
  const city = (document.getElementById("santeCity")?.value || "").trim();
  if (!city) return toast("Entrez une ville", "red");
  const el = document.getElementById("santeResults");
  el.innerHTML = `<div class="loading-placeholder"><div class="spinner"></div><p>Recherche des établissements de santé à <strong>${city}</strong>…</p></div>`;
  try {
    // Chercher la pharmacie de garde enregistrée pour cette ville
    let gardeData = null;
    try {
      const gr = await fetch(`/api/sante/garde?city=${encodeURIComponent(city)}`);
      if (gr.ok) gardeData = await gr.json();
    } catch {}

    const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city+", Côte d'Ivoire")}&format=json&limit=1`, {headers:{"Accept-Language":"fr"}});
    const nomData = await nomRes.json();
    if (!nomData.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-ico">🔍</div><p>Ville introuvable. Essayez un autre nom.</p></div>`;
      return;
    }
    const bb = nomData[0].boundingbox;
    const south = parseFloat(bb[0]), north = parseFloat(bb[1]), west = parseFloat(bb[2]), east = parseFloat(bb[3]);
    const expand = 0.05;
    const bbox = `${south-expand},${west-expand},${north+expand},${east+expand}`;
    const query = `[out:json][timeout:30];(node["amenity"="pharmacy"](${bbox});node["amenity"="hospital"](${bbox});node["amenity"="clinic"](${bbox});node["amenity"="doctors"](${bbox});way["amenity"="pharmacy"](${bbox});way["amenity"="hospital"](${bbox});way["amenity"="clinic"](${bbox}););out center;`;
    const ovRes = await fetch("https://overpass-api.de/api/interpreter", {method:"POST", body:query});
    const ovData = await ovRes.json();
    const elems = ovData.elements || [];
    const pharmacies = elems.filter(e => e.tags?.amenity === "pharmacy");
    const hospitals  = elems.filter(e => e.tags?.amenity === "hospital");
    const clinics    = elems.filter(e => ["clinic","doctors"].includes(e.tags?.amenity));
    el.innerHTML = renderSanteResults(city, pharmacies, hospitals, clinics, gardeData);
  } catch(err) {
    el.innerHTML = `<div class="empty-state"><div class="empty-ico">⚠️</div><p>Erreur de connexion. Vérifiez votre internet et réessayez.</p></div>`;
  }
}

function renderSanteResults(city, pharmacies, hospitals, clinics, gardeData) {
  const gardeCard = gardeData ? `
    <div class="sante-garde-banner">
      <div class="sante-garde-badge">🟢 PHARMACIE DE GARDE</div>
      <div class="sante-static-card" style="border:2px solid #2e7d32;background:#f1f8e9">
        <div class="sante-icon" style="background:#2e7d32">💊</div>
        <div style="flex:1">
          <h4 style="margin:0 0 4px;color:#1b5e20">${gardeData.name}</h4>
          ${gardeData.address ? `<p style="font-size:12px;color:#2e7d32;margin:2px 0">📍 ${gardeData.address}</p>` : ""}
          ${gardeData.phone ? `<p style="font-size:12px;color:#2e7d32;margin:2px 0">📞 ${gardeData.phone}</p>` : ""}
          ${gardeData.note ? `<p style="font-size:12px;color:#388e3c;margin:4px 0;font-style:italic">${gardeData.note}</p>` : ""}
          ${gardeData.phone ? `<a href="tel:${gardeData.phone.replace(/\s/g,"")}" style="display:inline-flex;align-items:center;gap:4px;background:#2e7d32;color:#fff;border:none;border-radius:20px;padding:6px 14px;font-size:12px;text-decoration:none;margin-top:8px;font-weight:600">📞 Appeler la garde</a>` : ""}
        </div>
      </div>
    </div>` : "";

  const osmCard = (e, icon, isGarde = false) => {
    const name     = e.tags?.name || e.tags?.["name:fr"] || "Établissement de santé";
    const phone    = e.tags?.phone || e.tags?.["contact:phone"] || e.tags?.["contact:mobile"] || "";
    const street   = e.tags?.["addr:street"] || "";
    const opening  = e.tags?.opening_hours || "";
    const lat      = e.lat  || e.center?.lat;
    const lon      = e.lon  || e.center?.lon;
    const mapsUrl  = lat ? `https://www.google.com/maps?q=${lat},${lon}` : null;
    const phoneClean = phone.replace(/\s/g,"");
    const gardeMark = isGarde ? `<span style="background:#2e7d32;color:#fff;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;margin-left:6px">✅ DE GARDE</span>` : "";
    return `<div class="sante-static-card" style="${isGarde?"border:2px solid #2e7d32;background:#f1f8e9":""}">
      <div class="sante-icon" style="${isGarde?"background:#2e7d32":""}">${icon}</div>
      <div style="flex:1">
        <h4 style="margin:0 0 4px${isGarde?";color:#1b5e20":""}">${name}${gardeMark}</h4>
        ${street ? `<p style="font-size:12px;color:var(--muted);margin:2px 0">📍 ${street}</p>` : ""}
        ${phone  ? `<p style="font-size:12px;color:var(--muted);margin:2px 0">📞 ${phone}</p>` : ""}
        ${opening? `<p style="font-size:11px;color:#2e7d32;margin:2px 0">🕐 ${opening}</p>` : ""}
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          ${phoneClean ? `<a href="tel:${phoneClean}" style="display:inline-flex;align-items:center;gap:4px;background:#25D366;color:#fff;border:none;border-radius:20px;padding:5px 12px;font-size:12px;text-decoration:none;cursor:pointer">📞 Appeler</a>` : ""}
          ${mapsUrl  ? `<a href="${mapsUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;background:#1976d2;color:#fff;border:none;border-radius:20px;padding:5px 12px;font-size:12px;text-decoration:none;cursor:pointer">🗺️ Itinéraire</a>` : ""}
        </div>
      </div>
    </div>`;
  };

  // Marquer la pharmacie de garde dans les résultats OSM si elle correspond
  const gardeNameNorm = (gardeData?.name||"").toLowerCase().trim();
  const markedPharmacies = pharmacies.map(e => {
    const osmName = (e.tags?.name || "").toLowerCase();
    return { e, isGarde: gardeNameNorm && osmName.includes(gardeNameNorm.slice(0,8)) };
  }).sort((a,b) => b.isGarde - a.isGarde);

  const section = (title, icon, items, isPharmacy = false) => items.length ? `
    <div class="sante-section" style="margin-top:20px">
      <h3 class="sante-title">${icon} ${title} <span style="font-size:13px;font-weight:400;color:var(--muted)">(${items.length})</span></h3>
      <div class="sante-grid">${isPharmacy ? markedPharmacies.map(({e,isGarde})=>osmCard(e,icon,isGarde)).join("") : items.map(e=>osmCard(e,icon)).join("")}</div>
    </div>` : "";

  const noOsmData = !pharmacies.length && !hospitals.length && !clinics.length;
  return `
    <h3 style="margin-bottom:4px;color:var(--primary)">Établissements de santé — ${city}</h3>
    <p style="font-size:12px;color:var(--muted);margin-bottom:16px">Source : OpenStreetMap · Les données peuvent être incomplètes pour certaines villes</p>
    ${gardeCard}
    ${section("Pharmacies","💊",pharmacies,true)}
    ${section("Hôpitaux","🏥",hospitals)}
    ${section("Cliniques & Centres de santé","🩺",clinics)}
    ${noOsmData && !gardeData ? `<div class="empty-state"><div class="empty-ico">🏥</div><p>Aucun établissement trouvé à <strong>${city}</strong> via OpenStreetMap.</p></div>` : ""}`;
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
  if (sel) {
    sel.innerHTML = CATEGORIES.filter(([s]) => s !== "cabine-en-ligne").map(([s,_,n]) => `<option value="${s}">${n}</option>`).join("");
    switchFormForCat(sel);
  }
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
  const cat = sel.value;

  // Rencontres → rediriger vers la page dédiée
  if (cat === "rencontres") {
    showRencontresPage();
    return;
  }

  const isService = FORM_SERVICE_CATS.has(cat);
  const isPaid = PAID_CATS.has(cat);
  const isProno = cat === "pronostics";
  const artSection = form.querySelector(".pf-article");
  const serviceSection = form.querySelector(".pf-service");
  const jobSection = form.querySelector(".pf-job");
  const pronoSection = form.querySelector(".pf-pronos");
  if (artSection) artSection.style.display = (isService || isPaid || isProno) ? "none" : "";
  if (serviceSection) serviceSection.style.display = isService ? "" : "none";
  if (jobSection) jobSection.style.display = isPaid ? "" : "none";
  if (pronoSection) pronoSection.style.display = isProno ? "" : "none";
}

function onAccessTypeChange(form) {
  if (!form) return;
  const accessType = form.querySelector("input[name='accessType']:checked")?.value || "free";
  const paidFields = form.querySelector(".pf-pronos-paid");
  if (paidFields) paidFields.style.display = accessType === "paid" ? "" : "none";
}

function onPronoTypeChange(sel) {
  const form = sel.closest("form");
  if (!form) return;
  const matchFields = form.querySelector(".pf-pronos-matches");
  if (matchFields) matchFields.style.display = sel.value === "Les matchs" ? "" : "none";
}

// ============ IMAGE COMPRESSION (WebP) ============
async function compressImage(file, maxW = 200, quality = 0.70) {
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
        const webp = canvas.toDataURL("image/webp", quality);
        resolve(webp !== "data:," ? webp : canvas.toDataURL("image/jpeg", quality));
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
  const isService = FORM_SERVICE_CATS.has(cat);
  const isProno = cat === "pronostics";
  const expireHours = Number(f.expireHours?.value || 0);

  let desc = f.description ? f.description.value : "";
  let price = 0, stock = 0, whatsapp = "", oldPrice = null, personalPhone = "";
  let employer = "", jobLocation = "", contractType = "", salary = "", deadline = "";

  if (isService) {
    const svcSec = f.querySelector(".pf-service");
    whatsapp = svcSec?.querySelector("input[name='whatsapp']")?.value || "";
    price = 0;
    stock = 9999;
    oldPrice = null;
    personalPhone = "";

  } else if (isProno) {
    // Pronostics
    const pronoType = f.pronoType?.value || "Les matchs";
    const accessType = f.querySelector("input[name='accessType']:checked")?.value || "free";
    const match1 = f.match1?.value || "";
    const match2 = f.match2?.value || "";
    const match3 = f.match3?.value || "";
    const matchLines = [match1, match2, match3].filter(Boolean).map((m, i) => `⚽ Match ${i+1} : ${m}`).join("\n");
    const descBase = f.description?.value || "";
    desc = `🎯 ${pronoType}\n${matchLines ? matchLines + "\n" : ""}${descBase}`.trim();
    employer = pronoType;
    if (accessType === "paid") {
      price = Number(f.pronoPrice?.value || 0);
      whatsapp = f.pronoWhatsapp?.value || "";
    }
    stock = 9999;

  } else if (isPaid) {
    employer    = f.employer ? f.employer.value : "";
    jobLocation = f.jobLocation ? f.jobLocation.value : "";
    contractType = f.contractType ? f.contractType.value : "";
    salary       = f.salary ? f.salary.value : "";
    deadline     = f.deadline ? f.deadline.value : "";
    const extras = [
      employer     ? `🏢 Entreprise : ${employer}` : "",
      jobLocation  ? `📍 Lieu : ${jobLocation}` : "",
      contractType ? `📄 Contrat : ${contractType}` : "",
      salary       ? `💰 Salaire : ${salary}` : "",
      deadline     ? `⏰ Date limite : ${new Date(deadline).toLocaleDateString("fr-FR")}` : "",
    ].filter(Boolean).join("\n");
    desc = (extras ? extras + "\n\n" : "") + desc;
    const jobSec = f.querySelector(".pf-job");
    price    = Number(jobSec?.querySelector("input[name='price']")?.value || 0);
    whatsapp = jobSec?.querySelector("input[name='whatsapp']")?.value || "";
    stock    = 9999;

  } else {
    const artSec = f.querySelector(".pf-article");
    price         = Number(artSec?.querySelector("input[name='price']")?.value || 0);
    stock         = Number(artSec?.querySelector("input[name='stock']")?.value) || 0;
    whatsapp      = artSec?.querySelector("input[name='whatsapp']")?.value || "";
    oldPrice      = Number(artSec?.querySelector("input[name='oldPrice']")?.value) || null;
    personalPhone = artSec?.querySelector("input[name='personalPhone']")?.value || "";
  }

  const body = {
    ownerId: USER.id, ownerName: USER.name, ownerRole: USER.role,
    title: f.title.value, category: cat,
    city: f.city ? f.city.value : "",
    price, oldPrice, stock, whatsapp, personalPhone,
    image: img, description: desc,
    employer, jobLocation, contractType, salary, deadline,
    expireHours,
  };

  try {
    const r = await fetch("/api/products", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    if (r.ok) {
      f.reset();
      f.querySelectorAll(".img-preview-wrap").forEach(w => { w.style.display = "none"; });
      f.querySelectorAll(".img-preview").forEach(i => { i.src = ""; });
      f.querySelectorAll(".pf-job").forEach(s => { s.style.display = "none"; });
      f.querySelectorAll(".pf-service").forEach(s => { s.style.display = "none"; });
      f.querySelectorAll(".pf-pronos").forEach(s => { s.style.display = "none"; });
      f.querySelectorAll(".pf-pronos-paid").forEach(s => { s.style.display = "none"; });
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
  const cityOptions = CI_CITIES.map(c => `<option value="${c}">${c}</option>`).join("");
  return `
    <div class="form-row">
      <div class="form-group"><label>Titre</label><input name="title" required placeholder="Ex: iPhone 14 Pro  /  Comptable Sénior" /></div>
      <div class="form-group"><label>Catégorie</label><select name="category" required onchange="switchFormForCat(this)">${cats}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>📍 Ville</label>
        <select name="city">
          <option value="">— Sélectionner une ville —</option>
          ${cityOptions}
        </select>
        <div class="form-hint">Ville où se trouve le produit ou service.</div>
      </div>
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

    <!-- SECTION : Services (Emploi / Concours / Annonces / Services / Événements / Actualités) -->
    <div class="pf-section pf-service" style="display:none">
      <div class="service-hint">
        <span>📢 Annonce service — les visiteurs vous contactent directement sur WhatsApp.</span>
      </div>
      <div class="form-row">
        <div class="form-group"><label>N° WhatsApp vendeur</label><input name="whatsapp" placeholder="2250700000000" /></div>
      </div>
      <input type="hidden" name="price" value="0" />
      <input type="hidden" name="oldPrice" value="" />
      <input type="hidden" name="stock" value="9999" />
      <input type="hidden" name="personalPhone" value="" />
    </div>

    <!-- SECTION : Offre Emploi / Concours (accès payant — conservé pour usage futur) -->
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
      <input type="hidden" name="oldPrice" value="" />
      <input type="hidden" name="stock" value="9999" />
      <input type="hidden" name="personalPhone" value="" />
    </div>

    <!-- SECTION : Pronostics -->
    <div class="pf-section pf-pronos" style="display:none">
      <div class="form-row">
        <div class="form-group">
          <label>Type de pronostic</label>
          <select name="pronoType" onchange="onPronoTypeChange(this)">
            <option value="Les matchs">⚽ Les matchs</option>
            <option value="Jeu virtuel">🎮 Jeu virtuel</option>
          </select>
        </div>
      </div>
      <div class="pf-pronos-matches">
        <div class="form-row">
          <div class="form-group"><label>Match 1</label><input name="match1" placeholder="Ex: PSG vs Real Madrid" /></div>
          <div class="form-group"><label>Match 2</label><input name="match2" placeholder="Ex: Barcelone vs Bayern" /></div>
          <div class="form-group"><label>Match 3</label><input name="match3" placeholder="Ex: Arsenal vs Chelsea" /></div>
        </div>
      </div>
      <div class="form-row" style="margin-top:8px">
        <div class="form-group">
          <label>Accès</label>
          <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
            <label style="font-weight:normal;display:flex;gap:6px;align-items:center"><input type="radio" name="accessType" value="free" checked onchange="onAccessTypeChange(this.closest('form'))"> Gratuit</label>
            <label style="font-weight:normal;display:flex;gap:6px;align-items:center"><input type="radio" name="accessType" value="paid" onchange="onAccessTypeChange(this.closest('form'))"> Payant</label>
          </div>
        </div>
      </div>
      <div class="pf-pronos-paid" style="display:none">
        <div class="form-row">
          <div class="form-group"><label>Prix d'accès (FCFA)</label><input name="pronoPrice" type="number" placeholder="Ex: 1000" /></div>
          <div class="form-group"><label>N° WhatsApp pour paiement</label><input name="pronoWhatsapp" placeholder="2250700000000" /></div>
        </div>
      </div>
      <input type="hidden" name="price" value="0" />
      <input type="hidden" name="oldPrice" value="" />
      <input type="hidden" name="stock" value="9999" />
      <input type="hidden" name="whatsapp" value="" />
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
      <label>Description / Détails complets</label>
      <textarea name="description" rows="4" placeholder="Décrivez l'offre, le service ou l'annonce…"></textarea>
    </div>
    <div class="form-group">
      <label>⏱ Expiration de l'annonce</label>
      <select name="expireHours">
        <option value="0">Pas d'expiration</option>
        <option value="1">1 heure</option>
        <option value="6">6 heures</option>
        <option value="12">12 heures</option>
        <option value="24">24 heures</option>
        <option value="48">2 jours</option>
        <option value="72">3 jours</option>
        <option value="168">7 jours</option>
        <option value="336">14 jours</option>
        <option value="720">30 jours</option>
      </select>
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
    // Initialiser le bon formulaire selon la première catégorie sélectionnée
    const initSel = c.querySelector("select[name='category']");
    if (initSel) switchFormForCat(initSel);

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

      <!-- Formulaire ajout direct admin -->
      <div class="section-block" style="margin-bottom:20px;border:1.5px solid #c2185b">
        <h4 style="color:#c2185b;margin-bottom:12px">➕ Ajouter un profil Rencontre (publié immédiatement)</h4>
        <div class="form-row">
          <div class="form-group"><label>Nom *</label><input id="adm_rcNom" placeholder="Nom" /></div>
          <div class="form-group"><label>Prénom *</label><input id="adm_rcPrenom" placeholder="Prénom" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Date de naissance *</label><input id="adm_rcBirth" type="date" max="${new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Sexe *</label>
            <select id="adm_rcSexe">
              <option value="">— Sélectionner —</option>
              <option value="M">M (Homme)</option>
              <option value="F">F (Femme)</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Profession</label><input id="adm_rcProf" placeholder="Ex: Commerçant, Étudiant…" /></div>
          <div class="form-group"><label>Ville</label><input id="adm_rcVille" placeholder="Ex: Abengourou" /></div>
          <div class="form-group"><label>Quartier</label><input id="adm_rcQuartier" placeholder="Ex: Centre" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Type de rencontre</label>
            <select id="adm_rcSouscat">
              <option value="amitie">💙 Amitié</option>
              <option value="serieux">❤️ Relation sérieuse</option>
            </select>
          </div>
          <div class="form-group"><label>Prix d'accès (FCFA)</label><input id="adm_rcPrix" type="number" value="500" min="0" step="100" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>📞 Téléphone</label><input id="adm_rcPhone" placeholder="07 67 20 22 71" type="tel" /></div>
          <div class="form-group"><label>💬 WhatsApp</label><input id="adm_rcWa" placeholder="2250767202271" type="tel" /></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="adm_rcDesc" rows="3" style="width:100%;border:1px solid #ddd;border-radius:6px;padding:8px;font-size:13px;box-sizing:border-box" placeholder="Décrivez le profil…"></textarea></div>
        <button class="btn btn-primary" style="background:linear-gradient(135deg,#e91e8c,#c2185b)" onclick="adminAddRencontre()">❤️ Publier le profil directement</button>
        <span id="adm_rcMsg" style="margin-left:12px;font-size:13px"></span>
      </div>

      ${!all.length ? `<div class="empty-state"><div class="empty-ico">❤️</div><p>Aucun profil reçu.</p></div>`
        : all.map(p => {
          const st = p.approved
            ? `<span class="status-badge status-ok">✓ Approuvé</span>`
            : `<span class="status-badge status-wait">⏳ En attente</span>`;
          const photoHtml = p.photo
            ? `<img src="${p.photo}" onclick="openLightbox('${p.photo.replace(/'/g,"\\'")}','${(p.nom||"").replace(/'/g,"\\'")} ${(p.prenom||"").replace(/'/g,"\\'")}')" class="modal-img-zoom" style="width:64px;height:64px;object-fit:cover;border-radius:50%;border:3px solid #c2185b;flex-shrink:0;cursor:zoom-in" title="Cliquer pour voir la photo en taille réelle 🔍" />`
            : `<div style="width:64px;height:64px;background:#fce4ec;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">❤️</div>`;
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
              ${!p.approved ? `<button class="btn btn-secondary btn-sm" onclick="askApproveRencontre(${p.id},${p.prixAcces||500},'${p.souscat||"amitie"}',${p.photo ? `'${p.photo.replace(/'/g,"\\'")}'` : "null"})">✓ Approuver &amp; définir le prix</button>` : ""}
              <button class="btn btn-danger btn-sm" onclick="deleteRencontre(${p.id})">Supprimer</button>
            </div>
          </div>`;
        }).join("")}`;

  } else if (which === "data") {
    const [stats, dbSize] = await Promise.all([
      fetch("/api/admin/db-stats").then(r => r.json()).catch(() => ({})),
      fetch("/api/admin/db-size").then(r => r.json()).catch(() => null),
    ]);
    const tableLabels = { users:"👥 Utilisateurs", products:"📦 Articles", orders:"🛒 Commandes", settings:"⚙️ Paramètres", rencontres:"❤️ Rencontres", sms_logs:"📱 SMS envoyés" };

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

        <!-- COMPRESSION IMAGES DB -->
        <div class="db-section">
          <div class="db-section-title">🖼️ Compresser les images existantes</div>
          <p class="db-section-desc">Réduit la taille des images déjà enregistrées en base de données (produits + rencontres) à 45 % de qualité JPEG. Opération irréversible.</p>
          <div class="db-actions">
            <button class="btn btn-primary db-btn" onclick="compressDbImages()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              🗜️ Compresser les images DB
            </button>
          </div>
          <div id="dbCompressResult"></div>
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


  } else if (which === "sms") {
    const logs = await fetch("/api/admin/sms-logs?limit=100").then(r => r.json()).catch(() => []);
    c.innerHTML = `
      <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;font-size:17px">📱 Historique SMS envoyés</h3>
          <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">${logs.length} message${logs.length!==1?"s":""} enregistré${logs.length!==1?"s":""}</p>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="adminTab('sms')">🔄 Actualiser</button>
      </div>
      ${!logs.length
        ? `<div class="empty-state"><div class="empty-ico">📭</div><p>Aucun SMS envoyé pour le moment.</p></div>`
        : `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#f5f5f5">
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap">📅 Date</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap">📞 Destinataire</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border)">👤 Vendeur</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border)">📦 Produit</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap">✅ Statut</th>
            </tr></thead>
            <tbody>
              ${logs.map((s,i) => {
                const date = new Date(s.created_at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
                const ok   = s.status === "envoyé";
                const rowBg = i % 2 === 0 ? "#fff" : "#fafafa";
                return `<tr style="background:${rowBg};border-bottom:1px solid var(--border)">
                  <td style="padding:9px 12px;color:var(--muted);font-size:12px;white-space:nowrap">${date}</td>
                  <td style="padding:9px 12px;font-weight:600">${s.recipient_phone||"—"}</td>
                  <td style="padding:9px 12px">${s.vendor_name||"—"}</td>
                  <td style="padding:9px 12px;color:var(--muted);font-size:12px">${(s.product_name||"—").slice(0,60)}</td>
                  <td style="padding:9px 12px">
                    <span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${ok?"#e8f5e9":"#ffebee"};color:${ok?"#2e7d32":"#c62828"}">
                      ${ok?"✅ Envoyé":"❌ Échec"}
                    </span>
                    ${!ok && s.error_detail ? `<div style="font-size:11px;color:#999;margin-top:3px">${s.error_detail.slice(0,80)}</div>` : ""}
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table></div>`}`;

  } else if (which === "settings") {
    const s = await (await fetch("/api/settings")).json();
    const sm = s.sms || {};
    c.innerHTML = `
      <div class="sms-settings-wrap">
        <!-- SECTION 0: Configuration des catégories -->
        <div class="settings-section">
          <div class="settings-section-title">🗂️ Catégories (Accès gratuit / payant)</div>
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

        <!-- SECTION 0b: Services (paid/free + expiration configurable) -->
        <div class="settings-section">
          <div class="settings-section-title" style="background:linear-gradient(135deg,#1565c0,#283593)">🛠️ Services (Emploi · Concours · etc.)</div>
          <p class="form-hint" style="margin-bottom:14px">Ces catégories peuvent être gratuites (WhatsApp direct) ou payantes (accès via paiement). Si payant, entrez le prix en FCFA.</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${CONFIG_SERVICE_CATS.map(([slug, icon, label]) => {
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

        <!-- SECTION IKODDI: Configuration SMS -->
        <div class="settings-section">
          <div class="settings-section-title" style="background:linear-gradient(135deg,#1b5e20,#2e7d32)">📱 IKODDI SMS — Notifications vendeurs</div>
          <p class="form-hint" style="margin-bottom:14px">Quand un client clique sur <strong>Commander / Payer</strong>, un SMS est automatiquement envoyé au vendeur via l'API IKODDI. Remplissez les champs ci-dessous pour activer cette fonction.</p>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" id="setIkoddiEnabled" ${s.ikoddiEnabled !== false ? "checked" : ""} style="width:16px;height:16px" />
              Activer les notifications SMS IKODDI
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>🔑 Clé API IKODDI</label>
            <input id="setIkoddiKey" value="${s.ikoddiApiKey || "cGw3ZOF3K3bztjlYx5tAT52A5GpHaCF9"}" placeholder="cGw3ZOF3K3bztjlYx5tAT52A5GpHaCF9" />
            <div class="form-hint">Clé API fournie dans votre tableau de bord <a href="https://app.ikoddi.com" target="_blank">app.ikoddi.com</a>.</div>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>🏢 IKODDI Organization ID (Group ID)</label>
            <input id="setIkoddiGroup" value="${s.ikoddiGroupId || "10001958"}" placeholder="10001958" />
            <div class="form-hint">Votre identifiant d'organisation IKODDI — visible dans <strong>app.ikoddi.com → Organisation → Détails</strong>. Obligatoire pour l'envoi SMS.</div>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>✏️ Sender ID (expéditeur SMS, max 11 car.)</label>
            <input id="setIkoddiSender" value="${s.ikoddiSenderId || "Ikoddi"}" placeholder="Ikoddi" maxlength="11" />
            <div class="form-hint">Nom affiché sur le téléphone du vendeur. Doit être alphanumérique, commencer et finir par une lettre ou un chiffre. <strong>Laissez "Ikoddi"</strong> si vous n'avez pas de Sender ID approuvé par KREEZUS — sinon le SMS sera rejeté (erreur 400).</div>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>📤 Test SMS (numéro de test)</label>
            <div style="display:flex;gap:8px">
              <input id="smsTestNum" placeholder="+2250700000000" style="flex:1" />
              <button class="btn btn-primary" onclick="testSMS()" style="white-space:nowrap">📤 Tester</button>
            </div>
            <div class="form-hint">Entrez n'importe quel numéro international (ex : 2250700000000, 2290195501564…) — le pays est détecté automatiquement.</div>
          </div>
        </div>

        <!-- SECTION CABINE: Lien de paiement Cabine en Ligne -->
        <div class="settings-section">
          <div class="settings-section-title" style="background:linear-gradient(135deg,#1a237e,#0d47a1)">📲 Cabine en Ligne — Lien de paiement</div>
          <p class="form-hint" style="margin-bottom:14px">Ce lien est affiché au client quand il clique sur <strong>PAYER</strong> dans la Cabine en Ligne. Seul l'administrateur peut le modifier.</p>
          <div class="form-group">
            <label>Lien de paiement (Wave, Orange Money, etc.)</label>
            <input id="setCabineLink" value="${s.cabinePaymentLink || "https://pay.wave.com/m/M_ci_CRgdcq5dsx3B/c/ci/"}" placeholder="https://pay.wave.com/..." />
            <div class="form-hint">Ex : https://pay.wave.com/m/… — modifiable à tout moment.</div>
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

        <!-- SECTION IA: Clé API IA -->
        <div class="settings-section">
          <div class="settings-section-title" style="background:linear-gradient(135deg,#4a148c,#7b1fa2)">🤖 Assistante IA — Configuration</div>
          <p class="form-hint" style="margin-bottom:14px">L'assistante utilise <strong>Groq</strong> (clé configurée sur le serveur) en priorité. Si le quota Groq est expiré, renseignez une clé de secours compatible OpenAI ci-dessous et cliquez <strong>Enregistrer la clé IA</strong>.</p>
          <div class="form-group">
            <label>🔑 Clé API</label>
            <input id="setAiKey" value="${s.aiApiKey || ""}" placeholder="gsk_... (Groq) ou fe_oa_... (Featherless)" style="font-family:monospace" oninput="autoFillAiFields(this.value)" />
            <div id="aiKeyBadge" style="margin-top:6px;font-size:12px;font-weight:600"></div>
            <div class="form-hint">La clé est détectée automatiquement — l'endpoint et le modèle se remplissent seuls.</div>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>🌐 Endpoint API <small style="font-weight:normal;color:var(--muted)">(rempli automatiquement)</small></label>
            <input id="setAiEndpoint" value="${s.aiEndpoint || ""}" placeholder="Rempli automatiquement selon la clé" style="color:var(--muted)" />
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>🤖 Modèle IA <small style="font-weight:normal;color:var(--muted)">(rempli automatiquement)</small></label>
            <input id="setAiModel" value="${s.aiModel || ""}" placeholder="Rempli automatiquement selon la clé" style="color:var(--muted)" />
          </div>
          <div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);min-width:200px" onclick="saveAiKey()">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Enregistrer la clé IA
            </button>
            <span id="aiKeyMsg" style="font-size:13px"></span>
          </div>
        </div>

        <!-- SECTION IA: Cerveau -->
        <div class="settings-section">
          <div class="settings-section-title" style="background:linear-gradient(135deg,#4a148c,#7b1fa2)">🧠 Cerveau IA — Questions / Réponses exactes</div>
          <p class="form-hint" style="margin-bottom:14px">Ajoutez des paires question/réponse. Quand un client pose une question qui correspond, l'assistante répond <strong>exactement</strong> avec votre réponse.</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
            <div class="form-group">
              <label>Question</label>
              <input id="brainQuestion" placeholder="Ex : Quels sont vos horaires ?" />
            </div>
            <div class="form-group">
              <label>Réponse exacte</label>
              <textarea id="brainAnswer" rows="3" placeholder="Ex : Nous sommes ouverts du lundi au samedi de 08h à 18h." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:var(--radius);font-size:14px;resize:vertical"></textarea>
            </div>
            <button class="btn btn-primary" style="align-self:flex-start" onclick="saveBrainEntry()">
              💾 Enregistrer dans le cerveau
            </button>
          </div>
          <div id="brainList"><div style="color:var(--muted);font-size:13px">Chargement…</div></div>
        </div>

        <!-- SECTION 3: Save -->
        <div class="settings-section">
          <div class="settings-section-title">💾 Enregistrer les paramètres</div>
          <button class="btn btn-primary" style="min-width:200px" onclick="saveSettings()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Enregistrer les paramètres
          </button>
          <div id="settingsMsg" style="margin-top:12px"></div>
        </div>
      </div>`;
    // Charger le cerveau IA
    loadBrainList();
  }
}

function toggleSmsFields() {
  const enabled = document.getElementById("smsEnabled").checked;
  const wrap = document.getElementById("smsFieldsWrap");
  if (wrap) { wrap.style.opacity = enabled ? "1" : ".45"; wrap.style.pointerEvents = enabled ? "" : "none"; }
}

function importDbFileObj(file) {
  const res = document.getElementById("dbImportResult");
  if (!file) return;
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
  const endpoint = isExcel ? "/api/admin/import/excel" : "/api/admin/import/json";
  const sizeMb   = (file.size / 1024 / 1024).toFixed(1);

  res.innerHTML = `
    <div class="db-import-progress">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span>⬆️ Envoi du fichier (${sizeMb} Mo)…</span>
        <span id="dbImportPct" style="font-weight:700">0 %</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="dbImportBar" style="width:0%;background:#1565c0;transition:width .15s linear"></div>
      </div>
      <div id="dbImportStatus" style="font-size:12px;color:var(--muted);margin-top:6px">Préparation…</div>
    </div>`;

  const fd = new FormData();
  fd.append("file", file);
  const xhr = new XMLHttpRequest();

  xhr.upload.onprogress = e => {
    if (!e.lengthComputable) return;
    const pct = Math.round(e.loaded / e.total * 100);
    const bar = document.getElementById("dbImportBar");
    const lbl = document.getElementById("dbImportPct");
    const sta = document.getElementById("dbImportStatus");
    if (bar) bar.style.width = pct + "%";
    if (lbl) lbl.textContent = pct + " %";
    if (sta) sta.textContent = pct < 100 ? `Envoi : ${pct} %` : "Fichier reçu — traitement en cours…";
    if (pct === 100 && bar) { bar.style.background = "#F57C00"; }
  };

  xhr.onload = () => {
    const bar = document.getElementById("dbImportBar");
    let d;
    try { d = JSON.parse(xhr.responseText); } catch {
      if (bar) { bar.style.width = "100%"; bar.style.background = "#c62828"; }
      res.innerHTML = `<div class="db-import-err">❌ Erreur serveur inattendue (code ${xhr.status})</div>`;
      toast("Erreur lors de l'import", "red");
      return;
    }
    if (d.error) {
      if (bar) { bar.style.width = "100%"; bar.style.background = "#c62828"; }
      res.innerHTML = `<div class="db-import-err">❌ Erreur : ${d.error}</div>`;
      toast("Erreur lors de l'import", "red");
      return;
    }
    if (bar) { bar.style.width = "100%"; bar.style.background = "#43a047"; }
    const lignes = Object.entries(d.imported || {}).map(([t,n]) => `<li><strong>${t}</strong> : ${n} entrée(s) traitée(s)</li>`).join("");
    res.innerHTML = `<div class="db-import-ok">✅ Import ${isExcel ? "Excel" : "JSON"} réussi !<ul>${lignes}</ul></div>`;
    toast("Import terminé ✓", "green");
  };

  xhr.onerror = () => {
    res.innerHTML = `<div class="db-import-err">❌ Erreur réseau — vérifiez votre connexion</div>`;
    toast("Erreur réseau", "red");
  };

  xhr.open("POST", endpoint);
  xhr.send(fd);
}
function importDbFile(input) { if (input.files[0]) importDbFileObj(input.files[0]); }

async function compressDbImages() {
  const res = document.getElementById("dbCompressResult");
  if (!res) return;
  res.innerHTML = `
    <div class="db-import-progress" style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span>⏳ Compression en cours…</span>
        <span id="compressPct" style="font-weight:700">0 %</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="compressBar" style="width:5%;background:#1565c0;transition:width .3s linear"></div>
      </div>
    </div>`;
  // Barre de progression simulée pendant le traitement serveur
  let pct = 5;
  const iv = setInterval(() => {
    pct = Math.min(pct + 3, 90);
    const b = document.getElementById("compressBar");
    const l = document.getElementById("compressPct");
    if (b) b.style.width = pct + "%";
    if (l) l.textContent = pct + " %";
  }, 500);
  try {
    const r = await fetch("/api/admin/compress-images", { method: "POST" });
    const d = await r.json();
    clearInterval(iv);
    const bar = document.getElementById("compressBar");
    if (bar) { bar.style.width = "100%"; bar.style.background = d.ok ? "#43a047" : "#c62828"; }
    if (d.ok) {
      res.innerHTML = `<div class="db-import-ok" style="margin-top:12px">
        ✅ Compression terminée !<br>
        <ul style="margin-top:8px;padding-left:18px">
          <li><strong>${d.total}</strong> image(s) analysée(s)</li>
          <li><strong>${d.compressed}</strong> compressée(s) avec succès</li>
          <li><strong>${d.skipped}</strong> déjà optimisée(s) (ignorées)</li>
          ${d.errors > 0 ? `<li style="color:#c62828"><strong>${d.errors}</strong> erreur(s)</li>` : ""}
        </ul>
      </div>`;
      toast("Compression terminée ✓", "green");
    } else {
      res.innerHTML = `<div class="db-import-err" style="margin-top:12px">❌ Erreur : ${d.error}</div>`;
    }
  } catch (e) {
    clearInterval(iv);
    res.innerHTML = `<div class="db-import-err" style="margin-top:12px">❌ Erreur réseau : ${e.message}</div>`;
  }
}

function askApproveRencontre(id, prixCurrent, souscat, photoSrc) {
  const photoHtml = photoSrc
    ? `<div style="text-align:center;margin-bottom:16px">
        <img src="${photoSrc}" onclick="openLightbox('${photoSrc.replace(/'/g,"\\'")}','Photo du profil')" class="modal-img-zoom" style="max-width:100%;max-height:260px;object-fit:contain;border-radius:var(--radius);cursor:zoom-in;border:2px solid #c2185b" title="Cliquer pour voir en taille réelle 🔍" />
        <div style="font-size:11px;color:var(--muted);margin-top:4px">🔍 Cliquer sur la photo pour l'agrandir</div>
      </div>`
    : `<div style="text-align:center;padding:20px;background:#fce4ec;border-radius:var(--radius);margin-bottom:16px;font-size:32px">❤️<br><span style="font-size:12px;color:#c2185b">Aucune photo fournie</span></div>`;
  modalHTML(`
    <h2>✓ Approuver le profil <button class="modal-close" onclick="closeModal()">✕</button></h2>
    ${photoHtml}
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

async function adminAddRencontre() {
  const nom = document.getElementById("adm_rcNom")?.value.trim();
  const prenom = document.getElementById("adm_rcPrenom")?.value.trim();
  const birthdate = document.getElementById("adm_rcBirth")?.value;
  const sexe = document.getElementById("adm_rcSexe")?.value;
  const msg = document.getElementById("adm_rcMsg");
  if (!nom || !prenom || !birthdate || !sexe) {
    if (msg) { msg.style.color="red"; msg.textContent="Remplissez les champs obligatoires (nom, prénom, date, sexe)"; }
    return toast("Champs obligatoires manquants","red");
  }
  const body = {
    nom, prenom, birthdate, sexe,
    profession: document.getElementById("adm_rcProf")?.value.trim()||"",
    ville: document.getElementById("adm_rcVille")?.value.trim()||"",
    quartier: document.getElementById("adm_rcQuartier")?.value.trim()||"",
    souscat: document.getElementById("adm_rcSouscat")?.value||"amitie",
    prixAcces: Number(document.getElementById("adm_rcPrix")?.value)||500,
    phone: document.getElementById("adm_rcPhone")?.value.trim()||"",
    whatsapp: (document.getElementById("adm_rcWa")?.value.trim()||"").replace(/\D/g,""),
    description: document.getElementById("adm_rcDesc")?.value.trim()||"",
    autoApprove: true,
  };
  try {
    const r = await fetch("/api/rencontres",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d = await r.json();
    if (d.ok) {
      toast("Profil publié directement ✓","green");
      adminTab("rencontres");
    } else {
      if (msg) { msg.style.color="red"; msg.textContent="Erreur : "+(d.error||""); }
      toast("Erreur lors de l'ajout","red");
    }
  } catch { toast("Erreur réseau","red"); }
}
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


// Auto-détecte le type de clé et remplit endpoint + modèle
function autoFillAiFields(keyVal) {
  const key = (keyVal || "").trim();
  const ep  = document.getElementById("setAiEndpoint");
  const mdl = document.getElementById("setAiModel");
  const badge = document.getElementById("aiKeyBadge");
  if (!ep || !mdl) return;
  if (key.startsWith("gsk_")) {
    ep.value  = "https://api.groq.com/openai/v1/chat/completions";
    mdl.value = "llama-3.3-70b-versatile";
    if (badge) badge.innerHTML = '<span style="color:#7b1fa2">⚡ Groq détecté — endpoint et modèle mis à jour automatiquement</span>';
  } else if (key.startsWith("fe_oa_")) {
    ep.value  = "https://api.featherless.ai/v1/chat/completions";
    mdl.value = "meta-llama/Meta-Llama-3.1-8B-Instruct";
    if (badge) badge.innerHTML = '<span style="color:#1565c0">🔵 Featherless détecté — endpoint et modèle mis à jour automatiquement</span>';
  } else if (!key) {
    if (badge) badge.innerHTML = '<span style="color:var(--muted)">Clé par défaut active (Featherless intégré)</span>';
  } else {
    if (badge) badge.innerHTML = '<span style="color:var(--muted)">Clé personnalisée — vérifiez l\'endpoint manuellement</span>';
  }
}

async function saveAiKey() {
  const key = document.getElementById("setAiKey")?.value?.trim() || "";
  // Forcer les bons endpoint/modèle selon le type de clé avant envoi
  autoFillAiFields(key);
  const endpoint = document.getElementById("setAiEndpoint")?.value?.trim() || "";
  const model    = document.getElementById("setAiModel")?.value?.trim()    || "";
  const msgEl    = document.getElementById("aiKeyMsg");

  if (msgEl) { msgEl.innerHTML = "<span style='color:var(--muted)'>💾 Enregistrement…</span>"; }

  try {
    // 1. Sauvegarder la clé
    const resp = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiApiKey: key, aiEndpoint: endpoint, aiModel: model })
    });
    const d = await resp.json();
    if (!resp.ok || d.error) throw new Error(d.error || `HTTP ${resp.status}`);

    // 2. Tester la clé si fournie
    if (key) {
      if (msgEl) { msgEl.innerHTML = "<span style='color:var(--muted)'>🔍 Vérification de la clé…</span>"; }
      try {
        const testResp = await fetch("/api/ai/test-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key, endpoint, model })
        });
        const testData = await testResp.json();
        if (testData.ok) {
          if (msgEl) { msgEl.innerHTML = `<span style='color:var(--secondary)'>✅ Clé valide — modèle : <strong>${testData.model}</strong></span>`; }
          toast("Clé IA valide et enregistrée ✓", "green");
        } else {
          if (msgEl) { msgEl.innerHTML = `<span style='color:#e65100'>⚠️ Clé enregistrée mais : <strong>${testData.error}</strong></span>`; }
          toast("Clé enregistrée — mais erreur : " + testData.error, "red");
        }
      } catch {
        if (msgEl) { msgEl.innerHTML = "<span style='color:var(--secondary)'>✓ Clé enregistrée (test réseau impossible)</span>"; }
      }
    } else {
      if (msgEl) { msgEl.innerHTML = "<span style='color:var(--secondary)'>✓ Paramètres IA enregistrés (clé par défaut active)</span>"; }
      toast("Paramètres IA enregistrés ✓", "green");
    }
    setTimeout(() => { if (msgEl) msgEl.innerHTML = ""; }, 6000);
  } catch (e) {
    if (msgEl) { msgEl.innerHTML = `<span style='color:var(--danger)'>✗ Échec : ${e.message}</span>`; }
    toast("Erreur lors de la sauvegarde", "red");
  }
}

async function saveSettings() {
  const waRaw = document.getElementById("setWhatsapp")?.value || "";
  const categoryConfig = {};
  for (const [slug] of [...CONFIG_CATS, ...CONFIG_SERVICE_CATS]) {
    const sel = document.getElementById(`catCfg_${slug}`);
    const inp = document.getElementById(`catPrice_${slug}`);
    if (sel) categoryConfig[slug] = { access: sel.value, price: inp ? Number(inp.value)||0 : 0 };
  }
  const body = {
    companyName:        document.getElementById("setCompany")?.value,
    companyPhone:       document.getElementById("setPhone")?.value,
    companyEmail:       document.getElementById("setEmail")?.value,
    companyWebsite:     document.getElementById("setWebsite")?.value,
    companyWhatsapp:    waRaw.replace(/\D/g, ""),
    categoryConfig,
    cabinePaymentLink:  document.getElementById("setCabineLink")?.value || "",
    ikoddiApiKey:       document.getElementById("setIkoddiKey")?.value || "",
    ikoddiGroupId:      document.getElementById("setIkoddiGroup")?.value || "10001958",
    ikoddiEnabled:      document.getElementById("setIkoddiEnabled")?.checked ?? true,
    ikoddiSenderId:     document.getElementById("setIkoddiSender")?.value || "Ikoddi",
    aiApiKey:           document.getElementById("setAiKey")?.value || "",
    aiEndpoint:         document.getElementById("setAiEndpoint")?.value || "",
    aiModel:            document.getElementById("setAiModel")?.value || "",
  };
  const msg = document.getElementById("settingsMsg");
  try {
    const resp = await fetch("/api/settings", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await resp.json();
    if (!resp.ok || d.error) throw new Error(d.error || `HTTP ${resp.status}`);
    // Mettre à jour les variables en mémoire
    if (body.companyWhatsapp) RENCONTRES_WA = body.companyWhatsapp;
    if (body.cabinePaymentLink) CABINE_PAYMENT_LINK = body.cabinePaymentLink;
    if (body.companyPhone) { const el = document.getElementById("footerPhone"); if(el) el.textContent = body.companyPhone; const eh = document.getElementById("headerPhone"); if(eh) eh.textContent = body.companyPhone; }
    if (body.companyEmail) { const el = document.getElementById("footerEmail"); if(el) el.textContent = body.companyEmail; }
    if (msg) { msg.className = "sms-result ok"; msg.textContent = "✓ Paramètres enregistrés avec succès."; }
    toast("Paramètres enregistrés ✓","green");
  } catch(e) {
    if (msg) { msg.className = "sms-result err"; msg.textContent = `✗ Échec de la sauvegarde : ${e.message}`; }
    toast("Erreur lors de la sauvegarde","red");
  }
}

async function testSMS() {
  const to = document.getElementById("smsTestNum").value.trim();
  if (!to) return toast("Entrez un numéro de test","red");
  const btn = event.target; btn.disabled = true; btn.textContent = "Envoi en cours…";
  // Envoie les valeurs actuelles du formulaire — pas besoin de sauvegarder avant de tester
  const payload = {
    to,
    ikoddiEnabled:  document.getElementById("setIkoddiEnabled")?.checked ?? true,
    ikoddiApiKey:   document.getElementById("setIkoddiKey")?.value   || "",
    ikoddiGroupId:  document.getElementById("setIkoddiGroup")?.value || "",
    ikoddiSenderId: document.getElementById("setIkoddiSender")?.value || "Ikoddi",
  };
  const r = await (await fetch("/api/settings/sms-test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})).json();
  btn.disabled = false; btn.textContent = "📤 Tester";
  const REASONS = {
    ikoddi_api_key_missing:   "Clé API manquante — remplissez le champ Clé API IKODDI.",
    ikoddi_group_id_missing:  "Organization ID manquant — remplissez le champ Organization ID (ex : 10001958).",
    no_phone:                 "Numéro de téléphone invalide ou vide.",
  };
  const msg = document.getElementById("settingsMsg");
  if (msg) {
    msg.className = r.ok ? "sms-result ok" : "sms-result err";
    const detail = r.ikoddiResponse ? ` — Réponse IKODDI : ${JSON.stringify(r.ikoddiResponse)}` : "";
    msg.textContent = r.ok
      ? `✓ SMS envoyé avec succès vers ${to} (pays : ${r.country || "?"})`
      : `✗ Échec HTTP ${r.ikoddiStatus || ""} : ${REASONS[r.reason] || r.error || "Erreur inconnue."}${detail}`;
  }
}

// ============ CERVEAU IA — ADMIN ============
async function loadBrainList() {
  const el = document.getElementById("brainList");
  if (!el) return;
  const entries = await fetch("/api/ai/brain").then(r => r.json()).catch(() => []);
  if (!entries.length) {
    el.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:10px 0">Aucune entrée dans le cerveau IA. Ajoutez des questions/réponses ci-dessus.</div>`;
    return;
  }
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px">
    ${entries.map(e => `
      <div style="background:#f9f0ff;border:1px solid #ce93d8;border-radius:8px;padding:12px;display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#6a1b9a;margin-bottom:4px">❓ ${e.question}</div>
          <div style="font-size:13px;color:#333;white-space:pre-wrap">💬 ${e.answer}</div>
        </div>
        <button onclick="deleteBrainEntry(${e.id})" style="background:none;border:none;color:#c62828;font-size:18px;cursor:pointer;flex-shrink:0;padding:0 4px" title="Supprimer">🗑</button>
      </div>`).join("")}
  </div>`;
}

async function saveBrainEntry() {
  const question = document.getElementById("brainQuestion")?.value?.trim();
  const answer   = document.getElementById("brainAnswer")?.value?.trim();
  if (!question || !answer) return toast("Remplissez la question et la réponse", "red");
  const r = await fetch("/api/ai/brain", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ question, answer }) });
  if (!r.ok) return toast("Erreur lors de l'enregistrement", "red");
  document.getElementById("brainQuestion").value = "";
  document.getElementById("brainAnswer").value = "";
  toast("✓ Entrée enregistrée dans le cerveau IA", "green");
  loadBrainList();
}

async function deleteBrainEntry(id) {
  if (!confirm("Supprimer cette entrée du cerveau IA ?")) return;
  await fetch("/api/ai/brain/delete", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
  toast("Entrée supprimée");
  loadBrainList();
}

// ============ ASSISTANTE IA — CLIENT ============
let _assistantOpen = false;
let _assistantHistory = [];

function toggleAssistant() {
  const win = document.getElementById("assistantWindow");
  if (!win) return;
  _assistantOpen = !_assistantOpen;
  win.style.display = _assistantOpen ? "flex" : "none";
  if (_assistantOpen && _assistantHistory.length === 0) {
    _assistantAddMsg("assistant", "Bienvenue dans la boutique ABENGOUROU-MARKET ! 🛍️\nJe suis votre assistante virtuelle. Que puis-je faire pour vous aujourd'hui ? Vous cherchez un produit, un service, un logement, un emploi…\nJe suis là pour vous aider ! 😊");
    document.getElementById("assistantInput")?.focus();
  }
}

function _assistantAddMsg(role, text) {
  _assistantHistory.push({ role, text });
  const msgs = document.getElementById("assistantMessages");
  if (!msgs) return;
  const div = document.createElement("div");
  div.className = "asst-msg asst-msg-" + role;
  div.innerHTML = `<div class="asst-bubble">${text.replace(/\n/g, "<br>")}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendAssistantMsg() {
  const inp = document.getElementById("assistantInput");
  const msg = inp?.value?.trim();
  if (!msg) return;
  inp.value = "";
  _assistantAddMsg("user", msg);

  const typing = document.createElement("div");
  typing.className = "asst-msg asst-msg-assistant asst-typing";
  typing.innerHTML = `<div class="asst-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  document.getElementById("assistantMessages").appendChild(typing);
  document.getElementById("assistantMessages").scrollTop = 99999;

  try {
    const r = await fetch("/api/ai/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ message: msg }) });
    let d;
    try { d = await r.json(); } catch { d = null; }
    typing.remove();
    if (d && d.reply) { _assistantAddMsg("assistant", d.reply); return; }
    // Réponse inattendue du serveur → fallback local
    throw new Error("no reply");
  } catch {
    typing.remove();
    // Fallback local si le serveur est injoignable ou renvoie une erreur
    const lc = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let localReply;
    if (/bonjour|bonsoir|salut|hello|hi|coucou|hey/.test(lc))
      localReply = "Bonjour ! 😊 Je suis l'assistante d'ABENGOUROU-MARKET. Comment puis-je vous aider ?";
    else if (/heure|horaire|ouvert|ferme/.test(lc))
      localReply = "Nous sommes ouverts du lundi au samedi de 08h à 18h. 🕐";
    else if (/contact|appel|telephone|numero|joindre/.test(lc))
      localReply = "Contactez-nous au +225 0767202271 ou par email : contact@abengourou-market.com 📞";
    else if (/paiement|payer|wave|orange|momo|livraison/.test(lc))
      localReply = "Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money et le paiement à la livraison. 💳";
    else if (/produit|article|categorie|vend|achet|trouv/.test(lc))
      localReply = "Nous proposons : Immobilier, Véhicules, Téléphones, Mode, Restaurants, Emploi, Transport et bien plus ! Explorez les catégories. 🛍️";
    else
      localReply = "Je rencontre un problème de connexion. Contactez-nous au +225 0767202271 ou réessayez dans un moment. 😊";
    _assistantAddMsg("assistant", localReply);
  }
}

function assistantKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAssistantMsg(); }
}

function initAssistant() {
  const fab = document.getElementById("assistantFab");
  const win = document.getElementById("assistantWindow");
  if (!fab || !win) return;
  fab.onclick = toggleAssistant;
  document.getElementById("assistantSend")?.addEventListener("click", sendAssistantMsg);
  document.getElementById("assistantClose")?.addEventListener("click", () => { _assistantOpen = false; win.style.display = "none"; });
  document.getElementById("assistantInput")?.addEventListener("keydown", assistantKeydown);
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
initAssistant();
