// ===== CASHIER.JS - KASSA LOGIKASI (TO'LIQ TUZATILGAN) =====

// ===== GLOBAL O'ZGARUVCHILAR =====
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
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long'
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

        console.log('✅ Cashier.js yuklandi!');
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

// ===== MAHSULOTLARNI KO'RSATISH (RASM BILAN - BASE64) =====
function renderProducts(filter) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        if (typeof DB === 'undefined' || !DB || !DB.products || DB.products.length === 0) {
            grid.innerHTML = '<div class="empty-products"><i class="fas fa-box-open"></i><p>Mahsulotlar mavjud emas</p></div>';
            return;
        }

        var filtered = DB.products;
        if (filter) {
            var search = filter.toLowerCase().trim();
            var temp = [];
            for (var i = 0; i < DB.products.length; i++) {
                var p = DB.products[i];
                if (p.name.toLowerCase().includes(search) || (p.barcode && p.barcode === search) || p.id.toString() === search) {
                    temp.push(p);
                }
            }
            filtered = temp;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-products"><i class="fas fa-box-open"></i><p>Mahsulot topilmadi</p></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var p = filtered[i];
            
            // RASMNI TEKSHIRISH - base64 yoki URL
            var imgSrc = p.image;
            if (!imgSrc) {
                imgSrc = 'https://picsum.photos/seed/default/200/200';
            }
            
            html += '<div class="product-item" onclick="addToCart(' + p.id + ')" title="' + p.name + '">';
            html += '<img src="' + imgSrc + '" alt="' + p.name + '" class="product-image" onerror="this.src=\'https://picsum.photos/seed/default/200/200\'" />';
            html += '<div class="product-name">' + p.name + '</div>';
            html += '<div class="product-price">' + formatPrice(p.salePrice) + '</div>';
            html += '<div class="product-stock">📦 ' + p.stock + ' dona</div>';
            if (p.unit) html += '<div class="product-unit">' + p.unit + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    } catch(e) {
        console.log('Mahsulotlar yuklanmadi:', e);
        grid.innerHTML = '<div class="empty-products"><i class="fas fa-box-open"></i><p>Xatolik yuz berdi</p></div>';
    }
}

// ===== QIDIRUV =====
function searchProducts() {
    var query = document.getElementById('productSearch').value;
    renderProducts(query);
}

// ===== SKAYNER SIMULATSIYASI =====
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
                unit: product.unit || 'dona',
                weight: null
            });
        }

        updateCart();
        showNotification('✅ ' + product.name + ' savatga qo\'shildi', 'success');
    } catch(e) {
        console.log('Savatga qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== OG'IRLIKNI TASDIQLASH =====
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

// ===== OG'IRLIK MODALNI YOPISH =====
function closeWeightModal() {
    var modal = document.getElementById('weightModal');
    if (modal) modal.classList.remove('active');
    currentWeightProduct = null;
}

// ===== SKIDKA MODAL =====
function openDiscountModal() {
    if (cart.length === 0) {
        showNotification('⚠️ Savat bo\'sh, skidka qo\'llab bo\'lmaydi!', 'warning');
        return;
    }
    var modal = document.getElementById('discountModal');
    if (modal) {
        modal.classList.add('active');
        var discountPercentInput = document.getElementById('discountPercent');
        var discountAmountInput = document.getElementById('discountAmount');
        if (discountPercentInput) discountPercentInput.value = '';
        if (discountAmountInput) discountAmountInput.value = '0';
        if (discountPercentInput) discountPercentInput.focus();
    }
}

function closeDiscountModal() {
    var modal = document.getElementById('discountModal');
    if (modal) modal.classList.remove('active');
}

// ===== SKIDKANI HISOBLASH =====
function calculateDiscount() {
    var percentInput = document.getElementById('discountPercent');
    var amountInput = document.getElementById('discountAmount');
    if (!percentInput || !amountInput) return 0;
    
    var percent = parseFloat(percentInput.value) || 0;
    var total = getCartTotal();
    var amount = (total * percent) / 100;
    amountInput.value = amount.toFixed(0);
    return amount;
}

// ===== SKIDKANI TASDIQLASH =====
function confirmDiscount() {
    var percentInput = document.getElementById('discountPercent');
    if (!percentInput) return;
    
    var percent = parseFloat(percentInput.value) || 0;
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

// ===== SAVATNI YANGILASH =====
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
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket"></i><p>Savat bo\'sh</p></div>';
        var totalItemsEl = document.getElementById('totalItems');
        var totalAmountEl = document.getElementById('totalAmount');
        var totalDiscountEl = document.getElementById('totalDiscount');
        if (totalItemsEl) totalItemsEl.textContent = '0';
        if (totalAmountEl) totalAmountEl.textContent = '0 so\'m';
        if (totalDiscountEl) totalDiscountEl.textContent = '0 so\'m';
        return;
    }

    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var total = item.price * item.quantity;
        var weightText = item.weight ? ' (' + item.weight.toFixed(3) + ' kg)' : '';
        var qtyDisplay = item.unit === 'kg' ? item.quantity.toFixed(3) : item.quantity;
        var imgSrc = item.image || 'https://picsum.photos/seed/default/40/40';
        
        html += '<div class="cart-item">';
        html += '<img src="' + imgSrc + '" alt="' + item.name + '" onerror="this.src=\'https://picsum.photos/seed/default/40/40\'" />';
        html += '<div class="item-info">';
        html += '<div class="item-name">' + item.name + weightText + '</div>';
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
    var totalItemsEl = document.getElementById('totalItems');
    var totalAmountEl = document.getElementById('totalAmount');
    var totalDiscountEl = document.getElementById('totalDiscount');
    
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (totalAmountEl) totalAmountEl.textContent = formatPrice(finalTotal);
    if (totalDiscountEl) totalDiscountEl.textContent = formatPrice(discountAmount);
}

// ===== SAVAT JAMINI OLISH =====
function getCartTotal() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
        sum += cart[i].price * cart[i].quantity;
    }
    return sum;
}

