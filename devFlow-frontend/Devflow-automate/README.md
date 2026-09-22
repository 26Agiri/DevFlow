# DevFlow

DevFlow is a full-stack developer workflow management platform designed to help developers organize projects, manage tasks, track work sessions, monitor weekly progress, and receive productivity notifications from a secure workspace.

## Overview

DevFlow combines a React frontend with a Spring Boot backend and PostgreSQL database.

The application provides:

- Secure user registration and login
- JWT-based authentication
- Project management
- Task management
- Task status and priority management
- Project and task detail views
- Work session tracking
- Pause and resume work sessions
- Automatic session timeout handling
- Workspace access locking
- Weekly work targets and progress tracking
- Weekly work history
- Session history grouped by day
- Productivity notifications
- User profile management
- Responsive dashboard and workspace UI

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Lucide React
- CSS

### Backend

- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- JWT Authentication
- Maven

### Database

- PostgreSQL

## Architecture

```text
DevFlow
│
├── devFlow
│   └── Spring Boot Backend
│       ├── controller
│       ├── service
│       ├── repository
│       ├── entity
│       ├── dto
│       ├── config
│       └── exception
│
└── devFlow-frontend
    └── Devflow-automate
        └── React Frontend
            ├── components
            ├── layouts
            ├── pages
            ├── services
            └── assets

            Main Features
Authentication

DevFlow uses JWT-based authentication to secure protected API endpoints and workspace pages.

Users can:

Register an account
Log in securely
Access protected pages
Log out
Continue using the application with authenticated API requests
Project Management

Users can create and manage projects from the Projects section.

Project functionality includes:

Create projects
View projects
Edit projects
Delete projects
Open project details
Task Management

Tasks are organized around projects and can be managed independently.

Task functionality includes:

Create tasks
Edit tasks
Delete tasks
Update task status
Manage task priority
View task details
Work Session Tracking

DevFlow includes a dedicated work-session system for tracking developer work time.

The system supports:

Start Work
Pause Work
Resume Work
Stop Work
Live session timer
Daily work tracking
Weekly work tracking
Automatic session completion

The application uses backend session status to control workspace access.

Automatic Session Protection

DevFlow automatically handles inactive sessions.

The system supports:

Heartbeat-based activity tracking
Automatic session completion after prolonged inactivity
Pause expiration handling
Midnight session closure
Workspace locking after a session is completed
Login warning after heartbeat timeout
Weekly Work Tracking

The application tracks a weekly work target and provides historical progress.

The Work History section provides:

Current week
Previous weeks
Weekly worked time
Weekly remaining time
Expandable weekly history
Day-grouped session details
Session start and end times
Session duration
Session status
Notifications

DevFlow provides notifications for important workspace and weekly work events.

Examples include:

Weekly progress warnings
Strict weekly warnings
Weekly target completion notifications
Profile

Users can view and manage their profile information through the Profile section.

API Structure

The backend exposes REST APIs for authentication, users, projects, tasks, notifications, profiles, and work sessions.

Example API groups:

/api/auth
/api/users
/api/projects
/api/tasks
/api/notifications
/api/profile
/api/work-sessions
Work Session Flow
START
  │
  ▼
ACTIVE
  │
  ├── Pause ──► PAUSED
  │               │
  │               ├── Resume within pause window ──► ACTIVE
  │               │
  │               └── Pause expires ──► COMPLETED
  │
  ├── Stop ───────────────────────────► COMPLETED
  │
  ├── Heartbeat timeout ──────────────► COMPLETED
  │
  └── Midnight boundary ──────────────► COMPLETED

COMPLETED
    │
    ▼
WORKSPACE LOCKED
Local Development
Prerequisites

Install:

Java 21
Maven
Node.js
npm
PostgreSQL
Backend Setup

Navigate to:

devFlow

Create a PostgreSQL database named:

devflow

Configure the local database credentials in:

devFlow/src/main/resources/application-local.properties

Then start the backend:

mvn spring-boot:run

The backend runs on:

http://localhost:8080
Frontend Setup

Navigate to:

devFlow-frontend/Devflow-automate

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will be available through the Vite development server.

Production Build

Frontend:

npm run build

Backend:

mvn clean package
Security

Local configuration and sensitive values should not be committed to Git.

The repository ignores local configuration such as:

application-local.properties
.env

JWT secrets should be provided through environment variables or local configuration.

Project Status

DevFlow currently includes a working full-stack workflow system with authentication, project management, task management, work-session tracking, weekly history, notifications, profiles, and workspace access control.

Future Improvements

Possible future enhancements include:

Deployment to a cloud platform
CI/CD pipeline
Automated API documentation
Advanced analytics
Team collaboration features
Role-based workspace administration
Improved testing coverage
Production monitoring
Author

Aniket Giri

Full Stack Developer

License

This project is intended for learning, portfolio development, and demonstration purposes