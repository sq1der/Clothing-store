document.addEventListener("DOMContentLoaded", async () => {
    const cartContainer = document.getElementById("cart-items");
    const clearCartButton = document.getElementById("clear-cart");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Сначала войдите в аккаунт!");
        window.location.href = "login.html";
        return;
    }

    // Загрузка товаров в корзине
    try {
        const response = await fetch("/cart", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cartItems = await response.json();

        if (cartItems.length === 0) {
            cartContainer.innerHTML = "<p>Корзина пуста 😢</p>";
            return;
        }
        
        cartItems.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <p>${item.title}</p>
                <p><strong>${item.totalPrice}₸</strong></p>
                <button data-id="${item._id}" class="remove-from-cart">❌</button>
            `;
            cartContainer.appendChild(cartItem);
        });

        // Удаление товара из корзины
        document.querySelectorAll(".remove-from-cart").forEach(button => {
            button.addEventListener("click", async (event) => {
                const itemId = event.target.dataset.id;
                await fetch(`/cart/${itemId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Товар удален!");
                window.location.reload();
            });
        });

    } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
    }

    // Очистка корзины
    clearCartButton.addEventListener("click", async () => {
        if (!confirm("Вы уверены, что хотите очистить корзину?")) return;

        await fetch("/cart", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        alert("Корзина очищена!");
        window.location.reload();
    });
});
