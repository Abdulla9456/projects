from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class Category(BaseModel):
    id: int
    name: str
    servicesCount: int


categories = [
    Category(id=1, name="Стрижки и укладки", servicesCount=7),
    Category(id=2, name="Маникюр и педикюр", servicesCount=5),
    Category(id=3, name="Брови и ресницы", servicesCount=4),
    Category(id=4, name="Спа-процедуры", servicesCount=6),
]
category_by_id = {category.id: category for category in categories}
app = FastAPI(title="КОНТУР · Каталог категорий")


@app.get("/categories", response_model=list[Category])
def list_categories():
    return categories


@app.get("/categories/{id}", response_model=Category)
def get_category(id: int):
    category = category_by_id.get(id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