// ===== MIXDORNI O'ZGARTIRISH =====
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

// ===== SAVATDAN O'CHIRISH =====
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
    if (!shiftOpen) {
        showNotification('⚠️ Iltimos, avval smenani oching!', 'warning');
        return;
    }

    if (cart.length === 0) {
        showNotification('⚠️ Savat bo\'sh!', 'warning');
        return;
    }

    var total = getCartTotal() - discountAmount;

    if (selectedPayment === 'debt') {
        var debtorModal = document.getElementById('debtorModal');
        if (debtorModal) {
            var debtorAmount = document.getElementById('debtorAmount');
            if (debtorAmount) debtorAmount.value = total;
            debtorModal.classList.add('active');
        }
        return;
    }

    completeSale(total);
}

// ===== QARZDOR MA'LUMOTLARINI TASDIQLASH =====
function confirmDebtor() {
    var nameInput = document.getElementById('debtorName');
    var phoneInput = document.getElementById('debtorPhone');
    var addressInput = document.getElementById('debtorAddress');
    var amountInput = document.getElementById('debtorAmount');
    
    if (!nameInput || !phoneInput || !amountInput) return;
    
    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();
    var address = addressInput ? addressInput.value.trim() : '';
    var amount = parseFloat(amountInput.value) || 0;

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
    try {
        var saleData = {
            cashier: currentShift ? currentShift.cashier : 'Noma\'lum',
            items: [],
            total: total,
            paymentType: selectedPayment,
            discount: discountAmount,
            discountPercent: discountPercent,
            debtor: debtorData || null,
            shiftId: currentShift ? currentShift.id : null
        };

        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            saleData.items.push({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                weight: item.weight || null,
                unit: item.unit || 'dona'
            });
        }

        if (typeof DB !== 'undefined' && DB) {
            if (!DB.sales) DB.sales = [];
            
            var sale = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                cashier: saleData.cashier,
                items: saleData.items,
                total: saleData.total,
                paymentType: saleData.paymentType,
                debtor: saleData.debtor,
                date: new Date().toISOString(),
                status: 'completed'
            };
            DB.sales.push(sale);
            
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

            for (var i = 0; i < saleData.items.length; i++) {
                var item = saleData.items[i];
                for (var j = 0; j < DB.products.length; j++) {
                    if (DB.products[j].id === item.id) {
                        DB.products[j].stock -= item.quantity;
                        break;
                    }
                }
            }

            if (saleData.paymentType === 'debt' && saleData.debtor) {
                if (!DB.debtors) DB.debtors = [];
                DB.debtors.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: saleData.debtor.name,
                    phone: saleData.debtor.phone,
                    address: saleData.debtor.address || '-',
                    amount: saleData.total,
                    date: new Date().toISOString(),
                    status: 'pending'
                });
            }

            saveDB();
        }

        if (currentShift) {
            currentShift.totalSales += total;
            if (typeof DB !== 'undefined' && DB && DB.shifts) {
                for (var i = 0; i < DB.shifts.length; i++) {
                    if (DB.shifts[i].id === currentShift.id) {
                        DB.shifts[i].totalSales = currentShift.totalSales;
                        break;
                    }
                }
            }
        }

        cart = [];
        discountPercent = 0;
        discountAmount = 0;
        updateCart();
        renderProducts();

        var paymentText = selectedPayment === 'cash' ? 'Naxt' : 
                          selectedPayment === 'terminal' ? 'Terminal' : 'Nasiya';
        showNotification('✅ Sotuv amalga oshirildi! (' + paymentText + ') ' + formatPrice(total), 'success');

        printReceipt(saleData);
    } catch(e) {
        console.log('Savdoni yakunlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi: ' + e.message, 'error');
    }
}

