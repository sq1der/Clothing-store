document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const productContainer = document.getElementById("product-detail");

    if (!productId) {
        productContainer.innerHTML = "<p>❌ Товар не найден</p>";
        return;
    }

    try {
        const response = await fetch(`/products`);
        const products = await response.json();
        const product = products.find(p => p._id === productId);

        if (!product) {
            productContainer.innerHTML = "<p>❌ Товар не найден</p>";
            return;
        }

        productContainer.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}">
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <p><strong>${product.price}₸</strong></p>
            <button id="add-to-cart" data-id="${product._id}">🛒 Добавить в корзину</button>
        `;

        document.getElementById("add-to-cart").addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Сначала войдите в аккаунт!");
                window.location.href = "login.html";
                return;
            }

            const res = await fetch("/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    totalPrice: product.price,
                    imageUrl: product.images[0],
                    title: product.title
                })
            });

            if (res.ok) {
                alert("Товар добавлен в корзину!");
            } else {
                alert("Ошибка добавления в корзину");
            }
        });

    } catch (error) {
        console.error("Ошибка загрузки товара:", error);
    }
});
