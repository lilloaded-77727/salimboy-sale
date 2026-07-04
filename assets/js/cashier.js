// ===== CASHIER.JS - KASSA LOGIKASI (TUZATILGAN) =====

var cart = [];
var selectedPayment = 'cash';
var shiftOpen = false;
var currentShift = null;
var currentWeightProduct = null;
var discountPercent = 0;
var discountAmount = 0;

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
        
        loadCashiers();
        renderProducts();
        checkShiftStatus();
        
        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }
        
        console.log('✅ Cashier.js yuklandi!');
        console.log('📦 Mahsulotlar soni:', DB ? DB.products.length : 0);
    } catch(e) {
        console.log('Cashier.js yuklashda xatolik:', e);
    }
});

// ===== KASSIRLARNI YUKLASH =====
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

function searchProducts() {
    var query = document.getElementById('productSearch').value;
    renderProducts(query);
}

function simulateScanner() {
    if (!shiftOpen) {
        showNotification('⚠️ Iltimos, avval smenani oching!', 'warning');
        return;
    }
    
    try {
        if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
            showNotification('⚠️ Mahsulotlar mavjud emas!', 'warning');
            return;
        }
        var randomIndex = Math.floor(Math.random() * DB.products.length);
        var product = DB.products[randomIndex];
        if (product) {
            addToCart(product.id);
            showNotification('📷 Skayner: ' + product.name + ' qo\'shildi', 'success');
        }
    } catch(e) {
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== SAVATGA QO'SHISH =====
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
        
        // Kilogramm bo'lsa
        if (product.unit === 'kg') {
            currentWeightProduct = product;
            var weightModal = document.getElementById('weightModal');
            if (weightModal) {
                weightModal.classList.add('active');
                var weightInput = document.getElementById('productWeight');
                if (weightInput) {
                    weightInput.value = '';
                    weightInput.focus();
                }
            }
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

// ===== OG'IRLIK =====
function confirmWeight() {
    var weightInput = document.getElementById('productWeight');
    if (!weightInput) return;
    
    var weight = parseFloat(weightInput.value);
    
    if (!weight || weight <= 0) {
        showNotification('⚠️ Iltimos, to\'g\'ri og\'irlik kiriting!', 'warning');
        return;
    }
    
    var product = currentWeightProduct;
    if (!product) return;
    
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            existing = cart[i];
            break;
        }
    }
    
    var imgSrc = product.image || 'https://picsum.photos/seed/default/40/40';
    
    if (existing) {
        existing.quantity += weight;
        existing.weight = (existing.weight || 0) + weight;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.salePrice,
            quantity: weight,
            image: imgSrc,
            unit: 'kg',
            weight: weight
        });
    }
    
    closeWeightModal();
    updateCart();
    showNotification('✅ ' + product.name + ' (' + weight + ' kg) savatga qo\'shildi', 'success');
    currentWeightProduct = null;
}

function closeWeightModal() {
    var modal = document.getElementById('weightModal');
    if (modal) modal.classList.remove('active');
    currentWeightProduct = null;
}

// ===== SKIDKA =====
function openDiscountModal() {
    if (cart.length === 0) {
        showNotification('⚠️ Savat bo\'sh, skidka qo\'llab bo\'lmaydi!', 'warning');
        return;
    }
    var modal = document.getElementById('discountModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('discountPercent').value = '';
        document.getElementById('discountAmount').value = '0';
        document.getElementById('discountPercent').focus();
    }
}

function closeDiscountModal() {
    var modal = document.getElementById('discountModal');
    if (modal) modal.classList.remove('active');
}

function calculateDiscount() {
    var percent = parseFloat(document.getElementById('discountPercent').value) || 0;
    var total = getCartTotal();
    var amount = (total * percent) / 100;
    document.getElementById('discountAmount').value = amount.toFixed(0);
    return amount;
}

function confirmDiscount() {
    var percent = parseFloat(document.getElementById('discountPercent').value) || 0;
    if (percent < 0 || percent > 100) {
        showNotification('⚠️ Skidka 0-100% orasida bo\'lishi kerak!', 'warning');
        return;
    }
    
    discountPercent = percent;
    discountAmount = (getCartTotal() * percent) / 100;
    
    closeDiscountModal();
    updateCart();
    showNotification('✅ ' + percent + '% skidka qo\'llandi!', 'success');
}

