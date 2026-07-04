// ===== WAREHOUSE.JS - OMBOR LOGIKASI =====

var editingProductId = null;
var uploadedImageData = null;

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
        
        loadProducts();
        loadWarehouseStats();
        
        // Foyda hisoblash
        var prodPurchase = document.getElementById('prodPurchase');
        var prodSale = document.getElementById('prodSale');
        if (prodPurchase) {
            prodPurchase.addEventListener('input', calculateProfit);
        }
        if (prodSale) {
            prodSale.addEventListener('input', calculateProfit);
        }
        
        // Birlik o'zgarishi
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
        
        // Rasm yuklash preview
        var prodImage = document.getElementById('prodImage');
        if (prodImage) {
            prodImage.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        uploadedImageData = event.target.result;
                        var preview = document.getElementById('imagePreview');
                        if (preview) {
                            preview.innerHTML = '<img src="' + uploadedImageData + '" alt="Rasm" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid var(--border-color);padding:4px;object-fit:cover;" />';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }
        
        console.log('✅ Warehouse.js yuklandi!');
        console.log('📦 Mahsulotlar soni:', DB ? DB.products.length : 0);
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

// ===== MAHSULOTLARNI YUKLASH =====
function loadProducts(filter) {
    try {
        var tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-box-open" style="font-size:48px;display:block;margin-bottom:12px;opacity:0.5;"></i>Mahsulotlar mavjud emas</td></tr>';
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
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-search" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.5;"></i>Mahsulot topilmadi</td></tr>';
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
            var imgSrc = p.image || 'https://picsum.photos/seed/default/40/40';
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td><img src="' + imgSrc + '" alt="' + p.name + '" class="product-thumb" onerror="this.src=\'https://picsum.photos/seed/default/40/40\'" /></td>' +
                '<td><strong>' + p.name + '</strong></td>' +
                '<td>' + (p.barcode || '-') + '</td>' +
                '<td>' + formatPrice(p.purchasePrice) + '</td>' +
                '<td>' + formatPrice(p.salePrice) + '</td>' +
                '<td class="' + profitClass + '">' + formatPrice(profit) + ' (' + profitPercent + '%)</td>' +
                '<td>' + p.stock + '</td>' +
                '<td>' + (p.unit || 'dona') + '</td>' +
                '<td><div class="action-btns">' +
                    '<button class="btn-edit-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn-delete-sm" onclick="confirmDeleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
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
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalStock').textContent = totalStock;
        document.getElementById('totalPurchase').textContent = formatPrice(totalPurchase);
        document.getElementById('totalSale').textContent = formatPrice(totalSale);
        document.getElementById('totalProfit').textContent = formatPrice(totalProfit);
    } catch(e) {
        console.log('Statistika yangilashda xatolik:', e);
    }
}

// ===== QIDIRUV =====
function searchWarehouse() {
    var query = document.getElementById('warehouseSearch').value;
    loadProducts(query);
}

// ===== MAHSULOT QO'SHISH =====
function openAddProductModal() {
    uploadedImageData = null;
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

function addProduct() {
    try {
        var name = document.getElementById('prodName').value.trim();
        var barcode = document.getElementById('prodBarcode').value.trim();
        var purchasePrice = parseFloat(document.getElementById('prodPurchase').value);
        var salePrice = parseFloat(document.getElementById('prodSale').value);
        var unit = document.getElementById('prodUnit').value;
        var stock = parseFloat(document.getElementById('prodStock').value);
        var weight = parseFloat(document.getElementById('prodWeight').value) || null;
        
        if (!name) {
            showNotification('⚠️ Mahsulot nomini kiriting!', 'warning');
            return;
        }
        if (!purchasePrice || purchasePrice <= 0) {
            showNotification('⚠️ Kelish narxini kiriting!', 'warning');
            return;
        }
        if (!salePrice || salePrice <= 0) {
            showNotification('⚠️ Sotish narxini kiriting!', 'warning');
            return;
        }
        if (!stock || stock <= 0) {
            showNotification('⚠️ Soni kiriting!', 'warning');
            return;
        }
        
        var imageData = uploadedImageData;
        if (!imageData) {
            imageData = 'https://picsum.photos/seed/' + Date.now() + '/200/200';
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
            image: imageData,
            weight: weight,
            category: 'Umumiy',
            createdAt: new Date().toISOString()
        };
        
        if (typeof DB !== 'undefined' && DB) {
            if (!DB.products) DB.products = [];
            DB.products.push(newProduct);
            saveDB();
        }
        
        uploadedImageData = null;
        closeAddProductModal();
        loadProducts();
        loadWarehouseStats();
        showNotification('✅ "' + name + '" mahsuloti qo\'shildi!', 'success');
    } catch(e) {
        console.log('Mahsulot qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
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
        document.getElementById('editProdId').value = id;
        document.getElementById('editProdName').value = product.name;
        document.getElementById('editProdBarcode').value = product.barcode || '';
        document.getElementById('editProdPurchase').value = product.purchasePrice;
        document.getElementById('editProdSale').value = product.salePrice;
        document.getElementById('editProdUnit').value = product.unit || 'dona';
        document.getElementById('editProdStock').value = product.stock;
        
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

function updateProduct() {
    try {
        var id = parseInt(document.getElementById('editProdId').value);
        var name = document.getElementById('editProdName').value.trim();
        var barcode = document.getElementById('editProdBarcode').value.trim();
        var purchasePrice = parseFloat(document.getElementById('editProdPurchase').value);
        var salePrice = parseFloat(document.getElementById('editProdSale').value);
        var unit = document.getElementById('editProdUnit').value;
        var stock = parseFloat(document.getElementById('editProdStock').value);
        
        if (!name || !purchasePrice || !salePrice || !stock) {
            showNotification('⚠️ Barcha maydonlarni to\'ldiring!', 'warning');
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
        loadWarehouseStats();
        showNotification('✅ "' + name + '" yangilandi!', 'success');
    } catch(e) {
        console.log('Mahsulot yangilashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== MAHSULOT O'CHIRISH =====
function confirmDeleteProduct(id) {
    try {
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
            showNotification('⚠️ Mahsulot topilmadi!', 'error');
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

function deleteProductFromModal() {
    var id = parseInt(document.getElementById('editProdId').value);
    confirmDeleteProduct(id);
    closeEditProductModal();
}

// ===== QO'SHIMCHA FUNKSIYALAR =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('💾 Ma\'lumotlar saqlandi!');
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

console.log('✅ Warehouse.js yuklandi!');