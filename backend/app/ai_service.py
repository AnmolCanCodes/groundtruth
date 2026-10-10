import json
from huggingface_hub import InferenceClient
from pydantic import ValidationError
from app.config import settings
from app.schemas import PersonalizedQuest


def _text_client():
    token = (settings.hf_token or "").strip()
    model = (settings.hf_text_model or "").strip()
    if not token or not model:
        return None
    return InferenceClient(model=model, token=token, timeout=30)


def _vision_client():
    token = (settings.hf_token or "").strip()
    model = (settings.hf_vision_model or "").strip()
    if not token or not model:
        return None
    return InferenceClient(model=model, token=token, timeout=30)


def personalize_quest(quest, preferences: str = "") -> dict:
    """Use the configured LLM to personalize quest wording when available."""
    fallback = {"title": quest.title, "description": quest.description, "creative_twist": None}
    client = _text_client()
    if client is None:
        return fallback

    prompt = f"""Personalize wording only for this approved outdoor quest. Do not change its task, safety rules, proof requirements, difficulty, or rewards. Do not invent activities. Return only JSON with title, description, creative_twist (string or null).
Quest title: {quest.title}
Quest description: {quest.description}
Proof criteria: {quest.proof_instructions}
Safety: {quest.safety_notes}
User preference: {preferences[:300]}"""
    try:
        try:
            result = client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                max_tokens=220,
                temperature=0.5,
            )
            content = result.choices[0].message.content or ""
        except Exception:
            content = client.text_generation(
                prompt,
                max_new_tokens=220,
                temperature=0.5,
                do_sample=True,
            )

        start, end = content.find("{"), content.rfind("}")
        if start < 0 or end < start:
            return fallback
        parsed = PersonalizedQuest.model_validate(json.loads(content[start : end + 1]))
        return {
            "title": parsed.title[:140],
            "description": parsed.description[:1000],
            "creative_twist": (parsed.creative_twist or "")[:300] or None,
        }
    except (Exception, ValidationError):
        return fallback


def assess_image(image_path: str, quest) -> dict:
    """Use the configured vision model when available; otherwise fall back to the safe demo behavior."""
    client = _vision_client()
    if client is None:
        return {
            "status": "approved",
            "reason": "Vision model is not configured; valid upload was auto-approved in this demo flow.",
            "relevance": "unknown",
        }

    question = (
        f"Does this image appear relevant to this quest: {quest.title}. "
        f"Task: {quest.description}. Explain briefly."
    )
    try:
        try:
            answer = client.visual_question_answering(image=image_path, question=question)
        except Exception:
            answer = client.image_to_text(image=image_path, prompt=question)

        text = str(answer)
        lower = text.lower()
        if any(word in lower for word in ("not relevant", "unrelated", "no, it")):
            return {"status": "rejected", "reason": text[:500], "relevance": "low"}
        return {
            "status": "approved",
            "reason": ("Image appears relevant; auto-approved for this quest: " + text)[:500],
            "relevance": "high",
        }
    except Exception:
        return {
            "status": "approved",
            "reason": "Vision model failed during validation; valid upload was auto-approved in this demo flow.",
            "relevance": "unknown",
        }
