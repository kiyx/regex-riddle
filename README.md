# RegexRiddle

## Prerequisiti

- Node.js 20 LTS (o superiore)
- npm 10+
- PostgreSQL in esecuzione (oppure un database Neon cloud)

---

# Configurazione

## Database (QUESTA PARTE NON VA FATTA SE IL SUO COGNOME è STARACE, HO MESSO IO IL .env NELLA CONSEGNA PERCHè USO DB ESTERNO ;) )

Creare un database PostgreSQL e copiare il file di esempio:

```bash
cp backend/.env.dummy backend/.env
```

Modificare `backend/.env` con i valori corretti:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
JWT_SECRET="una-chiave-super-segreta-minimo-32-caratteri"
JWT_EXPIRES_IN="7d"
PORT=8080
LOG_LEVEL=info
CLIENT_URL="http://localhost:4200"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
DISABLE_RATE_LIMIT=false
```

> **Nota:** il progetto include un `.npmrc` con `legacy-peer-deps=true` per evitare conflitti di peer dependencies su versioni diverse di npm.

## Avvio

### Back-end

1. Entra nella cartella e installa le dipendenze:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

1. Avvia in modalità sviluppo:

```bash
npm run dev
```

Oppure compila e avvia in produzione:

```bash
npm run build
npm start
```

Il server sarà disponibile su `http://localhost:8080`.
La documentazione API Swagger è accessibile su `http://localhost:8080/api-docs`.


### Front-end

1. Entra nella cartella e installa le dipendenze:

```bash
cd frontend
npm install
```

2. Avvia il dev server Angular:

```bash
npm start
```

Oppure per servire il frontend in modalità produzione dopo la build:

```bash
npm run build
npx serve -s dist/frontend/browser -l 4200
```

L'applicazione sarà disponibile su `http://localhost:4200`.

---

## Test End-to-End

La configurazione Playwright può avviarli automaticamente.

```bash
cd frontend
npx playwright install   # installa i browser necessari (prima volta)
npx playwright test      # esegue i 10 test E2E
npx playwright show-report
```