// ===== SAVATNI YANGILASH (TUZATILGAN) =====
function updateCart() {
    var container = document.getElementById('cartItems');
    var countEl = document.getElementById('cartCount');
    var totalItemsEl = document.getElementById('totalItems');
    var totalAmountEl = document.getElementById('totalAmount');
    
    if (!container) {
        console.log('⚠️ cartItems elementi topilmadi');
        return;
    }
    
    // Savatdagi mahsulotlar soni
    var totalItems = 0;
    for (var i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
    }
    
    // cartCount elementini tekshirish
    if (countEl) {
        countEl.textContent = totalItems;
    } else {
        console.log('⚠️ cartCount elementi topilmadi');
    }
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket" style="font-size:48px;display:block;margin-bottom:16px;color:var(--text-muted);"></i><p style="color:var(--text-muted);">Savat bo\'sh</p></div>';
        if (totalItemsEl) totalItemsEl.textContent = '0';
        if (totalAmountEl) totalAmountEl.textContent = '0 so\'m';
        return;
    }
    
    // Savat elementlarini ko'rsatish
    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var total = item.price * item.quantity;
        var imgSrc = item.image || 'https://picsum.photos/seed/default/40/40';
        var qtyDisplay = item.unit === 'kg' ? item.quantity.toFixed(3) : item.quantity;
        
        html += '<div class="cart-item">';
        html += '<img src="' + imgSrc + '" alt="' + item.name + '" onerror="this.src=\'https://picsum.photos/seed/default/40/40\'" />';
        html += '<div class="item-info">';
        html += '<div class="item-name">' + item.name + '</div>';
        html += '<div class="item-price">' + formatPrice(item.price) + '</div>';
        html += '</div>';
        html += '<div class="item-qty">';
        html += '<button onclick="changeQty(' + i + ', -1)">−</button>';
        html += '<span>' + qtyDisplay + '</span>';
        html += '<button onclick="changeQty(' + i + ', 1)">+</button>';
        html += '</div>';
        html += '<div class="item-total">' + formatPrice(total) + '</div>';
        html += '<button class="item-remove" onclick="removeFromCart(' + i + ')"><i class="fas fa-times"></i></button>';
        html += '</div>';
    }
    container.innerHTML = html;
    
    var total = getCartTotal();
    var finalTotal = total - discountAmount;
    
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (totalAmountEl) totalAmountEl.textContent = formatPrice(finalTotal);
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

