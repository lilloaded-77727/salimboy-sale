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
    
    var notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;background:#FFFFFF;border-left:4px solid ' + colors[type] + ';border-radius:12px;color:#1A1A2E;font-family:Inter,sans-serif;font-size:14px;box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:99999;animation:slideInRight 0.4s ease;max-width:420px;border:1px solid #EAEAEA;display:flex;align-items:center;gap:12px;';
    
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
        setTimeout(function() { if (notification.parentNode) notification.remove(); }, 400);
    }, 4000);
}

console.log('✅ App.js yuklandi!');
