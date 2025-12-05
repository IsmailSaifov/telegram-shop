const tg = window.Telegram.WebApp;
tg.expand();  // делаем приложение на весь экран

let categories = [];
let products = [];
let cart = [];

// =========================
// 1. Запрос категорий из бота
// =========================
function loadCategories() {
    tg.sendData(JSON.stringify({ action: "get_categories" }));
}

// =========================
// 2. Запрос товаров из бота
// =========================
function loadProducts() {
    tg.sendData(JSON.stringify({ action: "get_products" }));
}


// =================================================
// ПОКАЗ КАТЕГОРИЙ
// =================================================
function renderCategories() {
    const div = document.getElementById("categories");
    div.innerHTML = "";

    categories.forEach(cat => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${cat.image}" alt="">
            <h3>${cat.name}</h3>
        `;
        card.onclick = () => showProductsByCategory(cat.id);
        div.appendChild(card);
    });
}


// =================================================
// ПОКАЗ ТОВАРОВ
// =================================================
function showProductsByCategory(catId) {
    const div = document.getElementById("products");
    div.innerHTML = "";

    const filtered = products.filter(p => p.category_id === catId);

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${p.image}" alt="">
            <h3>${p.name}</h3>
            <p>${p.price} сомони</p>
            <button>Добавить</button>
        `;

        card.querySelector("button").onclick = () => addToCart(p);

        div.appendChild(card);
    });
}


// =================================================
// КОРЗИНА
// =================================================
function addToCart(product) {
    cart.push(product);
    tg.showPopup({ message: `${product.name} добавлен в корзину!` });
    renderCart();
}

function renderCart() {
    const div = document.getElementById("cart");
    if (cart.length === 0) {
        div.innerHTML = "<p>Корзина пустая</p>";
        return;
    }

    let total = 0;

    let html = "<h3>Корзина:</h3>";
    cart.forEach(item => {
        html += `<p>${item.name} — ${item.price} сомони</p>`;
        total += item.price;
    });

    html += `<h3>Итого: ${total} сомони</h3>`;

    html += `
        <input id="full_name" placeholder="Ваше имя">
        <input id="phone" placeholder="Телефон">
        <button id="order_btn">Оформить</button>
    `;

    div.innerHTML = html;

    document.getElementById("order_btn").onclick = sendOrder;
}


// =================================================
// ОТПРАВКА ЗАКАЗА
// =================================================
function sendOrder() {
    const name = document.getElementById("full_name").value;
    const phone = document.getElementById("phone").value;

    if (!name || !phone) {
        tg.showPopup({ message: "Введите имя и телефон" });
        return;
    }

    tg.sendData(JSON.stringify({
        action: "make_order",
        full_name: name,
        phone: phone,
        items: cart
    }));
}


// =================================================
// ПОЛУЧЕНИЕ ДАННЫХ ОТ БОТА
// =================================================
Telegram.WebApp.onEvent("message", function(msg) {
    try {
        const data = JSON.parse(msg);
        console.log("Получено:", data);

        if (data.action === "categories") {
            categories = data.data;
            renderCategories();
        }

        if (data.action === "products") {
            products = data.data;
        }

    } catch (e) {
        console.error("Ошибка JSON:", e);
    }
});


// ========================
// ПЕРВИЧНЫЕ ЗАПРОСЫ
// ========================
setTimeout(() => {
    loadCategories();
    loadProducts();
}, 300);
