from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class SlotCreate(BaseModel):
    date: date
    start_time: str  # "HH:MM"
    end_time: str    # "HH:MM"
    required_count: int = 1


class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: datetime
    start_date: date
    end_date: date
    min_slots_per_member: int = 1
    max_slots_per_member: int = 5
    slots: list[SlotCreate]


class TaskResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    deadline: datetime
    start_date: date
    end_date: date
    min_slots_per_member: int
    max_slots_per_member: int
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskDetailResponse(TaskResponse):
    slots: list["SlotResponse"] = []


class SlotResponse(BaseModel):
    id: int
    task_id: int
    date: date
    start_time: str
    end_time: str
    required_count: int

    model_config = {"from_attributes": True}
