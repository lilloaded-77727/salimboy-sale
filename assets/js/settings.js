// ===== SETTINGS.JS - TO'LIQ SOZLAMALAR LOGIKASI (TUZATILGAN) =====

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

        // Sozlamalarni yuklash
        loadSettings();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        // Oxirgi zaxira vaqtini ko'rsatish
        updateLastBackup();

        console.log('✅ Settings.js yuklandi!');
    } catch(e) {
        console.log('Settings.js yuklashda xatolik:', e);
    }
});

// ===== TAB SWITCH =====
function switchTab(tabName) {
    try {
        // Tab buttonlarni yangilash
        var buttons = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
        }
        var activeBtn = document.querySelector('.tab-btn[data-tab="' + tabName + '"]');
        if (activeBtn) activeBtn.classList.add('active');

        // Panelni yangilash
        var panels = document.querySelectorAll('.settings-panel');
        for (var i = 0; i < panels.length; i++) {
            panels[i].classList.remove('active');
        }
        var activePanel = document.getElementById('panel-' + tabName);
        if (activePanel) activePanel.classList.add('active');
    } catch(e) {
        console.log('Tab switch xatolik:', e);
    }
}

// ===== SOZLAMALARNI YUKLASH =====
function loadSettings() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.settings) {
            console.log('Sozlamalar mavjud emas');
            return;
        }
        
        var settings = DB.settings;
        
        // Umumiy
        var shopName = document.getElementById('shopName');
        var shopOwner = document.getElementById('shopOwner');
        var shopPhone = document.getElementById('shopPhone');
        var shopAddress = document.getElementById('shopAddress');
        
        if (shopName) shopName.value = settings.shopName || '';
        if (shopOwner) shopOwner.value = settings.shopOwner || '';
        if (shopPhone) shopPhone.value = settings.shopPhone || '';
        if (shopAddress) shopAddress.value = settings.shopAddress || '';
        
        // Chek dizayni
        var receiptHeader = document.getElementById('receiptHeader');
        var receiptFooter = document.getElementById('receiptFooter');
        var receiptFont = document.getElementById('receiptFont');
        var receiptSize = document.getElementById('receiptSize');
        
        if (receiptHeader) receiptHeader.value = settings.receiptHeader || '';
        if (receiptFooter) receiptFooter.value = settings.receiptFooter || '';
        if (receiptFont) receiptFont.value = settings.receiptFont || 'monospace';
        if (receiptSize) receiptSize.value = settings.receiptSize || 'medium';
        
        // Tema
        var themeMode = document.getElementById('themeMode');
        var primaryColor = document.getElementById('primaryColor');
        var colorHex = document.getElementById('colorHex');
        
        if (themeMode) themeMode.value = settings.theme || 'dark';
        if (primaryColor) primaryColor.value = settings.primaryColor || '#6C63FF';
        if (colorHex) colorHex.textContent = settings.primaryColor || '#6C63FF';
        
        // Temani qo'llash
        applyTheme(settings.theme || 'dark');
        applyPrimaryColor(settings.primaryColor || '#6C63FF');
    } catch(e) {
        console.log('Sozlamalarni yuklashda xatolik:', e);
    }
}

