import os
import sys
from pathlib import Path

# so tests can import app.* without installing the backend
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

# fake creds, nothing in the tests actually talks to supabase
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "sb_secret_test")
