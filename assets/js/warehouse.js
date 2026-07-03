// ===== WAREHOUSE.JS - TO'LIQ OMBOR LOGIKASI (RASM BASE64) =====

var editingProductId = null;
var uploadedImageData = null; // Yuklangan rasmni saqlash uchun

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    try {
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

        loadProducts();
        loadWarehouseStats();

        var prodPurchase = document.getElementById('prodPurchase');
        var prodSale = document.getElementById('prodSale');
        if (prodPurchase) prodPurchase.addEventListener('input', calculateProfit);
        if (prodSale) prodSale.addEventListener('input', calculateProfit);

        var editProdPurchase = document.getElementById('editProdPurchase');
        var editProdSale = document.getElementById('editProdSale');
        if (editProdPurchase) editProdPurchase.addEventListener('input', calculateEditProfit);
        if (editProdSale) editProdSale.addEventListener('input', calculateEditProfit);

        var prodUnit = document.getElementById('prodUnit');
        if (prodUnit) {
            prodUnit.addEventListener('change', function() {
                var weightGroup = document.getElementById('weightGroup');
                if (weightGroup) {
                    if (this.value === 'kg') {
                        weightGroup.style.display = 'block';
                    } else {
                        weightGroup.style.display = 'none';
                    }
                }
            });
        }

        // ===== RASM YUKLASH (BASE64) =====
        var prodImage = document.getElementById('prodImage');
        if (prodImage) {
            prodImage.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    // Rasm hajmini tekshirish (1MB dan kichik bo'lishi kerak)
                    if (file.size > 1024 * 1024) {
                        showNotification('⚠️ Rasm hajmi 1MB dan kichik bo\'lishi kerak!', 'warning');
                        this.value = '';
                        return;
                    }
                    
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        uploadedImageData = event.target.result; // Base64 formatda saqlash
                        var preview = document.getElementById('imagePreview');
                        if (preview) {
                            preview.innerHTML = '<img src="' + uploadedImageData + '" alt="Rasm" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid #EAEAEA;padding:4px;object-fit:cover;" />';
                        }
                        console.log('✅ Rasm yuklandi, hajmi:', (uploadedImageData.length / 1024).toFixed(1) + 'KB');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Warehouse.js yuklandi!');
    } catch(e) {
        console.log('Warehouse.js yuklashda xatolik:', e);
    }
});

// ===== FOYDANI HISOBLASH =====
function calculateProfit() {
    try {
        var purchase = parseFloat(document.getElementById('prodPurchase').value) || 0;
        var sale = parseFloat(document.getElementById('prodSale').value) || 0;
        var profitEl = document.getElementById('prodProfit');
        if (profitEl) {
            if (purchase > 0 && sale > 0) {
                var profit = ((sale - purchase) / purchase * 100);
                profitEl.value = profit.toFixed(2) + '%';
            } else {
                profitEl.value = '';
            }
        }
    } catch(e) {
        console.log('Foyda hisoblashda xatolik:', e);
    }
}

function calculateEditProfit() {
    try {
        var purchase = parseFloat(document.getElementById('editProdPurchase').value) || 0;
        var sale = parseFloat(document.getElementById('editProdSale').value) || 0;
        var profitEl = document.getElementById('editProdProfit');
        if (profitEl) {
            if (purchase > 0 && sale > 0) {
                var profit = ((sale - purchase) / purchase * 100);
                profitEl.value = profit.toFixed(2) + '%';
            } else {
                profitEl.value = '';
            }
        }
    } catch(e) {
        console.log('Foyda hisoblashda xatolik:', e);
    }
}

