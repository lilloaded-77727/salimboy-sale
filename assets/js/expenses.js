// ===== EXPENSES.JS - TO'LIQ RASHODLAR LOGIKASI (TUZATILGAN) =====

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Sanani ko'rsatish
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            var now = new Date();
            dateEl.textContent = now.toLocaleDateString('uz-UZ', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long'
            });
        }

        // Rashodlarni yuklash
        loadExpenses();

        // Statistikani yuklash
        loadExpenseStats();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Expenses.js yuklandi!');
    } catch(e) {
        console.log('Expenses.js yuklashda xatolik:', e);
    }
});

// ===== RASHOD QO'SHISH MODAL =====
function openAddExpenseModal() {
    try {
        var modal = document.getElementById('addExpenseModal');
        var descInput = document.getElementById('expenseDescription');
        if (modal) modal.classList.add('active');
        if (descInput) descInput.focus();
    } catch(e) {
        console.log('Modal ochishda xatolik:', e);
    }
}

function closeAddExpenseModal() {
    try {
        var modal = document.getElementById('addExpenseModal');
        var descInput = document.getElementById('expenseDescription');
        var amountInput = document.getElementById('expenseAmount');
        var categorySelect = document.getElementById('expenseCategory');
        var paymentSelect = document.getElementById('expensePaymentType');
        
        if (modal) modal.classList.remove('active');
        if (descInput) descInput.value = '';
        if (amountInput) amountInput.value = '';
        if (categorySelect) categorySelect.value = 'ishchi';
        if (paymentSelect) paymentSelect.value = 'cash';
    } catch(e) {
        console.log('Modal yopishda xatolik:', e);
    }
}

