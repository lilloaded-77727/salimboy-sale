// ===== EXPENSES.JS - RASHODLAR LOGIKASI =====

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            var now = new Date();
            dateEl.textContent = now.toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
        }
        
        // DB ni yuklash
        if (typeof loadDB === 'function') {
            loadDB();
        }
        
        loadExpenses();
        loadExpenseStats();
        
        console.log('✅ Expenses.js yuklandi!');
        console.log('📊 Rashodlar soni:', DB ? DB.expenses.length : 0);
    } catch(e) {
        console.log('Expenses.js yuklashda xatolik:', e);
    }
});

// ===== RASHOD QO'SHISH MODAL =====
function openAddExpenseModal() {
    var modal = document.getElementById('addExpenseModal');
    if (modal) {
        modal.classList.add('active');
        var descInput = document.getElementById('expenseDescription');
        if (descInput) descInput.focus();
    }
}

function closeAddExpenseModal() {
    var modal = document.getElementById('addExpenseModal');
    if (modal) modal.classList.remove('active');
    
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = 'ishchi';
    document.getElementById('expensePaymentType').value = 'cash';
}

// ===== RASHOD QO'SHISH =====
function addExpense() {
    try {
        var description = document.getElementById('expenseDescription').value.trim();
        var amount = parseFloat(document.getElementById('expenseAmount').value);
        var category = document.getElementById('expenseCategory').value;
        var paymentType = document.getElementById('expensePaymentType').value;
        
        if (!description) {
            showNotification('⚠️ Tavsifni kiriting!', 'warning');
            return;
        }
        if (!amount || amount <= 0) {
            showNotification('⚠️ Summani kiriting!', 'warning');
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
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== RASHODLARNI YUKLASH =====
function loadExpenses(filter) {
    try {
        var tbody = document.getElementById('expensesTableBody');
        if (!tbody) return;
        
        if (typeof DB === 'undefined' || !DB || !DB.expenses || DB.expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.5;"></i>Rashodlar mavjud emas</td></tr>';
            var countEl = document.getElementById('expenseCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }
        
        var expenses = DB.expenses.slice();
        
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
        
        // Sana bo'yicha saralash
        expenses.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-search" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.5;"></i>Rashodlar topilmadi</td></tr>';
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
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + date + '</td>' +
                '<td><span class="category-badge ' + categoryClass + '">' + (categoryNames[e.category] || e.category) + '</span></td>' +
                '<td>' + e.description + '</td>' +
                '<td><strong>' + formatPrice(e.amount) + '</strong></td>' +
                '<td><span class="payment-badge ' + paymentClass + '">' + (paymentNames[e.paymentType] || e.paymentType) + '</span></td>' +
                '<td><button class="btn-delete-sm" onclick="deleteExpense(' + e.id + ')"><i class="fas fa-trash"></i></button></td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('expenseCount');
        if (countEl) countEl.textContent = expenses.length + ' ta';
    } catch(e) {
        console.log('Rashodlarni yuklashda xatolik:', e);
    }
}

// ===== RASHOD STATISTIKASI =====
function loadExpenseStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.expenses) {
            document.getElementById('totalExpenses').textContent = '0 so\'m';
            document.getElementById('dailyExpenses').textContent = '0 so\'m';
            document.getElementById('monthlyExpenses').textContent = '0 so\'m';
            document.getElementById('yearlyExpenses').textContent = '0 so\'m';
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
        
        document.getElementById('totalExpenses').textContent = formatPrice(total);
        document.getElementById('dailyExpenses').textContent = formatPrice(dailyTotal);
        document.getElementById('monthlyExpenses').textContent = formatPrice(monthlyTotal);
        document.getElementById('yearlyExpenses').textContent = formatPrice(yearlyTotal);
    } catch(e) {
        console.log('Rashod statistikasida xatolik:', e);
    }
}

// ===== QIDIRUV =====
function searchExpenses() {
    var query = document.getElementById('expenseSearch').value;
    loadExpenses(query);
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
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== QO'SHIMCHA =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('💾 Ma\'lumotlar saqlandi!');
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

console.log('✅ Expenses.js yuklandi!');