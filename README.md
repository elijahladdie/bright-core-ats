# Brightcore Recruitment

Brightcore is a React/Vite recruitment portal backed by an Express API, PostgreSQL, and Prisma.

## Requirements

- Node.js 22.15.1 or newer (Node 22 is the configured runtime)
- Yarn Classic 1.22.22
- PostgreSQL

The repository includes `.nvmrc` for Node version managers.

## First-time setup

From the repository root:

```sh
cp .env.example .env
yarn install
```

Edit `.env` and set `DATABASE_URL` to your PostgreSQL database. Replace the development `SESSION_SECRET` and admin password before using the app outside local development. Keep `.env` private; it is ignored by Git.

CV files are stored locally under `apps/backend/data/cv-uploads` by default when the API runs as a Yarn workspace. Set `CV_UPLOAD_DIR` to choose another path. The local storage directory is ignored by Git.

## Database setup and migrations

For a new database, create all tables by running:

```sh
yarn db:migrate:deploy
```

To create and apply a migration while developing a schema change:

```sh
yarn db:migrate:dev
```

To check migration state:

```sh
yarn db:migrate:status
```

This repository includes a baseline migration for the existing Brightcore schema. If your database already has those tables from an earlier `prisma db push`, first verify that its schema matches `lib/db/prisma/schema.prisma`, then mark the baseline as applied:

```sh
yarn workspace @workspace/db run migrate:resolve --applied 20261022150000_baseline
yarn db:migrate:deploy
```

Do not mark the baseline as applied on an empty or differently structured database. `migrate:deploy` applies committed migrations; it does not synchronize arbitrary schema changes.

## Start the API and web app

Run these in separate terminals from the repository root:

```sh
yarn dev:api
```

```sh
yarn dev:web
```

Open the web app at <http://localhost:5173>. The API health endpoint is <http://localhost:8080/api/healthz>. Vite proxies `/api` requests to the API server during development.

For a local admin login, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before the first API startup. The development seed also creates sample jobs when the jobs table is empty.

## Production

Build the workspace with `yarn build`. Configure the production environment with `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, and a durable `CV_UPLOAD_DIR`. Apply committed migrations with `yarn db:migrate:deploy` as part of the database release process, not as application startup logic.


