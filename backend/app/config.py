from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "GroundTruth API"
    database_url: str = "sqlite:///./groundtruth.db"
    hf_token: str | None = None
    hf_text_model: str = "google/gemma-2-2b-it"
    hf_vision_model: str = ""
    jwt_secret: str = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
    jwt_expire_minutes: int = 60
    frontend_origin: str = "http://localhost:5173"
    upload_dir: str = "uploads"
    max_upload_mb: int = 5
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
