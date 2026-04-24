from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.slot import Slot
from app.models.application import Application
from app.models.assignment import Assignment
from app.services.scheduling.engine import run_scheduling
from app.schemas.assignment import ScheduleResultResponse, AssignmentResponse

router = APIRouter()


@router.post("/run/{task_id}", response_model=ScheduleResultResponse)
async def execute_schedule(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    task_result = await db.execute(
        select(Task).where(Task.id == task_id).options(selectinload(Task.slots))
    )
    task = task_result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if task.status not in ("closed", "open"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task is not ready for scheduling")

    slot_ids = [s.id for s in task.slots]
    apps_result = await db.execute(
        select(Application).where(Application.slot_id.in_(slot_ids))
    )
    applications = apps_result.scalars().all()

    members_result = await db.execute(
        select(User).where(User.role == "member", User.status == "approved")
    )
    members = members_result.scalars().all()

    assignments = run_scheduling(task, list(task.slots), applications, members)

    # Clear old assignments
    old = await db.execute(select(Assignment).where(Assignment.task_id == task_id))
    for a in old.scalars().all():
        await db.delete(a)

    for slot_id, user_id in assignments:
        assignment = Assignment(
            task_id=task_id,
            slot_id=slot_id,
            user_id=user_id,
            is_manual=False,
        )
        db.add(assignment)

    task.status = "scheduled"
    await db.commit()

    return await _build_schedule_result(task_id, db)


@router.get("/result/{task_id}", response_model=ScheduleResultResponse)
async def get_schedule_result(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await _build_schedule_result(task_id, db)


@router.post("/publish/{task_id}")
async def publish_schedule(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.status = "published"
    await db.commit()
    return {"message": "Schedule published successfully"}


async def _build_schedule_result(task_id: int, db: AsyncSession) -> ScheduleResultResponse:
    result = await db.execute(
        select(Assignment).where(Assignment.task_id == task_id)
    )
    assignments = result.scalars().all()

    assignment_responses = []
    for a in assignments:
        user_result = await db.execute(select(User).where(User.id == a.user_id))
        user = user_result.scalar_one()

        slot_result = await db.execute(select(Slot).where(Slot.id == a.slot_id))
        slot = slot_result.scalar_one()

        assignment_responses.append(AssignmentResponse(
            id=a.id,
            task_id=a.task_id,
            slot_id=a.slot_id,
            user_id=a.user_id,
            user_name=user.name,
            slot_date=str(slot.date),
            slot_time=f"{slot.start_time}-{slot.end_time}",
            is_manual=a.is_manual,
        ))

    return ScheduleResultResponse(
        task_id=task_id,
        assignments=assignment_responses,
        stats={"total": len(assignments)},
    )
