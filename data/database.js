// ===== DATABASE.JS - SALIMBOY SALE MA'LUMOTLAR BAZASI =====

const DB = {
    // ===== SOZLAMALAR =====
    settings: {
        shopName: 'Salimboy Sale',
        shopOwner: 'Salimboy',
        currency: 'so\'m',
        theme: 'dark',
        primaryColor: '#6C63FF',
        receiptFooter: 'Salimboy Sale dasturi tomonidan ishlab chiqarilgan'
    },

    // ===== KASSIRLAR =====
    cashiers: [
        { id: 1, name: 'Salimboy', code: '1111', salary: 5000000, active: true },
        { id: 2, name: 'Ali', code: '2222', salary: 4000000, active: true },
        { id: 3, name: 'Dilnoza', code: '3333', salary: 4500000, active: true },
        { id: 4, name: 'Bobur', code: '4444', salary: 3500000, active: true }
    ],

    // ===== MAHSULOTLAR =====
    products: [
        { 
            id: 1, 
            name: 'iPhone 15 Pro', 
            purchasePrice: 9800000, 
            salePrice: 12000000, 
            profit: 2200000,
            stock: 15, 
            unit: 'dona', 
            barcode: '1234567890123',
            image: 'https://picsum.photos/seed/iphone15/300/300',
            category: 'Elektronika',
            weight: null,
            createdAt: '2026-07-01'
        },
        { 
            id: 2, 
            name: 'MacBook Air M2', 
            purchasePrice: 14500000, 
            salePrice: 18000000, 
            profit: 3500000,
            stock: 8, 
            unit: 'dona', 
            barcode: '1234567890124',
            image: 'https://picsum.photos/seed/macbook/300/300',
            category: 'Elektronika',
            weight: null,
            createdAt: '2026-07-01'
        },
        { 
            id: 3, 
            name: 'Samsung TV 55"', 
            purchasePrice: 7800000, 
            salePrice: 9500000, 
            profit: 1700000,
            stock: 5, 
            unit: 'dona', 
            barcode: '1234567890125',
            image: 'https://picsum.photos/seed/samsungtv/300/300',
            category: 'Elektronika',
            weight: null,
            createdAt: '2026-07-02'
        },
        { 
            id: 4, 
            name: 'Ayollar ko\'ylagi', 
            purchasePrice: 250000, 
            salePrice: 450000, 
            profit: 200000,
            stock: 32, 
            unit: 'dona', 
            barcode: '1234567890126',
            image: 'https://picsum.photos/seed/dress/300/300',
            category: 'Kiyim',
            weight: null,
            createdAt: '2026-07-02'
        },
        { 
            id: 5, 
            name: 'Erkaklar kostyumi', 
            purchasePrice: 750000, 
            salePrice: 1200000, 
            profit: 450000,
            stock: 18, 
            unit: 'dona', 
            barcode: '1234567890127',
            image: 'https://picsum.photos/seed/suit/300/300',
            category: 'Kiyim',
            weight: null,
            createdAt: '2026-07-03'
        },
        { 
            id: 6, 
            name: 'Oziq-ovqat to\'plami', 
            purchasePrice: 150000, 
            salePrice: 250000, 
            profit: 100000,
            stock: 45, 
            unit: 'dona', 
            barcode: '1234567890128',
            image: 'https://picsum.photos/seed/food/300/300',
            category: 'Oziq-ovqat',
            weight: null,
            createdAt: '2026-07-03'
        },
        { 
            id: 7, 
            name: 'Samsung Galaxy S24', 
            purchasePrice: 7500000, 
            salePrice: 9800000, 
            profit: 2300000,
            stock: 12, 
            unit: 'dona', 
            barcode: '1234567890129',
            image: 'https://picsum.photos/seed/galaxy/300/300',
            category: 'Elektronika',
            weight: null,
            createdAt: '2026-07-04'
        },
        { 
            id: 8, 
            name: 'Olma (1 kg)', 
            purchasePrice: 8000, 
            salePrice: 15000, 
            profit: 7000,
            stock: 50, 
            unit: 'kg', 
            barcode: '1234567890130',
            image: 'https://picsum.photos/seed/apple/300/300',
            category: 'Meva',
            weight: null,
            createdAt: '2026-07-04'
        },
        { 
            id: 9, 
            name: 'Suv (1.5 L)', 
            purchasePrice: 3000, 
            salePrice: 6000, 
            profit: 3000,
            stock: 120, 
            unit: 'litr', 
            barcode: '1234567890131',
            image: 'https://picsum.photos/seed/water/300/300',
            category: 'Ichimlik',
            weight: null,
            createdAt: '2026-07-05'
        },
        { 
            id: 10, 
            name: 'Soat', 
            purchasePrice: 1800000, 
            salePrice: 3200000, 
            profit: 1400000,
            stock: 6, 
            unit: 'dona', 
            barcode: '1234567890132',
            image: 'https://picsum.photos/seed/watch/300/300',
            category: 'Aksessuarlar',
            weight: null,
            createdAt: '2026-07-05'
        }
    ],

    // ===== SAVDOLAR =====
    sales: [
        // { id, cashier, items, total, paymentType, debtor, date, shiftId, status }
    ],

    // ===== SMENALAR =====
    shifts: [
        // { id, cashier, startTime, endTime, startCash, endCash, totalSales, status }
    ],

    // ===== QARZDORLAR =====
    debtors: [
        // { id, name, phone, address, amount, date, status }
    ],

    // ===== RASHODLAR =====
    expenses: [
        // { id, category, description, amount, paymentType, date }
    ],

    // ===== HODIMLAR =====
    employees: [
        // { id, name, position, salary, phone, address, hireDate }
    ],

    // ===== QARZLAR TO'LOVI =====
    debtPayments: [
        // { id, debtorId, amount, date }
    ],

    // ===== SAVDO STATISTIKASI =====
    statistics: {
        daily: {
            cash: 0,
            terminal: 0,
            debt: 0,
            total: 0
        },
        monthly: {
            cash: 0,
            terminal: 0,
            debt: 0,
            total: 0
        },
        yearly: {
            cash: 0,
            terminal: 0,
            debt: 0,
            total: 0
        }
    }
};

