// ===== THEME.JS - GRAFIKA YANGILASH =====

// ===== GRAFIKALARNI YANGILASH =====
function updateChartsTheme(theme) {
    try {
        if (typeof Chart === 'undefined' || !Chart.instances) return;
        
        var textColor = theme === 'light' ? '#555' : '#A0A0B8';
        var gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
        var borderColor = theme === 'light' ? '#e8e8f0' : 'rgba(255,255,255,0.06)';
        
        for (var i = 0; i < Chart.instances.length; i++) {
            var chart = Chart.instances[i];
            if (chart && chart.options) {
                // Legend
                if (chart.options.plugins && chart.options.plugins.legend) {
                    if (chart.options.plugins.legend.labels) {
                        chart.options.plugins.legend.labels.color = textColor;
                    }
                }
                // Scales
                if (chart.options.scales) {
                    if (chart.options.scales.x) {
                        if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = textColor;
                        if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
                    }
                    if (chart.options.scales.y) {
                        if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = textColor;
                        if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
                    }
                }
                chart.update();
            }
        }
    } catch(e) {
        console.log('Grafik yangilashda xatolik:', e);
    }
}
