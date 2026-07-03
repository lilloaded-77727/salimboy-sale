// ===== DASHBOARD.JS - TO'LIQ LOGIKA (TUZATILGAN) =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        // ===== SANANI KO'RSATISH =====
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

        // ===== STATISTIKALARNI YANGILASH =====
        updateStats();

        // ===== OYLIK GRAFIK =====
        initMonthlyChart();

        // ===== KAM QOLGAN MAHSULOTLAR =====
        renderLowStockProducts();

        // ===== SOTILMAGAN MAHSULOTLAR =====
        renderUnsoldProducts();

        // ===== SIDEBAR TOGGLE =====
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        // ===== DARK MODE =====
        var darkBtn = document.getElementById('darkModeBtn');
        var isDark = true;
        if (darkBtn) {
            darkBtn.addEventListener('click', function() {
                isDark = !isDark;
                var icon = this.querySelector('i');
                if (isDark) {
                    document.body.style.background = '#0F0F1A';
                    if (icon) icon.className = 'fas fa-moon';
                } else {
                    document.body.style.background = '#F0F2F5';
                    if (icon) icon.className = 'fas fa-sun';
                }
            });
        }

        // ===== QIDIRUV =====
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    var query = this.value.trim();
                    if (query) {
                        showNotification('🔍 "' + query + '" bo\'yicha qidirilmoqda...', 'info');
                    }
                }
            });
        }

        // ===== KEYBOARD SHORTCUT =====
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                var searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });

        console.log('✅ Dashboard.js yuklandi!');
    } catch(e) {
        console.log('Dashboard.js yuklashda xatolik:', e);
    }
});

// ===== STATISTIKALARNI YANGILASH =====
function updateStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.statistics) {
            console.log('Statistika mavjud emas');
            return;
        }
        
        var stats = DB.statistics;
        
        // Bugungi savdolar
        var todayTotal = document.getElementById('todayTotal');
        var todayCash = document.getElementById('todayCash');
        var todayTerminal = document.getElementById('todayTerminal');
        var todayDebt = document.getElementById('todayDebt');
        
        if (todayTotal) todayTotal.textContent = formatPrice(stats.daily ? stats.daily.total : 0);
        if (todayCash) todayCash.textContent = formatPrice(stats.daily ? stats.daily.cash : 0);
        if (todayTerminal) todayTerminal.textContent = formatPrice(stats.daily ? stats.daily.terminal : 0);
        if (todayDebt) todayDebt.textContent = formatPrice(stats.daily ? stats.daily.debt : 0);

        // Foizlarni hisoblash
        var total = stats.daily ? stats.daily.total : 0;
        if (total === 0) total = 1;
        
        var cashPercent = Math.round((stats.daily ? stats.daily.cash : 0) / total * 100);
        var terminalPercent = Math.round((stats.daily ? stats.daily.terminal : 0) / total * 100);
        var debtPercent = Math.round((stats.daily ? stats.daily.debt : 0) / total * 100);

        // Dumaloq statistikani yangilash
        updateCircleProgress('.stat-purple .circle', cashPercent);
        updateCircleProgress('.stat-blue .circle', terminalPercent);
        updateCircleProgress('.stat-red .circle', debtPercent);

        // Foizlarni ko'rsatish
        var percentElements = document.querySelectorAll('.stat-percent');
        var percents = [cashPercent, terminalPercent, debtPercent];
        for (var i = 0; i < percentElements.length; i++) {
            if (i < percents.length) {
                percentElements[i].textContent = percents[i] + '%';
            }
        }
    } catch(e) {
        console.log('Statistikani yangilashda xatolik:', e);
    }
}

// ===== DUMALOQ PROGRESSNI YANGILASH =====
function updateCircleProgress(selector, percent) {
    try {
        var circles = document.querySelectorAll(selector);
        for (var i = 0; i < circles.length; i++) {
            var value = Math.min(percent, 100);
            circles[i].style.strokeDasharray = value + ', 100';
        }
    } catch(e) {
        console.log('Progressni yangilashda xatolik:', e);
    }
}

// ===== OYLIK GRAFIK =====
var monthlyChartInstance = null;

function initMonthlyChart() {
    try {
        var ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        if (typeof Chart === 'undefined') {
            console.log('Chart.js yuklanmagan');
            return;
        }

        var labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
        var data = [1200000, 850000, 2100000, 1800000, 3200000, 2800000, 4500000, 3800000, 5600000, 7200000, 8900000, 6500000, 9800000, 11200000, 12450000, 10800000, 13200000, 14500000, 16800000, 15200000, 18500000, 17200000, 19800000, 21200000, 19500000, 22500000, 24800000, 23200000, 25600000, 27800000];

        if (monthlyChartInstance) {
            monthlyChartInstance.destroy();
            monthlyChartInstance = null;
        }

        monthlyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kunlik savdo',
                    data: data,
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#6C63FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#888',
                            font: { size: 12, family: 'Inter' },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: '#fff',
                        bodyColor: '#A0A0B8',
                        borderColor: 'rgba(108,99,255,0.3)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y.toLocaleString() + ' so\'m';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: '#999', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            color: '#999',
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });

        // Oyni o'zgartirish
        var monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.addEventListener('change', function() {
                var monthData = {
                    '0': [1100000, 950000, 1800000, 1600000, 2900000, 2500000, 4200000, 3500000, 5300000, 6800000, 8500000],
                    '1': [1300000, 980000, 2000000, 1700000, 3100000, 2900000, 4600000, 3900000, 5800000, 7300000, 9200000],
                    '2': [1000000, 800000, 1600000, 1400000, 2600000, 2200000, 3800000, 3200000, 4800000, 6200000, 7800000],
                    '3': [1500000, 1200000, 2300000, 2000000, 3500000, 3200000, 5200000, 4500000, 6700000, 8200000, 10200000],
                    '4': [1400000, 1100000, 2200000, 1900000, 3400000, 3100000, 5100000, 4400000, 6600000, 8100000, 10000000],
                    '5': [1600000, 1300000, 2500000, 2200000, 3800000, 3500000, 5500000, 4800000, 7200000, 8800000, 10800000],
                    '6': data,
                    '7': [1800000, 1400000, 2600000, 2300000, 4000000, 3700000, 5800000, 5100000, 7600000, 9200000, 11200000],
                    '8': [1700000, 1350000, 2550000, 2250000, 3900000, 3600000, 5700000, 5000000, 7500000, 9100000, 11100000],
                    '9': [1900000, 1500000, 2800000, 2500000, 4200000, 3900000, 6000000, 5300000, 7900000, 9600000, 11600000],
                    '10': [2000000, 1600000, 3000000, 2700000, 4500000, 4200000, 6400000, 5700000, 8400000, 10000000, 12200000],
                    '11': [2100000, 1700000, 3200000, 2900000, 4800000, 4500000, 6800000, 6100000, 8900000, 10600000, 12800000]
                };

                var selectedMonth = this.value;
                var newData = monthData[selectedMonth] || data;
                
                if (monthlyChartInstance) {
                    monthlyChartInstance.data.datasets[0].data = newData;
                    monthlyChartInstance.update();
                }
            });
        }
    } catch(e) {
        console.log('Grafikni yuklashda xatolik:', e);
    }
}

