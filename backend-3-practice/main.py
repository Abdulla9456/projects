"""Мастера хранятся в SQLite, а не в списке обработчика API."""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
import os

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


class Master(Base):
    __tablename__ = "masters"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    specialization: Mapped[str]


class MasterView(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    specialization: str


def create_app(database_url=None):
    default_file = Path(__file__).with_name("masters.sqlite3")
    engine = create_engine(database_url or os.getenv("SALON_DATABASE_URL")
                           or f"sqlite:///{default_file.as_posix()}",
                           connect_args={"check_same_thread": False})

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
        with Session(engine) as session:
            initial = [(1, "Роман Соколов", "Парикмахер"),
                       (2, "Елена Миронова", "Парикмахер"),
                       (3, "Виктория Лебедева", "Мастер маникюра")]
            for identity, name, specialization in initial:
                if session.get(Master, identity) is None:
                    session.add(Master(id=identity, name=name,
                                       specialization=specialization))
            session.commit()
        yield
        engine.dispose()

    app = FastAPI(title="КОНТУР · Мастера", lifespan=lifespan)

    def database():
        with Session(engine) as session:
            yield session

    Database = Annotated[Session, Depends(database)]

    @app.get("/masters", response_model=list[MasterView])
    def list_masters(session: Database, specialization: str | None = None):
        query = select(Master).order_by(Master.id)
        if specialization is not None:
            query = query.where(Master.specialization == specialization)
        return list(session.scalars(query))

    @app.get("/masters/{id}", response_model=MasterView)
    def get_master(id: int, session: Database):
        master = session.get(Master, id)
        if master is None:
            raise HTTPException(status_code=404, detail="Master not found")
        return master

    return app


app = create_app()
