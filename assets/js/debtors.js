// ===== DEBTORS.JS - TO'LIQ NASIYA LOGIKASI (TUZATILGAN) =====

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

        // Qarzdorlarni yuklash
        loadDebtors();

        // Statistikani yuklash
        loadDebtorStats();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Debtors.js yuklandi!');
    } catch(e) {
        console.log('Debtors.js yuklashda xatolik:', e);
    }
});

// ===== QARZDORLARNI YUKLASH =====
function loadDebtors(filter) {
    try {
        var tbody = document.getElementById('debtorsTableBody');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Qarzdorlar mavjud emas
                    </td>
                </tr>
            `;
            var countEl = document.getElementById('debtorCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var debtors = DB.debtors.slice(); // Kopiya olish
        
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

        // Sana bo'yicha saralash (eng yangisi birinchi)
        debtors.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        if (debtors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Qarzdorlar topilmadi
                    </td>
                </tr>
            `;
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
            
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${d.name}</strong></td>
                    <td>${d.phone || '-'}</td>
                    <td>${d.address || '-'}</td>
                    <td><strong>${formatPrice(d.amount)}</strong></td>
                    <td>${date}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-btns">
                            ${d.status === 'pending' ? `
                                <button class="btn-pay" onclick="openPaymentModal(${d.id})" style="padding:4px 12px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(46,204,113,0.12);color:#2ECC71;transition:all 0.3s;">
                                    <i class="fas fa-money-bill-wave"></i> To'lash
                                </button>
                            ` : ''}
                            <button class="btn-delete" onclick="deleteDebtor(${d.id})" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(231,76,60,0.12);color:#E74C3C;transition:all 0.3s;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('debtorCount');
        if (countEl) countEl.textContent = debtors.length + ' ta';
    } catch(e) {
        console.log('Qarzdorlarni yuklashda xatolik:', e);
        var tbody = document.getElementById('debtorsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-exclamation-triangle" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Xatolik yuz berdi
                    </td>
                </tr>
            `;
        }
    }
}

// ===== QARZDOR STATISTIKASI =====
function loadDebtorStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.debtors) {
            var totalEl = document.getElementById('totalDebtors');
            var debtEl = document.getElementById('totalDebt');
            var paidEl = document.getElementById('paidDebt');
            var pendingEl = document.getElementById('pendingDebt');
            
            if (totalEl) totalEl.textContent = '0';
            if (debtEl) debtEl.textContent = '0 so\'m';
            if (paidEl) paidEl.textContent = '0 so\'m';
            if (pendingEl) pendingEl.textContent = '0 so\'m';
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

        var totalEl = document.getElementById('totalDebtors');
        var debtEl = document.getElementById('totalDebt');
        var paidEl = document.getElementById('paidDebt');
        var pendingEl = document.getElementById('pendingDebt');

        if (totalEl) totalEl.textContent = count;
        if (debtEl) debtEl.textContent = formatPrice(totalDebt);
        if (paidEl) paidEl.textContent = formatPrice(paidDebt);
        if (pendingEl) pendingEl.textContent = formatPrice(pendingDebt);
    } catch(e) {
        console.log('Qarzdor statistikasini yuklashda xatolik:', e);
    }
}

// ===== QIDIRUV =====
function searchDebtors() {
    try {
        var query = document.getElementById('debtorSearch');
        loadDebtors(query ? query.value : '');
    } catch(e) {
        console.log('Qidiruvda xatolik:', e);
    }
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

        var idEl = document.getElementById('payDebtorId');
        var nameEl = document.getElementById('payDebtorName');
        var remainingEl = document.getElementById('payRemaining');
        var amountEl = document.getElementById('payAmount');
        var modal = document.getElementById('paymentModal');
        
        if (idEl) idEl.value = id;
        if (nameEl) nameEl.value = debtor.name;
        if (remainingEl) remainingEl.value = formatPrice(debtor.amount);
        if (amountEl) amountEl.value = '';
        if (modal) modal.classList.add('active');
        if (amountEl) amountEl.focus();
    } catch(e) {
        console.log('To\'lov modalini ochishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function closePaymentModal() {
    try {
        var modal = document.getElementById('paymentModal');
        if (modal) modal.classList.remove('active');
    } catch(e) {
        console.log('Modal yopishda xatolik:', e);
    }
}

// ===== TO'LOVNI AMALGA OSHIRISH =====
function processPayment() {
    try {
        var idEl = document.getElementById('payDebtorId');
        var amountEl = document.getElementById('payAmount');
        
        if (!idEl || !amountEl) {
            showNotification('⚠️ Forma elementlari topilmadi!', 'error');
            return;
        }
        
        var id = parseInt(idEl.value);
        var amount = parseFloat(amountEl.value);

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
        
        // To'lov tarixiga qo'shish
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
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
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
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
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

        if (typeof window.exportToCSV === 'function') {
            window.exportToCSV(data, 'nasiya_qarzdorlar_' + new Date().toISOString().slice(0,10) + '.csv');
        } else {
            exportToCSV(data, 'nasiya_qarzdorlar_' + new Date().toISOString().slice(0,10) + '.csv');
        }
        showNotification('✅ Nasiya hisoboti eksport qilindi!', 'success');
    } catch(e) {
        console.log('Eksportda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== CSV EKSPORT =====
function exportToCSV(data, filename) {
    try {
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
    } catch(e) {
        console.log('CSV eksportida xatolik:', e);
        showNotification('⚠️ Eksportda xatolik yuz berdi!', 'error');
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

console.log('✅ Debtors.js to\'liq yuklandi!');