# UnifiedGator

### Challenge

College group projects get messy fast. Tasks, deadlines, progress updates, and team communication usually end up spread across different apps or buried in group chats.

UnifiedGator is meant to keep that in one place with a simple project board, task assignments, deadlines, progress tracking, and basic team chat without all the extra stuff that comes with larger project management tools.

## Technology Stack

UnifiedGator is a full-stack web application built using the following technologies:

### Frontend

- **Next.js** - React framework used to build the web application.
- **React** - Used to create interactive user interface components.
- **Tailwind CSS** - Used for styling and responsive layouts.

### Backend

- **Python** - Programming language used for backend development.
- **FastAPI** - Framework used to build and manage API endpoints.

### Database and Authentication

- **Supabase** - Provides database services and user authentication.

### Deployment

- **Vercel** - Frontend deployment platform.
- **Railway** - Backend deployment platform.

## Prerequisites

Before setting up UnifiedGator locally, make sure you have the following installed:

- **Git** - To clone the repository and manage changes.
- **Node.js and npm** - To install and run the frontend dependencies.
- **Python and pip** - To install and run the FastAPI backend.
- **A code editor** - Such as VS Code or Orca.

You will also need access to the team's Supabase project to configure the required environment variables.

## Local Setup

Follow these steps to set up UnifiedGator on your computer.

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/dev-nolant/UnifiedGator.git
cd UnifiedGator
```

### 2. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env.local` file using `.env.example` as a template.

Configure the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Obtain the Supabase project URL and publishable key from the team's Supabase project settings.

### 3. Set Up the Backend

From the frontend directory, navigate to the backend:

```bash
cd ../backend
```

Create a Python virtual environment before installing dependencies:

```bash
python -m venv .venv
```

Activate the virtual environment for your operating system:

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install the Python dependencies after activating the virtual environment:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a template.

Configure the following environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_backend_supabase_key
```

Obtain the required backend credentials securely from the project administrator. Never commit `.env` files or secret API keys to GitHub.

## Running the Application

UnifiedGator requires both the backend and frontend servers to be running.

### 1. Start the Backend

Open a terminal in the project's root directory and run:

```bash
cd backend
python -m fastapi dev app/main.py
```

If you're using a new terminal session, activate the backend virtual environment first (see **Set Up the Backend**).

The backend should be available at:

- **API:** http://localhost:8000
- **Interactive API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

Keep this terminal open while using the application.

### 2. Start the Frontend

Open a second terminal in the project's root directory and run:

```bash
cd frontend
npm run dev
```

The frontend should be available at:

http://localhost:3000

Open this URL in your browser to access UnifiedGator.

**Windows PowerShell Note:** If PowerShell blocks `npm` because of script execution restrictions, use `npm.cmd run dev` instead.

### 3. Verify the Application

To confirm the application is running correctly:

1. Visit `http://localhost:8000/health` and verify that the response is `{"ok": true}`.
2. Open `http://localhost:3000` in your browser.
3. Sign in using your account.
4. Verify that you can access your projects and tasks.

If the application cannot connect to the backend, confirm that both servers are running and that the environment variables are configured correctly.

## API Reference

UnifiedGator uses FastAPI to manage projects, tasks, project members, and user profiles.

The backend runs locally at `http://localhost:8000`.

Interactive API documentation is available at:

`http://localhost:8000/docs`

### Authentication

Most API endpoints require a valid Supabase access token.

Include the token in the request header:

```http
Authorization: Bearer <supabase_access_token>
```

The `/health` endpoint does not require authentication.

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Retrieve projects |
| POST | `/projects` | Create a new project |
| GET | `/projects/{project_id}` | Retrieve a specific project |
| PATCH | `/projects/{project_id}` | Update a project |
| DELETE | `/projects/{project_id}` | Delete a project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/{project_id}/tasks` | Retrieve project tasks |
| POST | `/projects/{project_id}/tasks` | Create a task |
| PATCH | `/projects/{project_id}/tasks/{task_id}` | Update a task |
| DELETE | `/projects/{project_id}/tasks/{task_id}` | Delete a task |

### Project Members

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/{project_id}/members` | Retrieve project members |
| POST | `/projects/{project_id}/members` | Add a project member |
| DELETE | `/projects/{project_id}/members/{user_id}` | Remove a project member |

### User Profiles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Retrieve the current user's profile |
| PATCH | `/me` | Update the current user's profile |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check whether the backend is responding |

### Features in Development

The following API routers exist but do not currently contain implemented endpoints:

- **Messages (`/messages`)** - Intended for team communication.
- **AI Catch-up (`/catchup`)** - Intended for AI-generated activity summaries.

These sections should be updated as the features are implemented.

For request parameters, response schemas, and additional API details, refer to the interactive FastAPI documentation at `/docs`.

## Troubleshooting

### Frontend Does Not Start

If the frontend fails to start, make sure Node.js and npm are installed and that dependencies have been installed.

From the `frontend` directory, run:

```bash
npm install
npm run dev
```

**Windows PowerShell:** If you receive an error about running scripts being disabled, use:

```powershell
npm.cmd run dev
```

### Backend Does Not Start

Make sure Python is installed and all backend dependencies are installed. Activate the virtual environment first if it is not already active.

From the `backend` directory, run:

```bash
python -m pip install -r requirements.txt
python -m fastapi dev app/main.py
```

### Missing Supabase Configuration

If you receive an error related to missing Supabase credentials, verify that:

- `frontend/.env.local` exists and contains the required frontend environment variables.
- `backend/.env` exists and contains the required backend environment variables.
- The Supabase URL and keys are correct.

Restart the development servers after modifying environment variables.

Never commit API keys or `.env` files to the repository.

### Failed to Fetch or API Connection Errors

If the frontend displays a `Failed to fetch` error:

1. Confirm that the backend is running at `http://localhost:8000`.
2. Visit `http://localhost:8000/health` to verify that the backend responds.
3. Confirm that `NEXT_PUBLIC_API_URL` is set to `http://localhost:8000` in `frontend/.env.local`.
4. Restart the frontend server if you changed its environment variables.

### Authentication Errors

If an API request returns an authentication error:

- Make sure you are signed in.
- Verify that your Supabase configuration is correct.
- For protected endpoints, include a valid Supabase access token in the `Authorization` header.

### Additional Documentation

For more information about each part of the application, refer to:

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)
