/**
 * Admin — Tea & Coffee Shop
 * ใช้ Firebase Realtime Database — sync ทุกเครื่องแบบ real-time
 * Login: Admin / 123456789
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getLang, setLang, T_ADMIN } from "./lang.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOkyKQA3GapMvPRwy4CsiKIb0kz6PvsUg",
  authDomain: "pos2laos.firebaseapp.com",
  databaseURL: "https://pos2laos-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pos2laos",
  storageBucket: "pos2laos.firebasestorage.app",
  messagingSenderId: "610723590112",
  appId: "1:610723590112:web:1593c800edca5d8a9c4585"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const ADMIN_USER = 'Admin';
const ADMIN_PASS = '123456789';
const AUTH_KEY = 'pos2laos-admin-auth';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCu36zqMJ-qsD0ZiKcxdfnnFOBrHFIprTrR3uaW4_EFzaSw3-hH8mQ0rhlIMkjNsXzSg/exec';

// ==================== DOM ====================
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const ordersList = document.getElementById('ordersList');
const ordersEmpty = document.getElementById('ordersEmpty');
const logoutBtn = document.getElementById('logoutBtn');
const todayOrderCount = document.getElementById('todayOrderCount');
const todayTotal = document.getElementById('todayTotal');
const tabRecent = document.getElementById('tabRecent');
const tabHistory = document.getElementById('tabHistory');
const historyContent = document.getElementById('historyContent');
const historyEmpty = document.getElementById('historyEmpty');
const clearDataBtn = document.getElementById('clearDataBtn');
const clearDataModal = document.getElementById('clearDataModal');
const clearDataCode = document.getElementById('clearDataCode');
const clearDataError = document.getElementById('clearDataError');
const clearDataCancel = document.getElementById('clearDataCancel');
const clearDataConfirm = document.getElementById('clearDataConfirm');
const exportSheetBtn = document.getElementById('exportSheetBtn');
const exportModal = document.getElementById('exportModal');
const exportCancel = document.getElementById('exportCancel');
const exportConfirm = document.getElementById('exportConfirm');
const exportStatus = document.getElementById('exportStatus');
const customDateRange = document.getElementById('customDateRange');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');

// ==================== State ====================
let allOrders = [];

// ==================== Auth ====================
function isLoggedIn() { return sessionStorage.getItem(AUTH_KEY) === 'true'; }
function setLoggedIn(value) { value ? sessionStorage.setItem(AUTH_KEY, 'true') : sessionStorage.removeItem(AUTH_KEY); }
function showScreen(screen) {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// ==================== Helpers ====================
function formatMoney(n) { return Number(n).toLocaleString('lo-LA') + ' ກີບ'; }

function formatDate(isoString) {
  const lang = getLang();
  return new Date(isoString).toLocaleString(lang === 'lo' ? 'lo-LA' : 'th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDateOnly(isoString) {
  const lang = getLang();
  return new Date(isoString).toLocaleDateString(lang === 'lo' ? 'lo-LA' : 'th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getDateKey(isoString) { return new Date(isoString).toISOString().slice(0, 10); }
function isToday(isoString) { return getDateKey(isoString) === new Date().toISOString().slice(0, 10); }
function isWithinLast30Days(isoString) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  return new Date(isoString) >= cutoff;
}

// ==================== Language ====================
function t() { return T_ADMIN[getLang()]; }

function applyLang() {
  const tx = t();

  // Login screen
  const loginTitleEl = document.querySelector('.login-title');
  if (loginTitleEl) loginTitleEl.textContent = tx.loginTitle;
  const loginSubEl = document.querySelector('.login-sub');
  if (loginSubEl) loginSubEl.textContent = tx.loginSub;
  const userLabel = document.querySelector('label[for="username"]');
  if (userLabel) userLabel.textContent = tx.usernameLabel;
  const passLabel = document.querySelector('label[for="password"]');
  if (passLabel) passLabel.textContent = tx.passwordLabel;
  const loginBtn = document.querySelector('#loginForm button[type="submit"]');
  if (loginBtn) loginBtn.textContent = tx.loginBtn;
  const backLink = document.querySelector('.back-link');
  if (backLink) backLink.textContent = tx.backToPOS;

  // Header
  const adminLogoEl = document.querySelector('.admin-logo');
  if (adminLogoEl) adminLogoEl.textContent = tx.adminTitle;
  if (exportSheetBtn) exportSheetBtn.textContent = tx.exportBtn;
  if (clearDataBtn) clearDataBtn.textContent = tx.clearDataBtn;
  const posLink = document.querySelector('.admin-header-right a[href="index.html"]');
  if (posLink) posLink.textContent = tx.posLink;
  if (logoutBtn) logoutBtn.textContent = tx.logoutBtn;

  // Summary cards
  const todayOrderLabel = document.querySelector('.summary-card:first-child .summary-label');
  if (todayOrderLabel) todayOrderLabel.textContent = tx.todayOrderLabel;
  const todayTotalLabel = document.querySelector('.summary-card.accent .summary-label');
  if (todayTotalLabel) todayTotalLabel.textContent = tx.todayTotalLabel;

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === 'recent') btn.textContent = tx.tabRecent;
    if (btn.dataset.tab === 'history') btn.textContent = tx.tabHistory;
  });

  // Empty states
  const ordersEmptyText = ordersEmpty ? ordersEmpty.querySelector('p:last-of-type') : null;
  if (ordersEmptyText) ordersEmptyText.textContent = tx.noOrders;
  const goToPOSLink = ordersEmpty ? ordersEmpty.querySelector('a') : null;
  if (goToPOSLink) goToPOSLink.textContent = tx.goToPOS;
  const historyEmptyText = historyEmpty ? historyEmpty.querySelector('p:last-of-type') : null;
  if (historyEmptyText) historyEmptyText.textContent = tx.noHistory;

  // Export modal
  const exportTitleEl = document.querySelector('#exportModal .modal-title');
  if (exportTitleEl) exportTitleEl.textContent = tx.exportTitle;
  const exportDescEl = document.querySelector('#exportModal .modal-desc');
  if (exportDescEl) exportDescEl.textContent = tx.exportDesc;
  const exportOptions = document.querySelectorAll('.export-option');
  if (exportOptions[0]) exportOptions[0].querySelector('span').textContent = tx.exportToday;
  if (exportOptions[1]) exportOptions[1].querySelector('span').textContent = tx.exportMonth;
  if (exportOptions[2]) exportOptions[2].querySelector('span').textContent = tx.exportCustom;
  const dateLabels = document.querySelectorAll('.date-field .field-label');
  if (dateLabels[0]) dateLabels[0].textContent = tx.dateFrom;
  if (dateLabels[1]) dateLabels[1].textContent = tx.dateTo;
  if (exportCancel) exportCancel.textContent = tx.exportCancel;
  if (exportConfirm && !exportConfirm.disabled) exportConfirm.textContent = tx.exportConfirm;

  // Clear data modal
  const clearTitleEl = document.querySelector('#clearDataModal .modal-title');
  if (clearTitleEl) clearTitleEl.textContent = tx.clearTitle;
  const clearDescEl = document.querySelector('#clearDataModal .modal-desc');
  if (clearDescEl) clearDescEl.textContent = tx.clearDesc;
  const clearCodeLabel = document.querySelector('label[for="clearDataCode"]');
  if (clearCodeLabel) clearCodeLabel.textContent = tx.clearCodeLabel;
  if (clearDataCancel) clearDataCancel.textContent = tx.clearCancel;
  if (clearDataConfirm) clearDataConfirm.textContent = tx.clearConfirm;

  // Add item modal
  const addItemTitleEl = document.querySelector('#addItemModal .modal-title');
  if (addItemTitleEl) addItemTitleEl.textContent = tx.addItemTitle;
  const addItemDescEl = document.querySelector('#addItemModal .modal-desc');
  if (addItemDescEl) addItemDescEl.textContent = tx.addItemDesc;
  const addItemCancelBtn = document.getElementById('addItemCancel');
  if (addItemCancelBtn) addItemCancelBtn.textContent = tx.addItemCancel;

  // Lang button
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) langBtn.textContent = tx.langBtn;

  // Re-render dynamic content
  renderDailySummary();
  renderOrders();
  renderHistory();
}

// ==================== Products (for admin add-item) ====================
const ALL_PRODUCTS = [
  { id: 'pad1',  name: 'ຜັດໄວໄວໃສ່ໝູ / ผัดไวไวใส่หมู',          price: 50000, category: 'pad' },
  { id: 'pad2',  name: 'ຜັດໄວໄວໃສ່ໄຂ່ / ผัดไวไวใส่ไข่',          price: 50000, category: 'pad' },
  { id: 'pad3',  name: 'ຜັດສະປາເກັດຕີ / ผัดสปาเก็ตตี',           price: 65000, category: 'pad' },
  { id: 'pad4',  name: 'ລາດໜ້າໝູ / ราดหน้าหมู',                  price: 55000, category: 'pad' },
  { id: 'pad5',  name: 'ລາດໜ້າທະເລ / ราดหน้าทะเล',               price: 68000, category: 'pad' },
  { id: 'pad6',  name: 'ໄກ່ຜັດຂິງ / ไก่ผัดขิง',                  price: 50000, category: 'pad' },
  { id: 'pad7',  name: 'ໄຂ່ຈືນໝູສັບ / ไข่เจียวหมูสับ',            price: 45000, category: 'pad' },
  { id: 'pad8',  name: 'ໄຂ່ຈືນກຸ້ງ / ไข่เจียวกุ้ง',              price: 50000, category: 'pad' },
  { id: 'pad9',  name: 'ໄຂ່ຕົ້ມ / ไข่ต้ม',                       price: 8000,  category: 'pad' },
  { id: 'pad10', name: 'ໄຂ່ລ້ຽວ / ไข่ดาว',                       price: 5000,  category: 'pad' },
  { id: 'pad11', name: 'ຜັດພິກແກງປ່າໝູ / ผัดพริกแกงป่าหมู',       price: 75000, category: 'pad' },
  { id: 'pad12', name: 'ຜັດພິກແກງປ່າໄກ່ / ผัดพริกแกงป่าไก่',      price: 75000, category: 'pad' },
  { id: 'pad13', name: 'ໝູຜັດພິກຫວກ / หมูผัดพริกหยวก',            price: 65000, category: 'pad' },
  { id: 'pad14', name: 'ເປັດຜັດພິກເກືອ / เป็ดผัดพริกเกลือ',       price: 75000, category: 'pad' },
  { id: 'pad15', name: 'ໄຂ່ຍັດໄສ້ (ຈານ) / ไข่ยัดไส้ (จาน)',      price: 65000, category: 'pad' },
  { id: 'pad16', name: 'ໄກ່ສັບ (ຈານ) / ไก่สับ (จาน)',             price: 150000, category: 'pad' },
  { id: 'pad17', name: 'ໝູແດງ+ໝູກອບ (ຈານ) / หมูแดง+หมูกรอบ (จาน)', price: 150000, category: 'pad' },
  { id: 'pad18', name: 'ເປັດຍ່າງ (ຈານ) / เป็ดย่าง (จาน)',         price: 150000, category: 'pad' },
  { id: 'pad19', name: 'ຂາໝູລ້ວນ (ຈານ) / ขาหมูล้วน (จาน)',       price: 150000, category: 'pad' },
  { id: 'khao1',  name: 'ເຂົ້າຂາໝູ / ข้าวขาหมู',               price: 50000, category: 'khao' },
  { id: 'khao2',  name: 'ເຂົ້າມັນໄກ່ / ข้าวมันไก่',           price: 50000, category: 'khao' },
  { id: 'khao3',  name: 'ເຂົ້າກະເພາໝູສັບ / ข้าวกระเพราหมูสับ',    price: 50000, category: 'khao' },
  { id: 'khao4',  name: 'ເຂົ້າຜັດກຸ້ງ / ข้าวผัดกุ้ง',            price: 50000, category: 'khao' },
  { id: 'khao5',  name: 'ເຂົ້າຜັດໝູ / ข้าวผัดหมู',               price: 50000, category: 'khao' },
  { id: 'khao6',  name: 'ເຂົ້າໝູແດງ / ข้าวหมูแดง',                price: 50000, category: 'khao' },
  { id: 'khao7',  name: 'ເຂົ້າໜ້າເປັດ / ข้าวหน้าเป็ด',            price: 50000, category: 'khao' },
  { id: 'khao8',  name: 'ເຂົ້າກະເພາໝູກອບ / ข้าวกระเพราหมูกรอบ',  price: 50000, category: 'khao' },
  { id: 'khao9',  name: 'ເຂົ້າໄຂ່ຈືນໝູສັບ / ข้าวไข่เจียวหมูสับ',  price: 50000, category: 'khao' },
  { id: 'khao10', name: 'ເຂົ້າໜ້າໄກ່ / ข้าวหน้าไก่',              price: 50000, category: 'khao' },
  { id: 'khao11', name: 'ເຂົ້າມັນລາດໝູ / ข้าวมันขาหมู',           price: 50000, category: 'khao' },
  { id: 'khao12', name: 'ເຂົ້າມັນໜ້າເປັດ / ข้าวมันหน้าเป็ด',      price: 50000, category: 'khao' },
  { id: 'khao13', name: 'ເຂົ້າກະເພາກຸ້ງ / ข้าวกระเพรากุ้ง',       price: 50000, category: 'khao' },
  { id: 'khao14', name: 'ເຂົ້າສວຍ (ເຂົ້າເປົ່າ) / ข้าวเปล่า',      price: 15000, category: 'khao' },
  { id: 'tom1', name: 'ຕົ້ມຍຳກຸ້ງ / ต้มยำกุ้ง',                        price: 102000, category: 'tom' },
  { id: 'tom2', name: 'ຕົ້ມຂ່າໄກ່ໃສ່ກະທິ / ต้มข่าไก่ใส่กะทิ',          price: 68000,  category: 'tom' },
  { id: 'tom3', name: 'ຕົ້ມຈືດສາຫ່າຍເຕົ້າຮູ້ໝູສັບ / ต้มจืดสาหร่ายเต้าหู้หมูสับ', price: 50000, category: 'tom' },
  { id: 'water',  name: 'ນ້ຳເປົ່າ / น้ำเปล่า',       price: 5000,  category: 'drink' },
  { id: 'pepsi',  name: 'ເປັບຊີ / เป็ปซี่',           price: 10000, category: 'drink' },
  { id: 'fanta',  name: 'ແຟນຕ້າ / แฟนต้า',            price: 10000, category: 'drink' },
  { id: 'sprite', name: 'ສໄປຣ໌ / สไปร์ท',             price: 10000, category: 'drink' },
];

function getAddItemCategories() {
  const tx = t();
  return [
    { id: 'all',   label: tx.catAll },
    { id: 'pad',   label: tx.catPad },
    { id: 'khao',  label: tx.catKhao },
    { id: 'tom',   label: tx.catTom },
    { id: 'drink', label: tx.catDrink },
  ];
}
let addItemActiveCategory = 'all';

// ==================== Add Item Modal ====================
let addItemTargetKey = null;
let addItemTargetOrder = null;

const addItemModal = document.getElementById('addItemModal');
const addItemProductList = document.getElementById('addItemProductList');
const addItemCancel = document.getElementById('addItemCancel');
let addItemToastTimer = null;

function openAddItemModal(firebaseKey, order) {
  addItemTargetKey = firebaseKey;
  addItemTargetOrder = JSON.parse(JSON.stringify(order));
  renderAddItemList();
  addItemModal.setAttribute('aria-hidden', 'false');
}

function renderAddItemList() {
  const currentItems = addItemTargetOrder.items || [];
  const filtered = addItemActiveCategory === 'all'
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === addItemActiveCategory);

  const cats = getAddItemCategories();
  const tabsHtml = `<div class="add-item-cat-tabs">${
    cats.map(cat =>
      `<button type="button" class="add-item-cat-btn${addItemActiveCategory === cat.id ? ' active' : ''}" data-cat="${cat.id}">${cat.label}</button>`
    ).join('')
  }</div>`;

  const productsHtml = `<div class="add-item-product-grid">${
    filtered.map(p => {
      const existing = currentItems.find(i => i.name === p.name);
      const qty = existing ? existing.qty : 0;
      return `<button type="button" class="add-item-product-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
        <span class="add-item-product-name">${p.name}</span>
        <span class="add-item-product-price">${formatMoney(p.price)}</span>
        ${qty > 0 ? `<span class="add-item-qty-badge">${qty}</span>` : ''}
      </button>`;
    }).join('')
  }</div>`;

  addItemProductList.innerHTML = tabsHtml + productsHtml;

  addItemProductList.querySelectorAll('.add-item-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => { addItemActiveCategory = btn.dataset.cat; renderAddItemList(); });
  });
  addItemProductList.querySelectorAll('.add-item-product-btn').forEach(btn => {
    btn.addEventListener('click', () => addItemToOrder(btn.dataset, btn));
  });
}

function closeAddItemModal() {
  addItemModal.setAttribute('aria-hidden', 'true');
  addItemTargetKey = null; addItemTargetOrder = null; addItemActiveCategory = 'all';
  if (addItemToastTimer) { clearTimeout(addItemToastTimer); addItemToastTimer = null; }
  const toast = document.getElementById('addItemToastMsg');
  if (toast) toast.textContent = '';
}

async function addItemToOrder({ name, price }, btnEl) {
  if (!addItemTargetKey || !addItemTargetOrder) return;
  const items = addItemTargetOrder.items || [];
  const existing = items.find(i => i.name === name);
  if (existing) { existing.qty += 1; }
  else { items.push({ name, price: parseFloat(price), qty: 1 }); }
  addItemTargetOrder.items = items;
  addItemTargetOrder.total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  await update(ref(db, `orders/${addItemTargetKey}`), { items: addItemTargetOrder.items, total: addItemTargetOrder.total });

  const toast = document.getElementById('addItemToastMsg');
  if (toast) {
    toast.textContent = t().addItemToast(name);
    toast.className = 'add-item-toast show';
    if (addItemToastTimer) clearTimeout(addItemToastTimer);
    addItemToastTimer = setTimeout(() => { toast.className = 'add-item-toast'; }, 2000);
  }
  renderAddItemList();
}

if (addItemCancel) addItemCancel.addEventListener('click', closeAddItemModal);
if (addItemModal) addItemModal.addEventListener('click', (e) => { if (e.target === addItemModal) closeAddItemModal(); });

// ==================== Firebase: Real-time Listener ====================
function startRealtimeListener() {
  onValue(ref(db, 'orders'), (snapshot) => {
    allOrders = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => { allOrders.push({ firebaseKey: child.key, ...child.val() }); });
      allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    renderDailySummary();
    renderOrders();
    renderHistory();
  });
}

// ==================== Firebase: Actions ====================
async function markOrderAsPaid(firebaseKey) {
  await update(ref(db, `orders/${firebaseKey}`), { status: 'paid' });
}

async function deleteOrder(firebaseKey, orderNumber) {
  const msg = t().deleteOrderMsg(orderNumber);
  if (!confirm(msg)) return;
  await remove(ref(db, `orders/${firebaseKey}`));
}

async function clearAllOrders() {
  await remove(ref(db, 'orders'));
  await update(ref(db, 'meta'), { orderNumber: 1001, lastOrderDate: new Date().toISOString().slice(0, 10) });
  closeClearDataModal();
}

// ==================== Render ====================
function renderDailySummary() {
  const paidToday = allOrders.filter((o) => o.status === 'paid' && isToday(o.date));
  todayOrderCount.textContent = paidToday.length;
  todayTotal.textContent = formatMoney(paidToday.reduce((sum, o) => sum + o.total, 0));
}

function renderOrders() {
  const tx = t();
  if (allOrders.length === 0) {
    ordersList.innerHTML = '';
    ordersList.classList.add('hidden');
    ordersEmpty.classList.remove('hidden');
    return;
  }
  ordersEmpty.classList.add('hidden');
  ordersList.classList.remove('hidden');
  ordersList.innerHTML = allOrders.map((order) => {
    const isPending = order.status === 'pending';
    return `
      <article class="order-card" data-key="${order.firebaseKey}">
        <div class="order-card-header">
          <div class="order-card-header-row">
            <h3 class="order-card-title">${tx.orderTitle(order.orderNumber, order.table)}</h3>
            <span class="status-badge ${isPending ? 'pending' : 'paid'}">${isPending ? tx.statusPending : tx.statusPaid}</span>
          </div>
          <div class="order-card-header-row">
            <span class="order-card-date">${formatDate(order.date)}</span>
            <div class="order-actions">
              ${isPending ? `<button type="button" class="btn-paid" data-key="${order.firebaseKey}">${tx.btnPaid}</button>` : ''}
              <button type="button" class="btn-add-item" data-key="${order.firebaseKey}">${tx.btnAddItem}</button>
              <button type="button" class="btn-delete" data-key="${order.firebaseKey}" data-num="${order.orderNumber}">${tx.btnDelete}</button>
            </div>
          </div>
        </div>
        <div class="order-card-body">
          <ul class="order-items">
            ${(order.items || []).map((i) => `
              <li class="order-item">
                <span>${i.name}${i.temp ? `<br><small>${i.temp} · ${i.sweet}</small>` : ''} × ${i.qty}</span>
                <span>${formatMoney(i.price * i.qty)}</span>
              </li>`).join('')}
          </ul>
          <div class="order-total-row">
            <span>${tx.totalLabel}</span>
            <span>${formatMoney(order.total)}</span>
          </div>
        </div>
      </article>`;
  }).join('');

  ordersList.querySelectorAll('.btn-paid').forEach((btn) => {
    btn.addEventListener('click', () => markOrderAsPaid(btn.dataset.key));
  });
  ordersList.querySelectorAll('.btn-add-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const order = allOrders.find(o => o.firebaseKey === btn.dataset.key);
      if (order) openAddItemModal(btn.dataset.key, order);
    });
  });
  ordersList.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteOrder(btn.dataset.key, btn.dataset.num));
  });
}

function renderHistory() {
  const tx = t();
  const paidLast30 = allOrders.filter((o) => o.status === 'paid' && isWithinLast30Days(o.date));
  if (paidLast30.length === 0) {
    historyContent.innerHTML = ''; historyContent.classList.add('hidden'); historyEmpty.classList.remove('hidden');
    return;
  }
  historyEmpty.classList.add('hidden'); historyContent.classList.remove('hidden');
  const byDay = {};
  paidLast30.forEach((o) => {
    const key = getDateKey(o.date);
    if (!byDay[key]) byDay[key] = { date: o.date, orders: [], total: 0 };
    byDay[key].orders.push(o);
    byDay[key].total += o.total;
  });
  historyContent.innerHTML = Object.keys(byDay).sort((a, b) => b.localeCompare(a)).map((key) => {
    const day = byDay[key];
    return `
      <section class="history-day">
        <div class="history-day-header">
          <span class="history-day-date">${formatDateOnly(day.date)}</span>
          <div class="history-day-summary">
            <span class="history-day-count">${tx.orderCount(day.orders.length)}</span>
            <span class="history-day-total">${formatMoney(day.total)}</span>
          </div>
        </div>
        <div class="history-day-body">
          <ul class="history-orders">
            ${day.orders.map((o) =>
              `<li class="history-order-row"><span>${tx.orderTitle(o.orderNumber, null).replace(/<[^>]+>/g, '')} · ${formatDate(o.date)}</span><span>${formatMoney(o.total)}</span></li>`
            ).join('')}
          </ul>
        </div>
      </section>`;
  }).join('');
}

// ==================== Tabs ====================
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
  tabRecent.classList.toggle('hidden', tabId !== 'recent');
  tabHistory.classList.toggle('hidden', tabId !== 'history');
}

// ==================== Auth Events ====================
function checkAuth() {
  if (isLoggedIn()) { showScreen(dashboardScreen); startRealtimeListener(); switchTab('recent'); }
  else { showScreen(loginScreen); }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const user = usernameInput.value.trim();
  const pass = passwordInput.value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    setLoggedIn(true); showScreen(dashboardScreen); startRealtimeListener(); switchTab('recent');
  } else {
    loginError.textContent = t().loginErrorMsg;
    passwordInput.focus();
  }
});

logoutBtn.addEventListener('click', () => {
  setLoggedIn(false); showScreen(loginScreen);
  usernameInput.value = ''; passwordInput.value = ''; loginError.textContent = '';
});

document.querySelectorAll('.tab-btn').forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ==================== Clear Data Modal ====================
function openClearDataModal() {
  clearDataError.textContent = ''; clearDataCode.value = '';
  clearDataModal.setAttribute('aria-hidden', 'false'); clearDataCode.focus();
}
function closeClearDataModal() {
  clearDataModal.setAttribute('aria-hidden', 'true');
  clearDataCode.value = ''; clearDataError.textContent = '';
}

clearDataBtn.addEventListener('click', openClearDataModal);
clearDataCancel.addEventListener('click', closeClearDataModal);
clearDataModal.addEventListener('click', (e) => { if (e.target === clearDataModal) closeClearDataModal(); });

clearDataConfirm.addEventListener('click', async () => {
  clearDataError.textContent = '';
  const code = clearDataCode.value.trim();
  if (!code) { clearDataError.textContent = t().clearNoCode; clearDataCode.focus(); return; }
  if (code !== ADMIN_PASS) { clearDataError.textContent = t().clearWrongCode; clearDataCode.focus(); return; }
  if (confirm(t().clearConfirmMsg)) { await clearAllOrders(); }
});

// ==================== Export to Google Sheet ====================
function initDatePicker() {
  const today = new Date().toISOString().slice(0, 10);
  dateFrom.value = today; dateTo.value = today;
}

document.querySelectorAll('input[name="exportRange"]').forEach(radio => {
  radio.addEventListener('change', () => { customDateRange.classList.toggle('hidden', radio.value !== 'custom'); });
});

function openExportModal() {
  exportStatus.textContent = ''; exportStatus.className = 'export-status';
  exportConfirm.disabled = false; exportConfirm.textContent = t().exportConfirm;
  document.querySelector('input[name="exportRange"][value="today"]').checked = true;
  customDateRange.classList.add('hidden'); initDatePicker();
  exportModal.setAttribute('aria-hidden', 'false');
}

function closeExportModal() { exportModal.setAttribute('aria-hidden', 'true'); exportStatus.textContent = ''; }

function isInDateRange(isoString, from, to) {
  const key = getDateKey(isoString);
  return key >= from && key <= to;
}

function getFilteredOrders(range) {
  if (range === 'today') return allOrders.filter(o => isToday(o.date));
  if (range === 'month') return allOrders.filter(o => isWithinLast30Days(o.date));
  if (range === 'custom') {
    const from = dateFrom.value; const to = dateTo.value;
    if (!from || !to) return [];
    return allOrders.filter(o => isInDateRange(o.date, from, to));
  }
  return allOrders;
}

function buildSummary(orders) {
  const byDay = {};
  orders.filter(o => o.status === 'paid').forEach(o => {
    const key = getDateKey(o.date);
    if (!byDay[key]) byDay[key] = { date: key, orderCount: 0, total: 0 };
    byDay[key].orderCount++; byDay[key].total += o.total;
  });
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

exportSheetBtn.addEventListener('click', openExportModal);
exportCancel.addEventListener('click', closeExportModal);
exportModal.addEventListener('click', (e) => { if (e.target === exportModal) closeExportModal(); });

exportConfirm.addEventListener('click', async () => {
  const tx = t();
  const range = document.querySelector('input[name="exportRange"]:checked').value;
  if (range === 'custom') {
    if (!dateFrom.value || !dateTo.value) {
      exportStatus.textContent = tx.exportNoDate; exportStatus.className = 'export-status error'; return;
    }
    if (dateFrom.value > dateTo.value) {
      exportStatus.textContent = tx.exportDateError; exportStatus.className = 'export-status error'; return;
    }
  }
  const orders = getFilteredOrders(range);
  if (orders.length === 0) {
    exportStatus.textContent = tx.exportNoData; exportStatus.className = 'export-status error'; return;
  }
  exportConfirm.disabled = true; exportConfirm.textContent = tx.exportSending;
  exportStatus.textContent = ''; exportStatus.className = 'export-status';
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ orders, summary: buildSummary(orders) })
    });
    const result = await res.json();
    if (result.success) {
      exportStatus.textContent = tx.exportSuccess(result.inserted, result.skipped);
      exportStatus.className = 'export-status success';
      exportConfirm.textContent = tx.exportDone;
    } else { throw new Error(result.error || 'Unknown error'); }
  } catch (err) {
    exportStatus.textContent = tx.exportError(err.message);
    exportStatus.className = 'export-status error';
    exportConfirm.disabled = false; exportConfirm.textContent = tx.exportConfirm;
  }
});

// ==================== Lang Toggle ====================
const langToggleBtn = document.getElementById('langToggleBtn');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const newLang = getLang() === 'th' ? 'lo' : 'th';
    setLang(newLang);
    applyLang();
  });
}

// ==================== Init ====================
applyLang();
checkAuth();
