const tg = window.Telegram.WebApp;
tg.expand();

let categories = [];
let products = [];
let cart = [];

const content = document.getElementById("content");
const title = document.getElementById("title");
const backBtn = document.getElementById("backBtn");
const cartBtn = document.getElementById("cartBtn");

// Навигационный стек
let pageStack = [];


/* === ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ === */
function navigateTo(pageFunction) {
    pageStack.push(pageFunction);
    pageFunction();
    updateBackButton();
}

function goBack() {
    pageStack.pop();
    const last = pageStack[pageStack.length - 1] || showCategories;
    last();
    updateBackButton();
}

function updateBackButton() {
    if (pageStack.length <= 1) {
        backBtn.classList.add("hidden");
    } else {
        backBtn.classList.remove("hidden");
    }
}


/* === ГЛАВНАЯ — КАТЕГОРИИ === */
function showCategories() {
    title.innerText = "Категории";
    content.innerHTML = `<div class="grid two fade"></div>`;
    const grid = content.querySelector(".grid");

    categories.forEach(cat => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${cat.image}" alt="">
            <h3>${cat.name}</h3>
        `;
        card.onclick = () => navigateTo(() => showProducts(cat.id));
        grid.appendChild(card);
    });
}


/* === ТОВАРЫ КАТЕГОРИИ === */
function showProducts(catId) {
    title.innerText = "Товары";

    const filtered = products.filter(p => p.category_id === catId);

    content.innerHTML = `<div class="grid two fade"></div>`;
    const grid = content.querySelector(".grid");

    filtered.forEach(prod => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${prod.image}">
            <h3>${prod.name}</h3>
            <div class="price">${prod.price} сом</div>
        `;

        card.onclick = () => navigateTo(() => showProductPage(prod));

        grid.appendChild(card);
    });
}


/* === СТРАНИЦА ТОВАРА === */
function showProductPage(product) {
    title.innerText = product.name;

    content.innerHTML = `
        <div id="productPage" class="fade">
            <img src="${product.image}">
            <h2>${product.name}</h2>
            <p>${product.description || ""}</p>
            <div class="price">${product.price} сомони</div>
            <button class="btn" id="addBtn">Добавить в корзину</button>
        </div>
    `;

    document.getElementById("addBtn").onclick = () => {
        cart.push(product);
        tg.showPopup({ message: "Добавлено в корзину!" });
    };
}


/* === КОРЗИНА === */
function showCart() {
    title.innerText = "Корзина";

    if (cart.length === 0) {
        content.innerHTML = `<h3 style="text-align:center">Корзина пустая</h3>`;
        return;
    }

    let total = 0;
    let html = `<div class="fade" style="padding:10px">`;

    cart.forEach((p, i) => {
        total += p.price;
        html += `
            <div class="card" style="margin-bottom:10px">
                <h3>${p.name}</h3>
                <div class="price">${p.price} сом</div>
                <button class="btn" onclick="removeItem(${i})">Удалить</button>
            </div>
        `;
    });

    html += `
        <h3>Итого: ${total} сом</h3>

        <input id="full_name" placeholder="Имя" />
        <input id="phone" placeholder="Телефон" />

        <button class="btn" onclick="sendOrder()">Оформить</button>
    </div>
    `;

    content.innerHTML = html;
}

function removeItem(i) {
    cart.splice(i, 1);
    showCart();
}

function sendOrder() {
    const name = document.getElementById("full_name").value;
    const phone = document.getElementById("phone").value;

    if (!name || !phone) {
        tg.showPopup({ message: "Заполните имя и телефон" });
        return;
    }

    tg.sendData(JSON.stringify({
        action: "make_order",
        full_name: name,
        phone: phone,
        items: cart
    }));
}


/* === ПОЛУЧЕНИЕ ДАННЫХ ОТ БОТА === */
Telegram.WebApp.onEvent("message", (msg) => {
    try {
        const data = JSON.parse(msg);

        if (data.action === "categories") {
            categories = data.data;
            showCategories();
        }

        if (data.action === "products") {
            products = data.data;
        }

    } catch (e) {
        console.error("JSON error:", e);
    }
});


/* === КНОПКИ === */
backBtn.onclick = goBack;
cartBtn.onclick = () => navigateTo(showCart);


/* === ПЕРВЫЕ ЗАПРОСЫ === */
setTimeout(() => {
    tg.sendData(JSON.stringify({ action: "get_categories" }));
    tg.sendData(JSON.stringify({ action: "get_products" }));
    pageStack = [showCategories];
}, 300);
