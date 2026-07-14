import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";

export async function authenticate(req: Request, res: Response, next: NextFunction)
{
	const token = req.headers.authorization?.split(" ")[1];

	if(!token)
	{
		res.status(401).json({ error: "Token mancante" });
		return;
	}

	try
	{
		const secret = process.env.JWT_SECRET;
		if(!secret)
		{
			logger.error("JWT_SECRET non configurato");
			res.status(500).json({ error: "Errore interno del server" });
			return;
		}

		const payload = jwt.verify(token, secret) as { userId: string; };

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			select: { id: true },
		});

		if(!user)
		{
			res.status(401).json({ error: "Token non valido — utente non trovato" });
			return;
		}

		req.user = payload;
		next();
	}
	catch
	{
		res.status(401).json({ error: "Token non valido o scaduto" });
	}
}
