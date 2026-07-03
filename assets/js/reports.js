// ===== REPORTS.JS - TO'LIQ HISOBOT LOGIKASI (TUZATILGAN) =====

var paymentChartInstance = null;
var monthlyPieChartInstance = null;

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

        // Statistikani yuklash
        loadReportStats();

        // Grafiklarni yuklash
        loadCharts();

        // Kunlik savdolarni yuklash
        loadDailySales();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Reports.js yuklandi!');
    } catch(e) {
        console.log('Reports.js yuklashda xatolik:', e);
    }
});

// ===== STATISTIKANI YUKLASH =====
function loadReportStats() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            console.log('Ma\'lumotlar bazasi topilmadi');
            return;
        }

        var stats = DB.statistics;
        if (!stats) {
            console.log('Statistika mavjud emas');
            return;
        }

        var dailyTotal = document.getElementById('dailyTotal');
        var monthlyTotal = document.getElementById('monthlyTotal');
        var yearlyTotal = document.getElementById('yearlyTotal');
        var totalDebtEl = document.getElementById('totalDebt');

        if (dailyTotal) dailyTotal.textContent = formatPrice(stats.daily ? stats.daily.total : 0);
        if (monthlyTotal) monthlyTotal.textContent = formatPrice(stats.monthly ? stats.monthly.total : 0);
        if (yearlyTotal) yearlyTotal.textContent = formatPrice(stats.yearly ? stats.yearly.total : 0);
        
        // Jami nasiya
        var totalDebt = 0;
        if (DB.debtors) {
            for (var i = 0; i < DB.debtors.length; i++) {
                if (DB.debtors[i].status === 'pending') {
                    totalDebt += DB.debtors[i].amount;
                }
            }
        }
        if (totalDebtEl) totalDebtEl.textContent = formatPrice(totalDebt);
    } catch(e) {
        console.log('Statistika yuklashda xatolik:', e);
    }
}

// ===== GRAFIKLARNI YUKLASH =====
function loadCharts() {
    try {
        // Chart.js mavjudligini tekshirish
        if (typeof Chart === 'undefined') {
            console.log('Chart.js yuklanmagan');
            return;
        }
        loadPaymentChart();
        loadMonthlyPieChart();
    } catch(e) {
        console.log('Grafiklarni yuklashda xatolik:', e);
    }
}

