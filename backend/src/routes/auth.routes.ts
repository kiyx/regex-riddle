import type { Request, Response } from "express";
import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { logger } from "../lib/logger.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const authRouter: Router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login utente
 *     description: Autentica un utente e restituisce un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: mario
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login riuscito, restituisce il token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenziali non valide
 *       500:
 *         description: Errore interno del server
 */
authRouter.post("/login", validate(loginSchema), async (req: Request, res: Response): Promise<void> =>
{
	try
	{
		const result = await login(req.body);
		res.json(result);
	}
	catch(err: unknown)
	{
		logger.error({ err }, "Login fallito");

		const message: string = err instanceof Error ? err.message : "Unauthorized";

		if(message.includes("JWT") || message.includes("configurazione"))
			res.status(500).json({ error: "Errore interno del server" });
		else
			res.status(401).json({ error: message });
	}
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Registrazione utente
 *     description: Crea un nuovo account utente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: mario
 *               email:
 *                 type: string
 *                 example: mario@test.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Utente creato con successo
 *       409:
 *         description: Username o email già in uso
 *       500:
 *         description: Errore interno del server
 */
authRouter.post("/signup", validate(registerSchema), async (req: Request, res: Response): Promise<void> =>
{
	try
	{
		const { username, email, password } = req.body;
		const result = await register({ username, email, password });
		res.status(201).json(result);
	}
	catch(err: unknown)
	{
		logger.error({ err }, "Registrazione fallita");

		const message: string = err instanceof Error ? err.message : "Conflict";

    if(message.includes("già in uso"))
      res.status(409).json({ error: message });
    else
      res.status(500).json({ error: "Errore interno del server" });
  }
});
