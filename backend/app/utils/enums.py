from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class TaskStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"           # 填报中
    CLOSED = "closed"       # 填报已截止
    SCHEDULED = "scheduled" # 已排班
    PUBLISHED = "published" # 已发布


class PreferenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNAVAILABLE = "unavailable"