// ===== LOCAL STORAGE BILAN ISHLASH =====
function saveDB() {
    localStorage.setItem('salimboy_db', JSON.stringify(DB));
}

function loadDB() {
    const data = localStorage.getItem('salimboy_db');
    if (data) {
        const parsed = JSON.parse(data);
        Object.assign(DB, parsed);
        return true;
    }
    return false;
}

// ===== ID GENERATOR =====
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ===== SANANI FORMATLASH =====
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ===== PULNI FORMATLASH =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function formatPriceShort(amount) {
    if (!amount) return '0';
    return amount.toLocaleString('uz-UZ');
}

// ===== MAHSULOT QIDIRISH =====
function findProduct(query) {
    const search = query.toLowerCase().trim();
    return DB.products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.barcode === search ||
        p.id.toString() === search
    );
}

// ===== MAHSULOT QO'SHISH =====
function addProduct(product) {
    product.id = generateId();
    product.createdAt = new Date().toISOString();
    DB.products.push(product);
    saveDB();
    return product;
}

// ===== MAHSULOT YANGILASH =====
function updateProduct(id, data) {
    const index = DB.products.findIndex(p => p.id === id);
    if (index !== -1) {
        DB.products[index] = { ...DB.products[index], ...data };
        saveDB();
        return true;
    }
    return false;
}

// ===== MAHSULOT O'CHIRISH =====
function deleteProduct(id) {
    DB.products = DB.products.filter(p => p.id !== id);
    saveDB();
    return true;
}

// ===== SMENA OCHISH =====
function openShift(cashierName, cashierCode, startCash) {
    const cashier = DB.cashiers.find(c => 
        c.name === cashierName && c.code === cashierCode
    );
    if (!cashier) {
        return { success: false, message: 'Kassir topilmadi yoki kod xato!' };
    }

    const shift = {
        id: generateId(),
        cashier: cashierName,
        cashierId: cashier.id,
        startTime: new Date().toISOString(),
        endTime: null,
        startCash: startCash || 500000,
        endCash: 0,
        totalSales: 0,
        status: 'open'
    };

    DB.shifts.push(shift);
    saveDB();
    return { success: true, shift: shift };
}