// ===== MAHSULOTLARNI YUKLASH =====
function loadProducts(filter) {
    try {
        var tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:#999;"><i class="fas fa-box-open" style="font-size:24px;display:block;margin-bottom:8px;"></i>Mahsulotlar mavjud emas</td></tr>';
            var countEl = document.getElementById('productCount');
            if (countEl) countEl.textContent = '0 ta';
            updateWarehouseStats([]);
            return;
        }

        var products = DB.products.slice();
        
        if (filter) {
            var search = filter.toLowerCase().trim();
            var filtered = [];
            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                if (p.name.toLowerCase().includes(search) || 
                    (p.barcode && p.barcode.includes(search)) ||
                    (p.category && p.category.toLowerCase().includes(search))) {
                    filtered.push(p);
                }
            }
            products = filtered;
        }

        var unitFilter = document.getElementById('unitFilter');
        if (unitFilter && unitFilter.value) {
            var filtered = [];
            for (var i = 0; i < products.length; i++) {
                if (products[i].unit === unitFilter.value) {
                    filtered.push(products[i]);
                }
            }
            products = filtered;
        }

        updateWarehouseStats(products);

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:#999;"><i class="fas fa-box-open" style="font-size:24px;display:block;margin-bottom:8px;"></i>Mahsulot topilmadi</td></tr>';
            var countEl = document.getElementById('productCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var html = '';
        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            var profit = p.salePrice - p.purchasePrice;
            var profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            var profitPercent = p.purchasePrice > 0 ? ((profit / p.purchasePrice) * 100).toFixed(1) : '0';
            
            // RASMNI TEKSHIRISH - base64 yoki URL
            var imgSrc = p.image;
            if (!imgSrc) {
                imgSrc = 'https://picsum.photos/seed/default/36/36';
            }
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td><img src="' + imgSrc + '" alt="' + p.name + '" class="product-thumb" onerror="this.src=\'https://picsum.photos/seed/default/36/36\'" style="width:36px;height:36px;object-fit:cover;border-radius:6px;background:#EAEAEA;" /></td>' +
                '<td><strong>' + p.name + '</strong></td>' +
                '<td>' + (p.barcode || '-') + '</td>' +
                '<td>' + formatPrice(p.purchasePrice) + '</td>' +
                '<td>' + formatPrice(p.salePrice) + '</td>' +
                '<td class="' + profitClass + '">' + formatPrice(profit) + ' (' + profitPercent + '%)</td>' +
                '<td>' + p.stock + '</td>' +
                '<td>' + (p.unit || 'dona') + '</td>' +
                '<td><div class="action-btns">' +
                    '<button class="btn-edit" onclick="editProduct(' + p.id + ')" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(52,152,219,0.12);color:#3498DB;transition:all 0.3s;"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn-delete" onclick="confirmDeleteProduct(' + p.id + ')" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(231,76,60,0.12);color:#E74C3C;transition:all 0.3s;"><i class="fas fa-trash"></i></button>' +
                '</div></td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('productCount');
        if (countEl) countEl.textContent = products.length + ' ta';
    } catch(e) {
        console.log('Mahsulotlarni yuklashda xatolik:', e);
    }
}

// ===== OMBOR STATISTIKASI =====
function loadWarehouseStats() {
    try {
        var products = (typeof DB !== 'undefined' && DB && DB.products) ? DB.products : [];
        updateWarehouseStats(products);
    } catch(e) {
        console.log('Statistika yuklashda xatolik:', e);
    }
}

function updateWarehouseStats(products) {
    try {
        var totalProducts = products.length;
        var totalStock = 0;
        var totalPurchase = 0;
        var totalSale = 0;

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            totalStock += p.stock || 0;
            totalPurchase += (p.purchasePrice || 0) * (p.stock || 0);
            totalSale += (p.salePrice || 0) * (p.stock || 0);
        }
        var totalProfit = totalSale - totalPurchase;

        var el1 = document.getElementById('totalProducts');
        var el2 = document.getElementById('totalStock');
        var el3 = document.getElementById('totalPurchase');
        var el4 = document.getElementById('totalSale');
        var el5 = document.getElementById('totalProfit');

        if (el1) el1.textContent = totalProducts;
        if (el2) el2.textContent = totalStock;
        if (el3) el3.textContent = formatPrice(totalPurchase);
        if (el4) el4.textContent = formatPrice(totalSale);
        if (el5) el5.textContent = formatPrice(totalProfit);
    } catch(e) {
        console.log('Statistika yangilashda xatolik:', e);
    }
}

// ===== QIDIRUV =====
function searchWarehouse() {
    var query = document.getElementById('warehouseSearch').value;
    loadProducts(query);
}

// ===== MAHSULOT QO'SHISH MODAL =====
function openAddProductModal() {
    uploadedImageData = null; // Eski rasmni tozalash
    var modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
        var nameInput = document.getElementById('prodName');
        if (nameInput) nameInput.focus();
    }
}

