import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validate(schema: z.ZodType): (req: Request, res: Response, next: NextFunction) => void
{
	return (req: Request, res: Response, next: NextFunction): void =>
	{
		const result = schema.safeParse(req.body);
		if(!result.success)
		{
			const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
			res.status(400).json({ error: messages });
			return;
		}
		req.body = result.data;
		next();
	};
}
