// ===== THEME.JS - DARK/LIGHT REJIM =====

var currentTheme = 'dark';

function toggleTheme() {
    var body = document.body;
    var icon = document.querySelector('#themeToggle i');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        currentTheme = 'dark';
        if (icon) {
            icon.className = 'fas fa-moon';
            icon.style.transform = 'rotate(360deg)';
            setTimeout(function() {
                icon.style.transform = 'rotate(0deg)';
            }, 400);
        }
        localStorage.setItem('salimboy_theme', 'dark');
        showNotification('🌙 Dark rejim yoqildi', 'info');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        currentTheme = 'light';
        if (icon) {
            icon.className = 'fas fa-sun';
            icon.style.transform = 'rotate(360deg)';
            setTimeout(function() {
                icon.style.transform = 'rotate(0deg)';
            }, 400);
        }
        localStorage.setItem('salimboy_theme', 'light');
        showNotification('☀️ Light rejim yoqildi', 'info');
    }
}

function loadTheme() {
    try {
        var saved = localStorage.getItem('salimboy_theme') || 'dark';
        var body = document.body;
        var icon = document.querySelector('#themeToggle i');
        
        if (saved === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (icon) icon.className = 'fas fa-sun';
            currentTheme = 'light';
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (icon) icon.className = 'fas fa-moon';
            currentTheme = 'dark';
        }
    } catch(e) {
        console.log('Tema yuklashda xatolik:', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    var btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
});

console.log('✅ Theme.js yuklandi!');