/**
 * lang.js — ระบบสลับภาษา ไทย / ລາວ
 * ใช้ localStorage เก็บค่าภาษาที่เลือก
 */

export const LANG_KEY = 'pos2laos-lang';

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'th';
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

// ==================== POS (index.html / app.js) ====================
export const T_POS = {
  th: {
    // Header
    shopName: 'ครัวไทย เวียงจันทร์ / ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ',
    orderLabel: 'ออเดอร์ #',
    tableLabel: (n) => `· โต๊ะ ${n}`,

    // Table bar
    selectTable: '🪑 เลือกโต๊ะ',
    pleaseSelectTable: 'กรุณาเลือกโต๊ะก่อน',

    // Categories
    catPad: 'ຜັດ / ผัด',
    catKhao: 'ເຂົ້າ / ข้าว',
    catTom: 'ຕົ້ມ / ต้ม',
    catNam: 'ນ້ຳ / น้ำ',

    // Cart
    cartTitle: 'รายการสั่งซื้อ',
    cartEmpty: 'ยังไม่มีรายการ',
    total: 'รวมทั้งหมด',
    clearCart: '🗑 ล้าง',
    completeOrder: '✓ สั่งซื้อ',

    // Confirm modal
    confirmTitle: 'ยืนยันสั่งซื้อ',
    tableOf: (n) => `โต๊ะ ${n}`,
    confirmCancel: 'ยกเลิก',
    confirmOk: '✓ ยืนยัน',

    // Receipt
    receiptShop: 'ครัวไทย เวียงจันทร์ / ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ',
    receiptOrder: 'ออเดอร์ #',
    receiptTable: (n) => `โต๊ะ ${n}`,
    receiptTotalLabel: 'รวมทั้งหมด',
    receiptFooter: 'ขอบคุณที่ใช้บริการ 🙏',
    printBtn: '🖨 พิมพ์',
    newOrderBtn: 'ออเดอร์ใหม่',

    // Lang button
    langBtn: '🇱🇦 ລາວ',
  },
  lo: {
    // Header
    shopName: 'ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ / ครัวไทย เวียงจันทร์',
    orderLabel: 'ອໍເດີ #',
    tableLabel: (n) => `· ໂຕະ ${n}`,

    // Table bar
    selectTable: '🪑 ເລືອກໂຕະ',
    pleaseSelectTable: 'ກະລຸນາເລືອກໂຕະກ່ອນ',

    // Categories
    catPad: 'ຜັດ / ผัด',
    catKhao: 'ເຂົ້າ / ข้าว',
    catTom: 'ຕົ້ມ / ต้ม',
    catNam: 'ນ້ຳ / น้ำ',

    // Cart
    cartTitle: 'ລາຍການສັ່ງ',
    cartEmpty: 'ຍັງບໍ່ມີລາຍການ',
    total: 'ລວມທັງໝົດ',
    clearCart: '🗑 ລ້າງ',
    completeOrder: '✓ ສັ່ງ',

    // Confirm modal
    confirmTitle: 'ຢືນຢັນການສັ່ງ',
    tableOf: (n) => `ໂຕະ ${n}`,
    confirmCancel: 'ຍົກເລີກ',
    confirmOk: '✓ ຢືນຢັນ',

    // Receipt
    receiptShop: 'ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ / ครัวไทย เวียงจันทร์',
    receiptOrder: 'ອໍເດີ #',
    receiptTable: (n) => `ໂຕະ ${n}`,
    receiptTotalLabel: 'ລວມທັງໝົດ',
    receiptFooter: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ 🙏',
    printBtn: '🖨 ພິມ',
    newOrderBtn: 'ອໍເດີໃໝ່',

    // Lang button
    langBtn: '🇹🇭 ไทย',
  },
};