function closeAddProductModal() {
    var modal = document.getElementById('addProductModal');
    if (modal) modal.classList.remove('active');
    
    var fields = ['prodName', 'prodBarcode', 'prodPurchase', 'prodSale', 'prodProfit', 'prodStock', 'prodWeight'];
    for (var i = 0; i < fields.length; i++) {
        var el = document.getElementById(fields[i]);
        if (el) el.value = '';
    }
    var unit = document.getElementById('prodUnit');
    if (unit) unit.value = 'dona';
    var image = document.getElementById('prodImage');
    if (image) image.value = '';
    var preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    var weightGroup = document.getElementById('weightGroup');
    if (weightGroup) weightGroup.style.display = 'none';
    uploadedImageData = null;
}

// ===== MAHSULOT QO'SHISH (BASE64 RASM BILAN) =====
function addProduct() {
    try {
        var name = document.getElementById('prodName').value.trim();
        var barcode = document.getElementById('prodBarcode').value.trim();
        var purchasePrice = parseFloat(document.getElementById('prodPurchase').value);
        var salePrice = parseFloat(document.getElementById('prodSale').value);
        var unit = document.getElementById('prodUnit').value;
        var stock = parseFloat(document.getElementById('prodStock').value);
        var weight = parseFloat(document.getElementById('prodWeight').value) || null;

        if (!name || !purchasePrice || !salePrice || !stock) {
            showNotification('⚠️ Barcha majburiy maydonlarni to\'ldiring!', 'warning');
            return;
        }

        if (purchasePrice <= 0 || salePrice <= 0 || stock <= 0) {
            showNotification('⚠️ Narx va son 0 dan katta bo\'lishi kerak!', 'warning');
            return;
        }

        // ===== RASMNI OLISH (YUKLANGAN BASE64 YOKI DEFAULT) =====
        var imageData = uploadedImageData;
        if (!imageData) {
            // Rasm yuklanmagan bo'lsa default rasm
            imageData = 'https://picsum.photos/seed/' + Date.now() + '/300/300';
        }
        
        var code = null;
        if (unit === 'kg') {
            var kgProducts = [];
            if (typeof DB !== 'undefined' && DB && DB.products) {
                for (var i = 0; i < DB.products.length; i++) {
                    if (DB.products[i].unit === 'kg') {
                        kgProducts.push(DB.products[i]);
                    }
                }
            }
            code = kgProducts.length + 1;
        }

        var newProduct = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: name,
            barcode: barcode || 'SB-' + Date.now(),
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            profit: salePrice - purchasePrice,
            stock: stock,
            unit: unit,
            image: imageData, // Base64 yoki URL
            weight: weight,
            code: code,
            category: 'Umumiy',
            createdAt: new Date().toISOString()
        };

        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        if (!DB.products) DB.products = [];
        DB.products.push(newProduct);
        saveDB();
        
        uploadedImageData = null; // Tozalash
        closeAddProductModal();
        loadProducts();
        showNotification('✅ "' + name + '" mahsuloti qo\'shildi!', 'success');
    } catch(e) {
        console.log('Mahsulot qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== MAHSULOT TAXRIRLASH =====
function editProduct(id) {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.products) {
            showNotification('⚠️ Mahsulotlar mavjud emas!', 'error');
            return;
        }
        
        var product = null;
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].id === id) {
                product = DB.products[i];
                break;
            }
        }
        
        if (!product) {
            showNotification('⚠️ Mahsulot topilmadi!', 'error');
            return;
        }

        editingProductId = id;
        var idEl = document.getElementById('editProdId');
        var nameEl = document.getElementById('editProdName');
        var barcodeEl = document.getElementById('editProdBarcode');
        var purchaseEl = document.getElementById('editProdPurchase');
        var saleEl = document.getElementById('editProdSale');
        var unitEl = document.getElementById('editProdUnit');
        var stockEl = document.getElementById('editProdStock');
        
        if (idEl) idEl.value = id;
        if (nameEl) nameEl.value = product.name;
        if (barcodeEl) barcodeEl.value = product.barcode || '';
        if (purchaseEl) purchaseEl.value = product.purchasePrice;
        if (saleEl) saleEl.value = product.salePrice;
        if (unitEl) unitEl.value = product.unit || 'dona';
        if (stockEl) stockEl.value = product.stock;
        calculateEditProfit();

        var modal = document.getElementById('editProductModal');
        if (modal) modal.classList.add('active');
    } catch(e) {
        console.log('Mahsulot tahrirlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function closeEditProductModal() {
    var modal = document.getElementById('editProductModal');
    if (modal) modal.classList.remove('active');
    editingProductId = null;
}

// ===== MAHSULOT YANGILASH =====
function updateProduct() {
    try {
        var idEl = document.getElementById('editProdId');
        var nameEl = document.getElementById('editProdName');
        var barcodeEl = document.getElementById('editProdBarcode');
        var purchaseEl = document.getElementById('editProdPurchase');
        var saleEl = document.getElementById('editProdSale');
        var unitEl = document.getElementById('editProdUnit');
        var stockEl = document.getElementById('editProdStock');
        
        if (!idEl || !nameEl || !purchaseEl || !saleEl || !unitEl || !stockEl) return;
        
        var id = parseInt(idEl.value);
        var name = nameEl.value.trim();
        var barcode = barcodeEl.value.trim();
        var purchasePrice = parseFloat(purchaseEl.value);
        var salePrice = parseFloat(saleEl.value);
        var unit = unitEl.value;
        var stock = parseFloat(stockEl.value);

        if (!name || !purchasePrice || !salePrice || !stock) {
            showNotification('⚠️ Barcha maydonlarni to\'ldiring!', 'warning');
            return;
        }

        if (typeof DB === 'undefined' || !DB || !DB.products) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }

        var index = -1;
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].id === id) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            showNotification('⚠️ Mahsulot topilmadi!', 'error');
            return;
        }

        DB.products[index].name = name;
        DB.products[index].barcode = barcode || DB.products[index].barcode;
        DB.products[index].purchasePrice = purchasePrice;
        DB.products[index].salePrice = salePrice;
        DB.products[index].profit = salePrice - purchasePrice;
        DB.products[index].unit = unit;
        DB.products[index].stock = stock;

        saveDB();
        closeEditProductModal();
        loadProducts();
        showNotification('✅ "' + name + '" yangilandi!', 'success');
    } catch(e) {
        console.log('Mahsulot yangilashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== MAHSULOT O'CHIRISH =====
function confirmDeleteProduct(id) {
    try {
        if (id === undefined || id === null) {
            showNotification('⚠️ Mahsulot ID si topilmadi!', 'error');
            return;
        }
        
        if (typeof DB === 'undefined' || !DB || !DB.products) {
            showNotification('⚠️ Mahsulotlar mavjud emas!', 'error');
            return;
        }
        
        var product = null;
        var productIndex = -1;
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].id === id) {
                product = DB.products[i];
                productIndex = i;
                break;
            }
        }
        
        if (!product) {
            showNotification('⚠️ Mahsulot topilmadi! (ID: ' + id + ')', 'error');
            return;
        }

        if (confirm('"' + product.name + '" mahsulotini o\'chirishga ishonchingiz komilmi?')) {
            DB.products.splice(productIndex, 1);
            saveDB();
            loadProducts();
            loadWarehouseStats();
            showNotification('🗑️ "' + product.name + '" o\'chirildi!', 'info');
        }
    } catch(e) {
        console.log('Mahsulot o\'chirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

function deleteProduct() {
    try {
        var idEl = document.getElementById('editProdId');
        if (!idEl) {
            showNotification('⚠️ Mahsulot ID si topilmadi!', 'error');
            return;
        }
        var id = parseInt(idEl.value);
        confirmDeleteProduct(id);
        closeEditProductModal();
    } catch(e) {
        console.log('Mahsulot o\'chirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== QO'SHIMCHA FUNKSIYALAR =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salimboy_db', JSON.stringify(DB));
            console.log('✅ Ma\'lumotlar saqlandi!');
        }
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

function showNotification(message, type) {
    type = type || 'info';
    
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
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 4000);
}

console.log('✅ Warehouse.js to\'liq yuklandi!');