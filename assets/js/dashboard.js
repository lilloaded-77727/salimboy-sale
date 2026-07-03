// ===== DASHBOARD.JS - STATISTIKA =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            var now = new Date();
            dateEl.textContent = now.toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
        }

        updateStats();
        loadReports();

        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }
    } catch(e) {
        console.log('Dashboard yuklashda xatolik:', e);
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
        
        // Smena ochiq bo'lsa, joriy savdoni qo'shish
        var currentTotal = 0;
        if (typeof shiftOpen !== 'undefined' && shiftOpen && currentShift) {
            currentTotal = currentShift.totalSales || 0;
        }
        
        var dailyTotal = (stats.daily ? stats.daily.total : 0) + currentTotal;
        var dailyCash = (stats.daily ? stats.daily.cash : 0);
        var dailyTerminal = (stats.daily ? stats.daily.terminal : 0);
        var dailyDebt = (stats.daily ? stats.daily.debt : 0);
        
        if (todayTotal) todayTotal.textContent = formatPrice(dailyTotal);
        if (todayCash) todayCash.textContent = formatPrice(dailyCash);
        if (todayTerminal) todayTerminal.textContent = formatPrice(dailyTerminal);
        if (todayDebt) todayDebt.textContent = formatPrice(dailyDebt);

        var total = dailyTotal || 1;
        var cashPercent = Math.round((dailyCash / total) * 100);
        var terminalPercent = Math.round((dailyTerminal / total) * 100);
        var debtPercent = Math.round((dailyDebt / total) * 100);

        updateCircleProgress('.stat-purple .circle', cashPercent);
        updateCircleProgress('.stat-blue .circle', terminalPercent);
        updateCircleProgress('.stat-red .circle', debtPercent);

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

// ===== HISOBOTLARNI YUKLASH =====
function loadReports() {
    try {
        var reports = JSON.parse(localStorage.getItem('salimboy_reports')) || [];
        var tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        
        if (reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">Hisobotlar mavjud emas</td></tr>';
            return;
        }
        
        var latest = reports.slice(-10).reverse();
        var html = '';
        for (var i = 0; i < latest.length; i++) {
            var r = latest[i];
            var date = new Date(r.date).toLocaleDateString('uz-UZ');
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + date + '</td>' +
                '<td>' + r.cashier + '</td>' +
                '<td>' + formatPrice(r.total) + '</td>' +
                '<td>' + (r.cash > 0 ? 'Naxt' : r.terminal > 0 ? 'Terminal' : 'Nasiya') + '</td>' +
                '<td><span class="status-badge completed">✅ Bajarildi</span></td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
    } catch(e) {
        console.log('Hisobotlarni yuklashda xatolik:', e);
    }
}

function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

console.log('✅ Dashboard.js yangilandi!');
