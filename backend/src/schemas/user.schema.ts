import { z } from "zod";

export const updateProfileSchema = z.object
({
  username: z.string().min(4, "Lo username deve avere almeno 4 caratteri").max(20, "Lo username non può superare i 20 caratteri").trim().toLowerCase().optional(),
  email: z.email("Email non valida").trim().toLowerCase().optional(),
}).refine((data) => data.username || data.email,
{
  message: "Almeno un campo tra username e email è richiesto",
});

export const changePasswordSchema = z.object
({
  oldPassword: z.string().min(1, "La password attuale è obbligatoria"),
  newPassword: z.string().min(8, "La nuova password deve essere di minimo 8 caratteri"),
  confirmPassword: z.string().min(1, "Conferma la nuova password"),
}).refine((data) => data.newPassword === data.confirmPassword,
{
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});
