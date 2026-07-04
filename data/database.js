// ===== DATABASE.JS - MA'LUMOTLAR BAZASI (TO'LIQ) =====

var DB = {
    products: [],
    sales: [],
    debtors: [],
    expenses: [],
    employees: [],
    shifts: [],
    dailySales: [],
    cashiers: [
        { id: 1, name: 'Salimboy', code: '1111', salary: 5000000, active: true },
        { id: 2, name: 'Ali', code: '2222', salary: 4000000, active: true },
        { id: 3, name: 'Dilnoza', code: '3333', salary: 4500000, active: true },
        { id: 4, name: 'Bobur', code: '4444', salary: 3500000, active: true }
    ],
    settings: {
        shopName: 'Salimboy Sale',
        shopOwner: 'Salimboy',
        theme: 'dark',
        primaryColor: '#6C63FF',
        receiptFooter: 'Salimboy Sale dasturi'
    },
    statistics: {
        daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
        monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
        yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
    },
    dailyStats: {
        cash: 0,
        terminal: 0,
        debt: 0,
        total: 0
    }
};

// ===== MA'LUMOTLARNI YUKLASH =====
function loadDB() {
    try {
        var data = localStorage.getItem('salimboy_db');
        if (data) {
            var parsed = JSON.parse(data);
            Object.assign(DB, parsed);
            console.log('✅ Ma\'lumotlar bazasi yuklandi!');
            console.log('📦 Mahsulotlar soni:', DB.products ? DB.products.length : 0);
            console.log('📊 Savdolar soni:', DB.sales ? DB.sales.length : 0);
            console.log('📈 Kunlik statistika:', DB.statistics ? DB.statistics.daily : 'Mavjud emas');
            return true;
        }
    } catch(e) {
        console.log('⚠️ Yuklashda xatolik:', e);
    }
    console.log('⚠️ LocalStorage da ma\'lumot topilmadi, default qiymatlar ishlatiladi');
    return false;
}

// ===== MA'LUMOTLARNI SAQLASH =====
function saveDB() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('✅ Ma\'lumotlar saqlandi!');
        return true;
    } catch(e) {
        console.log('⚠️ Saqlashda xatolik:', e);
        return false;
    }
}

// ===== KUNLIK STATISTIKANI 0 GA TUSHIRISH =====
function resetDailyStats() {
    try {
        if (!DB.statistics) {
            DB.statistics = {
                daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
                monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
                yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
            };
        }
        
        if (DB.statistics.daily) {
            DB.statistics.daily.cash = 0;
            DB.statistics.daily.terminal = 0;
            DB.statistics.daily.debt = 0;
            DB.statistics.daily.total = 0;
        }
        
        if (DB.dailyStats) {
            DB.dailyStats.cash = 0;
            DB.dailyStats.terminal = 0;
            DB.dailyStats.debt = 0;
            DB.dailyStats.total = 0;
        }
        
        saveDB();
        console.log('📊 Kunlik statistika 0 ga tushirildi');
        return true;
    } catch(e) {
        console.log('Statistikani tozalashda xatolik:', e);
        return false;
    }
}

// ===== YANGI KUNNI TEKSHIRISH =====
function checkNewDay() {
    try {
        var today = new Date().toDateString();
        var lastDate = localStorage.getItem('lastSaleDate');
        
        if (lastDate && lastDate !== today) {
            // Yangi kun - statistikani tozalash
            resetDailyStats();
            console.log('📅 Yangi kun boshlandi! (' + today + ') Statistika tozalandi.');
        }
        localStorage.setItem('lastSaleDate', today);
        return true;
    } catch(e) {
        console.log('Kunni tekshirishda xatolik:', e);
        return false;
    }
}

// ===== SMENA HOLATINI TEKSHIRISH =====
function getShiftStatus() {
    try {
        if (!DB.shifts || DB.shifts.length === 0) {
            return { open: false, shift: null };
        }
        
        for (var i = 0; i < DB.shifts.length; i++) {
            if (DB.shifts[i].status === 'open') {
                return { open: true, shift: DB.shifts[i] };
            }
        }
        return { open: false, shift: null };
    } catch(e) {
        console.log('Smena holatini tekshirishda xatolik:', e);
        return { open: false, shift: null };
    }
}

