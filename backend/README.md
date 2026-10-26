# backend

fastapi + supabase. deploys to railway.

first time: run `schema.sql` in the supabase sql editor, then

    pip install -r requirements.txt
    copy .env.example .env    (fill in the key)
    fastapi dev app/main.py

docs at http://localhost:8000/docs. everything except /health wants `Authorization: Bearer <supabase access token>`.
