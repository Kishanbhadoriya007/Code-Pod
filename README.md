# CodePod - My Online Code Compiler

Welcome to CodePod! This is a compact web application I built to compile and run Python and C++ code directly in the browser. It features a FastAPI backend and a React frontend with the Monaco Editor for a smooth coding experience. The whole thing is containerized using Docker, which makes setup and deployment much easier.

## Features I've Implemented

*   **Python 3 & C++ Execution:** Compile and run code for both Python 3 and C++ (using g++).
*   **Monaco Editor:** A rich, VS Code-like editor for writing code.
*   **Standard I/O:** Provides a way to give standard input to programs and view standard output and error streams.
*   **Dockerized:** Both the frontend and backend are containerized for consistent environments and simplified deployment.

## Project Structure

code-pod/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── routers/compile_router.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ... (other backend files)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── ... (other frontend files)
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── README.md

## Getting Started Locally

To run CodePod on your own machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Kishanbhadoriya007/Code-Pod.git
    cd Code-Pod
    ```

2.  **Prerequisites:**
    *   Ensure you have Docker and Docker Compose installed.

3.  **Environment Setup (First time only):**
    *   Navigate to the `frontend` directory and generate the `package-lock.json`:
        ```bash
        cd frontend
        npm install
        cd ..
        ```
    *   Copy the example environment files (these are fine for local use):
        ```bash
        cp backend/.env.example backend/.env
        cp frontend/.env.example frontend/.env
        ```

4.  **Launch with Docker Compose:**
    From the root `Code-Pod` directory, run:
    ```bash
    docker-compose up --build -d
    ```
    *   **Frontend:** Access it at `http://localhost:3000`
    *   **Backend API Docs (Optional):** `http://localhost:8000/docs`

5.  **Stopping the Application:**
    ```bash
    docker-compose down
    ```

## Deployment on Render.com

I've structured this project for easy deployment on Render. See the "Deploying to Render.com" section below for detailed steps.

## A Quick Note on Security
The code execution on the backend is simplified for this project. For any public-facing production environment, robust sandboxing would be essential.

## Future Ideas & Improvements
I'm thinking about adding more features like user accounts, saving code snippets, and supporting more languages. Secure code execution sandboxing is also a high priority for any serious expansion.