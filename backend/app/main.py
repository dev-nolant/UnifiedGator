from fastapi import FastAPI

from app.routes import catchup, members, messages, projects, tasks
from profiles import register_new_profile
app = FastAPI(title="unified gator")

for r in (projects, members, tasks, messages, catchup):
    app.include_router(r.router)


@app.get("/health")
def health():
    return {"ok": True}


def main():
    # testing creating a user
    # MUST set SUPABASE_URL and SUPABASE_KEY in environment to run
    email = input("Enter User Email: ").strip()
    password = input("Enter User Password: ").strip()
    name = input("Enter User Name: ").strip()
    profile = register_new_profile(email, password, name)
    print(profile.id, profile.display_name)


if __name__ == "__main__":
    main()


