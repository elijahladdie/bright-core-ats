# Brightcore Recruitment

Brightcore is a recruitment platform where applicants can browse job opportunities and submit applications with their contact details and CVs without creating an account. Administrators can review applications, manage candidate statuses, and make recruitment decisions.

## Technology Stack

- **Frontend:** React and Vite
- **Backend:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Package Management:** Yarn Workspaces

## Run Locally

**Requirements:** Node.js `22.15.1` or newer, Yarn Classic `1.22.22`, and PostgreSQL.

1. Clone the repository and navigate to its root directory.
2. Install dependencies and configure the environment:

   ```bash
   cp .env.example .env
   yarn install
   ```

3. Update `.env` with your PostgreSQL `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Apply database migrations:

   ```bash
   yarn db:migrate:deploy
   ```

5. Start both the API and frontend:

   ```bash
   yarn dev
   ```

6. Open **http://localhost:5173**.

The API health endpoint is available at http://localhost:8080/api/healthz.

## Key Features

- Browse available job opportunities.
- Submit applications and upload CVs without registering.
- Secure administrator access to submitted applications.
- Accept or reject candidates and track application statuses.

**Note:** Ensure PostgreSQL is running and the database is configured before starting the application.