const tg = window.Telegram.WebApp;
tg.expand();

let products = [];  
let cart = [];

// Тестовые товары (потом будут загружаться через бота)
products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        desc: "Флагманский смартфон с A17 Pro",
        price: "89 990 ₽",
        image: "images/iphone.jpg"
    },
    {
        id: 2,
        name: "AirPods Pro 2",
        desc: "Беспроводные наушники с ANC",
        price: "24 990 ₽",
        image: "images/airpods.jpg"
    },
    {
        id: 3,
        name: "MacBook Pro 14''",
        desc: "Мощный ноутбук для профи",
        price: "149 990 ₽",
        image: "images/macbook.jpg"
    },
    {
        id: 4,
        name: "Apple Watch Ultra 2",
        desc: "Умные часы для спорта",
        price: "69 990 ₽",
        image: "images/watch.jpg"
    }
];

renderProducts();

function renderProducts() {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${p.image}">
            <div class="product-info">
                <div class="product-title">${p.name}</div>
                <div class="product-desc">${p.desc}</div>
            </div>

            <div class="product-bottom">
                <div class="product-price">${p.price}</div>
                <button class="add-btn" onclick="addToCart(${p.id})">+</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    tg.showPopup({ message: `${product.name} добавлен в корзину!` });
}
