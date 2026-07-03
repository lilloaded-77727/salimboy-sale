// ===== APP.JS - SALIMBOY SALE UMUMIY FUNKSIYALAR =====

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Salimboy Sale tizimi ishga tushdi!');
    console.log('👤 Foydalanuvchi: Salimboy');
    console.log('📅 Sana:', new Date().toLocaleDateString('uz-UZ'));
    console.log('🏷️ Dastur: Salimboy Sale Pro v1.0');
    console.log('💡 Ctrl+K - Tez qidiruv');
    console.log('👋 Xush kelibsiz!');
});

// ===== NOTIFIKATSIYA FUNKSIYASI (Global) =====
window.showNotification = function(message, type) {
    type = type || 'info';
    var colors = {
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#6C63FF'
    };
    
    // Eski notificationlarni o'chirish
    var oldNotifs = document.querySelectorAll('.custom-notification');
    for (var i = 0; i < oldNotifs.length; i++) {
        if (oldNotifs[i] && oldNotifs[i].parentNode) {
            oldNotifs[i].remove();
        }
    }
    
    var notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 16px 24px; background: #FFFFFF; border-left: 4px solid ' + colors[type] + '; border-radius: 12px; color: #1A1A2E; font-family: Inter, sans-serif; font-size: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 99999; animation: slideInRight 0.4s ease; max-width: 420px; border: 1px solid #EAEAEA; display: flex; align-items: center; gap: 12px;';
    
    var iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = '<span style="font-size: 20px;">' + (iconMap[type] || 'ℹ️') + '</span><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(function() {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 4000);
};

// ===== EKSPORT FUNKSIYASI (Global) =====
window.exportToCSV = function(data, filename) {
    if (!data || data.length === 0) {
        showNotification('Eksport uchun ma\'lumot topilmadi!', 'warning');
        return;
    }
    
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
    a.download = filename || 'export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ===== SALIMBOY SALE MAXSUS FUNKSIYALAR =====
var SalimboyApp = {
    version: '1.0.0',
    name: 'Salimboy Sale Pro',
    user: {
        name: 'Salimboy',
        role: 'Admin'
    },
    init: function() {
        console.log('🏷️ ' + this.name + ' v' + this.version + ' ishga tushdi!');
        console.log('👤 Foydalanuvchi: ' + this.user.name + ' (' + this.user.role + ')');
    }
};

// Dasturni ishga tushirish
setTimeout(function() {
    SalimboyApp.init();
}, 500);

// ===== SIDEBAR TOGGLE (Global) =====
(function() {
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
        
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
})();

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl+K - Qidiruvga fokus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.querySelector('.header-search input, #searchInput, #productSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape - Qidiruvdan chiqish
    if (e.key === 'Escape') {
        var activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }
    }
});

// ===== ANIMATSIYA STILLARI (FAQAT BIR MARTA) =====
(function() {
    if (!document.getElementById('salimboyAnimStyles')) {
        var animStyles = document.createElement('style');
        animStyles.id = 'salimboyAnimStyles';
        animStyles.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } } .custom-notification { animation: slideInRight 0.4s ease; }';
        document.head.appendChild(animStyles);
    }
})();

console.log('✅ App.js to\'liq yuklandi!');