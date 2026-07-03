// ===== WAREHOUSE.JS - OMBOR =====

function loadProducts() {
    var tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-box-open" style="font-size:48px;display:block;margin-bottom:16px;"></i>Mahsulotlar mavjud emas</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < DB.products.length; i++) {
        var p = DB.products[i];
        var profit = p.salePrice - p.purchasePrice;
        html += '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td><img src="' + (p.image || 'https://picsum.photos/seed/default/36/36') + '" style="width:36px;height:36px;object-fit:cover;border-radius:8px;"></td>' +
            '<td><strong>' + p.name + '</strong></td>' +
            '<td>' + (p.barcode || '-') + '</td>' +
            '<td>' + formatPrice(p.purchasePrice) + '</td>' +
            '<td>' + formatPrice(p.salePrice) + '</td>' +
            '<td style="color:' + (profit >= 0 ? 'var(--success)' : 'var(--danger)') + ';">' + formatPrice(profit) + '</td>' +
            '<td>' + p.stock + '</td>' +
            '<td>' + (p.unit || 'dona') + '</td>' +
            '<td><button onclick="editProduct(' + p.id + ')" style="padding:4px 12px;border:none;border-radius:6px;background:rgba(52,152,219,0.2);color:#3498DB;cursor:pointer;"><i class="fas fa-edit"></i></button> <button onclick="confirmDeleteProduct(' + p.id + ')" style="padding:4px 12px;border:none;border-radius:6px;background:rgba(231,76,60,0.2);color:#E74C3C;cursor:pointer;"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

console.log('✅ Warehouse.js yuklandi!');
