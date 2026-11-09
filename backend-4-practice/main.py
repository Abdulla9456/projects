from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
import os

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from sqlalchemy import ForeignKey, create_engine, event, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]


class Service(Base):
    __tablename__ = "services"
    id: Mapped[int] = mapped_column(primary_key=True)
    categoryId: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    title: Mapped[str]
    desc: Mapped[str]
    duration: Mapped[int]
    price: Mapped[float]


ShortText = Annotated[str, StringConstraints(strip_whitespace=True,
                                             min_length=1, max_length=100)]


class ServiceCreate(BaseModel):
    categoryId: int = Field(gt=0, strict=True)
    title: ShortText
    desc: ShortText
    duration: int = Field(ge=30, le=180, strict=True)
    price: float = Field(gt=0, allow_inf_nan=False)


class ServiceView(ServiceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CategoryView(BaseModel):
    id: int
    name: str
    servicesCount: int


def create_app(database_url=None):
    default_file = Path(__file__).with_name("catalog.sqlite3")
    engine = create_engine(database_url or os.getenv("SALON_DATABASE_URL")
                           or f"sqlite:///{default_file.as_posix()}",
                           connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
        with Session(engine) as session:
            names = ["Стрижки и укладки", "Маникюр и педикюр",
                     "Брови и ресницы", "Спа-процедуры"]
            for identity, name in enumerate(names, 1):
                if session.get(Category, identity) is None:
                    session.add(Category(id=identity, name=name))
            session.commit()
        yield
        engine.dispose()

    app = FastAPI(title="КОНТУР · Услуги и валидация", lifespan=lifespan)

    def database():
        with Session(engine) as session:
            yield session

    Database = Annotated[Session, Depends(database)]

    def category_data(category, session):
        count = session.scalar(select(func.count()).select_from(Service)
                               .where(Service.categoryId == category.id))
        return {"id": category.id, "name": category.name, "servicesCount": count}

    @app.get("/categories", response_model=list[CategoryView])
    def list_categories(session: Database):
        return [category_data(c, session) for c in
                session.scalars(select(Category).order_by(Category.id))]

    @app.get("/categories/{id}", response_model=CategoryView)
    def get_category(id: int, session: Database):
        category = session.get(Category, id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        return category_data(category, session)

    @app.get("/services", response_model=list[ServiceView])
    def list_services(session: Database):
        return list(session.scalars(select(Service).order_by(Service.id)))

    @app.post("/services", response_model=ServiceView,
              status_code=status.HTTP_201_CREATED)
    def create_service(body: ServiceCreate, session: Database):
        if session.get(Category, body.categoryId) is None:
            raise HTTPException(status_code=404, detail="Category not found")
        service = Service(**body.model_dump())
        session.add(service)
        session.commit()
        session.refresh(service)
        return service

    return app


app = create_app()
