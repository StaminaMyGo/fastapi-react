from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.slot import Slot
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationBatchCreate, ApplicationResponse

router = APIRouter()


@router.post("/batch", response_model=list[ApplicationResponse])
async def submit_applications(
    data: ApplicationBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.applications:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No applications provided")

    # Verify all slots belong to the same open task
    slot_ids = [a.slot_id for a in data.applications]
    slots_result = await db.execute(select(Slot).where(Slot.id.in_(slot_ids)))
    slots = slots_result.scalars().all()

    if len(slots) != len(slot_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slot IDs")

    # Check task is open
    task_id = slots[0].task_id
    task_result = await db.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()

    if not task or task.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task is not open for applications")

    if datetime.now(timezone.utc) > task.deadline:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application deadline has passed")

    # Delete old applications for this user + task
    task_slot_ids = [s.id for s in slots]
    await db.execute(
        delete(Application).where(
            Application.user_id == current_user.id,
            Application.slot_id.in_(task_slot_ids),
        )
    )

    # Insert new applications
    applications = []
    for app_data in data.applications:
        app = Application(
            user_id=current_user.id,
            slot_id=app_data.slot_id,
            preference=app_data.preference,
        )
        db.add(app)
        applications.append(app)

    await db.commit()
    for app in applications:
        await db.refresh(app)

    return applications


@router.get("/task/{task_id}", response_model=list[ApplicationResponse])
async def get_my_applications(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application).where(
            Application.user_id == current_user.id,
            Application.slot_id.in_(
                select(Slot.id).where(Slot.task_id == task_id)
            ),
        )
    )
    return result.scalars().all()
