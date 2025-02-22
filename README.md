# Clothing Store API

### Aman Belgibay 
### Nurpeiis Zulkash

## Overview
This project is a **Clothing Store API** built with **Node.js, Express, and MongoDB**. It provides user authentication, product management, and a shopping cart system.

## Features
- **User Authentication** (Signup, Login)
- **Product Management** (CRUD for clothing items)
- **Shopping Cart** (Add, Remove, View)
- **MongoDB Database** (via Mongoose ORM)
- **REST API** with JSON responses

---

## Project Structure
```
clothing-store/
│── public/             # Frontend assets (CSS, JS, HTML)
|   ├── css/
|   |   ├── styles.css
|   ├── js/
|   |   ├── admin.js
|   |   ├── cart.js
|   |   ├── login.js
|   |   ├── product.js
|   |   ├── profile.js
|   |   ├── register.js
|   |   ├── script.js
|   ├── admin.html
|   ├── cart.html
|   ├── index.html
|   ├── login.html
|   ├── product.html
|   ├── profile.html
|   ├── register.html
│── node_modules/       # Dependencies
│── get_data.py         # Getting data from web-site
│── import_to_mongo.py  # Import data to MongoDB      
│── server.js           # Main Express server
│── package.json        # Dependencies and scripts
│── package-lock.json   # Dependency lock file
│── .env                # Environment variables (ignored in Git)
│── .gitignore          # Git ignore file
│── .gitattributes
│── shoqan_products.json 
```

---

## Database Structure
The project uses **MongoDB** with the following collections:

### **Users Collection (`users`):**
```json
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "password": String,  // Hashed password
  "role": String   //Admin or user
}
```

### **Products Collection (`products`):**
```json
{
  "_id": ObjectId,
  "category": String,
  "title": String,
  "description": String,
  "price": String,  // Format: "XXX XXXKZT"
  "link": String,   // Product page URL
  "images": Array 
}
```

### **Cart Collection (`carts`):**
```json
{
  "_id": ObjectId,
  "userId": ObjectId,  // Reference to Users Collection
  "productId": ObjectId, // Reference to Products Collection
  "totalPrice": String,
  "imageUrl": String,
  "title": String
}
```

---

## Setup & Installation
### Clone Repository
```sh
git clone https://github.com/sq1der/Clothing-store.git
cd Clothing-store
```

### Install Dependencies
```sh
npm install
```

### Run the Server
```sh
node server.js
```

---

## API Endpoints
### User Authentication
| Method | Endpoint       | Description         |
|--------|--------------|---------------------|
| POST   | `/register`   | Register a new user |
| POST   | `/login`      | Log in a user       |

### Product Management
| Method | Endpoint     | Description         |
|--------|-------------|---------------------|
| GET    | `/products`    | Fetch all products  |
| POST   | `/products`    | Add a new product   |
| PUT    | `/product/:id` | Update a product    |
| DELETE | `/product/:id` | Remove a product    |

### Cart Management
| Method | Endpoint         | Description          |
|--------|----------------|----------------------|
| POST   | `/cart`         | Add product to cart      |
| GET    | `/cart`         | View user's cart         |
| DELETE | `/cart/:id`     | Remove product from cart |

---

## License
This project is licensed under the **MIT License**.

---


