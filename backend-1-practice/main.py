"""Учебная запись в салон. Запуск: python main.py."""
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Master:
    id: int
    name: str


@dataclass(frozen=True)
class Service:
    id: int
    title: str


@dataclass(frozen=True)
class Appoinment:  # Имя класса сохранено в точности из условия.
    id: int
    client_name: str
    master_id: int
    service_id: int
    time: str


masters = [Master(1, "Роман Соколов"), Master(2, "Елена Миронова")]
services = [Service(1, "Стрижка и укладка"), Service(2, "Уход за волосами")]
appointments: list[Appoinment] = []


def create_appointment(client_name, master_id, service_id, time):
    """Вернуть запись или None; ошибочные данные не меняют appointments."""
    if not isinstance(client_name, str) or not client_name.strip():
        return None
    if type(master_id) is not int or type(service_id) is not int:
        return None
    if not any(m.id == master_id for m in masters):
        return None
    if not any(s.id == service_id for s in services):
        return None
    if not isinstance(time, str) or len(time) != 5:
        return None
    try:
        parsed = datetime.strptime(time, "%H:%M").time()
    except ValueError:
        return None
    if time != parsed.strftime("%H:%M") or not "08:00" <= time <= "20:00":
        return None
    # len(appointments), а не len(appointment): считаем коллекцию записей.
    next_id = max((item.id for item in appointments), default=0) + 1
    result = Appoinment(next_id, client_name.strip(), master_id, service_id, time)
    appointments.append(result)
    return result


if __name__ == "__main__":
    create_appointment("Иванова", 1, 1, "10:00")
    create_appointment("Петрова", 2, 2, "11:00")
    print(f"Всего записей: {len(appointments)}")
    for appointment in appointments:
        print(appointment)
