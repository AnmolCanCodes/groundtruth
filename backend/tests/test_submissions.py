from app.rewards import level_for_xp

def test_level_boundaries():
    assert level_for_xp(0) == 1
    assert level_for_xp(199) == 1
    assert level_for_xp(200) == 2
    assert level_for_xp(600) == 3
    assert level_for_xp(1200) == 4

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
