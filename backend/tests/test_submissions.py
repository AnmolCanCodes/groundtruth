from app.rewards import approve_submission, level_for_xp
from app.models import Quest, Submission, User
from app.database import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


def test_level_boundaries():
    assert level_for_xp(0) == 1
    assert level_for_xp(199) == 1
    assert level_for_xp(200) == 2
    assert level_for_xp(600) == 3
    assert level_for_xp(1200) == 4


def test_valid_submission_is_auto_approved_when_vision_is_unconfigured():
    from types import SimpleNamespace
    from app.ai_service import assess_image
    from app.config import settings

    original_token = settings.hf_token
    original_model = settings.hf_vision_model
    settings.hf_token = None
    settings.hf_vision_model = ""
    try:
        quest = SimpleNamespace(title="Find colors", description="Find colors outside")
        result = assess_image("/tmp/demo.jpg", quest)
        assert result["status"] == "approved"
        assert "auto-approved" in result["reason"].lower()
    finally:
        settings.hf_token = original_token
        settings.hf_vision_model = original_model


def test_submission_requires_auth(client):
    assert client.get("/api/submissions/me").status_code == 401


def test_ai_fallback_shape():
    from types import SimpleNamespace
    from app.ai_service import personalize_quest
    from app.config import settings
    old = settings.hf_token
    settings.hf_token = None
    quest = SimpleNamespace(title="Find colors", description="Find colors outside", proof_instructions="Photo", safety_notes="Stay safe")
    result = personalize_quest(quest)
    assert result["title"] == quest.title
    settings.hf_token = old
