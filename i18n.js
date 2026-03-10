// i18n.js

let currentLanguage = localStorage.getItem('language') || 'cs';
let currentCurrency = localStorage.getItem('currency') || 'CZK';
let currentTheme = localStorage.getItem('theme') || 'light';
let translations = {};
let exchangeRates = {
  CZK: 1,
  EUR: 0.04,    // 1 CZK = 0.04 EUR
  USD: 0.043    // 1 CZK = 0.043 USD
};

// Загрузка переводов
async function loadTranslations(lang) {
  const response = await fetch(`locales/${lang}.json`);
  translations = await response.json();
  applyTranslations();
  localStorage.setItem('language', lang);
}

// Глобальная функция перевода
window.t = function(key, params = {}) {
  let translation = getNestedTranslation(translations, key) || key;
  for (let [k, v] of Object.entries(params)) {
    translation = translation.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return translation;
};

// Конвертация цены
window.convertPrice = function(priceCzk) {
  return Math.round(priceCzk * exchangeRates[currentCurrency]);
};

window.formatPrice = function(priceCzk) {
  const converted = convertPrice(priceCzk);
  return `${converted} ${currentCurrency}`;
};

// Применение переводов
function applyTranslations() {
  // Текстовые элементы
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

  // Элементы с параметрами (например, цена)
  document.querySelectorAll('[data-i18n-params]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const params = JSON.parse(el.getAttribute('data-i18n-params') || '{}');
    el.textContent = t(key, params);
  });

  // Плейсхолдеры
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation) el.placeholder = translation;
  });

  // Селекты
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

  // Обновление цен на странице
  document.querySelectorAll('[data-price-czk]').forEach(el => {
    const priceCzk = parseInt(el.dataset.priceCzk);
    el.textContent = formatPrice(priceCzk);
  });

  updateCartDisplay();
}

// Получение вложенного перевода
function getNestedTranslation(obj, key) {
  return key.split('.').reduce((o, i) => (o ? o[i] : null), obj);
}

// Обновление корзины с учётом валюты
function updateCartDisplay() {
  if (window.location.pathname.endsWith('cart.html')) {
    if (typeof displayCart === 'function') displayCart();
  }
}

// Применение темы
function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem('theme', theme);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage);
  applyTheme(currentTheme);

  // Переключатель языков
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

  // Переключатель валют (если есть на странице)
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.value = currentCurrency;
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      localStorage.setItem('currency', currentCurrency);
      applyTranslations();
      if (typeof updateCartDisplay === 'function') updateCartDisplay();
    });
  }

  // Переключатель темы (если есть на странице)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.checked = currentTheme === 'dark';
    themeToggle.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'dark' : 'light');
    });
  }
});

// Переопределение updateCartCount
const originalUpdateCartCount = window.updateCartCount;
window.updateCartCount = function() {
  if (originalUpdateCartCount) originalUpdateCartCount();
  if (translations && translations.cart_count) {
    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    let cartLink = document.querySelector('a[href="cart.html"] span[data-i18n="nav_cart"]');
    if (cartLink) {
      let countSpan = document.querySelector('.cart-count');
      if (countSpan) countSpan.textContent = totalQty;
    }
  }
};