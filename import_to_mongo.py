import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

with open("shoqan_products.json", "r", encoding="utf-8") as f:
    try:
        raw_data = json.load(f)
        if not isinstance(raw_data, dict) or len(raw_data) == 0:
            raise ValueError("❌ Ошибка: JSON-файл пуст или имеет некорректный формат!")
    except json.JSONDecodeError:
        raise ValueError("❌ Ошибка: Некорректный JSON-файл!")

products = []
for category, items in raw_data.items():
    for product in items:
        product["category"] = category 
        products.append(product)

if len(products) == 0:
    raise ValueError("❌ Ошибка: Нет данных для загрузки!")

collection.delete_many({})  

collection.insert_many(products)

print(f"✅ {len(products)} товаров успешно загружены в MongoDB (коллекция '{COLLECTION_NAME}')!")
