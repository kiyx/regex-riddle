<div align="center">

**English** | [Italiano](README.it.md)

# RegexRiddle

**Guess the regex, solve the riddle, climb the leaderboard.**

RegexRiddle is a social platform for creating and solving puzzles based on regular expressions.
Build challenges, compete with others, sharpen your skills — and stand out.

<p>
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />

  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white" alt="Biome" />
</p>

</div>

---

## How It Works

Every **challenge** hides a *secret regex*, known only to its author. Everyone else sees only:

| Clue | Meaning |
|---------|-------------|
| **Positive example** | A string the secret regex must accept |
| **Negative example** | A string the secret regex must reject |
| **Title and description** | The context to figure out the hidden pattern |

Your job is to write a regular expression that **matches all positive strings** and **zero negative strings** among the hidden control strings.

On every attempt you get numeric feedback: how many matches you got right. But the strings stay secret.
**You win only when your regex is 100% correct.**

---

## What You Can Do

| | |
|:-|:-|
| **Create challenges** | Define the secret regex, examples and positive/negative control strings |
| **Solve challenges** | Study the clues and find the hidden pattern |
| **Attempt history** | Keep track of your approaches and improve |
| **Global leaderboard** | Climb the ranking based on solved challenges and attempts used |
| **User profile** | Avatar, personal statistics and created challenges |

---

## Tech Stack

| Layer | Technologies |
|-------|------------|
| **Frontend** | Angular 21 · TypeScript · Tailwind CSS |
| **Backend** | Node.js · Express · TypeScript |
| **Database** | PostgreSQL (native Neon support) · Prisma ORM |
| **Auth & Security** | JWT · bcrypt · Helmet · express-rate-limit · RE2 |
| **Validation & API docs** | Zod · Swagger (OpenAPI) |
| **Logging** | Pino |
| **Testing & QA** | Playwright (cross-browser) · Biome |

---

## Quick Start

### Prerequisites

- Node.js 20 LTS+
- npm 11+
- Local PostgreSQL or a cloud database (e.g. Neon)

### 1. Clone the repository

```bash
git clone https://github.com/kiyx/regex-riddle.git
cd regex-riddle
```

### 2. Configure the backend

```bash
cp backend/.env.dummy backend/.env
```

Edit `backend/.env` with your own values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
JWT_SECRET="a-super-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=8080
CLIENT_URL="http://localhost:4200"
```

### 3. Start the backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

**API:** `http://localhost:8080`
**Swagger:** `http://localhost:8080/api-docs`

### 4. Start the frontend

```bash
cd frontend
npm install
npm start
```

**App:** `http://localhost:4200`

---

## Production Build

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npx serve -s dist/frontend/browser -l 4200
```

---

## End-to-End Tests

Playwright tests run on Chromium, Firefox, WebKit, Microsoft Edge, Google Chrome and mobile emulation (Pixel 5, iPhone 12).

```bash
cd frontend
npx playwright install      # first time only
npx playwright test         # run the tests
npx playwright show-report  # view the report
```

> For testing, set `DISABLE_RATE_LIMIT=true` in `backend/.env`.

---

## Project Structure

```
regex-riddle/
├── backend/
│   ├── src/
│   │   ├── controllers/      # business logic
│   │   ├── routes/           # REST APIs (+ e2e test routes)
│   │   ├── middlewares/      # auth, validation, rate limiting
│   │   ├── schemas/          # input validation with Zod
│   │   ├── lib/              # Prisma client, logger
│   │   ├── types/            # Express type augmentation
│   │   └── server.ts         # Express entry point
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── frontend/
    ├── e2e/                  # Playwright end-to-end tests
    └── src/app/
        ├── pages/            # home, challenge, leaderboard, profile...
        ├── components/       # shared components
        ├── services/         # API and auth services
        ├── interceptors/     # HTTP interceptors
        └── guards/           # route protection
```

---

## Security

- Helmet for secure HTTP headers
- CORS configured for the frontend
- Global rate limiting + dedicated rate limiting on authentication
- Passwords hashed with bcrypt
- Input validation with Zod
- Regex executed in an RE2 sandbox
- Request timeouts to prevent infinite loops

---
