# UnifiedGator

College group projects get messy fast. Tasks, deadlines and updates end up scattered across different apps or buried in a group chat. UnifiedGator keeps it all in one place with a simple project board, task assignments, deadlines, progress tracking and basic team chat, without the extra weight of bigger project management tools.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS (deployed on Vercel)
- **Backend:** Python and FastAPI (deployed on Railway)
- **Database and auth:** Supabase

## Getting Started

You'll need Git, Node.js, Python and access to the team's Supabase project.

```bash
git clone https://github.com/dev-nolant/UnifiedGator.git
cd UnifiedGator
```

### Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env.local` and fill it in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

```bash
cd ../backend
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill it in:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_backend_supabase_key
```

Ask the project admin for the backend key. Don't commit `.env` files or keys.

## Running It

Start the backend in one terminal:

```bash
cd backend
python -m fastapi dev app/main.py
```

Then the frontend in another:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and sign in. The API runs at http://localhost:8000, with docs at `/docs` and a health check at `/health` that should return `{"ok": true}`.

On Windows, if PowerShell blocks `npm`, use `npm.cmd run dev`.

## API

Every endpoint except `/health` needs a Supabase access token:

```http
Authorization: Bearer <supabase_access_token>
```

| Area | Endpoints |
|---|---|
| Projects | `GET/POST /projects`, `GET/PATCH/DELETE /projects/{project_id}` |
| Tasks | `GET/POST /projects/{project_id}/tasks`, `PATCH/DELETE /projects/{project_id}/tasks/{task_id}` |
| Members | `GET/POST /projects/{project_id}/members`, `DELETE /projects/{project_id}/members/{user_id}` |
| Profile | `GET/PATCH /me` |
| Health | `GET /health` |

`/messages` (team chat) and `/catchup` (AI activity summaries) are set up but not built yet. Full request and response details are at `/docs`.

## Troubleshooting

- **"Failed to fetch":** make sure the backend is running and `/health` responds, and that `NEXT_PUBLIC_API_URL` is `http://localhost:8000`. Restart the frontend after changing env vars.
- **Missing Supabase config:** check that `frontend/.env.local` and `backend/.env` both exist with the right values, then restart both servers.
- **Auth errors:** make sure you're signed in and sending a valid token.

More details are in the [frontend](frontend/README.md) and [backend](backend/README.md) READMEs.
