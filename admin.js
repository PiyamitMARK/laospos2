/**
 * Admin — Tea & Coffee Shop
 * ใช้ Firebase Realtime Database — sync ทุกเครื่องแบบ real-time
 * Login: Mixzaza / 121212
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// ==================== Config ====================
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
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setLoggedIn(value) {
  value ? sessionStorage.setItem(AUTH_KEY, 'true') : sessionStorage.removeItem(AUTH_KEY);
}

function showScreen(screen) {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// ==================== Helpers ====================
function formatMoney(n) {
  return '฿' + Number(n).toFixed(2);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDateOnly(isoString) {
  return new Date(isoString).toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getDateKey(isoString) {
  return new Date(isoString).toISOString().slice(0, 10);
}

function isToday(isoString) {
  return getDateKey(isoString) === new Date().toISOString().slice(0, 10);
}

function isWithinLast30Days(isoString) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return new Date(isoString) >= cutoff;
}

// ==================== Firebase: Real-time Listener ====================
function startRealtimeListener() {
  onValue(ref(db, 'orders'), (snapshot) => {
    allOrders = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        allOrders.push({ firebaseKey: child.key, ...child.val() });
      });
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
  if (!confirm(`ลบออเดอร์ #${orderNumber} ?`)) return;
  await remove(ref(db, `orders/${firebaseKey}`));
}

async function clearAllOrders() {
  await remove(ref(db, 'orders'));
  await update(ref(db, 'meta'), { orderNumber: 1001, lastOrderDate: new Date().toISOString().slice(0, 10) });
  closeClearDataModal();
}

// ==================== Products (for admin add-item) ====================
const ALL_PRODUCTS = [
  { id: 'kao1', name: 'กะเพราหมูสับ', price: 55 },
  { id: 'kao2', name: 'กะเพราหมูกรอบ', price: 55 },
  { id: 'kao3', name: 'ข้าวผัดหมู', price: 55 },
  { id: 'kao4', name: 'ข้าวหมูกระเทียม', price: 45 },
  { id: 'kao5', name: 'ข้าวไข่เจียว', price: 60 },
  { id: 'kao6', name: 'ข้าวผัดพริกแกงหมู', price: 55 },
  { id: 'kao7', name: 'ข้าวพะแนง', price: 55 },
  { id: 'kao8', name: 'ข้าวคะน้าหมูกรอบ', price: 60 },
  { id: 'kao9', name: 'ราดหน้า', price: 55 },
  { id: 'kao10', name: 'ผัดซีอิ๊ว', price: 60 },
  { id: 'water', name: 'น้ำเปล่า', price: 10 },
  { id: 'pepsi', name: 'เป็ปซี่', price: 15 },
  { id: 'fanta', name: 'น้ำแดงแฟนต้า', price: 15 },
  { id: 'sprite', name: 'สไปร์ท', price: 15 },
];

// ==================== Add Item Modal ====================
let addItemTargetKey = null;
let addItemTargetOrder = null;

const addItemModal = document.getElementById('addItemModal');
const addItemProductList = document.getElementById('addItemProductList');
const addItemCancel = document.getElementById('addItemCancel');

// toast message element inside add item modal
let addItemToast = null;

function openAddItemModal(firebaseKey, order) {
  addItemTargetKey = firebaseKey;
  addItemTargetOrder = JSON.parse(JSON.stringify(order)); // deep clone เพื่อ track local state
  renderAddItemList();
  addItemModal.setAttribute('aria-hidden', 'false');
}

function renderAddItemList() {
  // นับ qty ที่เพิ่มไปแล้วใน session นี้
  const currentItems = addItemTargetOrder.items || [];

  addItemProductList.innerHTML = ALL_PRODUCTS.map(p => {
    const existing = currentItems.find(i => i.name === p.name);
    const qty = existing ? existing.qty : 0;
    return `
      <button type="button" class="add-item-product-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
        <span class="add-item-product-name">${p.name}</span>
        <span class="add-item-product-price">${formatMoney(p.price)}</span>
        ${qty > 0 ? `<span class="add-item-qty-badge">${qty}</span>` : ''}
      </button>
    `;
  }).join('');

  addItemProductList.querySelectorAll('.add-item-product-btn').forEach(btn => {
    btn.addEventListener('click', () => addItemToOrder(btn.dataset, btn));
  });
}

function closeAddItemModal() {
  addItemModal.setAttribute('aria-hidden', 'true');
  addItemTargetKey = null;
  addItemTargetOrder = null;
  if (addItemToast) { clearTimeout(addItemToast); addItemToast = null; }
  const toast = document.getElementById('addItemToastMsg');
  if (toast) toast.textContent = '';
}

async function addItemToOrder({ name, price }, btnEl) {
  if (!addItemTargetKey || !addItemTargetOrder) return;

  // อัปเดต local state
  const items = addItemTargetOrder.items || [];
  const existing = items.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ name, price: parseFloat(price), qty: 1 });
  }
  addItemTargetOrder.items = items;
  addItemTargetOrder.total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // บันทึก Firebase
  await update(ref(db, `orders/${addItemTargetKey}`), {
    items: addItemTargetOrder.items,
    total: addItemTargetOrder.total,
  });

  // แสดง toast ข้อความ
  const toast = document.getElementById('addItemToastMsg');
  if (toast) {
    toast.textContent = `✅ เพิ่ม "${name}" แล้ว`;
    toast.className = 'add-item-toast show';
    if (addItemToast) clearTimeout(addItemToast);
    addItemToast = setTimeout(() => {
      toast.className = 'add-item-toast';
    }, 2000);
  }

  // re-render list เพื่ออัปเดต badge qty
  renderAddItemList();
}

if (addItemCancel) addItemCancel.addEventListener('click', closeAddItemModal);
if (addItemModal) addItemModal.addEventListener('click', (e) => { if (e.target === addItemModal) closeAddItemModal(); });


function renderDailySummary() {
  const paidToday = allOrders.filter((o) => o.status === 'paid' && isToday(o.date));
  todayOrderCount.textContent = paidToday.length;
  todayTotal.textContent = formatMoney(paidToday.reduce((sum, o) => sum + o.total, 0));
}

function renderOrders() {
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
            <h3 class="order-card-title">ออเดอร์ #${order.orderNumber}${order.table ? ` <span class="order-table-chip">โต๊ะ ${order.table}</span>` : ''}</h3>
            <span class="status-badge ${isPending ? 'pending' : 'paid'}">${isPending ? '⏳ รอจ่าย' : '✅ จ่ายแล้ว'}</span>
          </div>
          <div class="order-card-header-row">
            <span class="order-card-date">${formatDate(order.date)}</span>
            <div class="order-actions">
              ${isPending ? `<button type="button" class="btn-paid" data-key="${order.firebaseKey}">จ่ายแล้ว</button>` : ''}
              <button type="button" class="btn-add-item" data-key="${order.firebaseKey}">+ เพิ่มเมนู</button>
              <button type="button" class="btn-delete" data-key="${order.firebaseKey}" data-num="${order.orderNumber}">ลบ</button>
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
            <span>รวมทั้งหมด</span>
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
  const paidLast30 = allOrders.filter((o) => o.status === 'paid' && isWithinLast30Days(o.date));

  if (paidLast30.length === 0) {
    historyContent.innerHTML = '';
    historyContent.classList.add('hidden');
    historyEmpty.classList.remove('hidden');
    return;
  }

  historyEmpty.classList.add('hidden');
  historyContent.classList.remove('hidden');

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
            <span class="history-day-count">${day.orders.length} ออเดอร์</span>
            <span class="history-day-total">${formatMoney(day.total)}</span>
          </div>
        </div>
        <div class="history-day-body">
          <ul class="history-orders">
            ${day.orders.map((o) =>
              `<li class="history-order-row"><span>ออเดอร์ #${o.orderNumber} · ${formatDate(o.date)}</span><span>${formatMoney(o.total)}</span></li>`
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
  if (isLoggedIn()) {
    showScreen(dashboardScreen);
    startRealtimeListener();
    switchTab('recent');
  } else {
    showScreen(loginScreen);
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const user = usernameInput.value.trim();
  const pass = passwordInput.value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    setLoggedIn(true);
    showScreen(dashboardScreen);
    startRealtimeListener();
    switchTab('recent');
  } else {
    loginError.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    passwordInput.focus();
  }
});

logoutBtn.addEventListener('click', () => {
  setLoggedIn(false);
  showScreen(loginScreen);
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
});

document.querySelectorAll('.tab-btn').forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ==================== Clear Data Modal ====================
function openClearDataModal() {
  clearDataError.textContent = '';
  clearDataCode.value = '';
  clearDataModal.setAttribute('aria-hidden', 'false');
  clearDataCode.focus();
}

function closeClearDataModal() {
  clearDataModal.setAttribute('aria-hidden', 'true');
  clearDataCode.value = '';
  clearDataError.textContent = '';
}

clearDataBtn.addEventListener('click', openClearDataModal);
clearDataCancel.addEventListener('click', closeClearDataModal);
clearDataModal.addEventListener('click', (e) => { if (e.target === clearDataModal) closeClearDataModal(); });

clearDataConfirm.addEventListener('click', async () => {
  clearDataError.textContent = '';
  const code = clearDataCode.value.trim();
  if (!code) { clearDataError.textContent = 'กรุณาใส่รหัส'; clearDataCode.focus(); return; }
  if (code !== ADMIN_PASS) { clearDataError.textContent = 'รหัสไม่ถูกต้อง'; clearDataCode.focus(); return; }
  if (confirm('ยืนยันล้างรายการสั่งซื้อทั้งหมดและรีเซ็ตหมายเลขออเดอร์เป็น 1001?')) {
    await clearAllOrders();
  }
});

// ==================== Export to Google Sheet ====================
function initDatePicker() {
  const today = new Date().toISOString().slice(0, 10);
  dateFrom.value = today;
  dateTo.value = today;
}

document.querySelectorAll('input[name="exportRange"]').forEach(radio => {
  radio.addEventListener('change', () => {
    customDateRange.classList.toggle('hidden', radio.value !== 'custom');
  });
});

function openExportModal() {
  exportStatus.textContent = '';
  exportStatus.className = 'export-status';
  exportConfirm.disabled = false;
  exportConfirm.textContent = '📤 ส่งข้อมูล';
  document.querySelector('input[name="exportRange"][value="today"]').checked = true;
  customDateRange.classList.add('hidden');
  initDatePicker();
  exportModal.setAttribute('aria-hidden', 'false');
}

function closeExportModal() {
  exportModal.setAttribute('aria-hidden', 'true');
  exportStatus.textContent = '';
}

function isInDateRange(isoString, from, to) {
  const key = getDateKey(isoString);
  return key >= from && key <= to;
}

function getFilteredOrders(range) {
  if (range === 'today') return allOrders.filter(o => isToday(o.date));
  if (range === 'month') return allOrders.filter(o => isWithinLast30Days(o.date));
  if (range === 'custom') {
    const from = dateFrom.value;
    const to = dateTo.value;
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
    byDay[key].orderCount++;
    byDay[key].total += o.total;
  });
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

exportSheetBtn.addEventListener('click', openExportModal);
exportCancel.addEventListener('click', closeExportModal);
exportModal.addEventListener('click', (e) => { if (e.target === exportModal) closeExportModal(); });

exportConfirm.addEventListener('click', async () => {
  const range = document.querySelector('input[name="exportRange"]:checked').value;
  if (range === 'custom') {
    if (!dateFrom.value || !dateTo.value) {
      exportStatus.textContent = '⚠️ กรุณาเลือกวันที่ให้ครบ';
      exportStatus.className = 'export-status error';
      return;
    }
    if (dateFrom.value > dateTo.value) {
      exportStatus.textContent = '⚠️ วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด';
      exportStatus.className = 'export-status error';
      return;
    }
  }

  const orders = getFilteredOrders(range);
  if (orders.length === 0) {
    exportStatus.textContent = '⚠️ ไม่มีข้อมูลในช่วงที่เลือก';
    exportStatus.className = 'export-status error';
    return;
  }

  exportConfirm.disabled = true;
  exportConfirm.textContent = 'กำลังส่ง...';
  exportStatus.textContent = '';
  exportStatus.className = 'export-status';

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ orders, summary: buildSummary(orders) })
    });
    const result = await res.json();
    if (result.success) {
      exportStatus.textContent = `✅ ส่งสำเร็จ! ${result.inserted} ออเดอร์ (ข้ามซ้ำ ${result.skipped} รายการ)`;
      exportStatus.className = 'export-status success';
      exportConfirm.textContent = '✅ สำเร็จ';
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (err) {
    exportStatus.textContent = '❌ เกิดข้อผิดพลาด: ' + err.message;
    exportStatus.className = 'export-status error';
    exportConfirm.disabled = false;
    exportConfirm.textContent = '📤 ส่งข้อมูล';
  }
});

// ==================== Init ====================
checkAuth();
