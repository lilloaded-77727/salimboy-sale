// ===== CASHIER.JS - KASSA LOGIKASI =====

var cart = [];
var selectedPayment = 'cash';
var shiftOpen = false;
var currentShift = null;
var discountPercent = 0;
var discountAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    try {
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            var now = new Date();
            dateEl.textContent = now.toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
        }

        loadCashiers();
        renderProducts();
        checkShiftStatus();

        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                sidebar.classList.toggle('open');
            });
        }
    } catch(e) {
        console.log('Cashier yuklashda xatolik:', e);
    }
});

function loadCashiers() {
    var select = document.getElementById('cashierSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Kassir tanlang --</option>';
    
    try {
        if (typeof DB !== 'undefined' && DB && DB.cashiers) {
            for (var i = 0; i < DB.cashiers.length; i++) {
                var c = DB.cashiers[i];
                var option = document.createElement('option');
                option.value = c.name;
                option.textContent = c.name;
                select.appendChild(option);
            }
        }
    } catch(e) {
        console.log('Kassirlar yuklanmadi:', e);
    }
}

// ===== MAHSULOTLARNI KO'RSATISH =====
function renderProducts(filter) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
            grid.innerHTML = '<div class="empty-products"><i class="fas fa-box-open" style="font-size:48px;display:block;margin-bottom:16px;color:var(--text-muted);"></i><p style="color:var(--text-muted);">Mahsulotlar mavjud emas</p></div>';
            return;
        }

        var filtered = DB.products;
        if (filter) {
            var search = filter.toLowerCase().trim();
            var temp = [];
            for (var i = 0; i < DB.products.length; i++) {
                var p = DB.products[i];
                if (p.name.toLowerCase().includes(search) || 
                    (p.barcode && p.barcode === search) || 
                    p.id.toString() === search) {
                    temp.push(p);
                }
            }
            filtered = temp;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-products"><i class="fas fa-search" style="font-size:48px;display:block;margin-bottom:16px;color:var(--text-muted);"></i><p style="color:var(--text-muted);">Mahsulot topilmadi</p></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var p = filtered[i];
            var imgSrc = p.image || 'https://picsum.photos/seed/default/200/200';
            
            html += '<div class="product-item" onclick="addToCart(' + p.id + ')" title="' + p.name + '">';
            html += '<img src="' + imgSrc + '" alt="' + p.name + '" class="product-image" onerror="this.src=\'https://picsum.photos/seed/default/200/200\'" />';
            html += '<div class="product-name">' + p.name + '</div>';
            html += '<div class="product-price">' + formatPrice(p.salePrice) + '</div>';
            html += '<div style="font-size:11px;color:var(--text-muted);">📦 ' + p.stock + ' dona</div>';
            if (p.unit) html += '<div style="font-size:10px;color:var(--text-muted);background:rgba(255,255,255,0.05);padding:2px 10px;border-radius:20px;display:inline-block;margin-top:4px;">' + p.unit + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    } catch(e) {
        console.log('Mahsulotlar yuklanmadi:', e);
        grid.innerHTML = '<div class="empty-products"><i class="fas fa-exclamation-triangle" style="font-size:48px;display:block;margin-bottom:16px;color:var(--danger);"></i><p style="color:var(--text-muted);">Xatolik yuz berdi</p></div>';
    }
}

function addToCart(productId) {
    if (!shiftOpen) {
        showNotification('⚠️ Iltimos, avval smenani oching!', 'warning');
        return;
    }

    try {
        if (typeof DB === 'undefined' || !DB || !DB.products) {
            showNotification('⚠️ Mahsulotlar yuklanmadi!', 'error');
            return;
        }

        var product = null;
        for (var i = 0; i < DB.products.length; i++) {
            if (DB.products[i].id === productId) {
                product = DB.products[i];
                break;
            }
        }
        
        if (!product) {
            showNotification('⚠️ Mahsulot topilmadi!', 'error');
            return;
        }

        if (product.stock <= 0) {
            showNotification('⚠️ Mahsulot zaxirada yo\'q!', 'error');
            return;
        }

        var existing = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === productId) {
                existing = cart[i];
                break;
            }
        }
        
        var imgSrc = product.image || 'https://picsum.photos/seed/default/40/40';
        
        if (existing) {
            if (existing.quantity >= product.stock) {
                showNotification('⚠️ Zaxirada yetarli mahsulot yo\'q!', 'warning');
                return;
            }
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.salePrice,
                quantity: 1,
                image: imgSrc,
                unit: product.unit || 'dona'
            });
        }

        updateCart();
        showNotification('✅ ' + product.name + ' savatga qo\'shildi', 'success');
    } catch(e) {
        console.log('Savatga qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function updateCart() {
    var container = document.getElementById('cartItems');
    var countEl = document.getElementById('cartCount');
    if (!container) return;
    
    var totalItems = 0;
    for (var i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
    }
    if (countEl) countEl.textContent = totalItems;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket" style="font-size:48px;display:block;margin-bottom:16px;color:var(--text-muted);"></i><p style="color:var(--text-muted);">Savat bo\'sh</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var total = item.price * item.quantity;
        var imgSrc = item.image || 'https://picsum.photos/seed/default/40/40';
        
        html += '<div class="cart-item">';
        html += '<img src="' + imgSrc + '" alt="' + item.name + '" onerror="this.src=\'https://picsum.photos/seed/default/40/40\'" />';
        html += '<div style="flex:1;">';
        html += '<div style="font-weight:600;">' + item.name + '</div>';
        html += '<div style="font-size:12px;color:var(--text-muted);">' + formatPrice(item.price) + '</div>';
        html += '</div>';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<button onclick="changeQty(' + i + ', -1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:transparent;color:var(--text-primary);cursor:pointer;">−</button>';
        html += '<span style="min-width:20px;text-align:center;">' + item.quantity + '</span>';
        html += '<button onclick="changeQty(' + i + ', 1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:transparent;color:var(--text-primary);cursor:pointer;">+</button>';
        html += '</div>';
        html += '<div style="font-weight:700;color:var(--primary);min-width:80px;text-align:right;">' + formatPrice(total) + '</div>';
        html += '<button onclick="removeFromCart(' + i + ')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;"><i class="fas fa-times"></i></button>';
        html += '</div>';
    }
    container.innerHTML = html;

    var total = getCartTotal();
    var finalTotal = total - discountAmount;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalAmount').textContent = formatPrice(finalTotal);
    document.getElementById('totalDiscount').textContent = formatPrice(discountAmount);
}