// ===== RASHOD QO'SHISH =====
function addExpense() {
    try {
        var descInput = document.getElementById('expenseDescription');
        var amountInput = document.getElementById('expenseAmount');
        var categorySelect = document.getElementById('expenseCategory');
        var paymentSelect = document.getElementById('expensePaymentType');
        
        if (!descInput || !amountInput || !categorySelect || !paymentSelect) {
            showNotification('⚠️ Forma elementlari topilmadi!', 'error');
            return;
        }
        
        var description = descInput.value.trim();
        var amount = parseFloat(amountInput.value);
        var category = categorySelect.value;
        var paymentType = paymentSelect.value;

        if (!description || !amount || amount <= 0) {
            showNotification('⚠️ Iltimos, barcha maydonlarni to\'ldiring!', 'warning');
            return;
        }

        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }

        var expense = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            description: description,
            amount: amount,
            category: category,
            paymentType: paymentType,
            date: new Date().toISOString()
        };

        if (!DB.expenses) DB.expenses = [];
        DB.expenses.push(expense);
        saveDB();
        closeAddExpenseModal();
        loadExpenses();
        loadExpenseStats();
        showNotification('✅ Rashod qo\'shildi: ' + formatPrice(amount), 'success');
    } catch(e) {
        console.log('Rashod qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== RASHODLARNI YUKLASH =====
function loadExpenses(filter) {
    try {
        var tbody = document.getElementById('expensesTableBody');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.expenses) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Rashodlar mavjud emas
                    </td>
                </tr>
            `;
            var countEl = document.getElementById('expenseCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var expenses = DB.expenses.slice(); // Kopiya olish
        
        // Qidiruv filtri
        if (filter) {
            var search = filter.toLowerCase().trim();
            var filtered = [];
            for (var i = 0; i < expenses.length; i++) {
                var e = expenses[i];
                if (e.description.toLowerCase().includes(search) || 
                    e.category.toLowerCase().includes(search)) {
                    filtered.push(e);
                }
            }
            expenses = filtered;
        }

        // Kategoriya filtri
        var categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categoryFilter.value) {
            var filtered = [];
            for (var i = 0; i < expenses.length; i++) {
                if (expenses[i].category === categoryFilter.value) {
                    filtered.push(expenses[i]);
                }
            }
            expenses = filtered;
        }

        // To'lov turi filtri
        var paymentFilter = document.getElementById('paymentFilter');
        if (paymentFilter && paymentFilter.value) {
            var filtered = [];
            for (var i = 0; i < expenses.length; i++) {
                if (expenses[i].paymentType === paymentFilter.value) {
                    filtered.push(expenses[i]);
                }
            }
            expenses = filtered;
        }

        // Sana bo'yicha saralash (eng yangisi birinchi)
        expenses.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Rashodlar topilmadi
                    </td>
                </tr>
            `;
            var countEl = document.getElementById('expenseCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var categoryNames = {
            'ishchi': 'Ishchi oylik',
            'komunal': 'Komunal',
            'ijara': 'Ijara',
            'soliq': 'Soliq',
            'mahsulot': 'Mahsulot xaridi',
            'transport': 'Transport',
            'boshqa': 'Boshqa'
        };

        var paymentNames = {
            'cash': 'Naxt',
            'plastic': 'Plastik',
            'account': 'Hisob raqam'
        };

        var html = '';
        for (var i = 0; i < expenses.length; i++) {
            var e = expenses[i];
            var date = new Date(e.date).toLocaleDateString('uz-UZ');
            var categoryClass = e.category;
            var paymentClass = e.paymentType;
            
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${date}</td>
                    <td><span class="category-badge ${categoryClass}">${categoryNames[e.category] || e.category}</span></td>
                    <td>${e.description}</td>
                    <td><strong>${formatPrice(e.amount)}</strong></td>
                    <td><span class="payment-badge ${paymentClass}">${paymentNames[e.paymentType] || e.paymentType}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-delete" onclick="deleteExpense(${e.id})" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(231,76,60,0.12);color:#E74C3C;transition:all 0.3s;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('expenseCount');
        if (countEl) countEl.textContent = expenses.length + ' ta';
    } catch(e) {
        console.log('Rashodlarni yuklashda xatolik:', e);
        var tbody = document.getElementById('expensesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-exclamation-triangle" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Xatolik yuz berdi
                    </td>
                </tr>
            `;
        }
    }
}

// ===== RASHOD STATISTIKASI =====
function loadExpenseStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.expenses) {
            var totalEl = document.getElementById('totalExpenses');
            var dailyEl = document.getElementById('dailyExpenses');
            var monthlyEl = document.getElementById('monthlyExpenses');
            var yearlyEl = document.getElementById('yearlyExpenses');
            
            if (totalEl) totalEl.textContent = '0 so\'m';
            if (dailyEl) dailyEl.textContent = '0 so\'m';
            if (monthlyEl) monthlyEl.textContent = '0 so\'m';
            if (yearlyEl) yearlyEl.textContent = '0 so\'m';
            return;
        }

        var expenses = DB.expenses;
        var now = new Date();
        var today = now.toDateString();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();

        var total = 0;
        var dailyTotal = 0;
        var monthlyTotal = 0;
        var yearlyTotal = 0;

        for (var i = 0; i < expenses.length; i++) {
            var e = expenses[i];
            var date = new Date(e.date);
            
            total += e.amount;
            
            if (date.toDateString() === today) {
                dailyTotal += e.amount;
            }
            
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                monthlyTotal += e.amount;
            }
            
            if (date.getFullYear() === currentYear) {
                yearlyTotal += e.amount;
            }
        }

        var totalEl = document.getElementById('totalExpenses');
        var dailyEl = document.getElementById('dailyExpenses');
        var monthlyEl = document.getElementById('monthlyExpenses');
        var yearlyEl = document.getElementById('yearlyExpenses');

        if (totalEl) totalEl.textContent = formatPrice(total);
        if (dailyEl) dailyEl.textContent = formatPrice(dailyTotal);
        if (monthlyEl) monthlyEl.textContent = formatPrice(monthlyTotal);
        if (yearlyEl) yearlyEl.textContent = formatPrice(yearlyTotal);
    } catch(e) {
        console.log('Rashod statistikasini yuklashda xatolik:', e);
    }
}

// ===== RASHOD QIDIRUV =====
function searchExpenses() {
    try {
        var query = document.getElementById('expenseSearch');
        loadExpenses(query ? query.value : '');
    } catch(e) {
        console.log('Qidiruvda xatolik:', e);
    }
}

// ===== RASHOD O'CHIRISH =====
function deleteExpense(id) {
    try {
        if (!confirm('Ushbu rashodni o\'chirishga ishonchingiz komilmi?')) {
            return;
        }

        if (typeof DB === 'undefined' || !DB || !DB.expenses) {
            showNotification('⚠️ Rashodlar mavjud emas!', 'error');
            return;
        }

        var newExpenses = [];
        for (var i = 0; i < DB.expenses.length; i++) {
            if (DB.expenses[i].id !== id) {
                newExpenses.push(DB.expenses[i]);
            }
        }
        DB.expenses = newExpenses;
        saveDB();
        loadExpenses();
        loadExpenseStats();
        showNotification('🗑️ Rashod o\'chirildi!', 'info');
    } catch(e) {
        console.log('Rashod o\'chirishda xatolik:', e);
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

// ===== GLOBAL NOTIFIKATSIYA =====
function showNotification(message, type) {
    type = type || 'info';
    
    // Global showNotification mavjud bo'lsa
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    var colors = {
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#6C63FF'
    };
    
    var notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: #FFFFFF;
        border-left: 4px solid ${colors[type]};
        border-radius: 12px;
        color: #1A1A2E;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 99999;
        animation: slideInRight 0.4s ease;
        max-width: 420px;
        border: 1px solid #EAEAEA;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    var iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <span style="font-size: 20px;">${iconMap[type] || 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 4000);
}

console.log('✅ Expenses.js to\'liq yuklandi!');