// ===== KAM QOLGAN MAHSULOTLAR =====
function renderLowStockProducts() {
    try {
        var tbody = document.getElementById('lowStockTable');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.products) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Mahsulotlar mavjud emas</td></tr>';
            var countEl = document.getElementById('lowStockCount');
            if (countEl) countEl.textContent = '0';
            return;
        }

        var lowStock = [];
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].stock <= 10) {
                lowStock.push(DB.products[i]);
            }
        }
        
        var countEl = document.getElementById('lowStockCount');
        if (countEl) countEl.textContent = lowStock.length;

        if (lowStock.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Kam qolgan mahsulot yo\'q</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < lowStock.length; i++) {
            var p = lowStock[i];
            var statusClass = p.stock <= 3 ? 'status-critical' : 'status-low';
            var statusText = p.stock <= 3 ? '⚠️ Juda kam' : '⚠️ Kam qolgan';
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${p.name}</td>
                    <td><strong>${p.stock}</strong></td>
                    <td class="${statusClass}">${statusText}</td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
    } catch(e) {
        console.log('Kam qolgan mahsulotlarni yuklashda xatolik:', e);
    }
}

// ===== SOTILMAGAN MAHSULOTLAR =====
function renderUnsoldProducts() {
    try {
        var tbody = document.getElementById('unsoldTable');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.products) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Mahsulotlar mavjud emas</td></tr>';
            var countEl = document.getElementById('unsoldCount');
            if (countEl) countEl.textContent = '0';
            return;
        }

        // Sotilgan mahsulotlar ID larini yig'ish
        var soldIds = {};
        if (DB.sales) {
            for (var i = 0; i < DB.sales.length; i++) {
                var sale = DB.sales[i];
                if (sale.items) {
                    for (var j = 0; j < sale.items.length; j++) {
                        soldIds[sale.items[j].id] = true;
                    }
                }
            }
        }

        var unsold = [];
        for (var i = 0; i < DB.products.length; i++) {
            var p = DB.products[i];
            if (!soldIds[p.id] && p.stock > 0) {
                unsold.push(p);
            }
        }
        
        var countEl = document.getElementById('unsoldCount');
        if (countEl) countEl.textContent = unsold.length;

        if (unsold.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Barcha mahsulotlar sotilgan</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < unsold.length; i++) {
            var p = unsold[i];
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${p.name}</td>
                    <td>${p.stock}</td>
                    <td>${formatPrice(p.salePrice)}</td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
    } catch(e) {
        console.log('Sotilmagan mahsulotlarni yuklashda xatolik:', e);
    }
}

// ===== HISOBOT EKSPORT =====
function exportReport() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.sales || DB.sales.length === 0) {
            showNotification('⚠️ Eksport uchun ma\'lumot yo\'q!', 'warning');
            return;
        }

        var data = [];
        for (var i = 0; i < DB.sales.length; i++) {
            var s = DB.sales[i];
            var itemsText = '';
            if (s.items) {
                for (var j = 0; j < s.items.length; j++) {
                    if (j > 0) itemsText += ', ';
                    itemsText += s.items[j].name;
                }
            }
            data.push({
                'Sana': formatDate(s.date),
                'Kassir': s.cashier || 'Noma\'lum',
                'Mahsulotlar': itemsText,
                'Jami': s.total,
                'To\'lov turi': s.paymentType === 'cash' ? 'Naxt' : 
                                 s.paymentType === 'terminal' ? 'Terminal' : 'Nasiya'
            });
        }

        if (typeof window.exportToCSV === 'function') {
            window.exportToCSV(data, 'salimboy_sale_' + new Date().toISOString().slice(0,10) + '.csv');
        } else {
            exportToCSV(data, 'salimboy_sale_' + new Date().toISOString().slice(0,10) + '.csv');
        }
        showNotification('✅ Hisobot eksport qilindi!', 'success');
    } catch(e) {
        console.log('Hisobot eksportida xatolik:', e);
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

function formatDate(date) {
    try {
        var d = new Date(date);
        return d.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e) {
        return date;
    }
}

// ===== GLOBAL NOTIFIKATSIYA =====
function showNotification(message, type) {
    type = type || 'info';
    
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

console.log('✅ Dashboard.js to\'liq yuklandi!');