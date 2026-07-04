// ===== SETTINGS.JS - SOZLAMALAR LOGIKASI =====

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
        
        loadSettings();
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
        
        if (shopName) shopName.value = settings.shopName || 'Salimboy Sale';
        if (shopOwner) shopOwner.value = settings.shopOwner || 'Salimboy';
        if (shopPhone) shopPhone.value = settings.shopPhone || '';
        if (shopAddress) shopAddress.value = settings.shopAddress || '';
        
        // Chek dizayni
        var receiptHeader = document.getElementById('receiptHeader');
        var receiptFooter = document.getElementById('receiptFooter');
        
        if (receiptHeader) receiptHeader.value = settings.receiptHeader || 'Salimboy Sale';
        if (receiptFooter) receiptFooter.value = settings.receiptFooter || 'Salimboy Sale dasturi tomonidan ishlab chiqarilgan';
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
        
        if (!DB.settings) DB.settings = {};
        
        if (receiptHeader) DB.settings.receiptHeader = receiptHeader.value.trim();
        if (receiptFooter) DB.settings.receiptFooter = receiptFooter.value.trim();
        
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

// ===== QO'SHIMCHA =====
function saveDB() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('💾 Ma\'lumotlar saqlandi!');
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

console.log('✅ Settings.js yuklandi!');