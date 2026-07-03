// ===== DASHBOARD.JS - GRAFIKALAR =====

var salesChart = null;
var categoryChart = null;

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

        // Statistikani yuklash
        updateStats();

        // Grafikalarni yuklash
        initCharts();

        // So'nggi buyurtmalar
        loadRecentOrders();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Dashboard.js yuklandi!');
    } catch(e) {
        console.log('Dashboard yuklashda xatolik:', e);
    }
});

// ===== GRAFIKALARNI ISHGA TUSHIRISH =====
function initCharts() {
    initSalesChart();
    initCategoryChart();
    
    // Period o'zgarishi
    var periodSelect = document.getElementById('chartPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateSalesChart(this.value);
        });
    }
}

// ===== SAVDO GRAFIKI =====
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

    var theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    var textColor = theme === 'light' ? '#555' : '#A0A0B8';
    var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
            datasets: [{
                label: 'Savdo (so\'m)',
                data: [3200000, 4500000, 2800000, 5600000, 7200000, 8900000, 12450000],
                borderColor: '#6C63FF',
                backgroundColor: 'rgba(108, 99, 255, 0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#6C63FF',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#6C63FF'
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

// ===== SAVDO GRAFIKINI YANGILASH =====
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

// ===== KATEGORIYA GRAFIKI =====
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

    var theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    var textColor = theme === 'light' ? '#555' : '#A0A0B8';

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

// ===== GRAFIKALARNI YANGILASH (THEMA O'ZGARGANDA) =====
function updateChartsTheme(theme) {
    try {
        if (typeof Chart === 'undefined') return;
        
        var textColor = theme === 'light' ? '#555' : '#A0A0B8';
        var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
        
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

// ===== STATISTIKA =====
function updateStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.statistics) return;
        
        var stats = DB.statistics;
        
        var todayTotal = document.getElementById('todayTotal');
        var totalOrders = document.getElementById('totalOrders');
        var totalCustomers = document.getElementById('totalCustomers');
        var totalDebtors = document.getElementById('totalDebtors');
        
        if (todayTotal) todayTotal.textContent = formatPrice(stats.daily ? stats.daily.total : 0);
        if (totalOrders) totalOrders.textContent = Math.floor(Math.random() * 100 + 100);
        if (totalCustomers) totalCustomers.textContent = Math.floor(Math.random() * 500 + 500);
        if (totalDebtors) totalDebtors.textContent = Math.floor(Math.random() * 20 + 10);
        
    } catch(e) {
        console.log('Statistikani yangilashda xatolik:', e);
    }
}

// ===== SO'NGGI BUYURTMALAR =====
function loadRecentOrders() {
    var tbody = document.getElementById('recentOrders');
    if (!tbody) return;

    var orders = [
        { id: '#ORD-001', customer: 'Ali Valiyev', product: 'iPhone 15 Pro', qty: 2, total: '24,000,000', date: '04.07.2026', status: 'completed' },
        { id: '#ORD-002', customer: 'Dilnoza Karimova', product: 'MacBook Air', qty: 1, total: '18,000,000', date: '04.07.2026', status: 'shipped' },
        { id: '#ORD-003', customer: 'Bobur Toshmatov', product: 'Samsung TV', qty: 1, total: '9,500,000', date: '03.07.2026', status: 'pending' },
        { id: '#ORD-004', customer: 'Gulnora Rahimova', product: 'Ayollar ko\'ylagi', qty: 3, total: '1,350,000', date: '03.07.2026', status: 'completed' }
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

function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

console.log('✅ Dashboard.js grafikalar tuzatildi!');
