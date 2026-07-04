// ===== APP.JS - SALIMBOY SALE =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Salimboy Sale tizimi ishga tushdi!');
    console.log('👤 Foydalanuvchi: Salimboy');
    console.log('📅 Sana:', new Date().toLocaleDateString('uz-UZ'));
    console.log('🏷️ Dastur: Salimboy Sale Pro v1.0');
    console.log('💡 Ctrl+K - Tez qidiruv');
    console.log('👋 Xush kelibsiz!');
});

// ===== NOTIFIKATSIYA =====
function showNotification(message, type) {
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
    notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;background:var(--bg-card);border-left:4px solid ' + colors[type] + ';border-radius:12px;color:var(--text-primary);font-family:Inter,sans-serif;font-size:14px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:99999;animation:slideInRight 0.4s ease;max-width:420px;border:1px solid var(--border-color);display:flex;align-items:center;gap:12px;';
    
    var iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = '<span style="font-size:20px;">' + (iconMap[type] || 'ℹ️') + '</span><span>' + message + '</span>';
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(function() {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 4000);
}

// ===== SIDEBAR TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
        
        // Tashqariga bosganda yopish
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
});

console.log('✅ App.js yuklandi!');