// ===== TO'LOV TURINI TANLASH =====
function selectPayment(type) {
    selectedPayment = type;
    var btns = document.querySelectorAll('.payment-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    var activeBtn = document.querySelector('.payment-btn.' + type);
    if (activeBtn) activeBtn.classList.add('active');
}

// ===== TO'LOVNI AMALGA OSHIRISH =====
function processPayment() {
    console.log('🔧 processPayment() ishga tushdi');
    console.log('📦 Savatdagi mahsulotlar:', cart);
    
    if (!shiftOpen) {
        showNotification('⚠️ Iltimos, avval smenani oching!', 'warning');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('⚠️ Savat bo\'sh!', 'warning');
        return;
    }
    
    var total = getCartTotal() - discountAmount;
    console.log('💰 Jami summa:', total);
    
    // Nasiya bo'lsa
    if (selectedPayment === 'debt') {
        var debtorModal = document.getElementById('debtorModal');
        if (debtorModal) {
            document.getElementById('debtorAmount').value = total;
            debtorModal.classList.add('active');
        }
        return;
    }
    
    completeSale(total);
}

// ===== QARZDOR =====
function confirmDebtor() {
    var name = document.getElementById('debtorName').value.trim();
    var phone = document.getElementById('debtorPhone').value.trim();
    var address = document.getElementById('debtorAddress').value.trim();
    var amount = parseFloat(document.getElementById('debtorAmount').value) || 0;
    
    if (!name || !phone) {
        showNotification('⚠️ Qarzdor ismi va telefon raqami majburiy!', 'warning');
        return;
    }
    
    var debtorData = {
        name: name,
        phone: phone,
        address: address,
        amount: amount
    };
    
    completeSale(amount, debtorData);
    closeDebtorModal();
}

function closeDebtorModal() {
    var modal = document.getElementById('debtorModal');
    if (modal) modal.classList.remove('active');
}

// ===== SAVDONI YAKUNLASH =====
function completeSale(total, debtorData) {
    console.log('🔧 completeSale() ishga tushdi');
    console.log('💰 Total:', total);
    console.log('💳 Payment type:', selectedPayment);
    
    try {
        // 1. Savdo ma'lumotlarini tayyorlash
        var saleData = {
            cashier: currentShift ? currentShift.cashier : 'Noma\'lum',
            items: [],
            total: total,
            paymentType: selectedPayment,
            discount: discountAmount,
            discountPercent: discountPercent,
            debtor: debtorData || null,
            date: new Date().toISOString(),
            status: 'completed'
        };
        
        // 2. Savatdagi mahsulotlarni olish
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            saleData.items.push({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                unit: item.unit || 'dona'
            });
        }
        
        console.log('📦 Savdo ma\'lumotlari:', saleData);
        
        // 3. DB ga qo'shish
        if (typeof DB === 'undefined' || !DB) {
            console.error('❌ DB mavjud emas!');
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        // 3.1. Savdoni qo'shish
        if (!DB.sales) DB.sales = [];
        var sale = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            cashier: saleData.cashier,
            items: saleData.items,
            total: saleData.total,
            paymentType: saleData.paymentType,
            debtor: saleData.debtor,
            date: saleData.date,
            status: saleData.status,
            discount: saleData.discount,
            discountPercent: saleData.discountPercent
        };
        DB.sales.push(sale);
        console.log('✅ Savdo qo\'shildi, ID:', sale.id);
        
        // 3.2. Statistikani yangilash
        if (!DB.statistics) {
            DB.statistics = {
                daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
                monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
                yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
            };
        }
        
        DB.statistics.daily.total += saleData.total;
        if (saleData.paymentType === 'cash') {
            DB.statistics.daily.cash += saleData.total;
        } else if (saleData.paymentType === 'terminal') {
            DB.statistics.daily.terminal += saleData.total;
        } else if (saleData.paymentType === 'debt') {
            DB.statistics.daily.debt += saleData.total;
        }
        
        DB.statistics.monthly.total += saleData.total;
        DB.statistics.yearly.total += saleData.total;
        console.log('📊 Statistika yangilandi');
        
        // 3.3. Mahsulot zaxirasini kamaytirish
        for (var i = 0; i < saleData.items.length; i++) {
            var item = saleData.items[i];
            for (var j = 0; j < DB.products.length; j++) {
                if (DB.products[j].id === item.id) {
                    DB.products[j].stock -= item.quantity;
                    console.log('📦 Zaxira yangilandi:', DB.products[j].name, 'Qolgan:', DB.products[j].stock);
                    break;
                }
            }
        }
        
        // 3.4. Nasiya bo'lsa qarzdor qo'shish
        if (saleData.paymentType === 'debt' && saleData.debtor) {
            if (!DB.debtors) DB.debtors = [];
            DB.debtors.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: saleData.debtor.name,
                phone: saleData.debtor.phone,
                address: saleData.debtor.address || '-',
                amount: saleData.total,
                date: saleData.date,
                status: 'pending'
            });
            console.log('👤 Qarzdor qo\'shildi:', saleData.debtor.name);
        }
        
        // 3.5. Smena statistikasini yangilash
        if (currentShift) {
            currentShift.totalSales += total;
            if (DB.shifts) {
                for (var i = 0; i < DB.shifts.length; i++) {
                    if (DB.shifts[i].id === currentShift.id) {
                        DB.shifts[i].totalSales = currentShift.totalSales;
                        break;
                    }
                }
            }
        }
        
        // 4. Ma'lumotlarni saqlash
        saveDB();
        console.log('💾 Ma\'lumotlar saqlandi!');
        
        // 5. Savatni tozalash
        cart = [];
        discountPercent = 0;
        discountAmount = 0;
        updateCart();
        renderProducts();
        
        // 6. Natijani ko'rsatish
        var paymentText = selectedPayment === 'cash' ? 'Naxt' : 
                          selectedPayment === 'terminal' ? 'Terminal' : 'Nasiya';
        showNotification('✅ Sotuv amalga oshirildi! (' + paymentText + ') ' + formatPrice(total), 'success');
        
        // 7. Chekni chiqarish
        printReceipt(saleData);
        
    } catch(e) {
        console.error('❌ Savdoni yakunlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== CHEK =====
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

// ===== SMENA =====
function toggleShift() {
    if (shiftOpen) {
        closeShift();
    } else {
        var modal = document.getElementById('shiftModal');
        if (modal) modal.classList.add('active');
    }
}

function closeShiftModal() {
    var modal = document.getElementById('shiftModal');
    if (modal) modal.classList.remove('active');
}

function openShift() {
    var cashierSelect = document.getElementById('cashierSelect');
    var cashierCodeInput = document.getElementById('cashierCode');
    var startCashInput = document.getElementById('startCash');
    
    if (!cashierSelect || !cashierCodeInput || !startCashInput) return;
    
    var cashierName = cashierSelect.value;
    var cashierCode = cashierCodeInput.value;
    var startCash = parseFloat(startCashInput.value) || 500000;
    
    if (!cashierName) {
        showNotification('⚠️ Iltimos, kassirni tanlang!', 'warning');
        return;
    }
    if (!cashierCode || cashierCode.length !== 4) {
        showNotification('⚠️ Iltimos, 4 xonali kodni kiriting!', 'warning');
        return;
    }
    
    var found = false;
    try {
        if (typeof DB !== 'undefined' && DB && DB.cashiers) {
            for (var i = 0; i < DB.cashiers.length; i++) {
                if (DB.cashiers[i].name === cashierName && DB.cashiers[i].code === cashierCode) {
                    found = true;
                    break;
                }
            }
        }
    } catch(e) {
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
        return;
    }
    
    if (!found) {
        showNotification('❌ Kassir topilmadi yoki kod xato!', 'error');
        return;
    }
    
    var shift = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        cashier: cashierName,
        startTime: new Date().toISOString(),
        endTime: null,
        startCash: startCash,
        endCash: 0,
        totalSales: 0,
        status: 'open'
    };
    
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        if (!DB.shifts) DB.shifts = [];
        DB.shifts.push(shift);
        saveDB();
    } catch(e) {
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
        return;
    }
    
    shiftOpen = true;
    currentShift = shift;
    
    var statusEl = document.getElementById('shiftStatus');
    if (statusEl) {
        statusEl.innerHTML = '<span class="status-dot open"></span><span>Smena: Ochilgan (' + cashierName + ')</span>';
    }
    var btn = document.getElementById('shiftBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-stop"></i> Smenani yopish';
        btn.className = 'btn-shift open';
    }
    
    closeShiftModal();
    showNotification('✅ Smena ochildi! Kassir: ' + cashierName, 'success');
}

