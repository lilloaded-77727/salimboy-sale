// ===== DATABASE.JS - SUPABASE AVTOMAT SAQLASH =====

var DB = {
    products: [],
    sales: [],
    debtors: [],
    expenses: [],
    employees: [],
    shifts: [],
    cashiers: [],
    settings: {},
    statistics: {
        daily: { cash: 0, terminal: 0, debt: 0, total: 0 },
        monthly: { cash: 0, terminal: 0, debt: 0, total: 0 },
        yearly: { cash: 0, terminal: 0, debt: 0, total: 0 }
    }
};

// ===== SUPABASE GA AVTOMAT SAQLASH =====
function saveToSupabase(table, data) {
    return new Promise(function(resolve, reject) {
        if (typeof SupabaseAPI === 'undefined' || !SupabaseAPI) {
            saveToLocalStorage();
            resolve();
            return;
        }
        
        SupabaseAPI.loadSupabase().then(function() {
            var method = null;
            var tableName = table.charAt(0).toUpperCase() + table.slice(1);
            
            // Metodni aniqlash
            if (table === 'Product') method = SupabaseAPI.addProduct;
            else if (table === 'Sale') method = SupabaseAPI.addSale;
            else if (table === 'Debtor') method = SupabaseAPI.addDebtor;
            else if (table === 'Expense') method = SupabaseAPI.addExpense;
            else if (table === 'Employee') method = SupabaseAPI.addEmployee;
            else if (table === 'Shift') method = SupabaseAPI.openShift;
            
            if (method) {
                method(data).then(function(result) {
                    if (result && result.error) {
                        console.log('⚠️ Supabase xatolik:', result.error.message);
                        saveToLocalStorage();
                    } else {
                        console.log('✅ Supabase ga saqlandi:', table, data.name || data.id);
                    }
                    resolve();
                }).catch(function(e) {
                    console.log('⚠️ Supabase xatolik:', e);
                    saveToLocalStorage();
                    resolve();
                });
            } else {
                saveToLocalStorage();
                resolve();
            }
        }).catch(function() {
            saveToLocalStorage();
            resolve();
        });
    });
}

// ===== LOCALSTORAGE GA SAQLASH (ZAXIRA) =====
function saveToLocalStorage() {
    try {
        localStorage.setItem('salimboy_db', JSON.stringify(DB));
        console.log('💾 LocalStorage ga saqlandi');
    } catch(e) {
        console.log('⚠️ Saqlash xatoligi:', e);
    }
}

// ===== LOCALSTORAGE DAN YUKLASH =====
function loadFromLocalStorage() {
    try {
        var data = localStorage.getItem('salimboy_db');
        if (data) {
            var parsed = JSON.parse(data);
            Object.assign(DB, parsed);
            return true;
        }
    } catch(e) {
        console.log('⚠️ Yuklash xatoligi:', e);
    }
    return false;
}

// ===== SUPABASE DAN YUKLASH =====
function loadFromSupabase() {
    return new Promise(function(resolve, reject) {
        if (typeof SupabaseAPI === 'undefined' || !SupabaseAPI) {
            loadFromLocalStorage();
            resolve();
            return;
        }
        
        SupabaseAPI.loadSupabase().then(function() {
            var promises = [];
            var tables = ['products', 'sales', 'debtors', 'expenses', 'employees', 'shifts'];
            
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                var methodName = 'get' + table.charAt(0).toUpperCase() + table.slice(1);
                var method = SupabaseAPI[methodName];
                
                if (method) {
                    promises.push(method().then(function(result) {
                        if (!result.error && result.data) {
                            DB[table] = result.data;
                            console.log('✅ Supabase dan yuklandi:', table, result.data.length);
                        }
                    }));
                }
            }
            
            Promise.all(promises).then(function() {
                saveToLocalStorage();
                resolve();
            }).catch(function() {
                loadFromLocalStorage();
                resolve();
            });
        }).catch(function() {
            loadFromLocalStorage();
            resolve();
        });
    });
}

// ===== MAHSULOT QO'SHISH (AVTOMAT) =====
function addProduct(product) {
    product.id = product.id || Date.now() + Math.floor(Math.random() * 1000);
    product.createdAt = product.createdAt || new Date().toISOString();
    
    // LocalStorage ga qo'shish
    DB.products.push(product);
    saveToLocalStorage();
    
    // Supabase ga avtomat qo'shish
    var supabaseProduct = {
        id: product.id,
        name: product.name,
        barcode: product.barcode || '',
        purchase_price: product.purchasePrice || 0,
        sale_price: product.salePrice || 0,
        stock: product.stock || 0,
        unit: product.unit || 'dona',
        image: product.image || '',
        category: product.category || 'Umumiy',
        created_at: product.createdAt
    };
    
    saveToSupabase('Product', supabaseProduct);
    return product;
}

