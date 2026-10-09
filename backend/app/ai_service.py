import json
from huggingface_hub import InferenceClient
from pydantic import ValidationError
from app.config import settings
from app.schemas import PersonalizedQuest

def personalize_quest(quest, preferences: str = "") -> dict:
    """Returns safe personalized wording; always falls back to curated content."""
    fallback = {"title": quest.title, "description": quest.description, "creative_twist": None}
    if not settings.hf_token:
        return fallback
    prompt = f"""Personalize wording only for this approved outdoor quest. Do not change its task, safety rules, proof requirements, difficulty, or rewards. Do not invent activities. Return only JSON with title, description, creative_twist (string or null).
Quest title: {quest.title}
Quest description: {quest.description}
Proof criteria: {quest.proof_instructions}
Safety: {quest.safety_notes}
User preference: {preferences[:300]}"""
    try:
        client = InferenceClient(model=settings.hf_text_model, token=settings.hf_token, timeout=12)
        result = client.chat_completion(messages=[{"role":"user","content":prompt}], max_tokens=220, temperature=0.5)
        content = result.choices[0].message.content or ""
        start, end = content.find("{"), content.rfind("}")
        if start < 0 or end < start:
            return fallback
        parsed = PersonalizedQuest.model_validate(json.loads(content[start:end+1]))
        return {"title": parsed.title[:140], "description": parsed.description[:1000],
                "creative_twist": (parsed.creative_twist or "")[:300] or None}
    except (Exception, ValidationError):
        return fallback

def assess_image(image_path: str, quest) -> dict:
    """For this demo, the vision model is advisory and valid uploads are auto-approved unless clearly irrelevant."""
    if not settings.hf_token or not settings.hf_vision_model:
        return {"status":"approved", "reason":"Vision model is not configured; valid upload was auto-approved in this demo flow.", "relevance":"unknown"}
    try:
        client = InferenceClient(model=settings.hf_vision_model, token=settings.hf_token, timeout=20)
        answer = client.visual_question_answering(image=image_path, question=f"Does this image appear relevant to this quest: {quest.title}. Task: {quest.description}. Explain briefly.")
        text = str(answer)
        lower = text.lower()
        if any(word in lower for word in ("not relevant", "unrelated", "no, it")):
            return {"status":"rejected", "reason":text[:500], "relevance":"low"}
        return {"status":"approved", "reason":("Image appears relevant; auto-approved for this quest: " + text)[:500], "relevance":"high"}
    except Exception:
        return {"status":"approved", "reason":"Vision provider failed; valid upload was auto-approved in this demo flow.", "relevance":"unknown"}
