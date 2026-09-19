"""
Notifications API Router — VyavaSahayam Real-Time Notification Center
======================================================================
Provides farmer, buyer, and consumer notification hubs with read tracking and direct action links.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.v1.deps import require_auth
from app.models.models import User, Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_user_notifications(
    notification_type: Optional[str] = None,
    unread_only: bool = False,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Lists notifications for the authenticated user."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if notification_type:
        query = query.filter(Notification.notification_type == notification_type.upper())

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    results = []
    for n in notifications:
        results.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "channel": n.channel,
            "reference_id": n.reference_id,
            "action_url": n.action_url,
            "data": n.data_json or {},
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        })

    return {
        "status": "success",
        "unread_count": unread_count,
        "total": len(results),
        "notifications": results,
    }


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Quick badge count of unread notifications for navbar."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"status": "success", "message": "Marked as read"}


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Marks all user notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
