# DevBoard - API for Project Management

This is the backend API for the DevBoard project management application. It provides endpoints for managing users, projects, tasks, and collaborators.

## Getting Started

### Prerequisites

- Node.js
- npm
- Prisma
- A running instance of Redis

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Rajat4279/devboard.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables in a `.env` file:
    ```
    PORT=8000
    NODE_ENV=development
    DATABASE_URL="your_database_url_here"
    ACCESS_TOKEN_SECRET="your access_token_secret_here"
    REFRESH_TOKEN_SECRET="your refresh_token_secret_here"
    REDIS_USERNAME="your redis username"
    REDIS_PASSWORD="your redis password"
    REDIS_HOST="your redis host"
    REDIS_PORT="redis port"
    ```
4.  Run the database migrations:
    ```bash
    npx prisma migrate dev
    ```
5.  Start the server:
    ```bash
    npm start
    ```

## API Routes

All routes are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint              | Description                  |
| :----- | :-------------------- | :--------------------------- |
| `POST` | `/auth/register`      | Register a new user.         |
| `POST` | `/auth/login`         | Log in a user.               |
| `POST` | `/auth/api-key`       | Generate a new API key.      |
| `GET`  | `/auth/me`            | Get the current user's info. |
| `POST` | `/auth/logout`        | Log out the current user.    |
| `POST` | `/auth/refresh-token` | Refresh the auth token.      |

### Projects

| Method   | Endpoint        | Description                 |
| :------- | :-------------- | :-------------------------- |
| `POST`   | `/projects`     | Create a new project.       |
| `GET`    | `/projects`     | Get all projects.           |
| `GET`    | `/projects/:id` | Get a single project by ID. |
| `PUT`    | `/projects/:id` | Update a project by ID.     |
| `DELETE` | `/projects/:id` | Delete a project by ID.     |

### Tasks

| Method   | Endpoint                     | Description                      |
| :------- | :--------------------------- | :------------------------------- |
| `POST`   | `/projects/:projectId/tasks` | Create a new task for a project. |
| `GET`    | `/projects/:projectId/tasks` | Get all tasks for a project.     |
| `GET`    | `/tasks/:id`                 | Get a single task by ID.         |
| `PUT`    | `/tasks/:id`                 | Update a task by ID.             |
| `DELETE` | `/tasks/:id`                 | Delete a task by ID.             |

### Collaborators

| Method   | Endpoint                             | Description                          |
| :------- | :----------------------------------- | :----------------------------------- |
| `POST`   | `/projects/:projectId/collaborators` | Add a collaborator to a project.     |
| `GET`    | `/projects/:projectId/collaborators` | Get all collaborators for a project. |
| `GET`    | `/collaborators/:id`                 | Get a single collaborator by ID.     |
| `PUT`    | `/collaborators/:id`                 | Update a collaborator by ID.         |
| `DELETE` | `/collaborators/:id`                 | Delete a collaborator by ID.         |

## How to Use

1.  **Register and Login**: First, register a new user and then log in to get an authentication token.
2.  **Generate API Key**: Use the auth token to generate an API key. This key will be required for all other API requests.
3.  **Include API Key**: Include the API key in the `x-api-key` header for all subsequent requests.
4.  **Manage Resources**: Use the projects, tasks, and collaborators endpoints to manage your project data.

## For your reference

[Postman link](https://www.postman.com/joint-operations-geoscientist-84680570/workspace/public-workspace/collection/25450374-d36c4257-207a-4335-9ebe-0f2cf10298bd?action=share&creator=25450374)
