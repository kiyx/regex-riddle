import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import multer from "multer";
import { changePassword, getProfile, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { logger } from "../lib/logger.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { changePasswordSchema, updateProfileSchema } from "../schemas/user.schema.js";

export const userRouter: Router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Profilo utente
 *     description: Restituisce i dati del profilo dell'utente autenticato
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 *       401:
 *         description: Non autenticato
 *       404:
 *         description: Utente non trovato
 */
userRouter.get("/me", authenticate, async(req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }

    const profile = await getProfile(req.user.userId);
    res.json(profile);
  }
  catch(err: unknown)
  {
    if(err instanceof Error && err.message === "NOT_FOUND")
    {
      res.status(404).json({ error: "Utente non trovato" });
      return;
    }
    logger.error({ err }, "Get profilo fallito");
    res.status(500).json({ error: "Errore nel recupero del profilo" });
  }
});

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Aggiorna profilo
 *     description: Modifica username ed email del profilo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profilo aggiornato
 *       409:
 *         description: Username o email già in uso
 *       401:
 *         description: Non autenticato
 */
userRouter.patch
(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  async(req: Request, res: Response): Promise<void> =>
  {
    try
    {
      if(!req.user)
      {
        res.status(401).json({ error: "Utente non autenticato" });
        return;
      }

      const profile = await updateProfile(req.user.userId, req.body);
      res.json(profile);
    }
    catch(err: unknown)
    {
      if(err instanceof Error && err.message.includes("già in uso"))
      {
        res.status(409).json({ error: err.message });
        return;
      }
      logger.error({ err }, "Aggiornamento profilo fallito");
      res.status(500).json({ error: "Errore nell'aggiornamento del profilo" });
    }
  },
);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Cambia password
 *     description: Aggiorna la password dell'utente autenticato
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password aggiornata
 *       401:
 *         description: Password attuale errata o non autenticato
 */
userRouter.put("/change-password", authenticate, validate(changePasswordSchema), async (req: Request, res: Response): Promise<void> =>
{
  try
  {
    if(!req.user)
    {
      res.status(401).json({ error: "Utente non autenticato" });
      return;
    }
    await changePassword(req.user.userId, { oldPassword: req.body.oldPassword, newPassword: req.body.newPassword });
    res.json({ message: "Password aggiornata con successo" });
  }
  catch(err: unknown)
  {
    logger.error({ err }, "Cambio password fallito");
    const message = err instanceof Error ? err.message : "Errore";
    if(message.includes("Password attuale errata"))
      res.status(401).json({ error: message });
    else
      res.status(500).json({ error: "Errore nel cambio password" });
  }
});

const avatarUpload = multer
({
  storage: multer.diskStorage
  ({
    destination: "uploads/avatars",
    filename: (_req, file, cb) =>
    {
      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      const name = `${crypto.randomUUID()}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
  {
    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowed.includes(ext))
      cb(null, true);
    else
      cb(new Error("Formato immagine non supportato. Usa PNG, JPG, GIF o WEBP"));
  },
});

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Carica avatar
 *     description: Carica un'immagine avatar per l'utente (max 5MB, PNG/JPG/GIF/WEBP)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar aggiornato
 *       400:
 *         description: Formato non supportato
 *       413:
 *         description: File troppo grande
 *       401:
 *         description: Non autenticato
 */
userRouter.post(
  "/me/avatar",
  authenticate,
  (req: Request, res: Response, next: NextFunction): void =>
  {
    avatarUpload.single("avatar")(req, res, (err: unknown): void =>
    {
      if(err instanceof multer.MulterError)
      {
        if(err.code === "LIMIT_FILE_SIZE")
        {
          res.status(413).json({ error: "File troppo grande. Il limite e' 5 MB" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if(err instanceof Error)
      {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async(req: Request, res: Response): Promise<void> =>
  {
    try
    {
      if(!req.user)
      {
        res.status(401).json({ error: "Utente non autenticato" });
        return;
      }

      if(!req.file)
      {
        res.status(400).json({ error: "Nessun file caricato" });
        return;
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const result = await updateAvatar(req.user.userId, avatarPath);
      res.json(result);
    }
    catch(err: unknown)
    {
      logger.error({ err }, "Upload avatar fallito");
      res.status(500).json({ error: "Errore nel caricamento dell'avatar" });
    }
  },
);
