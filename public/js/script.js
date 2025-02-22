document.addEventListener("DOMContentLoaded", async () => {
    const productsContainer = document.getElementById("products");
    const categoryFilter = document.getElementById("category-filter");
    const authLink = document.getElementById("auth-link");

    let allProducts = [];
    const token = localStorage.getItem("token");

    // Обновляем UI для авторизованных пользователей
    if (token) {
        authLink.textContent = "🚪 Выйти";
        authLink.addEventListener("click", () => {
            localStorage.clear();
            window.location.reload();
        });
    }

    // Загружаем товары и категории
    async function loadProducts() {
        try {
            const res = await fetch("/products");
            allProducts = await res.json();
            displayProducts(allProducts);
            loadCategories();
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
        }
    }

    // Отображение товаров
    function displayProducts(products) {
        productsContainer.innerHTML = "";

        if (products.length === 0) {
            productsContainer.innerHTML = "<p>Товары не найдены</p>";
            return;
        }

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

        attachCartHandlers();
    }

    // Загружаем категории и добавляем в фильтр
    function loadCategories() {
        const categories = [...new Set(allProducts.map(p => p.category))]; // Получаем уникальные категории
        categoryFilter.innerHTML = '<option value="all">Все категории</option>';

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Фильтрация товаров по категории
    categoryFilter.addEventListener("change", () => {
        const selectedCategory = categoryFilter.value;
        const filteredProducts = selectedCategory === "all" 
            ? allProducts 
            : allProducts.filter(product => product.category === selectedCategory);
        
        displayProducts(filteredProducts);
    });

    // Добавляем обработчики на кнопки "В корзину"
    function attachCartHandlers() {
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", async (event) => {
                if (!token) {
                    alert("Сначала войдите в аккаунт!");
                    window.location.href = "login.html";
                    return;
                }

                const productCard = event.target.closest(".product-card");
                if (!productCard) return;

                const productId = event.target.dataset.id;
                const title = productCard.querySelector(".product-title").textContent.trim();
                const price = productCard.querySelector(".product-price").textContent.replace("₸", "").trim();
                const imageUrl = productCard.querySelector(".product-img").src;

                console.log("Добавляем в корзину:", { productId, title, price, imageUrl });

                const res = await fetch("/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId, totalPrice: price, imageUrl, title })
                });

                if (res.ok) {
                    alert("Товар добавлен в корзину!");
                } else {
                    const errorData = await res.json();
                    console.error("Ошибка сервера:", errorData);
                    alert("Ошибка добавления в корзину");
                }
            });
        });
    }

    loadProducts();
});
