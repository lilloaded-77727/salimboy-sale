// ===== SUPABASE.JS - SALIMBOY SALE SUPABASE ULASH =====

// ===== ENV DAN MA'LUMOTLARNI OLISH =====
var SUPABASE_URL = window.ENV ? window.ENV.SUPABASE_URL : 'https://urlaiwcfxzptvmewnjqb.supabase.co';
var SUPABASE_ANON_KEY = window.ENV ? window.ENV.SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybGFpd2NmeHpwdHZtZXduanFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDA0MDgsImV4cCI6MjA5ODY3NjQwOH0.5zWd7os1pMlJ97Dp5uEHMVun5oIxbG6ZGsicIPEhGpw';

var supabaseClient = null;
var isSupabaseReady = false;

// ===== SUPABASE NI YUKLASH =====
function loadSupabase() {
    return new Promise(function(resolve, reject) {
        try {
            if (isSupabaseReady && supabaseClient) {
                resolve(supabaseClient);
                return;
            }

            if (typeof supabase === 'undefined') {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
                script.onload = function() {
                    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    isSupabaseReady = true;
                    console.log('✅ Supabase ulandi!');
                    resolve(supabaseClient);
                };
                script.onerror = function() {
                    reject('❌ Supabase yuklanmadi!');
                };
                document.head.appendChild(script);
            } else {
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                isSupabaseReady = true;
                console.log('✅ Supabase ulandi!');
                resolve(supabaseClient);
            }
        } catch(e) {
            reject('❌ Xatolik: ' + e.message);
        }
    });
}

// ===== TEST ULASH =====
function testSupabaseConnection() {
    return loadSupabase().then(function(client) {
        return client.from('products').select('count', { count: 'exact', head: true });
    }).then(function(result) {
        if (result.error) {
            console.log('⚠️ Xatolik:', result.error.message);
            return false;
        }
        console.log('✅ Supabase ulanishi muvaffaqiyatli!');
        return true;
    }).catch(function(e) {
        console.log('❌ Ulanish xatoligi:', e.message);
        return false;
    });
}

// ===== MAHSULOTLAR =====
function supabase_getProducts() {
    return supabaseClient.from('products').select('*').order('created_at', { ascending: false });
}

function supabase_addProduct(product) {
    return supabaseClient.from('products').insert([product]);
}

function supabase_updateProduct(id, data) {
    return supabaseClient.from('products').update(data).eq('id', id);
}

function supabase_deleteProduct(id) {
    return supabaseClient.from('products').delete().eq('id', id);
}

// ===== SAVDOLAR =====
function supabase_getSales() {
    return supabaseClient.from('sales').select('*').order('date', { ascending: false });
}

function supabase_addSale(sale) {
    return supabaseClient.from('sales').insert([sale]);
}

// ===== SMENALAR =====
function supabase_getShifts() {
    return supabaseClient.from('shifts').select('*').order('start_time', { ascending: false });
}

function supabase_openShift(shift) {
    return supabaseClient.from('shifts').insert([shift]);
}

function supabase_closeShift(id, data) {
    return supabaseClient.from('shifts').update(data).eq('id', id);
}

// ===== QARZDORLAR =====
function supabase_getDebtors() {
    return supabaseClient.from('debtors').select('*').order('date', { ascending: false });
}

function supabase_addDebtor(debtor) {
    return supabaseClient.from('debtors').insert([debtor]);
}

function supabase_updateDebtor(id, data) {
    return supabaseClient.from('debtors').update(data).eq('id', id);
}

// ===== RASHODLAR =====
function supabase_getExpenses() {
    return supabaseClient.from('expenses').select('*').order('date', { ascending: false });
}

function supabase_addExpense(expense) {
    return supabaseClient.from('expenses').insert([expense]);
}

// ===== HODIMLAR =====
function supabase_getEmployees() {
    return supabaseClient.from('employees').select('*').order('hire_date', { ascending: false });
}

function supabase_addEmployee(employee) {
    return supabaseClient.from('employees').insert([employee]);
}

// ===== SOZLAMALAR =====
function supabase_getSettings() {
    return supabaseClient.from('settings').select('*').limit(1);
}

function supabase_updateSettings(data) {
    return supabaseClient.from('settings').update(data).eq('id', 1);
}

// ===== STATISTIKA =====
function supabase_getStatistics(date, type) {
    var query = supabaseClient.from('statistics').select('*');
    if (date) query = query.eq('date', date);
    if (type) query = query.eq('type', type);
    return query;
}

function supabase_updateStatistics(data) {
    return supabaseClient.from('statistics').upsert([data], { onConflict: 'date,type' });
}

// ===== EKSPORT =====
window.SupabaseAPI = {
    loadSupabase: loadSupabase,
    testConnection: testSupabaseConnection,
    getProducts: supabase_getProducts,
    addProduct: supabase_addProduct,
    updateProduct: supabase_updateProduct,
    deleteProduct: supabase_deleteProduct,
    getSales: supabase_getSales,
    addSale: supabase_addSale,
    getShifts: supabase_getShifts,
    openShift: supabase_openShift,
    closeShift: supabase_closeShift,
    getDebtors: supabase_getDebtors,
    addDebtor: supabase_addDebtor,
    updateDebtor: supabase_updateDebtor,
    getExpenses: supabase_getExpenses,
    addExpense: supabase_addExpense,
    getEmployees: supabase_getEmployees,
    addEmployee: supabase_addEmployee,
    getSettings: supabase_getSettings,
    updateSettings: supabase_updateSettings,
    getStatistics: supabase_getStatistics,
    updateStatistics: supabase_updateStatistics
};

console.log('✅ Supabase.js to\'liq yuklandi!');
