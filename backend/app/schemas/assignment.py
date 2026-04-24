from datetime import datetime
from pydantic import BaseModel


class AssignmentResponse(BaseModel):
    id: int
    task_id: int
    slot_id: int
    user_id: int
    user_name: str = ""
    slot_date: str = ""
    slot_time: str = ""
    is_manual: bool

    model_config = {"from_attributes": True}


class ScheduleResultResponse(BaseModel):
    task_id: int
    assignments: list[AssignmentResponse]
    stats: dict = {}