// ===== CHEK CHIQARISH =====
function printReceipt(saleData) {
    try {
        if (!saleData) {
            if (typeof DB !== 'undefined' && DB && DB.sales && DB.sales.length > 0) {
                saleData = DB.sales[DB.sales.length - 1];
            } else {
                showNotification('⚠️ Chek uchun ma\'lumot yo\'q!', 'warning');
                return;
            }
        }

        var settings = (typeof DB !== 'undefined' && DB && DB.settings) ? DB.settings : {};
        var now = new Date();
        var dateStr = now.toLocaleDateString('uz-UZ');
        var timeStr = now.toLocaleTimeString('uz-UZ');

        var receiptHTML = '<div style="font-family: \'Courier New\', monospace; width: 300px; padding: 16px; margin: 0 auto; background: white;">';
        receiptHTML += '<div style="text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">';
        receiptHTML += '<h2 style="margin: 0; font-size: 18px;">' + (settings.shopName || 'Salimboy Sale') + '</h2>';
        receiptHTML += '<p style="margin: 2px 0; font-size: 12px; color: #666;">' + (settings.shopOwner || '') + '</p>';
        receiptHTML += '<p style="margin: 2px 0; font-size: 11px; color: #888;">' + dateStr + ' ' + timeStr + '</p>';
        receiptHTML += '</div>';
        receiptHTML += '<div style="margin: 8px 0;">';
        receiptHTML += '<table style="width: 100%; font-size: 12px; border-collapse: collapse;">';
        receiptHTML += '<thead><tr style="border-bottom: 1px solid #ddd;"><th style="text-align: left;">Mahsulot</th><th style="text-align: center;">Miq</th><th style="text-align: right;">Narx</th></tr></thead><tbody>';

        for (var i = 0; i < saleData.items.length; i++) {
            var item = saleData.items[i];
            var total = item.price * item.quantity;
            var unitText = item.unit === 'kg' ? 'kg' : 'dona';
            var qtyDisplay = item.unit === 'kg' ? item.quantity.toFixed(3) : item.quantity;
            receiptHTML += '<tr><td style="padding: 2px 0;">' + item.name + '</td>';
            receiptHTML += '<td style="padding: 2px 0; text-align: center;">' + qtyDisplay + ' ' + unitText + '</td>';
            receiptHTML += '<td style="padding: 2px 0; text-align: right;">' + formatPrice(total) + '</td></tr>';
        }

        receiptHTML += '</tbody></table></div>';
        receiptHTML += '<div style="border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px;">';
        if (saleData.discount > 0) {
            receiptHTML += '<div style="display: flex; justify-content: space-between; font-size: 12px;">';
            receiptHTML += '<span>Skidka (' + (saleData.discountPercent || 0) + '%)</span>';
            receiptHTML += '<span>- ' + formatPrice(saleData.discount) + '</span>';
            receiptHTML += '</div>';
        }
        receiptHTML += '<div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">';
        receiptHTML += '<span>JAMI</span>';
        receiptHTML += '<span>' + formatPrice(saleData.total) + '</span>';
        receiptHTML += '</div>';
        receiptHTML += '<div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 4px;">';
        receiptHTML += '<span>To\'lov turi</span>';
        receiptHTML += '<span>' + (saleData.paymentType === 'cash' ? 'Naxt' : saleData.paymentType === 'terminal' ? 'Terminal' : 'Nasiya') + '</span>';
        receiptHTML += '</div>';
        receiptHTML += '</div>';
        receiptHTML += '<div style="text-align: center; border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #888;">';
        receiptHTML += '<p>' + (settings.receiptFooter || 'Salimboy Sale dasturi') + '</p>';
        receiptHTML += '<p>#' + (saleData.id || '') + '</p>';
        receiptHTML += '</div></div>';

        var printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Chek - ' + (settings.shopName || 'Salimboy Sale') + '</title>');
            printWindow.document.write('<style>body { margin: 0; padding: 20px; background: #f0f0f0; display: flex; justify-content: center; }</style>');
            printWindow.document.write('</head><body>' + receiptHTML);
            printWindow.document.write('<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
        }
    } catch(e) {
        console.log('Chek chiqarishda xatolik:', e);
        showNotification('⚠️ Chek chiqarishda xatolik: ' + e.message, 'error');
    }
}

// ===== SMENA HOLATINI TEKSHIRISH =====
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

// ===== SMENA OCHISH/YOPISH =====
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

// ===== SMENA OCHISH =====
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

// ===== SMENA YOPISH =====
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

// ===== QO'SHIMCHA FUNKSIYALAR =====
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

// ===== GLOBAL NOTIFIKATSIYA =====
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

// ===== ENTER BILAN QIDIRUV =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var searchInput = document.getElementById('productSearch');
        if (searchInput && document.activeElement === searchInput) {
            var query = searchInput.value.trim();
            if (query) {
                try {
                    if (typeof DB !== 'undefined' && DB && DB.products) {
                        var product = null;
                        for (var i = 0; i < DB.products.length; i++) {
                            if (DB.products[i].barcode === query) {
                                product = DB.products[i];
                                break;
                            }
                        }
                        if (product) {
                            addToCart(product.id);
                            searchInput.value = '';
                        } else {
                            renderProducts(query);
                        }
                    }
                } catch(err) {
                    renderProducts(query);
                }
            }
        }
    }
});

console.log('✅ Cashier.js to\'liq yuklandi!');