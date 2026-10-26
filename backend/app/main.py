from fastapi import FastAPI

from app.routes import catchup, members, messages, projects, tasks

app = FastAPI(title="unified gator")

for r in (projects, members, tasks, messages, catchup):
    app.include_router(r.router)


@app.get("/health")
def health():
    return {"ok": True}
