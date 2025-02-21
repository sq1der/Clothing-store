document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Доступ запрещен! Войдите как админ.");
        window.location.href = "login.html";
        return;
    }

    // Проверяем роль
    const res = await fetch("/profile", { headers: { Authorization: `Bearer ${token}` } });
    const user = await res.json();
    if (user.role !== "admin") {
        alert("У вас нет доступа!");
        window.location.href = "index.html";
        return;
    }

    // 📌 Функция загрузки товаров
    async function loadProducts() {
        const res = await fetch("/products");
        const products = await res.json();
        const tbody = document.querySelector("#products-table tbody");
        tbody.innerHTML = "";

        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.title}</td>
                <td>${product.price}₸</td>
                <td>
                    <button class="edit-btn" data-id="${product._id}">✏️ Редактировать</button>
                    <button class="delete-btn" data-id="${product._id}">🗑 Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // 🗑 Обработчик удаления
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const productId = button.dataset.id;
                if (confirm("Удалить этот товар?")) {
                    await fetch(`/products/${productId}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    loadProducts();
                }
            });
        });

        // ✏️ Обработчик редактирования
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const productId = button.dataset.id;
                
                // Получаем текущие данные товара
                const product = products.find(p => p._id === productId);
                if (!product) return alert("Ошибка: товар не найден!");

                // Спрашиваем новые данные
                const newTitle = prompt("Новое название товара:", product.title);
                const newPrice = prompt("Новая цена:", product.price);
                const newCategory = prompt("Новая категория:", product.category);
                const newDescription = prompt("Новое описание:", product.description);
                const newLink = prompt("Новая ссылка на товар:", product.link);
                const newImageUrl = prompt("Новая картинка (URL):", product.images[0]);

                if (!newTitle || !newPrice || !newCategory || !newDescription || !newLink || !newImageUrl) {
                    alert("Заполните все поля!");
                    return;
                }

                const updatedProduct = {
                    category: newCategory,
                    title: newTitle,
                    description: newDescription,
                    price: newPrice,
                    link: newLink,
                    images: [newImageUrl]
                };

                console.log("Отправляем обновленные данные:", updatedProduct);

                // Отправляем обновленные данные на сервер
                const res = await fetch(`/products/${productId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedProduct)
                });

                if (res.ok) {
                    alert("Товар успешно обновлен!");
                    loadProducts();
                } else {
                    const errorData = await res.json();
                    console.error("Ошибка при обновлении товара:", errorData);
                    alert("Ошибка при обновлении товара!");
                }
            });
        });
    }

    // 📌 Функция добавления товара
    document.getElementById("add-product-btn").addEventListener("click", async () => {
        const title = prompt("Введите название товара:");
        const price = prompt("Введите цену товара:");
        const category = prompt("Введите категорию товара:");
        const description = prompt("Введите описание товара:");
        const link = prompt("Введите ссылку на товар:");
        const imageUrl = prompt("Введите ссылку на картинку товара:");

        if (!title || !price || !category || !description || !link || !imageUrl) {
            alert("Заполните все поля!");
            return;
        }

        const productData = {
            category,
            title,
            description,
            price,
            link,
            images: [imageUrl]
        };

        console.log("Отправляем товар:", productData);

        const res = await fetch("/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            alert("Товар добавлен!");
            loadProducts();
        } else {
            const errorData = await res.json();
            console.error("Ошибка при добавлении товара:", errorData);
            alert("Ошибка при добавлении товара!");
        }
    });

    // 📌 Выход из админки
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    // Загружаем товары
    loadProducts();
});
