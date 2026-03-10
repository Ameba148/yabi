// script.js

// Получение корзины из localStorage
function getCart() {
    let cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Сохранение корзины
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление счётчика товаров в шапке
function updateCartCount() {
    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    let cartSpan = document.querySelector('.cart-count');
    if (cartSpan) cartSpan.textContent = totalQty;
}

// Добавление товара
function addToCart(product) {
    let cart = getCart();
    let existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    saveCart(cart);
    updateCartCount();
    alert(t('added_to_cart'));
}

// Удаление товара
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart(); // если мы на странице корзины
    updateCartCount();
}

// Изменение количества
function changeQuantity(productId, newQty) {
    if (newQty < 1) return;
    let cart = getCart();
    let item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQty;
        saveCart(cart);
        displayCart();
        updateCartCount();
    }
}

// Отображение корзины на странице cart.html
function displayCart() {
    let container = document.getElementById('cart-items-container');
    if (!container) return;
    let cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = '<p data-i18n="empty_cart">Váš košík je prázdný.</p>';
        document.getElementById('cart-total').innerHTML = '';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>${t('price', {price: item.price})} / ks</p>
                </div>
                <div>
                    <button class="btn" onclick="changeQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn" onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <p class="price">${t('price', {price: item.price * item.quantity})}</p>
                <button class="btn" onclick="removeFromCart('${item.id}')">${t('remove')}</button>
            </div>
        `;
    });
    container.innerHTML = html;
    document.getElementById('cart-total').innerHTML = `<strong>${t('total', {total: total})}</strong>`;
}

// Добавление текущего товара со страницы product.html
function addCurrentProduct() {
    let name = document.querySelector('.detail-info h1').textContent;
    let priceText = document.querySelector('.detail-price').textContent;
    let price = parseInt(priceText.replace(/[^0-9]/g, ''));
    let image = document.querySelector('.product-detail img').src;
    let id = name + price; // простой идентификатор
    let product = {
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1
    };
    addToCart(product);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // Если мы на странице корзины, отображаем её
    if (window.location.pathname.endsWith('cart.html')) {
        displayCart();
    }

    // Обработчики для кнопок добавления на главной (класс .add-to-cart)
    let addButtons = document.querySelectorAll('.add-to-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            let card = this.closest('.product-card');
            let name = card.querySelector('h3').textContent;
            let priceText = card.querySelector('.price').textContent;
            let price = parseInt(priceText.replace(/[^0-9]/g, ''));
            let image = card.querySelector('img').src;
            let id = name + price;
            let product = {
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            };
            addToCart(product);
        });
    });
});