import type { Request, Response } from "express";
import { Router } from "express";
import {
  createAttempt,
  createChallenge,
  deleteChallenge,
  getAttempts,
  getChallengeById,
  getChallenges,
  getLeaderboard,
  getSolvedChallengeIds,
} from "../controllers/challenge.controller.js";
import { logger } from "../lib/logger.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { challengeSchema, regexSchema } from "../schemas/challenge.schema.js";

export const challengeRouter: Router = Router();

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Elenco sfide
 *     description: Restituisce la lista paginata di tutte le sfide
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Elementi per pagina
 *     responses:
 *       200:
 *         description: Lista sfide
 *       500:
 *         description: Errore interno
 */
challengeRouter.get("/", async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const challenges = await getChallenges({ page, limit });
    res.json(challenges);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get delle challenges fallita");
    res.status(500).json({ error: "Errore nel recupero delle challenge" });
  }
});

/**
 * @swagger
 * /challenges/mine:
 *   get:
 *     summary: Le mie sfide
 *     description: Restituisce le sfide create dall'utente autenticato
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Lista sfide dell'utente
 *       401:
 *         description: Non autenticato
 */
challengeRouter.get("/mine", authenticate, async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const challenges = await getChallenges({ authorId: req.user.userId, page, limit });
    res.json(challenges);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get delle challenges dell'utente fallita");
    res.status(500).json({ error: "Errore nel recupero delle tue challenge" });
  }
});

/**
 * @swagger
 * /challenges/unsolved:
 *   get:
 *     summary: Sfide non risolte
 *     description: Restituisce le sfide che l'utente non ha ancora risolto
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Lista sfide non risolte
 *       401:
 *         description: Non autenticato
 */
challengeRouter.get("/unsolved", authenticate, async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const challenges = await getChallenges({ unsolvedFor: req.user.userId, page, limit });
    res.json(challenges);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get delle challenges non risolte fallita");
    res.status(500).json({ error: "Errore nel recupero delle sfide da risolvere" });
  }
});

/**
 * @swagger
 * /challenges/solved:
 *   get:
 *     summary: ID sfide risolte
 *     description: Restituisce gli ID delle sfide risolte dall'utente
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array di ID
 *       401:
 *         description: Non autenticato
 */
challengeRouter.get("/solved", authenticate, async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }

    const ids = await getSolvedChallengeIds(req.user.userId);
    res.json(ids);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get solved IDs fallito");
    res.status(500).json({ error: "Errore nel recupero delle sfide risolte" });
  }
});

/**
 * @swagger
 * /challenges/leaderboard:
 *   get:
 *     summary: Classifica
 *     description: Restituisce la classifica dei risolutori
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Classifica
 *       500:
 *         description: Errore interno
 */
challengeRouter.get("/leaderboard", async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const data = await getLeaderboard(page, limit);
    res.json(data);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get leaderboard fallita");
    res.status(500).json({ error: "Errore nel recupero della classifica" });
  }
});

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Dettaglio sfida
 *     description: Restituisce i dettagli di una sfida per ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della sfida
 *     responses:
 *       200:
 *         description: Dettaglio sfida
 *       404:
 *         description: Sfida non trovata
 */
challengeRouter.get("/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> =>
{
  try
  {
    const challenge = await getChallengeById(req.params.id);

    if(!challenge)
    {
      res.status(404).json({ error: "Challenge non trovata" });
      return;
    }

    res.json(challenge);
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Get challenge per ID fallita");
    res.status(500).json({ error: "Errore nel recupero della challenge" });
  }
});

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Crea una sfida
 *     description: Crea una nuova sfida con regex segreta ed esempi
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               secretRegex:
 *                 type: string
 *               positiveExample:
 *                 type: string
 *               negativeExample:
 *                 type: string
 *               positiveControls:
 *                 type: array
 *                 items:
 *                   type: string
 *               negativeControls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Sfida creata
 *       400:
 *         description: Regex non valida o controlli errati
 *       401:
 *         description: Non autenticato
 */
