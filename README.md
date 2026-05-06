# 📄 Google Docs Inspired

A collaborative document editor built with Next.js, Tiptap, Prisma, and MySQL — inspired by Google Docs.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Verify Docker is running

```bash
docker info
```

If Docker is running, you'll see system information printed in the terminal. If you see an error like `Cannot connect to the Docker daemon`, open Docker Desktop and wait for it to fully start before proceeding.

---

## Getting Started

### 1. Download the Source Code

Download the project folder from Google Drive, then extract it to your preferred location.

> ℹ️ The `node_modules` folder has been excluded from the upload to keep the file size small. You will install dependencies in the next step.

Once extracted, open a terminal and navigate into the project folder:

```bash
cd google-docs-inspired
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Database

Spin up the MySQL database and phpMyAdmin using Docker Compose:

```bash
docker compose up -d
```

This starts two services in the background:

- **MySQL** — the database used by the app
- **phpMyAdmin** — a web UI to inspect and manage the database

### 4. Verify the Database is Up

Open your browser and go to:

```
http://localhost:8080
```

You should see the **phpMyAdmin** login page. Log in using the credentials defined in your `docker-compose.yml` (typically `root` / `root` or as configured). Confirm the database is accessible before proceeding to the next step.

> ⚠️ Do **not** run the migration until phpMyAdmin loads successfully. If the database isn't up yet, wait a few seconds and refresh.

### 5. Run Database Migrations

```bash
npx prisma migrate deploy
```

This applies all pending migrations to set up the database schema.

### 6. Start the Development Server

```bash
npm run dev
```

### 7. Open the App

```
http://localhost:3000
```

---

## File Restrictions

The app enforces the following file type rules:

### 📥 Import / Upload Document (for editing)

Only the following formats are accepted when importing a file as a document:

| Format | Extension |
|--------|-----------|
| Plain Text | `.txt` |
| Markdown | `.md` |

> ❌ `.docx` files are **not** supported for import. The editor only accepts plain text and markdown content.

### 📎 Upload Attachment (inside a document)

Attachments support **any file type** — you can attach images, PDFs, ZIPs, spreadsheets, or any other file to a document.

---

## Tech Stack

- **Next.js** — React framework
- **Tiptap** — Rich text editor
- **Prisma** — ORM for database access
- **MySQL** — Relational database (via Docker)
- **phpMyAdmin** — Database management UI (via Docker)

---

## AI Tools Used

This project was built with the assistance of the following AI tools:

- **ChatGPT** — Used for brainstorming, architecture decisions, and general development guidance
- **Claude Code** — Used for code generation, debugging, and implementation assistance

---

## Troubleshooting

**`docker info` shows an error**
→ Open Docker Desktop and wait for it to fully initialize before running any commands.

**phpMyAdmin not loading at `localhost:8080`**
→ Run `docker compose ps` to check if the containers are running. If not, re-run `docker compose up -d`.

**Prisma migration fails**
→ Make sure the database container is healthy before running `npx prisma migrate deploy`. Check with `docker compose logs db`.

**App won't start**
→ Ensure all dependencies are installed with `npm install` and that the database is running before starting the dev server.
