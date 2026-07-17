<div align="center">

# 🔮 RegexRiddle

**Indovina la regex, risolvi l’enigma, scala la classifica.**

RegexRiddle è una piattaforma social per creare e risolvere enigmi basati su espressioni regolari.
Costruisci sfide, sfida gli altri, migliora le tue skill e fatti notare.

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

## 🎮 Come funziona

Ogni **sfida** nasconde una *regex segreta*, nota solo all’autore. Tutti gli altri vedono solo:

| Indizio | Significato |
|---------|-------------|
| 🟢 **Esempio positivo** | Una stringa che la regex segreta deve accettare |
| 🔴 **Esempio negativo** | Una stringa che la regex segreta deve rifiutare |
| 📝 **Titolo e descrizione** | Il contesto per capire il pattern nascosto |

Il tuo compito è scrivere un’espressione regolare che **matchi tutte le stringhe positive** e **zero stringhe negative** tra quelle di controllo nascoste.

Ad ogni tentativo ricevi un feedback numerico: quanti match hai azzeccato. Ma le stringhe restano segrete.
**Vinci solo quando la tua regex è corretta al 100%**.


---

## ✨ Cosa puoi fare

| | |
|:-|:-|
| 🧩 **Creare sfide** | Definisci regex segreta, esempi e stringhe di controllo positive/negative |
| 🎯 **Risolvere sfide** | Studia gli indizi e trova il pattern nascosto |
| 📜 **Cronologia tentativi** | Tieni traccia dei tuoi approcci e migliora |
| 🏆 **Classifica globale** | Scala la leaderboard in base alle sfide risolte e ai tentativi usati |
| 🔐 **Profilo utente** | Avatar, statistiche personale e sfide create |
---

## 🛠️ Stack tecnologico

| Layer | Tecnologie |
|-------|------------|
| **Frontend** | Angular 21 · TypeScript |
| **Backend** | Node.js · Express · TypeScript |
| **Database** | PostgreSQL (supporto nativo Neon) · Prisma ORM |
| **Auth & Sicurezza** | JWT · bcrypt · Helmet · express-rate-limit · RE2 |
| **Testing & QA** | Playwright (cross-browser) · Biome |

---

## 🚀 Avvio rapido

### Prerequisiti

- Node.js 20 LTS+
- npm 11+
- PostgreSQL locale o database cloud (es. Neon)

### 1. Clona il repository

```bash
git clone https://github.com/kiyx/regex-riddle.git
cd regex-riddle
```

### 2. Configura il backend

```bash
cp backend/.env.dummy backend/.env
```

Modifica `backend/.env` con i tuoi dati:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
JWT_SECRET="una-chiave-super-segreta-minimo-32-caratteri"
JWT_EXPIRES_IN="7d"
PORT=8080
CLIENT_URL="http://localhost:4200"
```

### 3. Avvia il backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

🌐 API: `http://localhost:8080`
📚 Swagger: `http://localhost:8080/api-docs`

### 4. Avvia il frontend

```bash
cd frontend
npm install
npm start
```

🌐 App: `http://localhost:4200`

---

## 🏭 Avvio in produzione

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

## 🧪 Test End-to-End

I test Playwright girano su Chrome, Firefox, Safari, Edge e dispositivi mobile.

```bash
cd frontend
npx playwright install      # solo la prima volta
npx playwright test         # esegui i test
npx playwright show-report  # visualizza il report
```

> Per i test, imposta `DISABLE_RATE_LIMIT=true` in `backend/.env`.

---

## 📁 Struttura del progetto

```
regex-riddle/
├── backend/
│   ├── src/
│   │   ├── controllers/      # logica di business
│   │   ├── routes/           # API REST
│   │   ├── middlewares/      # auth, validazione, rate limiting
│   │   ├── schemas/          # validazione input con Zod
│   │   ├── lib/              # Prisma client, logger
│   │   └── server.ts         # entry point Express
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── frontend/
    └── src/app/
        ├── pages/            # home, sfida, classifica, profilo...
        ├── components/       # componenti condivisi
        ├── services/         # API e gestione auth
        └── guards/           # protezione route
```

---

## 🔒 Sicurezza

- Helmet per header HTTP sicuri
- CORS configurato per il frontend
- Rate limiting globale + dedicato all’autenticazione
- Password hashate con bcrypt
- Validazione input con Zod
- Regex eseguite in sandbox RE2
- Timeout sulle richieste per prevenire loop infiniti

---
