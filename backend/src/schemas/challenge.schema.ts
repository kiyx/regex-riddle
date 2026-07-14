import { z } from "zod";

export const challengeSchema = z.object
({
  title: z.string().min(2, "Il titolo è obbligatorio (min 2 caratteri)"),
  description: z.string().optional().or(z.literal("")),
  secretRegex: z.string().min(1, "La regex segreta da indovinare è obbligatoria"),
  positiveExample: z.string().min(1, "L'esempio di regex positivo è obbligatorio"),
  negativeExample: z.string().min(1, "L'esempio di regex negativo è obbligatorio"),
  positiveControls: z.array(z.string()).min(1, "Inserisci almeno 1 regex di controllo positiva").max(10, "Massimo 10 regex di controllo positive"),
  negativeControls: z.array(z.string()).min(1, "Inserisci almeno 1 regex di controllo negativa").max(10, "Massimo 10 regex di controllo negative"),
});

export const regexSchema = z.object
({
  proposedRegex: z.string().min(1, "La regex è obbligatoria"),
});
