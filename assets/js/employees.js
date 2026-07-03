// ===== EMPLOYEES.JS - TO'LIQ HODIMLAR LOGIKASI (TUZATILGAN) =====

var editingEmployeeId = null;

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

        // Hodimlarni yuklash
        loadEmployees();

        // Statistikani yuklash
        loadEmployeeStats();

        // Sidebar toggle
        var menuToggle = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }

        console.log('✅ Employees.js yuklandi!');
    } catch(e) {
        console.log('Employees.js yuklashda xatolik:', e);
    }
});

// ===== HODIM QO'SHISH MODAL =====
function openAddEmployeeModal() {
    try {
        var modal = document.getElementById('addEmployeeModal');
        var nameInput = document.getElementById('empName');
        if (modal) modal.classList.add('active');
        if (nameInput) nameInput.focus();
    } catch(e) {
        console.log('Modal ochishda xatolik:', e);
    }
}

function closeAddEmployeeModal() {
    try {
        var modal = document.getElementById('addEmployeeModal');
        var nameInput = document.getElementById('empName');
        var positionSelect = document.getElementById('empPosition');
        var salaryInput = document.getElementById('empSalary');
        var phoneInput = document.getElementById('empPhone');
        var addressInput = document.getElementById('empAddress');
        var codeInput = document.getElementById('empCode');
        
        if (modal) modal.classList.remove('active');
        if (nameInput) nameInput.value = '';
        if (positionSelect) positionSelect.value = 'kassir';
        if (salaryInput) salaryInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (addressInput) addressInput.value = '';
        if (codeInput) codeInput.value = '';
    } catch(e) {
        console.log('Modal yopishda xatolik:', e);
    }
}

