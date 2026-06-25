import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:
            pass

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-flashmind-key-123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    def __init__(self, **values):
        super().__init__(**values)
        # Read from environment directly if not set via BaseSettings config
        if not self.DATABASE_URL:
            self.DATABASE_URL = os.getenv("DATABASE_URL", "")
            
        if not self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL is missing. Please set the DATABASE_URL environment variable "
                "or specify it in a local .env file. (Cloud PostgreSQL/Neon only)"
            )
            
        # Auto-convert postgres:// to postgresql:// for SQLAlchemy compatibility
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

        # Enforce PostgreSQL protocol
        if not self.DATABASE_URL.startswith("postgresql://"):
            raise ValueError(
                f"Only cloud PostgreSQL databases (Neon) are allowed. DATABASE_URL must start with "
                f"postgresql:// or postgres://. Found: '{self.DATABASE_URL}'"
            )

    class Config:
        env_file = ".env"

settings = Settings()
