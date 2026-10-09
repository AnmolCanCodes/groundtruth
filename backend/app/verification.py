import io, os, uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Quest, Submission, User
from app.ai_service import assess_image
from app.rewards import approve_submission

ALLOWED_FORMATS = {"JPEG":".jpg", "PNG":".png", "WEBP":".webp"}

async def save_valid_image(upload: UploadFile) -> str:
    max_bytes = settings.max_upload_mb * 1024 * 1024
    content = await upload.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Image exceeds {settings.max_upload_mb} MB limit.")
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.verify()
            fmt = img.format
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
    if fmt not in ALLOWED_FORMATS:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported.")
    upload_dir = Path(settings.upload_dir).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ALLOWED_FORMATS[fmt]}"
    destination = upload_dir / filename
    destination.write_bytes(content)
    return str(destination)

def create_submission(db: Session, user: User, quest_id: int, image_path: str, idempotency_key: str):
    existing = db.scalar(select(Submission).where(Submission.user_id == user.id, Submission.idempotency_key == idempotency_key))
    if existing:
        return existing
    quest = db.scalar(select(Quest).where(Quest.id == quest_id, Quest.is_active.is_(True)))
    if not quest:
        raise HTTPException(status_code=404, detail="Active quest not found.")
    # Clear repeat policy: one submission per user per quest per idempotency key;
    # distinct keys are allowed for repeat attempts.
    submission = Submission(user_id=user.id, quest_id=quest.id, image_path=image_path,
                            status="pending", verification_reason="Verification is running.",
                            idempotency_key=idempotency_key)
    db.add(submission)
    db.commit()
    db.refresh(submission)
    result = assess_image(image_path, quest)
    submission.verification_reason = result["reason"]
    if result["status"] == "rejected":
        submission.status = "rejected"
        from datetime import datetime, timezone
        submission.reviewed_at = datetime.now(timezone.utc)
    else:
        submission.status = "pending"
        submission.reviewed_at = None
        db.commit()
        db.refresh(submission)
        approve_submission(db, submission)
        db.refresh(submission)
        submission.verification_reason = result["reason"]
    db.commit()
    db.refresh(submission)
    return submission
