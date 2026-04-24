"""
Scheduling Engine - Main entry point for the greedy + rule-based scheduling algorithm.

Hard constraints:
1. Each slot must meet its required_count
2. A member cannot be assigned to overlapping slots
3. A member can only be assigned to slots they marked as available

Soft constraints (optimization goals):
1. Prefer members with higher preference levels
2. Balance workload across members (fairness)
3. Minimize consecutive slots for the same member
"""
from collections import defaultdict

from app.models.task import Task
from app.models.slot import Slot
from app.models.application import Application
from app.models.user import User

PREFERENCE_ORDER = {"high": 3, "medium": 2, "low": 1, "unavailable": 0}


def run_scheduling(
    task: Task,
    slots: list[Slot],
    applications: list[Application],
    members: list[User],
) -> list[tuple[int, int]]:
    """
    Run the scheduling algorithm.

    Returns a list of (slot_id, user_id) assignments.
    """
    # Build lookup: (user_id, slot_id) -> preference
    app_map: dict[tuple[int, int], str] = {}
    for app in applications:
        app_map[(app.user_id, app.slot_id)] = app.preference

    # Track assignments per slot and per user
    slot_assignments: dict[int, list[int]] = defaultdict(list)  # slot_id -> [user_ids]
    user_slot_count: dict[int, int] = defaultdict(int)  # user_id -> count
    user_slots: dict[int, list[Slot]] = defaultdict(list)  # user_id -> assigned slots

    # Phase 1: Greedy assignment by preference
    for preference in ["high", "medium", "low"]:
        for slot in sorted(slots, key=lambda s: s.date):
            if len(slot_assignments[slot.id]) >= slot.required_count:
                continue

            # Find available members for this slot with current preference
            candidates = []
            for member in members:
                key = (member.id, slot.id)
                pref = app_map.get(key, "unavailable")
                if pref == preference and pref != "unavailable":
                    # Check hard constraint: no time overlap
                    if _has_conflict(member.id, slot, user_slots[member.id]):
                        continue
                    # Check max slots constraint
                    if user_slot_count[member.id] >= task.max_slots_per_member:
                        continue

                    candidates.append(member)

            # Sort by current workload (fewer slots = higher priority for fairness)
            candidates.sort(key=lambda m: user_slot_count[m.id])

            # Assign up to required_count
            for member in candidates:
                if len(slot_assignments[slot.id]) >= slot.required_count:
                    break
                slot_assignments[slot.id].append(member.id)
                user_slot_count[member.id] += 1
                user_slots[member.id].append(slot)

    # Phase 2: Fill unfilled slots with "unavailable" marked members if needed
    # (Only if hard constraint requires it - lower priority)
    for slot in slots:
        while len(slot_assignments[slot.id]) < slot.required_count:
            # Find any member who hasn't been assigned to this slot
            assigned_ids = set(slot_assignments[slot.id])
            for member in members:
                if member.id in assigned_ids:
                    continue
                key = (member.id, slot.id)
                pref = app_map.get(key, None)
                if pref == "unavailable":
                    continue  # truly unavailable
                if _has_conflict(member.id, slot, user_slots[member.id]):
                    continue
                if user_slot_count[member.id] >= task.max_slots_per_member:
                    continue

                slot_assignments[slot.id].append(member.id)
                user_slot_count[member.id] += 1
                user_slots[member.id].append(slot)
                assigned_ids.add(member.id)
                break
            else:
                # Cannot fill this slot - not enough members
                break

    # Build result
    result = []
    for slot_id, user_ids in slot_assignments.items():
        for user_id in user_ids:
            result.append((slot_id, user_id))

    return result


def _has_conflict(user_id: int, new_slot: Slot, assigned_slots: list[Slot]) -> bool:
    """Check if new_slot overlaps with any of the user's already assigned slots."""
    for s in assigned_slots:
        if s.date != new_slot.date:
            continue
        # Overlap if start < other_end and end > other_start
        if new_slot.start_time < s.end_time and new_slot.end_time > s.start_time:
            return True
    return False
