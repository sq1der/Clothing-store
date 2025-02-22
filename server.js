require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Подключение к базе данных
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database connected successfully"))
    .catch(err => console.error("❌ Database connection failed:", err));

// 📌 Модель пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// 📌 Модель товара
const Product = mongoose.model(
    "products", // ВАЖНО! Имя должно совпадать с названием существующей коллекции
    new mongoose.Schema(
      {
        category: String,
        title: String,
        description: String,
        price: String,
        link: String,
        images: [String],
      },
      { collection: "products" } // Обязательно указываем существующую коллекцию
    )
  );

// 📌 Модель корзины
const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
    totalPrice: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    imageUrl: { type: String, required: true },
    title: { type: String, required: true }
}, { timestamps: true });

const Cart = mongoose.model("Cart", CartSchema);

// 🔹 Мидлвар для аутентификации
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized access" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
    }
}

// 🔹 Проверка прав администратора
function checkAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access restricted to administrators" });
    }
    next();
}

// 📌 Регистрация пользователя
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
        const newUser = new User({ username, email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// 📌 Авторизация
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, role: user.role, userId: user._id });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// 📌 Получение товаров
app.get("/products", async (req, res) => {
    const category = req.query.category;  // Получаем параметр категории из запроса
    try {
        let products;
        if (category && category !== 'all') {
            products = await Product.find({ category });
        } else {
            products = await Product.find();
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении товаров" });
    }
});


app.post("/products", verifyToken, checkAdmin,  async (req, res) => {
  const { category, title, description, price, link, images } = req.body;
  if (!category || !title || !description || !price || !link || !images) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const newProduct = new Product({ category, title, description, price, link, images });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Ошибка при создании товара" });
  }
});

app.put("/products/:id", verifyToken, checkAdmin, async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ error: "Товар не найден" });
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ error: "Ошибка при обновлении товара" });
    }
  });

// 📌 Удаление товара (только админ)
app.delete("/products/:id", verifyToken, checkAdmin, async (req, res) => {  
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ error: "Товар не найден" });
      }
      res.json({ message: "Товар удален" });
    } catch (err) {
      res.status(500).json({ error: "Ошибка при удалении товара" });
    }
  });
// 📌 Добавление товара в корзину
app.post("/cart", verifyToken, async (req, res) => {
    try {
        const { productId, totalPrice, imageUrl, title } = req.body;
        if (!productId || !totalPrice || !imageUrl || !title) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newCartItem = new Cart({
            userId: req.user.id,
            productId,
            totalPrice,
            imageUrl,
            title
        });

        await newCartItem.save();
        res.status(201).json(newCartItem);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

// 📌 Получение корзины пользователя
app.get("/cart", verifyToken, async (req, res) => {
    try {
        const cartItems = await Cart.find({ userId: req.user.id }).populate("productId").lean();
        res.json(cartItems);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ error: "Failed to retrieve cart items" });
    }
});

// 📌 Удаление товара из корзины
app.delete("/cart/:id", verifyToken, async (req, res) => {
    try {
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ error: "Item not found in cart" });

        res.json({ message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ error: "Failed to delete item from cart" });
    }
});

// 📌 Очистка корзины
app.delete("/cart", verifyToken, async (req, res) => {
    try {
        await Cart.deleteMany({ userId: req.user.id });
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ error: "Failed to clear cart" });
    }
});

app.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ error: "Пользователь не найден" });

        res.json(user);
    } catch (error) {
        console.error("Ошибка получения профиля:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
