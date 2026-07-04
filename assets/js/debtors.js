// ===== DEBTORS.JS - NASIYA LOGIKASI =====

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
        
        loadDebtors();
        loadDebtorStats();
        
        console.log('✅ Debtors.js yuklandi!');
        console.log('📊 Qarzdorlar soni:', DB ? DB.debtors.length : 0);
    } catch(e) {
        console.log('Debtors.js yuklashda xatolik:', e);
    }
});

// ===== QARZDORLARNI YUKLASH =====
function loadDebtors(filter) {
    try {
        var tbody = document.getElementById('debtorsTableBody');
        if (!tbody) return;
        
        if (typeof DB === 'undefined' || !DB || !DB.debtors || DB.debtors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.5;"></i>Qarzdorlar mavjud emas</td></tr>';
            var countEl = document.getElementById('debtorCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }
        
        var debtors = DB.debtors.slice();
        
        // Qidiruv filtri
        if (filter) {
            var search = filter.toLowerCase().trim();
            var filtered = [];
            for (var i = 0; i < debtors.length; i++) {
                var d = debtors[i];
                if (d.name.toLowerCase().includes(search) || 
                    (d.phone && d.phone.includes(search))) {
                    filtered.push(d);
                }
            }
            debtors = filtered;
        }
        
        // Holat filtri
        var statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value) {
            var filtered = [];
            for (var i = 0; i < debtors.length; i++) {
                if (debtors[i].status === statusFilter.value) {
                    filtered.push(debtors[i]);
                }
            }
            debtors = filtered;
        }
        
        // Sana bo'yicha saralash
        debtors.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (debtors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-search" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.5;"></i>Qarzdorlar topilmadi</td></tr>';
            var countEl = document.getElementById('debtorCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }
        
        var html = '';
        for (var i = 0; i < debtors.length; i++) {
            var d = debtors[i];
            var date = new Date(d.date).toLocaleDateString('uz-UZ');
            var statusClass = d.status === 'pending' ? 'status-pending' : 'status-paid';
            var statusText = d.status === 'pending' ? '🟡 Kutilmoqda' : '✅ To\'langan';
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td><strong>' + d.name + '</strong></td>' +
                '<td>' + (d.phone || '-') + '</td>' +
                '<td>' + (d.address || '-') + '</td>' +
                '<td><strong>' + formatPrice(d.amount) + '</strong></td>' +
                '<td>' + date + '</td>' +
                '<td><span class="' + statusClass + '">' + statusText + '</span></td>' +
                '<td><div class="action-btns">';
            
            if (d.status === 'pending') {
                html += '<button class="btn-pay-sm" onclick="openPaymentModal(' + d.id + ')"><i class="fas fa-money-bill-wave"></i></button>';
            }
            
            html += '<button class="btn-delete-sm" onclick="deleteDebtor(' + d.id + ')"><i class="fas fa-trash"></i></button>';
            html += '</div></td></tr>';
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('debtorCount');
        if (countEl) countEl.textContent = debtors.length + ' ta';
    } catch(e) {
        console.log('Qarzdorlarni yuklashda xatolik:', e);
    }
}

// ===== QARZDOR STATISTIKASI =====
function loadDebtorStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            document.getElementById('totalDebtors').textContent = '0';
            document.getElementById('totalDebt').textContent = '0 so\'m';
            document.getElementById('paidDebt').textContent = '0 so\'m';
            document.getElementById('pendingDebt').textContent = '0 so\'m';
            return;
        }
        
        var debtors = DB.debtors;
        var totalDebt = 0;
        var paidDebt = 0;
        var pendingDebt = 0;
        var count = 0;
        
        for (var i = 0; i < debtors.length; i++) {
            var d = debtors[i];
            totalDebt += d.amount || 0;
            if (d.status === 'paid') {
                paidDebt += d.amount || 0;
            } else if (d.status === 'pending') {
                pendingDebt += d.amount || 0;
                count++;
            }
        }
        
        document.getElementById('totalDebtors').textContent = count;
        document.getElementById('totalDebt').textContent = formatPrice(totalDebt);
        document.getElementById('paidDebt').textContent = formatPrice(paidDebt);
        document.getElementById('pendingDebt').textContent = formatPrice(pendingDebt);
    } catch(e) {
        console.log('Qarzdor statistikasida xatolik:', e);
    }
}

// ===== QIDIRUV =====
function searchDebtors() {
    var query = document.getElementById('debtorSearch').value;
    loadDebtors(query);
}

// ===== TO'LOV MODAL =====
function openPaymentModal(id) {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            showNotification('⚠️ Qarzdorlar mavjud emas!', 'error');
            return;
        }
        
        var debtor = null;
        for (var i = 0; i < DB.debtors.length; i++) {
            if (DB.debtors[i].id === id) {
                debtor = DB.debtors[i];
                break;
            }
        }
        
        if (!debtor) {
            showNotification('⚠️ Qarzdor topilmadi!', 'error');
            return;
        }
        
        document.getElementById('payDebtorId').value = id;
        document.getElementById('payDebtorName').value = debtor.name;
        document.getElementById('payRemaining').value = formatPrice(debtor.amount);
        document.getElementById('payAmount').value = '';
        
        var modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.add('active');
            var amountInput = document.getElementById('payAmount');
            if (amountInput) amountInput.focus();
        }
    } catch(e) {
        console.log('To\'lov modalini ochishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function closePaymentModal() {
    var modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
}

// ===== TO'LOVNI AMALGA OSHIRISH =====
function processPayment() {
    try {
        var id = parseInt(document.getElementById('payDebtorId').value);
        var amount = parseFloat(document.getElementById('payAmount').value);
        
        if (!amount || amount <= 0) {
            showNotification('⚠️ Iltimos, to\'g\'ri summa kiriting!', 'warning');
            return;
        }
        
        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            showNotification('⚠️ Qarzdorlar mavjud emas!', 'error');
            return;
        }
        
        var debtor = null;
        var debtorIndex = -1;
        for (var i = 0; i < DB.debtors.length; i++) {
            if (DB.debtors[i].id === id) {
                debtor = DB.debtors[i];
                debtorIndex = i;
                break;
            }
        }
        
        if (!debtor) {
            showNotification('⚠️ Qarzdor topilmadi!', 'error');
            return;
        }
        
        if (amount > debtor.amount) {
            showNotification('⚠️ Qarz summasidan katta to\'lov kiritdingiz!', 'warning');
            return;
        }
        
        // Qarzni kamaytirish
        debtor.amount -= amount;
        
        // To'lov tarixi
        if (!DB.debtPayments) DB.debtPayments = [];
        DB.debtPayments.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            debtorId: id,
            debtorName: debtor.name,
            amount: amount,
            date: new Date().toISOString()
        });
        
        // Agar qarz to'liq to'langan bo'lsa
        if (debtor.amount <= 0) {
            debtor.status = 'paid';
            debtor.paidDate = new Date().toISOString();
            showNotification('✅ "' + debtor.name + '" qarzi to\'liq to\'landi!', 'success');
        } else {
            showNotification('✅ ' + formatPrice(amount) + ' to\'lov qabul qilindi. Qolgan: ' + formatPrice(debtor.amount), 'success');
        }
        
        saveDB();
        closePaymentModal();
        loadDebtors();
        loadDebtorStats();
    } catch(e) {
        console.log('To\'lovni amalga oshirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== QARZDOR O'CHIRISH =====
function deleteDebtor(id) {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            showNotification('⚠️ Qarzdorlar mavjud emas!', 'error');
            return;
        }
        
        var debtor = null;
        for (var i = 0; i < DB.debtors.length; i++) {
            if (DB.debtors[i].id === id) {
                debtor = DB.debtors[i];
                break;
            }
        }
        
        if (!debtor) {
            showNotification('⚠️ Qarzdor topilmadi!', 'error');
            return;
        }
        
        if (!confirm('"' + debtor.name + '" qarzdorini o\'chirishga ishonchingiz komilmi?')) {
            return;
        }
        
        var newDebtors = [];
        for (var i = 0; i < DB.debtors.length; i++) {
            if (DB.debtors[i].id !== id) {
                newDebtors.push(DB.debtors[i]);
            }
        }
        DB.debtors = newDebtors;
        saveDB();
        
        loadDebtors();
        loadDebtorStats();
        showNotification('🗑️ "' + debtor.name + '" o\'chirildi!', 'info');
    } catch(e) {
        console.log('Qarzdor o\'chirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== EKSPORT =====
function exportDebtors() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.debtors || DB.debtors.length === 0) {
            showNotification('⚠️ Eksport uchun ma\'lumot yo\'q!', 'warning');
            return;
        }
        
        var debtors = DB.debtors;
        var data = [];
        for (var i = 0; i < debtors.length; i++) {
            var d = debtors[i];
            data.push({
                'Ismi': d.name,
                'Telefon': d.phone || '-',
                'Manzil': d.address || '-',
                'Qarz summasi': d.amount,
                'Sana': new Date(d.date).toLocaleDateString('uz-UZ'),
                'Holat': d.status === 'pending' ? 'Kutilmoqda' : 'To\'langan'
            });
        }
        
        exportToCSV(data, 'nasiya_qarzdorlar_' + new Date().toISOString().slice(0,10) + '.csv');
        showNotification('✅ Nasiya hisoboti eksport qilindi!', 'success');
    } catch(e) {
        console.log('Eksportda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
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

function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    
    var headers = Object.keys(data[0]);
    var csvRows = [];
    csvRows.push(headers.join(','));
    
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var values = [];
        for (var j = 0; j < headers.length; j++) {
            var val = row[headers[j]] || '';
            values.push('"' + String(val).replace(/"/g, '""') + '"');
        }
        csvRows.push(values.join(','));
    }
    
    var blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

console.log('✅ Debtors.js yuklandi!');