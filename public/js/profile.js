document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Сначала войдите в аккаунт!");
        window.location.href = "login.html";
        return;
    }

    // Получаем данные о пользователе
    try {
        const res = await fetch("/profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Ошибка при получении профиля");

        const user = await res.json();
        document.getElementById("username").textContent = user.username;
        document.getElementById("email").textContent = user.email;
        document.getElementById("role").textContent = user.role === "admin" ? "👑 Админ" : "👤 Пользователь";

    } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        alert("Ошибка загрузки профиля");
    }

    // Выход из аккаунта
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        alert("Вы вышли!");
        window.location.href = "login.html";
    });

    // Обновление пароля
    document.getElementById("change-password").addEventListener("click", async () => {
        const newPassword = document.getElementById("new-password").value.trim();
        if (!newPassword) {
            alert("Введите новый пароль!");
            return;
        }

        try {
            const res = await fetch("/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });

            if (res.ok) {
                alert("Пароль обновлен!");
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Ошибка обновления пароля");
            }
        } catch (error) {
            console.error("Ошибка обновления пароля:", error);
            alert("Ошибка обновления пароля");
        }
    });
});
