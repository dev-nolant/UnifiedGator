from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import catchup, members, messages, profiles, projects, tasks

app = FastAPI(title="unified gator")

app.add_middleware(CORSMiddleware, allow_origin_regex=r"http://localhost:\d+", allow_methods=["*"], allow_headers=["*"])

for r in (profiles, projects, members, tasks, messages, catchup):
    app.include_router(r.router)


@app.get("/health")
def health():
    return {"ok": True}
