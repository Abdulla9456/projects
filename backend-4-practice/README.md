# Backend 4

Pydantic + FastAPI + SQLAlchemy: POST /services сохраняет услугу в SQLite и возвращает 201; ошибочные title/desc/duration/price возвращают 422. CategoryId должен существовать. Есть GET /services для проверки сохранения и счётчики категорий.

Python 3.10+. Перейдите в эту папку и выполните:

```sh
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Документация API: http://127.0.0.1:8000/docs . Для SQLite файлы базы создаются рядом с main.py; можно задать SALON_DATABASE_URL. Данные сохраняются после перезапуска.
