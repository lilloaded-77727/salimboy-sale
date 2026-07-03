// ===== CASHIER.JS - SMENA YOPISH VA DASHBOARD =====

// ===== GLOBAL O'ZGARUVCHILAR =====
var cart = [];
var selectedPayment = 'cash';
var shiftOpen = false;
var currentShift = null;
var currentWeightProduct = null;
var discountPercent = 0;
var discountAmount = 0;

// ===== SMENA YOPISH =====
function closeShift() {
    if (!currentShift) {
        showNotification('⚠️ Smena ochilmagan!', 'warning');
        return;
    }

    if (cart.length > 0) {
        if (!confirm('Savatda mahsulotlar bor. Smenani yopishga ishonchingiz komilmi?')) {
            return;
        }
    }

    try {
        var dailyTotal = currentShift.totalSales || 0;
        
        // 1. Smenani yopish
        if (typeof DB !== 'undefined' && DB && DB.shifts) {
            for (var i = 0; i < DB.shifts.length; i++) {
                if (DB.shifts[i].id === currentShift.id) {
                    DB.shifts[i].endTime = new Date().toISOString();
                    DB.shifts[i].status = 'closed';
                    DB.shifts[i].endCash = DB.shifts[i].startCash + DB.shifts[i].totalSales;
                    break;
                }
            }
        }

        // 2. Statistika va hisobot
        if (typeof DB !== 'undefined' && DB) {
            if (!DB.statistics) {
                DB.statistics = {
                    daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
                    monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
                    yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
                };
            }
            
            DB.statistics.daily.total += dailyTotal;
            if (selectedPayment === 'cash') {
                DB.statistics.daily.cash += dailyTotal;
            } else if (selectedPayment === 'terminal') {
                DB.statistics.daily.terminal += dailyTotal;
            } else if (selectedPayment === 'debt') {
                DB.statistics.daily.debt += dailyTotal;
            }
            
            DB.statistics.monthly.total += dailyTotal;
            DB.statistics.yearly.total += dailyTotal;
            
            // Hisobotga qo'shish
            if (!DB.dailySales) DB.dailySales = [];
            DB.dailySales.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                shiftId: currentShift.id,
                cashier: currentShift.cashier,
                date: new Date().toISOString(),
                total: dailyTotal,
                cash: selectedPayment === 'cash' ? dailyTotal : 0,
                terminal: selectedPayment === 'terminal' ? dailyTotal : 0,
                debt: selectedPayment === 'debt' ? dailyTotal : 0,
                status: 'completed'
            });
            
            saveDB();
        }

        // 3. Interfeysni yangilash
        shiftOpen = false;
        currentShift = null;

        var statusEl = document.getElementById('shiftStatus');
        if (statusEl) {
            statusEl.innerHTML = '<span class="status-dot closed"></span><span>Smena: Yopiq</span>';
        }
        
        var btn = document.getElementById('shiftBtn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-play"></i> Smena ochish';
            btn.className = 'btn-shift closed';
        }

        cart = [];
        discountPercent = 0;
        discountAmount = 0;
        updateCart();

        // Dashboard statistikasini yangilash
        if (typeof updateStats === 'function') {
            updateStats();
        }

        showNotification('✅ Smena yopildi! Umumiy savdo: ' + formatPrice(dailyTotal), 'success');
        
    } catch(e) {
        console.log('Smena yopishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== QO'SHIMCHA FUNKSIYALAR =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salimboy_db', JSON.stringify(DB));
        }
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

function showNotification(message, type) {
    type = type || 'info';
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    alert(message);
}

console.log('✅ Cashier.js yangilandi!');