challengeRouter.post("/", authenticate, validate(challengeSchema), async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }
    const challenge = await createChallenge(req.body, req.user.userId);
    res.status(201).json(challenge);
  }
  catch(err: unknown)
  {
    if(err instanceof Error)
    {
      if(err.message === "INVALID_SECRET_REGEX")
      {
        res.status(400).json({ error: "La regex segreta non è valida sintatticamente" });
        return;
      }
      if(err.message.includes("matcha la regex segreta"))
      {
        res.status(400).json({ error: err.message });
        return;
      }
    }
    logger.error({ err }, "Creazione challenge fallita");
    res.status(500).json({ error: "Errore nella creazione della challenge" });
  }
});

/**
 * @swagger
 * /challenges/{id}:
 *   delete:
 *     summary: Elimina una sfida
 *     description: Elimina una sfida (solo l'autore può farlo)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eliminata con successo
 *       403:
 *         description: Non sei l'autore
 *       404:
 *         description: Sfida non trovata
 */
challengeRouter.delete("/:id", authenticate,
  async(req: Request<{ id: string }>, res: Response): Promise<void> =>
  {
    try
    {
      if(!req.user)
      {
        res.status(401).json({ error: "Utente non autenticato" });
        return;
      }

      await deleteChallenge(req.params.id, req.user.userId);
      res.status(204).send();
    }
    catch(err: unknown)
    {
      if(err instanceof Error)
      {
        if(err.message === "NOT_FOUND")
        {
          res.status(404).json({ error: "Challenge non trovata" });
          return;
        }
        if(err.message === "FORBIDDEN")
        {
          res.status(403).json({ error: "Non sei l'autore di questa challenge" });
          return;
        }
      }
      logger.error({ err }, "Eliminazione challenge fallita");
      res.status(500).json({ error: "Errore nell'eliminazione della challenge" });
    }
  }
);

/**
 * @swagger
 * /challenges/{id}/attempts:
 *   get:
 *     summary: Cronologia tentativi
 *     description: Restituisce i tentativi dell'utente su una sfida
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista tentativi
 *       401:
 *         description: Non autenticato
 */
challengeRouter.get("/:id/attempts", authenticate,
  async (req: Request<{ id: string }>, res: Response): Promise<void> =>
  {
    try
    {
      if(!req.user)
      {
        res.status(401).json({ error: "Utente non autenticato" });
        return;
      }

      const attempts = await getAttempts(req.user.userId, req.params.id);
      res.json(attempts);
    }
    catch(err: unknown)
    {
      logger.error({ err }, "Get degli attempts fallita");
      res.status(500).json({ error: "Errore nel recupero dei tentativi" });
    }
  });

/**
 * @swagger
 * /challenges/{id}/attempt:
 *   post:
 *     summary: Invia un tentativo
 *     description: Prova a risolvere una sfida con una regex
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proposedRegex:
 *                 type: string
 *                 example: ^[a-z]+$
 *     responses:
 *       200:
 *         description: Risultato del tentativo
 *       400:
 *         description: Regex non valida o già risolta
 *       403:
 *         description: Non puoi risolvere la tua sfida
 *       404:
 *         description: Sfida non trovata
 */
challengeRouter.post("/:id/attempt", authenticate, validate(regexSchema),
  async (req: Request<{ id: string }>, res: Response): Promise<void> =>
  {
      try
      {
        if(!req.user)
        {
          res.status(401).json({ error: "Utente non autenticato" });
          return;
        }

        const result = await createAttempt(req.params.id, req.user.userId, req.body.proposedRegex);
        res.json(result);
      }
      catch(err: unknown)
      {
        if(err instanceof Error)
        {
          if(err.message === "NOT_FOUND")
          {
            res.status(404).json({ error: "Challenge non trovata" });
            return;
          }
        if(err.message === "INVALID_REGEX")
        {
          res.status(400).json({ error: "La regex proposta non è valida sintatticamente" });
          return;
        }
        if(err.message === "CANNOT_SOLVE_OWN")
        {
          res.status(403).json({ error: "Non puoi risolvere la tua stessa challenge" });
          return;
        }
        if(err.message === "ALREADY_SOLVED")
        {
          res.status(400).json({ error: "Hai già risolto questa sfida" });
          return;
        }
        }
        logger.error({ err }, "Creazione attempt fallita");
        res.status(500).json({ error: "Errore nel tentativo di risoluzione" });
      }
  });
