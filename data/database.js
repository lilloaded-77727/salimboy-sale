// ===== DATABASE.JS - MA'LUMOTLAR BAZASI =====

var DB = {
    products: [],
    sales: [],
    debtors: [],
    expenses: [],
    employees: [],
    shifts: [],
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
    }
};

function loadDB() {
    try {
        var data = localStorage.getItem('salimboy_db');
        if (data) {
            var parsed = JSON.parse(data);
            Object.assign(DB, parsed);
            console.log('✅ Ma\'lumotlar bazasi yuklandi!');
            return true;
        }
    } catch(e) {
        console.log('Yuklashda xatolik:', e);
    }
    return false;
}

function saveDB() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('✅ Ma\'lumotlar saqlandi!');
    } catch(e) {
        console.log('Saqlashda xatolik:', e);
    }
}

loadDB();
console.log('🏷️ Salimboy Sale v1.0');
