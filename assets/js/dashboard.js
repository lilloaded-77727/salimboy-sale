// ===== DASHBOARD.JS - TO'LIQ VERSIYA (SMENA HOLATI BILAN) =====

// ===== GLOBAL O'ZGARUVCHILAR =====
var salesChart = null;
var categoryChart = null;
var shiftOpen = false;
var currentShift = null;
var dailyStats = {
    cash: 0,
    terminal: 0,
    debt: 0,
    total: 0
};

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

        // DB ni yuklash
        if (typeof loadDB === 'function') {
            loadDB();
        }

        // Shift holatini yuklash
        checkShiftStatus();

        // Statistikani yuklash
        updateStats();

        // Grafiklarni yuklash
        initCharts();

        // So'nggi buyurtmalar
        loadRecentOrders();

        // Kam qolgan mahsulotlar
        loadLowStockProducts();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Dashboard.js yuklandi!');
        console.log('📊 Smena holati:', shiftOpen ? 'Ochiq' : 'Yopiq');
    } catch(e) {
        console.log('Dashboard yuklashda xatolik:', e);
    }
});

// ===== SMENA HOLATINI TEKSHIRISH =====
function checkShiftStatus() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.shifts) {
            shiftOpen = false;
            currentShift = null;
            // dailyStats ni tozalash
            dailyStats.cash = 0;
            dailyStats.terminal = 0;
            dailyStats.debt = 0;
            dailyStats.total = 0;
            return;
        }
        
        var openShift = null;
        for (var i = 0; i < DB.shifts.length; i++) {
            if (DB.shifts[i].status === 'open') {
                openShift = DB.shifts[i];
                break;
            }
        }
        
        if (openShift) {
            shiftOpen = true;
            currentShift = openShift;
            
            // DB dan statistikani yuklash
            if (typeof DB !== 'undefined' && DB && DB.statistics && DB.statistics.daily) {
                dailyStats.cash = DB.statistics.daily.cash || 0;
                dailyStats.terminal = DB.statistics.daily.terminal || 0;
                dailyStats.debt = DB.statistics.daily.debt || 0;
                dailyStats.total = DB.statistics.daily.total || 0;
            }
        } else {
            shiftOpen = false;
            currentShift = null;
            
            // Smena yopiq - statistikani 0 ga tushirish
            dailyStats.cash = 0;
            dailyStats.terminal = 0;
            dailyStats.debt = 0;
            dailyStats.total = 0;
            
            if (typeof DB !== 'undefined' && DB && DB.statistics) {
                if (DB.statistics.daily) {
                    DB.statistics.daily.total = 0;
                    DB.statistics.daily.cash = 0;
                    DB.statistics.daily.terminal = 0;
                    DB.statistics.daily.debt = 0;
                }
                if (typeof saveDB === 'function') {
                    saveDB();
                }
            }
        }
    } catch(e) {
        console.log('Smena holati tekshirilmadi:', e);
    }
}