// ===== SAVDO QO'SHISH (AVTOMAT) =====
function addSale(sale) {
    sale.id = sale.id || Date.now() + Math.floor(Math.random() * 1000);
    sale.date = sale.date || new Date().toISOString();
    
    DB.sales.push(sale);
    saveToLocalStorage();
    
    var supabaseSale = {
        id: sale.id,
        cashier: sale.cashier || 'Noma\'lum',
        items: sale.items || [],
        total: sale.total || 0,
        payment_type: sale.paymentType || 'cash',
        debtor: sale.debtor || null,
        date: sale.date,
        status: sale.status || 'completed',
        discount: sale.discount || 0,
        discount_percent: sale.discountPercent || 0,
        shift_id: sale.shiftId || null
    };
    
    saveToSupabase('Sale', supabaseSale);
    return sale;
}

// ===== QARZDOR QO'SHISH (AVTOMAT) =====
function addDebtor(debtor) {
    debtor.id = debtor.id || Date.now() + Math.floor(Math.random() * 1000);
    debtor.date = debtor.date || new Date().toISOString();
    
    DB.debtors.push(debtor);
    saveToLocalStorage();
    
    var supabaseDebtor = {
        id: debtor.id,
        name: debtor.name,
        phone: debtor.phone,
        address: debtor.address || '',
        amount: debtor.amount,
        date: debtor.date,
        status: debtor.status || 'pending',
        paid_date: debtor.paidDate || null
    };
    
    saveToSupabase('Debtor', supabaseDebtor);
    return debtor;
}

// ===== RASHOD QO'SHISH (AVTOMAT) =====
function addExpense(expense) {
    expense.id = expense.id || Date.now() + Math.floor(Math.random() * 1000);
    expense.date = expense.date || new Date().toISOString();
    
    DB.expenses.push(expense);
    saveToLocalStorage();
    
    var supabaseExpense = {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        payment_type: expense.paymentType || 'cash',
        date: expense.date
    };
    
    saveToSupabase('Expense', supabaseExpense);
    return expense;
}

// ===== HODIM QO'SHISH (AVTOMAT) =====
function addEmployee(employee) {
    employee.id = employee.id || Date.now() + Math.floor(Math.random() * 1000);
    employee.hireDate = employee.hireDate || new Date().toISOString();
    
    DB.employees.push(employee);
    saveToLocalStorage();
    
    var supabaseEmployee = {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        salary: employee.salary,
        phone: employee.phone || '',
        address: employee.address || '',
        code: employee.code || '',
        hire_date: employee.hireDate,
        active: employee.active !== undefined ? employee.active : true
    };
    
    saveToSupabase('Employee', supabaseEmployee);
    return employee;
}

// ===== SMENA OCHISH (AVTOMAT) =====
function openShift(shift) {
    shift.id = shift.id || Date.now() + Math.floor(Math.random() * 1000);
    shift.startTime = shift.startTime || new Date().toISOString();
    shift.status = 'open';
    
    DB.shifts.push(shift);
    saveToLocalStorage();
    
    var supabaseShift = {
        id: shift.id,
        cashier: shift.cashier,
        start_time: shift.startTime,
        end_time: null,
        start_cash: shift.startCash || 0,
        end_cash: 0,
        total_sales: 0,
        status: 'open'
    };
    
    saveToSupabase('Shift', supabaseShift);
    return shift;
}

// ===== YUKLASH =====
if (!loadFromLocalStorage()) {
    loadFromSupabase().then(function() {
        console.log('✅ Ma\'lumotlar yuklandi!');
    });
}

// ===== EKSPORT =====
window.DB = DB;
window.addProduct = addProduct;
window.addSale = addSale;
window.addDebtor = addDebtor;
window.addExpense = addExpense;
window.addEmployee = addEmployee;
window.openShift = openShift;
window.saveToLocalStorage = saveToLocalStorage;
window.saveToSupabase = saveToSupabase;
window.loadFromSupabase = loadFromSupabase;

console.log('✅ Database.js to\'liq yuklandi! (Supabase avtomat)');