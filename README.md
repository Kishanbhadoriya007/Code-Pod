# CodePod - Online Web Compiler

CodePod is a compact web application that allows you to compile and run Python and C++ code directly in your browser. It uses FastAPI for the backend and React with Monaco Editor for the frontend. The application is containerized using Docker for easy deployment.

## Features

- Compile and run Python 3 code.
- Compile and run C++ (g++) code.
- Monaco Editor for a rich coding experience.
- View standard output and standard error.
- Provide standard input to programs.
- Containerized with Docker for backend and frontend.

## Project Structure
(The structure is listed above in the prompt)

## Prerequisites

- Docker
- Docker Compose (for local development)
- Node.js and npm (if you want to run frontend outside Docker locally, or to initialize with `create-react-app`)
- Python 3 (if you want to run backend outside Docker locally)

## Local Development

1.  **Clone the repository (or create files as described):**
    If this project is in a Git repo:
    ```bash
    git clone <repository-url>
    cd code-pod
    ```
    Otherwise, create the directory structure and files as outlined. For the frontend, you can start with:
    ```bash
    npx create-react-app frontend
    cd frontend
    npm install @monaco-editor/react axios
    # Then replace/add the provided frontend files.
    cd ..
    ```

2.  **Environment Variables:**
    *   Create `.env` files in `backend/` and `frontend/` directories by copying from the `.example` files.
        ```bash
        cp backend/.env.example backend/.env
        cp frontend/.env.example frontend/.env
        ```
    *   Adjust `frontend/.env`: `REACT_APP_API_BASE_URL=http://localhost:8000/api` is suitable for the `docker-compose` setup.

3.  **Using Docker Compose (Recommended):**
    This will build and run both frontend and backend containers.
    ```bash
    docker-compose up --build -d
    ```
    - Backend API will be available at `http://localhost:8000/api`
    - Frontend will be accessible at `http://localhost:3000`

4.  **Running Frontend and Backend Separately (Alternative):**

    *   **Backend (FastAPI):**
        ```bash
        cd backend
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        pip install -r requirements.txt
        uvicorn app.main:app --reload --port 8000
        ```

    *   **Frontend (React):**
        ```bash
        cd frontend
        # If you haven't already: npm install @monaco-editor/react axios
        npm install 
        npm start
        ```
        The React development server (usually on `http://localhost:3000`) will proxy API requests to `http://localhost:8000` (as configured in `frontend/package.json`'s `proxy` field).

## Building Docker Images Manually

*   **Backend:**
    ```bash
    cd backend
    docker build -t code-pod-backend .
    ```

*   **Frontend:**
    ```bash
    cd frontend
    # To pass a build-time argument for the API URL:
    docker build --build-arg REACT_APP_API_BASE_URL=http://your-backend-api-url/api -t code-pod-frontend .
    # Example for relative path if Nginx proxies /api to backend:
    # docker build --build-arg REACT_APP_API_BASE_URL=/api -t code-pod-frontend .
    ```

## Deployment on Render.com

This project is structured for easy deployment on Render.com using Docker. You'll typically create two services:

1.  **Backend Service (Web Service):**
    *   **Runtime:** Docker
    *   **Repository:** Your Git repository
    *   **Root Directory:** `backend`
    *   **Dockerfile Path:** `Dockerfile` (Render should auto-detect `backend/Dockerfile`)
    *   **Port:** 8000
    *   **Environment Variables:** Create any needed from `backend/.env.example` if applicable.
    *   Render will provide a public URL (e.g., `https://codepod-backend.onrender.com`). Note this URL.

2.  **Frontend Service (Static Site is often easiest for React builds):**
    *   **Type:** Static Site
    *   **Repository:** Your Git repository
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `build` (relative to `frontend` root, so `frontend/build`)
    *   **Environment Variables (Set at Build Time on Render):**
        *   `REACT_APP_API_BASE_URL`: Set this to the public URL of your deployed backend service, including the `/api` path (e.g., `https://codepod-backend.onrender.com/api`).
    *   **Rewrite Rule (for client-side routing with React Router, if you add it later):**
        *   Source: `/*`
        *   Destination: `/index.html`
        *   Action: Rewrite

    *(Alternatively, for frontend, you could deploy as a Docker Web Service using `frontend/Dockerfile`, ensuring `REACT_APP_API_BASE_URL` is correctly set as a build argument during Render's Docker build process to point to your live backend URL).*

**Important Security Note:**
The current code execution method (`subprocess` in Python) is **NOT secure for a public-facing application** as it runs code directly on the server. For a production environment, you **MUST** implement proper sandboxing techniques (e.g., running each code execution in an isolated Docker container, using `nsjail`, `firejail`, or similar technologies) to prevent malicious code from harming your server or accessing sensitive data. This example prioritizes simplicity and compactness as per the initial request.

## Potential Improvements
- **Robust Sandboxing:** Implement secure code execution (critical for production).
- Resource limits for code execution (CPU, memory).
- Enhanced UI/UX and error handling.
- Support for more languages.
- Saving and sharing code snippets.


# CodePod - Online Web Compiler

CodePod is a compact web application that allows you to compile and run Python and C++ code directly in your browser. It uses FastAPI for the backend and React with Monaco Editor for the frontend. The application is containerized using Docker for easy deployment.

## Features

- Compile and run Python 3 code.
- Compile and run C++ (g++) code.
- Monaco Editor for a rich coding experience.
- View standard output and standard error.
- Provide standard input to programs.
- Containerized with Docker for backend and frontend.

## Project Structure
code-pod/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── compile_router.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── reportWebVitals.js
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── docker-compose.yml
└── README.md

## Prerequisites

- Docker
- Docker Compose (for local development)

## Local Development with Docker Compose

1.  **Clone the repository (or create files as described).**

2.  **Environment Variables:**
    *   Create `.env` files in `backend/` and `frontend/` directories by copying from the `.example` files.
        ```bash
        cp backend/.env.example backend/.env
        cp frontend/.env.example frontend/.env
        ```
    *   The default `frontend/.env` value `REACT_APP_API_BASE_URL=http://localhost:8000/api` is suitable for the `docker-compose` setup.

3.  **Using Docker Compose:**
    This will build and run both frontend and backend containers. From the `code-pod` root directory:
    ```bash
    docker-compose up --build -d
    ```
    - Backend API will be available at `http://localhost:8000/api` (docs at `http://localhost:8000/docs`)
    - Frontend will be accessible at `http://localhost:3000`

## Important Security Note
The current code execution method (`subprocess` in Python) is **NOT secure for a public-facing application**. For production, implement proper sandboxing.