// ===== KUNLIK SAVDONI OLISH =====
function getDailyTotal() {
    try {
        if (DB.statistics && DB.statistics.daily) {
            return DB.statistics.daily.total || 0;
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

// ===== OYLIK SAVDONI OLISH =====
function getMonthlyTotal() {
    try {
        if (DB.statistics && DB.statistics.monthly) {
            return DB.statistics.monthly.total || 0;
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

// ===== YILLIK SAVDONI OLISH =====
function getYearlyTotal() {
    try {
        if (DB.statistics && DB.statistics.yearly) {
            return DB.statistics.yearly.total || 0;
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

// ===== MAHSULOT QO'SHISH =====
function addProductToDB(product) {
    try {
        if (!DB.products) DB.products = [];
        product.id = Date.now() + Math.floor(Math.random() * 1000);
        product.createdAt = new Date().toISOString();
        DB.products.push(product);
        saveDB();
        console.log('✅ Mahsulot qo\'shildi:', product.name);
        return product;
    } catch(e) {
        console.log('Mahsulot qo\'shishda xatolik:', e);
        return null;
    }
}

// ===== SAVDO QO'SHISH =====
function addSaleToDB(saleData) {
    try {
        if (!DB.sales) DB.sales = [];
        var sale = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            cashier: saleData.cashier || 'Noma\'lum',
            items: saleData.items || [],
            total: saleData.total || 0,
            paymentType: saleData.paymentType || 'cash',
            debtor: saleData.debtor || null,
            date: saleData.date || new Date().toISOString(),
            status: saleData.status || 'completed',
            discount: saleData.discount || 0,
            discountPercent: saleData.discountPercent || 0
        };
        DB.sales.push(sale);
        
        // Statistikani yangilash
        if (!DB.statistics) {
            DB.statistics = {
                daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
                monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
                yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
            };
        }
        
        // Kunlik statistika
        if (!DB.statistics.daily) {
            DB.statistics.daily = { cash: 0, terminal: 0, debt: 0, total: 0 };
        }
        
        if (saleData.paymentType === 'cash') {
            DB.statistics.daily.cash += saleData.total;
        } else if (saleData.paymentType === 'terminal') {
            DB.statistics.daily.terminal += saleData.total;
        } else if (saleData.paymentType === 'debt') {
            DB.statistics.daily.debt += saleData.total;
        }
        DB.statistics.daily.total += saleData.total;
        
        // Oylik va yillik
        if (!DB.statistics.monthly) {
            DB.statistics.monthly = { cash: 0, terminal: 0, debt: 0, total: 0 };
        }
        if (!DB.statistics.yearly) {
            DB.statistics.yearly = { cash: 0, terminal: 0, debt: 0, total: 0 };
        }
        DB.statistics.monthly.total += saleData.total;
        DB.statistics.yearly.total += saleData.total;
        
        // dailyStats ni yangilash
        if (!DB.dailyStats) {
            DB.dailyStats = { cash: 0, terminal: 0, debt: 0, total: 0 };
        }
        if (saleData.paymentType === 'cash') {
            DB.dailyStats.cash += saleData.total;
        } else if (saleData.paymentType === 'terminal') {
            DB.dailyStats.terminal += saleData.total;
        } else if (saleData.paymentType === 'debt') {
            DB.dailyStats.debt += saleData.total;
        }
        DB.dailyStats.total += saleData.total;
        
        // Mahsulot zaxirasini kamaytirish
        if (saleData.items) {
            for (var i = 0; i < saleData.items.length; i++) {
                var item = saleData.items[i];
                for (var j = 0; j < DB.products.length; j++) {
                    if (DB.products[j].id === item.id) {
                        DB.products[j].stock -= item.quantity;
                        break;
                    }
                }
            }
        }
        
        // Nasiya bo'lsa qarzdor qo'shish
        if (saleData.paymentType === 'debt' && saleData.debtor) {
            if (!DB.debtors) DB.debtors = [];
            DB.debtors.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: saleData.debtor.name,
                phone: saleData.debtor.phone,
                address: saleData.debtor.address || '-',
                amount: saleData.total,
                date: saleData.date || new Date().toISOString(),
                status: 'pending'
            });
        }
        
        saveDB();
        console.log('✅ Savdo qo\'shildi, ID:', sale.id);
        console.log('📊 Kunlik statistika:', DB.dailyStats);
        return sale;
    } catch(e) {
        console.log('Savdo qo\'shishda xatolik:', e);
        return null;
    }
}

// ===== RASHOD QO'SHISH =====
function addExpenseToDB(expenseData) {
    try {
        if (!DB.expenses) DB.expenses = [];
        var expense = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            description: expenseData.description,
            amount: expenseData.amount,
            category: expenseData.category,
            paymentType: expenseData.paymentType || 'cash',
            date: expenseData.date || new Date().toISOString()
        };
        DB.expenses.push(expense);
        saveDB();
        console.log('✅ Rashod qo\'shildi:', expense.description);
        return expense;
    } catch(e) {
        console.log('Rashod qo\'shishda xatolik:', e);
        return null;
    }
}

// ===== HODIM QO'SHISH =====
function addEmployeeToDB(employeeData) {
    try {
        if (!DB.employees) DB.employees = [];
        var employee = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: employeeData.name,
            position: employeeData.position,
            salary: employeeData.salary,
            phone: employeeData.phone || '-',
            address: employeeData.address || '-',
            code: employeeData.code || null,
            hireDate: employeeData.hireDate || new Date().toISOString(),
            active: true
        };
        DB.employees.push(employee);
        
        // Kassir bo'lsa cashiers ga ham qo'shish
        if (employee.position === 'kassir' && employee.code) {
            if (!DB.cashiers) DB.cashiers = [];
            DB.cashiers.push({
                id: employee.id,
                name: employee.name,
                code: employee.code,
                salary: employee.salary,
                active: true
            });
        }
        
        saveDB();
        console.log('✅ Hodim qo\'shildi:', employee.name);
        return employee;
    } catch(e) {
        console.log('Hodim qo\'shishda xatolik:', e);
        return null;
    }
}

// ===== QARZDOR QO'SHISH =====
function addDebtorToDB(debtorData) {
    try {
        if (!DB.debtors) DB.debtors = [];
        var debtor = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: debtorData.name,
            phone: debtorData.phone,
            address: debtorData.address || '-',
            amount: debtorData.amount,
            date: debtorData.date || new Date().toISOString(),
            status: debtorData.status || 'pending'
        };
        DB.debtors.push(debtor);
        saveDB();
        console.log('✅ Qarzdor qo\'shildi:', debtor.name);
        return debtor;
    } catch(e) {
        console.log('Qarzdor qo\'shishda xatolik:', e);
        return null;
    }
}

// ===== QARZDOR TO'LOVI =====
function payDebtor(debtorId, amount) {
    try {
        if (!DB.debtors) return { success: false, message: 'Qarzdorlar mavjud emas' };
        
        var debtor = null;
        var debtorIndex = -1;
        for (var i = 0; i < DB.debtors.length; i++) {
            if (DB.debtors[i].id === debtorId) {
                debtor = DB.debtors[i];
                debtorIndex = i;
                break;
            }
        }
        
        if (!debtor) {
            return { success: false, message: 'Qarzdor topilmadi' };
        }
        
        if (amount > debtor.amount) {
            return { success: false, message: 'Qarz summasidan katta to\'lov' };
        }
        
        debtor.amount -= amount;
        if (debtor.amount <= 0) {
            debtor.status = 'paid';
            debtor.paidDate = new Date().toISOString();
        }
        
        // To'lov tarixi
        if (!DB.debtPayments) DB.debtPayments = [];
        DB.debtPayments.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            debtorId: debtorId,
            debtorName: debtor.name,
            amount: amount,
            date: new Date().toISOString()
        });
        
        saveDB();
        console.log('✅ Qarz to\'lovi amalga oshirildi:', debtor.name, amount);
        return { success: true, debtor: debtor };
    } catch(e) {
        console.log('Qarz to\'lovida xatolik:', e);
        return { success: false, message: e.message };
    }
}

// ===== MAHSULOT O'CHIRISH =====
function deleteProductFromDB(productId) {
    try {
        if (!DB.products) return false;
        var newProducts = [];
        var deletedName = '';
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].id === productId) {
                deletedName = DB.products[i].name;
            } else {
                newProducts.push(DB.products[i]);
            }
        }
        DB.products = newProducts;
        saveDB();
        console.log('🗑️ Mahsulot o\'chirildi:', deletedName);
        return true;
    } catch(e) {
        console.log('Mahsulot o\'chirishda xatolik:', e);
        return false;
    }
}

