import { type Request, type Response, Router } from "express";
import { prisma } from "../lib/prisma.js";

export const e2eRouter: Router = Router();

/**
 * @swagger
 * /e2e/cleanup:
 *   delete:
 *     summary: Cleanup E2E
 *     description: Cancella tutti gli utenti di test (username che inizia con "e2e"). Solo per ambiente di test.
 *     tags: [E2E]
 *     responses:
 *       200:
 *         description: Cleanup completato
 *       500:
 *         description: Errore durante il cleanup
 */
e2eRouter.delete("/cleanup", async (_req: Request, res: Response): Promise<void> =>
{
	try
	{
		const result = await prisma.user.deleteMany({
			where: {
				username: { startsWith: "e2e" },
			},
		});

		res.json({
			message: "Cleanup E2E completato",
			deletedUsers: result.count,
		});
	}
	catch (err: unknown)
	{
		console.error("Cleanup E2E fallito:", err);
		res.status(500).json({ error: "Errore durante il cleanup E2E" });
	}
});
