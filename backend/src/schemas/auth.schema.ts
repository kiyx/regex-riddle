import { z } from "zod";

export const loginSchema = z.object
({
    username: z.string().min(4, "Lo username è obbligatorio e di minimo 4 caratteri").max(20, "Lo username non può superare i 20 caratteri").trim().toLowerCase(),
    password: z.string().min(8, "La password deve essere di minimo 8 caratteri"),
});

const registerBase = z.object
({
	username: z.string().min(4, "Lo username e' obbligatorio e di minimo 4 caratteri").max(20, "Lo username non puo' superare i 20 caratteri").trim().toLowerCase(),
	email: z.email("Email non valida").trim().toLowerCase(),
	password: z.string().min(8, "La password deve essere di minimo 8 caratteri"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword,
          {
                message: "Le password non coincidono",
                path: ["confirmPassword"],
          });

export const registerSchema = registerBase.transform(({ confirmPassword: _, ...rest }) => rest);
