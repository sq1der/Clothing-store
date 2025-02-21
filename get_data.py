import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://shoqansuits.com"
HEADERS = {"User-Agent": "Mozilla/5.0"}

CATEGORIES = {
    "Suits": "/men/category/a0e15e94-7dbc-4148-838b-977d38b95630",
    "Jackets": "/men/category/486072a7-3450-46d2-94fa-eb0a547b662a",
    "Shirts and shirts": "/men/category/453c4247-72d3-4dd5-a789-96eb07a05756",
    "Trousers": "/men/category/a370f35b-0fe6-4233-995a-8403276d8399",
    "Polo": "/men/category/f140ecca-4bc9-40ad-8989-fbea87fcf62f",
    "Knitwear": "/men/category/50dbc701-7f50-4ae4-8f50-cc62f5374e05",
    "Coats": "/men/category/6e648e43-7309-4133-87a5-015b7c2d80a8",
    "Jackets": "/men/category/69505c74-8542-48f6-971c-c9dd8cde973f",
    "Turtlenecks": "/men/category/77dcb296-bdd9-4a76-9a34-792960ab18fd",
}

def get_soup(url):
    """Получает HTML-код страницы и создает объект BeautifulSoup"""
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")

def get_products(category_url, category_name, limit=20):
    """Собирает данные о товарах в указанной категории (макс. 20 товаров)"""
    soup = get_soup(category_url)
    products = []

    for card in soup.select("li.card.catalog__item")[:limit]:
        title = card.select_one("h2.card__title")
        description = card.select_one("p.card__text")
        price = card.select_one("p.card__price")
        link = card.select_one("a.card__link")

        title = title.get_text(strip=True) if title else "Без названия"
        description = description.get_text(strip=True) if description else "Нет описания"
        price = price.get_text(strip=True) if price else "Цена не указана"
        link = BASE_URL + link["href"] if link else "Нет ссылки"

        images = []
        for img in card.select("img.card__img"):
            img_src = img.get("src")
            if img_src:
                images.append(BASE_URL + img_src)

        products.append({
            "category": category_name,
            "title": title,
            "description": description,
            "price": price,
            "link": link,
            "images": images
        })

    return products

def main():
    all_products = {}

    for category_name, category_path in CATEGORIES.items():
        category_url = BASE_URL + category_path
        print(f"📡 Сканируем категорию: {category_name} - {category_url}")
        products = get_products(category_url, category_name, limit=20) 
        all_products[category_name] = products

    with open("shoqan_products.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=4)

    print("🎉 Данные успешно сохранены в 'shoqan_products.json'!")

if __name__ == "__main__":
    main()