function closeShift() {
    if (!currentShift) return;
    
    if (cart.length > 0) {
        if (!confirm('Savatda mahsulotlar bor. Smenani yopishga ishonchingiz komilmi?')) {
            return;
        }
    }
    
    try {
        if (typeof DB !== 'undefined' && DB && DB.shifts) {
            for (var i = 0; i < DB.shifts.length; i++) {
                if (DB.shifts[i].id === currentShift.id) {
                    DB.shifts[i].endTime = new Date().toISOString();
                    DB.shifts[i].status = 'closed';
                    DB.shifts[i].endCash = DB.shifts[i].startCash + DB.shifts[i].totalSales;
                    break;
                }
            }
            saveDB();
        }
    } catch(e) {
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
        return;
    }
    
    shiftOpen = false;
    currentShift = null;
    
    var statusEl = document.getElementById('shiftStatus');
    if (statusEl) {
        statusEl.innerHTML = '<span class="status-dot closed"></span><span>Smena: Yopiq</span>';
    }
    var btn = document.getElementById('shiftBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-play"></i> Smena ochish';
        btn.className = 'btn-shift closed';
    }
    
    cart = [];
    discountPercent = 0;
    discountAmount = 0;
    updateCart();
    
    showNotification('✅ Smena yopildi!', 'success');
}

function checkShiftStatus() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.shifts) return;
        
        var openShift = null;
        for (var i = 0; i < DB.shifts.length; i++) {
            if (DB.shifts[i].status === 'open') {
                openShift = DB.shifts[i];
                break;
            }
        }
        
        if (openShift) {
            shiftOpen = true;
            currentShift = openShift;
            var statusEl = document.getElementById('shiftStatus');
            if (statusEl) {
                statusEl.innerHTML = '<span class="status-dot open"></span><span>Smena: Ochilgan (' + openShift.cashier + ')</span>';
            }
            var btn = document.getElementById('shiftBtn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-stop"></i> Smenani yopish';
                btn.className = 'btn-shift open';
            }
        }
    } catch(e) {
        console.log('Smena holati tekshirilmadi:', e);
    }
}

// ===== QO'SHIMCHA =====
function formatPrice(amount) {
    if (!amount) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function saveDB() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('salimboy_db', JSON.stringify(DB));
            console.log('💾 Ma\'lumotlar saqlandi!');
        }
    } catch(e) {
        console.log('Ma\'lumotlar saqlanmadi:', e);
    }
}

console.log('✅ Cashier.js yuklandi!');