// ===== STATISTIKA YANGILASH =====
function updateStats() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            console.log('DB mavjud emas');
            return;
        }
        
        // ===== SMENA HOLATINI TEKSHIRISH =====
        var isShiftOpen = false;
        if (typeof shiftOpen !== 'undefined') {
            isShiftOpen = shiftOpen;
        }
        
        // ===== STATISTIKANI OLISH =====
        var dailyTotal = 0;
        var dailyCash = 0;
        var dailyTerminal = 0;
        var dailyDebt = 0;
        
        if (isShiftOpen) {
            // Smena ochiq - dailyStats dan olish
            if (typeof dailyStats !== 'undefined') {
                dailyTotal = dailyStats.total || 0;
                dailyCash = dailyStats.cash || 0;
                dailyTerminal = dailyStats.terminal || 0;
                dailyDebt = dailyStats.debt || 0;
            } else if (DB.statistics && DB.statistics.daily) {
                dailyTotal = DB.statistics.daily.total || 0;
                dailyCash = DB.statistics.daily.cash || 0;
                dailyTerminal = DB.statistics.daily.terminal || 0;
                dailyDebt = DB.statistics.daily.debt || 0;
            }
        } else {
            // Smena yopiq - 0 ko'rsatish
            dailyTotal = 0;
            dailyCash = 0;
            dailyTerminal = 0;
            dailyDebt = 0;
            
            // DB dagi kunlik statistikani 0 ga tushirish
            if (DB.statistics && DB.statistics.daily) {
                DB.statistics.daily.total = 0;
                DB.statistics.daily.cash = 0;
                DB.statistics.daily.terminal = 0;
                DB.statistics.daily.debt = 0;
                if (typeof saveDB === 'function') {
                    saveDB();
                }
            }
        }
        
        // ===== DOM GA YOZISH =====
        var todayTotal = document.getElementById('todayTotal');
        var todayCash = document.getElementById('todayCash');
        var todayTerminal = document.getElementById('todayTerminal');
        var todayDebt = document.getElementById('todayDebt');
        var totalOrders = document.getElementById('totalOrders');
        var totalCustomers = document.getElementById('totalCustomers');
        var totalDebtors = document.getElementById('totalDebtors');
        
        if (todayTotal) todayTotal.textContent = formatPrice(dailyTotal);
        if (todayCash) todayCash.textContent = formatPrice(dailyCash);
        if (todayTerminal) todayTerminal.textContent = formatPrice(dailyTerminal);
        if (todayDebt) todayDebt.textContent = formatPrice(dailyDebt);
        
        // Qo'shimcha statistikalar
        if (totalOrders) totalOrders.textContent = Math.floor(Math.random() * 100 + 100);
        if (totalCustomers) totalCustomers.textContent = Math.floor(Math.random() * 500 + 500);
        if (totalDebtors) totalDebtors.textContent = Math.floor(Math.random() * 20 + 10);
        
        // ===== FOIZLARNI HISOBLASH =====
        var total = dailyTotal || 1;
        var cashPercent = Math.round((dailyCash / total) * 100);
        var terminalPercent = Math.round((dailyTerminal / total) * 100);
        var debtPercent = Math.round((dailyDebt / total) * 100);
        
        // Dumaloq progress
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
        
        console.log('📊 Statistika yangilandi:', {
            shiftOpen: isShiftOpen,
            dailyTotal: dailyTotal,
            dailyCash: dailyCash,
            dailyTerminal: dailyTerminal,
            dailyDebt: dailyDebt
        });
        
    } catch(e) {
        console.log('Statistika xatolik:', e);
    }
}

// ===== DUMALOQ PROGRESS =====
function updateCircleProgress(selector, percent) {
    try {
        var circles = document.querySelectorAll(selector);
        for (var i = 0; i < circles.length; i++) {
            var value = Math.min(percent, 100);
            circles[i].style.strokeDasharray = value + ', 100';
        }
    } catch(e) {
        console.log('Progress yangilashda xatolik:', e);
    }
}

// ===== GRAFIKLAR =====
function initCharts() {
    initSalesChart();
    initCategoryChart();
    
    var periodSelect = document.getElementById('chartPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateSalesChart(this.value);
        });
    }
}

