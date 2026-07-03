// ===== THEME.JS - DARK/LIGHT REJIM =====

function loadTheme() {
    try {
        var theme = localStorage.getItem('salimboy_theme') || 'dark';
        var body = document.body;
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
        var icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
        console.log('✅ Tema:', theme);
    } catch(e) {}
}

function toggleTheme() {
    try {
        var body = document.body;
        var isLight = body.classList.contains('light-theme');
        var newTheme = isLight ? 'dark' : 'light';
        
        if (newTheme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
        
        localStorage.setItem('salimboy_theme', newTheme);
        
        var icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
        console.log('🌓 Tema:', newTheme);
        
        // Grafiklarni yangilash
        if (typeof updateChartsTheme === 'function') {
            updateChartsTheme(newTheme);
        }
    } catch(e) {}
}

function updateChartsTheme(theme) {
    try {
        if (typeof Chart !== 'undefined' && Chart.instances) {
            var color = theme === 'light' ? '#888' : '#A0A0B8';
            var gridColor = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
            for (var i = 0; i < Chart.instances.length; i++) {
                var chart = Chart.instances[i];
                if (chart && chart.options && chart.options.scales) {
                    if (chart.options.scales.x) {
                        chart.options.scales.x.ticks.color = color;
                        chart.options.scales.x.grid.color = gridColor;
                    }
                    if (chart.options.scales.y) {
                        chart.options.scales.y.ticks.color = color;
                        chart.options.scales.y.grid.color = gridColor;
                    }
                    chart.update();
                }
            }
        }
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', loadTheme);
console.log('✅ Theme.js yuklandi!');