function getCartTotal() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
        sum += cart[i].price * cart[i].quantity;
    }
    return sum;
}

function changeQty(index, delta) {
    if (index < 0 || index >= cart.length) return;
    var item = cart[index];
    if (!item) return;
    var newQty = item.quantity + delta;
    if (newQty <= 0) {
        cart.splice(index, 1);
    } else {
        item.quantity = newQty;
    }
    updateCart();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    updateCart();
    showNotification('🗑️ Mahsulot savatdan olib tashlandi', 'info');
}

function selectPayment(type) {
    selectedPayment = type;
    var btns = document.querySelectorAll('.payment-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    var activeBtn = document.querySelector('.payment-btn.' + type);
    if (activeBtn) activeBtn.classList.add('active');
}

function processPayment() {
    if (!shiftOpen) {
        showNotification('⚠️ Iltimos, avval smenani oching!', 'warning');
        return;
    }
    if (cart.length === 0) {
        showNotification('⚠️ Savat bo\'sh!', 'warning');
        return;
    }
    var total = getCartTotal() - discountAmount;
    completeSale(total);
}

function completeSale(total) {
    try {
        var saleData = {
            cashier: currentShift ? currentShift.cashier : 'Noma\'lum',
            items: cart,
            total: total,
            paymentType: selectedPayment,
            discount: discountAmount,
            discountPercent: discountPercent
        };

        if (typeof DB !== 'undefined' && DB) {
            if (!DB.sales) DB.sales = [];
            DB.sales.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                cashier: saleData.cashier,
                items: saleData.items,
                total: saleData.total,
                paymentType: saleData.paymentType,
                date: new Date().toISOString(),
                status: 'completed'
            });
            
            if (currentShift) {
                currentShift.totalSales += total;
            }
            
            for (var i = 0; i < cart.length; i++) {
                var item = cart[i];
                for (var j = 0; j < DB.products.length; j++) {
                    if (DB.products[j].id === item.id) {
                        DB.products[j].stock -= item.quantity;
                        break;
                    }
                }
            }
            
            saveDB();
        }

        cart = [];
        discountPercent = 0;
        discountAmount = 0;
        updateCart();
        renderProducts();

        var paymentText = selectedPayment === 'cash' ? 'Naxt' : selectedPayment === 'terminal' ? 'Terminal' : 'Nasiya';
        showNotification('✅ Sotuv amalga oshirildi! (' + paymentText + ') ' + formatPrice(total), 'success');
        printReceipt(saleData);
    } catch(e) {
        console.log('Savdoni yakunlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function printReceipt(saleData) {
    try {
        var settings = (typeof DB !== 'undefined' && DB && DB.settings) ? DB.settings : {};
        var now = new Date();
        var receiptHTML = '<div style="font-family:monospace;width:300px;padding:16px;background:white;color:black;">';
        receiptHTML += '<div style="text-align:center;border-bottom:1px dashed #ccc;padding-bottom:8px;">';
        receiptHTML += '<h2 style="margin:0;">' + (settings.shopName || 'Salimboy Sale') + '</h2>';
        receiptHTML += '<p style="margin:2px 0;font-size:12px;color:#666;">' + now.toLocaleDateString('uz-UZ') + ' ' + now.toLocaleTimeString('uz-UZ') + '</p>';
        receiptHTML += '</div>';
        receiptHTML += '<div style="margin:8px 0;">';
        for (var i = 0; i < saleData.items.length; i++) {
            var item = saleData.items[i];
            var total = item.price * item.quantity;
            receiptHTML += '<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;">';
            receiptHTML += '<span>' + item.name + ' x' + item.quantity + '</span>';
            receiptHTML += '<span>' + formatPrice(total) + '</span>';
            receiptHTML += '</div>';
        }
        receiptHTML += '</div>';
        receiptHTML += '<div style="border-top:1px dashed #ccc;padding-top:8px;display:flex;justify-content:space-between;font-weight:bold;font-size:16px;">';
        receiptHTML += '<span>JAMI</span>';
        receiptHTML += '<span>' + formatPrice(saleData.total) + '</span>';
        receiptHTML += '</div>';
        receiptHTML += '<div style="text-align:center;border-top:1px dashed #ccc;padding-top:8px;margin-top:8px;font-size:11px;color:#888;">';
        receiptHTML += '<p>' + (settings.receiptFooter || 'Salimboy Sale dasturi') + '</p>';
        receiptHTML += '</div></div>';

        var printWindow = window.open('', '_blank', 'width=400,height=500');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Chek</title></head><body>' + receiptHTML + '<script>window.print();<\/script></body></html>');
            printWindow.document.close();
        }
    } catch(e) {
        console.log('Chek chiqarishda xatolik:', e);
    }
}

function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salimboy_db', JSON.stringify(DB));
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
    alert(message);
}

console.log('✅ Cashier.js yangilandi!');