function initSalesChart() {
    var ctx = document.getElementById('salesChartCanvas');
    if (!ctx) return;
    
    if (typeof Chart === 'undefined') {
        console.log('Chart.js yuklanmagan');
        return;
    }
    
    if (salesChart) {
        salesChart.destroy();
        salesChart = null;
    }
    
    var theme = document.body.classList.contains('light-theme') ? 'light' : 
                 document.body.classList.contains('gray-theme') ? 'gray' : 'dark';
    var textColor = theme === 'light' ? '#555' : 
                    theme === 'gray' ? '#4a4a6a' : '#A0A0B8';
    var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 
                    theme === 'gray' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
            datasets: [{
                label: 'Savdo (so\'m)',
                data: [3200000, 4500000, 2800000, 5600000, 7200000, 8900000, 12450000],
                borderColor: '#6C63FF',
                backgroundColor: 'rgba(108,99,255,0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#6C63FF',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { size: 12, family: 'Inter' },
                        boxWidth: 12,
                        padding: 16,
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
                    padding: 12,
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
                            if (value >= 10000000) return (value / 10000000).toFixed(1) + 'M';
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            return value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateSalesChart(period) {
    if (!salesChart) return;
    
    var data = {
        week: [3200000, 4500000, 2800000, 5600000, 7200000, 8900000, 12450000],
        month: [2800000, 3200000, 4500000, 3800000, 5600000, 7200000, 8900000, 
                6500000, 9800000, 11200000, 12450000, 10800000, 13200000, 14500000],
        year: [8500000, 9200000, 7800000, 11200000, 9800000, 12400000, 
               13200000, 11800000, 14500000, 15200000, 16800000, 18200000]
    };
    
    var labels = {
        week: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
        month: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
        year: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
    };
    
    salesChart.data.labels = labels[period] || labels.week;
    salesChart.data.datasets[0].data = data[period] || data.week;
    salesChart.update();
}

function initCategoryChart() {
    var ctx = document.getElementById('categoryChartCanvas');
    if (!ctx) return;
    
    if (typeof Chart === 'undefined') {
        console.log('Chart.js yuklanmagan');
        return;
    }
    
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
    
    var theme = document.body.classList.contains('light-theme') ? 'light' : 
                 document.body.classList.contains('gray-theme') ? 'gray' : 'dark';
    var textColor = theme === 'light' ? '#555' : 
                    theme === 'gray' ? '#4a4a6a' : '#A0A0B8';
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Elektronika', 'Kiyim', 'Oziq-ovqat', 'Mebel', 'Boshqa'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#6C63FF',
                    '#3498DB',
                    '#2ECC71',
                    '#F39C12',
                    '#E74C3C'
                ],
                borderWidth: 3,
                borderColor: 'var(--bg-card)',
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { size: 11, family: 'Inter' },
                        padding: 14,
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
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// ===== GRAFIKLARNI TEMAGA MOSLASH =====
function updateChartsTheme(theme) {
    try {
        if (typeof Chart === 'undefined') return;
        
        var textColor = theme === 'light' ? '#555' : 
                        theme === 'gray' ? '#4a4a6a' : '#A0A0B8';
        var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 
                        theme === 'gray' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
        
        // Sales chart
        if (salesChart) {
            if (salesChart.options.scales) {
                if (salesChart.options.scales.x) {
                    if (salesChart.options.scales.x.ticks) salesChart.options.scales.x.ticks.color = textColor;
                    if (salesChart.options.scales.x.grid) salesChart.options.scales.x.grid.color = gridColor;
                }
                if (salesChart.options.scales.y) {
                    if (salesChart.options.scales.y.ticks) salesChart.options.scales.y.ticks.color = textColor;
                    if (salesChart.options.scales.y.grid) salesChart.options.scales.y.grid.color = gridColor;
                }
            }
            if (salesChart.options.plugins && salesChart.options.plugins.legend) {
                if (salesChart.options.plugins.legend.labels) {
                    salesChart.options.plugins.legend.labels.color = textColor;
                }
            }
            salesChart.update();
        }
        
        // Category chart
        if (categoryChart) {
            if (categoryChart.options.plugins && categoryChart.options.plugins.legend) {
                if (categoryChart.options.plugins.legend.labels) {
                    categoryChart.options.plugins.legend.labels.color = textColor;
                }
            }
            categoryChart.update();
        }
    } catch(e) {
        console.log('Grafik yangilashda xatolik:', e);
    }
}

// ===== SO'NGGI BUYURTMALAR =====
function loadRecentOrders() {
    var tbody = document.getElementById('recentOrders');
    if (!tbody) return;
    
    var orders = [
        { id: '#SB-001', customer: 'Ali Valiyev', product: 'iPhone 15 Pro', qty: 2, total: '24,000,000', date: '04.07.2026', status: 'completed' },
        { id: '#SB-002', customer: 'Dilnoza Karimova', product: 'MacBook Air', qty: 1, total: '18,000,000', date: '04.07.2026', status: 'shipped' },
        { id: '#SB-003', customer: 'Bobur Toshmatov', product: 'Samsung TV', qty: 1, total: '9,500,000', date: '03.07.2026', status: 'pending' },
        { id: '#SB-004', customer: 'Gulnora Rahimova', product: 'Ayollar ko\'ylagi', qty: 3, total: '1,350,000', date: '03.07.2026', status: 'completed' },
        { id: '#SB-005', customer: 'Sarvar Xolmatov', product: 'Oziq-ovqat to\'plami', qty: 5, total: '1,250,000', date: '02.07.2026', status: 'cancelled' },
        { id: '#SB-006', customer: 'Zarina Toshpo\'latova', product: 'Samsung Galaxy S24', qty: 2, total: '19,600,000', date: '02.07.2026', status: 'shipped' }
    ];
    
    var statusMap = {
        'completed': 'Bajarildi',
        'pending': 'Kutilmoqda',
        'shipped': 'Yuborilgan',
        'cancelled': 'Bekor qilingan'
    };
    
    var html = '';
    for (var i = 0; i < orders.length; i++) {
        var o = orders[i];
        html += '<tr>' +
            '<td>' + o.id + '</td>' +
            '<td><strong>' + o.customer + '</strong></td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.qty + '</td>' +
            '<td>' + o.total + ' so\'m</td>' +
            '<td>' + o.date + '</td>' +
            '<td><span class="status-badge ' + o.status + '">' + statusMap[o.status] + '</span></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// ===== KAM QOLGAN MAHSULOTLAR =====
function loadLowStockProducts() {
    var tbody = document.getElementById('lowStockTable');
    if (!tbody) return;
    
    try {
        if (typeof DB === 'undefined' || !DB || !DB.products) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Mahsulotlar mavjud emas</td></tr>';
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
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Kam qolgan mahsulot yo\'q ✅</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < lowStock.length; i++) {
            var p = lowStock[i];
            var statusClass = p.stock <= 3 ? 'status-critical' : 'status-low';
            var statusText = p.stock <= 3 ? '⚠️ Juda kam' : '⚠️ Kam qolgan';
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + p.name + '</td>' +
                '<td><strong>' + p.stock + '</strong></td>' +
                '<td class="' + statusClass + '">' + statusText + '</td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
    } catch(e) {
        console.log('Kam qolgan mahsulotlarni yuklashda xatolik:', e);
    }
}

// ===== HISOBOT EKSPORT =====
function exportReport() {
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
                    if (j > 0) itemsText += ', ';
                    itemsText += s.items[j].name + ' (' + s.items[j].quantity + 'x)';
                }
            }
            data.push({
                'Sana': new Date(s.date).toLocaleDateString('uz-UZ'),
                'Kassir': s.cashier || 'Noma\'lum',
                'Mahsulotlar': itemsText,
                'Jami': s.total,
                'To\'lov turi': s.paymentType === 'cash' ? 'Naxt' : 
                                 s.paymentType === 'terminal' ? 'Terminal' : 'Nasiya'
            });
        }
        
        if (typeof exportToCSV === 'function') {
            exportToCSV(data, 'salimboy_sale_' + new Date().toISOString().slice(0,10) + '.csv');
            showNotification('✅ Hisobot eksport qilindi!', 'success');
        }
    } catch(e) {
        console.log('Hisobot eksportida xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== QO'SHIMCHA FUNKSIYALAR =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

console.log('✅ Dashboard.js yuklandi!');