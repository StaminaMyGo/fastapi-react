from datetime import datetime
from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    slot_id: int
    preference: str = "medium"  # high, medium, low, unavailable


class ApplicationBatchCreate(BaseModel):
    applications: list[ApplicationCreate]


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    preference: str
    created_at: datetime

    model_config = {"from_attributes": True}
