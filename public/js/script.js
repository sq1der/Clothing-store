document.addEventListener("DOMContentLoaded", async () => {
    const productsContainer = document.getElementById("products");

    // Проверяем токен для обновления UI
    const token = localStorage.getItem("token");
    const authLink = document.getElementById("auth-link");

    if (token) {
        authLink.textContent = "🚪 Выйти";
        authLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            window.location.reload();
        });
    }

    // Получаем товары с сервера
    try {
        const response = await fetch("/products");
        const products = await response.json();

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img class="product-img" src="${product.images[0]}" alt="${product.title}">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price}₸</p>
                <a href="product.html?id=${product._id}">🔍 Подробнее</a>
                <button data-id="${product._id}" class="add-to-cart">🛒 В корзину</button>
            `;

            productsContainer.appendChild(productCard);
        });

        // Добавляем обработчики для кнопок "В корзину"
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", async (event) => {
                if (!token) {
                    alert("Сначала войдите в аккаунт!");
                    window.location.href = "login.html";
                    return;
                }
        
                const productCard = event.target.closest(".product-card");
        
                if (!productCard) {
                    console.error("Карточка товара не найдена!");
                    return;
                }
        
                // Ищем элементы внутри карточки
                const productId = event.target.dataset.id;
                const titleElement = productCard.querySelector(".product-title");
                const priceElement = productCard.querySelector(".product-price");
                const imageElement = productCard.querySelector(".product-img");
        
                if (!titleElement || !priceElement || !imageElement) {
                    console.error("Ошибка: отсутствуют данные о товаре!", { productId, titleElement, priceElement, imageElement });
                    alert("Ошибка: данные о товаре не найдены!");
                    return;
                }
        
                const title = titleElement.textContent.trim();
                const price = priceElement.textContent.replace("₸", "").trim();
                const imageUrl = imageElement.src;
        
                console.log("Отправляем в корзину:", { productId, title, price, imageUrl });
        
                const res = await fetch("/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId,
                        totalPrice: price,
                        imageUrl,
                        title
                    })
                });
        
                if (res.ok) {
                    alert("Товар добавлен в корзину!");
                } else {
                    alert("Ошибка добавления в корзину");
                    const errorData = await res.json();
                    console.error("Ошибка сервера:", errorData);
                }
            });
        });
        
        
        

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("auth-link");
    const token = localStorage.getItem("token");

    if (token) {
        authLink.textContent = "🚪 Выйти";
        authLink.href = "#";
        authLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            alert("Вы вышли!");
            window.location.href = "index.html";
        });
    }
});