// ==================== ADMIN (admin.html / admin.js) ====================
export const T_ADMIN = {
  th: {
    // Login
    loginTitle: 'ครัวไทย เวียงจันทร์ / ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ',
    loginSub: 'เข้าสู่ระบบแอดมิน',
    usernameLabel: 'ชื่อผู้ใช้',
    passwordLabel: 'รหัสผ่าน',
    loginBtn: 'เข้าสู่ระบบ',
    backToPOS: '← กลับไป POS',
    loginErrorMsg: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',

    // Header
    adminTitle: '🍚 แอดมิน',
    exportBtn: 'Export Sheet',
    clearDataBtn: '🗑 ล้างข้อมูล',
    posLink: 'POS',
    logoutBtn: 'ออกจากระบบ',

    // Summary
    todayOrderLabel: 'ออเดอร์วันนี้ (จ่ายแล้ว)',
    todayTotalLabel: 'ยอดรวมวันนี้',

    // Tabs
    tabRecent: 'รายการล่าสุด',
    tabHistory: 'ย้อนหลัง 1 เดือน',

    // Order cards
    orderTitle: (num, table) => `ออเดอร์ #${num}${table ? ` <span class="order-table-chip">โต๊ะ ${table}</span>` : ''}`,
    statusPending: '⏳ รอจ่าย',
    statusPaid: '✅ จ่ายแล้ว',
    btnPaid: 'จ่ายแล้ว',
    btnAddItem: '+ เพิ่มเมนู',
    btnDelete: 'ลบ',
    totalLabel: 'รวมทั้งหมด',

    // Empty states
    noOrders: 'ยังไม่มีรายการสั่งซื้อ',
    goToPOS: 'ไปที่ POS →',
    noHistory: 'ไม่มีข้อมูลย้อนหลัง',

    // History
    orderCount: (n) => `${n} ออเดอร์`,

    // Export modal
    exportTitle: '📊 Export to Google Sheet',
    exportDesc: 'เลือกช่วงวันที่ต้องการส่งไป Google Sheet',
    exportToday: 'วันนี้เท่านั้น',
    exportMonth: 'ย้อนหลัง 30 วัน',
    exportCustom: 'เลือกช่วงวันเอง',
    dateFrom: 'จาก',
    dateTo: 'ถึง',
    exportCancel: 'ยกเลิก',
    exportConfirm: '📤 ส่งข้อมูล',
    exportSending: 'กำลังส่ง...',
    exportSuccess: (ins, skip) => `✅ ส่งสำเร็จ! ${ins} ออเดอร์ (ข้ามซ้ำ ${skip} รายการ)`,
    exportDone: '✅ สำเร็จ',
    exportNoData: '⚠️ ไม่มีข้อมูลในช่วงที่เลือก',
    exportNoDate: '⚠️ กรุณาเลือกวันที่ให้ครบ',
    exportDateError: '⚠️ วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด',
    exportError: (msg) => '❌ เกิดข้อผิดพลาด: ' + msg,

    // Clear data modal
    clearTitle: '🗑 ล้างรายการสั่งซื้อทั้งหมด',
    clearDesc: 'กรอกรหัสเพื่อยืนยันการล้างข้อมูลทั้งหมดและรีเซ็ตหมายเลขออเดอร์',
    clearCodeLabel: 'รหัสยืนยัน',
    clearCancel: 'ยกเลิก',
    clearConfirm: 'ล้างข้อมูล',
    clearNoCode: 'กรุณาใส่รหัส',
    clearWrongCode: 'รหัสไม่ถูกต้อง',
    clearConfirmMsg: 'ยืนยันล้างรายการสั่งซื้อทั้งหมดและรีเซ็ตหมายเลขออเดอร์เป็น 1001?',
    deleteOrderMsg: (num) => `ลบออเดอร์ #${num} ?`,

    // Add Item modal
    addItemTitle: '🍽 เพิ่มเมนูในออเดอร์',
    addItemDesc: 'เลือกเมนูที่ต้องการเพิ่มในออเดอร์นี้',
    addItemCancel: 'ยกเลิก',
    addItemToast: (name) => `✅ เพิ่ม "${name}" แล้ว`,

    // Add item categories
    catAll: '🍽 ທັງໝົດ',
    catPad: '🥘 ຜັດ/ผัด',
    catKhao: '🍚 ເຂົ້າ/ข้าว',
    catTom: '🍲 ຕົ້ມ/ต้ม',
    catDrink: '🥤 ນ້ຳ/น้ำ',

    // Lang button
    langBtn: '🇱🇦 ລາວ',
  },
  lo: {
    // Login
    loginTitle: 'ຮ້ານອາຫານມື້ທ່ຽງ ວຽງຈັນ / ครัวไทย เวียงจันทร์',
    loginSub: 'ເຂົ້າສູ່ລະບົບແອດມິນ',
    usernameLabel: 'ຊື່ຜູ້ໃຊ້',
    passwordLabel: 'ລະຫັດຜ່ານ',
    loginBtn: 'ເຂົ້າສູ່ລະບົບ',
    backToPOS: '← ກັບໄປ POS',
    loginErrorMsg: 'ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ',

    // Header
    adminTitle: '🍚 ແອດມິນ',
    exportBtn: 'Export Sheet',
    clearDataBtn: '🗑 ລ້າງຂໍ້ມູນ',
    posLink: 'POS',
    logoutBtn: 'ອອກຈາກລະບົບ',

    // Summary
    todayOrderLabel: 'ອໍເດີວັນນີ້ (ຈ່າຍແລ້ວ)',
    todayTotalLabel: 'ຍອດລວມວັນນີ້',

    // Tabs
    tabRecent: 'ລາຍການຫຼ້າສຸດ',
    tabHistory: 'ຍ້ອນຫຼັງ 1 ເດືອນ',

    // Order cards
    orderTitle: (num, table) => `ອໍເດີ #${num}${table ? ` <span class="order-table-chip">ໂຕະ ${table}</span>` : ''}`,
    statusPending: '⏳ ລໍຖ້າຈ່າຍ',
    statusPaid: '✅ ຈ່າຍແລ້ວ',
    btnPaid: 'ຈ່າຍແລ້ວ',
    btnAddItem: '+ ເພີ່ມເມນູ',
    btnDelete: 'ລຶບ',
    totalLabel: 'ລວມທັງໝົດ',

    // Empty states
    noOrders: 'ຍັງບໍ່ມີລາຍການສັ່ງ',
    goToPOS: 'ໄປທີ່ POS →',
    noHistory: 'ບໍ່ມີຂໍ້ມູນຍ້ອນຫຼັງ',

    // History
    orderCount: (n) => `${n} ອໍເດີ`,

    // Export modal
    exportTitle: '📊 Export to Google Sheet',
    exportDesc: 'ເລືອກຊ່ວງວັນທີ່ຕ້ອງການສົ່ງໄປ Google Sheet',
    exportToday: 'ວັນນີ້ເທົ່ານັ້ນ',
    exportMonth: 'ຍ້ອນຫຼັງ 30 ວັນ',
    exportCustom: 'ເລືອກຊ່ວງວັນເອງ',
    dateFrom: 'ຈາກ',
    dateTo: 'ຫາ',
    exportCancel: 'ຍົກເລີກ',
    exportConfirm: '📤 ສົ່ງຂໍ້ມູນ',
    exportSending: 'ກຳລັງສົ່ງ...',
    exportSuccess: (ins, skip) => `✅ ສົ່ງສຳເລັດ! ${ins} ອໍເດີ (ຂ້າມຊ້ຳ ${skip} ລາຍການ)`,
    exportDone: '✅ ສຳເລັດ',
    exportNoData: '⚠️ ບໍ່ມີຂໍ້ມູນໃນຊ່ວງທີ່ເລືອກ',
    exportNoDate: '⚠️ ກະລຸນາເລືອກວັນທີ່ໃຫ້ຄົບ',
    exportDateError: '⚠️ ວັນທີ່ເລີ່ມຕ້ອງບໍ່ເກີນວັນທີ່ສິ້ນສຸດ',
    exportError: (msg) => '❌ ເກີດຂໍ້ຜິດພາດ: ' + msg,

    // Clear data modal
    clearTitle: '🗑 ລ້າງລາຍການສັ່ງທັງໝົດ',
    clearDesc: 'ປ້ອນລະຫັດເພື່ອຢືນຢັນການລ້າງຂໍ້ມູນທັງໝົດ ແລະ ຣີເຊັດໝາຍເລກອໍເດີ',
    clearCodeLabel: 'ລະຫັດຢືນຢັນ',
    clearCancel: 'ຍົກເລີກ',
    clearConfirm: 'ລ້າງຂໍ້ມູນ',
    clearNoCode: 'ກະລຸນາໃສ່ລະຫັດ',
    clearWrongCode: 'ລະຫັດບໍ່ຖືກຕ້ອງ',
    clearConfirmMsg: 'ຢືນຢັນລ້າງລາຍການສັ່ງທັງໝົດ ແລະ ຣີເຊັດໝາຍເລກອໍເດີເປັນ 1001?',
    deleteOrderMsg: (num) => `ລຶບອໍເດີ #${num} ?`,

    // Add Item modal
    addItemTitle: '🍽 ເພີ່ມເມນູໃນອໍເດີ',
    addItemDesc: 'ເລືອກເມນູທີ່ຕ້ອງການເພີ່ມໃນອໍເດີນີ້',
    addItemCancel: 'ຍົກເລີກ',
    addItemToast: (name) => `✅ ເພີ່ມ "${name}" ແລ້ວ`,

    // Add item categories
    catAll: '🍽 ທັງໝົດ',
    catPad: '🥘 ຜັດ/ผัด',
    catKhao: '🍚 ເຂົ້າ/ข้าว',
    catTom: '🍲 ຕົ້ມ/ต้ม',
    catDrink: '🥤 ນ້ຳ/น้ำ',

    // Lang button
    langBtn: '🇹🇭 ไทย',
  },
};
