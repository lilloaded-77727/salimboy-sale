// ===== REPORTS.JS - HISOBOT LOGIKASI =====

var paymentChartInstance = null;
var monthlyPieChartInstance = null;

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
        
        loadReportStats();
        loadCharts();
        loadDailySales();
        
        console.log('✅ Reports.js yuklandi!');
    } catch(e) {
        console.log('Reports.js yuklashda xatolik:', e);
    }
});

// ===== STATISTIKA =====
function loadReportStats() {
    try {
        if (typeof DB === 'undefined' || !DB) return;
        
        var stats = DB.statistics || {};
        var dailyTotal = stats.daily ? stats.daily.total : 0;
        var monthlyTotal = stats.monthly ? stats.monthly.total : 0;
        var yearlyTotal = stats.yearly ? stats.yearly.total : 0;
        
        document.getElementById('dailyTotal').textContent = formatPrice(dailyTotal);
        document.getElementById('monthlyTotal').textContent = formatPrice(monthlyTotal);
        document.getElementById('yearlyTotal').textContent = formatPrice(yearlyTotal);
        
        // Jami nasiya
        var totalDebt = 0;
        if (DB.debtors) {
            for (var i = 0; i < DB.debtors.length; i++) {
                if (DB.debtors[i].status === 'pending') {
                    totalDebt += DB.debtors[i].amount;
                }
            }
        }
        document.getElementById('totalDebt').textContent = formatPrice(totalDebt);
    } catch(e) {
        console.log('Statistika yuklashda xatolik:', e);
    }
}

// ===== GRAFIKLAR =====
function loadCharts() {
    try {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js yuklanmagan');
            return;
        }
        loadPaymentChart();
        loadMonthlyPieChart();
    } catch(e) {
        console.log('Grafik yuklashda xatolik:', e);
    }
}

function loadPaymentChart() {
    var ctx = document.getElementById('paymentChart');
    if (!ctx) return;
    
    var stats = DB.statistics || {};
    
    if (paymentChartInstance) {
        paymentChartInstance.destroy();
        paymentChartInstance = null;
    }
    
    var theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    var textColor = theme === 'light' ? '#555' : '#A0A0B8';
    var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
    
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
                borderColor: ['#2ECC71', '#3498DB', '#E74C3C'],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { size: 11, family: 'Inter' },
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#A0A0B8',
                    borderColor: 'rgba(108,99,255,0.3)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString() + ' so\'m';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { color: textColor, font: { size: 11 } }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        font: { size: 11 },
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
}

function loadMonthlyPieChart() {
    var ctx = document.getElementById('monthlyPieChart');
    if (!ctx) return;
    
    var months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'];
    var data = [12000000, 15000000, 18000000, 22000000, 28000000, 35000000];
    
    if (monthlyPieChartInstance) {
        monthlyPieChartInstance.destroy();
        monthlyPieChartInstance = null;
    }
    
    var theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    var textColor = theme === 'light' ? '#555' : '#A0A0B8';
    
    monthlyPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: months,
            datasets: [{
                data: data,
                backgroundColor: ['#6C63FF', '#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6'],
                borderWidth: 3,
                borderColor: 'var(--bg-card)',
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { size: 11, family: 'Inter' },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#A0A0B8',
                    borderColor: 'rgba(108,99,255,0.3)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toLocaleString() + ' so\'m';
                        }
                    }
                }
            }
        }
    });
}

// ===== KUNLIK SAVDOLAR =====
function loadDailySales() {
    var tbody = document.getElementById('dailySalesTable');
    if (!tbody) return;
    
    var filter = document.getElementById('reportFilter').value;
    var now = new Date();
    var sales = DB.sales || [];
    
    // Filter
    if (filter === 'today') {
        var today = now.toDateString();
        var temp = [];
        for (var i = 0; i < sales.length; i++) {
            if (new Date(sales[i].date).toDateString() === today) {
                temp.push(sales[i]);
            }
        }
        sales = temp;
    } else if (filter === 'week') {
        var weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        var temp = [];
        for (var i = 0; i < sales.length; i++) {
            if (new Date(sales[i].date) >= weekAgo) {
                temp.push(sales[i]);
            }
        }
        sales = temp;
    } else if (filter === 'month') {
        var monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        var temp = [];
        for (var i = 0; i < sales.length; i++) {
            if (new Date(sales[i].date) >= monthAgo) {
                temp.push(sales[i]);
            }
        }
        sales = temp;
    } else if (filter === 'year') {
        var yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        var temp = [];
        for (var i = 0; i < sales.length; i++) {
            if (new Date(sales[i].date) >= yearAgo) {
                temp.push(sales[i]);
            }
        }
        sales = temp;
    }
    
    sales.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.5;"></i>Savdo ma\'lumotlari topilmadi</td></tr>';
        return;
    }
    
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
                total: 0
            };
        }
        if (s.paymentType === 'cash') dailyData[date].cash += s.total;
        else if (s.paymentType === 'terminal') dailyData[date].terminal += s.total;
        else if (s.paymentType === 'debt') dailyData[date].debt += s.total;
        dailyData[date].total += s.total;
    }
    
    var days = Object.keys(dailyData);
    var html = '';
    for (var j = 0; j < days.length; j++) {
        var d = dailyData[days[j]];
        html += '<tr>' +
            '<td>' + (j + 1) + '</td>' +
            '<td>' + d.date + '</td>' +
            '<td>' + d.cashier + '</td>' +
            '<td>' + formatPrice(d.cash) + '</td>' +
            '<td>' + formatPrice(d.terminal) + '</td>' +
            '<td>' + formatPrice(d.debt) + '</td>' +
            '<td><strong>' + formatPrice(d.total) + '</strong></td>' +
            '<td><span class="status-badge completed">✅ Bajarildi</span></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// ===== EKSPORT =====
function exportFullReport() {
    var sales = DB.sales || [];
    if (sales.length === 0) {
        showNotification('⚠️ Eksport uchun ma\'lumot yo\'q!', 'warning');
        return;
    }
    
    var data = [];
    for (var i = 0; i < sales.length; i++) {
        var s = sales[i];
        var itemsText = '';
        if (s.items) {
            for (var j = 0; j < s.items.length; j++) {
                if (j > 0) itemsText += ', ';
                itemsText += s.items[j].name + ' (' + s.items[j].quantity + 'x)';
            }
        }
        data.push({
            'Sana': new Date(s.date).toLocaleDateString('uz-UZ'),
            'Kassir': s.cashier || 'Noma\'lum',
            'Mahsulotlar': itemsText,
            'Jami': s.total,
            'To\'lov turi': s.paymentType === 'cash' ? 'Naxt' : s.paymentType === 'terminal' ? 'Terminal' : 'Nasiya'
        });
    }
    
    exportToCSV(data, 'salimboy_sale_hisobot_' + new Date().toISOString().slice(0,10) + '.csv');
    showNotification('✅ Hisobot eksport qilindi!', 'success');
}

function printReport() {
    window.print();
}

// ===== QO'SHIMCHA =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
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

console.log('✅ Reports.js yuklandi!');