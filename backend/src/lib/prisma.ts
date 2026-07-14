import { PrismaNeon } from "@prisma/adapter-neon";
import type { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaClientConstructor } from "@prisma/client";

export const prisma: PrismaClient = new PrismaClientConstructor({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
