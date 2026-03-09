// i18n.js

let currentLanguage = localStorage.getItem('language') || 'cs';
let translations = {};

// Загрузка переводов для выбранного языка
async function loadTranslations(lang) {
    const response = await fetch(`locales/${lang}.json`);
    translations = await response.json();
    applyTranslations();
    localStorage.setItem('language', lang);
}

// Глобальная функция для получения перевода
window.t = function(key, params = {}) {
    let translation = getNestedTranslation(translations, key) || key;
    for (let [k, v] of Object.entries(params)) {
        translation = translation.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return translation;
};

// Применение переводов ко всем элементам с data-i18n
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let translation = t(key);
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    // Обновление элементов с параметрами (например, цена)
    document.querySelectorAll('[data-i18n-params]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const params = JSON.parse(el.getAttribute('data-i18n-params') || '{}');
        el.textContent = t(key, params);
    });

    // Обновление плейсхолдеров
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation) el.placeholder = translation;
    });

    // Обновление опций select
    document.querySelectorAll('select[data-i18n-options]').forEach(select => {
        const optionsKey = select.getAttribute('data-i18n-options');
        const options = getNestedTranslation(translations, optionsKey);
        if (options) {
            Array.from(select.options).forEach(option => {
                const optKey = option.value;
                if (options[optKey]) {
                    option.textContent = options[optKey];
                }
            });
        }
    });

    // Обновление счётчика корзины
    updateCartCountWithLang();
}

// Получение вложенного перевода
function getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, i) => (o ? o[i] : null), obj);
}

// Обновление счётчика корзины с переводом
function updateCartCountWithLang() {
    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    let cartLink = document.querySelector('a[href="cart.html"] span[data-i18n="nav_cart"]');
    if (cartLink) {
        // Сам текст ссылки уже обновлён через data-i18n, а счётчик рядом
        let countSpan = document.querySelector('.cart-count');
        if (countSpan) countSpan.textContent = totalQty;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(currentLanguage);

    // Добавляем переключатель языков
    const langSwitcher = document.createElement('div');
    langSwitcher.className = 'lang-switcher';
    langSwitcher.innerHTML = `
        <button class="lang-btn" data-lang="cs">🇨🇿 Čeština</button>
        <button class="lang-btn" data-lang="ru">🇷🇺 Русский</button>
        <button class="lang-btn" data-lang="en">🇬🇧 English</button>
    `;
    document.querySelector('header').appendChild(langSwitcher);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            if (lang !== currentLanguage) {
                currentLanguage = lang;
                loadTranslations(lang);
            }
        });
    });
});

// Переопределяем функцию updateCartCount из script.js
const originalUpdateCartCount = window.updateCartCount;
window.updateCartCount = function() {
    if (originalUpdateCartCount) originalUpdateCartCount();
    updateCartCountWithLang();
};