// ===== BARCHA MA'LUMOTLARNI TOZALASH =====
function clearAllData() {
    try {
        if (!confirm('Barcha ma\'lumotlar o\'chiriladi! Ishonchingiz komilmi?')) {
            return false;
        }
        
        localStorage.removeItem('salimboy_db');
        localStorage.removeItem('lastSaleDate');
        localStorage.removeItem('lastBackup');
        
        // DB ni qayta o'rnatish
        DB.products = [];
        DB.sales = [];
        DB.debtors = [];
        DB.expenses = [];
        DB.employees = [];
        DB.shifts = [];
        DB.dailySales = [];
        DB.statistics = {
            daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
            monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
            yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
        };
        DB.dailyStats = { cash: 0, terminal: 0, debt: 0, total: 0 };
        
        // Cashiers ni qayta tiklash
        DB.cashiers = [
            { id: 1, name: 'Salimboy', code: '1111', salary: 5000000, active: true },
            { id: 2, name: 'Ali', code: '2222', salary: 4000000, active: true },
            { id: 3, name: 'Dilnoza', code: '3333', salary: 4500000, active: true },
            { id: 4, name: 'Bobur', code: '4444', salary: 3500000, active: true }
        ];
        
        // Settings ni qayta tiklash
        DB.settings = {
            shopName: 'Salimboy Sale',
            shopOwner: 'Salimboy',
            theme: 'dark',
            primaryColor: '#6C63FF',
            receiptFooter: 'Salimboy Sale dasturi'
        };
        
        saveDB();
        console.log('🗑️ Barcha ma\'lumotlar tozalandi!');
        return true;
    } catch(e) {
        console.log('Ma\'lumotlarni tozalashda xatolik:', e);
        return false;
    }
}