// ===== HODIM QO'SHISH =====
function addEmployee() {
    try {
        var nameInput = document.getElementById('empName');
        var positionSelect = document.getElementById('empPosition');
        var salaryInput = document.getElementById('empSalary');
        var phoneInput = document.getElementById('empPhone');
        var addressInput = document.getElementById('empAddress');
        var codeInput = document.getElementById('empCode');
        
        if (!nameInput || !positionSelect || !salaryInput) {
            showNotification('⚠️ Forma elementlari topilmadi!', 'error');
            return;
        }
        
        var name = nameInput.value.trim();
        var position = positionSelect.value;
        var salary = parseFloat(salaryInput.value);
        var phone = phoneInput ? phoneInput.value.trim() : '';
        var address = addressInput ? addressInput.value.trim() : '';
        var code = codeInput ? codeInput.value.trim() : '';

        if (!name || !salary || salary <= 0) {
            showNotification('⚠️ Iltimos, barcha majburiy maydonlarni to\'ldiring!', 'warning');
            return;
        }

        // Kodni tekshirish (agar kassir bo'lsa)
        if (position === 'kassir' && (!code || code.length !== 4)) {
            showNotification('⚠️ Kassir uchun 4 xonali kod kiriting!', 'warning');
            return;
        }

        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }

        var employee = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: name,
            position: position,
            salary: salary,
            phone: phone || '-',
            address: address || '-',
            code: code || null,
            hireDate: new Date().toISOString(),
            active: true
        };

        // Kassirni DB.cashiers ga qo'shish
        if (position === 'kassir' && code) {
            if (!DB.cashiers) DB.cashiers = [];
            DB.cashiers.push({
                id: employee.id,
                name: name,
                code: code,
                salary: salary,
                active: true
            });
        }

        if (!DB.employees) DB.employees = [];
        DB.employees.push(employee);
        saveDB();
        closeAddEmployeeModal();
        loadEmployees();
        loadEmployeeStats();
        showNotification('✅ "' + name + '" hodim sifatida qo\'shildi!', 'success');
    } catch(e) {
        console.log('Hodim qo\'shishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== HODIMLARNI YUKLASH =====
function loadEmployees() {
    try {
        var tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        if (typeof DB === 'undefined' || !DB || !DB.employees) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-users" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Hodimlar mavjud emas
                    </td>
                </tr>
            `;
            var countEl = document.getElementById('employeeCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var employees = DB.employees;

        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-users" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Hodimlar topilmadi
                    </td>
                </tr>
            `;
            var countEl = document.getElementById('employeeCount');
            if (countEl) countEl.textContent = '0 ta';
            return;
        }

        var positionNames = {
            'kassir': 'Kassir',
            'sotuvchi': 'Sotuvchi',
            'omborchi': 'Omborchi',
            'administrator': 'Administrator',
            'manager': 'Manager',
            'boshqa': 'Boshqa'
        };

        var html = '';
        for (var i = 0; i < employees.length; i++) {
            var e = employees[i];
            var positionClass = e.position;
            
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${e.name}</strong></td>
                    <td><span class="position-badge ${positionClass}">${positionNames[e.position] || e.position}</span></td>
                    <td>${formatPrice(e.salary)}</td>
                    <td>${e.phone || '-'}</td>
                    <td>${e.code || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editEmployee(${e.id})" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(52,152,219,0.12);color:#3498DB;transition:all 0.3s;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="confirmDeleteEmployee(${e.id})" style="padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;background:rgba(231,76,60,0.12);color:#E74C3C;transition:all 0.3s;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
        var countEl = document.getElementById('employeeCount');
        if (countEl) countEl.textContent = employees.length + ' ta';
    } catch(e) {
        console.log('Hodimlarni yuklashda xatolik:', e);
        var tbody = document.getElementById('employeesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#999;">
                        <i class="fas fa-exclamation-triangle" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                        Xatolik yuz berdi
                    </td>
                </tr>
            `;
        }
    }
}

// ===== HODIM STATISTIKASI =====
function loadEmployeeStats() {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.employees) {
            var totalEl = document.getElementById('totalEmployees');
            var cashiersEl = document.getElementById('totalCashiers');
            var salaryEl = document.getElementById('totalSalary');
            var avgEl = document.getElementById('avgSalary');
            
            if (totalEl) totalEl.textContent = '0';
            if (cashiersEl) cashiersEl.textContent = '0';
            if (salaryEl) salaryEl.textContent = '0 so\'m';
            if (avgEl) avgEl.textContent = '0 so\'m';
            return;
        }

        var employees = DB.employees;
        var total = employees.length;
        var cashiers = 0;
        var totalSalary = 0;

        for (var i = 0; i < employees.length; i++) {
            var e = employees[i];
            totalSalary += e.salary || 0;
            if (e.position === 'kassir') {
                cashiers++;
            }
        }

        var avgSalary = total > 0 ? Math.round(totalSalary / total) : 0;

        var totalEl = document.getElementById('totalEmployees');
        var cashiersEl = document.getElementById('totalCashiers');
        var salaryEl = document.getElementById('totalSalary');
        var avgEl = document.getElementById('avgSalary');

        if (totalEl) totalEl.textContent = total;
        if (cashiersEl) cashiersEl.textContent = cashiers;
        if (salaryEl) salaryEl.textContent = formatPrice(totalSalary);
        if (avgEl) avgEl.textContent = formatPrice(avgSalary);
    } catch(e) {
        console.log('Hodim statistikasini yuklashda xatolik:', e);
    }
}

// ===== HODIM TAXRIRLASH =====
function editEmployee(id) {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.employees) {
            showNotification('⚠️ Hodimlar mavjud emas!', 'error');
            return;
        }
        
        var employee = null;
        for (var i = 0; i < DB.employees.length; i++) {
            if (DB.employees[i].id === id) {
                employee = DB.employees[i];
                break;
            }
        }
        
        if (!employee) {
            showNotification('⚠️ Hodim topilmadi!', 'error');
            return;
        }

        editingEmployeeId = id;
        
        var idEl = document.getElementById('editEmpId');
        var nameEl = document.getElementById('editEmpName');
        var positionEl = document.getElementById('editEmpPosition');
        var salaryEl = document.getElementById('editEmpSalary');
        var phoneEl = document.getElementById('editEmpPhone');
        var addressEl = document.getElementById('editEmpAddress');
        
        if (idEl) idEl.value = id;
        if (nameEl) nameEl.value = employee.name;
        if (positionEl) positionEl.value = employee.position;
        if (salaryEl) salaryEl.value = employee.salary;
        if (phoneEl) phoneEl.value = employee.phone || '';
        if (addressEl) addressEl.value = employee.address || '';

        var modal = document.getElementById('editEmployeeModal');
        if (modal) modal.classList.add('active');
    } catch(e) {
        console.log('Hodim tahrirlashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function closeEditEmployeeModal() {
    try {
        var modal = document.getElementById('editEmployeeModal');
        if (modal) modal.classList.remove('active');
        editingEmployeeId = null;
    } catch(e) {
        console.log('Modal yopishda xatolik:', e);
    }
}

// ===== HODIM YANGILASH =====
function updateEmployee() {
    try {
        var idEl = document.getElementById('editEmpId');
        var nameEl = document.getElementById('editEmpName');
        var positionEl = document.getElementById('editEmpPosition');
        var salaryEl = document.getElementById('editEmpSalary');
        var phoneEl = document.getElementById('editEmpPhone');
        var addressEl = document.getElementById('editEmpAddress');
        
        if (!idEl || !nameEl || !positionEl || !salaryEl) {
            showNotification('⚠️ Forma elementlari topilmadi!', 'error');
            return;
        }
        
        var id = parseInt(idEl.value);
        var name = nameEl.value.trim();
        var position = positionEl.value;
        var salary = parseFloat(salaryEl.value);
        var phone = phoneEl ? phoneEl.value.trim() : '';
        var address = addressEl ? addressEl.value.trim() : '';

        if (!name || !salary || salary <= 0) {
            showNotification('⚠️ Barcha maydonlarni to\'ldiring!', 'warning');
            return;
        }

        if (typeof DB === 'undefined' || !DB || !DB.employees) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }

        var index = -1;
        for (var i = 0; i < DB.employees.length; i++) {
            if (DB.employees[i].id === id) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            showNotification('⚠️ Hodim topilmadi!', 'error');
            return;
        }

        DB.employees[index].name = name;
        DB.employees[index].position = position;
        DB.employees[index].salary = salary;
        DB.employees[index].phone = phone || '-';
        DB.employees[index].address = address || '-';

        // Kassirlarni ham yangilash
        if (DB.cashiers) {
            for (var j = 0; j < DB.cashiers.length; j++) {
                if (DB.cashiers[j].id === id) {
                    DB.cashiers[j].name = name;
                    DB.cashiers[j].salary = salary;
                    break;
                }
            }
        }

        saveDB();
        closeEditEmployeeModal();
        loadEmployees();
        loadEmployeeStats();
        showNotification('✅ "' + name + '" yangilandi!', 'success');
    } catch(e) {
        console.log('Hodim yangilashda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== HODIM O'CHIRISH =====
function confirmDeleteEmployee(id) {
    try {
        if (typeof DB === 'undefined' || !DB || !DB.employees) {
            showNotification('⚠️ Hodimlar mavjud emas!', 'error');
            return;
        }
        
        var employee = null;
        for (var i = 0; i < DB.employees.length; i++) {
            if (DB.employees[i].id === id) {
                employee = DB.employees[i];
                break;
            }
        }
        
        if (!employee) {
            showNotification('⚠️ Hodim topilmadi!', 'error');
            return;
        }

        if (!confirm('"' + employee.name + '" hodimini o\'chirishga ishonchingiz komilmi?')) {
            return;
        }

        deleteEmployeeById(id);
    } catch(e) {
        console.log('Hodim o\'chirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

function deleteEmployeeById(id) {
    try {
        if (typeof DB === 'undefined' || !DB) {
            showNotification('⚠️ Ma\'lumotlar bazasi topilmadi!', 'error');
            return;
        }
        
        var employeeName = '';
        
        // Hodimni o'chirish
        var newEmployees = [];
        for (var i = 0; i < DB.employees.length; i++) {
            if (DB.employees[i].id === id) {
                employeeName = DB.employees[i].name;
            } else {
                newEmployees.push(DB.employees[i]);
            }
        }
        DB.employees = newEmployees;

        // Kassirdan o'chirish
        if (DB.cashiers) {
            var newCashiers = [];
            for (var i = 0; i < DB.cashiers.length; i++) {
                if (DB.cashiers[i].id !== id) {
                    newCashiers.push(DB.cashiers[i]);
                }
            }
            DB.cashiers = newCashiers;
        }

        saveDB();
        closeEditEmployeeModal();
        loadEmployees();
        loadEmployeeStats();
        showNotification('🗑️ "' + employeeName + '" o\'chirildi!', 'info');
    } catch(e) {
        console.log('Hodim o\'chirishda xatolik:', e);
        showNotification('⚠️ Xatolik yuz berdi!', 'error');
    }
}

// ===== DELETE EMPLOYEE (edit modal dan) =====
function deleteEmployee() {
    try {
        var idEl = document.getElementById('editEmpId');
        if (!idEl) {
            showNotification('⚠️ Xatolik yuz berdi!', 'error');
            return;
        }
        var id = parseInt(idEl.value);
        confirmDeleteEmployee(id);
    } catch(e) {
        console.log('Hodim o\'chirishda xatolik:', e);
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

console.log('✅ Employees.js to\'liq yuklandi!');