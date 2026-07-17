/**
 * ABENGOUROU-MARKET - serveur Express + PostgreSQL (Render.com)
 */
const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const XLSX = require("xlsx");
const multer = require("multer");
const { Ikoddi } = require("ikoddi-client-sdk");
const sharp = require("sharp");


const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_ID  = "buzz";
const ADMIN_PWD = "arrow";

const dbUrl = process.env.DATABASE_URL ||
  "postgresql://basse_wuwe_user:FY7K4NQkqJssyTDWfhONQ7GOAFMscWOU@dpg-d93t0e8js32c73d4ivs0-a/basse_wuwe";

const isLocalDB = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDB ? false : { rejectUnauthorized: false },
});

// ─── Cache paramètres (5 min) ─────────────────────────────────────────────────
let _settingsCache = null;
let _settingsCacheTime = 0;
const SETTINGS_CACHE_TTL = 300000;
function clearSettingsCache() { _settingsCache = null; _settingsCacheTime = 0; }

// ─── Création des tables au démarrage ───────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id               TEXT PRIMARY KEY,
      pwd              TEXT NOT NULL,
      name             TEXT NOT NULL,
      phone            TEXT DEFAULT '',
      role             TEXT DEFAULT 'vendeur',
      approved         BOOLEAN DEFAULT FALSE,
      subscription_until TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id               BIGINT PRIMARY KEY,
      title            TEXT NOT NULL,
      category         TEXT NOT NULL,
      price            NUMERIC DEFAULT 0,
      old_price        NUMERIC,
      stock            INT DEFAULT 0,
      stock_init       INT DEFAULT 0,
      image            TEXT,
      description      TEXT DEFAULT '',
      whatsapp         TEXT DEFAULT '',
      personal_phone   TEXT DEFAULT '',
      owner_id         TEXT NOT NULL,
      owner_name       TEXT DEFAULT '',
      owner_role       TEXT DEFAULT 'vendeur',
      approved         BOOLEAN DEFAULT FALSE,
      blocked          BOOLEAN DEFAULT FALSE,
      employer         TEXT DEFAULT '',
      job_location     TEXT DEFAULT '',
      contract_type    TEXT DEFAULT '',
      salary           TEXT DEFAULT '',
      deadline         TEXT DEFAULT '',
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               BIGINT PRIMARY KEY,
      order_no         TEXT NOT NULL,
      client_name      TEXT DEFAULT '',
      client_phone     TEXT DEFAULT '',
      delivery         TEXT DEFAULT '',
      items            JSONB DEFAULT '[]',
      total            NUMERIC DEFAULT 0,
      pay_method       TEXT DEFAULT '',
      pay_num          TEXT DEFAULT '',
      sms_results      JSONB DEFAULT '[]',
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      id                  INT PRIMARY KEY DEFAULT 1,
      company_name        TEXT DEFAULT 'ABENGOUROU-MARKET',
      subscription_price  NUMERIC DEFAULT 5000,
      sms_config          JSONB DEFAULT '{}'
    );
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_phone TEXT DEFAULT '+225 0767202271';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_email TEXT DEFAULT 'contact@abengourou-market.com';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_website TEXT DEFAULT '';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_whatsapp TEXT DEFAULT '2250767202271';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_config JSONB DEFAULT '{}';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS cabine_payment_link TEXT DEFAULT 'https://pay.wave.com/m/M_ci_CRgdcq5dsx3B/c/ci/';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ikoddi_api_key TEXT DEFAULT 'cGw3ZOF3K3bztjlYx5tAT52A5GpHaCF9';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ikoddi_group_id TEXT DEFAULT '';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ikoddi_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ikoddi_sender_id TEXT DEFAULT 'Ikoddi';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_api_key TEXT DEFAULT 'fe_oa_4cc277c7f7c355dd0b1ad9b2d0276569663ab9508a28cd84';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_endpoint TEXT DEFAULT 'https://api.featherless.ai/v1/chat/completions';
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'meta-llama/Meta-Llama-3.1-8B-Instruct';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_signed BOOLEAN DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS ai_brain (
      id         BIGSERIAL PRIMARY KEY,
      question   TEXT NOT NULL,
      answer     TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rencontres (
      id               BIGINT PRIMARY KEY,
      nom              TEXT NOT NULL,
      prenom           TEXT NOT NULL,
      birthdate        TEXT NOT NULL,
      profession       TEXT DEFAULT '',
      ville            TEXT DEFAULT '',
      quartier         TEXT DEFAULT '',
      sexe             TEXT DEFAULT '',
      whatsapp         TEXT DEFAULT '',
      phone            TEXT DEFAULT '',
      photo            TEXT,
      description      TEXT DEFAULT '',
      sous_cat         TEXT DEFAULT 'amitie',
      prix_acces       NUMERIC DEFAULT 500,
      approved         BOOLEAN DEFAULT FALSE,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE products ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
    ALTER TABLE rencontres ADD COLUMN IF NOT EXISTS video TEXT;
    ALTER TABLE rencontres ADD COLUMN IF NOT EXISTS video_viewed_at TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_city       ON products(city);
    CREATE INDEX IF NOT EXISTS idx_products_owner      ON products(owner_id);
    CREATE INDEX IF NOT EXISTS idx_products_approved   ON products(approved, blocked);
    CREATE INDEX IF NOT EXISTS idx_products_created    ON products(created_at DESC);

    CREATE TABLE IF NOT EXISTS sms_logs (
      id               BIGSERIAL PRIMARY KEY,
      recipient_phone  TEXT NOT NULL DEFAULT '',
      vendor_name      TEXT DEFAULT '',
      product_name     TEXT DEFAULT '',
      message          TEXT DEFAULT '',
      status           TEXT DEFAULT 'unknown',
      error_detail     TEXT DEFAULT '',
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pharmacies_garde (
      city    TEXT PRIMARY KEY,
      name    TEXT NOT NULL,
      address TEXT DEFAULT '',
      phone   TEXT DEFAULT '',
      note    TEXT DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO settings (id, company_name, subscription_price, sms_config)
    VALUES (1, 'ABENGOUROU-MARKET.CI', 5000,
      '{"enabled":false,"method":"POST","url":"","contentType":"application/json","headers":"","bodyTemplate":"","sender":"ABGMARKET","apiKey":""}')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log("✅ Tables PostgreSQL prêtes");
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function vendorActive(u) {
  if (!u) return false;
  if (u.role === "admin") return true;
  return u.approved === true;
}

function rowToUser(r) {
  return {
    id: r.id,
    pwd: r.pwd,
    name: r.name,
    phone: r.phone,
    role: r.role,
    approved: r.approved,
    subscription_until: r.subscription_until,
    subscriptionUntil: r.subscription_until,
    active: vendorActive(r),
  };
}

function rowToProduct(r) {
  return {
    id: Number(r.id),
    title: r.title,
    category: r.category,
    city: r.city || "",
    price: Number(r.price),
    oldPrice: r.old_price ? Number(r.old_price) : null,
    stock: r.stock,
    stockInit: r.stock_init,
    image: r.image || null,
    description: r.description || "",
    whatsapp: r.whatsapp || "",
    personalPhone: r.personal_phone || "",
    ownerId: r.owner_id,
    ownerName: r.owner_name,
    ownerRole: r.owner_role,
    approved: r.approved,
    blocked: r.blocked,
    employer: r.employer || "",
    jobLocation: r.job_location || "",
    contractType: r.contract_type || "",
    salary: r.salary || "",
    deadline: r.deadline || "",
    expiresAt: r.expires_at || null,
    createdAt: r.created_at,
  };
}

function rowToOrder(r) {
  return {
    id: Number(r.id),
    orderNo: r.order_no,
    name: r.client_name,
    phone: r.client_phone,
    delivery: r.delivery,
    items: r.items,
    total: Number(r.total),
    payMethod: r.pay_method,
    payNum: r.pay_num,
    smsResults: r.sms_results,
    createdAt: r.created_at,
  };
}

async function getSettings() {
  if (_settingsCache && Date.now() - _settingsCacheTime < SETTINGS_CACHE_TTL) return _settingsCache;
  const { rows } = await pool.query("SELECT * FROM settings WHERE id=1");
  const s = rows[0] || {};
  const defaultSms = { enabled: false, method: "POST", url: "", contentType: "application/json", headers: "", bodyTemplate: "", sender: "ABGMARKET", apiKey: "" };
  _settingsCache = {
    companyName: s.company_name || "ABENGOUROU-MARKET.CI",
    companyPhone: s.company_phone || "+225 0767202271",
    companyEmail: s.company_email || "contact@abengourou-market.com",
    companyWebsite: s.company_website || "",
    companyWhatsapp: s.company_whatsapp || "2250767202271",
    subscriptionPrice: Number(s.subscription_price) || 5000,
    sms: { ...defaultSms, ...(s.sms_config || {}) },
    categoryConfig: s.category_config || {},
    cabinePaymentLink: s.cabine_payment_link || "https://pay.wave.com/m/M_ci_CRgdcq5dsx3B/c/ci/",
    ikoddiApiKey: s.ikoddi_api_key || "cGw3ZOF3K3bztjlYx5tAT52A5GpHaCF9",
    ikoddiGroupId: s.ikoddi_group_id || "10001958",
    ikoddiEnabled: s.ikoddi_enabled !== false,
    ikoddiSenderId: s.ikoddi_sender_id || "Ikoddi",
    aiApiKey: s.ai_api_key || "fe_oa_4cc277c7f7c355dd0b1ad9b2d0276569663ab9508a28cd84",
    aiEndpoint: s.ai_endpoint || "https://api.featherless.ai/v1/chat/completions",
    aiModel: s.ai_model || "meta-llama/Meta-Llama-3.1-8B-Instruct",
  };
  _settingsCacheTime = Date.now();
  return _settingsCache;
}

async function productVisible(p) {
  if (!p.approved || p.blocked) return false;
  if (p.expiresAt && new Date(p.expiresAt) < new Date()) return false;
  if (p.ownerRole === "admin") return true;
  const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [p.ownerId]);
  return vendorActive(rows[0]);
}

// ─── Détection automatique du pays selon le préfixe téléphonique ─────────────
const PHONE_COUNTRY_MAP = [
  { prefix: "225", phonecode: "225", iso: "CI" }, // Côte d'Ivoire
  { prefix: "229", phonecode: "229", iso: "BJ" }, // Bénin
  { prefix: "226", phonecode: "226", iso: "BF" }, // Burkina Faso
  { prefix: "227", phonecode: "227", iso: "NE" }, // Niger
  { prefix: "228", phonecode: "228", iso: "TG" }, // Togo
  { prefix: "221", phonecode: "221", iso: "SN" }, // Sénégal
  { prefix: "223", phonecode: "223", iso: "ML" }, // Mali
  { prefix: "224", phonecode: "224", iso: "GN" }, // Guinée
  { prefix: "237", phonecode: "237", iso: "CM" }, // Cameroun
  { prefix: "236", phonecode: "236", iso: "CF" }, // Centrafrique
  { prefix: "242", phonecode: "242", iso: "CG" }, // Congo
  { prefix: "243", phonecode: "243", iso: "CD" }, // RDC
  { prefix: "241", phonecode: "241", iso: "GA" }, // Gabon
  { prefix: "234", phonecode: "234", iso: "NG" }, // Nigeria
  { prefix: "233", phonecode: "233", iso: "GH" }, // Ghana
  { prefix: "212", phonecode: "212", iso: "MA" }, // Maroc
  { prefix: "213", phonecode: "213", iso: "DZ" }, // Algérie
  { prefix: "216", phonecode: "216", iso: "TN" }, // Tunisie
  { prefix: "20",  phonecode: "20",  iso: "EG" }, // Égypte
  { prefix: "33",  phonecode: "33",  iso: "FR" }, // France
];

function detectCountry(phone) {
  for (const c of PHONE_COUNTRY_MAP) {
    if (phone.startsWith(c.prefix)) return c;
  }
  return { phonecode: "225", iso: "CI" }; // défaut CI
}

// ─── SMS sender ──────────────────────────────────────────────────────────────
// logData = { vendorName, productName } — pour historique admin
async function sendSMS(settings, to, message, logData = {}) {
  const phone = String(to || "").replace(/\D/g, "");
  let result;

  if (!settings.ikoddiEnabled)      result = { ok: false, skipped: true, reason: "disabled" };
  else if (!settings.ikoddiApiKey)  result = { ok: false, skipped: true, reason: "ikoddi_api_key_missing" };
  else if (!settings.ikoddiGroupId) result = { ok: false, skipped: true, reason: "ikoddi_group_id_missing" };
  else if (!phone)                  result = { ok: false, skipped: true, reason: "no_phone" };
  else {
    const country = detectCountry(phone);
    let from = (settings.ikoddiSenderId || "Ikoddi")
      .replace(/[^a-zA-Z0-9\-]/g, "")
      .replace(/^[\-]+|[\-]+$/g, "")
      .slice(0, 11);
    if (!from || !/[a-zA-Z]/.test(from)) from = "Ikoddi";
    try {
      const client = new Ikoddi().withApiKey(settings.ikoddiApiKey).withGroupId(settings.ikoddiGroupId);
      const res = await client.sendSMS([phone], from, message, "false", country.phonecode, country.iso);
      const first = Array.isArray(res) ? res[0] : res;
      if (first?.error) result = { ok: false, error: first.error, data: first };
      else result = { ok: true, data: res, country: country.iso };
    } catch (e) {
      result = { ok: false, error: String(e), ikoddiResponse: e.response?.data||null, ikoddiStatus: e.response?.status||null };
    }
  }

  // Journaliser dans sms_logs (ne bloque jamais l'exécution)
  if (!result.skipped) {
    pool.query(
      `INSERT INTO sms_logs (recipient_phone, vendor_name, product_name, message, status, error_detail) VALUES ($1,$2,$3,$4,$5,$6)`,
      [phone, (logData.vendorName||"").slice(0,100), (logData.productName||"").slice(0,200),
       message.slice(0,500), result.ok ? "envoyé" : "échec", (result.error||"").slice(0,300)]
    ).catch(() => {});
  }

  return result;
}

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// ─── Auth ────────────────────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { id, pwd } = req.body || {};
    if (id === ADMIN_ID && pwd === ADMIN_PWD)
      return res.json({ role: "admin", name: "Administrateur", id, approved: true, active: true });
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1 AND pwd=$2", [id, pwd]);
    if (!rows.length) return res.status(401).json({ error: "Identifiants invalides" });
    const u = rows[0];
    return res.json({
      role: u.role, name: u.name, phone: u.phone, id: u.id,
      approved: u.approved, active: vendorActive(u),
      subscriptionUntil: u.subscription_until || null,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/register", async (req, res) => {
  try {
    const { id, pwd, name, phone } = req.body || {};
    if (!id || !pwd || !name) return res.status(400).json({ error: "Champs requis" });
    const exists = await pool.query("SELECT id FROM users WHERE id=$1", [id]);
    if (exists.rows.length) return res.status(400).json({ error: "Identifiant déjà pris" });
    await pool.query(
      "INSERT INTO users (id,pwd,name,phone,role,approved) VALUES ($1,$2,$3,$4,'vendeur',false)",
      [id, pwd, name, phone || ""]
    );
    res.json({ ok: true, approved: false });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Settings ────────────────────────────────────────────────────────────────
app.get("/api/settings", async (_req, res) => {
  try { res.json(await getSettings()); }
  catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/settings", async (req, res) => {
  try {
    const cur = await getSettings();
    const { companyName, companyPhone, companyEmail, companyWebsite, companyWhatsapp, subscriptionPrice, sms, categoryConfig, cabinePaymentLink, ikoddiApiKey, ikoddiGroupId, ikoddiEnabled, ikoddiSenderId, aiApiKey, aiEndpoint, aiModel } = req.body || {};
    const newName       = companyName      !== undefined ? companyName      : cur.companyName;
    const newPhone      = companyPhone     !== undefined ? companyPhone     : cur.companyPhone;
    const newEmail      = companyEmail     !== undefined ? companyEmail     : cur.companyEmail;
    const newWebsite    = companyWebsite   !== undefined ? companyWebsite   : cur.companyWebsite;
    const newWhatsapp   = companyWhatsapp  !== undefined ? String(companyWhatsapp).replace(/\D/g,"") : cur.companyWhatsapp;
    const newPrice      = subscriptionPrice !== undefined ? Number(subscriptionPrice) : cur.subscriptionPrice;
    const newSms        = sms ? { ...cur.sms, ...sms } : cur.sms;
    const newCatCfg     = categoryConfig !== undefined ? categoryConfig : cur.categoryConfig;
    const newCabineLink = cabinePaymentLink !== undefined ? cabinePaymentLink : cur.cabinePaymentLink;
    const newIkoddiKey  = ikoddiApiKey   !== undefined ? ikoddiApiKey   : cur.ikoddiApiKey;
    const newIkoddiGrp  = ikoddiGroupId  !== undefined ? ikoddiGroupId  : cur.ikoddiGroupId;
    const newIkoddiOn   = ikoddiEnabled  !== undefined ? Boolean(ikoddiEnabled) : cur.ikoddiEnabled;
    const newIkoddiSdr  = ikoddiSenderId !== undefined ? ikoddiSenderId : cur.ikoddiSenderId;
    const newAiKey      = aiApiKey    !== undefined ? aiApiKey    : cur.aiApiKey;
    const newAiEndpoint = aiEndpoint  !== undefined ? aiEndpoint  : cur.aiEndpoint;
    const newAiModel    = aiModel     !== undefined ? aiModel     : cur.aiModel;
    await pool.query(
      `UPDATE settings SET company_name=$1, subscription_price=$2, sms_config=$3,
       company_phone=$4, company_email=$5, company_website=$6, company_whatsapp=$7,
       category_config=$8, cabine_payment_link=$9,
       ikoddi_api_key=$10, ikoddi_group_id=$11, ikoddi_enabled=$12, ikoddi_sender_id=$13,
       ai_api_key=$14, ai_endpoint=$15, ai_model=$16 WHERE id=1`,
      [newName, newPrice, JSON.stringify(newSms), newPhone, newEmail, newWebsite, newWhatsapp,
       JSON.stringify(newCatCfg), newCabineLink, newIkoddiKey, newIkoddiGrp, newIkoddiOn, newIkoddiSdr,
       newAiKey, newAiEndpoint, newAiModel]
    );
    clearSettingsCache(); // vider après la sauvegarde pour que le prochain GET lise les nouvelles valeurs
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/settings/sms-test", async (req, res) => {
  try {
    const db = await getSettings();
    // Les valeurs du formulaire (si fournies) priment sur la DB — test sans sauvegarder
    const settings = {
      ...db,
      ikoddiEnabled:  req.body.ikoddiEnabled  !== undefined ? Boolean(req.body.ikoddiEnabled)  : db.ikoddiEnabled,
      ikoddiApiKey:   req.body.ikoddiApiKey   !== undefined ? req.body.ikoddiApiKey   : db.ikoddiApiKey,
      ikoddiGroupId:  req.body.ikoddiGroupId  !== undefined ? req.body.ikoddiGroupId  : db.ikoddiGroupId,
      ikoddiSenderId: req.body.ikoddiSenderId !== undefined ? req.body.ikoddiSenderId : db.ikoddiSenderId,
    };
    const r = await sendSMS(settings, req.body.to, `${settings.companyName}: SMS de test IKODDI ✓`);
    res.json(r);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Notification vendeur (clic WhatsApp direct) ──────────────────────────────
app.post("/api/notify-vendor", async (req, res) => {
  try {
    const { vendorPhone, productName, vendorName } = req.body || {};
    if (!vendorPhone) return res.json({ ok: false, skipped: true });
    const settings = await getSettings();
    const msg = `${settings.companyName}\n🔔 Nouveau contact !\nArticle : ${productName || "Non spécifié"}\nUn client est intéressé et vous contacte maintenant via WhatsApp.`;
    const result = await sendSMS(settings, vendorPhone, msg, { vendorName: vendorName||"", productName: productName||"" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Vendors ─────────────────────────────────────────────────────────────────
app.get("/api/vendors", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE role='vendeur' ORDER BY created_at DESC");
    res.json(rows.map(u => ({
      id: u.id, name: u.name, phone: u.phone,
      approved: u.approved, subscriptionUntil: u.subscription_until || null,
      active: vendorActive(u),
    })));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/vendors/approve", async (req, res) => {
  try {
    await pool.query("UPDATE users SET approved=true WHERE id=$1", [req.body.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/vendors/activate", async (req, res) => {
  try {
    const months = Number(req.body.months) || 1;
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [req.body.id]);
    if (!rows.length) return res.json({ ok: false });
    const u = rows[0];
    const base = vendorActive(u) ? new Date(u.subscription_until) : new Date();
    base.setMonth(base.getMonth() + months);
    await pool.query(
      "UPDATE users SET approved=true, subscription_until=$1 WHERE id=$2",
      [base.toISOString(), req.body.id]
    );
    res.json({ ok: true, subscriptionUntil: base.toISOString() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/vendors/deactivate", async (req, res) => {
  try {
    await pool.query("UPDATE users SET subscription_until=NULL WHERE id=$1", [req.body.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/vendors/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.body.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const category = (req.query.category || "").trim();
    const city     = (req.query.city     || "").trim();
    const page     = parseInt(req.query.page)  || 0;
    const limit    = Math.min(parseInt(req.query.limit) || 30, 100);

    const conditions = [
      "p.approved = true",
      "p.blocked = false",
      "(p.expires_at IS NULL OR p.expires_at > NOW())",
      "(p.owner_role = 'admin' OR u.approved = true)",
    ];
    const params = [];

    if (category) { params.push(category); conditions.push(`p.category = $${params.length}`); }
    if (city)     { params.push(city);     conditions.push(`p.city = $${params.length}`); }

    const where = conditions.join(" AND ");
    const base  = `FROM products p LEFT JOIN users u ON p.owner_id = u.id WHERE ${where}`;

    if (page > 0) {
      const offset = (page - 1) * limit;
      const [countRes, dataRes] = await Promise.all([
        pool.query(`SELECT COUNT(*) ${base}`, params),
        pool.query(`SELECT p.* ${base} ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      ]);
      const total = parseInt(countRes.rows[0].count);
      res.json({ products: dataRes.rows.map(rowToProduct), total, page, pages: Math.ceil(total / limit) });
    } else {
      const { rows } = await pool.query(`SELECT p.* ${base} ORDER BY p.created_at DESC`, params);
      res.json(rows.map(rowToProduct));
    }
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get("/api/products/all", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(rows.map(rowToProduct));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get("/api/products/mine/:ownerId", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE owner_id=$1 ORDER BY created_at DESC", [req.params.ownerId]);
    res.json(rows.map(rowToProduct));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/products", async (req, res) => {
  try {
    const b = req.body || {};
    const id = Date.now();
    const stock = Number(b.stock) || 0;
    const isAdmin = b.ownerRole === "admin";
    const expireHours = Number(b.expireHours) || 0;
    const expiresAt = expireHours > 0 ? new Date(Date.now() + expireHours * 3600000).toISOString() : null;

    // Auto-approbation : admin toujours approuvé, vendeur actif aussi approuvé
    let autoApprove = isAdmin;
    if (!isAdmin && b.ownerId) {
      const { rows: vRows } = await pool.query("SELECT * FROM users WHERE id=$1", [b.ownerId]);
      autoApprove = vRows[0] ? vendorActive(vRows[0]) : false;
    }

    // Compression à l'upload — catégories lourdes à 50%, toutes ≤ 1Mo
    const HEAVY_CATS = ["concours-ci","emploi","actualites","evenements"];
    let imgData = b.image || null;
    if (imgData && imgData.startsWith("data:image")) {
      try {
        const raw = imgData.replace(/^data:image\/\w+;base64,/, "");
        let buf = Buffer.from(raw, "base64");
        const isHeavy = HEAVY_CATS.includes(b.category || "");
        buf = await sharp(buf)
          .resize({ width: isHeavy ? 300 : 800, withoutEnlargement: true })
          .jpeg({ quality: isHeavy ? 50 : 90 })
          .toBuffer();
        // Garantir ≤ 1Mo quelle que soit la catégorie
        if (buf.length > 1_000_000) buf = await compressToUnder1MB(buf);
        imgData = "data:image/jpeg;base64," + buf.toString("base64");
      } catch { /* garder l'image originale si erreur */ }
    }

    await pool.query(
      `INSERT INTO products
        (id,title,category,city,price,old_price,stock,stock_init,image,description,
         whatsapp,personal_phone,owner_id,owner_name,owner_role,approved,blocked,
         employer,job_location,contract_type,salary,deadline,expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,false,$17,$18,$19,$20,$21,$22)`,
      [
        id, b.title, b.category, b.city||"Abengourou", Number(b.price)||0,
        b.oldPrice ? Number(b.oldPrice) : null,
        stock, stock, imgData, b.description||"",
        b.whatsapp||"", b.personalPhone||"",
        b.ownerId, b.ownerName||"", b.ownerRole||"vendeur",
        autoApprove,
        b.employer||"", b.jobLocation||"", b.contractType||"",
        b.salary||"", b.deadline||"", expiresAt,
      ]
    );
    const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    res.json(rowToProduct(rows[0]));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/products/approve", async (req, res) => {
  try {
    await pool.query("UPDATE products SET approved=true, blocked=false WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/products/block", async (req, res) => {
  try {
    await pool.query("UPDATE products SET blocked=true WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/products/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Modifier un article (admin)
app.post("/api/products/update", async (req, res) => {
  try {
    const b = req.body || {};
    const id = Number(b.id);
    if (!id) return res.status(400).json({ error: "id manquant" });
    const expireHours = b.expireHours !== undefined ? Number(b.expireHours) : undefined;
    let expiresAtClause = "";
    const params = [
      b.title||"", b.category||"", b.city||"", Number(b.price)||0,
      b.oldPrice ? Number(b.oldPrice) : null,
      Number(b.stock)||0,
      b.description||"", b.whatsapp||"", b.personalPhone||"",
      b.employer||"", b.jobLocation||"", b.contractType||"",
      b.salary||"", b.deadline||"", id,
    ];
    if (expireHours !== undefined) {
      const expiresAt = expireHours > 0 ? new Date(Date.now() + expireHours * 3600000).toISOString() : null;
      params.splice(params.length - 1, 0, expiresAt);
      expiresAtClause = ", expires_at=$15";
    }
    const idPos = params.length;
    await pool.query(
      `UPDATE products SET
        title=$1, category=$2, city=$3, price=$4, old_price=$5, stock=$6,
        description=$7, whatsapp=$8, personal_phone=$9,
        employer=$10, job_location=$11, contract_type=$12, salary=$13, deadline=$14
        ${expiresAtClause}
       WHERE id=$${idPos}`,
      params
    );
    const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    res.json(rows[0] ? rowToProduct(rows[0]) : { ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.get("/api/orders", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(rows.map(rowToOrder));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/orders", async (req, res) => {
  try {
    const id = Date.now();
    const orderNo = "CMD-" + String(id).slice(-6);
    const b = req.body || {};

    await pool.query(
      `INSERT INTO orders (id,order_no,client_name,client_phone,delivery,items,total,pay_method,pay_num)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, orderNo, b.name||"", b.phone||"", b.delivery||"",
       JSON.stringify(b.items||[]), Number(b.total)||0,
       b.payMethod||"", b.payNum||""]
    );

    // Décrémente le stock
    const owners = {};
    for (const it of b.items || []) {
      const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [Number(it.id)]);
      if (rows[0]) {
        const p = rows[0];
        await pool.query("UPDATE products SET stock=GREATEST(0,stock-$1) WHERE id=$2", [it.qty||1, p.id]);
        const phone = p.personal_phone || p.whatsapp || "";
        if (phone) {
          owners[phone] = owners[phone] || [];
          owners[phone].push(`${it.qty}x ${p.title}`);
        }
      }
    }

    // SMS propriétaires
    const settings = await getSettings();
    const mode = b.delivery === "agence" ? "Retrait sur place" : "Livraison domicile";
    const smsResults = [];
    for (const [phone, articles] of Object.entries(owners)) {
      const msg = `${settings.companyName} - ${orderNo}\nNouvelle commande: ${articles.join(", ")}\nClient: ${b.name||""} ${b.phone||""}\n${mode}\nTotal: ${b.total||0} FCFA`;
      // Récupérer le nom du vendeur depuis la map owners pour le log
      const { rows: vRows } = await pool.query("SELECT owner_name FROM products WHERE whatsapp=$1 OR personal_phone=$1 LIMIT 1", [phone]).catch(()=>({rows:[]}));
      const vendorName = vRows[0]?.owner_name || "";
      smsResults.push(await sendSMS(settings, phone, msg, { vendorName, productName: articles.join(", ") }));
    }

    await pool.query("UPDATE orders SET sms_results=$1 WHERE id=$2", [JSON.stringify(smsResults), id]);

    res.json({ id, orderNo, ...b, smsResults, createdAt: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Supprimer une commande (admin)
app.post("/api/orders/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Supprimer TOUTES les commandes (admin)
app.post("/api/orders/clear", async (_req, res) => {
  try {
    await pool.query("DELETE FROM orders");
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Modifier une commande (admin — statut / note)
app.post("/api/orders/update", async (req, res) => {
  try {
    const b = req.body || {};
    const id = Number(b.id);
    if (!id) return res.status(400).json({ error: "id manquant" });
    await pool.query(
      `UPDATE orders SET client_name=$1, client_phone=$2, delivery=$3, total=$4, pay_method=$5, pay_num=$6 WHERE id=$7`,
      [b.name||"", b.phone||"", b.delivery||"", Number(b.total)||0, b.payMethod||"", b.payNum||"", id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Rencontres ───────────────────────────────────────────────────────────────
function calcAge(birthdate) {
  const b = new Date(birthdate);
  const n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
  return age;
}

function rowToRencontrePublic(r) {
  const initials = ((r.nom||"")[0]||"").toUpperCase() + "." + ((r.prenom||"")[0]||"").toUpperCase() + ".";
  const title = (r.sexe||"").toLowerCase().startsWith("f") ? "Madame" : "Monsieur";
  return {
    id: Number(r.id),
    displayName: `${title} ${initials}`,
    age: calcAge(r.birthdate),
    profession: r.profession || "",
    ville: r.ville || "",
    quartier: r.quartier || "",
    sexe: r.sexe || "",
    souscat: r.sous_cat || "amitie",
    prixAcces: Number(r.prix_acces) || 500,
    descShort: (r.description || "").slice(0, 150),
    approved: r.approved,
    createdAt: r.created_at,
  };
}

function rowToRencontreAdmin(r) {
  return {
    ...rowToRencontrePublic(r),
    nom: r.nom, prenom: r.prenom, birthdate: r.birthdate,
    whatsapp: r.whatsapp || "", phone: r.phone || "",
    photo: r.photo || null, description: r.description || "",
    video: r.video || null, videoViewedAt: r.video_viewed_at || null,
  };
}

app.get("/api/rencontres", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM rencontres WHERE approved=true ORDER BY created_at DESC");
    res.json(rows.map(rowToRencontrePublic));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get("/api/rencontres/all", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM rencontres ORDER BY created_at DESC");
    res.json(rows.map(rowToRencontreAdmin));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/rencontres", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.nom || !b.prenom || !b.birthdate) return res.status(400).json({ error: "Champs requis manquants" });
    const id = Date.now();
    // Photo rencontre — jamais réduite à 1Mo (règle métier : photos profil libres)
    let photoData = b.photo || null;
    if (photoData && photoData.startsWith("data:image")) {
      try {
        const raw = photoData.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(raw, "base64");
        const out = await sharp(buf).resize({ width: 400, withoutEnlargement: true }).jpeg({ quality: 92 }).toBuffer();
        photoData = "data:image/jpeg;base64," + out.toString("base64");
      } catch { /* garder la photo originale si erreur */ }
    }
    // Vidéo de présentation (10s) — stockée telle quelle, supprimée après visionnage admin
    const videoData = b.video || null;

    await pool.query(
      `INSERT INTO rencontres (id,nom,prenom,birthdate,profession,ville,quartier,sexe,whatsapp,phone,photo,description,sous_cat,prix_acces,video)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [id, b.nom, b.prenom, b.birthdate, b.profession||"", b.ville||"", b.quartier||"",
       b.sexe||"", b.whatsapp||"", b.phone||"", photoData, b.description||"",
       b.souscat||"amitie", Number(b.prixAcces)||500, videoData]
    );
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/rencontres/approve", async (req, res) => {
  try {
    const id = Number(req.body.id);
    const prix = req.body.prixAcces != null ? Number(req.body.prixAcces) : null;
    const souscat = req.body.souscat || null;
    if (prix !== null && souscat) {
      await pool.query(
        "UPDATE rencontres SET approved=true, prix_acces=$2, sous_cat=$3 WHERE id=$1",
        [id, prix, souscat]
      );
    } else if (prix !== null) {
      await pool.query("UPDATE rencontres SET approved=true, prix_acces=$2 WHERE id=$1", [id, prix]);
    } else {
      await pool.query("UPDATE rencontres SET approved=true WHERE id=$1", [id]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/rencontres/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM rencontres WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Marquer la vidéo d'un profil comme visionnée par l'admin → suppression automatique après 30 min
app.post("/api/rencontres/video-viewed", async (req, res) => {
  try {
    await pool.query("UPDATE rencontres SET video_viewed_at=NOW() WHERE id=$1", [Number(req.body.id)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── EXPORT / IMPORT BASE DE DONNÉES ─────────────────────────────────────────

const upload = multer({ storage: multer.memoryStorage() }); // pas de limite de taille

// Retourner JSON même en cas d'erreur multer (fichier trop volumineux, etc.)
function handleUpload(req, res, next) {
  upload.single("file")(req, res, err => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE"
        ? "Fichier trop volumineux (maximum 200 Mo)"
        : err.message || "Erreur lors de l'upload";
      return res.status(413).json({ error: msg });
    }
    next();
  });
}

// Toutes les tables exportées (noms de table → colonnes à exclure pour la sécurité minimale)
const EXPORT_TABLES = ["users", "products", "orders", "settings", "rencontres", "sms_logs"];

// Export JSON complet de toutes les tables
app.get("/api/admin/export/json", async (req, res) => {
  try {
    const result = {};
    for (const t of EXPORT_TABLES) {
      const { rows } = await pool.query(`SELECT * FROM ${t} ORDER BY id`);
      result[t] = rows;
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="abengourou-market-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.send(JSON.stringify(result, null, 2));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Export Excel multi-feuilles (une feuille par table)
// Note: les images base64 sont trop longues pour Excel (limite 32767 chars/cellule).
// Elles sont remplacées par "[IMAGE: voir export JSON pour données complètes]".
// Utilisez l'export JSON pour un backup complet avec images.
app.get("/api/admin/export/excel", async (req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const IMG_COLS = new Set(["image", "photo"]); // colonnes contenant des base64
    for (const t of EXPORT_TABLES) {
      const { rows } = await pool.query(`SELECT * FROM ${t} ORDER BY id`);
      if (!rows.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[`Aucune donnée dans ${t}`]]), t);
        continue;
      }
      const ws = XLSX.utils.json_to_sheet(rows.map(r => {
        const o = {};
        for (const [k, v] of Object.entries(r)) {
          if (IMG_COLS.has(k) && typeof v === "string" && v.length > 100) {
            // Indiquer qu'une image existe sans la copier dans la cellule
            o[k] = v.startsWith("data:") ? `[IMAGE ${Math.round(v.length/1024)}KB — voir JSON export]` : v.slice(0, 200);
          } else if (typeof v === "object" && v !== null) {
            o[k] = JSON.stringify(v);
          } else {
            o[k] = v;
          }
        }
        return o;
      }));
      XLSX.utils.book_append_sheet(wb, ws, t);
    }
    // Feuille de légende
    const legend = XLSX.utils.aoa_to_sheet([
      ["ABENGOUROU-MARKET.CI — Export base de données", new Date().toLocaleString("fr-FR")],
      [""],
      ["⚠️ Note importante sur les images"],
      ["Les colonnes 'image' et 'photo' affichent [IMAGE xxKB] car Excel ne peut pas stocker les images base64."],
      ["Utilisez l'export JSON (/api/admin/export/json) pour un backup complet incluant toutes les images."],
      [""],
      ["Tables exportées:", EXPORT_TABLES.join(", ")],
    ]);
    XLSX.utils.book_append_sheet(wb, legend, "README");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="abengourou-market-${new Date().toISOString().slice(0,10)}.xlsx"`);
    res.send(buf);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Aperçu des comptages pour l'onglet admin
app.get("/api/admin/db-stats", async (req, res) => {
  try {
    const stats = {};
    for (const t of EXPORT_TABLES) {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM ${t}`);
      stats[t] = Number(rows[0].count);
    }
    res.json(stats);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Historique SMS (50 derniers)
app.get("/api/admin/sms-logs", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit)||100, 500);
    const { rows } = await pool.query(
      `SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT $1`, [limit]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Compression des images existantes en base de données
app.post("/api/admin/compress-images", async (req, res) => {
  try {
    let compressed = 0, skipped = 0, errors = 0;

    // Produits
    const { rows: products } = await pool.query(
      `SELECT id, image FROM products WHERE image IS NOT NULL AND image LIKE 'data:%'`
    );
    for (const p of products) {
      try {
        const b64 = p.image.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(b64, "base64");
        const out = await sharp(buf).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
        await pool.query("UPDATE products SET image=$1 WHERE id=$2",
          ["data:image/jpeg;base64," + out.toString("base64"), p.id]);
        compressed++;
      } catch { errors++; }
    }

    // Rencontres (photos)
    const { rows: rencontres } = await pool.query(
      `SELECT id, photo FROM rencontres WHERE photo IS NOT NULL AND photo LIKE 'data:%'`
    );
    for (const r of rencontres) {
      try {
        const b64 = r.photo.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(b64, "base64");
        const out = await sharp(buf).resize({ width: 400, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
        await pool.query("UPDATE rencontres SET photo=$1 WHERE id=$2",
          ["data:image/jpeg;base64," + out.toString("base64"), r.id]);
        compressed++;
      } catch { errors++; }
    }

    res.json({
      ok: true,
      total: products.length + rencontres.length,
      compressed, skipped, errors
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Import JSON — réimporte les données (UPSERT par table)
app.post("/api/admin/import/json", handleUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier manquant" });
    const data = JSON.parse(req.file.buffer.toString("utf8"));
    const report = {};

    // users
    if (data.users) {
      let n = 0;
      for (const u of data.users) {
        await pool.query(`
          INSERT INTO users (id,pwd,name,phone,role,approved,subscription_until,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (id) DO UPDATE SET
            pwd=EXCLUDED.pwd, name=EXCLUDED.name, phone=EXCLUDED.phone,
            role=EXCLUDED.role, approved=EXCLUDED.approved,
            subscription_until=EXCLUDED.subscription_until
        `, [u.id,u.pwd,u.name||"",u.phone||"",u.role||"client",u.approved??false,u.subscription_until||null,u.created_at||new Date()]);
        n++;
      }
      report.users = n;
    }

    // products — colonne "image" TEXT (base64 ou null)
    if (data.products) {
      let n = 0;
      for (const p of data.products) {
        // Support both snake_case (raw DB export) and camelCase (API export)
        const imgVal = p.image || null;
        await pool.query(`
          INSERT INTO products
            (id,title,description,price,old_price,category,image,stock,stock_init,
             owner_id,owner_name,owner_role,whatsapp,personal_phone,approved,blocked,
             employer,job_location,contract_type,salary,deadline,created_at,city,expires_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
          ON CONFLICT (id) DO UPDATE SET
            title=EXCLUDED.title, description=EXCLUDED.description, price=EXCLUDED.price,
            old_price=EXCLUDED.old_price, category=EXCLUDED.category, image=EXCLUDED.image,
            stock=EXCLUDED.stock, approved=EXCLUDED.approved, blocked=EXCLUDED.blocked,
            city=EXCLUDED.city, expires_at=EXCLUDED.expires_at
        `, [
          p.id, p.title||p.name||"", p.description||"",
          Number(p.price)||0, p.old_price!=null?Number(p.old_price):null,
          p.category||"", imgVal,
          Number(p.stock)||0, Number(p.stock_init||p.stockInit||p.stock)||0,
          p.owner_id||p.ownerId||"", p.owner_name||p.ownerName||"", p.owner_role||p.ownerRole||"vendeur",
          p.whatsapp||"", p.personal_phone||p.personalPhone||"",
          p.approved??false, p.blocked??false,
          p.employer||"", p.job_location||p.jobLocation||"",
          p.contract_type||p.contractType||"", p.salary||"", p.deadline||"",
          p.created_at||p.createdAt||new Date(),
          p.city||"",
          p.expires_at||p.expiresAt||null
        ]);
        n++;
      }
      report.products = n;
    }

    // orders
    if (data.orders) {
      let n = 0;
      for (const o of data.orders) {
        const itemsVal = o.items != null
          ? (typeof o.items === "string" ? o.items : JSON.stringify(o.items))
          : "[]";
        const smsVal = o.sms_results != null
          ? (typeof o.sms_results === "string" ? o.sms_results : JSON.stringify(o.sms_results))
          : "[]";
        await pool.query(`
          INSERT INTO orders (id,order_no,client_name,client_phone,delivery,items,total,pay_method,pay_num,sms_results,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (id) DO NOTHING
        `, [o.id, o.order_no||"", o.client_name||"", o.client_phone||"", o.delivery||"",
            itemsVal, Number(o.total)||0, o.pay_method||"", o.pay_num||"", smsVal,
            o.created_at||new Date()]);
        n++;
      }
      report.orders = n;
    }

    // rencontres — colonne DB = sous_cat (pas souscat)
    if (data.rencontres) {
      let n = 0;
      for (const r of data.rencontres) {
        const souscat = r.sous_cat || r.souscat || "amitie"; // support both DB and API export formats
        await pool.query(`
          INSERT INTO rencontres (id,nom,prenom,birthdate,profession,ville,quartier,sexe,whatsapp,phone,photo,description,sous_cat,prix_acces,approved,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          ON CONFLICT (id) DO UPDATE SET
            approved=EXCLUDED.approved, photo=EXCLUDED.photo,
            description=EXCLUDED.description, profession=EXCLUDED.profession
        `, [r.id,r.nom||"",r.prenom||"",r.birthdate||null,r.profession||"",r.ville||"",
            r.quartier||"",r.sexe||"",r.whatsapp||"",r.phone||"",r.photo||null,
            r.description||"",souscat,Number(r.prix_acces||r.prixAcces)||500,
            r.approved??false,r.created_at||new Date()]);
        n++;
      }
      report.rencontres = n;
    }

    // settings (optionnel — restaurer les paramètres)
    if (data.settings && Array.isArray(data.settings)) {
      for (const s of data.settings) {
        await pool.query(`
          UPDATE settings SET
            company_name=COALESCE($1, company_name),
            subscription_price=COALESCE($2, subscription_price),
            sms_config=COALESCE($3, sms_config),
            company_phone=COALESCE($4, company_phone),
            company_email=COALESCE($5, company_email),
            company_website=COALESCE($6, company_website),
            company_whatsapp=COALESCE($7, company_whatsapp),
            ikoddi_api_key=COALESCE($8, ikoddi_api_key),
            ikoddi_group_id=COALESCE($9, ikoddi_group_id),
            ikoddi_enabled=COALESCE($10, ikoddi_enabled),
            ikoddi_sender_id=COALESCE($11, ikoddi_sender_id),
            cabine_payment_link=COALESCE($12, cabine_payment_link)
          WHERE id=1
        `, [
          s.company_name||null, s.subscription_price||null,
          s.sms_config ? JSON.stringify(s.sms_config) : null,
          s.company_phone||null, s.company_email||null, s.company_website||null,
          s.company_whatsapp||null,
          s.ikoddi_api_key||null, s.ikoddi_group_id||null,
          s.ikoddi_enabled!=null ? s.ikoddi_enabled : null,
          s.ikoddi_sender_id||null, s.cabine_payment_link||null
        ]);
      }
      clearSettingsCache();
      report.settings = data.settings.length;
    }

    // sms_logs
    if (data.sms_logs && Array.isArray(data.sms_logs)) {
      let n = 0;
      for (const s of data.sms_logs) {
        if (!s.id) continue;
        await pool.query(`
          INSERT INTO sms_logs (id,recipient_phone,vendor_name,product_name,message,status,error_detail,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (id) DO NOTHING
        `, [s.id, s.recipient_phone||"", s.vendor_name||"", s.product_name||"",
            s.message||"", s.status||"", s.error_detail||"", s.created_at||new Date()]);
        n++;
      }
      report.sms_logs = n;
    }

    res.json({ ok: true, imported: report });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Import Excel ─────────────────────────────────────────────────────────────
app.post("/api/admin/import/excel", handleUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier manquant" });
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const report = {};

    function sheetToRows(name) {
      if (!wb.SheetNames.includes(name)) return [];
      return XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
    }

    // users
    const users = sheetToRows("users");
    if (users.length) {
      let n = 0;
      for (const u of users) {
        if (!u.id) continue;
        await pool.query(`
          INSERT INTO users (id,pwd,name,phone,role,approved,subscription_until,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (id) DO UPDATE SET
            pwd=EXCLUDED.pwd, name=EXCLUDED.name, phone=EXCLUDED.phone,
            role=EXCLUDED.role, approved=EXCLUDED.approved,
            subscription_until=EXCLUDED.subscription_until
        `, [u.id, u.pwd||"", u.name||"", u.phone||"", u.role||"vendeur",
            u.approved === true || u.approved === "true" || u.approved === 1,
            u.subscription_until||null, u.created_at||new Date()]);
        n++;
      }
      report.users = n;
    }

    // products
    const products = sheetToRows("products");
    if (products.length) {
      let n = 0;
      for (const p of products) {
        if (!p.id) continue;
        const imgVal = typeof p.image === "string" && p.image.startsWith("[IMAGE") ? null : (p.image || null);
        await pool.query(`
          INSERT INTO products
            (id,title,description,price,old_price,category,city,image,stock,stock_init,
             owner_id,owner_name,owner_role,whatsapp,personal_phone,approved,blocked,
             employer,job_location,contract_type,salary,deadline,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
          ON CONFLICT (id) DO UPDATE SET
            title=EXCLUDED.title, description=EXCLUDED.description, price=EXCLUDED.price,
            old_price=EXCLUDED.old_price, category=EXCLUDED.category, city=EXCLUDED.city,
            stock=EXCLUDED.stock, approved=EXCLUDED.approved, blocked=EXCLUDED.blocked,
            image=COALESCE(products.image, EXCLUDED.image)
        `, [
          p.id, p.title||"", p.description||"",
          Number(p.price)||0, p.old_price ? Number(p.old_price) : null,
          p.category||"", p.city||"", imgVal,
          Number(p.stock)||0, Number(p.stock_init||p.stock)||0,
          p.owner_id||"", p.owner_name||"", p.owner_role||"vendeur",
          p.whatsapp||"", p.personal_phone||"",
          p.approved === true || p.approved === "true" || p.approved === 1,
          p.blocked === true || p.blocked === "true" || p.blocked === 1,
          p.employer||"", p.job_location||"", p.contract_type||"",
          p.salary||"", p.deadline||"", p.created_at||new Date()
        ]);
        n++;
      }
      report.products = n;
    }

    // orders
    const orders = sheetToRows("orders");
    if (orders.length) {
      let n = 0;
      for (const o of orders) {
        if (!o.id) continue;
        let items = o.items || "[]";
        if (typeof items === "string") { try { JSON.parse(items); } catch { items = "[]"; } }
        else items = JSON.stringify(items);
        await pool.query(`
          INSERT INTO orders (id,order_no,client_name,client_phone,delivery,items,total,pay_method,pay_num,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          ON CONFLICT (id) DO NOTHING
        `, [o.id, o.order_no||"", o.client_name||"", o.client_phone||"",
            o.delivery||"", items, Number(o.total)||0,
            o.pay_method||"", o.pay_num||"", o.created_at||new Date()]);
        n++;
      }
      report.orders = n;
    }

    // rencontres
    const rencontres = sheetToRows("rencontres");
    if (rencontres.length) {
      let n = 0;
      for (const r of rencontres) {
        if (!r.id) continue;
        const photoVal = typeof r.photo === "string" && r.photo.startsWith("[IMAGE") ? null : (r.photo || null);
        await pool.query(`
          INSERT INTO rencontres (id,nom,prenom,birthdate,profession,ville,quartier,sexe,whatsapp,phone,photo,description,sous_cat,prix_acces,approved,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          ON CONFLICT (id) DO UPDATE SET
            approved=EXCLUDED.approved, profession=EXCLUDED.profession,
            description=EXCLUDED.description, prix_acces=EXCLUDED.prix_acces
        `, [r.id, r.nom||"", r.prenom||"", r.birthdate||null,
            r.profession||"", r.ville||"", r.quartier||"", r.sexe||"",
            r.whatsapp||"", r.phone||"", photoVal, r.description||"",
            r.sous_cat||"amitie", Number(r.prix_acces)||500,
            r.approved === true || r.approved === "true" || r.approved === 1,
            r.created_at||new Date()]);
        n++;
      }
      report.rencontres = n;
    }

    // settings
    const settingsRows = sheetToRows("settings");
    if (settingsRows.length) {
      const s = settingsRows[0];
      let smsConfig = s.sms_config;
      if (typeof smsConfig === "string") { try { smsConfig = JSON.parse(smsConfig); } catch { smsConfig = null; } }
      await pool.query(`
        UPDATE settings SET
          company_name=COALESCE($1, company_name),
          subscription_price=COALESCE($2, subscription_price),
          sms_config=COALESCE($3, sms_config),
          company_phone=COALESCE($4, company_phone),
          company_email=COALESCE($5, company_email),
          company_website=COALESCE($6, company_website),
          company_whatsapp=COALESCE($7, company_whatsapp)
        WHERE id=1
      `, [s.company_name||null, s.subscription_price||null,
          smsConfig ? JSON.stringify(smsConfig) : null,
          s.company_phone||null, s.company_email||null, s.company_website||null,
          s.company_whatsapp||null]);
      report.settings = 1;
    }

    res.json({ ok: true, imported: report });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Surveillance espace base de données ─────────────────────────────────────
// Render.com PostgreSQL gratuit = 1 Go (1 073 741 824 octets)
const RENDER_FREE_DB_LIMIT_BYTES = 1073741824;
app.get("/api/admin/db-size", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT pg_database_size(current_database()) AS size_bytes");
    const sizeBytes = Number(rows[0].size_bytes);
    const limitBytes = RENDER_FREE_DB_LIMIT_BYTES;
    const pct = (sizeBytes / limitBytes) * 100;
    const sizeMB = (sizeBytes / 1048576).toFixed(2);
    const limitMB = (limitBytes / 1048576).toFixed(0);
    res.json({
      sizeBytes,
      limitBytes,
      sizeMB: Number(sizeMB),
      limitMB: Number(limitMB),
      pct: Number(pct.toFixed(2)),
      alert: pct >= 90,
      warning: pct >= 75,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Export ZIP de déploiement (sans fichiers spécifiques à l'IDE) ────────────
app.get("/api/admin/export/zip", async (req, res) => {
  try {
    const AdmZip = require("adm-zip");
    const fs = require("fs");
    const zip = new AdmZip();

    // Générer le fichier .env.example dynamiquement
    const envExample = [
      "# Variables d'environnement requises pour ABENGOUROU-MARKET",
      "# Renommez ce fichier en .env avant de démarrer",
      "",
      "# URL de connexion PostgreSQL (obligatoire)",
      "DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME",
      "",
      "# Identifiants administrateur (optionnel — défaut : buzz / arrow)",
      "ADMIN_ID=buzz",
      "ADMIN_PWD=arrow",
      "",
      "# Port du serveur (Render.com utilise 10000 par défaut)",
      "PORT=10000",
    ].join("\n");
    zip.addFile(".env.example", Buffer.from(envExample, "utf8"));

    // Fichiers racine à inclure (sans fichiers spécifiques à l'IDE)
    const filesToInclude = ["server.js", "package.json", "package-lock.json", "README.md"];
    for (const f of filesToInclude) {
      const fp = path.join(__dirname, f);
      if (fs.existsSync(fp)) zip.addLocalFile(fp);
    }

    // Dossier public/ complet (HTML, CSS, JS, images)
    const publicDir = path.join(__dirname, "public");
    if (fs.existsSync(publicDir)) zip.addLocalFolder(publicDir, "public");

    const buf = zip.toBuffer();
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="amzon.zip"`);
    res.send(buf);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── Santé — Pharmacie de garde ───────────────────────────────────────────────
app.get("/api/sante/garde", async (req, res) => {
  try {
    const city = (req.query.city || "").trim();
    if (!city) return res.json(null);
    const { rows } = await pool.query(
      "SELECT * FROM pharmacies_garde WHERE LOWER(city)=LOWER($1) LIMIT 1",
      [city]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/sante/garde", async (req, res) => {
  try {
    const { city, name, address, phone, note } = req.body || {};
    if (!city || !name) return res.status(400).json({ error: "city et name requis" });
    await pool.query(`
      INSERT INTO pharmacies_garde (city, name, address, phone, note, updated_at)
      VALUES ($1,$2,$3,$4,$5,NOW())
      ON CONFLICT (city) DO UPDATE
        SET name=$2, address=$3, phone=$4, note=$5, updated_at=NOW()
    `, [city.trim(), name.trim(), address||"", phone||"", note||""]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get("/api/sante/garde/all", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM pharmacies_garde ORDER BY city ASC");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/sante/garde/delete", async (req, res) => {
  try {
    const { city } = req.body || {};
    await pool.query("DELETE FROM pharmacies_garde WHERE LOWER(city)=LOWER($1)", [city||""]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── IA — Cerveau (Brain) CRUD ────────────────────────────────────────────────
// ─── Test validité clé IA ───────────────────────────────────────────────────
app.post("/api/ai/test-key", async (req, res) => {
  try {
    const { apiKey, endpoint, model } = req.body || {};
    if (!apiKey) return res.json({ ok: false, error: "Clé vide" });
    // La détection du type de clé prime toujours sur l'endpoint fourni
    const isGroq   = apiKey.startsWith("gsk_");
    const isFeather = apiKey.startsWith("fe_oa_");
    const url = isGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : (isFeather
        ? "https://api.featherless.ai/v1/chat/completions"
        : (endpoint || "https://api.featherless.ai/v1/chat/completions"));
    const mdl = isGroq
      ? "llama-3.3-70b-versatile"
      : (isFeather
        ? (model || "meta-llama/Meta-Llama-3.1-8B-Instruct")
        : (model || "meta-llama/Meta-Llama-3.1-8B-Instruct"));
    const testRes  = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: mdl,
        messages: [{ role: "user", content: "Réponds juste OK" }],
        max_tokens: 5,
        temperature: 0
      })
    });
    const txt = await testRes.text();
    if (testRes.status === 401) return res.json({ ok: false, error: "Clé invalide ou non autorisée" });
    if (testRes.status === 429) return res.json({ ok: false, error: "Quota épuisé — limite de requêtes atteinte" });
    if (testRes.status === 402) return res.json({ ok: false, error: "Quota épuisé — solde insuffisant" });
    if (!testRes.ok)            return res.json({ ok: false, error: `Erreur ${testRes.status}` });
    const data = JSON.parse(txt);
    const reply = data.choices?.[0]?.message?.content?.trim() || "OK";
    return res.json({ ok: true, reply, model: mdl });
  } catch (e) {
    return res.json({ ok: false, error: e.message });
  }
});

app.get("/api/ai/brain", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM ai_brain ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/ai/brain", async (req, res) => {
  try {
    const { question, answer } = req.body || {};
    if (!question || !answer) return res.status(400).json({ error: "question et answer requis" });
    const { rows } = await pool.query(
      "INSERT INTO ai_brain (question, answer) VALUES ($1, $2) RETURNING *",
      [question.trim(), answer.trim()]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/ai/brain/delete", async (req, res) => {
  try {
    const { id } = req.body || {};
    await pool.query("DELETE FROM ai_brain WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ─── IA — Chat (public) ───────────────────────────────────────────────────────
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ error: "message requis" });

    const settings = await getSettings();

    // 1. Recherche dans le cerveau (correspondance par mots-clés)
    const { rows: brain } = await pool.query("SELECT * FROM ai_brain");
    const normalize = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, " ").trim();
    const userNorm = normalize(message);
    const userWords = new Set(userNorm.split(/\s+/).filter(w => w.length > 2));

    for (const entry of brain) {
      const entryNorm = normalize(entry.question);
      if (entryNorm === userNorm) return res.json({ reply: entry.answer, source: "brain" });
      const entryWords = entryNorm.split(/\s+/).filter(w => w.length > 2);
      if (entryWords.length === 0) continue;
      const matches = entryWords.filter(w => userWords.has(w)).length;
      if (matches / entryWords.length >= 0.6) return res.json({ reply: entry.answer, source: "brain" });
    }

    // 2. Appel API IA — priorité : env var > clé admin (paramètres) > clé par défaut Groq
    const defaultGroqKey    = "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";
    const OLD_FEATHERLESS   = "fe_oa_4cc277c7f7c355dd0b1ad9b2d0276569663ab9508a28cd84";
    const rawConfiguredKey  = settings.aiApiKey || "";
    // Ignorer l'ancienne clé Featherless par défaut (résidu de la config initiale)
    const configuredKey     = (rawConfiguredKey && rawConfiguredKey !== OLD_FEATHERLESS) ? rawConfiguredKey : "";
    const isGroqKey         = (k) => k && k.startsWith("gsk_");
    const apiKey            = process.env.GROQ_API_KEY || configuredKey || defaultGroqKey;
    const usingGroq      = isGroqKey(apiKey);
    const endpoint       = usingGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : (settings.aiEndpoint || "https://api.featherless.ai/v1/chat/completions");
    const model          = usingGroq
      ? "llama-3.3-70b-versatile"
      : (settings.aiModel || "meta-llama/Meta-Llama-3.1-8B-Instruct");

    // Charger TOUS les produits approuvés avec stock précis
    let productContext = "";
    try {
      const { rows: products } = await pool.query(
        `SELECT title, category, price, city, description, stock
         FROM products
         WHERE approved = true AND blocked = false
         ORDER BY category, title
         LIMIT 200`
      );
      if (products.length > 0) {
        const lines = products.map(p => {
          const stockInfo = p.stock === 0
            ? "⛔ RUPTURE DE STOCK"
            : `✅ En stock : ${p.stock} unité${p.stock > 1 ? "s" : ""}`;
          return `• [${p.category}] ${p.title} — ${Number(p.price).toLocaleString("fr-FR")} FCFA${p.city ? ` | Ville : ${p.city}` : ""} | ${stockInfo}`;
        });
        productContext = `\n\n=== CATALOGUE COMPLET (${products.length} produits) ===\n${lines.join("\n")}\n=== FIN DU CATALOGUE ===\n`;
      } else {
        productContext = "\n\n(Aucun produit en vente pour le moment.)\n";
      }
    } catch (e) {
      console.error("Erreur chargement produits pour IA:", e.message);
    }

    const adminPhone   = settings.companyPhone  || "+225 0767202271";
    const adminEmail   = settings.companyEmail  || "";
    const adminWhatsApp= settings.companyWhatsapp || adminPhone;
    const companyName  = settings.companyName   || "ABENGOUROU-MARKET";

    const systemPrompt = `Tu es AMARA, l'assistante virtuelle chaleureuse et intelligente de ${companyName}, la grande plateforme numérique de commerce et services à Abengourou, Côte d'Ivoire.

PERSONNALITÉ :
- Tu es souriante, polie, distinguée et très professionnelle.
- Tu accueilles chaque client avec chaleur, comme une vraie hôtesse.
- Tu peux causer librement avec les clients : répondre aux salutations, faire la conversation, parler du temps, de la vie à Abengourou, des nouvelles tendances — tout en restant centrée sur ta mission.
- Tu réponds en français élégant, mais tu peux aussi utiliser quelques expressions ivoiriennes chaleureuses quand c'est naturel.
- Tes réponses sont concises (3-5 phrases max) mais complètes et utiles.

CONTACTS DE L'ADMINISTRATEUR (donne-les sans hésiter quand un client demande) :
📞 Téléphone / WhatsApp : ${adminPhone}
📧 Email : ${adminEmail}
💬 WhatsApp direct : ${adminWhatsApp}

HORAIRES : Lundi – Samedi, 08h00 à 18h00
PAIEMENTS ACCEPTÉS : Wave, Orange Money, MTN MoMo, Moov Money, paiement à la livraison

CATÉGORIES DE LA BOUTIQUE :
🏠 Immobilier | 🚗 Véhicules & Motos | 📱 Téléphones | 💻 Informatique | 👗 Mode & Beauté
🛒 Supermarché | 🍽️ Restaurants | 🌾 Agriculture | 💼 Emploi | 📚 Concours CI
🚕 Transport & Taxi | 🎁 Braderie & Événements | ❤️ Rencontres | 📞 Cabine en Ligne | 🏥 Appel Santé | 🎓 Scolaires
${productContext}
RÈGLES ESSENTIELLES :
1. Pour toute question sur un produit (disponibilité, stock, prix, catégorie) : cherche dans le CATALOGUE ci-dessus et donne une réponse précise avec le stock exact.
   - Si le stock est ⛔ RUPTURE : dis-le clairement et propose d'alerter l'admin ou de chercher une alternative.
   - Si le produit est en stock : indique le nombre exact d'unités disponibles et le prix.
2. Si le client demande le numéro de l'administrateur, le contact ou comment joindre la boutique : donne ${adminPhone} immédiatement.
3. Pour les salutations et la conversation générale : réponds chaleureusement, engage la discussion, puis guide vers les produits ou services si pertinent.
4. Tu peux discuter de sujets divers (météo, actualité locale, conseils shopping...) de façon brève, puis ramener naturellement vers la boutique.
5. N'invente jamais un produit ou un prix qui n'est pas dans le catalogue. Si tu ne trouves pas, dis-le honnêtement et propose de contacter l'admin.`;

    if (!apiKey) {
      // Fallback local si aucune clé IA configurée
      const lc = message.toLowerCase();
      if (lc.includes("heure") || lc.includes("horaire") || lc.includes("ouvert"))
        return res.json({ reply: `${companyName} est ouvert du lundi au samedi de 08h à 18h. 🕐`, source: "local" });
      if (lc.includes("contact") || lc.includes("appel") || lc.includes("numero") || lc.includes("administrateur") || lc.includes("admin"))
        return res.json({ reply: `Vous pouvez joindre l'administrateur au 📞 ${adminPhone}${adminEmail ? ` ou par email : ${adminEmail}` : ""}. N'hésitez pas à l'appeler ou lui envoyer un message WhatsApp ! 😊`, source: "local" });
      if (lc.includes("paiement") || lc.includes("payer") || lc.includes("wave") || lc.includes("orange"))
        return res.json({ reply: `Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money et le paiement à la livraison. 💳`, source: "local" });
      return res.json({ reply: `Bonjour ! Je suis AMARA, votre assistante ${companyName}. Contactez-nous au ${adminPhone} ou explorez nos catégories sur le site. 😊`, source: "local" });
    }

    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      console.error("AI API error:", aiRes.status, errText.slice(0, 200));
      const lc = message.toLowerCase();
      if (lc.includes("heure") || lc.includes("horaire") || lc.includes("ouvert"))
        return res.json({ reply: `${companyName} est ouvert du lundi au samedi de 08h à 18h. 🕐`, source: "local" });
      if (lc.includes("contact") || lc.includes("appel") || lc.includes("numero") || lc.includes("admin"))
        return res.json({ reply: `Joignez l'administrateur au 📞 ${adminPhone}. Il est disponible du lundi au samedi de 08h à 18h. 😊`, source: "local" });
      if (lc.includes("paiement") || lc.includes("payer") || lc.includes("wave") || lc.includes("orange"))
        return res.json({ reply: `Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money et le paiement à la livraison. 💳`, source: "local" });
      return res.json({ reply: `Bonjour ! Je suis AMARA, votre assistante ${companyName}. Pour toute aide, contactez-nous au ${adminPhone}. 😊`, source: "local" });
    }

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
    res.json({ reply, source: "ai" });
  } catch (e) {
    console.error("AI chat error:", e.message);
    const settings = await getSettings().catch(() => ({ companyPhone: "+225 0767202271", companyName: "ABENGOUROU-MARKET" }));
    res.json({ reply: `Bonjour ! Je suis AMARA, votre assistante ${settings.companyName}. Pour toute question, contactez-nous au ${settings.companyPhone}. 😊`, source: "local" });
  }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ─── Compresse un buffer jusqu'à passer sous 1 Mo ────────────────────────────
async function compressToUnder1MB(buf) {
  const TARGET = 1_000_000;
  if (buf.length <= TARGET) return buf;
  for (const [w, q] of [[1200,80],[1000,65],[800,50],[600,35],[400,20]]) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: q }).toBuffer();
    if (out.length <= TARGET) return out;
  }
  return await sharp(buf).resize({ width: 400 }).jpeg({ quality: 15 }).toBuffer();
}

// ─── Compression automatique des images produits >1Mo au démarrage ───────────
// (les photos de profil rencontres ne sont PAS réduites — règle métier)
async function autoCompressImages() {
  try {
    const { rows } = await pool.query(
      `SELECT id, image FROM products WHERE image IS NOT NULL AND image LIKE 'data:%'`
    );
    let total = rows.length, done = 0, skipped = 0;
    for (const row of rows) {
      try {
        const raw = row.image.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(raw, "base64");
        if (buf.length <= 1_000_000) { skipped++; continue; }
        const out = await compressToUnder1MB(buf);
        await pool.query(`UPDATE products SET image=$1 WHERE id=$2`,
          ["data:image/jpeg;base64," + out.toString("base64"), row.id]);
        done++;
      } catch { /* ne bloque pas */ }
    }
    if (done > 0) console.log(`🖼️  Images produits >1Mo réduites : ${done}/${total} (${skipped} déjà légères)`);
    else console.log(`🖼️  Toutes les images produits ≤1Mo (${skipped} vérifiées).`);
  } catch (e) {
    console.error("⚠️  Compression images (non bloquant) :", e.message);
  }
}

// ─── Compression initiale des catégories lourdes (concours, emploi, actualités, événements) ──
async function autoCompressHeavyCategories() {
  const HEAVY = ["concours-ci","emploi","actualites","evenements"];
  try {
    const { rows } = await pool.query(
      `SELECT id, image FROM products
       WHERE category = ANY($1) AND image IS NOT NULL AND image LIKE 'data:%'`,
      [HEAVY]
    );
    if (!rows.length) { console.log("🗜️  Catégories lourdes : aucune image à recompresser."); return; }
    let done = 0, skipped = 0;
    for (const p of rows) {
      try {
        const raw = p.image.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(raw, "base64");
        const meta = await sharp(buf).metadata();
        // Ne recompresser que si la qualité est encore élevée (image > 80 Ko)
        if (buf.length < 80_000) { skipped++; continue; }
        const out = await sharp(buf)
          .resize({ width: 300, withoutEnlargement: true })
          .jpeg({ quality: 50 })
          .toBuffer();
        const newB64 = "data:image/jpeg;base64," + out.toString("base64");
        await pool.query("UPDATE products SET image=$1 WHERE id=$2", [newB64, p.id]);
        done++;
      } catch { /* ne bloque pas */ }
    }
    console.log(`🗜️  Catégories lourdes : ${done} recompressées, ${skipped} déjà légères.`);
  } catch (e) {
    console.error("⚠️  Compression catégories lourdes (non bloquant) :", e.message);
  }
}

// ─── Suppression automatique des vidéos rencontre après visionnage admin ──────
// 30 min après que l'admin a marqué la vidéo comme visionnée → video=NULL
async function autoCleanupRencontreVideos() {
  try {
    const { rows } = await pool.query(
      `SELECT id FROM rencontres
       WHERE video IS NOT NULL
         AND video_viewed_at IS NOT NULL
         AND video_viewed_at < NOW() - INTERVAL '30 minutes'`
    );
    for (const r of rows) {
      await pool.query("UPDATE rencontres SET video=NULL WHERE id=$1", [r.id]);
    }
    if (rows.length > 0) console.log(`🎥 ${rows.length} vidéo(s) rencontre supprimée(s) après visionnage.`);
  } catch (e) {
    console.error("⚠️  Nettoyage vidéos rencontre (non bloquant) :", e.message);
  }
}

// ─── Démarrage ────────────────────────────────────────────────────────────────
initDB()
  .then(() => app.listen(PORT, "0.0.0.0", () => {
    console.log(`ABENGOUROU-MARKET sur http://0.0.0.0:${PORT}`);
    autoCompressImages();           // arrière-plan — images produits >1Mo
    autoCompressHeavyCategories();  // compression 50 % catégories lourdes
    // Nettoyage vidéos rencontre toutes les 5 minutes
    setInterval(autoCleanupRencontreVideos, 5 * 60 * 1000);
    autoCleanupRencontreVideos();   // vérification immédiate au démarrage
  }))
  .catch((err) => { console.error("❌ Erreur DB:", err.message); process.exit(1); });
