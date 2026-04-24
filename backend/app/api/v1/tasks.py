from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.slot import Slot
from app.schemas.task import TaskCreate, TaskResponse, TaskDetailResponse, SlotResponse

router = APIRouter()


@router.post("/", response_model=TaskDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    task = Task(
        name=data.name,
        description=data.description,
        deadline=data.deadline,
        start_date=data.start_date,
        end_date=data.end_date,
        min_slots_per_member=data.min_slots_per_member,
        max_slots_per_member=data.max_slots_per_member,
        created_by=current_user.id,
        status="open",
    )
    db.add(task)
    await db.flush()

    for slot_data in data.slots:
        slot = Slot(
            task_id=task.id,
            date=slot_data.date,
            start_time=slot_data.start_time,
            end_time=slot_data.end_time,
            required_count=slot_data.required_count,
        )
        db.add(slot)

    await db.commit()
    await db.refresh(task)

    # Reload with slots
    result = await db.execute(
        select(Task).where(Task.id == task.id).options(selectinload(Task.slots))
    )
    return result.scalar_one()


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()))
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskDetailResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id).options(selectinload(Task.slots).order_by(Slot.date, Slot.start_time))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.post("/{task_id}/close")
async def close_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.status = "closed"
    await db.commit()
    return {"message": "Task closed successfully"}