// ===== SMENA YOPISH =====
function closeShift(shiftId) {
    const shift = DB.shifts.find(s => s.id === shiftId);
    if (!shift) {
        return { success: false, message: 'Smena topilmadi!' };
    }

    shift.endTime = new Date().toISOString();
    shift.status = 'closed';
    
    // Kunlik savdoni hisobotga qo'shish
    const dailySale = {
        id: generateId(),
        shiftId: shiftId,
        cashier: shift.cashier,
        date: new Date().toISOString(),
        total: shift.totalSales,
        cash: DB.statistics.daily.cash,
        terminal: DB.statistics.daily.terminal,
        debt: DB.statistics.daily.debt
    };

    // Oylik va yillik statistikaga qo'shish
    DB.statistics.monthly.total += shift.totalSales;
    DB.statistics.yearly.total += shift.totalSales;

    saveDB();
    return { success: true, dailySale: dailySale };
}

// ===== SAVDO QO'SHISH =====
function addSale(saleData) {
    const sale = {
        id: generateId(),
        ...saleData,
        date: new Date().toISOString(),
        status: 'completed'
    };

    DB.sales.push(sale);
    
    // Statistikani yangilash
    if (saleData.paymentType === 'cash') {
        DB.statistics.daily.cash += saleData.total;
        DB.statistics.monthly.cash += saleData.total;
        DB.statistics.yearly.cash += saleData.total;
    } else if (saleData.paymentType === 'terminal') {
        DB.statistics.daily.terminal += saleData.total;
        DB.statistics.monthly.terminal += saleData.total;
        DB.statistics.yearly.terminal += saleData.total;
    } else if (saleData.paymentType === 'debt') {
        DB.statistics.daily.debt += saleData.total;
        DB.statistics.monthly.debt += saleData.total;
        DB.statistics.yearly.debt += saleData.total;
    }

    DB.statistics.daily.total += saleData.total;
    DB.statistics.monthly.total += saleData.total;
    DB.statistics.yearly.total += saleData.total;

    // Mahsulot zaxirasini kamaytirish
    saleData.items.forEach(item => {
        const product = DB.products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    // Nasiya bo'lsa qarzdor qo'shish
    if (saleData.paymentType === 'debt' && saleData.debtor) {
        DB.debtors.push({
            id: generateId(),
            name: saleData.debtor.name,
            phone: saleData.debtor.phone,
            address: saleData.debtor.address,
            amount: saleData.total,
            date: new Date().toISOString(),
            status: 'pending'
        });
    }

    saveDB();
    return sale;
}

// ===== RASHOD QO'SHISH =====
function addExpense(expenseData) {
    const expense = {
        id: generateId(),
        ...expenseData,
        date: new Date().toISOString()
    };
    DB.expenses.push(expense);
    saveDB();
    return expense;
}

// ===== QARZDOR TO'LOVI =====
function payDebt(debtorId, amount) {
    const debtor = DB.debtors.find(d => d.id === debtorId);
    if (!debtor) {
        return { success: false, message: 'Qarzdor topilmadi!' };
    }

    if (amount >= debtor.amount) {
        // To'liq to'landi
        debtor.status = 'paid';
        debtor.paidDate = new Date().toISOString();
        // O'chirish o'rniga statusni o'zgartirish
    } else {
        debtor.amount -= amount;
    }

    // To'lov tarixiga qo'shish
    DB.debtPayments.push({
        id: generateId(),
        debtorId: debtorId,
        amount: amount,
        date: new Date().toISOString()
    });

    saveDB();
    return { success: true, debtor: debtor };
}

// ===== MA'LUMOTLARNI YUKLASH =====
if (!loadDB()) {
    saveDB();
}

console.log('📊 Ma\'lumotlar bazasi yuklandi!');
console.log('🏷️ Salimboy Sale v1.0');