// ===== UMUMIY SOZLAMALARNI SAQLASH =====
function saveGeneralSettings() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        var shopName = document.getElementById('shopName');
        var shopOwner = document.getElementById('shopOwner');
        var shopPhone = document.getElementById('shopPhone');
        var shopAddress = document.getElementById('shopAddress');
        
        if (!DB.settings) DB.settings = {};
        
        if (shopName) DB.settings.shopName = shopName.value.trim();
        if (shopOwner) DB.settings.shopOwner = shopOwner.value.trim();
        if (shopPhone) DB.settings.shopPhone = shopPhone.value.trim();
        if (shopAddress) DB.settings.shopAddress = shopAddress.value.trim();
        
        saveDB();
        showNotification('✅ Umumiy sozlamalar saqlandi!', 'success');
    } catch(e) {
        console.log('Sozlamalarni saqlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== CHEK SOZLAMALARNI SAQLASH =====
function saveReceiptSettings() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        var receiptHeader = document.getElementById('receiptHeader');
        var receiptFooter = document.getElementById('receiptFooter');
        var receiptFont = document.getElementById('receiptFont');
        var receiptSize = document.getElementById('receiptSize');
        
        if (!DB.settings) DB.settings = {};
        
        if (receiptHeader) DB.settings.receiptHeader = receiptHeader.value.trim();
        if (receiptFooter) DB.settings.receiptFooter = receiptFooter.value.trim();
        if (receiptFont) DB.settings.receiptFont = receiptFont.value;
        if (receiptSize) DB.settings.receiptSize = receiptSize.value;
        
        saveDB();
        showNotification('✅ Chek sozlamalari saqlandi!', 'success');
    } catch(e) {
        console.log('Chek sozlamalarini saqlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== CHEKNI OLDINDAN KO'RISH =====
function previewReceipt() {
    try {
        var settings = (typeof DB !== 'undefined' && DB && DB.settings) ? DB.settings : {};
        var now = new Date();
        var dateStr = now.toLocaleDateString('uz-UZ');
        var timeStr = now.toLocaleTimeString('uz-UZ');
        
        var content = document.getElementById('receiptPreviewContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="receipt-title">${settings.shopName || 'Salimboy Sale'}</div>
            <div style="text-align:center;font-size:11px;color:#888;margin-bottom:8px;">
                ${settings.shopOwner || ''}<br>
                ${dateStr} ${timeStr}
            </div>
            <div class="receipt-items">
                <div class="receipt-item"><span>iPhone 15 Pro</span><span>12,000,000 so'm</span></div>
                <div class="receipt-item"><span>  x 2</span><span>24,000,000 so'm</span></div>
                <div class="receipt-item"><span>MacBook Air</span><span>18,000,000 so'm</span></div>
                <div class="receipt-item"><span>  x 1</span><span>18,000,000 so'm</span></div>
            </div>
            <div class="receipt-total">
                <span>JAMI</span>
                <span>42,000,000 so'm</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin:4px 0;">
                <span>To'lov turi</span>
                <span>Naxt</span>
            </div>
            <div class="receipt-footer">${settings.receiptFooter || 'Salimboy Sale dasturi'}</div>
        `;
        
        var modal = document.getElementById('receiptPreviewModal');
        if (modal) modal.classList.add('active');
    } catch(e) {
        console.log('Chekni oldindan ko\'rishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function closeReceiptPreview() {
    var modal = document.getElementById('receiptPreviewModal');
    if (modal) modal.classList.remove('active');
}

// ===== TEMANI O'ZGARTIRISH =====
function changeTheme() {
    try {
        var themeEl = document.getElementById('themeMode');
        if (!themeEl) return;
        var theme = themeEl.value;
        applyTheme(theme);
    } catch(e) {
        console.log('Tema o\'zgartirishda xatolik:', e);
    }
}

function applyTheme(theme) {
    try {
        var body = document.body;
        var mainContent = document.querySelector('.main-content');
        
        if (theme === 'dark') {
            if (body) body.style.background = '#0F0F1A';
            if (mainContent) mainContent.style.background = '#0F0F1A';
            document.documentElement.style.setProperty('--bg-dark', '#0F0F1A');
            document.documentElement.style.setProperty('--text-primary', '#FFFFFF');
            document.documentElement.style.setProperty('--text-secondary', '#A0A0B8');
        } else if (theme === 'light') {
            if (body) body.style.background = '#F0F2F5';
            if (mainContent) mainContent.style.background = '#F0F2F5';
            document.documentElement.style.setProperty('--bg-dark', '#F0F2F5');
            document.documentElement.style.setProperty('--text-primary', '#1A1A2E');
            document.documentElement.style.setProperty('--text-secondary', '#555');
        }
    } catch(e) {
        console.log('Temani qo\'llashda xatolik:', e);
    }
}

// ===== ASOSIY RANGNI O'ZGARTIRISH =====
function changePrimaryColor() {
    try {
        var colorEl = document.getElementById('primaryColor');
        var colorHexEl = document.getElementById('colorHex');
        if (!colorEl) return;
        
        var color = colorEl.value;
        if (colorHexEl) colorHexEl.textContent = color;
        applyPrimaryColor(color);
    } catch(e) {
        console.log('Rang o\'zgartirishda xatolik:', e);
    }
}

function applyPrimaryColor(color) {
    try {
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', darkenColor(color, 20));
        document.documentElement.style.setProperty('--primary-light', lightenColor(color, 20));
    } catch(e) {
        console.log('Rangni qo\'llashda xatolik:', e);
    }
}

function setColor(color) {
    try {
        var colorEl = document.getElementById('primaryColor');
        var colorHexEl = document.getElementById('colorHex');
        
        if (colorEl) colorEl.value = color;
        if (colorHexEl) colorHexEl.textContent = color;
        applyPrimaryColor(color);
    } catch(e) {
        console.log('Rangni o\'rnatishda xatolik:', e);
    }
}

// ===== RANG YORDAMCHI FUNKSIYALAR =====
function darkenColor(hex, percent) {
    try {
        var num = parseInt(hex.replace('#', ''), 16);
        var amt = Math.round(2.55 * percent);
        var R = Math.max((num >> 16) - amt, 0);
        var G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        var B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    } catch(e) {
        return hex;
    }
}

function lightenColor(hex, percent) {
    try {
        var num = parseInt(hex.replace('#', ''), 16);
        var amt = Math.round(2.55 * percent);
        var R = Math.min((num >> 16) + amt, 255);
        var G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        var B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    } catch(e) {
        return hex;
    }
}

// ===== TEMA SOZLAMALARNI SAQLASH =====
function saveThemeSettings() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        var themeEl = document.getElementById('themeMode');
        var colorEl = document.getElementById('primaryColor');
        
        if (!DB.settings) DB.settings = {};
        
        if (themeEl) DB.settings.theme = themeEl.value;
        if (colorEl) DB.settings.primaryColor = colorEl.value;
        
        saveDB();
        showNotification('✅ Tema sozlamalari saqlandi!', 'success');
    } catch(e) {
        console.log('Tema sozlamalarini saqlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== ZAXIRA YARATISH =====
function createBackup() {
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        var data = {
            db: DB,
            date: new Date().toISOString(),
            version: '1.0.0'
        };
        
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'salimboy_sale_backup_' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('lastBackup', new Date().toISOString());
        updateLastBackup();
        showNotification('✅ Zaxira yaratildi!', 'success');
    } catch(e) {
        console.log('Zaxira yaratishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== ZAXIRANI TIKLASH =====
function restoreBackup() {
    try {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var data = JSON.parse(event.target.result);
                    if (data.db) {
                        if (confirm('Ma\'lumotlarni tiklashga ishonchingiz komilmi? Joriy ma\'lumotlar o\'chiriladi!')) {
                            Object.assign(DB, data.db);
                            saveDB();
                            loadSettings();
                            showNotification('✅ Zaxira tiklandi!', 'success');
                            location.reload();
                        }
                    } else {
                        showNotification('❌ Noto\'g\'ri fayl formati!', 'error');
                    }
                } catch (err) {
                    console.log('Fayl o\'qishda xatolik:', err);
                    showNotification('❌ Fayl o\'qishda xatolik!', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    } catch(e) {
        console.log('Zaxirani tiklashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== BARCHA MA'LUMOTLARNI TOZALASH =====
function clearAllData() {
    try {
        if (confirm('⚠️ Barcha ma\'lumotlar o\'chiriladi! Ishonchingiz komilmi?')) {
            if (confirm('📦 Zaxira yaratmoqchimisiz?')) {
                createBackup();
            }
            localStorage.removeItem('salimboy_db');
            showNotification('🗑️ Barcha ma\'lumotlar tozalandi!', 'info');
            setTimeout(function() {
                location.reload();
            }, 1000);
        }
    } catch(e) {
        console.log('Ma\'lumotlarni tozalashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== OXIRGI ZAXIRA VAQTI =====
function updateLastBackup() {
    try {
        var lastBackup = localStorage.getItem('lastBackup');
        var el = document.getElementById('lastBackup');
        if (lastBackup && el) {
            var date = new Date(lastBackup);
            el.textContent = date.toLocaleDateString('uz-UZ') + ' ' + date.toLocaleTimeString('uz-UZ');
        } else if (el) {
            el.textContent = 'Zaxira mavjud emas';
        }
    } catch(e) {
        console.log('Zaxira vaqtini yangilashda xatolik:', e);
    }
}

// ===== QO'SHIMCHA FUNKSIYALAR =====
function saveDB() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salimboy_db', JSON.stringify(DB));
        }
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
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

console.log('✅ Settings.js to\'liq yuklandi!');