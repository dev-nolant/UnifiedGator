import sys
from pathlib import Path

# so tests can import app.* without installing the backend
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
