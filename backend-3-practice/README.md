# Backend 3

SQLAlchemy + SQLite: список мастеров, фильтрация по specialization, получение по ID и 404. Схема и начальные данные создаются при старте, повторный запуск не дублирует мастеров.

Python 3.10+. Перейдите в эту папку и выполните:

```sh
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Документация API: http://127.0.0.1:8000/docs . Для SQLite файлы базы создаются рядом с main.py; можно задать SALON_DATABASE_URL. Данные сохраняются после перезапуска.
