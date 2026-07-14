import "dotenv/config";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { logger } from "./lib/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet: aggiunge header HTTP di sicurezza (XSS, clickjacking, sniffing, ecc.)
// crossOriginResourcePolicy: cross-origin permette il caricamento delle immagini avatar
// da frontend diversi (es. localhost:4200 → localhost:3000)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Cors: permette al frontend (su qualsiasi porta/dominio) di chiamare il backend
app.use(cors({ origin: true }));

const isTest = process.env.DISABLE_RATE_LIMIT === 'true';

// Rate limit globale: massimo 100 richieste ogni 15 minuti per IP
const globalLimiter = rateLimit
({
	windowMs: 15 * 60 * 1000, // 15 minuti
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Troppe richieste, riprova più tardi" },
	skip: () => isTest,
});

// Rate limit stretto per le route di autenticazione: massimo 10 tentativi ogni 15 minuti per prevenire brute force
const authLimiter = rateLimit
({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Troppi tentativi di autenticazione, riprova più tardi" },
	skip: () => isTest,
});

app.use(globalLimiter);

// Morgan: logga nel terminale ogni richiesta HTTP in arrivo (metodo, URL, status, tempo)
app.use(morgan("dev"));

// Express.json: trasforma automaticamente il body JSON delle richieste in req.body
// Limit: rifiuta body JSON più grandi di 1MB (protezione DoS)
app.use(express.json({ limit: "1mb" }));

// Express.urlencoded: gestisce i dati inviati da form HTML
app.use(express.urlencoded({ extended: true, limit: "6mb" }));

// CORS per le immagini statiche (serve agli avatar caricati dal frontend)
app.use("/uploads", cors({ origin: true, credentials: true }), express.static("uploads"));

// Catch JSON parse errors and return 400 instead of 500
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) =>
{
	  if(err instanceof SyntaxError && "body" in err)
    {
      res.status(400).json({ error: "JSON non valido nel corpo della richiesta" });
      return;
    }
	  next(err);
});

/*
 * Swagger
 * - swagger-jsdoc: scansiona i file .ts nei path indicati sotto (apis), legge i commenti
 *   JSDoc con notazione @swagger, e genera un documento OpenAPI (swaggerSpec)
 * - swagger-ui-express: serve la pagina /api-docs con l'interfaccia Swagger interattiva
 */
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Regex Riddle API",
    version: "1.0.0",
    description: "API per il gioco regex-riddle",
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/schemas/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
import { authRouter } from "./routes/auth.routes.js";
import { challengeRouter } from "./routes/challenge.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { e2eRouter } from "./routes/e2e.routes.js";

app.use("/auth", authLimiter, authRouter);
app.use("/challenges", challengeRouter);
app.use("/users", userRouter);
app.use("/e2e", e2eRouter);

// Health check
app.get("/health", (_req: express.Request, res: express.Response): void => { res.json({ status: "ok", timestamp: new Date().toISOString() }); });

// 404: qualsiasi route non definita finisce qui
app.use((_req: express.Request, res: express.Response): void => { res.status(404).json({ message: "Endpoint non trovato" }); });

// Error handler globale: cattura eccezioni inaspettate e risponde con 500
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error(err.stack || err.message);
    res
      .status(500)
      .json({ message: "Errore interno del server" });
  },
);

// Avvia il server sulla porta
const server = app.listen(PORT, () => {
  logger.info(`Server avviato su http://localhost:${PORT}`);
  logger.info(`Swagger: http://localhost:${PORT}/api-docs`);
});

// Timeout di 30 secondi su ogni richiesta (protezione da loop infiniti)
server.timeout = 30000;
server.keepAliveTimeout = 31000; // deve essere > timeout
server.headersTimeout = 32000;   // deve essere > keepAliveTimeout

export default app;