// ===== ZAXIRA YARATISH =====
function createBackup() {
    try {
        var data = {
            db: DB,
            date: new Date().toISOString(),
            version: '1.0.0'
        };
        
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'salimboy_sale_backup_' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('lastBackup', new Date().toISOString());
        console.log('✅ Zaxira yaratildi!');
        return true;
    } catch(e) {
        console.log('Zaxira yaratishda xatolik:', e);
        return false;
    }
}

// ===== AVVALGI MA'LUMOTLARNI YUKLASH =====
loadDB();

// ===== YANGI KUNNI TEKSHIRISH =====
checkNewDay();

// ===== EKSPORT =====
window.DB = DB;
window.saveDB = saveDB;
window.loadDB = loadDB;
window.resetDailyStats = resetDailyStats;
window.checkNewDay = checkNewDay;
window.getShiftStatus = getShiftStatus;
window.getDailyTotal = getDailyTotal;
window.getMonthlyTotal = getMonthlyTotal;
window.getYearlyTotal = getYearlyTotal;
window.addProductToDB = addProductToDB;
window.addSaleToDB = addSaleToDB;
window.addExpenseToDB = addExpenseToDB;
window.addEmployeeToDB = addEmployeeToDB;
window.addDebtorToDB = addDebtorToDB;
window.payDebtor = payDebtor;
window.deleteProductFromDB = deleteProductFromDB;
window.clearAllData = clearAllData;
window.createBackup = createBackup;

console.log('🏷️ Salimboy Sale v1.0');
console.log('📊 DB yuklandi, mahsulotlar:', DB.products ? DB.products.length : 0);
console.log('📈 Kunlik statistika:', DB.statistics ? DB.statistics.daily : 'Mavjud emas');