// ===== TO'LOV TURLARI GRAFIKI =====
function loadPaymentChart() {
    try {
        var ctx = document.getElementById('paymentChart');
        if (!ctx) return;

        if (typeof DB === 'undefined' || !DB || !DB.statistics) {
            console.log('Statistika mavjud emas');
            return;
        }

        var stats = DB.statistics;
        
        if (paymentChartInstance) {
            paymentChartInstance.destroy();
            paymentChartInstance = null;
        }

        paymentChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Naxt', 'Terminal', 'Nasiya'],
                datasets: [{
                    label: 'Savdo summasi',
                    data: [
                        stats.daily ? stats.daily.cash || 0 : 0,
                        stats.daily ? stats.daily.terminal || 0 : 0,
                        stats.daily ? stats.daily.debt || 0 : 0
                    ],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
                    borderColor: [
                        '#2ECC71',
                        '#3498DB',
                        '#E74C3C'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#888',
                            font: { size: 11, family: 'Inter' },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
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
                        ticks: { color: '#999', font: { size: 11 } }
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
    } catch(e) {
        console.log('To\'lov grafigini yuklashda xatolik:', e);
    }
}

// ===== OYLIK SAVDO PIE GRAFIKI =====
function loadMonthlyPieChart() {
    try {
        var ctx = document.getElementById('monthlyPieChart');
        if (!ctx) return;

        // Oxirgi 6 oy uchun ma'lumot
        var months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'];
        var data = [12000000, 15000000, 18000000, 22000000, 28000000, 35000000];
        
        if (monthlyPieChartInstance) {
            monthlyPieChartInstance.destroy();
            monthlyPieChartInstance = null;
        }

        monthlyPieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: months,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#6C63FF',
                        '#3498DB',
                        '#2ECC71',
                        '#F39C12',
                        '#E74C3C',
                        '#9B59B6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#888',
                            font: { size: 11, family: 'Inter' },
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toLocaleString() + ' so\'m';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    } catch(e) {
        console.log('Oylik pie grafigini yuklashda xatolik:', e);
    }
}

// ===== KUNLIK SAVDOLARNI YUKLASH =====
function loadDailySales() {
    try {
        var tbody = document.getElementById('dailySalesTable');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.sales) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Savdo ma'lumotlari mavjud emas
                    </td>
                </tr>
            `;
            return;
        }

        var filterEl = document.getElementById('reportFilter');
        var filter = filterEl ? filterEl.value : 'month';
        var now = new Date();
        var sales = DB.sales;

        // Filter bo'yicha saralash
        if (filter === 'today') {
            var today = now.toDateString();
            var filteredSales = [];
            for (var i = 0; i < sales.length; i++) {
                if (new Date(sales[i].date).toDateString() === today) {
                    filteredSales.push(sales[i]);
                }
            }
            sales = filteredSales;
        } else if (filter === 'week') {
            var weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            var filteredSales = [];
            for (var i = 0; i < sales.length; i++) {
                if (new Date(sales[i].date) >= weekAgo) {
                    filteredSales.push(sales[i]);
                }
            }
            sales = filteredSales;
        } else if (filter === 'month') {
            var monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            var filteredSales = [];
            for (var i = 0; i < sales.length; i++) {
                if (new Date(sales[i].date) >= monthAgo) {
                    filteredSales.push(sales[i]);
                }
            }
            sales = filteredSales;
        } else if (filter === 'year') {
            var yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            var filteredSales = [];
            for (var i = 0; i < sales.length; i++) {
                if (new Date(sales[i].date) >= yearAgo) {
                    filteredSales.push(sales[i]);
                }
            }
            sales = filteredSales;
        }

        // Sana bo'yicha saralash (eng yangisi birinchi)
        sales.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        if (sales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Savdo ma'lumotlari topilmadi
                    </td>
                </tr>
            `;
            return;
        }

        // Kunlik savdolarni guruhlash
        var dailyData = {};
        for (var i = 0; i < sales.length; i++) {
            var s = sales[i];
            var date = new Date(s.date).toLocaleDateString('uz-UZ');
            if (!dailyData[date]) {
                dailyData[date] = {
                    date: date,
                    cashier: s.cashier || 'Noma\'lum',
                    cash: 0,
                    terminal: 0,
                    debt: 0,
                    total: 0,
                    status: 'completed'
                };
            }
            if (s.paymentType === 'cash') {
                dailyData[date].cash += s.total;
            } else if (s.paymentType === 'terminal') {
                dailyData[date].terminal += s.total;
            } else if (s.paymentType === 'debt') {
                dailyData[date].debt += s.total;
            }
            dailyData[date].total += s.total;
        }

        var days = Object.keys(dailyData);
        var html = '';
        for (var j = 0; j < days.length; j++) {
            var d = dailyData[days[j]];
            html += `
                <tr>
                    <td>${j + 1}</td>
                    <td>${d.date}</td>
                    <td>${d.cashier}</td>
                    <td>${formatPrice(d.cash)}</td>
                    <td>${formatPrice(d.terminal)}</td>
                    <td>${formatPrice(d.debt)}</td>
                    <td><strong>${formatPrice(d.total)}</strong></td>
                    <td class="status-completed">✅ Bajarildi</td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
    } catch(e) {
        console.log('Kunlik savdolarni yuklashda xatolik:', e);
        var tbody = document.getElementById('dailySalesTable');
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

// ===== HISOBOTNI EKSPORT QILISH =====
function exportFullReport() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.sales || DB.sales.length === 0) {
            showNotification('⚠️ Eksport uchun ma\'lumot yo\'q!', 'warning');
            return;
        }

        var sales = DB.sales;
        var data = [];
        for (var i = 0; i < sales.length; i++) {
            var s = sales[i];
            var itemsText = '';
            if (s.items) {
                for (var j = 0; j < s.items.length; j++) {
                    var item = s.items[j];
                    if (j > 0) itemsText += ', ';
                    itemsText += item.name + ' (' + item.quantity + 'x)';
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
            window.exportToCSV(data, 'salimboy_sale_hisobot_' + new Date().toISOString().slice(0,10) + '.csv');
        } else {
            exportToCSV(data, 'salimboy_sale_hisobot_' + new Date().toISOString().slice(0,10) + '.csv');
        }
        showNotification('✅ Hisobot eksport qilindi!', 'success');
    } catch(e) {
        console.log('Hisobot eksportida xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== HISOBOTNI CHOP ETISH =====
function printReport() {
    try {
        window.print();
    } catch(e) {
        console.log('Chop etishda xatolik:', e);
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

console.log('✅ Reports.js to\'liq yuklandi!');